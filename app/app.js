// Leonida Trophy Guide — offline tracker for the 55 GTA VI PS5 trophies.
// Progress is saved in localStorage; export/import moves it as a .json file.
// Spoiler-free mode masks hidden story trophies until they are ticked earned.
const KEY_EARNED = 'leonida-trophy-guide-earned-v1';
const KEY_SPOILER = 'leonida-trophy-guide-spoiler-v1';

const KIND_LABELS = {
  story: 'Story', character: 'Character quests', collectibles: 'Collectibles',
  activities: 'Activities', combat: 'Combat & robberies', misc: 'One-off moments',
  completion: '100% completion', platinum: 'Platinum',
};
const GRADE_ORDER = { platinum: 0, gold: 1, silver: 2, bronze: 3 };
const STAGES = [
  {
    n: 1, title: 'Stage 1 — Play the story, and side content as it shows up',
    time: 'roughly 60–80 hours',
    text: 'Play through the five chapters and take on optional missions and character quests as they appear, since many are only offered for a while. Along the way, scan vehicles with the WAiNK app, study animals with binoculars, meditate with both characters, and turn on every progress and collectible notification in the settings. In Chapter 1, do not skip Lucia\u2019s balcony meditation (see Missable & Warnings), and steer clear of the Irredeemable criminal profile: it is permanent.',
  },
  {
    n: 2, title: 'Stage 2 — Finish the 100% checklist',
    time: 'roughly 100 hours',
    text: 'After the credits, open Progress > Stats > 100% Completion and work through what is left: every robbery, bank vault and gang operation, underwater discoveries, shooting ranges, drone races, Bret\u2019s Target Decks and the partial counts (70 of 80 challenges, 300 stunts, 200 vehicle scans and more). Most of the miscellaneous trophies pop along the way. This is the longest stretch.',
  },
  {
    n: 3, title: 'Stage 3 — Strangers & Freaks and clean-up',
    time: 'roughly 20–40 hours',
    text: 'Stranger missions are not part of 100%, but Strangers & Freaks needs 8 strands. Finish those, then check the list for anything left: the five unconfirmed one-off trophies, any character quest lines still open, and the platinum itself.',
  },
];

const doc = await (await fetch('data/trophies.json')).json();
const trophies = [...doc.trophies].sort((a, b) =>
  GRADE_ORDER[a.grade] - GRADE_ORDER[b.grade] || a.id - b.id);
const sourceLinks = doc.sourceLinks ?? {};

let earned = new Set(JSON.parse(localStorage.getItem(KEY_EARNED) ?? '[]'));
let spoiler = localStorage.getItem(KEY_SPOILER) !== 'off';

const $ = (id) => document.getElementById(id);
const els = {
  cards: $('cards'), empty: $('empty'), showing: $('showing'),
  search: $('search'), kind: $('kind'), grade: $('grade'), status: $('status'),
  missableOnly: $('missable-only'), spoiler: $('spoiler'),
  progressFill: $('progress-fill'), progressText: $('progress-text'),
  gradeCounts: $('grade-counts'), roadmap: $('roadmap'),
};
els.spoiler.checked = spoiler;

function save() {
  localStorage.setItem(KEY_EARNED, JSON.stringify([...earned]));
  localStorage.setItem(KEY_SPOILER, spoiler ? 'on' : 'off');
}

function isMasked(t) {
  return spoiler && t.hidden && !earned.has(t.name);
}

function difficultyDots(t) {
  const filled = '\u25CF'.repeat(t.difficulty ?? 1);
  const empty = '\u25CB'.repeat(5 - (t.difficulty ?? 1));
  return `${filled}${empty} difficulty ${t.difficulty ?? 1}/5`;
}

function sourceLinksHtml(t) {
  if (!t.sources || !t.sources.length) return '';
  const links = t.sources.map((s) => {
    const url = sourceLinks[s];
    return url ? `<a href="${url}" target="_blank" rel="noopener">${s}</a>` : s;
  });
  return `<p class="cite">Sources: ${links.join(', ')}.</p>`;
}

function renderProgress() {
  const total = trophies.length;
  const n = earned.size;
  const pct = Math.round((n / total) * 100);
  els.progressFill.style.width = `${pct}%`;
  els.progressText.textContent = `${n} of ${total} earned \u00B7 ${pct}%`;
  const byGrade = {};
  for (const t of trophies) {
    byGrade[t.grade] = byGrade[t.grade] ?? [0, 0];
    byGrade[t.grade][1] += 1;
    if (earned.has(t.name)) byGrade[t.grade][0] += 1;
  }
  els.gradeCounts.textContent = ['platinum', 'gold', 'silver', 'bronze']
    .map((g) => `${byGrade[g][0]}/${byGrade[g][1]} ${g}`)
    .join('  \u00B7  ');
}

