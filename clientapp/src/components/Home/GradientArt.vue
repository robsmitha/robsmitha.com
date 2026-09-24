<template>
    <!-- Abstract gradient artwork for the colored panels, in the spirit of the
         bold geometric/ribbon illustrations on jetbrains.com. Pure SVG, so it
         stays crisp at any size and needs no image requests. -->
    <svg
        v-if="variant === 'ribbon'"
        class="gradient-art gradient-art--float"
        viewBox="0 0 400 300"
        aria-hidden="true"
        focusable="false"
    >
        <defs>
            <linearGradient :id="`${uid}-ribbon`" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#2AACB8" />
                <stop offset="35%" stop-color="#21D789" />
                <stop offset="65%" stop-color="#56A8F5" />
                <stop offset="100%" stop-color="#C77DBB" />
            </linearGradient>
            <filter :id="`${uid}-glow`" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="14" />
            </filter>
        </defs>
        <path :d="ribbonPath" fill="none" :stroke="`url(#${uid}-ribbon)`" stroke-width="44" stroke-linecap="round" opacity="0.55" :filter="`url(#${uid}-glow)`" />
        <path :d="ribbonPath" fill="none" :stroke="`url(#${uid}-ribbon)`" stroke-width="34" stroke-linecap="round" />
        <path :d="ribbonPath" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" opacity="0.28" transform="translate(-6 -8)" />
    </svg>

    <svg
        v-else-if="variant === 'editor'"
        class="gradient-art"
        viewBox="0 0 400 300"
        aria-hidden="true"
        focusable="false"
    >
        <defs>
            <radialGradient :id="`${uid}-halo`" cx="0.5" cy="0.5" r="0.5">
                <stop offset="0%" stop-color="#2AACB8" stop-opacity="0.3" />
                <stop offset="100%" stop-color="#2AACB8" stop-opacity="0" />
            </radialGradient>
            <linearGradient :id="`${uid}-lens`" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#21D789" />
                <stop offset="50%" stop-color="#56A8F5" />
                <stop offset="100%" stop-color="#C77DBB" />
            </linearGradient>
        </defs>
        <circle cx="200" cy="150" r="160" :fill="`url(#${uid}-halo)`" />
        <!-- editor window -->
        <rect x="46" y="46" width="290" height="200" rx="14" fill="#151517" stroke="#ffffff" stroke-opacity="0.12" />
        <circle cx="68" cy="66" r="5" fill="#FE2857" />
        <circle cx="86" cy="66" r="5" fill="#FC801D" />
        <circle cx="104" cy="66" r="5" fill="#21D789" />
        <!-- the matched line, highlighted like a search hit -->
        <rect x="60" :y="lineY(3) - 7" width="262" height="18" rx="4" fill="#CF8E6D" fill-opacity="0.18" />
        <template v-for="(line, i) in codeLines" :key="i">
            <rect x="64" :y="lineY(i)" width="10" height="5" rx="2.5" fill="#ffffff" fill-opacity="0.15" />
            <rect
                v-for="(seg, j) in line"
                :key="j"
                :x="seg[0]"
                :y="lineY(i)"
                :width="seg[1]"
                height="5"
                rx="2.5"
                :fill="seg[2]"
            />
        </template>
        <!-- magnifying glass over the window -->
        <circle cx="308" cy="210" r="38" fill="#0a0a0c" fill-opacity="0.55" :stroke="`url(#${uid}-lens)`" stroke-width="9" />
        <line x1="336" y1="238" x2="364" y2="266" :stroke="`url(#${uid}-lens)`" stroke-width="12" stroke-linecap="round" />
    </svg>

    <svg
        v-else-if="variant === 'capitol'"
        class="gradient-art"
        viewBox="0 0 400 300"
        aria-hidden="true"
        focusable="false"
    >
        <defs>
            <linearGradient :id="`${uid}-dome`" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#56A8F5" />
                <stop offset="100%" stop-color="#6B57FF" />
            </linearGradient>
            <linearGradient :id="`${uid}-column`" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#FC801D" />
                <stop offset="100%" stop-color="#FE2857" stop-opacity="0.35" />
            </linearGradient>
            <radialGradient :id="`${uid}-halo`" cx="0.5" cy="0.55" r="0.5">
                <stop offset="0%" stop-color="#56A8F5" stop-opacity="0.35" />
                <stop offset="100%" stop-color="#56A8F5" stop-opacity="0" />
            </radialGradient>
        </defs>
        <circle cx="200" cy="160" r="150" :fill="`url(#${uid}-halo)`" />
        <!-- spire, cupola and dome -->
        <rect x="197" y="34" width="6" height="30" rx="3" fill="#CF8E6D" />
        <rect x="184" y="60" width="32" height="22" rx="4" :fill="`url(#${uid}-dome)`" opacity="0.8" />
        <path d="M112,172 A88,88 0 0 1 288,172 Z" :fill="`url(#${uid}-dome)`" />
        <path d="M140,172 A60,60 0 0 1 260,172" fill="none" stroke="#ffffff" stroke-opacity="0.25" stroke-width="3" />
        <!-- entablature, columns and steps -->
        <rect x="100" y="172" width="200" height="14" rx="2" fill="#CF8E6D" />
        <rect v-for="i in 7" :key="i" :x="108 + (i - 1) * 29" y="192" width="12" height="62" rx="3" :fill="`url(#${uid}-column)`" />
        <rect x="88" y="256" width="224" height="10" rx="2" fill="#CF8E6D" opacity="0.85" />
        <rect x="72" y="270" width="256" height="10" rx="2" fill="#CF8E6D" opacity="0.6" />
    </svg>

    <svg
        v-else
        class="gradient-art"
        viewBox="0 0 400 300"
        preserveAspectRatio="xMaxYMax slice"
        aria-hidden="true"
        focusable="false"
    >
        <defs>
            <linearGradient :id="`${uid}-ember`" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#FC801D" />
                <stop offset="100%" stop-color="#FE2857" />
            </linearGradient>
            <linearGradient :id="`${uid}-plum`" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#C77DBB" />
                <stop offset="100%" stop-color="#6B57FF" />
            </linearGradient>
            <linearGradient :id="`${uid}-shard`" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#FE2857" stop-opacity="0.55" />
                <stop offset="100%" stop-color="#6B57FF" stop-opacity="0" />
            </linearGradient>
        </defs>
        <polygon points="110,0 210,0 140,300 40,300" :fill="`url(#${uid}-shard)`" />
        <circle cx="360" cy="320" r="240" :fill="`url(#${uid}-ember)`" />
        <circle cx="360" cy="320" r="160" :fill="`url(#${uid}-plum)`" />
        <circle cx="360" cy="320" r="84" fill="#CF8E6D" />
    </svg>
