import { airports, distanceKm, lanes, transitDays } from '~/data/network'

export interface RouteOption { code: string; label: string; city: string; country: string; meta?: string }
export interface RouteGroup { label: string; items: RouteOption[] }
export type RouteSide = 'from' | 'to'

// Airports offered when nothing else is known, in the order they are shown.
const HUBS = ['DXB', 'IST', 'FRA', 'HKG', 'PVG', 'TAS', 'JFK', 'LHR', 'SIN']

/**
 * Shared logic for the "from / to" fields (hero calculator and quote form).
 * Once one end of the route is chosen the other list is re-ranked: lanes we actually work on come first,
 * every option shows its distance, and the chosen airport is removed from the opposite list.
 */
export function useRoutePicker(form: { from: string; to: string }) {
  const { t } = useI18n()
  const fmt = useNumFmt()

  const nameOf = (code: string) => t(`airports.${code}`)
  const option = (code: string, anchor?: string): RouteOption => {
    const [city = '', ...rest] = nameOf(code).split(',')
    return {
      code,
      label: `${code} · ${nameOf(code)}`,
      city: city.trim(),
      country: rest.join(',').trim(),
      meta: anchor ? t('route.km', { km: fmt(distanceKm(code, anchor)) }) : undefined,
    }
  }

  const codeOf = (text: string) => {
    const m = text.toUpperCase().match(/\b([A-Z]{3})\b/)
    if (m && airports[m[1]!]) return m[1]!
    const q = text.trim().toLowerCase()
    return Object.keys(airports).find((c) => nameOf(c).split(',')[0]!.trim().toLowerCase() === q)
  }
  const fromCode = computed(() => codeOf(form.from))
  const toCode = computed(() => codeOf(form.to))
  const otherOf = (side: RouteSide) => (side === 'from' ? toCode.value : fromCode.value)

  /** Lanes touching `anchor` first, then general hubs; never the anchor itself. */
  function suggestedCodes(anchor?: string) {
    const out: string[] = []
    const push = (c: string) => { if (c !== anchor && !out.includes(c)) out.push(c) }
    if (anchor) for (const l of lanes) { if (l.from === anchor) push(l.to); else if (l.to === anchor) push(l.from) }
    HUBS.forEach(push)
    return out.slice(0, 6)
  }

  function groupsFor(side: RouteSide): RouteGroup[] {
    const anchor = otherOf(side)
    const suggested = suggestedCodes(anchor)
    const rest = Object.keys(airports).filter((c) => c !== anchor && !suggested.includes(c))
    const label = !anchor
      ? t('route.hubs')
      : t(side === 'to' ? 'route.suggestedFrom' : 'route.suggestedTo', { city: option(anchor).city })
    return [
      { label, items: suggested.map((c) => option(c, anchor)) },
      { label: t('route.all'), items: rest.map((c) => option(c, anchor)) },
    ]
  }

  /** Quick-pick chips: only once the opposite end is known and this side is still empty. */
  function chipsFor(side: RouteSide) {
    const anchor = otherOf(side)
    const mine = side === 'from' ? fromCode.value : toCode.value
    if (!anchor || mine) return { label: '', items: [] as RouteOption[] }
    return {
      label: t(side === 'to' ? 'route.chipsFrom' : 'route.chipsTo', { city: option(anchor).city }),
      items: suggestedCodes(anchor).slice(0, 5).map((c) => option(c, anchor)),
    }
  }

  const estimate = computed(() => {
    if (!fromCode.value || !toCode.value || fromCode.value === toCode.value) return null
    const km = distanceKm(fromCode.value, toCode.value)
    const [a, b] = transitDays(km)
    const days = a === b ? (a === 1 ? t('quote.days.one', { n: a }) : t('quote.days.many', { n: a })) : t('quote.days.range', { a, b })
    return { km, days }
  })

  function choose(side: RouteSide, o: RouteOption) { form[side] = o.label }
  function swap() { [form.from, form.to] = [form.to, form.from] }

  return { fromCode, toCode, groupsFor, chipsFor, estimate, choose, swap, codeOf }
}