function renderCards() {
  const q = els.search.value.trim().toLowerCase();
  const kind = els.kind.value;
  const grade = els.grade.value;
  const status = els.status.value;
  const missableOnly = els.missableOnly.checked;
  let shown = 0;
  els.cards.replaceChildren();
  for (const t of trophies) {
    if (kind !== 'all' && t.kind !== kind) continue;
    if (grade !== 'all' && t.grade !== grade) continue;
    if (status === 'earned' && !earned.has(t.name)) continue;
    if (status === 'remaining' && earned.has(t.name)) continue;
    if (missableOnly && !t.missable) continue;
    if (q) {
      const hay = `${t.name} ${t.description} ${t.guide} ${(t.steps ?? []).join(' ')}`.toLowerCase();
      if (!hay.includes(q)) continue;
    }
    shown += 1;
    const masked = isMasked(t);
    const card = document.createElement('article');
    card.className = `card${earned.has(t.name) ? ' earned' : ''}`;
    card.dataset.trophy = t.name;
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.className = 'earn-box';
    box.checked = earned.has(t.name);
    box.setAttribute('aria-label', `Mark ${t.name} earned`);
    box.addEventListener('change', () => {
      if (box.checked) earned.add(t.name);
      else earned.delete(t.name);
      save();
      renderProgress();
      renderCards();
      renderRoadmap();
    });
    const head = document.createElement('div');
    head.className = 'card-head';
    const main = document.createElement('div');
    main.className = 'card-main';
    const titleRow = document.createElement('div');
    titleRow.className = 'card-title';
    const h3 = document.createElement('h3');
    if (masked) {
      const span = document.createElement('span');
      span.className = 'spoiler-name';
      span.textContent = 'Hidden trophy — earn it to reveal';
      h3.append(span);
    } else {
      h3.textContent = t.name;
    }
    const badge = document.createElement('span');
    badge.className = `grade-badge ${t.grade}`;
    badge.textContent = t.grade;
    const kindTag = document.createElement('span');
    kindTag.className = 'kind-tag';
    kindTag.textContent = KIND_LABELS[t.kind] ?? t.kind;
    titleRow.append(h3, badge, kindTag);
    if (t.missable) {
      const m = document.createElement('span');
      m.className = 'missable-badge';
      m.textContent = 'Possibly missable';
      titleRow.append(m);
    }
    const diff = document.createElement('span');
    diff.className = 'diff';
    diff.textContent = difficultyDots(t);
    titleRow.append(diff);
    main.append(titleRow);
    if (!masked) {
      const desc = document.createElement('p');
      desc.className = 'official';
      desc.textContent = `\u201C${t.description}\u201D`;
      main.append(desc);
    }
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'guide-toggle';
    toggle.textContent = masked ? 'Guide hidden until earned' : 'Show guide';
    toggle.disabled = masked;
    const guideEl = document.createElement('div');
    guideEl.className = 'guide';
    guideEl.hidden = true;
    if (!masked) {
      const p = document.createElement('p');
      p.textContent = t.guide;
      guideEl.append(p);
      if (t.steps && t.steps.length) {
        const ol = document.createElement('ol');
        for (const s of t.steps) {
          const li = document.createElement('li');
          li.textContent = s;
          ol.append(li);
        }
        guideEl.append(ol);
      }
      const cite = document.createElement('div');
      cite.innerHTML = sourceLinksHtml(t);
      guideEl.append(cite);
    }
    toggle.addEventListener('click', () => {
      guideEl.hidden = !guideEl.hidden;
      toggle.textContent = guideEl.hidden ? 'Show guide' : 'Hide guide';
    });
    main.append(toggle, guideEl);
    head.append(box, main);
    card.append(head);
    els.cards.append(card);
  }
  els.empty.hidden = shown !== 0;
  els.showing.textContent = `Showing ${shown} of ${trophies.length} trophies`;
}

function renderRoadmap() {
  els.roadmap.replaceChildren();
  for (const stage of STAGES) {
    const list = trophies.filter((t) => t.roadmap === stage.n);
    const done = list.filter((t) => earned.has(t.name)).length;
    const div = document.createElement('div');
    div.className = 'stage';
    const h3 = document.createElement('h3');
    h3.textContent = stage.title + ' ';
    const time = document.createElement('span');
    time.className = 'stage-time';
    time.textContent = `(${stage.time})`;
    h3.append(time);
    const p = document.createElement('p');
    p.textContent = stage.text;
    const chips = document.createElement('div');
    chips.className = 'stage-trophies';
    for (const t of list) {
      const chip = document.createElement('span');
      chip.className = `stage-chip${earned.has(t.name) ? ' done' : ''}`;
      chip.textContent = `${isMasked(t) ? 'Hidden trophy' : t.name} (${t.grade})`;
      chips.append(chip);
    }
    const count = document.createElement('p');
    count.className = 'stage-count';
    count.textContent = `${done} of ${list.length} trophies in this stage earned`;
    div.append(h3, p, chips, count);
    els.roadmap.append(div);
  }
}

// Tabs
for (const tab of document.querySelectorAll('.tab')) {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach((b) => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach((p) => p.classList.remove('active'));
    tab.classList.add('active');
    $(`tab-${tab.dataset.tab}`).classList.add('active');
  });
}

// Filters
for (const el of [els.search, els.kind, els.grade, els.status, els.missableOnly]) {
  el.addEventListener('input', renderCards);
}
els.spoiler.addEventListener('change', () => {
  spoiler = els.spoiler.checked;
  save();
  renderCards();
  renderRoadmap();
});

// Export / import / reset
$('export').addEventListener('click', () => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify([...earned], null, 2)], { type: 'application/json' }));
  a.download = 'gta6-trophy-progress.json';
  a.click();
});
$('import').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const names = JSON.parse(await file.text());
    const known = new Set(trophies.map((t) => t.name));
    earned = new Set(names.filter((n) => known.has(n)));
    save();
    renderProgress();
    renderCards();
    renderRoadmap();
  } catch {
    alert('That file is not a valid progress export.');
  }
  e.target.value = '';
});
$('reset').addEventListener('click', () => {
  if (confirm('Clear all earned trophies? Export first if you want a backup.')) {
    earned = new Set();
    save();
    renderProgress();
    renderCards();
    renderRoadmap();
  }
});

renderProgress();
renderCards();
renderRoadmap();
