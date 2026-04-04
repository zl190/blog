---
title: "Claude Code的Hook有个坑：PreToolUse不会热加载"
created: 2026-04-02
date: 2026-04-02
tags: [AI, claude-code, hooks, enforcement, noglaze]
topics:
  - AI
qc: passed
lang: zh
spec: "CC hook热加载不对称：PostToolUse mid-session生效，PreToolUse需重启 | creator — noGlaze!开发中发现并验证 | CC用户和hook开发者"
---

# Claude Code的Hook有个坑：PreToolUse不会热加载

Claude Code的hook系统是我目前见过最有意思的AI enforcement机制。`exit 2`拦截工具调用，在系统层运作，不受上下文退化影响。但有个undocumented behavior差点让我以为自己的hook写错了。

## 发现过程

我在给noGlaze!注册hook。改完`~/.claude/settings.json`，加了两个hook：一个PostToolUse（每次Write/Edit审计），一个PreToolUse（git push前拦截）。

PostToolUse秒生效。写文件，`audit.jsonl`里立刻多一条记录。

PreToolUse——没反应。跑`git push`，直接过了。debug日志一个字都没有。

第一反应：我shell脚本写错了。检查路径、检查权限、检查JSON格式，全对。

## 诊断

在一台干净的远程机器上开了个新环境：`claude -p --settings /tmp/test-settings.json`。两个hook都能跑。所以hook本身没问题。

区别在哪？远程机器上是新session。本地是mid-session加的hook。

假设：**CC在session启动时缓存PreToolUse hook，mid-session修改settings.json不会重新加载。**

验证：退出CC，重新进来，跑`git push`——

```
noGlaze! BLOCKED: "No audit trail found for recent changes"
```

拦住了。

## 行为总结

| Hook类型 | Mid-session添加 | Session重启后 |
|----------|----------------|---------------|
| PostToolUse | 立即生效 | 生效 |
| PreToolUse | 不生效 | 生效 |

## 为什么

没看到官方文档说这个。我的推测：PreToolUse在工具执行的critical path上——它决定工具能不能跑。CC可能在session启动时把PreToolUse hook列表缓存了，避免每次工具调用都重新读settings文件。

PostToolUse不在critical path上——工具已经跑完了，慢一点无所谓。所以每次都重新读。

这只是猜测，没有看到源码确认。但不管原因是什么，行为是确定的。

## 实践建议

1. **注册PreToolUse hook后必须重启session。** 不重启就别期待它生效。
2. **PostToolUse可以mid-session随便加。** 这个倒是方便。
3. **测试hook用`claude -p --settings`。** 独立session，干净环境，排除缓存问题。
4. **别在mid-session改settings.json。** hook加载行为不对称，mid-session改动的效果不可预测。

## Takeaway

CC的hook系统是个系统级enforcement机制，比prompt强得多——`exit 2`不受上下文退化影响。但它的热加载行为是不对称的：PostToolUse热加载，PreToolUse冷加载。知道这个能省你一个下午的debug时间。
