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
    variant: { type: String as () => 'ribbon' | 'arcs' | 'capitol', default: 'arcs' }
})

// Each instance needs its own gradient/filter ids, otherwise two panels on the
// page would end up sharing (and overriding) the same <defs>.
const uid = `art-${Math.random().toString(36).slice(2, 8)}`

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
