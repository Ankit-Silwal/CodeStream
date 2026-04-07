# `@repo/eslint-config`

Shared ESLint config package for the CodeStream monorepo.

## Available Configs

- `@repo/eslint-config/base`
- `@repo/eslint-config/next`
- `@repo/eslint-config/react-internal`

These configs are implemented in:

- `base.js`
- `next.js`
- `react-internal.js`

## Usage

In an app/package ESLint config:

```js
import baseConfig from "@repo/eslint-config/base";

export default [
	...baseConfig,
];
```

For Next.js apps, use the Next config instead.

## Notes

- Keep repo-wide lint rules centralized here.
- Avoid app-specific overrides unless required by framework/runtime constraints.
