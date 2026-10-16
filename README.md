# Front Yard Signs

One-page Astro site for Front Yard Signs (lawn displays in Angus, Ontario).

## Develop

```bash
npm install
npm run dev
```

## Edit content

- `src/data/site.ts`: phone, email, social links, and where orders go (`formEndpoint` or `ownerEmail`).
- `src/components/`: one file per page section. `OrderForm.astro` + `src/scripts/order.ts` handle the order form.
- `src/styles/global.css`: all styles.

Until `formEndpoint` or `ownerEmail` is set, the order form runs in preview mode and sends nothing.

## Deploy

Pushes to `main` build and deploy to GitHub Pages via `.github/workflows/deploy.yml`
(enable Pages with source "GitHub Actions" in repo settings). `PUBLIC_FORM_ENDPOINT` can be set as a repo variable.
