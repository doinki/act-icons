const { appendFileSync, readdirSync, readFileSync, rmSync } = require('fs');
const { resolve } = require('path');

const dist = resolve(__dirname, '..', 'src', 'index.tsx');
const src = resolve(__dirname, '..', 'src', 'material-design-icons', 'src');

/**
 * @param {string} str
 */
function capitalize(str) {
  const f = str.charAt(0).toUpperCase();
  const s = str.slice(1);

  return f + s;
}

/**
 * @param {string} path
 * @returns {IterableIterator<string>}
 */
function* getFiles(path) {
  const dirents = readdirSync(path, { withFileTypes: true });

  for (const dirent of dirents) {
    const p = resolve(path, dirent.name);

    if (dirent.isDirectory()) {
      yield* getFiles(p);
    } else {
      yield p;
    }
  }
}

rmSync(dist);

for (const path of getFiles(src)) {
  const result =
    /\/([a-z]\w+)\/materialicons(outlined|twotone)\/24px\.svg$/.exec(path);

  if (!result) {
    continue;
  }

  const { 1: name, 2: option, input } = result;

  const fullName =
    name.split('_').reduce((prev, cur) => prev + capitalize(cur), '') +
    (option === 'twotone' ? 'TwoTone' : 'Outlined');

  const svg = readFileSync(input, 'utf8').replace(/\w+:\w+="[\w#./:]+"/g, '');

  const component = `export const ${fullName} = (props: React.SVGProps<SVGSVGElement>) => ${svg};
`;

  appendFileSync(dist, component);
}
