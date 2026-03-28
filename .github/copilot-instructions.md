# Copilot Instructions

## Theme Token Sync Rule

`src/theme/cyanide-theme.scss` is the single source of truth for all design tokens.

`src/tailwind.css` (`@theme` block) must mirror every `--mat-sys-*` and `--app-*` token
under `--color-sys-*` / `--color-app-*` respectively.

**Any change to tokens in `cyanide-theme.scss` must include a corresponding update to
`src/tailwind.css` in the same response. No exceptions.**

### Token naming convention

| `cyanide-theme.scss` token  | `tailwind.css` entry          | Tailwind class example       |
| --------------------------- | ----------------------------- | ---------------------------- |
| `--mat-sys-primary`         | `--color-sys-primary`         | `bg-sys-primary`             |
| `--mat-sys-on-surface`      | `--color-sys-on-surface`      | `text-sys-on-surface`        |
| `--mat-sys-outline-variant` | `--color-sys-outline-variant` | `border-sys-outline-variant` |
| `--app-warning`             | `--color-app-warning`         | `bg-app-warning`             |

### Do not use hardcoded Tailwind color classes (e.g. `bg-gray-800`) for themed surfaces.

Always use `sys-*` or `app-*` token classes so colors stay in sync with the M3 theme.
