// Shared quote state: one form model used by the page section and by the dialog, so every "Get a quote" button opens the same prefilled form.
export interface QuoteFormState {
  mode: 'export' | 'import'
  from: string; to: string; weight: string; pieces: string; date: string
  name: string; email: string; website: string
}
export interface QuoteOptions { cargo?: string; from?: string; to?: string; weight?: string }

export function useQuote() {
  const form = useState<QuoteFormState>('quoteForm', () => ({ mode: 'export', from: '', to: '', weight: '', pieces: '', date: '', name: '', email: '', website: '' })).value
  const cargo = useState<string>('cargoType', () => 'general')
  const status = useState<'idle' | 'loading' | 'success' | 'error'>('quoteStatus', () => 'idle')
  const ref = useState<string>('quoteRef', () => '')
  const open = useState<boolean>('quoteOpen', () => false)

  /** Open the quote dialog, optionally prefilled (service → cargo type, hero calculator → route and weight). */
  function openQuote(o: QuoteOptions = {}) {
    if (o.cargo) cargo.value = o.cargo
    if (o.from !== undefined) form.from = o.from
    if (o.to !== undefined) form.to = o.to
    if (o.weight) form.weight = o.weight
    if (status.value === 'success' || status.value === 'error') status.value = 'idle'
    open.value = true
  }

  return { form, cargo, status, ref, open, openQuote }
}

export function sendQuote(body: Record<string, unknown>) {
  return $fetch<{ ok: boolean; ref: string }>('/api/quote', { method: 'POST', body })
}
