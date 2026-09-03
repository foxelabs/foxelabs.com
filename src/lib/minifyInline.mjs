// Astro ships `is:inline` scripts verbatim, so every page carries its scripts
// unminified. This integration walks the built HTML once, after the build, and
// minifies each bare inline <script> with esbuild (already a dependency via
// Vite). Tags with attributes — type="application/ld+json", src, module — are
// left untouched: only the attribute-less inline scripts we author are ours to
// rewrite.
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { transform } from 'esbuild';

async function htmlFiles(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await htmlFiles(path)));
    else if (entry.name.endsWith('.html')) out.push(path);
  }
  return out;
}

export default function minifyInlineScripts() {
  return {
    name: 'minify-inline-scripts',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const root = fileURLToPath(dir);
        let before = 0;
        let after = 0;
        for (const file of await htmlFiles(root)) {
          const html = await readFile(file, 'utf8');
          const chunks = [];
          const pattern = /<script>([\s\S]*?)<\/script>/g;
          let cursor = 0;
          let changed = false;
          for (let match; (match = pattern.exec(html)); ) {
            const code = match[1];
            before += code.length;
            const { code: min } = await transform(code, { minify: true });
            after += min.length;
            chunks.push(html.slice(cursor, match.index), '<script>', min.trimEnd(), '</script>');
            cursor = match.index + match[0].length;
            changed = true;
          }
          if (!changed) continue;
          chunks.push(html.slice(cursor));
          await writeFile(file, chunks.join(''));
        }
        logger.info(
          `inline scripts: ${(before / 1024).toFixed(1)}KB -> ${(after / 1024).toFixed(1)}KB`
        );
      },
    },
  };
}
