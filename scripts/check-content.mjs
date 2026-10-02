import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
const root = 'contenu/';
const json = (file) => JSON.parse(fs.readFileSync(root + file, 'utf8'));
const fr = json('i18n/fr.json'),
  en = json('i18n/en.json');
function keys(value, prefix = '') {
  return Object.entries(value).flatMap(([key, v]) =>
    v && typeof v === 'object' && !Array.isArray(v) ? keys(v, prefix + key + '.') : [prefix + key],
  );
}
const a = keys(fr),
  b = keys(en);
if (a.some((k) => !b.includes(k)) || b.some((k) => !a.includes(k)))
  throw Error('Les traductions FR/EN sont incomplètes.');
const skills = json('competences.json');
const codes = new Set(
  [
    ...skills.familles,
    ...skills.qualites,
    ...skills.familles.flatMap((f) => f.sous_competences),
  ].map((x) => x.id),
);
const ids = new Set();
for (const lang of ['fr', 'en']) {
  const files = fs.readdirSync(root + lang + '/projets').filter((f) => f.endsWith('.md'));
  if (files.length !== 7) throw Error('Sept projets sont attendus dans chaque langue.');
  for (const name of files) {
    const raw = fs.readFileSync(root + lang + '/projets/' + name, 'utf8');
    const p = YAML.parse(raw.match(/^---\r?\n([\s\S]*?)\r?\n---/)[1]);
    if (!p.titre || !p.id || !Number.isInteger(p.ordre)) throw Error('Projet incomplet : ' + name);
    ids.add(p.id);
    for (const code of [...p.familles_cles, ...p.qualites_cles, ...p.sous_competences])
      if (!codes.has(code)) throw Error('Compétence inconnue : ' + code);
    if (raw.includes('::: media infographie')) throw Error('Diagramme restant : ' + name);
    for (const m of raw.matchAll(/images\/projets\/[^\s|]+\.webp/g)) {
      if (
        !fs.existsSync('public/' + m[0]) ||
        !fs.existsSync('public/' + m[0].replace('.webp', '-640.webp'))
      )
        throw Error('Image manquante : ' + m[0]);
    }
    for (const m of raw.matchAll(/\[\[([\w-]+)\]\]/g))
      if (!fs.existsSync(root + lang + '/projets/' + m[1] + '.md'))
        throw Error('Lien projet manquant : ' + m[1]);
  }
}
for (const f of skills.familles)
  for (const s of f.sous_competences)
    for (const p of s.preuves)
      if (!ids.has(p.projet)) throw Error('Preuve sans projet : ' + p.projet);
for (const tool of json('outils.json').outils)
  for (const icon of tool.icones || [tool.icone])
    if (!fs.existsSync(path.join('public', icon))) throw Error('Icône manquante : ' + icon);
for (const d of fr.cv.domains)
  for (const lang of ['fr', 'en'])
    if (!fs.existsSync('public/cv/cv-anais-brochec-' + d.id + '-' + lang + '.pdf'))
      throw Error('CV manquant.');
console.log('Contenus vérifiés : FR/EN, 14 fiches, compétences, liens, images, icônes et 12 CV.');
