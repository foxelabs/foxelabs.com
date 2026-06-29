# Foxe Labs

Marketing site for [foxelabs.com](https://foxelabs.com). Static site built with Astro 5 and Tailwind CSS v4.

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:4321.

## Build

```bash
npm run build
npm run preview
```

Output goes to `dist/`.

## Deploy

- **Vercel**: connect the repo; `vercel.json` handles the rest.
- **GitHub Pages**: the workflow in `.github/workflows/deploy.yml` builds and publishes on push to `main`.
