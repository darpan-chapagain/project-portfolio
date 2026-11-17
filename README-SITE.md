# darpan-chapagain.com.np

Source for my personal site. Built with [Astro](https://astro.build), hosted on Cloudflare Workers (static assets).

## Everyday edits

| What | Where |
| --- | --- |
| Name, links, roles, education, toolkit, How I build board, journey levels | `src/data/site.ts` |
| Project write-ups | `README.md`, then run `npm run content` |
| Blog posts and book reviews | `src/content/writing/` (copy `_template.md`) |
| The game at /play: scenes, lines, bosses | `src/data/game.ts` (levels themselves come from `levels` in `src/data/site.ts`) |

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

## The game

`/play` is a small pixel game drawn on a canvas, with no image files. It walks through `levels` in `src/data/site.ts` in order and looks up each level's script in `src/data/game.ts` by its `id`.

- Change a line: edit the `lines` in that level's `beats`.
- Add a level: add it to `levels` in `site.ts` with a new `id`, then add a matching entry in `game.ts`. Without an entry it still appears as a short street with one building and its card.
- The player and the family are drawn in `scripts/sprites/heroes.py` and exported to `src/game/heroes.ts`.
- The engine lives in `src/game/` (`engine.ts` for play, `scenery.ts` for drawing, `art.ts` for people and the pixel font). It reads the site's colours, so it follows the light and dark theme.
- Add `?debug` to the URL for a `__game` helper in the console (state and teleport).

