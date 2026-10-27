// Adds passed e2e results to compatibility.json.
//
// Usage: node scripts/compatibility-add-results.js <widgetVersion> <resultsDir>
// Each *.json file in resultsDir is { "project": "openwebui", "version": "v0.12.3" }.
// A missing widget entry is created with the supportedFeatures of the newest
// older entry; review them, they are maintained by hand.
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import {
  PLATFORM_FIELDS,
  compareVersions,
  readCompatibility,
  writeCompatibility,
} from './compatibility-lib.js';

const [widgetVersion, resultsDir] = process.argv.slice(2);
if (!widgetVersion || !resultsDir) {
  console.error('Usage: node scripts/compatibility-add-results.js <widgetVersion> <resultsDir>');
  process.exit(1);
}

const results = existsSync(resultsDir)
  ? readdirSync(resultsDir)
      .filter((file) => file.endsWith('.json'))
      .map((file) => JSON.parse(readFileSync(join(resultsDir, file), 'utf8')))
  : [];

const entries = readCompatibility();
let entry = entries.find((e) => e.widgetVersion === widgetVersion);

if (!entry && results.length > 0) {
  const previous = entries
    .filter((e) => compareVersions(e.widgetVersion, widgetVersion) < 0)
    .sort((a, b) => compareVersions(b.widgetVersion, a.widgetVersion))[0];
  entry = { widgetVersion, supportedFeatures: [...(previous?.supportedFeatures ?? [])] };
  entries.push(entry);
  console.log(
    `Created entry for ${widgetVersion} with the supportedFeatures of ${previous?.widgetVersion ?? 'nothing'}`,
  );
}

for (const { project, version } of results) {
  const field = PLATFORM_FIELDS[project];
  if (!field) throw new Error(`Unknown project "${project}" in results`);
  const versions = new Set([...(entry[field] ?? []), version]);
  entry[field] = [...versions].sort(compareVersions);
  console.log(`Added ${project} ${version} to ${widgetVersion}`);
}

writeCompatibility(entries);
