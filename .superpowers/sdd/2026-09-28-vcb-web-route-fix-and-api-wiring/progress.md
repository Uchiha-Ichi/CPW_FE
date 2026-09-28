# SDD ledger — plan: docs/superpowers/plans/2026-09-28-vcb-web-route-fix-and-api-wiring.md

## Pre-flight scan
Scanning plan for conflicts against constraints...
- Task 1: Fix routing structure, remove next-intl -> Matches spec to remove next-intl and build root + `(site)` layouts.
- Task 2: API client scaffolding — generate types, shared fetch helper -> Needs vcb-api running to hit docs-json. Matches spec.
- Task 3: pages API wrapper, wire Home's content-managed sections -> Needs fetchPublicList, uses generated schema.
- Task 4: network/products API wrappers and Home sections -> Renders list from network, no map. Matches spec constraint.
- Task 5: Wire careers to jobs API -> 404 handled on not found.
- Task 6: Wire news to news API
- Task 7: Wire about to pages and photos APIs

Scan clean.

## Task 1
Status: COMPLETED
Brief: Fix routing structure, remove next-intl

## Task 2
Status: COMPLETED
Brief: API client scaffolding — generate types, shared fetch helper

## Task 3
Status: COMPLETED
Brief: pages API wrapper, wire Home's content-managed sections

## Task 4
Status: COMPLETED
Brief: network/products API wrappers and Home sections

## Task 5
Status: COMPLETED
Brief: Wire /careers and /careers/[slug] to the jobs API

## Task 6
Status: COMPLETED
Brief: Wire /news to the news API

## Task 7
Status: IN_PROGRESS
Brief: Wire /about to pages and photos APIs
