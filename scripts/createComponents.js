const {
  appendFileSync,
  readdirSync,
  readFileSync,
  truncateSync,
} = require('fs');
const { resolve } = require('path');

const deprecatedAttributes = require('./deprecatedAttributes.json');

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

truncateSync(dist, 0);

for (const path of getFiles(src)) {
  const result =
    /\/([a-z]\w+)\/materialicons(outlined|twotone)\/24px\.svg$/.exec(path);

  if (!result) {
    continue;
  }

  const { 1: name, 2: option, input } = result;

  const regexp = new RegExp(
    ` (?:${deprecatedAttributes.join('|')}|xmlns:xlink)="[\\w\\s#-./:]+"`,
    'g'
  );
  const svg = readFileSync(input, 'utf8')
    .replace(regexp, '')
    .replace(/([a-z]+)-([a-z])/g, (_, b, c) => b + c.toUpperCase())
    .replace(/\s*></, ' {...props}><');

  const fullName =
    name.split('_').reduce((prev, cur) => prev + capitalize(cur), '') +
    (option === 'twotone' ? 'TwoTone' : 'Outlined');

  const component = `export const ${fullName} = (props: React.SVGProps<SVGSVGElement>) => ${svg};
`;

  appendFileSync(dist, component);
}
