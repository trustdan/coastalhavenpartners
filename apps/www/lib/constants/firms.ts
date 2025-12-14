// Firm directory constants for filtering and display

export const FIRM_CATEGORIES = [
  'Investment Banking',
  'Private Equity',
  'Venture Capital',
  'Hedge Fund',
  'Asset Management',
  'Family Office',
  'Trust Company',
  'Corporate Venture',
] as const

export type FirmCategory = (typeof FIRM_CATEGORIES)[number]

export const FIRM_REGIONS = [
  'PNW',
  'Bay Area',
  'Los Angeles',
  'San Diego',
  'Mountain West',
  'Southwest',
  'Midwest',
  'Texas',
  'East Coast',
  'National',
] as const

export type FirmRegion = (typeof FIRM_REGIONS)[number]

export const FIRM_STATES = [
  'WA',
  'OR',
  'CA',
  'ID',
  'MT',
  'CO',
  'UT',
  'AZ',
  'NV',
  'TX',
  'IL',
  'NY',
  'MA',
] as const

export type FirmState = (typeof FIRM_STATES)[number]

export const UW_FOSTER_RELEVANCE = [
  'Direct',
  'High',
  'Moderate',
  'Low',
] as const

export type FosterRelevance = (typeof UW_FOSTER_RELEVANCE)[number]

export const PRIORITY_LABELS: Record<number, { label: string; stars: string; color: string }> = {
  1: { label: 'High Priority', stars: '★★★', color: 'text-amber-500' },
  2: { label: 'Medium Priority', stars: '★★', color: 'text-amber-400' },
  3: { label: 'Lower Priority', stars: '★', color: 'text-gray-400' },
}

export const FIRM_SORT_OPTIONS = [
  { value: 'priority', label: 'Priority' },
  { value: 'name', label: 'Name' },
  { value: 'firm_type', label: 'Category' },
  { value: 'city', label: 'City' },
  { value: 'region', label: 'Region' },
  { value: 'focus_sector', label: 'Focus' },
  { value: 'contact_email', label: 'Contact' },
  { value: 'founded_year', label: 'Founded' },
] as const

export type FirmSortOption = (typeof FIRM_SORT_OPTIONS)[number]['value']
