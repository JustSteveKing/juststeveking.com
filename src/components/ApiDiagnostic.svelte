<script lang="ts">
  import { onMount } from 'svelte';

  type Severity = 'CRITICAL' | 'HIGH' | 'SLOW' | 'MEDIUM' | 'DESIGN' | 'OK';

  type Finding = {
    method: string;
    path: string;
    detail: string;
    severity: Severity;
  };

  type Scan = {
    label: string;
    flag: string;
    scanning: string;
    findings: Finding[];
    summary: string;
  };

  const scans: Scan[] = [
    {
      label: 'Performance',
      flag: '--check=performance',
      scanning: 'Profiling 24 endpoints...',
      findings: [
        { method: 'GET',    path: '/api/v1/reports',      detail: '3,241ms p95',  severity: 'CRITICAL' },
        { method: 'POST',   path: '/api/v1/export',       detail: 'timeout p95',  severity: 'CRITICAL' },
        { method: 'GET',    path: '/api/v1/users',        detail: '847ms p95',    severity: 'SLOW'     },
        { method: 'POST',   path: '/api/v1/search',       detail: '1,180ms p95',  severity: 'SLOW'     },
        { method: 'GET',    path: '/api/v1/feed',         detail: '198ms p95',    severity: 'OK'       },
      ],
      summary: '2 critical, 2 slow — avg 1.4s, target <200ms',
    },
    {
      label: 'Security',
      flag: '--check=security',
      scanning: 'Checking auth patterns...',
      findings: [
        { method: 'DELETE', path: '/api/v1/orders/{id}',  detail: 'no auth check', severity: 'CRITICAL' },
        { method: 'GET',    path: '/api/v1/admin/users',  detail: 'missing scope', severity: 'HIGH'     },
        { method: 'POST',   path: '/api/v1/auth/token',   detail: 'no rate-limit', severity: 'HIGH'     },
        { method: 'GET',    path: '/api/v1/users/{id}',   detail: 'IDOR risk',     severity: 'HIGH'     },
        { method: 'PUT',    path: '/api/v1/settings',     detail: 'token in URL',  severity: 'MEDIUM'   },
      ],
      summary: '1 critical, 3 high, 1 medium — auth middleware audit required',
    },
    {
      label: 'Design',
      flag: '--check=design',
      scanning: 'Reviewing API contracts...',
      findings: [
        { method: 'POST',   path: '/api/v1/users',        detail: '200 on create',  severity: 'DESIGN' },
        { method: 'GET',    path: '/api/v1/products',     detail: 'no pagination',  severity: 'DESIGN' },
        { method: 'GET',    path: '/api/v1/orders',       detail: 'mixed casing',   severity: 'DESIGN' },
        { method: 'DELETE', path: '/api/v1/items/{id}',   detail: 'returns 200',    severity: 'DESIGN' },
        { method: 'GET',    path: '/api/v1/search',       detail: 'no cursor',      severity: 'DESIGN' },
      ],
      summary: '5 design issues — no versioning strategy detected',
    },
  ];

  let activeIndex = $state(0);
  let visibleCount = $state(0);
  let phase = $state<'idle' | 'scanning' | 'findings' | 'done'>('idle');
  let busy = $state(false);

  let timers: ReturnType<typeof setTimeout>[] = [];

  function clearTimers() {
    timers.forEach(clearTimeout);
    timers = [];
  }

  function runScan(index: number) {
    if (busy && index === activeIndex) return;
    clearTimers();
    activeIndex = index;
    visibleCount = 0;
    phase = 'scanning';
    busy = true;

    const findings = scans[index].findings;

    timers.push(setTimeout(() => {
      phase = 'findings';
      findings.forEach((_, i) => {
        timers.push(setTimeout(() => {
          visibleCount = i + 1;
          if (i === findings.length - 1) {
            timers.push(setTimeout(() => {
              phase = 'done';
              busy = false;
            }, 300));
          }
        }, i * 140));
      });
    }, 700));
  }

  onMount(() => {
    runScan(0);
    return clearTimers;
  });

  const scan = $derived(scans[activeIndex]);
</script>

