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
  'Restructuring',
  'Sovereign Wealth Fund',
] as const

export type FirmCategory = (typeof FIRM_CATEGORIES)[number]

export const FIRM_REGIONS = [
  'NYC',
  'London',
  'Hong Kong',
  'Singapore',
  'Tokyo',
  'Paris',
  'Frankfurt',
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
  // US States
  'NY',
  'CA',
  'IL',
  'MA',
  'TX',
  'WA',
  'OR',
  'FL',
  'VA',
  'MN',
  'WI',
  'MO',
  'ID',
  'MT',
  'CO',
  'UT',
  'AZ',
  'NV',
  // International
  'UK',
  'HK',
  'SG',
  'Japan',
  'China',
  'France',
  'Germany',
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
  { value: 'aum_fund_size', label: 'AUM/Fund Size' },
  { value: 'deal_size_criteria', label: 'Deal Size' },
  { value: 'employee_count', label: 'Team Size' },
] as const

export type FirmSortOption = (typeof FIRM_SORT_OPTIONS)[number]['value']

// Optional columns that users can toggle on/off
// Excludes UW Foster Relevance intentionally
export const OPTIONAL_COLUMNS = [
  { key: 'aum_fund_size', label: 'AUM / Fund Size', sortable: true },
  { key: 'deal_size_criteria', label: 'Deal Size / Criteria', sortable: true },
  { key: 'founded_year', label: 'Year Founded', sortable: true },
  { key: 'employee_count', label: 'Team Size', sortable: true },
  { key: 'description', label: 'Description', sortable: false },
  { key: 'notes', label: 'Notes', sortable: false },
] as const

export type OptionalColumnKey = (typeof OPTIONAL_COLUMNS)[number]['key']
