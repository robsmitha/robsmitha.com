const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

// Formats a dollar amount like $1,234.50; missing values show as $0.00.
export function currency(amount: number | string | null | undefined): string {
    const value = Number(amount ?? 0)
    return usd.format(Number.isFinite(value) ? value : 0)
}
