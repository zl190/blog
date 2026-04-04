---
title: "tailscale ping works, everything else doesn't: the CGNAT routing trap"
format: blog
status: published
created: 2026-03-19
published_date: 2026-03-19
language: en
tags: [Systems, networking, tailscale, debugging, wireguard, cgnat, macos]
topics:
  - Systems
qc: passed
spec: "iPhone hotspot tethering routes Tailscale's CGNAT address range through the carrier, silently dropping all WireGuard traffic while tailscale ping falsely reports success | creator — debugged and solved their own Tailscale + iPhone hotspot + MacBook configuration | developers running Tailscale on mobile connections who encounter silent connectivity failures"
---

# tailscale ping works, everything else doesn't: the CGNAT routing trap

The most dangerous network bugs are the ones where your diagnostic tool says everything is fine while the actual traffic is completely dead. I spent an evening chasing one of these, and the punchline is that `tailscale ping` is a terrible tool for diagnosing Tailscale connectivity — not because it's broken, but because it doesn't test what you think it tests.

Here's the short version: when you tether your MacBook to an iPhone hotspot, the carrier pushes a route for `100.64.0.0/10` over the cellular interface. That's the same address range Tailscale uses. Your Mac happily routes all WireGuard traffic to your iPhone carrier, which drops it silently. Meanwhile `tailscale ping` keeps returning "pong" because it bypasses the data plane entirely. Zero bytes transferred, zero handshakes completed, and your diagnostic is lying to you.

---

## How I got here

It started with Mosh over FRP — a TCP/UDP proxy I was using to reach my home server. The SSH part of Mosh worked fine (FRP was forwarding that), but Mosh's UDP return path was broken. After poking at it for a while I decided this wasn't worth fixing and pivoted: just use Tailscale directly. Clean mesh network, no manual port forwarding, peer-to-peer when possible.

```bash
ssh user@100.80.100.40
```

Timeout.

Fine, maybe the daemon needed a restart after a long idle period. Restarted Tailscale on both machines, tried again. Still timing out. Checked peer status:

```bash
tailscale status --json | jq '.Peer[] | select(.TailscaleIPs[] == "100.80.100.40") | {Active, LastHandshake, RxBytes, TxBytes}'
```

```json
{
  "Active": false,
  "LastHandshake": "0001-01-01T00:00:00Z",
  "RxBytes": 0,
  "TxBytes": 0
}
```

`LastHandshake: 0001-01-01` is Go's zero value for `time.Time`. The WireGuard tunnel had never established. Not "lost connection" — never started.

Then I did the thing that sent me in the wrong direction for twenty minutes. The diagnosis-first approach I tested in [[i-ab-tested-pua-plugin|the PUA experiment]] applies here too — the wrong diagnosis sent me chasing the wrong layer.

```bash
tailscale ping 100.80.100.40
```

```
pong from homeserver (100.80.100.40) via DERP(iad) in 480ms
```

Pong. Peer is reachable. So why is SSH timing out?

---

## The false signal

This is where it's worth understanding what `tailscale ping` actually does. There are two distinct paths in Tailscale:

| Path | Protocol | What uses it |
|------|----------|--------------|
| Control plane / DERP relay | HTTPS (port 443) | `tailscale ping`, key exchange, peer discovery |
| Data plane | WireGuard UDP | Everything else — SSH, file transfers, your actual traffic |

DERP (Designated Encrypted Relay for Packets) is Tailscale's fallback relay infrastructure. When direct peer-to-peer can't be established, traffic is supposed to relay through DERP. But there's a subtlety: `tailscale ping` always goes through DERP for the control plane response — it doesn't verify the WireGuard data tunnel at all.

So "pong via DERP" tells you: the Tailscale daemons can talk to each other over HTTPS. It tells you nothing about whether actual data packets can flow. An SSH connection is WireGuard UDP. A Mosh session is WireGuard UDP. `tailscale ping` is not.

After the daemon restart, status showed `Active: True` — but `LastHandshake` was still the zero value and bytes were still zero. Active means the daemon thinks it should be talking to this peer. It doesn't mean it has.

---

## The routing table

I should have looked here first. On macOS:

```bash
netstat -rn | grep 100.64
```

```
100.64/10  172.20.10.1   UGSc   en0
100.64/10  link#34       UCSI   utun12
```

Two routes for the same prefix. `en0` is the iPhone hotspot interface. `utun12` is Tailscale. The iPhone route has the `UGSc` flags (Up, Gateway, Static, cloned) and no interface scope constraint. The Tailscale route has `UCSI` — that `I` flag means it's interface-scoped, which gives it lower priority in macOS route selection.

