import type { IconName } from '~/components/AppIcon.vue'

/** Stable keys used by the quote form (`quote.cargoTypes.<key>` in i18n) and the API. */
export const cargoKeys = ['general', 'express', 'consolidated', 'cold', 'dg', 'oversized'] as const
export type CargoKey = (typeof cargoKeys)[number]

export interface Service {
  key: 'express' | 'consolidated' | 'charter' | 'cold-chain' | 'dangerous-goods' | 'customs' | 'door-to-door'
  icon: IconName
  cargo: CargoKey
  theme: 'light' | 'dark' | 'blue'
  wide?: boolean
  hasTag?: boolean
  hasStat?: boolean
}

/** Copy lives in i18n under `services.items.<key>`. */
export const services: Service[] = [
  { key: 'express', icon: 'zap', cargo: 'express', theme: 'dark', wide: true, hasTag: true, hasStat: true },
  { key: 'consolidated', icon: 'box', cargo: 'consolidated', theme: 'light' },
  { key: 'charter', icon: 'plane', cargo: 'oversized', theme: 'light' },
  { key: 'cold-chain', icon: 'snow', cargo: 'cold', theme: 'light' },
  { key: 'dangerous-goods', icon: 'warn', cargo: 'dg', theme: 'light' },
  { key: 'customs', icon: 'file', cargo: 'general', theme: 'light' },
  { key: 'door-to-door', icon: 'door', cargo: 'general', theme: 'blue', wide: true, hasStat: true },
]