</template>

<script setup lang="ts">
defineProps({
    variant: { type: String as () => 'ribbon' | 'arcs' | 'capitol' | 'editor', default: 'arcs' }
})

// Each instance needs its own gradient/filter ids, otherwise two panels on the
// page would end up sharing (and overriding) the same <defs>.
const uid = `art-${Math.random().toString(36).slice(2, 8)}`

// Code lines for the editor art: [x, width, color] segments in Darcula syntax colors.
const codeLines: [number, number, string][][] = [
    [[86, 34, '#CF8E6D'], [126, 60, '#56A8F5'], [192, 20, '#ffffff33']],
    [[98, 28, '#CF8E6D'], [132, 44, '#C77DBB'], [182, 70, '#6AAB73']],
    [[98, 50, '#56A8F5'], [154, 30, '#ffffff33']],
    [[110, 36, '#CF8E6D'], [152, 86, '#6AAB73'], [244, 26, '#2AACB8']],
    [[110, 54, '#C77DBB'], [170, 40, '#56A8F5']],
    [[98, 22, '#ffffff33']],
    [[86, 44, '#CF8E6D'], [136, 52, '#56A8F5']],
    [[98, 64, '#6AAB73'], [168, 30, '#2AACB8']],
]
const lineY = (i: number) => 90 + i * 19

// A tilted infinity loop.
const ribbonPath = 'M70,170 C60,70 170,60 205,150 S330,250 345,150 S240,50 205,150 S80,260 70,170Z'
</script>

<style scoped>
.gradient-art {
    display: block;
    width: 100%;
    height: 100%;
}

.gradient-art--float {
    animation: art-float 12s ease-in-out infinite alternate;
}

@keyframes art-float {
    from { transform: translateY(0) rotate(-2deg); }
    to { transform: translateY(-10px) rotate(2deg); }
}

@media (prefers-reduced-motion: reduce) {
    .gradient-art--float {
        animation: none;
    }
}
</style>
