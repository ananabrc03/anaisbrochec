import { createClient } from '@supabase/supabase-js';
const sb = createClient(document.body.dataset.supabaseUrl!, document.body.dataset.supabaseKey!);
const $ = <T extends Element = HTMLElement>(s: string) => document.querySelector<T>(s)!;
const login = $<HTMLFormElement>('.admin-login'),
  dash = $('.dashboard'),
  error = $('.admin-error'),
  feedback = $('.dashboard-status'),
  detail = $<HTMLDialogElement>('.message-dialog');
let messages: any[] = [],
  current: any = null,
  noteTimer: ReturnType<typeof setTimeout> | undefined,
  notePending: Promise<void> = Promise.resolve();
const statuses: Record<string, string> = {
  nouveau: 'Nouveau',
  lu: 'Lu',
  traite: 'Traité',
  archive: 'Archivé',
};
function textElement(tag: string, text: string) {
  const el = document.createElement(tag);
  el.textContent = text;
  return el;
}
function report(message: string) {
  feedback.textContent = message;
}
async function loadMessages() {
  const { data, error: err } = await sb
    .from('messages')
    .select('*')
    .order('created_at', { ascending: false });
  if (err) {
    report('Impossible de charger les messages.');
    return;
  }
  messages = data || [];
  renderMessages();
  report('');
}
function renderMessages() {
  const filter = $<HTMLSelectElement>('.status-filter').value,
    type = $<HTMLSelectElement>('.type-filter').value,
    search = $<HTMLInputElement>('.search-filter').value.toLocaleLowerCase('fr');
  const list = $('.message-list');
  list.replaceChildren();
  const count = messages.filter((m) => m.statut === 'nouveau').length;
  $('.new-count').textContent = count + ' nouveaux';
  document.title = `${count ? '(' + count + ') ' : ''}Admin · Anaïs Brochec`;
  const visible = messages.filter(
    (m) =>
      (!filter || m.statut === filter) &&
      (!type || m.type_demande === type) &&
      (!search ||
        [m.nom, m.prenom, m.email, m.entreprise, m.message]
          .join(' ')
          .toLocaleLowerCase('fr')
          .includes(search)),
  );
  visible.forEach((m) => {
    const row = document.createElement('button');
    row.className = 'message-row';
    row.append(
      textElement('span', new Date(m.created_at).toLocaleDateString('fr-FR')),
      textElement('strong', `${m.prenom} ${m.nom}${m.fichier_path ? ' 📎' : ''}`),
      textElement('span', `${m.entreprise || '—'} · ${m.type_demande}`),
      textElement('span', statuses[m.statut]),
    );
    row.addEventListener('click', () => void openMessage(m));
    list.append(row);
  });
  if (!visible.length) list.append(textElement('p', 'Aucun message.'));
}
async function saveNote() {
  if (!current) return;
  const id = current.id,
    value = $<HTMLTextAreaElement>('.detail-note').value;
  $('.note-state').textContent = 'Enregistrement…';
  notePending = notePending.then(async () => {
    const { error: err } = await sb.from('messages').update({ note_admin: value }).eq('id', id);
    $('.note-state').textContent = err
      ? 'La note n’a pas pu être enregistrée.'
      : 'Note enregistrée';
    if (!err) {
      const m = messages.find((m) => m.id === id);
      if (m) m.note_admin = value;
    }
  });
  await notePending;
}
async function openMessage(m: any) {
  if (noteTimer) {
    clearTimeout(noteTimer);
    await saveNote();
  }
  current = m;
  $('.detail-name').textContent = `${m.prenom} ${m.nom}`;
  $('.detail-meta').replaceChildren(
    ...[m.email, m.entreprise || '', m.type_demande, new Date(m.created_at).toLocaleString('fr-FR')]
      .filter(Boolean)
      .map((v) => textElement('p', v)),
  );
  $('.detail-message').textContent = m.message;
  const reply = $<HTMLAnchorElement>('.reply');
  reply.href = `mailto:${encodeURIComponent(m.email)}?subject=${encodeURIComponent('Re: Portfolio · ' + m.type_demande)}`;
  $<HTMLSelectElement>('.detail-status').value = m.statut;
  $<HTMLTextAreaElement>('.detail-note').value = m.note_admin || '';
  $('.note-state').textContent = '';
  $('.attachment').hidden = true;
  $<HTMLIFrameElement>('.attachment iframe').src = 'about:blank';
  detail.showModal();
  if (m.statut === 'nouveau') {
    const { error: err } = await sb.from('messages').update({ statut: 'lu' }).eq('id', m.id);
    if (!err) {
      m.statut = 'lu';
      $<HTMLSelectElement>('.detail-status').value = 'lu';
      renderMessages();
    }
  }
  if (m.fichier_path) {
    const { data, error: err } = await sb.storage
      .from('pieces-jointes')
      .createSignedUrl(m.fichier_path, 120);
    if (current?.id !== m.id) return;
    if (err) {
      $('.note-state').textContent = 'Impossible de charger la pièce jointe.';
    } else {
      $('.attachment').hidden = false;
      $<HTMLIFrameElement>('.attachment iframe').src = data.signedUrl;
      $<HTMLAnchorElement>('.attachment-download').href = data.signedUrl;
    }
  }
}
async function loadStats() {
  const names = [
    'stats_visites_jour',
    'stats_pages',
    'stats_sources',
    'stats_appareils',
    'stats_cv',
  ];
  const results = await Promise.all(names.map((name) => sb.from(name).select('*')));
  if (results.some((r) => r.error)) {
    report('Impossible de charger les statistiques.');
    return;
  }
  const [days, pages, sources, devices, cvs] = results.map((r) => r.data || []);
  const cutoff = (n: number) => new Date(Date.now() - n * 86400000).toISOString().slice(0, 10);
  const days30 = days.filter((r: any) => r.jour >= cutoff(30));
  const cards = $('.stats-cards');
  cards.replaceChildren();
  for (const [value, title] of [
    [
      days
        .filter((r: any) => r.jour >= cutoff(7))
        .reduce((s: number, r: any) => s + Number(r.visites), 0),
      'Visites · 7 jours',
    ],
    [days30.reduce((s: number, r: any) => s + Number(r.visites), 0), 'Visites · 30 jours'],
    [days30.reduce((s: number, r: any) => s + Number(r.vues), 0), 'Pages vues · 30 jours'],
    [cvs.reduce((s: number, r: any) => s + Number(r.telechargements), 0), 'CV téléchargés'],
  ]) {
    const card = document.createElement('div');
    card.className = 'kpi';
    card.append(textElement('strong', String(value)), textElement('p', String(title)));
    cards.append(card);
  }
  const ordered = Array.from({ length: 30 }, (_, i) => {
    const day = new Date(Date.now() - (29 - i) * 86400000).toISOString().slice(0, 10);
    return { day, value: Number(days.find((r: any) => r.jour === day)?.visites || 0) };
  });
  const max = Math.max(1, ...ordered.map((d) => d.value));
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', '0 0 930 250');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', 'Nombre de visites par jour sur 30 jours');
  ordered.forEach((d, i) => {
    const rect = document.createElementNS(ns, 'rect');
    rect.setAttribute('x', String(i * 30 + 10));
    rect.setAttribute('y', String(215 - (d.value / max) * 180));
    rect.setAttribute('width', '20');
    rect.setAttribute('height', String(Math.max(1, (d.value / max) * 180)));
    rect.setAttribute('rx', '4');
    rect.setAttribute('fill', '#702D42');
    const title = document.createElementNS(ns, 'title');
    title.textContent = d.day + ': ' + d.value + ' visites';
    rect.append(title);
    svg.append(rect);
    if (i % 5 === 0) {
      const text = document.createElementNS(ns, 'text');
      text.textContent = d.day.slice(5);
      text.setAttribute('x', String(i * 30 + 6));
      text.setAttribute('y', '240');
      text.setAttribute('font-size', '12');
      text.setAttribute('fill', '#451725');
      svg.append(text);
    }
  });
  $('.chart').replaceChildren(svg);
  const holder = $('.stats-tables');
  holder.replaceChildren();
  [
    [pages, 'Pages les plus vues', ['path', 'vues']],
    [sources, 'Sources', ['source', 'visites']],
    [devices, 'Appareils', ['appareil', 'visites']],
    [cvs, 'Téléchargements de CV', ['domaine', 'langue_cv', 'telechargements', 'dernier']],
  ].forEach(([data, title, columns]: any) => {
    const box = document.createElement('div');
    box.append(textElement('h3', title));
    const scroll = document.createElement('div');
    scroll.className = 'table-scroll';
    const table = document.createElement('table');
    data.forEach((row: any) => {
      const tr = document.createElement('tr');
      columns.forEach((col: string) =>
        tr.append(
          textElement(
            'td',
            col === 'dernier'
              ? new Date(row[col]).toLocaleDateString('fr-FR')
              : String(row[col] ?? ''),
          ),
        ),
      );
      table.append(tr);
    });
    if (!data.length) box.append(textElement('p', 'Aucune donnée pour le moment.'));
    else {
      scroll.append(table);
      box.append(scroll);
    }
    holder.append(box);
  });
}
async function session() {
  const {
    data: { user },
    error: err,
  } = await sb.auth.getUser();
  const authorized = !err && user?.email === $('.admin-page').getAttribute('data-admin-email');
  login.hidden = !!authorized;
  dash.hidden = !authorized;
  if (authorized) await loadMessages();
}
login.addEventListener('submit', async (e) => {
  e.preventDefault();
  const button = login.querySelector('button')!;
  button.disabled = true;
  error.textContent = '';
  try {
    const { error: err } = await sb.auth.signInWithPassword({
      email: $('.admin-page').getAttribute('data-admin-email')!,
      password: (login.elements.namedItem('password') as HTMLInputElement).value,
    });
    if (err) {
      error.textContent = 'Connexion impossible. Vérifiez votre mot de passe.';
    } else {
      login.reset();
      await session();
    }
  } catch {
    error.textContent = 'Connexion indisponible. Réessayez.';
  } finally {
    button.disabled = false;
  }
});
$('.logout').addEventListener('click', async () => {
  if (noteTimer) {
    clearTimeout(noteTimer);
    await saveNote();
  }
  await sb.auth.signOut();
  messages = [];
  current = null;
  $('.message-list').replaceChildren();
  $('.stats-tables').replaceChildren();
  await session();
});
$('.refresh').addEventListener('click', () => void loadMessages());
document
  .querySelectorAll('.admin-filters :is(input,select)')
  .forEach((el) => el.addEventListener('input', renderMessages));
