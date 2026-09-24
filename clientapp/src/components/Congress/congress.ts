// Shared helpers for the Congress pages, so the feed and the bill page use
// the same colors, labels and links for the same data.

// House and Senate keep the same colors everywhere: badges, filters, split bars.
export function chamberColor(chamber?: string): string {
  return chamber === 'Senate' ? 'info' : 'primary'
}

export function partyColor(party?: string): string {
  if (party === 'D') return 'info'
  if (party === 'R') return 'error'
  return 'violet'
}

export function partyName(party?: string): string {
  if (party === 'D') return 'Democrat'
  if (party === 'R') return 'Republican'
  if (party === 'I' || party === 'ID') return 'Independent'
  return party ?? 'Unknown'
}

export type BillStatus = { label: string, color: string }

// A rough read of where a bill stands, based on the wording of its latest action.
export function billStatus(latestActionText?: string): BillStatus {
  const text = latestActionText ?? ''
  if (/became public law|signed by (the )?president/i.test(text)) return { label: 'Law', color: 'green' }
  if (/passed|agreed to/i.test(text)) return { label: 'Passed', color: 'violet' }
  if (/reported|placed on .*calendar/i.test(text)) return { label: 'Reported', color: 'amber' }
  if (/referred to/i.test(text)) return { label: 'In committee', color: 'light-slate' }
  if (/introduced/i.test(text)) return { label: 'Introduced', color: 'light-slate' }
  return { label: 'Action', color: 'light-slate' }
}

export function ordinal(n: number | string): string {
  const num = Number(n)
  const mod100 = num % 100
  if (mod100 >= 11 && mod100 <= 13) return `${num}th`
  return `${num}${({ 1: 'st', 2: 'nd', 3: 'rd' } as Record<number, string>)[num % 10] ?? 'th'}`
}

const billTypeSlugs: Record<string, string> = {
  HR: 'house-bill',
  S: 'senate-bill',
  HJRES: 'house-joint-resolution',
  SJRES: 'senate-joint-resolution',
  HCONRES: 'house-concurrent-resolution',
  SCONRES: 'senate-concurrent-resolution',
  HRES: 'house-resolution',
  SRES: 'senate-resolution',
}

// The API's own `url` fields point at api.congress.gov, which needs an API key,
// so link readers to the public congress.gov pages instead.
export function congressGovBillUrl(congress: number | string, type: string, number: number | string): string {
  const slug = billTypeSlugs[type?.toUpperCase()] ?? 'house-bill'
  return `https://www.congress.gov/bill/${ordinal(congress)}-congress/${slug}/${number}`
}

export function congressGovAmendmentUrl(congress: number | string, type: string, number: number | string): string {
  const slug = type?.toUpperCase() === 'SAMDT' ? 'senate-amendment' : 'house-amendment'
  return `https://www.congress.gov/amendment/${ordinal(congress)}-congress/${slug}/${number}`
}

export function bioguideUrl(bioguideId: string): string {
  return `https://bioguide.congress.gov/search/bio/${bioguideId}`
}
