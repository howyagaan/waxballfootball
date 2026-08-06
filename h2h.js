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
  rivalManager: document.querySelector("#h2h-rival-manager"),
  rivalStats: document.querySelector("#h2h-rival-stats"),
  rivalVerdict: document.querySelector("#h2h-rival-verdict"),
  managerA: document.querySelector("#h2h-manager-a"),
  managerB: document.querySelector("#h2h-manager-b"),
  stats: document.querySelector("#h2h-board-stats"),
  series: document.querySelector("#h2h-series"),
  seriesNote: document.querySelector("#h2h-series-note"),
  points: document.querySelector("#h2h-points"),
  pointsNote: document.querySelector("#h2h-points-note"),
  margin: document.querySelector("#h2h-margin"),
  marginNote: document.querySelector("#h2h-margin-note"),
  log: document.querySelector("#h2h-log"),
  logNote: document.querySelector("#h2h-log-note"),
  quirks: document.querySelector("#h2h-quirks"),
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
  populateRivalManagerSelect();
  populateManagerSelects();
  h2hEls.rivalManager?.addEventListener("change", syncRivalManager);
  h2hEls.managerA.addEventListener("change", syncComparison);
  h2hEls.managerB.addEventListener("change", syncComparison);
  h2hEls.quirks?.addEventListener("click", handleQuirkClick);
  syncComparison();
  syncRivalManager();
  renderH2HQuirks();
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

function populateRivalManagerSelect() {
  if (!h2hEls.rivalManager) return;
  const value = h2hEls.rivalManager.value;
  h2hEls.rivalManager.innerHTML = placeholderOption("Manager") + h2hManagers
    .map((manager) => option(manager))
    .join("");
  h2hEls.rivalManager.value = value || "";
}

function syncRivalManager() {
  renderRivalManager(h2hEls.rivalManager?.value || "");
}

function syncComparison() {
  if (h2hEls.managerA.value && h2hEls.managerA.value === h2hEls.managerB.value) {
    h2hEls.managerB.value = "";
  }
  populateManagerSelects();
  renderComparison(h2hEls.managerA.value, h2hEls.managerB.value);
}

function handleQuirkClick(event) {
  const entry = event.target.closest("[data-h2h-quirk-entry]");
  if (!entry) return;
  const managerA = entry.dataset.managerA;
  const managerB = entry.dataset.managerB;
  const gameIds = entry.dataset.gameIds ? entry.dataset.gameIds.split(",").filter(Boolean) : [];
  const highlightTarget = entry.dataset.highlightTarget || "";
  if (!managerA || !managerB) return;
  selectH2HPair(managerA, managerB, gameIds, highlightTarget);
}

function selectH2HPair(a, b, gameIds = [], highlightTarget = "") {
  h2hEls.managerA.value = "";
  h2hEls.managerB.value = "";
  populateManagerSelects();
  h2hEls.managerA.value = a;
  h2hEls.managerB.value = b;
  populateManagerSelects();
  renderComparison(h2hEls.managerA.value, h2hEls.managerB.value);
  document.querySelector("#compare")?.scrollIntoView({ behavior: "smooth", block: "start" });
  requestAnimationFrame(() => {
    if (gameIds.length) highlightH2HGames(gameIds);
    else if (highlightTarget === "record") highlightH2HRecord();
    else if (highlightTarget === "points") highlightH2HPoints();
    else if (highlightTarget === "margin") highlightH2HMargin();
  });
}

function clearH2HHighlights() {
  document.querySelectorAll(".h2h-score-row.is-highlighted, .h2h-board-stats article.is-highlighted").forEach((item) => {
    item.classList.remove("is-highlighted");
  });
}

function highlightH2HRecord() {
  highlightH2HStatCard("#h2h-record-card");
}

function highlightH2HPoints() {
  highlightH2HStatCard("#h2h-points-card");
}

function highlightH2HMargin() {
  highlightH2HStatCard("#h2h-margin-card");
}

