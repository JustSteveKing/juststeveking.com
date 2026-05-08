<script lang="ts">
  import { cubicOut } from 'svelte/easing';
  import { tweened } from 'svelte/motion';
  import { get } from 'svelte/store';
  import { tonePalette } from './theme';
  import type { ReviewScore } from './types';

  export let score: ReviewScore;
  export let animate = false;
  export let onSelect: (sectionId: string) => void;

  const circumference = 2 * Math.PI * 40;
  const progress = tweened(0, { duration: 0 });

  $: if (animate && get(progress) === 0) {
    progress.set(score.score, { duration: 1400, easing: cubicOut });
  }

  $: tone = tonePalette[score.tone];
  $: current = $progress;
  $: dashOffset = circumference - (current / 100) * circumference;
</script>

<button class="score-gauge" type="button" on:click={() => onSelect(score.sectionId)}>
  <div class="gauge-ring" aria-hidden="true">
    <svg viewBox="0 0 100 100">
      <circle class="gauge-bg" cx="50" cy="50" r="40"></circle>
      <circle
        class="gauge-fill"
        cx="50" cy="50" r="40"
        stroke={tone.solid}
        stroke-dasharray={circumference}
        stroke-dashoffset={dashOffset}
      ></circle>
    </svg>
    <span class="gauge-value" style={`color:${tone.solid}`}>{Math.round(current)}</span>
  </div>
  <div class="gauge-label">{score.label}</div>
  <div class="gauge-verdict" style={`color:${tone.solid}`}>{score.verdict}</div>
  <span class="gauge-hint">Jump to section</span>
</button>

<style>
  .score-gauge {
    position: relative;
    width: 100%;
    border: 1px solid var(--color-border-weak);
    border-radius: 8px;
    background: var(--color-bg-weak);
    padding: 28px 16px;
    text-align: center;
    cursor: pointer;
    transition: border-color 0.15s, background 0.15s, transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .score-gauge:hover {
    background: var(--color-bg-weak-hover);
    border-color: var(--color-border);
    transform: translateY(-3px);
  }

  .score-gauge:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 3px;
  }

  .gauge-ring {
    position: relative;
    width: 84px;
    height: 84px;
    margin: 0 auto 16px;
  }

  svg {
    width: 100%;
    height: 100%;
    transform: rotate(-90deg);
  }

  .gauge-bg, .gauge-fill { fill: none; stroke-width: 6; }
  .gauge-bg { stroke: var(--color-border-weak); }

  .gauge-fill {
    stroke-linecap: round;
    transition: stroke-dashoffset 0.1s linear;
  }

  .gauge-value {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-family: var(--font-mono);
    font-size: 22px;
    font-weight: 700;
    letter-spacing: -0.04em;
  }

  .gauge-label {
    margin-bottom: 4px;
    font-size: 14px;
    font-weight: 600;
    color: var(--color-text-strong);
  }

  .gauge-verdict {
    font-family: var(--font-mono);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .gauge-hint {
    display: block;
    margin-top: 12px;
    font-family: var(--font-mono);
    font-size: 9px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--color-text-weak);
    opacity: 0;
    transition: opacity 0.15s;
  }

  .score-gauge:hover .gauge-hint { opacity: 1; }
</style>