To confirm:

```bash
route get 100.80.100.40
```

```
   route to: 100.80.100.40
destination: 100.64/10
    gateway: 172.20.10.1
  interface: en0
```

Every packet destined for `100.80.100.40` was being sent to `172.20.10.1` — my iPhone's gateway — which forwarded it to the carrier, which dropped it. No error, no ICMP unreachable. Silent discard.

---

## Why carriers own this address range

`100.64.0.0/10` is IANA-reserved for Carrier-Grade NAT (RFC 6598). It's the address space carriers use for their own internal infrastructure between the carrier and customer premises equipment. When you tether to an iPhone, the carrier assigns your device an address in this range and pushes a route for the entire `/10` block so that carrier infrastructure (DNS, billing systems, etc.) is reachable.

Tailscale also uses `100.64.0.0/10` for its mesh addresses. This is a deliberate choice — it's a range that should never appear on the public internet, so it's safe for a private overlay network to claim. The RFC 6598 reservation exists precisely to carve out space that won't conflict with real internet routes.

What nobody anticipated is that both a carrier NAT infrastructure and an overlay VPN would legitimately push routes for the same range on the same device. The OS picks one. On macOS, the scoped interface route loses.

---

## The fix

Two options depending on how permanent you want it:

**Option A: Delete the conflicting route**

```bash
sudo route delete -net 100.64/10 172.20.10.1
```

This removes the iPhone carrier route. Carrier infrastructure that lives in that range (rare in practice for consumer traffic) becomes unreachable, but in my experience this causes no noticeable problems. The route comes back when you disconnect and reconnect the hotspot.

**Option B: Add a specific host route**

```bash
sudo route add -host 100.80.100.40 -interface utun12
```

More surgical. This adds a `/32` host route for the specific peer, which takes precedence over the `/10` prefix route. Other addresses in the `100.64/10` range still go through `en0`. If you're talking to multiple Tailscale peers you'll need one per peer, which gets unwieldy.

After Option B (what I used):

```bash
mosh user@100.80.100.40
```

Connected immediately. The whole investigation started because I wanted Mosh to my home server. `tailscale status` showed `LastHandshake` updating, bytes flowing. Mosh over Tailscale DERP relay at ~500ms latency is perfectly usable — Mosh was designed for exactly this.

---

## The diagnostic you actually want

If Tailscale connectivity is broken, skip `tailscale ping`. Run these instead:

```bash
# Check if the WireGuard tunnel has ever established
tailscale status --json | jq '.Peer[] | select(.TailscaleIPs[] == "TARGET_IP") | {Active, LastHandshake, RxBytes, TxBytes}'
```

If `LastHandshake` is the zero value (`0001-01-01T00:00:00Z`) and bytes are zero, the tunnel has never started — not "dropped", never. That's a routing or firewall problem, not a Tailscale daemon problem.

```bash
# Check where packets are actually going
route get TARGET_IP
```

If the interface is not `utun12` (or whatever your Tailscale interface is), you have a routing conflict.

```bash
# Check for conflicting routes in the 100.64/10 range
netstat -rn | grep 100.64
```

More than one entry here with different interfaces is the smoking gun.

The combination of `LastHandshake: zero` + `route get` pointing at the wrong interface is definitive. You don't need `tailscale ping` at all — and if you rely on it, it will actively mislead you.

---

## What this looks like end-to-end

To put the timeline in order:

| What I saw | What I concluded | Was I right? |
|------------|-----------------|--------------|
| `tailscale ping` returns pong via DERP | Tailscale is working | No |
| `Active: True` after daemon restart | Tunnel should be up | No |
| SSH timeout | Something is blocking port 22 | No |
| `LastHandshake: 0001-01-01, RxBytes: 0` | Tunnel never established | Yes |
| `route get` → gateway via en0 | Routing conflict | Yes |

The two useful signals both came from ignoring the high-level tools and looking at lower-level state.

---

## Takeaway

When Tailscale appears online but data doesn't flow, check `LastHandshake` and `route get` before anything else. If you're on iPhone hotspot tethering, check for a `100.64/10` route conflict — it's the likely culprit.

The deeper pattern: a diagnostic tool that tests the control plane is not a diagnostic tool for the data plane. `tailscale ping` via DERP is evidence that two daemons can reach Tailscale's relay servers. That's it. The WireGuard handshake, the actual packet routing, the kernel's routing table decision — none of that is in scope. Confirming one layer works while another is silently broken is worse than no diagnostic at all, because it closes off the line of inquiry.

The fix was a one-liner. The diagnosis took an evening. That ratio is pretty normal for routing bugs.
