// Fails when finance pages use hard-coded colors instead of the Vuetify theme (docs/budget-plan.md §6.1).
// Run with `npm run lint:theme`. Colors belong in src/plugins/vuetify.ts; components use theme keys
// (color="primary", text-muted, rgb(var(--v-theme-border))) so light and dark mode both work.
//
// A file can mark decorative gradients that look the same in both themes with "(theme-colors: allow)";
// only gradient lines in such a file are skipped.
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..')

// Folders and files held to the rule. Add new budget pages here as they're built.
const checked = [
  'src/components/Financial',
  'src/pages/accounts.vue',
  'src/pages/budget.vue',
  'src/pages/plaid-oauth.vue',
  'src/pages/transactions.vue',
  'src/pages/dashboard.vue',
  'src/pages/debt.vue',
  'src/pages/goals.vue',
  'src/composables/usePlaidLink.ts',
  'src/composables/budgetFormat.ts',
  'src/components/_helpers/PageHero.vue',
  'src/components/_helpers/PageTabs.vue',
]

const rules = [
  { name: 'hex color', pattern: /#[0-9a-fA-F]{3,8}\b/ },
  { name: 'rgb()/rgba() with numbers', pattern: /rgba?\(\s*\d/ },
  { name: 'white/black color prop', pattern: /\b(?:color|bg-color|base-color)="(?:white|black)"/ },
  { name: 'white/black utility class', pattern: /\b(?:text|bg)-(?:white|black)\b/ },
  { name: 'named white/black in CSS', pattern: /:\s*(?:white|black)\s*;/ },
]

function files (path) {
  const full = join(root, path)
  if (statSync(full).isFile()) return [full]
  return readdirSync(full).flatMap(name => files(join(path, name)))
}

const problems = []
for (const file of checked.flatMap(files).filter(f => f.endsWith('.vue') || f.endsWith('.ts'))) {
  const text = readFileSync(file, 'utf8')
  const allowGradients = text.includes('(theme-colors: allow)')
  text.split(/\r?\n/).forEach((line, i) => {
    if (allowGradients && /(linear|radial)-gradient\(/.test(line)) return
    // HTML entities like &#8217; aren't colors
    const scrubbed = line.replace(/&#\d+;/g, '')
    for (const rule of rules) {
      if (rule.pattern.test(scrubbed)) problems.push(`${relative(root, file)}:${i + 1}  ${rule.name}: ${line.trim()}`)
    }
  })
}

if (problems.length) {
  console.error(`Hard-coded colors found (use theme keys from src/plugins/vuetify.ts instead):\n\n${problems.join('\n')}\n`)
  process.exit(1)
}
console.log(`Theme colors OK (${checked.length} paths checked).`)
