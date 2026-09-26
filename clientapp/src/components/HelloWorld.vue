<template>
  <section class="hero-section d-flex align-center">
    <div class="hero-grid" aria-hidden="true"></div>
    <div class="hero-glow" aria-hidden="true">
      <span class="blob blob--orange"></span>
      <span class="blob blob--magenta"></span>
      <span class="blob blob--violet"></span>
      <span class="blob blob--teal"></span>
    </div>

    <v-container class="hero-container">
      <div class="hero-layout">
        <!-- Copy -->
        <div class="hero-copy">
          <span v-if="props.badge" class="hero-badge font-mono text-caption mb-6">
            <span class="hero-badge-dot"></span>{{ props.badge }}
          </span>

          <h1 class="hero-name font-weight-bold mb-2">
            Rob Smitha<span class="hero-name-dot">.</span>
          </h1>
          <h2 class="hero-role font-weight-bold mb-6">{{ props.title }}</h2>

          <p class="hero-bio mb-8" v-html="props.subtitle"></p>

          <div class="d-flex flex-wrap ga-3">
            <v-btn
              v-for="(b, i) in props.actions"
              :key="b.text"
              :variant="i === 0 ? 'flat' : 'outlined'"
              color="white"
              size="large"
              rounded="pill"
              class="text-none hero-cta"
              :to="b.to"
              :href="b.href"
              :target="b.href?.startsWith('http') ? '_blank' : undefined"
              :prepend-icon="b.icon"
            >
              {{ b.text }}
            </v-btn>
          </div>
        </div>

        <!-- A Darcula editor that types out a little class about me. -->
        <div class="hero-ide-wrap" aria-hidden="true">
          <div class="ide">
            <div class="ide-titlebar d-flex align-center px-4">
              <span class="ide-dot" style="background: #FE2857"></span>
              <span class="ide-dot" style="background: #FC801D"></span>
              <span class="ide-dot" style="background: #21D789"></span>
              <span class="ide-title font-mono ml-4">robsmitha.com &mdash; RobSmitha.cs</span>
            </div>

            <div class="ide-tabs d-flex font-mono">
              <span class="ide-tab ide-tab--active"><span class="ide-tab-icon" style="color: #9B6BDF">C#</span>RobSmitha.cs</span>
              <span class="ide-tab"><span class="ide-tab-icon" style="color: #41b883">V</span>index.vue</span>
              <span class="ide-tab"><span class="ide-tab-icon" style="color: #3178c6">TS</span>github.ts</span>
            </div>

            <div class="ide-body font-mono">
              <div v-for="(line, i) in renderedLines" :key="i" class="ide-line" :class="{ 'ide-line--current': i === currentLine }">
                <span class="ide-gutter">{{ i + 1 }}</span>
                <span class="ide-code"><span
                    v-for="(tok, j) in line"
                    :key="j"
                    :class="`tok-${tok.c}`"
                  >{{ tok.t }}</span><span v-if="i === currentLine" class="ide-caret"></span></span>
              </div>
            </div>

            <div class="ide-run font-mono" :class="{ 'ide-run--visible': done }">
              <span class="ide-run-label">Run</span>
              <span class="ide-run-ok">&#10003; Build succeeded</span>
              <span class="ide-run-muted">shipped in {{ buildTime }}ms</span>
            </div>

            <div class="ide-status d-flex align-center font-mono px-4">
              <span class="d-flex align-center ga-1"><span class="ide-branch"></span>main</span>
              <span class="ml-auto">{{ currentLine + 1 }}:{{ caretColumn }}</span>
              <span>UTF-8</span>
              <span>C#</span>
            </div>
          </div>
        </div>
      </div>
    </v-container>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

type HeroAction = {
  text: string,
  to?: string,
  href?: string,
  icon?: string
}

const props = defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, required: true },
  badge: { type: String, default: '' },
  actions: { type: Array<HeroAction>, default: [] }
})

// Token classes map to Darcula syntax colors: kw keyword, ty type, fn method,
// pr property, st string, nu number, cm comment, tx plain text.
type Token = { t: string, c: 'kw' | 'ty' | 'fn' | 'pr' | 'st' | 'nu' | 'cm' | 'tx' }

const t = (text: string, c: Token['c'] = 'tx'): Token => ({ t: text, c })

const code: Token[][] = [
  [t('// Hi, I\'m Rob. I build things for the web.', 'cm')],
  [t('namespace ', 'kw'), t('Portfolio'), t(';')],
  [],
  [t('public sealed class ', 'kw'), t('RobSmitha', 'ty'), t(' : '), t('SoftwareEngineer', 'ty')],
  [t('{')],
  [t('    public string ', 'kw'), t('Role', 'pr'), t(' => '), t('"Senior Software Engineer"', 'st'), t(';')],
  [t('    public string ', 'kw'), t('Company', 'pr'), t(' => '), t('"JustFOIA"', 'st'), t(';')],
  [t('    public int ', 'kw'), t('Since', 'pr'), t(' => '), t('2017', 'nu'), t(';')],
  [],
  [t('    public string', 'kw'), t('[] '), t('Stack', 'pr'), t(' =>')],
  [t('        ['), t('"C#"', 'st'), t(', '), t('".NET"', 'st'), t(', '), t('"Vue"', 'st'), t(', '), t('"Azure"', 'st'), t('];')],
  [],
  [t('    public ', 'kw'), t('Task', 'ty'), t(' '), t('ShipAsync', 'fn'), t('() =>')],
  [t('        '), t('BuildThings', 'fn'), t('(fast: '), t('true', 'kw'), t(');')],
  [t('}')],
]

