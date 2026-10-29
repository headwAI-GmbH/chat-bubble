// Shared helpers for the compatibility scripts.
import { readFileSync, writeFileSync } from 'node:fs';

export const COMPATIBILITY_FILE = 'compatibility.json';

// e2e project name -> field in compatibility.json
export const PLATFORM_FIELDS = {
  openwebui: 'openWebUIVersions',
};

// Compares versions like "8.4.0" or "v0.12.3" numerically
export const compareVersions = (a, b) => {
  const pa = a.replace(/^v/, '').split(/[.-]/).map(Number);
  const pb = b.replace(/^v/, '').split(/[.-]/).map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    if ((pa[i] || 0) !== (pb[i] || 0)) return (pa[i] || 0) - (pb[i] || 0);
  }
  return 0;
};

export const readCompatibility = () =>
  JSON.parse(readFileSync(COMPATIBILITY_FILE, 'utf8'));

// Newest widget version first, keys in a fixed order
export const writeCompatibility = (entries) => {
  const normalized = [...entries]
    .sort((a, b) => compareVersions(b.widgetVersion, a.widgetVersion))
    .map(({ widgetVersion, openWebUIVersions, supportedFeatures }) => ({
      widgetVersion,
      ...(openWebUIVersions && { openWebUIVersions }),
      supportedFeatures,
    }));
  writeFileSync(COMPATIBILITY_FILE, `${JSON.stringify(normalized, null, 2)}\n`);
};
