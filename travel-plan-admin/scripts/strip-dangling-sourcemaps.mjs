import { readdir, readFile, writeFile, access } from 'node:fs/promises';
import { join, dirname, resolve } from 'node:path';

// lucide-vue-next 0.575.0 ships ~1700 icon modules but only ~1200 of the
// .js.map files their `//# sourceMappingURL=` comments point at. Vite extracts
// sourcemaps unconditionally for every file it loads from disk, so loading the
// icon barrel in dev logs an ENOENT warning per missing map — hundreds of lines
// of noise on the first page load, with no effect on the running app.
//
// Neither optimizeDeps nor ssr.external stops it (Vite's extraction happens in
// loadAndTransform, with no flag to disable), so drop the dangling comments.
// Maps that actually exist are left alone, so real debugging still works.
const TARGETS = ['node_modules/lucide-vue-next/dist/esm'];

const SOURCEMAP_COMMENT = /\n?\/\/# sourceMappingURL=(.+?)\s*$/;

async function exists(path) {
    try {
        await access(path);
        return true;
    } catch {
        return false;
    }
}

async function* walk(dir) {
    let entries;
    try {
        entries = await readdir(dir, { withFileTypes: true });
    } catch {
        return; // package not installed — nothing to do
    }
    for (const entry of entries) {
        const path = join(dir, entry.name);
        if (entry.isDirectory()) yield* walk(path);
        else if (entry.name.endsWith('.js')) yield path;
    }
}

let stripped = 0;
let kept = 0;

for (const target of TARGETS) {
    for await (const file of walk(resolve(target))) {
        const code = await readFile(file, 'utf-8');
        const match = code.match(SOURCEMAP_COMMENT);
        if (!match) continue;

        if (await exists(resolve(dirname(file), match[1]))) {
            kept++;
            continue;
        }

        await writeFile(file, code.replace(SOURCEMAP_COMMENT, '\n'), 'utf-8');
        stripped++;
    }
}

if (stripped > 0) {
    console.log(`stripped ${stripped} dangling sourceMappingURL comment(s); left ${kept} working map reference(s) intact`);
}