function highlightH2HStatCard(selector) {
  clearH2HHighlights();
  const card = document.querySelector(selector);
  if (!card) return;
  card.classList.add("is-highlighted");
  card.scrollIntoView({ behavior: "smooth", block: "center" });
}

function highlightH2HGames(gameIds) {
  clearH2HHighlights();
  const rows = gameIds
    .map((gameId) => document.querySelector(`[data-game-id="${cssEscape(gameId)}"]`))
    .filter(Boolean);
  rows.forEach((row) => row.classList.add("is-highlighted"));
  if (rows[0]) {
    rows[0].scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

function highlightH2HGame(gameId) {
  highlightH2HGames([gameId]);
}

function renderComparison(a, b) {
  if (!a || !b) {
    renderEmptyComparison();
    return;
  }
  renderComparisonStatsShell();

  const games = h2hMatchups
    .filter((game) => game.managers.includes(a) && game.managers.includes(b))
    .sort((left, right) => right.season - left.season || left.week - right.week);
  const summary = summarizeSeries(a, b, games);

  h2hEls.series.innerHTML = games.length ? recordMarkup(a, b, summary) : "0-0";
  h2hEls.seriesNote.textContent = "";
  h2hEls.points.innerHTML = games.length ? pointsMarkup(a, b, summary) : "--";
  h2hEls.pointsNote.textContent = "";
  h2hEls.margin.innerHTML = games.length ? marginMarkup(summary) : "--";
  h2hEls.marginNote.textContent = "";

  h2hEls.logNote.innerHTML = games.length ? matchupSideLabels(a, b) : "No matchup log available for this pair.";
  h2hEls.log.innerHTML = games.length ? matchupBoardMarkup(games, a, b) : "";
}

function renderEmptyComparison() {
  renderComparisonStatsShell();
  h2hEls.series.textContent = "--";
  h2hEls.seriesNote.textContent = "Select two managers.";
  h2hEls.points.textContent = "--";
  h2hEls.pointsNote.textContent = "Total points will appear here.";
  h2hEls.margin.textContent = "--";
  h2hEls.marginNote.textContent = "Average margin will appear here.";
  h2hEls.logNote.textContent = "";
  h2hEls.log.innerHTML = "";
}

function renderComparisonStatsShell() {
  h2hEls.stats.innerHTML = `
    <article id="h2h-record-card">
      <span>Record</span>
      <strong id="h2h-series">--</strong>
      <p id="h2h-series-note"></p>
    </article>
    <article id="h2h-points-card">
      <span>Total points</span>
      <strong id="h2h-points">--</strong>
      <p id="h2h-points-note"></p>
    </article>
    <article id="h2h-margin-card">
      <span>Average margin</span>
      <strong id="h2h-margin">--</strong>
      <p id="h2h-margin-note"></p>
    </article>
  `;
  refreshH2HStatRefs();
}

function refreshH2HStatRefs() {
  h2hEls.series = document.querySelector("#h2h-series");
  h2hEls.seriesNote = document.querySelector("#h2h-series-note");
  h2hEls.points = document.querySelector("#h2h-points");
  h2hEls.pointsNote = document.querySelector("#h2h-points-note");
  h2hEls.margin = document.querySelector("#h2h-margin");
  h2hEls.marginNote = document.querySelector("#h2h-margin-note");
}

function renderRivalManager(manager) {
  if (!h2hEls.rivalStats || !h2hEls.rivalVerdict) return;
  if (!manager) {
    h2hEls.rivalStats.innerHTML = managerFactsEmptyMarkup();
    h2hEls.rivalVerdict.innerHTML = "";
    return;
  }
  const { facts, fiercest } = managerFacts(manager);
  h2hEls.rivalStats.innerHTML = facts.map(managerFactCard).join("");
  h2hEls.rivalVerdict.innerHTML = fiercest ? fierceVerdictMarkup(manager, fiercest) : "";
}

function managerFactCard(fact) {
  return `
    <article class="h2h-manager-fact">
      <span>${escapeHtml(fact.label)}</span>
      <strong>${escapeHtml(fact.value)}</strong>
      ${fact.note ? `<p>${escapeHtml(fact.note)}</p>` : ""}
    </article>
  `;
}

function managerFacts(manager) {
  const games = h2hMatchups.filter((game) => game.managers.includes(manager));
  const rivalries = managerRivalries(manager);
  const mostMatchups = topValues(rivalries, (rivalry) => rivalry.games.length, "max");
  const tightestGame = lowestBy(games, margin);
  const biggestWin = highestBy(games.filter((game) => managerScore(game, manager) > opponentScore(game, manager)), (game) => margin(game));
  const biggestLoss = highestBy(games.filter((game) => managerScore(game, manager) < opponentScore(game, manager)), (game) => margin(game));
  const fiercest = selectedFiercestRivalry(manager);
  const easiest = topValues(rivalries.filter((rivalry) => rivalry.pointEdgePerGame > 0), (rivalry) => rivalry.pointEdgePerGame, "max");
  const toughest = topValues(rivalries.filter((rivalry) => rivalry.pointEdgePerGame < 0), (rivalry) => Math.abs(rivalry.pointEdgePerGame), "max");

  return {
    facts: [
    {
      label: "Most matchups",
      value: rivalryNames(mostMatchups) || "None yet",
      note: mostMatchups.length ? `${mostMatchups[0].games.length} meetings` : "",
    },
    {
      label: "Tightest game",
      value: tightestGame ? opponentName(tightestGame, manager) : "None yet",
      note: tightestGame ? `${managerScore(tightestGame, manager).toFixed(2)}-${opponentScore(tightestGame, manager).toFixed(2)} | Week ${tightestGame.week}, ${tightestGame.season}` : "",
    },
    {
      label: "Biggest win",
      value: biggestWin ? opponentName(biggestWin, manager) : "None yet",
      note: biggestWin ? `+${margin(biggestWin).toFixed(2)} pts | Week ${biggestWin.week}, ${biggestWin.season}` : "",
    },
    {
      label: "Biggest loss",
      value: biggestLoss ? opponentName(biggestLoss, manager) : "None yet",
      note: biggestLoss ? `-${margin(biggestLoss).toFixed(2)} pts | Week ${biggestLoss.week}, ${biggestLoss.season}` : "",
    },
    {
      label: "Easiest manager",
      value: rivalryNames(easiest) || "None yet",
      note: easiest.length ? `+${easiest[0].pointEdgePerGame.toFixed(2)} pts avg.` : "",
    },
    {
      label: "Toughest manager",
      value: rivalryNames(toughest) || "None yet",
      note: toughest.length ? `${toughest[0].pointEdgePerGame.toFixed(2)} pts avg.` : "",
    },
  ],
    fiercest,
  };
}

function managerFactsEmptyMarkup() {
  return [
    "Most matchups",
    "Tightest game",
    "Biggest win",
    "Biggest loss",
    "Easiest manager",
    "Toughest manager",
  ].map((label) => `
    <article class="h2h-manager-fact">
      <span>${escapeHtml(label)}</span>
      <strong>--</strong>
    </article>
  `).join("");
}

function fierceVerdictMarkup(manager, rivalry) {
  const score = rivalryScoreOutOf100(rivalry);
  return `
    <div class="h2h-rival-score">
      <span>Rivalry score</span>
      <strong>${score}/100</strong>
    </div>
    <span>Fiercest rival</span>
    <strong>${escapeHtml(shortManagerName(rivalry.opponent))}</strong>
    <p>${escapeHtml(fierceVerdictNote(manager, rivalry))}</p>
  `;
}

function fierceVerdictNote(manager, rivalry) {
  const record = rivalryRecord(rivalry);
  const edge = rivalry.pointEdgePerGame;
  const gamesPlayed = rivalry.games.length;
  const postseasonCount = rivalry.games.filter((game) => game.stage !== "Regular season").length;
  const biggestStake = highestBy(rivalry.games, gameStakeWeight);
  const stakeLabel = biggestStake && gameStakeWeight(biggestStake) ? stageBadges(biggestStake)[0] || biggestStake.stage : "";
  const meetingsText = `${gamesPlayed} meeting${gamesPlayed === 1 ? "" : "s"}`;
  const postseasonText = postseasonCount
    ? `, ${postseasonCount} of them with postseason stakes`
    : "";
  const edgeText = Math.abs(edge) < 0.005
    ? "the scoring is basically dead even"
    : edge > 0
      ? `${firstName(manager)} has the scoring edge by ${edge.toFixed(2)} pts a game`
      : `${firstName(rivalry.opponent)} has the scoring edge by ${Math.abs(edge).toFixed(2)} pts a game`;
  const stakeText = stakeLabel ? ` The biggest swing came in a ${stakeLabel.toLowerCase()}, which gives it extra weight.` : "";
  return `This one has the best mix of history, tension, and stakes: ${meetingsText}${postseasonText}, a ${record} record, an average margin of ${rivalry.averageMargin.toFixed(2)} pts, and ${edgeText}.${stakeText}`;
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
      <span class="h2h-stat-piece ${bClass}">${escapeHtml(firstName(b).toUpperCase())} ${summary.bPoints.toFixed(2)}</span>
    </span>
  `;
}

function marginMarkup(summary) {
  return `<span class="h2h-stat-piece neutral">${summary.averageMargin.toFixed(2)} pts</span>`;
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

function managerRivalries(manager) {
  return h2hManagers
    .filter((opponent) => opponent !== manager)
    .map((opponent) => {
      const games = h2hMatchups.filter((game) => game.managers.includes(manager) && game.managers.includes(opponent));
      if (!games.length) return null;
      const summary = summarizeSeries(manager, opponent, games);
      const pointEdgePerGame = (summary.aPoints - summary.bPoints) / games.length;
      return {
        manager,
        opponent,
        games,
        summary,
        averageMargin: summary.averageMargin,
        pointEdgePerGame,
      };
    })
    .filter(Boolean);
}

function selectedFiercestRivalry(manager) {
  const pairs = pairSummaries().filter((pair) => pair.managers.includes(manager));
  if (!pairs.length) return null;
  const topByManager = new Map(h2hManagers.map((candidate) => {
    const candidatePairs = pairsForManager(candidate);
    const topPair = highestBy(candidatePairs, fiercestRivalScore);
    return [candidate, topPair?.key || ""];
  }));
  const inbound = pairs.filter((pair) => {
    const opponent = pair.managers.find((candidate) => candidate !== manager);
    return opponent && topByManager.get(opponent) === pair.key;
  });
  const pair = highestBy(inbound.length ? inbound : pairs, fiercestRivalScore);
  return pair ? rivalryFromPair(manager, pair) : null;
}

function pairsForManager(manager) {
  return pairSummaries().filter((pair) => pair.managers.includes(manager));
}

function rivalryFromPair(manager, pair) {
  const opponent = pair.managers.find((candidate) => candidate !== manager);
  const summary = summarizeSeries(manager, opponent, pair.games);
  return {
    manager,
    opponent,
    games: pair.games,
    summary,
    averageMargin: summary.averageMargin,
    pointEdgePerGame: (summary.aPoints - summary.bPoints) / pair.games.length,
  };
}

function managerScore(game, manager) {
  return Number(game.scores[game.managers.indexOf(manager)] || 0);
}

function opponentScore(game, manager) {
  return Number(game.scores[game.managers.findIndex((candidate) => candidate !== manager)] || 0);
}

function opponentName(game, manager) {
  const opponent = game.managers.find((candidate) => candidate !== manager) || "";
  return shortManagerName(opponent);
}

function topValues(items, scoreFn, mode) {
  if (!items.length) return [];
  const scorer = mode === "min" ? lowestBy : highestBy;
  const winner = scorer(items, scoreFn);
  if (!winner) return [];
  const winningScore = scoreFn(winner);
  return items.filter((item) => scoresMatch(scoreFn(item), winningScore));
}

function rivalryNames(rivalries) {
  return rivalries.map((rivalry) => shortManagerName(rivalry.opponent)).join(" / ");
}

function rivalryRecord(rivalry) {
  const { aWins, bWins, ties } = rivalry.summary;
  return ties ? `${aWins}-${bWins}-${ties}` : `${aWins}-${bWins}`;
}

function fiercestRivalScore(rivalry) {
  const { aWins, bWins, ties } = rivalry.summary;
  const gamesPlayed = rivalry.games.length;
  const recordGap = Math.abs(aWins - bWins) / gamesPlayed;
  const recordBalance = 1 - recordGap;
  const closeness = 86 / (rivalry.averageMargin + 4);
  const meetings = gamesPlayed * 5.5;
  const stakes = rivalry.games.reduce((sum, game) => sum + gameStakeWeight(game), 0);
  const scoringJuice = rivalry.games.reduce((sum, game) => sum + total(game), 0) / gamesPlayed / 20;
  const tiesBonus = ties * 3;
  return closeness + meetings + stakes + (recordBalance * 20) + scoringJuice + tiesBonus;
}

function rivalryScoreOutOf100(rivalry) {
  return Math.max(1, Math.min(100, Math.round(fiercestRivalScore(rivalry))));
}

function gameStakeWeight(game) {
  const finalBadge = finalWeekPlacementBadge(game);
  if (finalBadge === "Championship game") return 34;
  if (finalBadge === "Toilet Bowl final") return 32;
  if (finalBadge === "3rd-place game") return 22;
  if (finalBadge === "5th-place game") return 16;
  if (finalBadge === "7th-place game") return 13;
  if (game.stage === "Championship") return 34;
  if (game.stage === "Toilet Bowl final") return 32;
  if (game.stage === "3rd-place game") return 22;
  if (game.stage === "5th-place game") return 16;
  if (game.stage === "Playoffs") return 20;
  if (game.stage === "Toilet Bowl") return 18;
  if (game.stage === "Toilet Bowl placement") return 12;
  return 0;
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
    <article class="h2h-score-row" data-game-id="${escapeHtml(game.id)}">
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

function renderH2HQuirks() {
  if (!h2hEls.quirks) return;
  const quirks = buildH2HQuirks();
  h2hEls.quirks.innerHTML = quirks.map(quirkCard).join("");
}

function buildH2HQuirks() {
  const pairs = pairSummaries();
  const withMultiple = pairs.filter((pair) => pair.games.length >= 2);
  const postseasonPairs = pairs.filter((pair) => pair.specialGames.length);
  return [
    quirkGroup("Tightest game", pairs, "min", (pair) => margin(pair.tightest), (value) => `${value.toFixed(2)} pts`, (pair) => [pair.tightest.id], "", null, (pair) => gameSideTones(pair, pair.tightest)),
    quirkGroup("Biggest blowout", pairs, "max", (pair) => margin(pair.biggestMargin), (value) => `${value.toFixed(2)} pts`, (pair) => [pair.biggestMargin.id], "", null, (pair) => gameSideTones(pair, pair.biggestMargin)),
    quirkGroup("Tightest rivalry", withMultiple, "min", (pair) => pair.averageMargin, (value) => `${value.toFixed(2)} pts avg.`, () => [], "margin", null, edgeSideTones),
    quirkGroup("Most one-sided rivalry", withMultiple, "max", (pair) => pair.pointEdgePerGame, (value) => `${value.toFixed(2)} pts avg.`, () => [], "record", null, edgeSideTones),
    quirkGroup("Highest-scoring rivalry", withMultiple, "max", (pair) => pair.averageTotal, (value) => `${value.toFixed(2)} pts avg.`, () => [], "points"),
    quirkGroup("Lowest-scoring rivalry", withMultiple, "min", (pair) => pair.averageTotal, (value) => `${value.toFixed(2)} pts avg.`, () => [], "points"),
    quirkGroup("Most meetings", pairs, "max", (pair) => pair.games.length, (value) => `${value}`, () => [], "record"),
    quirkGroup("Most postseason matchups", postseasonPairs, "max", (pair) => pair.specialGames.length, (value) => `${value}`, (pair) => pair.specialGames.map((game) => game.id)),
  ].filter(Boolean);
}

function quirkGroup(title, pairs, mode, scoreFn, valueFn, gameIdsFn, highlightTarget = "", detailFn = null, sideToneFn = null) {
  if (!pairs.length) return null;
  const scorer = mode === "min" ? lowestBy : highestBy;
  const winner = scorer(pairs, scoreFn);
  if (!winner) return null;
  const winningScore = scoreFn(winner);
  const entries = pairs
    .filter((pair) => scoresMatch(scoreFn(pair), winningScore))
    .map((pair) => quirkEntry(pair, gameIdsFn, highlightTarget, detailFn, sideToneFn));
  return {
    title,
    value: valueFn(winningScore),
    entries,
  };
}

function quirkCard(quirk) {
  if (quirk.entries.length === 1) {
    return quirkSingleEntryCard(quirk, quirk.entries[0]);
  }
  return `
    <article class="h2h-quirk-card">
      <span>${escapeHtml(quirk.title)}</span>
      <strong>${escapeHtml(quirk.value)}</strong>
      <div class="h2h-quirk-options">
        ${quirk.entries.map(quirkEntryButton).join("")}
      </div>
    </article>
  `;
}

function quirkSingleEntryCard(quirk, entry) {
  return `
    <button class="h2h-quirk-card h2h-quirk-card-button" type="button" data-h2h-quirk-entry data-manager-a="${escapeHtml(entry.managerA)}" data-manager-b="${escapeHtml(entry.managerB)}" data-game-ids="${escapeHtml(entry.gameIds.join(","))}" data-highlight-target="${escapeHtml(entry.highlightTarget)}">
      <span>${escapeHtml(quirk.title)}</span>
      <strong>${escapeHtml(quirk.value)}</strong>
      ${quirkPairMarkup(entry, true)}
      ${entry.detail ? `<small>${escapeHtml(entry.detail)}</small>` : ""}
    </button>
  `;
}

function quirkEntry(pair, gameIdsFn, highlightTarget = "", detailFn = null, sideToneFn = null) {
  return {
    managerA: pair.managers[0],
    managerB: pair.managers[1],
    gameIds: gameIdsFn(pair),
    highlightTarget,
    detail: detailFn ? detailFn(pair) : "",
    sideTones: sideToneFn ? sideToneFn(pair) : { a: "neutral", b: "neutral" },
  };
}

function quirkEntryButton(entry) {
  return `
    <button class="h2h-quirk-entry" type="button" data-h2h-quirk-entry data-manager-a="${escapeHtml(entry.managerA)}" data-manager-b="${escapeHtml(entry.managerB)}" data-game-ids="${escapeHtml(entry.gameIds.join(","))}" data-highlight-target="${escapeHtml(entry.highlightTarget)}">
      ${quirkPairMarkup(entry)}
      ${entry.detail ? `<small>${escapeHtml(entry.detail)}</small>` : ""}
    </button>
  `;
}

function quirkPairMarkup(entry, goodFirst = false) {
  const sides = [
    { manager: entry.managerA, tone: entry.sideTones.a },
    { manager: entry.managerB, tone: entry.sideTones.b },
  ];
  if (goodFirst && sides[1].tone === "good" && sides[0].tone !== "good") {
    sides.reverse();
  }
  return `
    <span class="h2h-quirk-pair">
      <span class="h2h-quirk-name ${escapeHtml(toneClass(sides[0].tone))}">${escapeHtml(shortManagerName(sides[0].manager))}</span>
      <span class="h2h-quirk-vs">vs</span>
      <span class="h2h-quirk-name ${escapeHtml(toneClass(sides[1].tone))}">${escapeHtml(shortManagerName(sides[1].manager))}</span>
    </span>
  `;
}

function toneClass(tone) {
  if (tone === "good") return "is-good";
  if (tone === "bad") return "is-bad";
  return "is-neutral";
}

function gameSideTones(pair, game) {
  const pairGameIndexes = pair.managers.map((manager) => game.managers.indexOf(manager));
  const scores = pairGameIndexes.map((index) => Number(game.scores[index] || 0));
  if (scores[0] === scores[1]) return { a: "neutral", b: "neutral" };
  return scores[0] > scores[1] ? { a: "good", b: "bad" } : { a: "bad", b: "good" };
}

function edgeSideTones(pair) {
  if (Math.abs(pair.points[0] - pair.points[1]) < 0.005) return { a: "neutral", b: "neutral" };
  return pair.points[0] > pair.points[1] ? { a: "good", b: "bad" } : { a: "bad", b: "good" };
}

function pairSummaries() {
  const pairs = groupBy(h2hMatchups, (game) => pairKey(game.managers));
  return [...pairs.entries()].map(([key, games]) => {
    const managers = key.split("||");
    const sortedGames = [...games].sort((left, right) => right.season - left.season || left.week - right.week);
    const totals = sortedGames.map(total);
    const margins = sortedGames.map(margin);
    const summary = summarizeSeries(managers[0], managers[1], sortedGames);
    const points = managers.map((manager) => sortedGames.reduce((sum, game) => {
      const index = game.managers.indexOf(manager);
      return sum + Number(game.scores[index] || 0);
    }, 0));
    const edge = Math.abs(points[0] - points[1]) / sortedGames.length;
    return {
      key,
      managers,
      games: sortedGames,
      summary,
      latest: sortedGames[0],
      tightest: lowestBy(sortedGames, margin),
      highestTotal: highestBy(sortedGames, total),
      biggestMargin: highestBy(sortedGames, margin),
      specialGames: sortedGames.filter((game) => game.stage !== "Regular season"),
      averageMargin: margins.reduce((sum, value) => sum + value, 0) / margins.length,
      averageTotal: totals.reduce((sum, value) => sum + value, 0) / totals.length,
      pointEdgePerGame: edge,
      points,
      edgeLeaderFirst: firstName(points[0] >= points[1] ? managers[0] : managers[1]),
      edgeLeaderShort: shortManagerName(points[0] >= points[1] ? managers[0] : managers[1]),
    };
  });
}

function gameBadges(game, seriesGames) {
  const badges = [];
  const tightest = [...seriesGames].sort((left, right) => margin(left) - margin(right))[0];
  const highest = [...seriesGames].sort((left, right) => total(right) - total(left))[0];
  const biggestSwing = [...seriesGames].sort((left, right) => margin(right) - margin(left))[0];
  if (tightest?.id === game.id) badges.push("Tightest matchup");
  if (highest?.id === game.id) badges.push("Highest-scoring matchup");
  if (biggestSwing?.id === game.id && seriesGames.length > 1) badges.push("Biggest blowout");
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
  if (name === "Miles Blue") return "Miles B";
  if (name === "Miles Elliot") return "Miles E";
  return String(name || "").split(/\s+/).filter(Boolean)[0] || "Manager";
}

function shortManagerName(name) {
  return firstName(name);
}

function pairKey(managers) {
  return [...managers].sort().join("||");
}

function scoresMatch(left, right) {
  return Math.abs(Number(left) - Number(right)) < 0.0001;
}

function lowestBy(items, scoreFn) {
  return items.reduce((best, item) => (best && scoreFn(best) <= scoreFn(item) ? best : item), null);
}

function highestBy(items, scoreFn) {
  return items.reduce((best, item) => (best && scoreFn(best) >= scoreFn(item) ? best : item), null);
}

function groupBy(items, keyFn) {
  return items.reduce((groups, item) => {
    const key = keyFn(item);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(item);
    return groups;
  }, new Map());
}

function cssEscape(value) {
  if (window.CSS?.escape) return CSS.escape(value);
  return String(value).replaceAll('"', '\\"').replaceAll("\\", "\\\\");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
