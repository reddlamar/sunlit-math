import fs from 'fs';
import path from 'path';

/**
 * Guards the dependency rules documented in docs/architecture.md:
 *  - ADP: no import cycles between source files.
 *  - SDP: dependencies point toward more stable layers. A layer may only import the
 *    layers listed for it, so `game/` never reaches up into audio, settings or UI.
 */
const SRC = __dirname;

const ALLOWED_LAYER_IMPORTS: Record<string, string[]> = {
  types: [],
  utils: [],
  theme: ['types'],
  game: ['types', 'utils'],
  audio: [],
  storage: ['types', 'game'],
  settings: ['types', 'theme', 'audio'],
  purchases: ['types'],
  components: ['types', 'theme', 'game', 'audio', 'settings', 'purchases', 'storage', 'utils'],
  navigation: ['types', 'screens', 'settings'],
  screens: [
    'types',
    'theme',
    'game',
    'audio',
    'settings',
    'purchases',
    'storage',
    'components',
    'navigation',
  ],
};

function sourceFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return entry.name === 'testUtils' ? [] : sourceFiles(full);
    }
    return /\.tsx?$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name) ? [full] : [];
  });
}

function importsOf(file: string, files: Set<string>): string[] {
  const text = fs.readFileSync(file, 'utf8');
  return [...text.matchAll(/from '(\.[^']+)'/g)]
    .map(([, spec]) => path.resolve(path.dirname(file), spec))
    .flatMap((base) => [`${base}.ts`, `${base}.tsx`].filter((candidate) => files.has(candidate)));
}

const files = sourceFiles(SRC);
const fileSet = new Set(files);
const graph = new Map(files.map((file) => [file, importsOf(file, fileSet)]));
const layerOf = (file: string) => path.relative(SRC, file).split(path.sep)[0];
const rel = (file: string) => path.relative(SRC, file);

describe('architecture', () => {
  it('has no import cycles (ADP)', () => {
    const cycles: string[] = [];
    const done = new Set<string>();
    const visit = (file: string, stack: string[]) => {
      if (stack.includes(file)) {
        cycles.push([...stack.slice(stack.indexOf(file)), file].map(rel).join(' -> '));
        return;
      }
      if (done.has(file)) {
        return;
      }
      graph.get(file)!.forEach((next) => visit(next, [...stack, file]));
      done.add(file);
    };
    files.forEach((file) => visit(file, []));
    expect(cycles).toEqual([]);
  });

  it('only imports from layers a layer is allowed to depend on (SDP)', () => {
    const violations: string[] = [];
    for (const [file, imports] of graph) {
      const layer = layerOf(file);
      const allowed = ALLOWED_LAYER_IMPORTS[layer];
      if (!allowed) {
        continue; // root-level files, e.g. this test
      }
      for (const imported of imports) {
        const target = layerOf(imported);
        if (target !== layer && !allowed.includes(target)) {
          violations.push(`${rel(file)} -> ${rel(imported)}`);
        }
      }
    }
    expect(violations).toEqual([]);
  });
});
