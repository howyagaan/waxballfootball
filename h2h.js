const H2H_DATA = window.WAXBALL_H2H_DATA || { managers: [], matchups: [] };
const H2H_API_BASE = "https://api.sleeper.app/v1";
const H2H_CURRENT_LEAGUE_ID = "1312219624808419328";
const H2H_OWNER_REAL_NAMES = {
  helloimpaul: "Paul Legallet",
  bigboybluey: "Miles Blue",
  erikohno: "Erik Ohno Dagoberg",
  eviandon: "Milo Manheim",
  pigmanbigman: "Nicholas Hamilton",
  "10w5l": "Jacob Moskovitz",
  willyboyp: "Will Price",
  bigdicksenior: "Sam Labovitz",
  darryluvr: "Travis Roy Rogers",
  chrissy511: "Christian Engelhardt",
  papicoop: "Jakob Cooper",
  millsberry27: "Miles Elliot",
};

const h2hEls = {
  managerA: document.querySelector("#h2h-manager-a"),
  managerB: document.querySelector("#h2h-manager-b"),
  series: document.querySelector("#h2h-series"),
  seriesNote: document.querySelector("#h2h-series-note"),
  points: document.querySelector("#h2h-points"),
  pointsNote: document.querySelector("#h2h-points-note"),
  margin: document.querySelector("#h2h-margin"),
  marginNote: document.querySelector("#h2h-margin-note"),
  log: document.querySelector("#h2h-log"),
  logNote: document.querySelector("#h2h-log-note"),
};

let h2hMatchups = [...(H2H_DATA.matchups || [])];
let managerStats = buildManagerStats(h2hMatchups);
let weekStats = buildWeekStats(h2hMatchups);
let seasonStats = buildSeasonStats(h2hMatchups);

initH2H();

async function initH2H() {
  const currentMatchups = await loadCompletedSleeperMatchups();
  h2hMatchups = mergeMatchups(H2H_DATA.matchups || [], currentMatchups);
  managerStats = buildManagerStats(h2hMatchups);
  weekStats = buildWeekStats(h2hMatchups);
  seasonStats = buildSeasonStats(h2hMatchups);

  const managers = [...new Set([...(H2H_DATA.managers || []), ...h2hMatchups.flatMap((game) => game.managers)])].sort();
  if (!managers.length) return;
  h2hEls.managerA.innerHTML = placeholderOption("Manager 1") + managers.map((manager) => option(manager)).join("");
  h2hEls.managerB.innerHTML = placeholderOption("Manager 2") + managers.map((manager) => option(manager)).join("");
  h2hEls.managerA.addEventListener("change", syncComparison);
  h2hEls.managerB.addEventListener("change", syncComparison);
  syncComparison();
}

function placeholderOption(label) {
  return `<option value="">${escapeHtml(label)}</option>`;
}

function option(manager) {
  return `<option value="${escapeHtml(manager)}">${escapeHtml(manager)}</option>`;
}

function syncComparison() {
  if (h2hEls.managerA.value && h2hEls.managerA.value === h2hEls.managerB.value) {
    const managers = [...h2hEls.managerB.options].map((optionEl) => optionEl.value);
    const replacement = managers.find((manager) => manager !== h2hEls.managerA.value);
    h2hEls.managerB.value = replacement || h2hEls.managerB.value;
  }
  renderComparison(h2hEls.managerA.value, h2hEls.managerB.value);
}

function renderComparison(a, b) {
  if (!a || !b) {
    renderEmptyComparison();
    return;
  }

  const games = h2hMatchups
    .filter((game) => game.managers.includes(a) && game.managers.includes(b))
    .sort((left, right) => right.season - left.season || left.week - right.week);
  const summary = summarizeSeries(a, b, games);

  h2hEls.series.textContent = games.length ? `${summary.aWins}-${summary.bWins}${summary.ties ? `-${summary.ties}` : ""}` : "0-0";
  h2hEls.seriesNote.textContent = games.length ? `${a} vs ${b}` : "No recorded meetings yet.";
  const pointDiff = Math.abs(summary.aPoints - summary.bPoints);
  const pointLeader = summary.aPoints === summary.bPoints ? "Even" : summary.aPoints > summary.bPoints ? a : b;
  h2hEls.points.textContent = games.length ? `${summary.aPoints.toFixed(2)} - ${summary.bPoints.toFixed(2)}` : "--";
  h2hEls.pointsNote.textContent = games.length
    ? `${pointLeader}${pointLeader === "Even" ? "" : ` leads by ${pointDiff.toFixed(2)} total points`}.`
    : "Pick a pair with meetings.";
  h2hEls.margin.textContent = games.length ? `${summary.averageMargin.toFixed(2)} pts` : "--";
  h2hEls.marginNote.textContent = games.length ? marginFlavor(summary.averageMargin) : "No margins to measure.";

  h2hEls.logNote.textContent = games.length
    ? `${games.length} recorded matchup${games.length === 1 ? "" : "s"} from the Waxball archive.`
    : "No matchup log available for this pair.";
  h2hEls.log.innerHTML = games.length ? matchupBoardMarkup(games, a, b) : "";
}

