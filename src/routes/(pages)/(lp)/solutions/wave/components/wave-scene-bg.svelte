<script lang="ts">
  // Reusable wavy SVG background used on the hub hero + every lifecycle scene.
  // crypto.randomUUID() keeps gradient IDs unique so multiple instances on the
  // same page don't share refs.
  const uid = crypto.randomUUID();
  const grad1 = `wave-scene-grad-1-${uid}`;
  const grad2 = `wave-scene-grad-2-${uid}`;
</script>

<div class="bg">
  <svg
    viewBox="0 0 1200 800"
    preserveAspectRatio="xMidYMid slice"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id={grad1} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="var(--color-primary-level-2)" stop-opacity="0.6" />
        <stop offset="100%" stop-color="var(--color-primary-level-1)" stop-opacity="0" />
      </linearGradient>
      <linearGradient id={grad2} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="var(--color-primary)" stop-opacity="0.15" />
        <stop offset="100%" stop-color="var(--color-primary)" stop-opacity="0" />
      </linearGradient>
    </defs>

    <path
      d="M0,500 C200,420 400,580 600,500 C800,420 1000,580 1200,500 L1200,800 L0,800 Z"
      fill="url(#{grad1})"
    >
      <animate
        attributeName="d"
        dur="14s"
        repeatCount="indefinite"
        values="
          M0,500 C200,420 400,580 600,500 C800,420 1000,580 1200,500 L1200,800 L0,800 Z;
          M0,510 C200,580 400,420 600,510 C800,580 1000,420 1200,510 L1200,800 L0,800 Z;
          M0,500 C200,420 400,580 600,500 C800,420 1000,580 1200,500 L1200,800 L0,800 Z
        "
      />
    </path>

    <path
      d="M0,620 C300,560 500,700 800,620 C1000,565 1100,650 1200,620 L1200,800 L0,800 Z"
      fill="url(#{grad2})"
    >
      <animate
        attributeName="d"
        dur="18s"
        repeatCount="indefinite"
        values="
          M0,620 C300,560 500,700 800,620 C1000,565 1100,650 1200,620 L1200,800 L0,800 Z;
          M0,640 C300,700 500,560 800,640 C1000,680 1100,580 1200,640 L1200,800 L0,800 Z;
          M0,620 C300,560 500,700 800,620 C1000,565 1100,650 1200,620 L1200,800 L0,800 Z
        "
      />
    </path>

    <!-- Drifting tiny coin shapes -->
    <g opacity="0.5">
      <circle cx="180" cy="180" r="6" fill="var(--color-primary)" opacity="0.4">
        <animate attributeName="cy" values="180;160;180" dur="6s" repeatCount="indefinite" />
      </circle>
      <circle cx="980" cy="240" r="8" fill="var(--color-primary)" opacity="0.3">
        <animate attributeName="cy" values="240;220;240" dur="8s" repeatCount="indefinite" />
      </circle>
      <circle cx="640" cy="120" r="5" fill="var(--color-primary)" opacity="0.5">
        <animate attributeName="cy" values="120;100;120" dur="5s" repeatCount="indefinite" />
      </circle>
    </g>
  </svg>
</div>

<style>
  .bg {
    position: absolute;
    inset: 0;
    z-index: -1;
    background: linear-gradient(
      180deg,
      var(--color-foreground-level-1) 0%,
      var(--color-primary-level-1) 100%
    );
    pointer-events: none;
    overflow: hidden;
  }

  .bg svg {
    width: 100%;
    height: 100%;
  }

  @media (prefers-reduced-motion: reduce) {
    .bg svg :global(animate) {
      display: none;
    }
  }
</style>
