import type { IconName } from '~/components/AppIcon.vue'

/** Stable keys used by the quote form (`quote.cargoTypes.<key>` in i18n) and the API. */
export const cargoKeys = ['general', 'cold', 'dg', 'oversized'] as const
export type CargoKey = (typeof cargoKeys)[number]

export interface Service {
  key: 'booking' | 'charter' | 'cold-chain' | 'dangerous-goods' | 'customs' | 'door-to-door'
  icon: IconName
  cargo: CargoKey
  /** photo from public/media (without extension; .webp + .jpg exist) and its focal point */
  image: string
  focus?: string
  /** grid span on desktop: 1 (default), 2 or 3 columns */
  span?: 2 | 3
  hasTag?: boolean
  hasStat?: boolean
}

/** Copy lives in i18n under `services.items.<key>`. */
export const services: Service[] = [
  { key: 'booking', icon: 'plane', cargo: 'general', image: 'hero', focus: '20% 60%', span: 2, hasTag: true },
  { key: 'charter', icon: 'truck', cargo: 'oversized', image: 'card-engine', focus: '30% 40%' },
  { key: 'cold-chain', icon: 'snow', cargo: 'cold', image: 'card-fuselage', focus: '40% 60%' },
  { key: 'dangerous-goods', icon: 'warn', cargo: 'dg', image: 'card-containers', focus: '50% 40%' },
  { key: 'customs', icon: 'file', cargo: 'general', image: 'card-crew', focus: '50% 50%' },
  { key: 'door-to-door', icon: 'door', cargo: 'general', image: 'card-loader', focus: '50% 55%', span: 3, hasStat: true },
]