function renderEmptyComparison() {
  h2hEls.series.textContent = "--";
  h2hEls.seriesNote.textContent = "Select two managers.";
  h2hEls.points.textContent = "--";
  h2hEls.pointsNote.textContent = "Total points will appear here.";
  h2hEls.margin.textContent = "--";
  h2hEls.marginNote.textContent = "Average margin will appear here.";
  h2hEls.logNote.textContent = "Select managers to load matchup history.";
  h2hEls.log.innerHTML = "";
}

async function loadCompletedSleeperMatchups() {
  try {
    const [league, state, rosters, users] = await Promise.all([
      h2hFetchJson(`/league/${H2H_CURRENT_LEAGUE_ID}`),
      h2hFetchJson("/state/nfl"),
      h2hFetchJson(`/league/${H2H_CURRENT_LEAGUE_ID}/rosters`),
      h2hFetchJson(`/league/${H2H_CURRENT_LEAGUE_ID}/users`),
    ]);
    const completedThrough = completedThroughWeek(league, state);
    if (completedThrough < 1) return [];
    const weeks = Array.from({ length: Math.min(completedThrough, 18) }, (_, index) => index + 1);
    const weekMatchups = await Promise.all(
      weeks.map(async (week) => [week, await h2hFetchOptionalJson(`/league/${H2H_CURRENT_LEAGUE_ID}/matchups/${week}`, [])]),
    );
    return weekMatchups.flatMap(([week, matchups]) => sleeperWeekToH2H(league, rosters, users, week, matchups));
  } catch (error) {
    console.warn("Unable to load current-season H2H matchups.", error);
    return [];
  }
}

function completedThroughWeek(league, state) {
  if (league?.status === "complete") return Number(league.settings?.last_scored_leg || league.settings?.leg || 18);
  const stateWeek = Number(state?.display_week || state?.week || 1);
  const leagueWeek = Number(league?.settings?.leg || stateWeek || 1);
  return Math.max(0, Math.min(stateWeek, leagueWeek) - 1);
}

function sleeperWeekToH2H(league, rosters, users, week, matchups) {
  const grouped = groupBy(matchups, (matchup) => matchup.matchup_id || matchup.roster_id);
  return [...grouped.values()]
    .filter((pair) => pair.length === 2)
    .map((pair) => {
      const [left, right] = pair;
      const leftRoster = rosters.find((roster) => roster.roster_id === left.roster_id);
      const rightRoster = rosters.find((roster) => roster.roster_id === right.roster_id);
      return {
        id: `${league.season || 2026}-w${week}-m${left.matchup_id || left.roster_id}`,
        season: Number(league.season || 2026),
        week,
        stage: "Regular season",
        managers: [h2hOwnerName(leftRoster, users), h2hOwnerName(rightRoster, users)],
        teams: [h2hTeamName(leftRoster, users), h2hTeamName(rightRoster, users)],
        scores: [Number(left.points || 0), Number(right.points || 0)],
      };
    })
    .filter((game) => game.managers.every(Boolean) && game.scores.some((score) => score > 0));
}

async function h2hFetchJson(path) {
  const response = await fetch(`${H2H_API_BASE}${path}`);
  if (!response.ok) throw new Error(`Sleeper returned ${response.status} for ${path}.`);
  return response.json();
}

async function h2hFetchOptionalJson(path, fallback) {
  try {
    return await h2hFetchJson(path);
  } catch {
    return fallback;
  }
}

function mergeMatchups(...groups) {
  const merged = new Map();
  groups.flat().forEach((game) => {
    if (game?.id) merged.set(game.id, game);
  });
  return [...merged.values()];
}

