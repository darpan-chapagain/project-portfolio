// Splits README.md project write-ups into one markdown file per project,
// so the site and the README stay in sync. Run: npm run content
import { readFileSync, writeFileSync, mkdirSync, readdirSync, unlinkSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'src/content/projects');
mkdirSync(outDir, { recursive: true });
for (const f of readdirSync(outDir)) if (f.endsWith('.md')) unlinkSync(join(outDir, f));

const readme = readFileSync(join(root, 'README.md'), 'utf8');

const slugify = (s) =>
  s.toLowerCase()
    .replace(/\(.*?\)/g, '')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const yamlStr = (s) => JSON.stringify(s.trim());

// Shorter names for the contact sheet on the home page.
const shortNames = {
  'digital-account-opening-and-compliance-automation-system': 'Digital account opening',
  'automated-banking-payroll-processing-system': 'Banking payroll',
  'enterprise-access-control-and-role-management-platform': 'Access control and roles',
  'multi-channel-banking-notification-system': 'SMS and Viber alerts',
  'banking-microsite-and-content-management-platform': 'Banking microsite and CMS',
  'learning-management-and-job-matching-platform': 'Hivelaya',
  'e-commerce-marketplace-integration-and-synchronization-platform': 'Marketplace sync',
  'large-scale-banking-data-migration-and-validation': 'Banking data migration',
  'fittracker': 'FitTracker',
  'himal-ash': 'Himal Ash',
  'real-time-pose-analysis-and-exercise-quality-tracking-system': 'Pose and form tracking',
  'high-performance-route-optimization': 'Route optimization on HPC',
};

let kind = null;
let order = 0;
const projects = [];

for (const block of readme.split(/\n(?=## |### )/)) {
  if (block.startsWith('## ')) {
    const h = block.split('\n')[0];
    kind = /Professional/i.test(h) ? 'professional' : /Independent|Academic/i.test(h) ? 'independent' : null;
    continue;
  }
  if (!block.startsWith('### ') || !kind) continue;

  const lines = block.replace(/\n---\s*$/m, '').split('\n');
  const title = lines[0].replace(/^###\s+/, '').trim();
  const body = lines.slice(1).join('\n').replace(/\n---\s*\n?$/, '').trim();

  const domain = body.match(/\*\*Domain:\*\*\s*(.+)/)?.[1] ?? '';
  const role = body.match(/\*\*Role:\*\*\s*(.+)/)?.[1] ?? '';
  const stack = (body.match(/\*\*Tech Stack:\*\*\s*(.+)/)?.[1] ?? '')
    .split(',').map((s) => s.trim()).filter(Boolean);

  const section = (name) => {
    const m = body.match(new RegExp(`\\*\\*${name}\\*\\*\\n([\\s\\S]*?)(?=\\n\\*\\*[A-Z][^*]+\\*\\*|$)`));
    return m ? m[1].trim() : '';
  };
  const problem = section('Problem');
  const results = section('Results').split('\n').map((l) => l.replace(/^-\s*/, '').trim()).filter(Boolean);
  const summary = problem.split(/(?<=\.)\s/)[0];

  // Body: turn **Section** headings into ## headings, drop the meta lines.
  const md = body
    .replace(/\*\*(Domain|Role|Tech Stack):\*\*.*\n?/g, '')
    .replace(/^\*\*([A-Z][^*]+)\*\*\s*$/gm, '## $1')
    .trim();

  const slug = slugify(title.split(':')[0]);
  const name = title.split(':')[0].trim();
  const tagline = title.includes(':') ? title.split(':').slice(1).join(':').trim() : '';

  projects.push(slug);
  const fm = [
    '---',
    `title: ${yamlStr(name)}`,
    `short: ${yamlStr(shortNames[slug] ?? name)}`,
    tagline ? `tagline: ${yamlStr(tagline)}` : null,
    `kind: ${kind}`,
    `order: ${++order}`,
    `domain: ${yamlStr(domain)}`,
    `role: ${yamlStr(role)}`,
    `summary: ${yamlStr(summary)}`,
    `results:\n${results.map((r) => `  - ${yamlStr(r)}`).join('\n') || '  []'}`,
    `stack:\n${stack.map((s) => `  - ${yamlStr(s)}`).join('\n')}`,
    '---',
  ].filter(Boolean).join('\n');

  writeFileSync(join(outDir, `${slug}.md`), `${fm}\n\n${md}\n`);
}

console.log(`Wrote ${projects.length} projects:\n  ${projects.join('\n  ')}`);
