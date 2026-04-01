import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import style from "./styles/sociallinks.scss"

const icons: Record<string, string> = {
  GitHub: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>`,
  "Buy Me a Coffee": `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 884 1279" fill="currentColor"><path d="M791 298q1 0 1-1l-1 1Zm-1-1q0-1-1 0l1 0ZM474 1279H409q-2 0-4-1l-5-1q-16-4-28-14-11-9-17-22l-2-7v-3l-47-178H168L121 1231v3l-2 7q-6 13-17 22-12 10-28 14l-5 1-4 1H0v-58h59l47-178 7-26 91-345 1-3 3-12H78V599h144V402H78V344h144V148h-7q-30 0-56-11-25-11-44-30T85 63Q74 37 74 7V0h58v7q0 19 7 36t20 30 30 20 36 7h434q19 0 36-7t30-20 20-30 7-36V0h58v7q0 30-11 56-11 25-30 44t-44 30q-26 11-56 11h-7v196h145v58H661v197h145v58H670l1 3 91 345 7 26 47 178h60v58h-66l-4-1-5-1q-16-4-28-14-11-9-17-22l-2-7v-3l-47-178H569l-47 178v3l-2 7q-6 13-17 22-12 10-28 14l-5 1q-2 1-4 1h1ZM280 148v196h324V148H280Zm0 254v197h324V402H280Zm-70 255-84 316h632l-84-316H210Z"/></svg>`,
}

interface Options {
  links: Record<string, string>
}

export default ((opts?: Options) => {
  const SocialLinks: QuartzComponent = ({ displayClass }: QuartzComponentProps) => {
    const links = opts?.links ?? {}
    return (
      <div class={`social-links ${displayClass ?? ""}`}>
        {Object.entries(links).map(([text, link]) => (
          <a href={link} title={text} target="_blank" rel="noopener noreferrer">
            {icons[text] ? (
              <span dangerouslySetInnerHTML={{ __html: icons[text] }} />
            ) : (
              text
            )}
          </a>
        ))}
      </div>
    )
  }

  SocialLinks.css = style
  return SocialLinks
}) satisfies QuartzComponentConstructor
