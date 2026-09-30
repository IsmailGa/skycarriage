export type Theme = 'dark' | 'light'

/** Theme is stored in a cookie so the server renders the right theme on first paint (no flash). Default: dark. */
export function useTheme() {
  const cookie = useCookie<Theme>('sc_theme', { maxAge: 60 * 60 * 24 * 365, sameSite: 'lax', path: '/' })
  const theme = useState<Theme>('theme', () => (cookie.value === 'light' ? 'light' : 'dark'))

  function toggle() {
    const next: Theme = theme.value === 'dark' ? 'light' : 'dark'
    const root = document.documentElement
    // brief class enables colour transitions on everything, so the switch fades instead of snapping
    if (!prefersReducedMotion()) {
      root.classList.add('theme-fade')
      setTimeout(() => root.classList.remove('theme-fade'), 500)
    }
    theme.value = next
    cookie.value = next
    root.dataset.theme = next
  }
  return { theme, toggle }
}