function h2hOwnerName(roster, users) {
  const user = users.find((candidate) => candidate.user_id === roster?.owner_id);
  const username = user?.username?.toLowerCase();
  if (username && H2H_OWNER_REAL_NAMES[username]) return H2H_OWNER_REAL_NAMES[username];
  return user?.display_name || user?.username || "";
}

function h2hTeamName(roster, users) {
  const user = users.find((candidate) => candidate.user_id === roster?.owner_id);
  return user?.metadata?.team_name?.trim() || user?.display_name || user?.username || `Roster ${roster?.roster_id || "?"}`;
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
        ${seasonGames.map((game) => matchupLogCard(game, a, b, games)).join("")}
      </section>
    `)
    .join("");
}

function matchupLogCard(game, a, b, seriesGames) {
  const ai = game.managers.indexOf(a);
  const bi = game.managers.indexOf(b);
  const aScore = Number(game.scores[ai]);
  const bScore = Number(game.scores[bi]);
  const aResult = aScore === bScore ? "T" : aScore > bScore ? "W" : "L";
  const bResult = aScore === bScore ? "T" : bScore > aScore ? "W" : "L";
  const badges = gameBadges(game, seriesGames);
  return `
    <article class="h2h-score-row">
      <div class="h2h-score-main">
        <span class="h2h-result ${resultClass(aResult)}">${escapeHtml(aResult)}</span>
        <strong class="h2h-score">${escapeHtml(aScore.toFixed(2))}</strong>
        <div class="h2h-row-detail">
          <span>Week ${escapeHtml(game.week)}</span>
          <small>${escapeHtml(game.stage)}</small>
        </div>
        <strong class="h2h-score">${escapeHtml(bScore.toFixed(2))}</strong>
        <span class="h2h-result ${resultClass(bResult)}">${escapeHtml(bResult)}</span>
      </div>
      ${badges.length ? `<div class="h2h-badges">${badges.map((badge) => `<span>${escapeHtml(badge)}</span>`).join("")}</div>` : ""}
    </article>
  `;
}

function gameBadges(game, seriesGames) {
  const badges = [];
  const tightest = [...seriesGames].sort((left, right) => margin(left) - margin(right))[0];
  const highest = [...seriesGames].sort((left, right) => total(right) - total(left))[0];
  const biggestSwing = [...seriesGames].sort((left, right) => margin(right) - margin(left))[0];
  if (tightest?.id === game.id) badges.push("Tightest matchup");
  if (highest?.id === game.id) badges.push("Highest-scoring matchup");
  if (biggestSwing?.id === game.id && seriesGames.length > 1) badges.push("Biggest swing");
  badges.push(...stageBadges(game));
  badges.push(...gameFacts(game));
  return [...new Set(badges)];
}

function stageBadges(game) {
  if (game.stage === "Championship") return ["Championship game"];
  if (game.stage === "Toilet Bowl final") return ["Toilet Bowl final"];
  if (game.stage === "Toilet Bowl placement") return ["Toilet Bowl placement"];
  if (game.stage === "Toilet Bowl") return ["Toilet Bowl"];
  if (game.stage === "3rd-place game") return ["3rd-place game"];
  if (game.stage === "5th-place game") return ["5th-place game"];
  if (game.stage === "Playoffs") return [`Playoff Week ${Math.max(1, Number(game.week) - 14)}`];
  return [];
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
    if (managerStat?.high?.score === score && managerStat.high.id === game.id) facts.push(`${firstName(manager)}'s highest ever score`);
    if (managerStat?.low?.score === score && managerStat.low.id === game.id) facts.push(`${firstName(manager)}'s lowest ever score`);
    if (weekStat?.high?.score === score && weekStat.high.id === game.id) facts.push(`League high score, Week ${game.week}`);
    if (weekStat?.low?.score === score && weekStat.low.id === game.id) facts.push(`League low score, Week ${game.week}`);
    if (seasonStat?.high?.score === score && seasonStat.high.id === game.id) facts.push(`Highest score of any team in ${game.season}`);
    if (seasonStat?.low?.score === score && seasonStat.low.id === game.id) facts.push(`Lowest score of any team in ${game.season}`);
  });
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

function firstName(name) {
  return String(name || "").split(/\s+/).filter(Boolean)[0] || "Manager";
}

function groupBy(items, keyFn) {
  return items.reduce((groups, item) => {
    const key = keyFn(item);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(item);
    return groups;
  }, new Map());
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
