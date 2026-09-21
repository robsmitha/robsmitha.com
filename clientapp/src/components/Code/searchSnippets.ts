import { SearchItem, TextMatch } from '@/components/Code/CodeSearch.types'

export function firstMatch(item: SearchItem): TextMatch | undefined {
    return item.text_matches?.[0]
}

export function matchCount(item: SearchItem): number {
    return item.text_matches?.reduce((total, tm) => total + tm.matches.length, 0) ?? 0
}

function escapeHtml(str: string): string {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

// Wraps GitHub's reported match offsets in <mark>, escaping everything else so
// raw source text can never be interpreted as markup.
export function highlightFragment(match: TextMatch): string {
    if (!match.matches || match.matches.length === 0) {
        return escapeHtml(match.fragment)
    }

    const sorted = [...match.matches].sort((a, b) => a.indices[0] - b.indices[0])
    let result = ''
    let cursor = 0
    for (const m of sorted) {
        const [start, end] = m.indices
        if (start < cursor || start > match.fragment.length) continue
        result += escapeHtml(match.fragment.slice(cursor, start))
        result += '<mark>' + escapeHtml(match.fragment.slice(start, end)) + '</mark>'
        cursor = end
    }
    result += escapeHtml(match.fragment.slice(cursor))
    return result
}
