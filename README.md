# RoiQR

A self-hostable Thai/English QR code generator. Create one QR code or generate a batch from Excel/CSV. Original application code is available under the [MIT license](LICENSE).

## Features

- Eleven content types: URL, text, JSON, PromptPay, email, phone, SMS, Wi-Fi, vCard, location and calendar events.
- Batch input from `.xlsx`, `.xls`, `.csv` or pasted spreadsheet cells.
- Custom colors, shapes, logo and captions; scan testing before download.
- PNG/SVG export, batch ZIP and printable PDF sheets.
- Browser-side spreadsheet parsing and QR rendering; optional server API.
- Thai/English interface, light/dark themes and a service worker.

## Development

Requires Node.js 22 and pnpm 10.1.0.

```sh
corepack enable
corepack prepare pnpm@10.1.0 --activate
pnpm install --frozen-lockfile
pnpm db:generate
pnpm dev
```

Open <http://localhost:3000>. No database, account or API key is required. You may copy `.env.example` to `.env` for local settings; leave the database values empty unless you configure your own PostgreSQL instance.

```sh
pnpm typecheck
pnpm test
pnpm lint
pnpm build
pnpm start
```

The `test:e2e` script uses Playwright. Browser binaries must already be installed if you run those tests.

## Docker / Coolify

```sh
docker build --build-arg NEXT_PUBLIC_SITE_URL=https://example.com -t roiqr:local .
docker run --rm --memory=2g -p 3000:3000 roiqr:local
```

Replace `https://example.com` with your own origin. `NEXT_PUBLIC_SITE_URL` is embedded during the build; changing only a runtime environment variable will not update all generated metadata. The default origin is `http://localhost:3000`.

For Coolify, select this repository, the Dockerfile build pack and internal port `3000`. Configure your own domain and HTTPS. A 2 GiB runtime limit leaves room around the image's 1.5 GiB Node.js heap; builds may need more memory. Use `127.0.0.1` as the HTTP health-check host, port `3000`, path `/`.

The `.dockerignore` excludes local configuration, Git metadata and development artifacts from the build context. Configure production secrets in your deployment system rather than committing them.

## Configuration

| Variable | Default | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | Your public origin; set before building. |
| `DATABASE_URL` | empty | Optional PostgreSQL persistence. |
| `DIRECT_URL` | empty | Direct PostgreSQL connection used by Prisma commands when a database is configured. |
| `RATE_LIMIT_WINDOW_MS` | `60000` | API rate-limit window. |
| `RATE_LIMIT_MAX_REQUESTS` | `60` | Requests per window and client key. |
| `BATCH_MAX_QR` | `500` | Server generation API batch cap. |

Inspect `prisma/schema.prisma` before provisioning an optional database. No production data, database export, credentials or deployment account configuration is included.

## Data and deployment notes

The browser UI generates QR images on the user's device. The queue endpoint coordinates batch jobs without receiving spreadsheet contents. Programmatic calls to `POST /api/generate` send their payload to your server. When a database is configured, the API can persist usage records and rate-limit keys. Hosting providers and reverse proxies can also retain request logs. Review the included terms/privacy text for your deployment before publishing your own service.

`public/llms.txt` and `public/llms-full.txt` contain `https://example.com` placeholders. Replace these when deploying your own site. Demonstration spreadsheet rows and test phone/payment identifiers are synthetic examples; do not send real payments to sample identifiers.

## Security

See [SECURITY.md](SECURITY.md) for the initial dependency audit and reporting instructions. The initial public snapshot preserves the existing dependency versions; passing application tests is not a security certification.

## Maintainer

Maintained by [Petagorus](https://github.com/Petagorus).

## License

[MIT](LICENSE) for original application code. See [third-party notices](THIRD_PARTY_NOTICES.md) for dependencies and the bundled font.
