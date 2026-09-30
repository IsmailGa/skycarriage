/**
 * Reads an array from the i18n messages (e.g. `how.steps`) into plain objects/strings.
 * - `useMsgList('hero.h1')`                → string[]
 * - `useMsgList('how.steps', ['t', 'd'])`  → { t: string; d: string }[]
 * Uses `t('key[0].field')` paths, which are robust for both compiled and runtime messages.
 */
export function useMsgList<T extends string = never>(key: string, fields?: readonly T[]) {
  const { t, tm, locale } = useI18n()
  type Item = [T] extends [never] ? string : Record<T, string>
  return computed<Item[]>(() => {
    void locale.value
    const count = (tm(key) as unknown[]).length
    return Array.from({ length: count }, (_, i) => {
      if (!fields) return t(`${key}[${i}]`) as unknown as Item
      return Object.fromEntries(fields.map((f) => [f, t(`${key}[${i}].${f}`)])) as unknown as Item
    })
  })
}

/** BCP-47 tag for Intl formatting of the active locale. */
export function useNumFmt() {
  const { locale } = useI18n()
  const tag = computed(() => ({ en: 'en-US', ru: 'ru-RU', uz: 'uz-UZ' })[locale.value as 'en' | 'ru' | 'uz'] ?? 'en-US')
  return (n: number, digits = 0) => n.toLocaleString(tag.value, { minimumFractionDigits: digits, maximumFractionDigits: digits })
}