$('.message-close').addEventListener('click', () => detail.close());
detail.addEventListener('close', () => {
  if (noteTimer) {
    clearTimeout(noteTimer);
    noteTimer = undefined;
    void saveNote();
  }
  $('.attachment').hidden = true;
  $<HTMLIFrameElement>('.attachment iframe').src = 'about:blank';
});
$<HTMLSelectElement>('.detail-status').addEventListener('change', async function () {
  if (!current) return;
  const { error: err } = await sb
    .from('messages')
    .update({ statut: this.value })
    .eq('id', current.id);
  $('.note-state').textContent = err ? 'Statut non enregistré.' : 'Statut enregistré';
  if (!err) {
    current.statut = this.value;
    renderMessages();
  }
});
$('.detail-note').addEventListener('input', () => {
  clearTimeout(noteTimer);
  noteTimer = setTimeout(() => {
    noteTimer = undefined;
    void saveNote();
  }, 700);
});
const deletion = $<HTMLDialogElement>('.delete-dialog');
$('.delete-message').addEventListener('click', () => deletion.showModal());
$('.delete-cancel').addEventListener('click', () => deletion.close());
$('.delete-confirm').addEventListener('click', async () => {
  if (!current) return;
  const id = current.id;
  clearTimeout(noteTimer);
  noteTimer = undefined;
  await notePending;
  const button = $<HTMLButtonElement>('.delete-confirm');
  button.disabled = true;
  try {
    if (current.fichier_path) {
      const { error: err } = await sb.storage.from('pieces-jointes').remove([current.fichier_path]);
      if (err) throw err;
    }
    const { error: err } = await sb.from('messages').delete().eq('id', id);
    if (err) throw err;
    deletion.close();
    detail.close();
    current = null;
    await loadMessages();
  } catch {
    deletion.close();
    $('.note-state').textContent = 'La suppression a échoué. Réessayez.';
  } finally {
    button.disabled = false;
  }
});
document.querySelectorAll<HTMLButtonElement>('[data-admin-tab]').forEach((b) =>
  b.addEventListener('click', () => {
    document
      .querySelectorAll<HTMLButtonElement>('[data-admin-tab]')
      .forEach((x) => x.setAttribute('aria-selected', String(x === b)));
    $('#messages-tab').hidden = b.dataset.adminTab !== 'messages';
    $('#stats-tab').hidden = b.dataset.adminTab !== 'stats';
    if (b.dataset.adminTab === 'stats') void loadStats();
  }),
);
void session();
