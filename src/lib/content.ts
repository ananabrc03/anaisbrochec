import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
import { marked } from 'marked';
import fr from '../../contenu/i18n/fr.json';
import en from '../../contenu/i18n/en.json';
import graph from '../../contenu/competences.json';
import timeline from '../../contenu/timeline.json';
import tools from '../../contenu/outils.json';
export type Lang = 'fr' | 'en';
export { graph, timeline, tools };
export const texts = (lang: Lang) => (lang === 'en' ? en : fr);
export const label = (item: any, field: string, lang: Lang) =>
  item[lang === 'en' ? field + '_en' : field] || item[field];
export const route = (lang: Lang, page: string = '', id?: string) => {
  const slugs: Record<string, string[]> = {
    home: ['', 'en'],
    about: ['a-propos', 'en/about'],
    projects: ['projets', 'en/projects'],
    cv: ['cv', 'en/cv'],
    contact: ['contact', 'en/contact'],
    legal: ['mentions-legales', 'en/legal-notice'],
    privacy: ['confidentialite', 'en/privacy'],
  };
  return '/' + (slugs[page || 'home']?.[lang === 'en' ? 1 : 0] ?? page) + (id ? '/' + id : '');
};
export const mediaPath = (value: string) => '/' + value.trim().replace(/^assets\//, 'images/');
export function markdown(raw: string, lang: Lang): string {
  return marked.parse(
    raw.replace(/\[\[([\w-]+)\]\]/g, (_, id) => {
      const file = path.resolve('contenu', lang, 'projets', id + '.md');
      const title = fs.existsSync(file)
        ? YAML.parse(fs.readFileSync(file, 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/)![1]).titre
        : id;
      return `[${title}](${route(lang, 'projects', id)})`;
    }),
    { async: false },
  ) as string;
}
export type Media = {
  type: string;
  items: { src: string; caption: string }[];
  src?: string;
  before?: { src: string; caption: string };
  after?: { src: string; caption: string };
};
export type Block = { type: 'text'; html: string } | { type: 'media'; media: Media };
export function blocks(raw: string, lang: Lang): Block[] {
  const result: Block[] = [];
  let cursor = 0;
  const matcher = /::: media ([^\n]+)\n([\s\S]*?)\n:::/g;
  for (const match of raw.matchAll(matcher)) {
    if (match.index! > cursor)
      result.push({ type: 'text', html: markdown(raw.slice(cursor, match.index), lang) });
    const body = match[2],
      item = (line: string) => {
        const [src, ...caption] = line.split('|');
        return { src: mediaPath(src), caption: caption.join('|').trim() };
      };
    const media: Media = {
      type: match[1].trim(),
      items: body
        .split('\n')
        .filter((s) => s.startsWith('- '))
        .map((s) => item(s.slice(2))),
    };
    media.src = body.match(/^src:\s*(.+)$/m)?.[1].trim();
    for (const [key, regex] of [
      ['before', /^avant:\s*(.+)$/m],
      ['after', /^apres:\s*(.+)$/m],
    ] as const) {
      const m = body.match(regex);
      if (m) media[key] = item(m[1]);
    }
    result.push({ type: 'media', media });
    cursor = match.index! + match[0].length;
  }
  if (cursor < raw.length) result.push({ type: 'text', html: markdown(raw.slice(cursor), lang) });
  return result;
}
export function parseProject(raw: string, lang: Lang) {
  const fm = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/)!;
  const data = YAML.parse(fm[1]);
  const body = raw.slice(fm[0].length).replace(/\r/g, '');
  const sections: Record<string, string> = {};
  for (const match of body.matchAll(/^## (.+)\n([\s\S]*?)(?=^## |$(?![\s\S]))/gm))
    sections[match[1].trim()] = match[2].trim();
  const header = sections['En-tête'] || sections['Header'] || sections['Heading'] || '';
  const summary = header.match(/\*\*(?:Résumé court|Short summary)\*\*\s*:\s*(.+)/)?.[1] || '';
  const missions = [
    ...(sections['Missions'] || '').matchAll(
      /^### (\d+)\. (.+)\n([\s\S]*?)(?=^### |$(?![\s\S]))/gm,
    ),
  ].map((m) => ({
    number: Number(m[1]),
    title: m[2],
    open: /\*\*Toggle\*\*\s*:\s*(OUVERT|OPEN)/.test(m[3]),
    codes: [...m[3].matchAll(/`((?:Q-)?[A-Z]+(?:-\d+)?)`/g)].map((x) => x[1]),
    blocks: blocks(
      m[3]
        .replace(
          /^- \*\*(Toggle|Média|Media|Sous-compétences|Sub-skills|Qualités|Qualities|Skills)\*\*[^\n]*\n?/gm,
          '',
        )
        .replace(/^Note:.*$/gm, ''),
      lang,
    ),
  }));
  const results =
    sections['Résultats & indicateurs clés'] || sections['Results & key figures'] || '';
  const rows = results
    .split('\n')
    .filter((l) => /^\|/.test(l) && !/^\|\s*[-:]/.test(l))
    .slice(1)
    .map((l) =>
      l
        .split('|')
        .slice(1, -1)
        .map((s) => s.trim()),
    );
  for (const mission of missions)
    mission.open = mission.blocks.some(
      (b) =>
        b.type === 'media' &&
        b.media.type !== 'icones-outils' &&
        (b.media.items.length > 0 || Boolean(b.media.before)),
    );
  return {
    ...data,
    lang,
    summary,
    missions,
    results: rows,
    context: blocks(sections['Contexte'] || sections['Context'] || '', lang),
    role: blocks(sections['Mon rôle'] || sections['My role'] || '', lang),
  };
}
const cache: Partial<Record<Lang, any[]>> = {};
export function projects(lang: Lang): any[] {
  return (cache[lang] ??= fs
    .readdirSync(path.resolve('contenu', lang, 'projets'))
    .filter((f) => f.endsWith('.md'))
    .map((f) =>
      parseProject(fs.readFileSync(path.resolve('contenu', lang, 'projets', f), 'utf8'), lang),
    )
    .sort((a, b) => a.ordre - b.ordre));
}
export const legal = (lang: Lang, privacy: boolean) =>
  markdown(
    fs
      .readFileSync(
        path.resolve(
          'contenu',
          lang,
          privacy
            ? lang === 'fr'
              ? 'confidentialite.md'
              : 'privacy.md'
            : lang === 'fr'
              ? 'mentions-legales.md'
              : 'legal-notice.md',
        ),
        'utf8',
      )
      .replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '')
      .replace(/^- \*\*Cloudflare Turnstile\*\*[^\n]*\n?/gm, ''),
    lang,
  );
export const codeLabel = (code: string, lang: Lang) => {
  const all: any[] = [
    ...graph.familles,
    ...graph.qualites,
    ...graph.familles.flatMap((f) => f.sous_competences),
  ];
  return label(all.find((x) => x.id === code) || { nom: code }, 'nom', lang);
};

// Stable tool anchors keep the links between projects and the tools catalogue.
export const toolId = (name: string) => {
  const clean = name
    .replace(/^\//, '')
    .replace(/\s*\([^)]*\)/g, '')
    .trim()
    .toLowerCase();
  return tools.outils.find((t) => t.nom.toLowerCase() === clean || t.id === clean)?.id;
};
export const projectTools = (project: any) => {
  const names = project.missions.flatMap((m: any) =>
    m.blocks.flatMap((b: Block) =>
      b.type === 'media' && b.media.type === 'icones-outils'
        ? b.media.items.map((i) => toolId(i.src))
        : [],
    ),
  );
  return tools.outils.filter((t) => t.projets.includes(project.id) || names.includes(t.id));
};
