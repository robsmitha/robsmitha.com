// Formatting shared by the dashboard and budget pages
import type { BudgetLine } from '@/services/budget.service'

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
const whole = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

/** $1,234.56, with a real minus sign for negatives */
export function money (amount: number) {
  const text = currency.format(Math.abs(amount))
  return amount < 0 ? `−${text}` : text
}

/** Targets read better without cents when they're whole: $350, $92.50 */
export function target (amount: number) {
  return Number.isInteger(amount) ? whole.format(amount) : currency.format(amount)
}

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export function monthName (month: number) {
  return months[month - 1]
}

/** "2027-01" → "January 2027" */
export function monthLabel (yyyyMm: string) {
  const [y, m] = yyyyMm.split('-').map(Number)
  return `${monthName(m)} ${y}`
}

/** "2026-11-18" → "Nov 18", without time-zone shifts */
export function shortDate (iso: string) {
  const [, m, d] = iso.split('-').map(Number)
  return `${monthName(m).slice(0, 3)} ${d}`
}

/** "2026-11-06" → "Fri, Nov 6" */
export function dayDate (iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  const weekday = new Date(y, m - 1, d).toLocaleDateString('en-US', { weekday: 'short' })
  return `${weekday}, ${shortDate(iso)}`
}

export type Chip = { label: string, color: string, icon: string }

/** The status chip beside a category, or null when there's nothing to say */
export function statusChip (line: BudgetLine): Chip | null {
  switch (line.status) {
    case 'OverBudget': return { label: `Over by ${money(line.spent - line.available)}`, color: 'error', icon: 'mdi-alert-circle-outline' }
    case 'OverPace': return { label: 'Over pace', color: 'warning', icon: 'mdi-speedometer' }
    case 'Paid': return { label: 'Paid', color: 'success', icon: 'mdi-check-all' }
    case 'Unbudgeted': return { label: 'No target', color: 'subtle', icon: 'mdi-help-circle-outline' }
  }
  if (line.projectedOver) return { label: `+${money(line.projectedOver)} projected`, color: 'warning', icon: 'mdi-trending-up' }
  return null
}

/** Bar color: bills are informational; flexible spending is good, warning or over */
export function fillColor (line: BudgetLine) {
  if (line.status === 'OverBudget') return 'error'
  if (line.status === 'OverPace') return 'warning'
  return line.group === 'Flexible' ? 'success' : 'info'
}

/** The status chip on a savings goal */
export function goalChip (g: { status: string, difference: number }): Chip {
  const by = target(Math.round(Math.abs(g.difference)))
  switch (g.status) {
    case 'Ahead': return { label: `Ahead · +${by}`, color: 'success', icon: 'mdi-arrow-up' }
    case 'Behind': return { label: `Behind · −${by}`, color: 'error', icon: 'mdi-arrow-down' }
    case 'Funded': return { label: 'Funded', color: 'success', icon: 'mdi-check-all' }
    case 'Overdue': return { label: 'Past due', color: 'error', icon: 'mdi-alert-circle-outline' }
    default: return { label: Math.abs(g.difference) >= 1 ? `On track · ${g.difference > 0 ? '+' : '−'}${by}` : 'On track', color: 'success', icon: 'mdi-check' }
  }
}