const lineLengths = code.map(line => line.reduce((n, tok) => n + tok.t.length, 0))
const totalChars = lineLengths.reduce((a, b) => a + b, 0) + code.length

const typed = ref(0)
const done = computed(() => typed.value >= totalChars)
const buildTime = 180 + Math.floor(Math.random() * 120)

// Lines as far as they've been typed so far.
const renderedLines = computed(() => {
  let remaining = typed.value
  const lines: Token[][] = []
  for (let i = 0; i < code.length; i++) {
    if (remaining <= 0 && i > 0) break
    const line: Token[] = []
    for (const tok of code[i]) {
      if (remaining <= 0) break
      const slice = tok.t.slice(0, remaining)
      line.push({ t: slice, c: tok.c })
      remaining -= slice.length
    }
    lines.push(line)
    remaining -= 1 // the newline
  }
  return lines
})

const currentLine = computed(() => Math.max(0, renderedLines.value.length - 1))
const caretColumn = computed(() => (renderedLines.value[currentLine.value] ?? []).reduce((n, tok) => n + tok.t.length, 0) + 1)

let timer: number | undefined

onMounted(() => {
  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  if (reduceMotion) {
    typed.value = totalChars
    return
  }
  // Start after the page settles, then type a few characters per tick.
  timer = window.setTimeout(function tick() {
    typed.value = Math.min(totalChars, typed.value + 2)
    if (typed.value < totalChars) {
      timer = window.setTimeout(tick, 28)
    }
  }, 600)
})

onBeforeUnmount(() => window.clearTimeout(timer))
</script>

<style scoped>
.hero-section {
  position: relative;
  overflow: hidden;
  min-height: 88vh;
  background: rgb(var(--v-theme-background));
  /* v-main already reserves 64px via the fixed app-bar's layout offset (padding-top),
     which pushes this section's box below the app-bar instead of behind it. Pull it
     back up by that same amount so the glow background renders underneath the
     transparent navbar too, then pad the content back down so it isn't covered by it. */
  margin-top: -64px;
  padding-top: 64px;
}

/* Faint dot grid, fading out toward the edges. */
.hero-grid {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image: radial-gradient(rgba(255, 255, 255, 0.07) 1px, transparent 1px);
  background-size: 28px 28px;
  -webkit-mask-image: radial-gradient(ellipse at 60% 45%, #000 20%, transparent 75%);
  mask-image: radial-gradient(ellipse at 60% 45%, #000 20%, transparent 75%);
}

/* Big blurred color fields in the JetBrains brand colors, drifting slowly. */
.hero-glow {
  position: absolute;
  inset: 0;
  pointer-events: none;
  filter: blur(90px);
  opacity: 0.9;
}

.blob {
  position: absolute;
  border-radius: 50%;
  animation: blob-drift 22s ease-in-out infinite alternate;
}

.blob--orange {
  width: 520px;
  height: 520px;
  right: 8%;
  top: 4%;
  background: rgba(252, 128, 29, 0.35);
}

.blob--magenta {
  width: 460px;
  height: 460px;
  right: 28%;
  top: 38%;
  background: rgba(254, 40, 87, 0.26);
  animation-delay: -6s;
}

.blob--violet {
  width: 560px;
  height: 560px;
  right: -6%;
  bottom: -18%;
  background: rgba(107, 87, 255, 0.34);
  animation-delay: -11s;
}

.blob--teal {
  width: 380px;
  height: 380px;
  left: -8%;
  top: 10%;
  background: rgba(33, 215, 137, 0.12);
  animation-delay: -3s;
}

@keyframes blob-drift {
  from { transform: translate3d(0, 0, 0) scale(1); }
  to { transform: translate3d(-40px, 30px, 0) scale(1.1); }
}

.hero-container {
  position: relative;
  z-index: 1;
  max-width: 1240px;
  padding-top: 3rem;
  padding-bottom: 4rem;
}

.hero-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.05fr);
  gap: 3rem;
  align-items: center;
}

/* Copy */
.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 5px 14px;
  border-radius: 999px;
  color: rgb(var(--v-theme-lightest-slate));
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.14);
  backdrop-filter: blur(8px);
}

.hero-badge-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgb(var(--v-theme-green));
  box-shadow: 0 0 0 4px rgba(var(--v-theme-green), 0.2);
}

