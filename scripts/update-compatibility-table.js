// Renders compatibility.json as a Markdown table into README.md between the
// compatibility markers. compatibility.json is maintained by hand: add a
// Open WebUI version only after the e2e tests passed against it.
//
// Usage: node scripts/update-compatibility-table.js [--check]
//   --check  exit with 1 if README.md is not up to date instead of writing it
import { readFileSync, writeFileSync } from 'node:fs';
import { compareVersions, readCompatibility } from './compatibility-lib.js';

const START = '<!-- compatibility:start -->';
const END = '<!-- compatibility:end -->';

const formatVersions = (versions) =>
  versions && versions.length > 0 ? versions.join(', ') : '–';

const entries = readCompatibility().sort(
  (a, b) => compareVersions(b.widgetVersion, a.widgetVersion),
);

const table = [
  '| Chat Bubble | HeadwAI ONE | Open WebUI |',
  '| --- | --- | --- |',
  ...entries.map(
    (entry) =>
      `| ${entry.widgetVersion} | ${formatVersions(entry.headwAIONEVersions)} | ${formatVersions(entry.openWebUIVersions)} |`,
  ),
].join('\n');

const readme = readFileSync('README.md', 'utf8');
const start = readme.indexOf(START);
const end = readme.indexOf(END);
if (start === -1 || end === -1 || end < start) {
  console.error(`README.md is missing the ${START} / ${END} markers`);
  process.exit(1);
}

const updated = `${readme.slice(0, start + START.length)}\n${table}\n${readme.slice(end)}`;

if (process.argv.includes('--check')) {
  if (updated !== readme) {
    console.error(
      'README.md compatibility table is out of date, run: npm run compatibility:table',
    );
    process.exit(1);
  }
  console.log('README.md compatibility table is up to date');
} else {
  writeFileSync('README.md', updated);
  console.log('README.md compatibility table updated');
}
