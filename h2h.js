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
let h2hManagers = [];

initH2H();
refreshH2HLeagueAvatar();

async function initH2H() {
  const currentMatchups = await loadCompletedSleeperMatchups();
  h2hMatchups = mergeMatchups(H2H_DATA.matchups || [], currentMatchups);
  managerStats = buildManagerStats(h2hMatchups);
  weekStats = buildWeekStats(h2hMatchups);
  seasonStats = buildSeasonStats(h2hMatchups);

  h2hManagers = [...new Set([...(H2H_DATA.managers || []), ...h2hMatchups.flatMap((game) => game.managers)])].sort();
  if (!h2hManagers.length) return;
  populateManagerSelects();
  h2hEls.managerA.addEventListener("change", syncComparison);
  h2hEls.managerB.addEventListener("change", syncComparison);
  syncComparison();
}

async function refreshH2HLeagueAvatar() {
  try {
    const league = await h2hFetchJson(`/league/${H2H_CURRENT_LEAGUE_ID}`);
    if (!league?.avatar) return;
    const avatarSrc = `https://sleepercdn.com/avatars/thumbs/${league.avatar}`;
    const brandMark = document.querySelector("#league-brand-mark");
    if (brandMark) {
      brandMark.innerHTML = `<img alt="" src="${avatarSrc}" />`;
      brandMark.classList.add("has-image");
    }
    const icon = document.querySelector('link[rel="icon"]') || document.createElement("link");
    icon.rel = "icon";
    icon.href = avatarSrc;
    icon.type = "image/png";
    if (!icon.parentNode) document.head.appendChild(icon);
    const touchIcon = document.querySelector('link[rel="apple-touch-icon"]') || document.createElement("link");
    touchIcon.rel = "apple-touch-icon";
    touchIcon.href = avatarSrc;
    if (!touchIcon.parentNode) document.head.appendChild(touchIcon);
  } catch (error) {
    // Keep the baked-in avatar if Sleeper is unreachable.
  }
}

function placeholderOption(label) {
  return `<option value="" disabled hidden>${escapeHtml(label)}</option>`;
}

function option(manager) {
  return `<option value="${escapeHtml(manager)}">${escapeHtml(manager)}</option>`;
}

function populateManagerSelects() {
  const aValue = h2hEls.managerA.value;
  const bValue = h2hEls.managerB.value;
  h2hEls.managerA.innerHTML = placeholderOption("Manager 1") + h2hManagers
    .filter((manager) => manager !== bValue)
    .map((manager) => option(manager))
    .join("");
  h2hEls.managerB.innerHTML = placeholderOption("Manager 2") + h2hManagers
    .filter((manager) => manager !== aValue)
    .map((manager) => option(manager))
    .join("");
  h2hEls.managerA.value = aValue && aValue !== bValue ? aValue : "";
  h2hEls.managerB.value = bValue && bValue !== aValue ? bValue : "";
}

