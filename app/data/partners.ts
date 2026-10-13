/**
 * Partner logos shown in the "Partners" section. Add real entries here (with the partner's permission):
 *   { name: 'Partner name', logo: '/media/partners/name.svg', url: 'https://partner.example' }
 * While the list is empty the section shows only the four partner categories.
 */
export interface Partner { name: string; logo: string; url?: string }
export const partners: Partner[] = []

export const partnerIcons = ['plane', 'box', 'file', 'shield'] as const
