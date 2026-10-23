# Japanese Learning OS

A VitePress Japanese learning site and local-first personal study dashboard. Learning content lives in `docs/`; canonical course and learner data live in `Data/`. Read [SYSTEM/Manifest.md](SYSTEM/Manifest.md) for the operating contract and [SYSTEM/Data_Model.md](SYSTEM/Data_Model.md) for data ownership.

## Run locally

Requires Node.js 22 and pnpm 10.

```sh
pnpm install --frozen-lockfile
pnpm docs:dev
```

## Validate and build

```sh
pnpm data:validate
pnpm docs:build
```

## Review scheduling

```sh
pnpm srs:due
pnpm srs:grade -- srstai_001 4
```

The website keeps browser activity in local storage. Use the dashboard's JSON export/import to move that state between browsers. The CLI scheduler updates `Data/srs_queue.json`. No account service or automatic cloud synchronization is configured.
