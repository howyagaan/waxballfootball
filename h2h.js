const H2H_DATA = window.WAXBALL_H2H_DATA || { managers: [], matchups: [] };

const h2hEls = {
  managerA: document.querySelector("#h2h-manager-a"),
  managerB: document.querySelector("#h2h-manager-b"),
  cardA: document.querySelector("#h2h-card-a"),
  cardB: document.querySelector("#h2h-card-b"),
  series: document.querySelector("#h2h-series"),
  seriesNote: document.querySelector("#h2h-series-note"),
  points: document.querySelector("#h2h-points"),
  pointsNote: document.querySelector("#h2h-points-note"),
  margin: document.querySelector("#h2h-margin"),
  marginNote: document.querySelector("#h2h-margin-note"),
  quirks: document.querySelector("#h2h-quirks"),
  log: document.querySelector("#h2h-log"),
  logNote: document.querySelector("#h2h-log-note"),
};

const managerStats = buildManagerStats(H2H_DATA.matchups);
const weekStats = buildWeekStats(H2H_DATA.matchups);
const seasonStats = buildSeasonStats(H2H_DATA.matchups);

initH2H();

function initH2H() {
  const managers = H2H_DATA.managers || [];
  if (!managers.length) return;
  h2hEls.managerA.innerHTML = managers.map((manager) => option(manager)).join("");
  h2hEls.managerB.innerHTML = managers.map((manager) => option(manager)).join("");
  h2hEls.managerA.value = managers.includes("Nicholas Hamilton") ? "Nicholas Hamilton" : managers[0];
  h2hEls.managerB.value = managers.includes("Miles Blue") ? "Miles Blue" : managers.find((manager) => manager !== h2hEls.managerA.value);
  h2hEls.managerA.addEventListener("change", syncComparison);
  h2hEls.managerB.addEventListener("change", syncComparison);
  syncComparison();
}

function option(manager) {
  return `<option value="${escapeHtml(manager)}">${escapeHtml(manager)}</option>`;
}

function syncComparison() {
  if (h2hEls.managerA.value === h2hEls.managerB.value) {
    const replacement = H2H_DATA.managers.find((manager) => manager !== h2hEls.managerA.value);
    h2hEls.managerB.value = replacement || h2hEls.managerB.value;
  }
  renderComparison(h2hEls.managerA.value, h2hEls.managerB.value);
}

function renderComparison(a, b) {
  const games = H2H_DATA.matchups
    .filter((game) => game.managers.includes(a) && game.managers.includes(b))
    .sort((left, right) => left.season - right.season || left.week - right.week);
  const summary = summarizeSeries(a, b, games);

  h2hEls.cardA.innerHTML = managerCard(a, summary.aWins, summary.aPoints);
  h2hEls.cardB.innerHTML = managerCard(b, summary.bWins, summary.bPoints);
  h2hEls.series.textContent = games.length ? `${summary.aWins}-${summary.bWins}${summary.ties ? `-${summary.ties}` : ""}` : "0-0";
  h2hEls.seriesNote.textContent = games.length
    ? `${a}'s wins are listed first. ${games.length} recorded meeting${games.length === 1 ? "" : "s"}.`
    : "No recorded meetings yet.";
  const pointDiff = Math.abs(summary.aPoints - summary.bPoints);
  const pointLeader = summary.aPoints === summary.bPoints ? "Even" : summary.aPoints > summary.bPoints ? a : b;
  h2hEls.points.textContent = games.length ? `${summary.aPoints.toFixed(2)} - ${summary.bPoints.toFixed(2)}` : "--";
  h2hEls.pointsNote.textContent = games.length
    ? `${pointLeader}${pointLeader === "Even" ? "" : ` leads by ${pointDiff.toFixed(2)} total points`}.`
    : "Pick a pair with meetings.";
  h2hEls.margin.textContent = games.length ? `${summary.averageMargin.toFixed(2)} pts` : "--";
  h2hEls.marginNote.textContent = games.length ? marginFlavor(summary.averageMargin) : "No margins to measure.";

  h2hEls.quirks.innerHTML = games.length ? quirksMarkup(a, b, games, summary) : emptyCard("No history yet", "These two managers have not met in the archive.");
  h2hEls.logNote.textContent = games.length
    ? `${games.length} recorded matchup${games.length === 1 ? "" : "s"} from 2024-2025.`
    : "No matchup log available for this pair.";
  h2hEls.log.innerHTML = games.length ? matchupBoardMarkup(games, a, b) : "";
}

