// Resolves which widget/Open WebUI combinations the compatibility workflow
// tests: the last COUNT Open WebUI releases that are not yet listed for the
// widget version in compatibility.json.
//
// Environment:
//   WIDGET_VERSION  widget version to test, "latest" (default) = npm latest dist-tag,
//                   "source" = the checked out source (all candidates, nothing skipped)
//   COUNT           number of Open WebUI releases (default 3)
//   INCLUDE_TESTED  "true" to also test combinations already in compatibility.json
//   GITHUB_TOKEN    optional, raises the GitHub API rate limit
//
// Prints a JSON object { widgetVersion, source, include: [{ project, image, version, required }] }.
// "required" marks the newest release; on pull requests this combination must
// pass.
import { readFileSync } from 'node:fs';
import { PLATFORM_FIELDS, compareVersions, readCompatibility } from './compatibility-lib.js';

const WIDGET_VERSION = process.env.WIDGET_VERSION || 'latest';
const COUNT = Number(process.env.COUNT || 3);
const SOURCE = WIDGET_VERSION === 'source';
// The source isn't published yet, so its results are never in compatibility.json
const INCLUDE_TESTED = SOURCE || process.env.INCLUDE_TESTED === 'true';

const fetchJson = async (url, options = {}) => {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`${url} returned HTTP ${response.status}`);
  }
  return response.json();
};

const resolveWidgetVersion = async () => {
  if (SOURCE) return JSON.parse(readFileSync('package.json', 'utf8')).version;
  if (WIDGET_VERSION !== 'latest') return WIDGET_VERSION;
  const packument = await fetchJson('https://registry.npmjs.org/@headwai/chat-bubble');
  return packument['dist-tags'].latest;
};

const openWebUIReleases = async () => {
  const headers = process.env.GITHUB_TOKEN
    ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
    : {};
  const releases = await fetchJson(
    'https://api.github.com/repos/open-webui/open-webui/releases?per_page=30',
    { headers },
  );
  return releases
    .filter((release) => !release.draft && !release.prerelease)
    .map((release) => release.tag_name)
    .sort((a, b) => compareVersions(b, a))
    .slice(0, COUNT)
    .map((tag, index) => ({
      project: 'openwebui',
      image: `ghcr.io/open-webui/open-webui:${tag}`,
      version: tag,
      required: index === 0,
    }));
};

const widgetVersion = await resolveWidgetVersion();
const entry = readCompatibility().find((e) => e.widgetVersion === widgetVersion);

const tested = entry?.[PLATFORM_FIELDS.openwebui] ?? [];
const include = (await openWebUIReleases()).filter(
  (candidate) => INCLUDE_TESTED || !tested.includes(candidate.version),
);

console.log(JSON.stringify({ widgetVersion, source: SOURCE, include }));
