# KiteAutomation Studio Proof of Work

This repository is a public Kite AI project build with source prompts, runnable code, verification commands, a Vercel deployment, and a rendered screenshot.

## Public Links

- GitHub repo: https://github.com/gnanam1990/kiteautomation-studio
- Live Vercel URL: https://kiteautomation-studio.vercel.app
- Deployment URL: https://kiteautomation-studio-9u5ha1hrl-gnanam1990s-projects.vercel.app
- Vercel inspect URL: https://vercel.com/gnanam1990s-projects/kiteautomation-studio/8WhhETiBLmXTQoCk2ueZ1FaL6gsC
- Vercel deployment ID: `dpl_8WhhETiBLmXTQoCk2ueZ1FaL6gsC`

## Commit Trail

The visible public history is intentionally split into meaningful work units:

1. `feat: build KiteAutomation Studio MVP`
2. `chore: add Vercel deployment config`
3. `docs: add deployment proof of work`

## Verification Evidence

Local verification completed before deployment:

```bash
pnpm install --frozen-lockfile=false
pnpm -r typecheck
pnpm -r lint
pnpm -r test
pnpm --filter @kiteautomation/web build
```

Vercel verification completed during deployment:

- Install command: `pnpm install --frozen-lockfile=false`
- Build command: `pnpm --filter @kiteautomation/web build`
- Output directory: `packages/web/dist`
- Ready state: `READY`

## Rendered Screenshot

![KiteAutomation Studio rendered app](./screenshot.jpg)

## Safety Notes

- This is a preview-safe Kite AI application.
- Risky, fund-moving, or wallet actions are clearly approval-first in the product copy and code.
- No official mainnet contract address is invented by this project.