function syncComparison() {
  if (h2hEls.managerA.value && h2hEls.managerA.value === h2hEls.managerB.value) {
    h2hEls.managerB.value = "";
  }
  populateManagerSelects();
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

  h2hEls.series.innerHTML = games.length ? recordMarkup(a, b, summary) : "0-0";
  h2hEls.seriesNote.textContent = "";
  h2hEls.points.innerHTML = games.length ? pointsMarkup(a, b, summary) : "--";
  h2hEls.pointsNote.textContent = "";
  h2hEls.margin.innerHTML = games.length ? marginMarkup(a, b, summary, games.length) : "--";
  h2hEls.marginNote.textContent = "";

  h2hEls.logNote.innerHTML = games.length ? matchupSideLabels(a, b) : "No matchup log available for this pair.";
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

function recordMarkup(a, b, summary) {
  const aClass = summary.aWins === summary.bWins ? "neutral" : summary.aWins > summary.bWins ? "good" : "bad";
  const bClass = summary.aWins === summary.bWins ? "neutral" : summary.bWins > summary.aWins ? "good" : "bad";
  const tieText = summary.ties ? `<span class="h2h-stat-neutral">-${summary.ties}</span>` : "";
  return `
    <span class="h2h-record-line">
      <span class="h2h-stat-piece ${aClass}">${escapeHtml(firstName(a).toUpperCase())} ${summary.aWins}</span>
      <span class="h2h-stat-neutral">-</span>
      <span class="h2h-stat-piece ${bClass}">${summary.bWins} ${escapeHtml(firstName(b).toUpperCase())}</span>${tieText}
    </span>
  `;
}

function pointsMarkup(a, b, summary) {
  const aClass = summary.aPoints === summary.bPoints ? "neutral" : summary.aPoints > summary.bPoints ? "good" : "bad";
  const bClass = summary.aPoints === summary.bPoints ? "neutral" : summary.bPoints > summary.aPoints ? "good" : "bad";
  return `
    <span class="h2h-points-stack">
      <span class="h2h-stat-piece ${aClass}">${escapeHtml(firstName(a).toUpperCase())} ${summary.aPoints.toFixed(2)}</span>
      <span class="h2h-points-divider" aria-hidden="true"></span>
      <span class="h2h-stat-piece ${bClass}">${summary.bPoints.toFixed(2)} ${escapeHtml(firstName(b).toUpperCase())}</span>
    </span>
  `;
}

function marginMarkup(a, b, summary, gamesPlayed) {
  const edge = gamesPlayed ? (summary.aPoints - summary.bPoints) / gamesPlayed : 0;
  if (!edge) return `<span class="h2h-stat-piece neutral">EVEN</span>`;
  const leader = edge > 0 ? a : b;
  return `<span class="h2h-stat-piece good">${escapeHtml(firstName(leader).toUpperCase())} +${Math.abs(edge).toFixed(2)} pts</span>`;
}

function matchupSideLabels(a, b) {
  return `
    <span>${escapeHtml(firstName(a).toUpperCase())}</span>
    <span>${escapeHtml(firstName(b).toUpperCase())}</span>
  `;
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
  if (biggestSwing?.id === game.id && seriesGames.length > 1) badges.push("Biggest point difference");
  badges.push(...stageBadges(game));
  badges.push(...gameFacts(game));
  return [...new Set(badges)];
}

function stageBadges(game) {
  const finalWeekBadge = finalWeekPlacementBadge(game);
  if (finalWeekBadge) return [finalWeekBadge];
  if (game.stage === "Championship") return ["Championship game"];
  if (game.stage === "Toilet Bowl final") return ["Toilet Bowl final"];
  if (game.stage === "Toilet Bowl placement") return [toiletPlacementBadge(game)];
  if (game.stage === "Toilet Bowl") return [`Toilet Bowl Week ${toiletBowlWeek(game)}`];
  if (game.stage === "3rd-place game") return ["3rd-place game"];
  if (game.stage === "5th-place game") return ["5th-place game"];
  if (game.stage === "Playoffs") return [`Playoff Week ${Math.max(1, Number(game.week) - 14)}`];
  return [];
}

function finalWeekPlacementBadge(game) {
  const season = Number(game.season);
  const week = Number(game.week);
  const teams = game.teams || [];
  if (game.stage === "Championship") return "Championship game";
  if (game.stage === "3rd-place game") return "3rd-place game";
  if (game.stage === "5th-place game") return "5th-place game";
  if (game.stage === "Toilet Bowl final") return "Toilet Bowl final";
  if (season === 2024 && week === 16 && teams.includes("Balls? Say Less.") && teams.includes("blueball")) return "5th-place game";
  if (season === 2024 && week === 16 && teams.includes("Leaping Jesters") && teams.includes("Daddy Campbell")) return "7th-place game";
  if (season === 2025 && week === 17 && game.stage === "Toilet Bowl placement") return "7th-place game";
  return "";
}

function toiletPlacementBadge(game) {
  if (Number(game.season) === 2025 && Number(game.week) === 16) return "7th-place game";
  return `Toilet Bowl Week ${toiletBowlWeek(game)}`;
}

function toiletBowlWeek(game) {
  return Math.max(1, Number(game.week) - 14);
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
    const name = firstName(manager);
    if (managerStat?.high?.score === score && managerStat.high.id === game.id) facts.push(`${name} - Highest ever score`);
    if (managerStat?.low?.score === score && managerStat.low.id === game.id) facts.push(`${name} - Lowest ever score`);
    if (weekStat?.high?.score === score && weekStat.high.id === game.id) facts.push(`${name} - League high score, Week ${game.week} ${game.season}`);
    if (weekStat?.low?.score === score && weekStat.low.id === game.id) facts.push(`${name} - League low score, Week ${game.week} ${game.season}`);
    if (seasonStat?.high?.score === score && seasonStat.high.id === game.id) facts.push(`${name} - Highest score of any team in ${game.season}`);
    if (seasonStat?.low?.score === score && seasonStat.low.id === game.id) facts.push(`${name} - Lowest score of any team in ${game.season}`);
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
