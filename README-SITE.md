# darpan-chapagain.com.np

Source for my personal site. Built with [Astro](https://astro.build), hosted on Cloudflare Workers (static assets).

## Everyday edits

| What | Where |
| --- | --- |
| Name, links, roles, education, toolkit, principles, journey levels | `src/data/site.ts` |
| Project write-ups | `README.md`, then run `npm run content` |
| Blog posts and book reviews | `src/content/writing/` (copy `_template.md`) |

## Commands

```bash
npm install
npm run dev       # local preview at http://localhost:4321
npm run build     # static site in ./dist
npx wrangler deploy   # upload ./dist to Cloudflare
```

## Deploying on Cloudflare

Workers & Pages → Create → Import a repository → pick this repo.
Build command: `npm run build`. Deploy command: `npx wrangler deploy`.
Then add the custom domain `darpan-chapagain.com.np` under the Worker's Settings → Domains & Routes.
