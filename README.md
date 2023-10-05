# Qwik $Path

Qwik Path is a vite plugin that assumes route paths based on the [routing convention of Qwik City](https://qwik.builder.io/docs/routing/).

## Installation

```bash
pnpm add qwik-path@latest --save-dev
```

```bash
yarn add qwik-path@latest --dev
```

```bash
npm install qwik-path@latest --save-dev
```

## Using $Path

`vite.config.ts`

```ts
import { defineConfig } from "vite";

import { qwikVite } from "@builder.io/qwik/optimizer";
import { qwikCity } from "@builder.io/qwik-city/vite";

import { qwikPath } from "qwik-path/vite";

export default defineConfig(async (env) => {
    return {
        ...
        plugins: [
            ...
            qwikCity(),
            qwikVite(),
            // ---
            qwikPath({
              srcDir: "src/routes", // routes directory
              outDir: "src/modules/typings/routes", // the destination folder of the produced types (must be within the reach of tsconfig.json!)
            }),
        ],
        ...
    };
});

```

Then based on the routing convention, routes' paths can be asserted:

```tsx
import { component$ } from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";
import { $path } from "qwik-path";

export default component(() => {
  return (
    <div>
      <Link
        href={$path("/blog/:lang/:slug", {
          lang: "en",
          slug: "qwik-path-inpired-by-remix-routes",
        })}
      />
    </div>
  );
});
```

## Aknowlegement

This project was inpspired by [Qwik Labs](https://qwik.builder.io/docs/labs/)' `Typed Routes` and [@yesmeck](https://github.com/yesmeck)'s `Remix Routes`. It combines and improves upon these.

## Contributing

See [`CONTRIBUTING`](https://github.com/ueuiedev/qwik-path/blob/master/CONTRIBUTING.md)...