<div class="font-mono text-[13px] border-t border-b border-edge bg-surface-weak" role="region" aria-label="API diagnostic terminal">
  <!-- Header -->
  <div class="flex items-stretch border-b border-edge bg-surface">
    <!-- Traffic lights -->
    <div class="sm:hidden md:flex items-center gap-1.5 md:px-5 border-r border-edge shrink-0" aria-hidden="true">
      <span class="w-2.5 h-2.5 rounded-full bg-[var(--color-border)]"></span>
      <span class="w-2.5 h-2.5 rounded-full bg-[var(--color-border)]"></span>
      <span class="w-2.5 h-2.5 rounded-full bg-[var(--color-border)]"></span>
    </div>

    <!-- Scan tabs -->
    <div class="flex items-stretch flex-1" role="tablist" aria-label="Diagnostic checks">
      {#each scans as s, i}
        <button
          role="tab"
          aria-selected={activeIndex === i}
          aria-controls="diagnostic-output"
          onclick={() => runScan(i)}
          class="flex items-center sm:gap-1 md:gap-2 px-5 py-3 text-[12px] border-r border-edge transition-colors"
          class:fg-strong={activeIndex === i}
          class:fg-weak={activeIndex !== i}
          style={activeIndex === i ? 'border-bottom: 2px solid var(--color-accent); margin-bottom: -1px;' : ''}
        >
          {s.label}
        </button>
      {/each}
    </div>

    <!-- Re-run -->
    <button
      onclick={() => runScan(activeIndex)}
      disabled={busy}
      aria-label="Re-run scan"
      class="flex sm:flex-1 items-center gap-2 px-5 py-3 text-[12px] fg-weak border-l border-edge transition-colors hover:fg-accent disabled:opacity-40 disabled:cursor-not-allowed"
    >
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" class="w-3.5 h-3.5" class:animate-spin={busy} aria-hidden="true">
        <path d="M13.5 8A5.5 5.5 0 1 1 10 3.07" stroke-linecap="round"/>
        <path d="M10 1v3h3" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span class="hidden md:block">
        {busy ? 'Scanning…' : 'Re-run'}
      </span>
    </button>
  </div>

  <!-- Output -->
  <div id="diagnostic-output" role="tabpanel" class="px-section py-8 min-h-[240px]" aria-live="polite">
    <!-- Command -->
    <div class="fg-weak mb-4">
      <span class="fg-weak">$ </span><span class="fg-strong">api-audit {scan.flag}</span>
    </div>

    <!-- Scanning phase -->
    {#if phase === 'scanning' || phase === 'findings' || phase === 'done'}
      <div class="fg-weak mb-4 flex items-center gap-2">
        <span>→</span>
        <span>{scan.scanning}</span>
        {#if phase === 'scanning'}
          <span class="cursor-blink">▋</span>
        {/if}
      </div>
    {/if}

    <!-- Findings -->
    {#if phase === 'findings' || phase === 'done'}
      <div class="flex flex-col gap-1.5 mb-4">
        {#each scan.findings.slice(0, visibleCount) as finding}
          <div class="flex items-baseline gap-3">
            <span class="fg-weak shrink-0">●</span>
            <span class="method" data-method={finding.method}>{finding.method.padEnd(7)}</span>
            <span class="fg-strong flex-1 min-w-0 truncate">{finding.path}</span>
            <span class="fg-weak hidden sm:block w-[13ch] shrink-0 text-right">{finding.detail}</span>
            <span class="badge" data-severity={finding.severity}>[{finding.severity}]</span>
          </div>
        {/each}
      </div>
    {/if}

    <!-- Summary -->
    {#if phase === 'done'}
      <div class="summary mt-2">
        ↳ {scan.summary}
      </div>
    {/if}
  </div>
</div>

<style>
  @media (prefers-reduced-motion: no-preference) {
    .cursor-blink {
      animation: blink 1s step-end infinite;
    }

    @keyframes blink {
      0%, 100% { opacity: 1; }
      50%       { opacity: 0; }
    }
  }

  /* HTTP method colours */
  .method[data-method="GET"]    { color: #1e66f5; } /* Latte Blue */
  .method[data-method="POST"]   { color: #40a02b; } /* Latte Green */
  .method[data-method="PUT"]    { color: #df8e1d; } /* Latte Yellow */
  .method[data-method="DELETE"] { color: #d20f39; } /* Latte Red */
  .method[data-method="PATCH"]  { color: #fe640b; } /* Latte Peach */

  /* Severity badge colours */
  .badge[data-severity="CRITICAL"] { color: #d20f39; font-weight: 700; }
  .badge[data-severity="HIGH"]     { color: #fe640b; }
  .badge[data-severity="SLOW"]     { color: #df8e1d; }
  .badge[data-severity="MEDIUM"]   { color: #df8e1d; }
  .badge[data-severity="DESIGN"]   { color: #1e66f5; }
  .badge[data-severity="OK"]       { color: #40a02b; }

  .summary { color: #40a02b; } /* Latte Green */

  @media (prefers-color-scheme: dark) {
    .method[data-method="GET"]    { color: #89b4fa; }
    .method[data-method="POST"]   { color: #a6e3a1; }
    .method[data-method="PUT"]    { color: #f9e2af; }
    .method[data-method="DELETE"] { color: #f38ba8; }
    .method[data-method="PATCH"]  { color: #fab387; }

    .badge[data-severity="CRITICAL"] { color: #f38ba8; }
    .badge[data-severity="HIGH"]     { color: #fab387; }
    .badge[data-severity="SLOW"]     { color: #f9e2af; }
    .badge[data-severity="MEDIUM"]   { color: #f9e2af; }
    .badge[data-severity="DESIGN"]   { color: #89b4fa; }
    .badge[data-severity="OK"]       { color: #a6e3a1; }

    .summary { color: #a6e3a1; }
  }
</style>