function summarizeSeries(a, b, games) {
  return games.reduce((record, game) => {
    const ai = game.managers.indexOf(a);
    const bi = game.managers.indexOf(b);
    const aScore = Number(game.scores[ai]);
    const bScore = Number(game.scores[bi]);
    record.aPoints += aScore;
    record.bPoints += bScore;
    record.margins.push(Math.abs(aScore - bScore));
    if (aScore > bScore) record.aWins += 1;
    else if (bScore > aScore) record.bWins += 1;
    else record.ties += 1;
    return record;
  }, {
    aWins: 0,
    bWins: 0,
    ties: 0,
    aPoints: 0,
    bPoints: 0,
    margins: [],
    get averageMargin() {
      return this.margins.length ? this.margins.reduce((sum, margin) => sum + margin, 0) / this.margins.length : 0;
    },
  });
}

function managerCard(manager, wins, points) {
  return `
    ${escapeHtml(manager)}
    <small>${wins} win${wins === 1 ? "" : "s"} · ${points.toFixed(2)} pts</small>
  `;
}

function quirksMarkup(a, b, games) {
  const tightest = [...games].sort((left, right) => margin(left) - margin(right))[0];
  const highest = [...games].sort((left, right) => total(right) - total(left))[0];
  const blowout = [...games].sort((left, right) => margin(right) - margin(left))[0];
  const special = games
    .flatMap((game) => gameFacts(game))
    .slice(0, 4);
  const cards = [
    quirkCard("Tightest matchup", `${margin(tightest).toFixed(2)} pts`, matchupSentence(tightest)),
    quirkCard("Highest-scoring meeting", `${total(highest).toFixed(2)} pts`, matchupSentence(highest)),
    quirkCard("Biggest swing", `${margin(blowout).toFixed(2)} pts`, matchupSentence(blowout)),
  ];
  if (special.length) {
    cards.push(quirkCard("Archive weirdness", `${special.length} note${special.length === 1 ? "" : "s"}`, special.join(" ")));
  } else {
    cards.push(quirkCard("Archive weirdness", "Nothing too cursed", `${a} and ${b} have avoided league-high or league-low chaos in their meetings.`));
  }
  return cards.join("");
}

function quirkCard(label, value, text) {
  return `
    <article>
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
      <p>${escapeHtml(text)}</p>
    </article>
  `;
}

function emptyCard(label, text) {
  return `<article><span>${escapeHtml(label)}</span><p>${escapeHtml(text)}</p></article>`;
}

function matchupBoardMarkup(games, a, b) {
  const bySeason = games.reduce((seasons, game) => {
    const season = String(game.season);
    if (!seasons.has(season)) seasons.set(season, []);
    seasons.get(season).push(game);
    return seasons;
  }, new Map());
  return [...bySeason.entries()]
    .map(([season, seasonGames]) => `
      <section class="h2h-season-slate">
        <h3>${escapeHtml(season)}</h3>
        <div class="h2h-season-line" aria-hidden="true"></div>
        ${seasonGames.map((game) => matchupLogCard(game, a, b)).join("")}
      </section>
    `)
    .join("");
}

function matchupLogCard(game, a, b) {
  const ai = game.managers.indexOf(a);
  const bi = game.managers.indexOf(b);
  const aScore = Number(game.scores[ai]);
  const bScore = Number(game.scores[bi]);
  const aResult = aScore === bScore ? "T" : aScore > bScore ? "W" : "L";
  const bResult = aScore === bScore ? "T" : bScore > aScore ? "W" : "L";
  return `
    <article class="h2h-chalk-row">
      <span class="h2h-result ${resultClass(aResult)}">${escapeHtml(aResult)}</span>
      <strong class="h2h-score">${escapeHtml(aScore.toFixed(2))}</strong>
      <div class="h2h-row-detail">
        <span>Week ${escapeHtml(game.week)}</span>
        <small>${escapeHtml(game.stage)}</small>
      </div>
      <strong class="h2h-score">${escapeHtml(bScore.toFixed(2))}</strong>
      <span class="h2h-result ${resultClass(bResult)}">${escapeHtml(bResult)}</span>
    </article>
  `;
}

