# Aegis Docs

This directory contains the Aegis project documentation website.

> [!WARNING]
> Do not touch the `docs` branch. The workflow will automatically update the files for the website.

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

## Building

Build the documentation site:

```bash
npm run build
```

## Deployment

To deploy:

```bash
npm run deploy 
```

> [!NOTE]
> The deployment will automatically build before publishing to the docs branch.

## Project Structure
- `/app` - Contains pages and API routes for Next.js
- `/components` - Reusable React components
- `/config` - Contains configuration files
- `/content` - Documentation pages
- `/public` - Static assets
- `/lib` - Helper functions and utilities
- `./mdx-components.tsx` - Custom components and styles to use with MDX files