.hero-name {
  font-size: clamp(2.75rem, 5vw + 1rem, 5.5rem);
  line-height: 1;
  letter-spacing: -0.03em;
  color: #fff;
}

.hero-name-dot {
  color: rgb(var(--v-theme-primary));
}

.hero-role {
  font-size: clamp(1.5rem, 2vw + 1rem, 2.75rem);
  line-height: 1.1;
  letter-spacing: -0.02em;
  display: inline-block;
  background: linear-gradient(90deg, #FC801D, #FE2857 45%, #9B6BDF 80%, #6B57FF);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-bio {
  max-width: 50ch;
  font-size: 1.125rem;
  line-height: 1.65;
  color: rgb(var(--v-theme-light-slate));
}

.hero-cta {
  transition: transform 0.2s ease, box-shadow 0.3s ease;
}

.hero-cta:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 30px -10px rgba(252, 128, 29, 0.55);
}

/* IDE window */
.hero-ide-wrap {
  perspective: 1600px;
}

.ide {
  position: relative;
  border-radius: 14px;
  overflow: hidden;
  background: #1e1f22;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow:
    0 40px 80px -30px rgba(0, 0, 0, 0.9),
    0 0 0 1px rgba(0, 0, 0, 0.4),
    0 0 90px -20px rgba(252, 128, 29, 0.35);
  transform: rotateY(-8deg) rotateX(4deg);
  transform-origin: left center;
  transition: transform 0.6s ease;
}

.hero-ide-wrap:hover .ide {
  transform: rotateY(-3deg) rotateX(2deg);
}

.ide-titlebar {
  height: 36px;
  background: #2b2d30;
  border-bottom: 1px solid #1e1f22;
}

.ide-dot {
  width: 11px;
  height: 11px;
  border-radius: 50%;
  margin-right: 7px;
}

.ide-title {
  font-size: 0.75rem;
  color: #868a91;
}

.ide-tabs {
  font-size: 0.75rem;
  background: #2b2d30;
  border-bottom: 1px solid #393b40;
}

.ide-tab {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  color: #868a91;
  border-right: 1px solid #1e1f22;
}

.ide-tab--active {
  color: #dfe1e5;
  background: #1e1f22;
  box-shadow: inset 0 -2px 0 #3574f0;
}

.ide-tab-icon {
  font-size: 0.625rem;
  font-weight: 700;
}

.ide-body {
  padding: 14px 0;
  min-height: 372px;
  font-size: 0.8125rem;
  line-height: 1.7;
}

.ide-line {
  display: flex;
  white-space: pre;
}

.ide-line--current {
  background: rgba(255, 255, 255, 0.035);
}

.ide-gutter {
  flex: 0 0 44px;
  padding-right: 16px;
  text-align: right;
  color: #4b5059;
  user-select: none;
}

.ide-line--current .ide-gutter {
  color: #a1a3ab;
}

.ide-code {
  color: #bcbec4;
}

.ide-caret {
  display: inline-block;
  width: 2px;
  height: 1.1em;
  margin-left: 1px;
  vertical-align: text-bottom;
  background: #ced0d6;
  animation: caret-blink 1s steps(1) infinite;
}

@keyframes caret-blink {
  50% { opacity: 0; }
}

/* Darcula (New UI) syntax colors. */
.tok-kw { color: #CF8E6D; }
.tok-ty { color: #BCBEC4; font-weight: 600; }
.tok-fn { color: #56A8F5; }
.tok-pr { color: #C77DBB; }
.tok-st { color: #6AAB73; }
.tok-nu { color: #2AACB8; }
.tok-cm { color: #7A7E85; font-style: italic; }
.tok-tx { color: #BCBEC4; }

.ide-run {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  font-size: 0.75rem;
  border-top: 1px solid #393b40;
  background: #2b2d30;
  opacity: 0;
  transform: translateY(6px);
  transition: opacity 0.4s ease, transform 0.4s ease;
}

.ide-run--visible {
  opacity: 1;
  transform: none;
}

.ide-run-label {
  color: #dfe1e5;
  padding: 1px 8px;
  border-radius: 4px;
  background: #393b40;
}

.ide-run-ok {
  color: #5fb865;
}

.ide-run-muted {
  color: #6f737a;
}

.ide-status {
  height: 26px;
  gap: 16px;
  font-size: 0.6875rem;
  color: #868a91;
  background: #2b2d30;
  border-top: 1px solid #1e1f22;
}

.ide-branch {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: 2px solid #868a91;
}

@media (max-width: 1100px) {
  .hero-layout {
    grid-template-columns: 1fr;
  }

  .ide {
    transform: none;
  }

  .hero-ide-wrap:hover .ide {
    transform: none;
  }
}

/* The editor needs more width than a phone has, so phones get the copy only. */
@media (max-width: 600px) {
  .hero-section {
    min-height: auto;
  }

  .hero-ide-wrap {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .blob,
  .ide-caret {
    animation: none;
  }

  .ide,
  .ide-run,
  .hero-cta {
    transition: none;
  }
}
</style>
