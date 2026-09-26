import React from 'react'
import '../app/app.css'

const EMAIL = 'corentin.bunaux@gmail.com'
const LINKEDIN_URL = 'http://linkedin.com/in/corentin-bunaux'
const GITHUB_URL = 'https://github.com/corentinbunaux'

const FOCUS_RING =
  'focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-focus rounded-sm'

const NAV_LINKS = [
  { label: 'Profil', href: '#profile' },
  { label: 'Projets', href: '#portfolio' },
  { label: 'À propos', href: '#about' },
]

// Real project routes, matching `href` in src/data/projects.ts (PORT-008) —
// no invented paths.
const PROJECT_LINKS = [
  { label: 'Safran', href: '/internships/safran' },
  { label: 'Quimesis', href: '/internships/quimesis' },
  { label: 'SNCF', href: '/research/sncf' },
  { label: 'CCTV', href: '/personnal/cctv' },
]

function MailIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 29 29" aria-hidden="true" {...props}>
      <path
        fill="currentColor"
        d="M2 7.42v14.172l7.086-7.086zM3.408 6l8.971 8.971c1.133 1.133 3.109 1.133 4.242 0L25.592 6H3.408z"
      />
      <path
        fill="currentColor"
        d="M18.035 16.385c-.943.944-2.199 1.465-3.535 1.465s-2.592-.521-3.535-1.465l-.465-.465L3.42 23h22.16l-7.08-7.08-.465.465zM19.914 14.506L27 21.592V7.42z"
      />
    </svg>
  )
}

function LinkedInIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        fill="currentColor"
        d="M20.47,2H3.53A1.45,1.45,0,0,0,2.06,3.43V20.57A1.45,1.45,0,0,0,3.53,22H20.47a1.45,1.45,0,0,0,1.47-1.43V3.43A1.45,1.45,0,0,0,20.47,2ZM8.09,18.74h-3v-9h3ZM6.59,8.48h0a1.56,1.56,0,1,1,0-3.12,1.57,1.57,0,1,1,0,3.12ZM18.91,18.74h-3V13.91c0-1.21-.43-2-1.52-2A1.65,1.65,0,0,0,12.85,13a2,2,0,0,0-.1.73v5h-3s0-8.18,0-9h3V11A3,3,0,0,1,15.46,9.5c2,0,3.45,1.29,3.45,4.06Z"
      />
    </svg>
  )
}

function GitHubIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        fill="currentColor"
        d="M12,2.2467A10.00042,10.00042,0,0,0,8.83752,21.73419c.5.08752.6875-.21247.6875-.475,0-.23749-.01251-1.025-.01251-1.86249C7,19.85919,6.35,18.78423,6.15,18.22173A3.636,3.636,0,0,0,5.125,16.8092c-.35-.1875-.85-.65-.01251-.66248A2.00117,2.00117,0,0,1,6.65,17.17169a2.13742,2.13742,0,0,0,2.91248.825A2.10376,2.10376,0,0,1,10.2,16.65923c-2.225-.25-4.55-1.11254-4.55-4.9375a3.89187,3.89187,0,0,1,1.025-2.6875,3.59373,3.59373,0,0,1,.1-2.65s.83747-.26251,2.75,1.025a9.42747,9.42747,0,0,1,5,0c1.91248-1.3,2.75-1.025,2.75-1.025a3.59323,3.59323,0,0,1,.1,2.65,3.869,3.869,0,0,1,1.025,2.6875c0,3.83747-2.33752,4.6875-4.5625,4.9375a2.36814,2.36814,0,0,1,.675,1.85c0,1.33752-.01251,2.41248-.01251,2.75,0,.26251.1875.575.6875.475A10.0053,10.0053,0,0,0,12,2.2467Z"
      />
    </svg>
  )
}

function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-surface border-t border-second text-main-text">
      <div className="container mx-auto px-4 py-10 md:py-14">
        <div className="flex flex-col gap-6 border-b border-second pb-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-md">
            <h2 className="text-xl font-semibold">Travaillons ensemble</h2>
            <p className="mt-2 text-second-text">
              Ouvert aux missions en prestation depuis Le Havre, sur site à La
              Défense ou à distance.
            </p>
            <a
              href={`mailto:${EMAIL}`}
              className={`mt-4 inline-flex items-center gap-2 rounded-md bg-my-green px-4 py-2 font-medium text-main hover:underline ${FOCUS_RING}`}
            >
              <MailIcon className="h-5 w-5" />
              Me contacter
            </a>
            <ul className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-second-text">
              <li>
                <a href={`mailto:${EMAIL}`} className={`hover:underline ${FOCUS_RING}`}>
                  {EMAIL}
                </a>
              </li>
              <li aria-hidden="true">·</li>
              <li>
                <a
                  href={LINKEDIN_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`hover:underline ${FOCUS_RING}`}
                >
                  LinkedIn
                </a>
              </li>
              <li aria-hidden="true">·</li>
              <li>
                <a
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`hover:underline ${FOCUS_RING}`}
                >
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 py-10 sm:grid-cols-3">
          <nav aria-label="Navigation">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-second-text">
              Navigation
            </h3>
            <ul className="mt-3 space-y-2">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className={`hover:underline ${FOCUS_RING}`}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Projets">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-second-text">
              Projets
            </h3>
            <ul className="mt-3 space-y-2">
              {PROJECT_LINKS.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className={`hover:underline ${FOCUS_RING}`}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Contact">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-second-text">
              Contact
            </h3>
            <ul className="mt-3 space-y-2">
              <li>
                <a
                  href={`mailto:${EMAIL}`}
                  className={`flex items-center gap-2 hover:underline ${FOCUS_RING}`}
                >
                  <MailIcon className="h-4 w-4" />
                  E-mail
                </a>
              </li>
              <li>
                <a
                  href={LINKEDIN_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-2 hover:underline ${FOCUS_RING}`}
                >
                  <LinkedInIcon className="h-4 w-4" />
                  LinkedIn
                </a>
              </li>
              <li>
                <a
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-2 hover:underline ${FOCUS_RING}`}
                >
                  <GitHubIcon className="h-4 w-4" />
                  GitHub
                </a>
              </li>
            </ul>
          </nav>
        </div>

        <div className="border-t border-second pt-6 text-sm text-second-text">
          © {year} Corentin Bunaux
        </div>
      </div>
    </footer>
  )
}

export default Footer