function resultClass(result) {
  if (result === "W") return "win";
  if (result === "L") return "loss";
  return "tie";
}

function gameFacts(game) {
  const facts = [];
  game.managers.forEach((manager, index) => {
    const score = Number(game.scores[index]);
    const managerStat = managerStats.get(manager);
    const weekStat = weekStats.get(`${game.season}-${game.week}`);
    const seasonStat = seasonStats.get(String(game.season));
    if (managerStat?.high?.score === score && managerStat.high.id === game.id) facts.push(`${manager} posted their archive high score.`);
    if (managerStat?.low?.score === score && managerStat.low.id === game.id) facts.push(`${manager} posted their archive low score.`);
    if (weekStat?.high?.score === score && weekStat.high.id === game.id) facts.push(`${manager} had the league high score in Week ${game.week}, ${game.season}.`);
    if (weekStat?.low?.score === score && weekStat.low.id === game.id) facts.push(`${manager} had the league low score in Week ${game.week}, ${game.season}.`);
    if (seasonStat?.high?.score === score && seasonStat.high.id === game.id) facts.push(`${manager} hit the league's highest score of ${game.season}.`);
    if (seasonStat?.low?.score === score && seasonStat.low.id === game.id) facts.push(`${manager} hit the league's lowest score of ${game.season}.`);
  });
  if (game.stage === "Championship") facts.push("This was a championship matchup.");
  if (game.stage === "Toilet Bowl final") facts.push("This was a final Toilet Bowl matchup.");
  return [...new Set(facts)];
}

function buildManagerStats(games) {
  const stats = new Map();
  games.forEach((game) => {
    game.managers.forEach((manager, index) => {
      const score = Number(game.scores[index]);
      const current = stats.get(manager) || {};
      if (!current.high || score > current.high.score) current.high = { id: game.id, score };
      if (!current.low || score < current.low.score) current.low = { id: game.id, score };
      stats.set(manager, current);
    });
  });
  return stats;
}

function buildWeekStats(games) {
  const stats = new Map();
  games.forEach((game) => {
    const key = `${game.season}-${game.week}`;
    const current = stats.get(key) || {};
    game.managers.forEach((manager, index) => {
      const score = Number(game.scores[index]);
      if (!current.high || score > current.high.score) current.high = { id: game.id, score, manager };
      if (!current.low || score < current.low.score) current.low = { id: game.id, score, manager };
    });
    stats.set(key, current);
  });
  return stats;
}

function buildSeasonStats(games) {
  const stats = new Map();
  games.forEach((game) => {
    const key = String(game.season);
    const current = stats.get(key) || {};
    game.managers.forEach((manager, index) => {
      const score = Number(game.scores[index]);
      if (!current.high || score > current.high.score) current.high = { id: game.id, score, manager };
      if (!current.low || score < current.low.score) current.low = { id: game.id, score, manager };
    });
    stats.set(key, current);
  });
  return stats;
}

function matchupSentence(game) {
  const [a, b] = game.managers;
  const [aScore, bScore] = game.scores.map(Number);
  const winner = aScore === bScore ? "Nobody" : aScore > bScore ? a : b;
  const loser = aScore === bScore ? "" : aScore > bScore ? b : a;
  const score = `${a} ${aScore.toFixed(2)} · ${b} ${bScore.toFixed(2)}`;
  return winner === "Nobody"
    ? `${score} in Week ${game.week}, ${game.season}.`
    : `${winner} beat ${loser}, ${score}, in Week ${game.week}, ${game.season}.`;
}

function margin(game) {
  return Math.abs(Number(game.scores[0]) - Number(game.scores[1]));
}

function total(game) {
  return Number(game.scores[0]) + Number(game.scores[1]);
}

function marginFlavor(value) {
  if (value < 5) return "A knife-fight series.";
  if (value < 15) return "Usually competitive, rarely comfortable.";
  return "Someone has usually been holding the belt by halftime.";
}

function initialsFor(name) {
  return String(name || "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
