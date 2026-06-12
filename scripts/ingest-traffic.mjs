#!/usr/bin/env node
// Fetch GitHub repo traffic (clones, views) for the marketplace and every
// plugin listed in .claude-plugin/marketplace.json, then forward the daily
// counters to PostHog as events. Idempotent across re-runs by stamping
// $insert_id with the run date — duplicates at query time are collapsed
// with `max(count) GROUP BY repo, date`.
//
// Required env:
//   TRAFFIC_PAT              GitHub PAT with push access on every apliteni-org targeted repo
//   POSTHOG_API_KEY          PostHog project API key (phc_...)
//   POSTHOG_HOST             e.g. https://eu.posthog.com or https://us.posthog.com
// Optional env:
//   TRAFFIC_PAT_LESSLY       Separate PAT for lessly-hub-owned repos. Falls back to TRAFFIC_PAT
//                            (which will 404 for foreign-org repos) when unset.
//   MARKETPLACE_REPO         default: apliteni/claude-marketplace (the repo this script lives in)

import { readFile } from 'node:fs/promises'

const TRAFFIC_PAT = required('TRAFFIC_PAT')
const TRAFFIC_PAT_LESSLY = process.env.TRAFFIC_PAT_LESSLY || TRAFFIC_PAT
const POSTHOG_API_KEY = required('POSTHOG_API_KEY')
const POSTHOG_HOST = required('POSTHOG_HOST').replace(/\/+$/, '')
const MARKETPLACE_REPO = process.env.MARKETPLACE_REPO || 'apliteni/claude-marketplace'

function patFor(repo) {
  return repo.startsWith('lessly-hub/') ? TRAFFIC_PAT_LESSLY : TRAFFIC_PAT
}

function required(name) {
  const v = process.env[name]
  if (!v) {
    console.error(`Missing required env: ${name}`)
    process.exit(1)
  }
  return v
}

const RUN_DATE = new Date().toISOString().slice(0, 10)

const manifest = JSON.parse(
  await readFile(new URL('../.claude-plugin/marketplace.json', import.meta.url), 'utf8'),
)

const repos = [
  { repo: MARKETPLACE_REPO, role: 'marketplace' },
  ...manifest.plugins.map((p) => ({ repo: p.source.repo, role: 'plugin', plugin: p.name })),
]

let sent = 0
let failed = 0

for (const target of repos) {
  for (const kind of ['clones', 'views']) {
    const days = await fetchTraffic(target.repo, kind)
    if (!days) {
      failed++
      continue
    }
    for (const day of days) {
      const ok = await sendEvent(target, kind, day)
      if (ok) sent++
      else failed++
    }
  }
}

console.log(`Done. sent=${sent} failed=${failed}`)
// Tolerate per-repo failures (e.g. PAT lacks access to a foreign-org repo) as
// long as at least one event landed. Hard-fail only when nothing got through,
// which signals a broken PostHog ingest or a broken PAT for every repo.
if (sent === 0) {
  console.error('No events sent — credentials or ingest likely broken.')
  process.exit(1)
}

async function fetchTraffic(repo, kind) {
  const url = `https://api.github.com/repos/${repo}/traffic/${kind}`
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${patFor(repo)}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  })
  if (!res.ok) {
    console.error(`GET ${url} -> ${res.status} ${res.statusText}`)
    return null
  }
  const body = await res.json()
  // Both endpoints return { count, uniques, clones: [{timestamp, count, uniques}] }
  // or the equivalent under `views`.
  return body[kind] ?? []
}

async function sendEvent(target, kind, day) {
  const date = day.timestamp.slice(0, 10)
  const event = kind === 'clones' ? 'plugin_repo_clones' : 'plugin_repo_views'
  const payload = {
    api_key: POSTHOG_API_KEY,
    event,
    distinct_id: target.repo,
    timestamp: `${date}T12:00:00Z`,
    properties: {
      repo: target.repo,
      role: target.role,
      plugin: target.plugin ?? null,
      date,
      count: day.count,
      uniques: day.uniques,
      source: 'github_traffic_api',
      $insert_id: `traffic-${target.repo}-${kind}-${date}-${RUN_DATE}`,
    },
  }
  const res = await fetch(`${POSTHOG_HOST}/i/v0/e/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    console.error(`PostHog ${event} ${target.repo} ${date} -> ${res.status} ${res.statusText}`)
    return false
  }
  return true
}
