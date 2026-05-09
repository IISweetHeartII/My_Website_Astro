#!/usr/bin/env node

const HELP = `CTA summary helper

Usage:
  node scripts/cta-summary.mjs --page-path /library/slug --campaign campaign-name
  node scripts/cta-summary.mjs --cta-name newsletter
  node scripts/cta-summary.mjs --full
  node scripts/cta-summary.mjs --recent

Options:
  --site <url>         Base site URL (default: https://log8.kr)
  --page-path <path>   Filter by cta_page_path
  --campaign <name>    Filter by cta_campaign
  --cta-name <name>    Filter by cta_name
  --source <name>      Filter by cta_source
  --full               Fetch admin full summary (requires ADMIN_SECRET)
  --recent             Fetch admin recent events (requires ADMIN_SECRET)
  --json               Print raw JSON only
  -h, --help           Show help

Notes:
  - Filtered aggregate reads use public_summary and do not require ADMIN_SECRET.
  - Full-site totals/recent events still require ADMIN_SECRET.
`;

function parseArgs(argv) {
  const args = {
    site: process.env.CTA_SITE_URL || 'https://log8.kr',
    json: false,
    full: false,
    recent: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    const next = argv[i + 1];

    switch (token) {
      case '--site':
        args.site = next;
        i += 1;
        break;
      case '--page-path':
        args.pagePath = next;
        i += 1;
        break;
      case '--campaign':
        args.campaign = next;
        i += 1;
        break;
      case '--cta-name':
        args.ctaName = next;
        i += 1;
        break;
      case '--source':
        args.source = next;
        i += 1;
        break;
      case '--full':
        args.full = true;
        break;
      case '--recent':
        args.recent = true;
        break;
      case '--json':
        args.json = true;
        break;
      case '-h':
      case '--help':
        args.help = true;
        break;
      default:
        throw new Error(`Unknown argument: ${token}`);
    }
  }

  return args;
}

function compactFilters(args) {
  return {
    page_path: args.pagePath,
    campaign: args.campaign,
    cta_name: args.ctaName,
    source: args.source,
  };
}

function hasPublicFilters(filters) {
  return Object.values(filters).some(Boolean);
}

function buildUrl(args) {
  const url = new URL('/api/cta', args.site);
  const filters = compactFilters(args);

  if (args.full) {
    url.searchParams.set('action', 'summary');
    return { mode: 'admin_summary', url, requiresSecret: true };
  }

  if (args.recent) {
    url.searchParams.set('action', 'recent');
    return { mode: 'admin_recent', url, requiresSecret: true };
  }

  if (!hasPublicFilters(filters)) {
    throw new Error('Public aggregate query needs at least one filter: --page-path, --campaign, --cta-name, or --source');
  }

  url.searchParams.set('action', 'public_summary');
  for (const [key, value] of Object.entries(filters)) {
    if (value) {
      url.searchParams.set(key, value);
    }
  }

  return { mode: 'public_summary', url, requiresSecret: false };
}

function buildHeaders(requiresSecret) {
  const headers = { Accept: 'application/json' };
  if (!requiresSecret) {
    return headers;
  }

  const secret = process.env.ADMIN_SECRET;
  if (!secret) {
    throw new Error('ADMIN_SECRET is required for --full/--recent. Use filtered public_summary instead.');
  }

  headers.Authorization = `Bearer ${secret}`;
  return headers;
}

function formatTimestamp(value) {
  if (!value) return 'n/a';
  try {
    return new Date(value).toISOString();
  } catch {
    return String(value);
  }
}

function printHumanSummary(mode, payload) {
  console.log(`mode=${mode}`);
  console.log(`updated_at=${formatTimestamp(payload.updated_at)}`);

  if (mode === 'public_summary') {
    console.log(`matched_events=${payload.matched_events ?? 0}`);
    console.log(`filters=${JSON.stringify(payload.filters ?? {})}`);
    console.log(`counts_by_name=${JSON.stringify(payload.counts_by_name ?? {})}`);
    console.log(`counts_by_source=${JSON.stringify(payload.counts_by_source ?? {})}`);
    const rows = Array.isArray(payload.rows) ? payload.rows : [];
    console.log(`rows=${rows.length}`);
    for (const row of rows.slice(0, 10)) {
      console.log(
        `- ${row.cta_name} | section=${row.cta_section} | source=${row.cta_source} | campaign=${row.cta_campaign} | page=${row.cta_page_path} | count=${row.count}`
      );
    }
    return;
  }

  if (mode === 'admin_summary') {
    console.log(`total_events=${payload.total_events ?? 0}`);
    const rows = Array.isArray(payload.rows) ? payload.rows : [];
    console.log(`rows=${rows.length}`);
    for (const row of rows.slice(0, 10)) {
      console.log(
        `- ${row.cta_name} | section=${row.cta_section} | source=${row.cta_source} | campaign=${row.cta_campaign} | page=${row.cta_page_path} | count=${row.count}`
      );
    }
    return;
  }

  if (mode === 'admin_recent') {
    console.log(`total_events=${payload.total_events ?? 0}`);
    const recent = Array.isArray(payload.recent) ? payload.recent : [];
    console.log(`recent=${recent.length}`);
    for (const row of recent.slice(-10)) {
      console.log(
        `- ${formatTimestamp(row.ts)} | ${row.cta_name} | source=${row.cta_source} | campaign=${row.cta_campaign} | page=${row.cta_page_path}`
      );
    }
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(HELP);
    return;
  }

  const { mode, url, requiresSecret } = buildUrl(args);
  const response = await fetch(url, { headers: buildHeaders(requiresSecret) });
  const text = await response.text();
  let payload;

  try {
    payload = JSON.parse(text);
  } catch {
    throw new Error(`Non-JSON response (${response.status}): ${text.slice(0, 500)}`);
  }

  if (!response.ok) {
    throw new Error(`Request failed (${response.status}): ${JSON.stringify(payload)}`);
  }

  if (args.json) {
    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  printHumanSummary(mode, payload);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
