# Plugin telemetry — setup runbook

How the Apliteni plugin telemetry works, where the data lives, and the mechanical steps to add it to a new plugin or a new tracked repo.

Source issue: [#7](https://github.com/apliteni/claude-marketplace/issues/7). Announcement: [Discussion #10](https://github.com/apliteni/claude-marketplace/discussions/10).

## Architecture

Two independent surfaces feed the same PostHog project.

```
              ┌─────────────────────────────────┐
              │      PostHog: Apliteni org      │
              │  project plugin-telemetry (200602) │
              │       https://eu.posthog.com    │
              └────────────▲────────────────────┘
                           │
       ┌───────────────────┴───────────────────┐
       │                                       │
┌──────┴───────────────┐         ┌─────────────┴──────────────┐
│ Phase 1 (this repo)  │         │ Phase 2 (each plugin repo) │
│ Daily GitHub Action  │         │ SessionStart hook in       │
│ /traffic/{clones,    │         │ hooks/session-start-       │
│  views} → PostHog    │         │ telemetry.mjs              │
│                      │         │                            │
│ Events:              │         │ Events:                    │
│  plugin_repo_clones  │         │  plugin_active_day         │
│  plugin_repo_views   │         │  plugin_install_first_run  │
│                      │         │                            │
│ distinct_id = repo   │         │ distinct_id = random UUID  │
│                      │         │ stored at                  │
│                      │         │ ~/.config/apliteni-plugin/ │
│                      │         │ install-id                 │
└──────────────────────┘         └────────────────────────────┘
```

What each phase answers:

- **Phase 1** (Traffic API): how many distinct people *tried* to install — counts successful `git clone`s only. Failed clones (`Repository not found` because the user isn't in the org) leave no trace.
- **Phase 2** (SessionStart hook): how many distinct installs *actually run* on a given UTC day. Compared to Phase 1: clones-minus-active-installs ≈ broken installs.

## Required secrets in `apliteni/claude-marketplace`

| Secret | Source | What it does |
|---|---|---|
| `TRAFFIC_PAT` | 1Password: `Employee/claude-marketplace-pat` (account `apliteni.1password.com`) | Fine-grained PAT with `Administration: Read` on every apliteni-org targeted repo. Used by the daily Action. |
| `TRAFFIC_PAT_LESSLY` | 1Password: `Employee/claude-marketplace-pat-lessly` | Fine-grained PAT with `Administration: Read` on `lessly-hub/claude-lessly-plugin`. The script dispatches by repo owner: `lessly-hub/*` uses this PAT, everything else uses `TRAFFIC_PAT`. Optional — when unset, the script falls back to `TRAFFIC_PAT` (which 404s for foreign-org repos). |
| `POSTHOG_API_KEY` | 1Password: `Employee/posthog-apliteni-project-token` | Project ingest key (`phc_…`). Public-by-design — embedded in the plugin hook script too. |
| `POSTHOG_HOST` | Plain string `https://eu.posthog.com` | PostHog Cloud EU base URL. |

Set with `gh secret set <NAME> --repo apliteni/claude-marketplace`. Values flow from 1Password — `op read "op://Employee/<item>/password" --account apliteni.1password.com | gh secret set <NAME> --repo apliteni/claude-marketplace`.

## Phase 1 — add a new repo to traffic ingest

The Action reads the plugin list from `.claude-plugin/marketplace.json` plus the marketplace repo itself. To start tracking a new plugin:

1. Add the plugin entry to `marketplace.json` (the existing CI catches missing fields).
2. Ensure `TRAFFIC_PAT` (or `TRAFFIC_PAT_LESSLY` for `lessly-hub/*`) has `Administration: Read` on the new repo. For a third org, see [Cross-org repos (multi-PAT)](#cross-org-repos-multi-pat) below.
3. Merge. Next 09:00 UTC cron picks it up. Manual trigger: `gh workflow run "Traffic telemetry" --repo apliteni/claude-marketplace --ref main`.

## Phase 2 — add the SessionStart hook to a new plugin

Currently shipped only in `claude-apliteni-plugin`. To port to `claude-compliance-plugin` or `claude-lessly-plugin`:

1. Copy two files from `claude-apliteni-plugin` into the target plugin repo at the same paths:
   - `hooks/hooks.json`
   - `hooks/session-start-telemetry.mjs`
2. In the copied `hooks/session-start-telemetry.mjs`, no per-plugin changes are needed — the script reads its identity from `${CLAUDE_PLUGIN_ROOT}/.claude-plugin/plugin.json` at runtime, so `plugin` and `plugin_version` in PostHog events come out correct automatically.
3. Add a "Telemetry" section to the plugin's README. Mirror the disclosure used in `claude-apliteni-plugin/README.md` — what's collected, what isn't, and the `APLITENI_PLUGIN_TELEMETRY=off` opt-out.
4. Smoke-test locally before merging:
   ```bash
   TMPDIR=$(mktemp -d)
   HOME=$TMPDIR CLAUDE_PLUGIN_ROOT=$(pwd) node hooks/session-start-telemetry.mjs
   ls -la $TMPDIR/.config/apliteni-plugin/   # install-id + dau-stamp should appear
   rm -rf $TMPDIR
   ```
5. Open the PR. After merge, semantic-release cuts a new plugin version and users get the hook on their next session start.

Verify events land in PostHog:

```
SELECT event, properties.plugin AS plugin, count() AS n
FROM events
WHERE event = 'plugin_install_first_run' AND properties.plugin = '<new-plugin-name>'
GROUP BY event, plugin
```

## Cross-org repos (multi-PAT)

A single fine-grained PAT can only target repos in one GitHub org. Today the script handles two orgs: `apliteni/*` (via `TRAFFIC_PAT`) and `lessly-hub/*` (via `TRAFFIC_PAT_LESSLY`). Dispatch is in `scripts/ingest-traffic.mjs`:

```js
function patFor(repo) {
  return repo.startsWith('lessly-hub/') ? TRAFFIC_PAT_LESSLY : TRAFFIC_PAT
}
```

To add a third org (e.g. a future `<other-org>/<plugin-repo>` in `marketplace.json`): mint a PAT in that org with `Administration: Read`, store as `TRAFFIC_PAT_<ORG>` repo secret, extend `patFor()` with a new branch, and add the env mapping in `.github/workflows/traffic-telemetry.yml`.

When `TRAFFIC_PAT_LESSLY` is unset, the script falls back to `TRAFFIC_PAT` — which 404s for foreign-org repos but doesn't break anything else (per the [#9 fix](https://github.com/apliteni/claude-marketplace/pull/9), partial success goes green).

## Switching the PostHog MCP to the Apliteni project

The PostHog MCP defaults to whatever org is active at session start (usually Lessly's). To query telemetry events:

```
switch-organization { orgId: "019ebc2d-2e69-0000-4771-7e5b2a5fed46" }
switch-project { projectId: 200602 }
```

After switching, every `execute-sql` / `query-*` call runs against the Apliteni project. Switch back when done if other agents in the session need the Lessly project.

## Privacy / GDPR notes

- The Phase 2 `distinct_id` is a UUID generated locally on first run via `randomUUID()`. It is **not** derived from anything on the user's machine.
- No PII fields are sent. Properties sent: `plugin`, `plugin_version`, `os`, `arch`.
- The opt-out env var (`APLITENI_PLUGIN_TELEMETRY=off`) is checked before any work happens — set, the script exits 0 immediately and writes nothing.
- Disclosure lives in each plugin's README under "Telemetry". When porting the hook, port the README section verbatim.

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| Daily Action red, log says `GET .../traffic/clones -> 404` for a non-Lessly repo | `TRAFFIC_PAT` missing `Administration: Read` on that repo. Re-mint PAT with the repo added. |
| `Done. sent=0 failed=N` in Action log | All requests failed — usually PostHog key revoked or wrong host. Re-check the three secrets. |
| New plugin events not visible in PostHog | (1) plugin hasn't been released yet via semantic-release; (2) users on opt-out (`APLITENI_PLUGIN_TELEMETRY=off`); (3) plugin's `CLAUDE_PLUGIN_ROOT` env not set — verify hook ran by checking `~/.config/apliteni-plugin/install-id` exists. |
| Same `repo`/`date` row appears multiple times in queries | Expected — every run sends the day with a unique `$insert_id`. Collapse with `max(count) GROUP BY repo, date` at query time. |
