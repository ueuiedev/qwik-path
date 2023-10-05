/* eslint-disable no-loops/no-loops */

import { rm, stat, writeFile } from "node:fs/promises";
import { join, relative, sep as platformSep } from "node:path";

import { render } from "ejs";
import { glob } from "glob";
import { type Plugin } from "node_modules/vite";
import { sep } from "path/posix";

import { template } from "./template";

export type QwikPathConfig = {
  outDir: string;
  srcDir: string; // relative
};

export type QwikPathOptions = {
  outDir?: string;
  srcDir?: string;
};

/**
 * Vite Plugin for Qwik Framework to generate typed routes.
 *
 * @param {QwikPathConfig} config - Configuration options.
 * @returns {Plugin} Vite plugin object.
 */
export function qwikPath(options?: QwikPathOptions): Plugin {
  let srcDir = assertionsAboutSrcDir(options?.srcDir, "src/routes");
  let outDir = assertionsAboutOutDir(options?.outDir, "src");

  srcDir = join(process.cwd(), srcDir);
  outDir = join(process.cwd(), outDir);

  return {
    name: "vite-plugin-qwik-path",
    async watchChange(id, change) {
      // TODO replace with in-place granular edits.

      if (change.event === "create" || change.event === "delete") {
        await deleteFile(outDir);
        await createFile(srcDir, outDir);
      }
    },
    async buildStart() {
      await deleteFile(outDir);
      await createFile(srcDir, outDir);
    },
  };
}

// async function inplaceEdition(
//   changeEvent: "create" | "update" | "delete",
//   srcDir: string,
//   outDir: string,
//   pathname: string,
// ) {
//   if (changeEvent === "create") {
//     await addRoutes(outDir, pathname);
//   }
//   if (changeEvent === "delete") {
//     await delRoutes(outDir, pathname);
//   }
// }

async function deleteFile(outDir: string) {
  const filePath = join(outDir, QWIK_PATH_FILE_NAME);

  // ---
  const filePathStat = await stat(filePath).catch(() => {
    return null;
  });

  // ---
  if (filePathStat !== null && filePathStat.isFile()) {
    await rm(filePath, { force: true });
  }
}

async function createFile(srcDir: string, outDir: string) {
  const filePath = join(outDir, QWIK_PATH_FILE_NAME);

  const routes = await glob(
    norm(join(srcDir, "**/*/index.{js,jsx,ts,tsx,md,mdx}")),
    { absolute: true },
  ).then((globs) =>
    globs.map((glob) => {
      const pathname = relative(srcDir, glob);
      const params = [];
      let path =
        "/" +
        norm(pathname)
          .split("/")
          .filter((seg) => !/\(.+\)/g.test(seg))
          .join("/")
          .split(sep)
          .slice(0, -1)
          .join(sep);

      let paramMatch: RegExpExecArray | null;
      const regex = /\[((\.{3})?([A-Za-z]+))]/g;

      while ((paramMatch = regex.exec(pathname))) {
        const [match, , dots, name] = paramMatch;
        const isSplash = !!dots;

        params.push(isSplash ? "*" : name);

        if (isSplash) {
          path = path.replace(match, `*`);
        } else {
          path = path.replace(match, `:${name}`);
        }
      }

      return {
        path: path,
        params: params,
        queries: {
          module: norm(relative(outDir, glob))
            .split(sep)
            .slice(0, -1)
            .join(sep),
        },
      };
    }),
  );

  await writeFile(
    filePath,
    await render(
      template,
      {
        module: "qwik-path",
        routes: routes,
      },
      { async: true },
    ),
    { encoding: "utf8" },
  );
}

/* -------------------------------------------------------------------------- */
/*                           Type File Gen Utilities                          */
/* -------------------------------------------------------------------------- */
// async function addRoutes(outDir: string, pathname: string) {}

// async function delRoutes(outDir: string, pathname: string) {}

/* -------------------------------------------------------------------------- */
/*                                 Assertions                                 */
/* -------------------------------------------------------------------------- */
function assertionsAboutOutDir(
  rawInput: string | undefined,
  fallback: string,
): string {
  return rawInput ?? fallback;
}

function assertionsAboutSrcDir(
  rawInput: string | undefined,
  fallback: string,
): string {
  return rawInput ?? fallback;
}

/* -------------------------------------------------------------------------- */
/*                                  Constants                                 */
/* -------------------------------------------------------------------------- */
const QWIK_PATH_FILE_NAME = "qwik.path.d.ts";

function norm(path: string) {
  return path.replaceAll(platformSep, sep);
}
