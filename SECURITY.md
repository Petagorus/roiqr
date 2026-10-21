# Security

## Initial dependency audit

On 2026-10-21, `pnpm audit` of the initial lockfile reported 35 advisories: 4 critical, 13 high, 15 moderate and 3 low, across production and development dependencies. This public export keeps those existing versions; it is not a dependency-hardening release. Run `pnpm audit` and `pnpm audit --prod` in your own checkout for current results and dependency paths before hosting it.

The application's release checks cover removal of original deployment identifiers, common secret patterns, bundled file metadata and old Git history. They do not prove that the application is free of every vulnerability or that every downstream deployment is configured safely.

## Reporting

Do not post credentials, personal information or exploit details in public issues. Use GitHub's private vulnerability reporting feature if it is enabled for this repository. If it is unavailable, open an issue requesting a private reporting channel without including sensitive details.
