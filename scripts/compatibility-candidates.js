// Resolves which widget/backend combinations the compatibility workflow tests:
// the last COUNT releases of each backend that are not yet listed for the
// widget version in compatibility.json.
//
// Environment:
//   WIDGET_VERSION  widget version to test, "latest" (default) = npm latest dist-tag,
//                   "source" = the checked out source (all candidates, nothing skipped)
//   COUNT           number of backend releases per platform (default 3)
//   PROJECTS        comma separated e2e projects (default "headwaione,openwebui")
//   INCLUDE_TESTED  "true" to also test combinations already in compatibility.json
//   GITHUB_TOKEN    optional, raises the GitHub API rate limit
//   GITLAB_REGISTRY_USER / GITLAB_REGISTRY_TOKEN  required for headwaione
//
// Prints a JSON object { widgetVersion, source, include: [{ project, image, version, required }] }.
// "required" marks the newest release of each backend; on pull requests these
// combinations must pass.
import { readFileSync } from 'node:fs';
import { PLATFORM_FIELDS, compareVersions, readCompatibility } from './compatibility-lib.js';

const WIDGET_VERSION = process.env.WIDGET_VERSION || 'latest';
const COUNT = Number(process.env.COUNT || 3);
const PROJECTS = (process.env.PROJECTS || 'headwaione,openwebui')
  .split(',')
  .map((project) => project.trim())
  .filter(Boolean);
const SOURCE = WIDGET_VERSION === 'source';
// The source isn't published yet, so its results are never in compatibility.json
const INCLUDE_TESTED = SOURCE || process.env.INCLUDE_TESTED === 'true';

const HEADWAI_REGISTRY = 'registry.gitlab.headwai.org';
const HEADWAI_REPOSITORY = 'headwai/headwai-open-webui';
// Release tags only, e.g. 0.11.4-2 (branch builds like upgrade-to-0.12.3 are ignored)
const HEADWAI_RELEASE_TAG = /^\d+\.\d+\.\d+-\d+$/;

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

const headwAIONEReleases = async () => {
  const { GITLAB_REGISTRY_USER, GITLAB_REGISTRY_TOKEN } = process.env;
  if (!GITLAB_REGISTRY_USER || !GITLAB_REGISTRY_TOKEN) {
    throw new Error('GITLAB_REGISTRY_USER and GITLAB_REGISTRY_TOKEN are required for headwaione');
  }
  const basic = Buffer.from(`${GITLAB_REGISTRY_USER}:${GITLAB_REGISTRY_TOKEN}`).toString('base64');
  const { token } = await fetchJson(
    `https://gitlab.headwai.org/jwt/auth?service=container_registry&scope=repository:${HEADWAI_REPOSITORY}:pull`,
    { headers: { Authorization: `Basic ${basic}` } },
  );
  const { tags } = await fetchJson(
    `https://${HEADWAI_REGISTRY}/v2/${HEADWAI_REPOSITORY}/tags/list`,
    { headers: { Authorization: `Bearer ${token}` } },
  );

  // Newest build of each of the last COUNT releases, e.g. 0.11.4-2 for 0.11.4
  const newestBuilds = new Map();
  for (const tag of tags.filter((tag) => HEADWAI_RELEASE_TAG.test(tag))) {
    const release = tag.split('-')[0];
    const current = newestBuilds.get(release);
    if (!current || compareVersions(tag, current) > 0) newestBuilds.set(release, tag);
  }
  return [...newestBuilds.values()]
    .sort((a, b) => compareVersions(b, a))
    .slice(0, COUNT)
    .map((tag, index) => ({
      project: 'headwaione',
      image: `${HEADWAI_REGISTRY}/${HEADWAI_REPOSITORY}:${tag}`,
      version: `v${tag}`,
      required: index === 0,
    }));
};

const RESOLVERS = { headwaione: headwAIONEReleases, openwebui: openWebUIReleases };

const widgetVersion = await resolveWidgetVersion();
const entry = readCompatibility().find((e) => e.widgetVersion === widgetVersion);

const include = [];
for (const project of PROJECTS) {
  if (!RESOLVERS[project]) throw new Error(`Unknown project "${project}"`);
  const tested = entry?.[PLATFORM_FIELDS[project]] ?? [];
  for (const candidate of await RESOLVERS[project]()) {
    if (INCLUDE_TESTED || !tested.includes(candidate.version)) include.push(candidate);
  }
}

console.log(JSON.stringify({ widgetVersion, source: SOURCE, include }));
