const API_BASE = "https://api.sleeper.app/v1";
const ESPN_BASE = "https://site.api.espn.com/apis/site/v2/sports/football/nfl";
const CURRENT_LEAGUE_ID = "1312219624808419328";
const ARCHIVE_2025_LEAGUE_ID = "1253094778665439232";
const ARCHIVE_2025_DRAFT_ID = "1253094779571421184";
const AUTO_REFRESH_MS = 120000;
const WEEKS = Array.from({ length: 18 }, (_, index) => index + 1);
const PAGE = document.body.dataset.page || "current";
const EASTERN_TIME_ZONE = "America/New_York";
const PRESEASON_END_DATE_KEY = "2026-09-08";
const NFL_SCHEDULE_START = "20260909";
const NFL_SCHEDULE_END = "20270110";
const NFL_SCHEDULE_CACHE_KEY = "waxball-2026-nfl-schedule";
const QUERY_PARAMS = new URLSearchParams(window.location.search);
const MODE_PREVIEW = QUERY_PARAMS.get("mode");
const SEASON_PREVIEW = QUERY_PARAMS.get("season");
const WEEK_PREVIEW = Number(QUERY_PARAMS.get("week"));
const DATE_PREVIEW = QUERY_PARAMS.get("date");
const SHOWCASE_PREVIEW = QUERY_PARAMS.get("showcase");
const WEEK7_SHOWCASE_DAYS = {
  "week7-monday": { day: "monday", date: "2025-10-20", mode: "mnf" },
  "week7-tuesday": { day: "tuesday", date: "2025-10-14", mode: "midweek" },
  "week7-wednesday": { day: "wednesday", date: "2025-10-15", mode: "midweek" },
  "week7-thursday": { day: "thursday", date: "2025-10-16", mode: "tnf" },
  "week7-friday": { day: "friday", date: "2025-10-17", mode: "midweekend" },
  "week7-saturday": { day: "saturday", date: "2025-10-18", mode: "midweekend" },
  "week7-sunday": { day: "sunday", date: "2025-10-19", mode: "snf" },
};
const ARTICLES_2026 = [
  /*
  {
    week: 1,
    headline: "Week 1 - Headline goes here",
    url: "https://www.nicholaswhamilton.com/waxball2026/week1",
    thumbnail: "./assets/articles/2026-week1.jpg",
    published: true,
    publishedAt: "2026-09-15",
  },
  */
];
const OWNER_REAL_NAMES = {
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
const els = {
  status: document.querySelector("#status-message"),
  statusDot: document.querySelector("#status-dot"),
  heroModeLabel: document.querySelector("#hero-mode-label"),
  heroTitle: document.querySelector(".hero h1"),
  heroCopy: document.querySelector("#hero-copy"),
  sleeperLink: document.querySelector('.hero-actions a[href*="sleeper.com"]'),
  brandMark: document.querySelector("#league-brand-mark"),
  season: document.querySelector("#season-metric"),
  week: document.querySelector("#week-metric"),
  teamMetric: document.querySelector("#team-metric"),
  toiletLabel: document.querySelector("#toilet-label"),
  leaderLabel: document.querySelector("#leader-label"),
  champion: document.querySelector("#champion-metric"),
  teamSelect: document.querySelector("#team-select"),
  teamViewStatus: document.querySelector("#team-view-status"),
  teamPanel: document.querySelector("#team-panel"),
  teamPanelSection: document.querySelector("#team-panel-section"),
  weeklySlateSection: document.querySelector("#weekly-slate-section"),
  midweekArticleSection: document.querySelector("#midweek-article-section"),
  midweekArticleCard: document.querySelector("#midweek-article-card"),
  articlesGrid: document.querySelector("#articles-grid"),
  articlesEmpty: document.querySelector("#articles-empty"),
  gamedayTitle: document.querySelector("#gameday-title"),
  gamedayCopy: document.querySelector("#gameday-copy"),
  watchList: document.querySelector("#watch-list"),
  standingsTitle: document.querySelector("#standings-title"),
  standingsNote: document.querySelector("#standings-note"),
  refreshStamp: document.querySelector("#refresh-stamp"),
  standings: document.querySelector("#standings-body"),
  weekSelect: document.querySelector("#week-select"),
  matchups: document.querySelector("#matchups-list"),
  notes: document.querySelector("#notes-list"),
  archiveSummary: document.querySelector("#archive-summary"),
  archiveBody: document.querySelector("#archive-body"),
  playoffSummary: document.querySelector("#playoff-summary"),
  playoffList: document.querySelector("#playoff-list"),
  transactionSummary: document.querySelector("#transaction-summary"),
  transactionList: document.querySelector("#transaction-list"),
  championCard: document.querySelector("#champion-card"),
  poopCard: document.querySelector("#poop-card"),
  runnerUpPrize: document.querySelector("#runner-up-prize"),
  thirdPlacePrize: document.querySelector("#third-place-prize"),
  archiveChampion: document.querySelector("#archive-champion"),
  archiveToilet: document.querySelector("#archive-toilet"),
};

let currentData = null;
let archiveData = null;
let nflData = null;
let currentWeek = 1;
let selectedRosterId = null;
let playersById = null;

init();

function init() {
  if (els.weekSelect) {
    buildWeekOptions();
    els.weekSelect.addEventListener("change", async () => {
      currentWeek = Number(els.weekSelect.value);
      if (currentData && !currentData.matchupsByWeek[currentWeek]) {
        currentData.matchupsByWeek[currentWeek] = await fetchOptionalJson(
          `/league/${currentData.league.league_id}/matchups/${currentWeek}`,
          [],
        );
      }
      renderMatchups(currentData?.matchupsByWeek[currentWeek] || [], currentData?.rosters || [], currentData?.users || [], currentWeek);
    });
  }
  if (els.teamSelect) {
    els.teamSelect.addEventListener("change", () => {
      selectedRosterId = els.teamSelect.value === "league" ? "league" : Number(els.teamSelect.value);
      renderSelectedTeam();
      if (currentData) renderStandings(currentData.rosters, currentData.users);
      if (selectedRosterId !== "league") scrollToLeagueTable();
    });
  }
  document.addEventListener("click", (event) => {
    const rosterTarget = event.target.closest("[data-roster-link]");
    if (rosterTarget) {
      selectedRosterId = Number(rosterTarget.dataset.rosterLink);
      if (els.teamSelect) els.teamSelect.value = String(selectedRosterId);
      renderSelectedTeam();
      if (currentData) renderStandings(currentData.rosters, currentData.users);
      scrollToLeagueTable();
      return;
    }

    const target = event.target.closest("[data-league-view]");
    if (!target) return;
    selectedRosterId = "league";
    if (els.teamSelect) els.teamSelect.value = "league";
    renderSelectedTeam();
    if (currentData) renderStandings(currentData.rosters, currentData.users);
    requestAnimationFrame(() => document.querySelector("#top")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  });

  loadAll();
  window.setInterval(loadAll, AUTO_REFRESH_MS);
}

async function loadAll() {
  setStatus("Syncing data...", "loading");
  try {
    const currentLeagueId = activeCurrentLeagueId();
    const [current, archive, nfl] = await Promise.all([
      loadSeason(currentLeagueId, {
        includeTransactions: true,
        matchupWeeks: isHistoricalCurrentPreview() || isWeek7Showcase() ? WEEKS : null,
      }),
      loadSeason(ARCHIVE_2025_LEAGUE_ID, {
        includeTransactions: PAGE === "archive",
        includeDraft: PAGE === "archive",
        matchupWeeks: PAGE === "current" ? WEEKS : null,
      }),
      loadNflContext(),
    ]);

    currentData = current;
    archiveData = archive;
    nflData = nfl;
    if (isWeek7Showcase()) {
      currentData.previewMode = "week7-showcase";
      currentData.league = { ...currentData.league, season: "2026", status: "in_season" };
      currentData.rosters = standingsThroughWeek(currentData.rosters, currentData.matchupsByWeek, 6);
      currentData.week = 7;
    }
    if (isHistoricalCurrentPreview()) {
      currentData.previewMode = "historical-current";
      currentData.rosters = standingsThroughWeek(currentData.rosters, currentData.matchupsByWeek, previewWeek() - 1);
      currentData.week = previewWeek();
    }
    currentWeek = previewWeek() || currentData.week;
    if (els.weekSelect) els.weekSelect.value = String(currentWeek);

    if (PAGE === "archive") renderArchivePage();
    else if (PAGE === "articles") renderArticlesPage();
    else renderCurrentPage();

    setStatus(`Auto-synced ${formatTime()}`, "ready");
  } catch (error) {
    console.error(error);
    setStatus("Sync failed. Try refreshing in a minute.", "error");
  }
}

async function loadSeason(leagueId, options = {}) {
  const [league, rosters, users, state, winnersBracket, losersBracket] = await Promise.all([
    fetchJson(`/league/${leagueId}`),
    fetchJson(`/league/${leagueId}/rosters`),
    fetchJson(`/league/${leagueId}/users`),
    fetchJson("/state/nfl"),
    fetchOptionalJson(`/league/${leagueId}/winners_bracket`, []),
    fetchOptionalJson(`/league/${leagueId}/losers_bracket`, []),
  ]);

  const week = displayWeek(league, state);
  const transactions = options.includeTransactions ? await loadTransactions(leagueId) : [];
  const draftPicks = options.includeDraft ? await fetchOptionalJson(`/draft/${ARCHIVE_2025_DRAFT_ID}/picks`, []) : [];
  const matchupWeeks = options.matchupWeeks || (options.includeDraft ? [week, 15, 16, 17] : [week]);
  const matchupsByWeek = await loadMatchupsForWeeks(leagueId, matchupWeeks);
  const history = buildHistory(league, rosters, users, winnersBracket, losersBracket);

  return { league, rosters, users, state, week, winnersBracket, losersBracket, transactions, draftPicks, matchupsByWeek, history };
}

async function loadNflContext() {
  const previewEvents = historicalPreviewNflEvents();
  if (previewEvents) {
    return {
      season: { year: Number(SEASON_PREVIEW) },
      week: { number: previewWeek() },
      events: previewEvents,
      articles: [],
      scheduleChanges: [],
      mode: detectFootballMode(previewEvents),
    };
  }

  const [scoreboard, fullSchedule, news] = await Promise.all([
    fetchExternalJson(`${ESPN_BASE}/scoreboard`).catch(() => null),
    fetchExternalJson(`${ESPN_BASE}/scoreboard?dates=${NFL_SCHEDULE_START}-${NFL_SCHEDULE_END}&limit=400`).catch(() => null),
    fetchExternalJson(`${ESPN_BASE}/news?limit=8`).catch(() => null),
  ]);

  const weeklyEvents = scoreboard?.events || [];
  const scheduleEvents = fullSchedule?.events?.length ? fullSchedule.events : weeklyEvents;
  const events = mergeEvents(scheduleEvents, weeklyEvents);
  const articles = news?.articles || [];
  const scheduleChanges = trackScheduleChanges(events);
  return {
    season: scoreboard?.season,
    week: scoreboard?.week,
    events,
    articles,
    scheduleChanges,
    mode: detectFootballMode(events),
  };
}

async function loadMatchupsForWeeks(leagueId, weeks) {
  const uniqueWeeks = [...new Set(weeks.filter(Boolean).map(clampWeek))];
  const entries = await Promise.all(
    uniqueWeeks.map(async (week) => [week, await fetchOptionalJson(`/league/${leagueId}/matchups/${week}`, [])]),
  );
  return Object.fromEntries(entries);
}

async function loadTransactions(leagueId) {
  const weeks = await Promise.all(
    WEEKS.map(async (week) => {
      const transactions = await fetchOptionalJson(`/league/${leagueId}/transactions/${week}`, []);
      return transactions.map((transaction) => ({ ...transaction, leg: transaction.leg || week }));
    }),
  );
  return weeks.flat().filter((transaction) => transaction.status === "complete");
}

async function fetchJson(path) {
  const response = await fetch(`${API_BASE}${path}`);
  if (!response.ok) throw new Error(`Sleeper returned ${response.status} for ${path}.`);
  return response.json();
}

async function fetchExternalJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Request failed for ${url}`);
  return response.json();
}

async function fetchOptionalJson(path, fallback) {
  try {
    return await fetchJson(path);
  } catch (error) {
    console.warn(`Optional Sleeper data unavailable for ${path}.`, error);
    return fallback;
  }
}

function renderCurrentPage() {
  const league = currentData.league;
  const rosters = currentData.rosters;
  const users = currentData.users;
  const history = archiveData.history;
  const leader = sortRosters(rosters)[0];
  const showCurrentLeader = hasCompletedWeek(rosters, league);

  applyModeTheme(nflData.mode);
  renderHeroMode(nflData.mode);
  renderLeagueAvatar(league);
  if (els.heroTitle) els.heroTitle.textContent = `Waxball ${league.season || "2026"}`;
  if (els.sleeperLink) {
    els.sleeperLink.href = sleeperLeagueUrl(league);
    els.sleeperLink.textContent = "Open Sleeper";
  }
  els.heroCopy.textContent =
    heroLeagueCopy(league);
  els.season.textContent = league.season || "2026";
  els.week.textContent = isWeek7Showcase()
    ? `${capitalize(week7Showcase().day)} Week ${currentWeek}`
    : isModePreview() && nflData.mode?.key === "tnf"
    ? `Thursday Week ${currentWeek}`
    : isModePreview() && nflData.mode?.key === "snf"
      ? `Sunday Week ${currentWeek}`
    : isModePreview() && nflData.mode?.key === "mnf"
      ? `Monday Week ${currentWeek}`
    : isModePreview()
      ? `Week ${currentWeek}`
    : isPreseasonMode()
    ? "Preseason"
    : isMatchupPreviewMode() && nflData.mode?.key === "tnf"
    ? `Thursday Week ${currentWeek}`
    : isMatchupPreviewMode() && nflData.mode?.key === "snf"
      ? `Sunday Week ${currentWeek}`
    : isMatchupPreviewMode() && nflData.mode?.key === "mnf"
      ? `Monday Week ${currentWeek}`
    : isMatchupPreviewMode()
      ? `Week ${currentWeek}`
      : league.status === "pre_draft"
        ? "Pre-draft"
        : `Week ${currentWeek}`;
  els.toiletLabel.textContent = showCurrentLeader ? "Last Place" : "Prevailing 💩 King";
  els.teamMetric.textContent = showCurrentLeader
    ? ownerIdentityName(lastPlaceRoster(rosters), users)
    : archiveRowManagerName(history.biggestLoser, archiveData) || "--";
  els.leaderLabel.textContent = showCurrentLeader ? "League Leader" : "Defending Champ";
  els.champion.textContent = showCurrentLeader && leader
    ? ownerIdentityName(leader, users)
    : archiveRowManagerName(history.champion, archiveData) || "--";
  if (els.refreshStamp) {
    els.refreshStamp.textContent = `Updated ${formatTime()}`;
  }
  renderMidweekArticleAction();
  renderStandings(rosters, users);
  renderMatchups(currentData.matchupsByWeek[currentWeek] || [], rosters, users, currentWeek);
  renderTeamSelector(rosters, users);
  renderSelectedTeam();
}

function renderArticlesPage() {
  renderLeagueAvatar(currentData.league);
  renderArticleArchive();
  setStatus(`Auto-synced ${formatTime()}`, "ready");
}

function renderMidweekArticleAction() {
  if (!els.midweekArticleSection || !els.midweekArticleCard) return;
  const article = latestPriorWeekArticle();
  const shouldShow = nflData?.mode?.key === "midweek" && !isPreseasonMode() && article;
  els.midweekArticleSection.toggleAttribute("hidden", !shouldShow);
  if (!shouldShow) return;
  els.midweekArticleCard.innerHTML = articleCardMarkup(article, { featured: true });
}

function renderArchivePage() {
  const history = archiveData.history;
  renderLeagueAvatar(currentData.league);
  const archiveToilet = archiveToiletHolder(archiveData);
  if (els.archiveChampion) els.archiveChampion.textContent = archiveRowManagerName(history.champion, archiveData) || "Milo Manheim";
  if (els.archiveToilet) els.archiveToilet.textContent = archiveRowManagerName(archiveToilet, archiveData) || "Jakob Cooper";
  renderArchiveShowpiece(archiveData);
  els.archiveSummary.textContent =
    `${history.season} finished with ${archiveRowManagerName(history.champion, archiveData) || "Milo Manheim"} winning the playoff bracket and ` +
    `${archiveRowManagerName(archiveToilet, archiveData) || "Jakob Cooper"} becoming the 💩 King.`;

  renderArchiveTable(archiveData);
  renderTeamSelector(archiveData.rosters, archiveData.users);
  renderSelectedTeam();
}

function renderArchiveShowpiece(data) {
  const champion = data.history.champion;
  const poopKing = archiveToiletHolder(data);
  const runnerUp = data.history.rows.find((row) => finalPlace(row, data) === 2);
  const thirdPlace = data.history.rows.find((row) => finalPlace(row, data) === 3);
  const championship = finalMatchupSummary(finalGame(data.winnersBracket), data, "championship");
  const poopFinal = finalMatchupSummary(finalGame(data.losersBracket), data, "poop");

  if (els.championCard && champion) {
    els.championCard.innerHTML = `
      <header>
        ${avatar(champion.roster, data.users)}
        <div>
          <span class="metric-label">Playoff champion · $900</span>
          <strong>${escapeHtml(ownerIdentityName(champion.roster, data.users))}</strong>
          <span class="username">${escapeHtml(champion.team)}</span>
        </div>
      </header>
      <p>${escapeHtml(championship.text)}</p>
      <div class="final-score">
        ${championship.scores.map((score) => `<span>${escapeHtml(score)}</span>`).join("")}
      </div>
    `;
  }

  if (els.poopCard && poopKing) {
    els.poopCard.innerHTML = `
      <header>
        ${avatar(poopKing.roster, data.users)}
        <div>
          <span class="metric-label">💩 King · Calendar Spread</span>
          <strong>${escapeHtml(ownerIdentityName(poopKing.roster, data.users))}</strong>
          <span class="username">${escapeHtml(poopKing.team)}</span>
        </div>
      </header>
      <p>${escapeHtml(poopFinal.text)}</p>
      <div class="final-score">
        ${poopFinal.scores.map((score) => `<span>${escapeHtml(score)}</span>`).join("")}
      </div>
    `;
  }

  renderPrizeCard(els.runnerUpPrize, runnerUp, data, "2nd Place", "$200");
  renderPrizeCard(els.thirdPlacePrize, thirdPlace, data, "3rd Place", "$100");
}

function renderPrizeCard(element, row, data, label, prize) {
  if (!element || !row) return;
  element.innerHTML = `
    ${avatar(row.roster, data.users)}
    <div>
      <span class="metric-label">${escapeHtml(label)}</span>
      <strong>${escapeHtml(ownerIdentityName(row.roster, data.users))}</strong>
      <span class="username">${escapeHtml(row.team)}</span>
      <p>${escapeHtml(prize)}</p>
    </div>
  `;
}

function renderStandings(rosters, users) {
  const rows = sortRosters(rosters)
    .map((roster, index) => {
      const record = `${stat(roster, "wins")}-${stat(roster, "losses")}`;
      const selected = Number(selectedRosterId) === Number(roster.roster_id);
      return `
        <tr class="${selected ? "selected-row" : ""}">
          <td class="rank">${index + 1}</td>
          <td>${teamCell(roster, users)}</td>
          <td>${record}</td>
          <td>${shortPoints(roster, "fpts")}</td>
          <td>${shortPoints(roster, "fpts_against")}</td>
        </tr>
      `;
    })
    .join("");
  els.standings.innerHTML = rows || `<tr><td colspan="5">No standings available.</td></tr>`;
}

function renderMatchups(matchups, rosters, users, week) {
  if (!els.matchups) return;
  if (!matchups.length) {
    els.matchups.innerHTML = `
      <p class="muted">
        ${currentData?.league.status === "pre_draft" ? "Matchups will unlock after the draft and schedule generation." : `No matchup data is available for week ${week} yet.`}
      </p>
    `;
    return;
  }

  const grouped = groupBy(matchups, (matchup) => matchup.matchup_id || matchup.roster_id);
  els.matchups.innerHTML = Array.from(grouped.values()).map((pair) => matchupCard(pair, rosters, users)).join("");
}

function renderTeamSelector(rosters, users) {
  if (!els.teamSelect) return;
  const sorted = [...rosters].sort((a, b) => teamName(a, users).localeCompare(teamName(b, users)));
  const leagueOption = PAGE === "current" ? `<option value="league">LEAGUE VIEW</option>` : "";
  const options = sorted
    .map((roster) => `<option value="${roster.roster_id}">${escapeHtml(teamName(roster, users))}</option>`)
    .join("");
  els.teamSelect.innerHTML = leagueOption + options;
  if (
    !selectedRosterId ||
    (selectedRosterId !== "league" && !rosters.some((roster) => roster.roster_id === selectedRosterId))
  ) {
    selectedRosterId = PAGE === "current" ? "league" : sorted[0]?.roster_id || null;
  }
  if (selectedRosterId) els.teamSelect.value = String(selectedRosterId);
}

async function renderSelectedTeam() {
  if (!els.teamPanel || !selectedRosterId) return;
  const generalMode = selectedRosterId === "league";
  document.body.classList.toggle("has-selected-team", !generalMode);
  els.teamPanelSection?.toggleAttribute("hidden", generalMode);
  els.weeklySlateSection?.toggleAttribute("hidden", !generalMode);
  if (els.teamViewStatus && !generalMode) {
    els.teamViewStatus.textContent = `Currently viewing ${teamNameByRosterId(selectedRosterId)}`;
  }
  if (selectedRosterId === "league") {
    if (els.teamPanel) els.teamPanel.innerHTML = "";
    return;
  }
  els.teamPanel.classList.remove("league-command-panel");

  const source = PAGE === "archive" ? archiveData : currentData;
  const history = archiveData.history;
  const roster = source.rosters.find((item) => item.roster_id === selectedRosterId);
  if (!roster) return;
  if (PAGE === "archive") {
    await renderArchiveSelectedTeam(roster);
    return;
  }

  const matchup = selectedTeamMatchup(roster, currentData.matchupsByWeek[currentWeek] || [], currentData.rosters, currentData.users);
  const opponentRoster = matchup.opponentRoster;
  const rosterHasPlayers = [...(matchup.mine?.players || []), ...(roster.players || [])].some((playerId) => playerId !== "0");
  const opponentHasPlayers = [...(matchup.opponent?.players || []), ...(opponentRoster?.players || [])].some((playerId) => playerId !== "0");
  let playerContext = null;
  let opponentContext = null;

  if (rosterHasPlayers && shouldShowPlayersToWatch()) {
    playerContext = await teamPlayerContext(roster, nflData.events, matchup.mine);
  }
  if (opponentRoster && opponentHasPlayers && shouldShowPlayersToWatch()) {
    opponentContext = await teamPlayerContext(opponentRoster, nflData.events, matchup.opponent);
  }
  const playersToWatch = shouldShowPlayersToWatch()
    ? `
      <article class="things-watch-panel">
        <span class="metric-label">Players to Watch</span>
        ${thingsToWatchPanel(playerContext, opponentContext, matchup, roster, opponentRoster, source.users)}
      </article>
    `
    : "";
  const historicalRosterSnapshot = isHistoricalCurrentPreview()
    ? historicalRosterSnapshots(matchup, roster, opponentRoster, source.users, playerContext, opponentContext)
    : "";

  els.teamPanel.innerHTML = `
    <div class="matchup-focus-card">
      <div class="matchup-focus-head">
        <div>
          <span class="metric-label">Current matchup</span>
          ${matchup.detail ? `<p class="muted">${escapeHtml(matchup.detail)}</p>` : ""}
        </div>
        ${matchupScoreBadge(matchup)}
      </div>
      ${matchupVersusShowpiece(roster, opponentRoster, source.users)}
    </div>
    ${historicalRosterSnapshot}
    ${playersToWatch}
    <button class="button league-view-button" type="button" data-league-view>See All Matchups in League View</button>
  `;
}

async function renderArchiveSelectedTeam(roster) {
  const history = archiveData.history;
  const historyRow = historyForRoster(roster, history);
  const players = await loadPlayers();
  const drafted = draftedPlayersForRoster(roster, archiveData.draftPicks);
  const finalPlayers = finalPlayersForRoster(roster, players);
  const finalIds = new Set(finalPlayers.map((player) => player.id));
  const kept = drafted.filter((player) => finalIds.has(player.id));
  const postseason = postseasonRecord(roster, archiveData);
  const combined = combinedRecord(roster, postseason);

  els.teamPanel.innerHTML = `
    <div class="team-panel-main">
      <header>
        ${avatar(roster, archiveData.users)}
        <div class="team-copy">
          <h3>${escapeHtml(teamName(roster, archiveData.users))}</h3>
          <span class="username">${escapeHtml(ownerIdentityName(roster, archiveData.users))}</span>
        </div>
      </header>
      <div class="mini-stats archive-mini-stats">
        <div><span class="metric-label">Regular Season</span><strong>${historyRow ? recordText(historyRow) : "--"}</strong></div>
        <div><span class="metric-label">With Playoffs</span><strong>${combined}</strong></div>
        <div><span class="metric-label">Regular Finish</span><strong>${historyRow ? ordinal(historyRow.rank) : "--"}</strong></div>
        <div><span class="metric-label">Playoff Finish</span><strong>${escapeHtml(playoffFinish(roster, archiveData))}</strong></div>
      </div>
    </div>
    <div class="team-panel-grid archive-profile-grid">
      <article class="wide-card">
        <span class="metric-label">2025 Final Profile</span>
        <p class="muted">${escapeHtml(archiveFinalProfile(roster, archiveData))}</p>
      </article>
      <article>
        <span class="metric-label">Drafted Roster</span>
        ${playerSimpleList(drafted, "No draft picks found for this roster.")}
      </article>
      <article>
        <span class="metric-label">Season-ending Roster</span>
        ${playerSimpleList(finalPlayers, "No final roster found.")}
      </article>
      <article>
        <span class="metric-label">Stayed From Draft</span>
        ${playerSimpleList(kept, "No drafted players remained on the final roster.")}
      </article>
    </div>
  `;
}

function renderArchiveTable(data) {
  els.archiveBody.innerHTML = data.history.rows
    .map((row) => `
      <tr>
        <td class="rank">${row.rank}</td>
        <td>${teamCell(row.roster, data.users)}</td>
        <td>${recordText(row)}</td>
        <td>${Math.round(Number(row.pointsFor))}</td>
        <td><span class="${finishMovementClass(row, data)}">${escapeHtml(finalFinishLabel(row, data))}</span></td>
      </tr>
    `)
    .join("");
}

function renderPlayoffs(data) {
  const history = data.history;
  els.playoffSummary.innerHTML = `
    <div><span class="metric-label">Champion</span><strong>${escapeHtml(history.champion?.team || "--")}</strong></div>
    <div><span class="metric-label">Runner-up</span><strong>${escapeHtml(history.runnerUp?.team || "--")}</strong></div>
    <div><span class="metric-label">💩 King</span><strong>${escapeHtml(archiveToiletHolder(data)?.team || "--")}</strong></div>
  `;
  els.playoffList.innerHTML = [
    `<div class="bracket-section-title">Championship Bracket</div>`,
    ...bracketCards(data.winnersBracket, data.rosters, data.users, "Playoffs"),
    `<div class="bracket-section-title">Toilet Bowl Bracket</div>`,
    ...bracketCards(data.losersBracket, data.rosters, data.users, "Toilet Bowl"),
  ].join("");
}

function renderTransactions(data) {
  const recentWaiver = latestTransaction(data.transactions, ["waiver", "free_agent"]);
  const recentTrade = latestTransaction(data.transactions, ["trade"]);
  const highlights = [recentWaiver, recentTrade].filter(Boolean);
  els.transactionSummary.innerHTML = `
    <div><span class="metric-label">Latest waiver/FA</span><strong>${escapeHtml(transactionHeadline(recentWaiver, data.rosters, data.users))}</strong></div>
    <div><span class="metric-label">Latest trade</span><strong>${escapeHtml(transactionHeadline(recentTrade, data.rosters, data.users))}</strong></div>
  `;
  els.transactionList.innerHTML = highlights.length
    ? highlights.map((transaction, index) => activityItem(transaction, data.rosters, data.users, index)).join("")
    : `<p class="muted">No completed waiver or trade activity found.</p>`;
  hydrateTransactionDetails(highlights, data);
}

function renderArticleArchive() {
  if (!els.articlesGrid || !els.articlesEmpty) return;
  const published = publishedArticles2026();
  els.articlesEmpty.toggleAttribute("hidden", published.length > 0);
  els.articlesGrid.innerHTML = published.map((article) => articleCardMarkup(article)).join("");
}

function articleCardMarkup(article, options = {}) {
  const thumbnail = article.thumbnail
    ? `<img src="${escapeHtml(article.thumbnail)}" alt="" loading="lazy" />`
    : `<span>Week ${escapeHtml(article.week)}</span>`;
  return `
    <article class="article-card ${options.featured ? "featured-article-card" : ""}">
      <a href="${escapeHtml(article.url)}" target="_blank" rel="noreferrer">
        <div class="article-thumb">${thumbnail}</div>
        <div class="article-card-copy">
          <p class="eyebrow">Week ${escapeHtml(article.week)}</p>
          <h3>${escapeHtml(article.headline)}</h3>
          ${article.publishedAt ? `<p>${escapeHtml(formatArticleDate(article.publishedAt))}</p>` : ""}
          <span class="button primary">Read article</span>
        </div>
      </a>
    </article>
  `;
}

function latestPriorWeekArticle() {
  const targetWeek = Number(currentWeek) - 1;
  if (targetWeek < 1) return null;
  return publishedArticles2026()
    .filter((article) => Number(article.week) <= targetWeek)
    .at(-1) || null;
}

function publishedArticles2026() {
  return ARTICLES_2026
    .filter((article) => article?.published && article.url && article.headline)
    .sort((a, b) => Number(a.week) - Number(b.week));
}

function formatArticleDate(value) {
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
}

function heroLeagueCopy(league) {
  if (isWeek7Showcase()) {
    const day = week7Showcase().day;
    return `Week 7 ${day} showcase, using 2025 Sleeper matchups, rosters, standings, and scores as stand-ins for the 2026 site.`;
  }
  if (isHistoricalCurrentPreview()) {
    return `${league.season} preview mode: Thursday Week ${currentWeek}, rebuilt from Sleeper matchups, rosters, avatars, and standings through the prior week.`;
  }
  if (isPreseasonMode()) {
    return "Waxball is back for its 3rd season. This site will update automatically throughout the year and act as an archive for previous seasons. Godspeed boys, and happy Waxing.";
  }
  if (currentSeasonHasResults()) {
    const leader = sortRosters(currentData.rosters)[0];
    const last = lastPlaceRoster(currentData.rosters);
    return `${teamName(leader, currentData.users)} leads Waxball right now, while ${teamName(last, currentData.users)} is staring at the danger zone. Matchups and player windows update as the week unfolds.`;
  }
  if (league.status === "pre_draft" || isMatchupPreviewMode()) {
    return "Waxball is back for its 3rd season. This site will update automatically throughout the year and act as an archive for previous seasons. Godspeed boys, and happy Waxing.";
  }
  return "Waxball is live. League table, matchups, roster windows, and weekly pressure points will update as the season moves.";
}

function teamNameChanges(current, archive) {
  return current.rosters
    .map((roster) => {
      const archived = archive.rosters.find((oldRoster) => oldRoster.owner_id === roster.owner_id);
      if (!archived) return null;
      const oldName = teamName(archived, archive.users);
      const newName = teamName(roster, current.users);
      return oldName !== newName ? { owner: ownerName(roster, current.users), oldName, newName } : null;
    })
    .filter(Boolean);
}

function currentSeasonHasResults() {
  return hasCompletedWeek(currentData?.rosters || [], currentData?.league || {});
}

function isPreseasonMode() {
  if (isHistoricalCurrentPreview() || isWeek7Showcase()) return false;
  return PAGE === "current" && !isModePreview() && easternDateKey(currentDate()) <= PRESEASON_END_DATE_KEY;
}

function isModePreview() {
  return Boolean(previewModeDefinition());
}

function isHistoricalCurrentPreview() {
  return PAGE === "current" && SEASON_PREVIEW === "2025" && Number.isInteger(WEEK_PREVIEW) && WEEK_PREVIEW >= 1;
}

function previewWeek() {
  if (isWeek7Showcase()) return 7;
  return isHistoricalCurrentPreview() ? clampWeek(WEEK_PREVIEW) : 0;
}

function activeCurrentLeagueId() {
  return isHistoricalCurrentPreview() || isWeek7Showcase() ? ARCHIVE_2025_LEAGUE_ID : CURRENT_LEAGUE_ID;
}

function isWeek7Showcase() {
  return PAGE === "current" && Boolean(week7Showcase());
}

function week7Showcase() {
  return WEEK7_SHOWCASE_DAYS[String(SHOWCASE_PREVIEW || "").toLowerCase()] || null;
}

function currentPosition(roster, rosters) {
  const rank = sortRosters(rosters).findIndex((item) => item.roster_id === roster.roster_id) + 1;
  return rank ? `#${rank}` : "--";
}

function teamNameByRosterId(rosterId) {
  const roster = currentData?.rosters?.find((item) => Number(item.roster_id) === Number(rosterId));
  return roster ? teamName(roster, currentData.users) : "team view";
}

function isMatchupPreviewMode() {
  return currentData?.previewMode === "matchups" || currentData?.previewMode === "week7-showcase";
}

function lastPlaceRoster(rosters) {
  return [...rosters].sort((a, b) => {
    const lossDiff = stat(b, "losses") - stat(a, "losses");
    if (lossDiff) return lossDiff;
    const winDiff = stat(a, "wins") - stat(b, "wins");
    if (winDiff) return winDiff;
    return totalPoints(a, "fpts") - totalPoints(b, "fpts");
  })[0];
}

function latestTransaction(transactions, types) {
  return transactions
    .filter((transaction) => types.includes(transaction.type))
    .sort((a, b) => b.created - a.created)[0];
}

function transactionHeadline(transaction, rosters, users) {
  if (!transaction) return "None found";
  const teams = (transaction.roster_ids || []).map((id) => rosterName(id, rosters, users)).join(" / ");
  const type = transaction.type === "trade" ? "Trade" : transaction.type === "waiver" ? "Waiver" : "Free agent";
  return `${type}: ${teams || "League move"}`;
}

function archiveTeamSummary(historyRow, data) {
  if (!historyRow) return "No 2025 row found for this team.";
  const rankText = `finished #${historyRow.rank}`;
  const pfRank = statRank(historyRow.roster, data.rosters, "fpts", "desc");
  const paRank = statRank(historyRow.roster, data.rosters, "fpts_against", "asc");
  return `${historyRow.team} ${rankText} at ${recordText(historyRow)}, ranked #${pfRank} in points for and #${paRank} in fewest points against.`;
}

function archiveRowManagerName(row, data) {
  if (!row?.roster || !data?.users) return "";
  return ownerIdentityName(row.roster, data.users);
}

function recordText(row) {
  return row.record?.replace(/-0$/, "") || "--";
}

function archiveQuirks(historyRow, data) {
  if (!historyRow) return `<p class="muted">No quirks available.</p>`;
  const roster = historyRow.roster;
  const quirks = [
    `${historyRow.finish}`,
    `#${statRank(roster, data.rosters, "fpts", "desc")} scoring offense`,
    `#${statRank(roster, data.rosters, "fpts_against", "asc")} luck/defense by PA`,
  ];
  if (historyRow.rosterId === data.history.champion?.rosterId) quirks.push("won the championship bracket");
  if (historyRow.rosterId === archiveToiletHolder(data)?.rosterId) quirks.push("ended as 💩 King");
  return `
    <ul class="player-list">
      ${quirks.map((quirk) => `<li><strong>${escapeHtml(quirk)}</strong><span>2025</span></li>`).join("")}
    </ul>
  `;
}

function archiveFinalProfile(roster, data) {
  const historyRow = historyForRoster(roster, data.history);
  if (!historyRow) return "No 2025 profile is available for this team.";
  const name = historyRow.team;
  const record = recordText(historyRow);
  const finish = ordinal(historyRow.rank);
  const champion = data.history.champion;
  const toiletHolder = archiveToiletHolder(data);
  const title = `${name} went ${record} in the regular season and finished ${finish}.`;

  if (historyRow.rosterId === champion?.rosterId) {
    const final = finalGame(data.winnersBracket);
    return `${title} EvianDon won the playoff bracket, finishing the run by beating ${rosterName(final?.l, data.rosters, data.users)} in the championship final.`;
  }

  if (historyRow.rosterId === toiletHolder?.rosterId) {
    const final = finalGame(data.losersBracket);
    const survivor = final ? rosterName(final.l, data.rosters, data.users) : "the Toilet Bowl survivor";
    return `${title} Papi Coop lost the Toilet Bowl final to ${survivor}, becoming the 2025 💩 King.`;
  }

  if (historyRow.rank <= 6) {
    const elimination = data.winnersBracket.find((game) => game.l === historyRow.rosterId);
    if (elimination) {
      return `${title} They made the playoff bracket and were knocked out by ${rosterName(elimination.w, data.rosters, data.users)} in ${roundLabel(elimination, "playoff")}.`;
    }
    return `${title} They made the playoff bracket and stayed alive deeper than their seed suggested.`;
  }

  const survival = [...data.losersBracket].reverse().find((game) => game.l === historyRow.rosterId);
  if (survival) {
    return `${title} They landed in the Toilet Bowl and survived by beating ${rosterName(opponentInGame(survival, historyRow.rosterId), data.rosters, data.users)} in ${roundLabel(survival, "poop")}.`;
  }

  const danger = data.losersBracket.find((game) => game.w === historyRow.rosterId);
  if (danger) {
    return `${title} They landed in the Toilet Bowl and were pushed toward danger by ${rosterName(opponentInGame(danger, historyRow.rosterId), data.rosters, data.users)} in ${roundLabel(danger, "poop")}.`;
  }

  return `${title} Their postseason path was not recorded in the bracket feed.`;
}

function draftedPlayersForRoster(roster, picks) {
  return picks
    .filter((pick) => Number(pick.roster_id) === Number(roster.roster_id))
    .sort((a, b) => a.pick_no - b.pick_no)
    .map((pick) => ({
      id: String(pick.player_id),
      name: `${pick.metadata?.first_name || ""} ${pick.metadata?.last_name || ""}`.trim() || String(pick.player_id),
      position: pick.metadata?.position || "",
      team: pick.metadata?.team || "",
      originalTeam: pick.metadata?.team || "",
      pick: pick.pick_no,
      round: pick.round,
    }))
    .sort((a, b) => positionSort(a.position) - positionSort(b.position) || a.name.localeCompare(b.name));
}

function finalPlayersForRoster(roster, players) {
  const draftTeams = draftTeamMap(archiveData.draftPicks || []);
  return (roster.players || [])
    .filter((playerId) => playerId && playerId !== "0")
    .map((playerId) => {
      if (/^[A-Z]{2,3}$/.test(String(playerId))) {
        return { id: String(playerId), name: `${playerId} D/ST`, position: "DEF", team: String(playerId) };
      }
      const summary = playerSummary(playerId, players);
      return summary ? { ...summary, id: String(playerId), originalTeam: draftTeams.get(String(playerId)) || "" } : null;
    })
    .filter(Boolean)
    .sort((a, b) => positionSort(a.position) - positionSort(b.position) || a.name.localeCompare(b.name));
}

function playerSimpleList(players, fallback) {
  if (!players?.length) return `<p class="muted">${escapeHtml(fallback)}</p>`;
  return `
    <ul class="player-list compact-player-list">
      ${players.map((player) => `<li><strong>${escapeHtml(player.name)}</strong><span>${playerTagHtml(player)}</span></li>`).join("")}
    </ul>
  `;
}

function playerTagHtml(player) {
  const tags = [];
  if (player.position) tags.push(player.position);
  const currentTeam = player.team || "";
  const originalTeam = player.originalTeam || "";
  if (originalTeam && currentTeam && originalTeam !== currentTeam) {
    tags.push(`<span class="old-team">${escapeHtml(originalTeam)}</span> | ${escapeHtml(currentTeam)}`);
  } else if (currentTeam) {
    tags.push(escapeHtml(currentTeam));
  }
  return tags.length ? tags.join(" · ") : "NFL";
}

function postseasonRecord(roster, data) {
  const historyRow = historyForRoster(roster, data.history);
  const bracket = historyRow?.rank <= 6 ? data.winnersBracket : data.losersBracket;
  return bracket.reduce(
    (record, game) => {
      if (game.w !== roster.roster_id && game.l !== roster.roster_id) return record;
      const won = historyRow?.rank <= 6 ? game.w === roster.roster_id : game.l === roster.roster_id;
      record[won ? "wins" : "losses"] += 1;
      return record;
    },
    { wins: 0, losses: 0 },
  );
}

function combinedRecord(roster, postseason) {
  return `${stat(roster, "wins") + postseason.wins}-${stat(roster, "losses") + postseason.losses}`;
}

function playoffFinish(roster, data) {
  const historyRow = historyForRoster(roster, data.history);
  if (!historyRow) return "--";
  if (historyRow.rosterId === data.history.champion?.rosterId) return "Playoff champion";
  if (historyRow.rosterId === data.history.runnerUp?.rosterId) return "Runner-up";
  if (historyRow.rosterId === archiveToiletHolder(data)?.rosterId) return "💩 King";
  if (historyRow.rosterId === data.history.toiletWinner?.rosterId) return "Toilet Bowl survivor";
  const bracket = historyRow.rank <= 6 ? data.winnersBracket : data.losersBracket;
  const placement = bracket.find((game) => game.p && (game.t1 === historyRow.rosterId || game.t2 === historyRow.rosterId));
  if (placement) {
    const place = finalPlace(historyRow, data);
    return `${ordinal(place)} postseason`;
  }
  return historyRow.rank <= 6 ? "Playoff team" : "Toilet Bowl";
}

function archiveToiletHolder(data) {
  const final = finalGame(data.losersBracket);
  const holderRosterId = final?.w || data.history.biggestLoser?.rosterId;
  return data.history.rows.find((row) => row.rosterId === holderRosterId) || data.history.biggestLoser;
}

function finalMatchupSummary(game, data, type) {
  const week = playoffWeekForRound(game?.r);
  const matchup = matchupForGame(game, data.matchupsByWeek[week] || []);
  const t1Name = rosterManagerName(game?.t1, data.rosters, data.users);
  const t2Name = rosterManagerName(game?.t2, data.rosters, data.users);
  const t1Score = scoreFor(matchup.find((item) => item.roster_id === game?.t1));
  const t2Score = scoreFor(matchup.find((item) => item.roster_id === game?.t2));

  if (type === "poop") {
    const king = rosterManagerName(game?.w, data.rosters, data.users);
    const survivor = rosterManagerName(game?.l, data.rosters, data.users);
    return {
      text: `${king} became 💩 King after losing the final matchup to ${survivor}.`,
      scores: [`${t1Name} ${formatScore(t1Score)}`, `${t2Name} ${formatScore(t2Score)}`],
    };
  }

  const winner = rosterManagerName(game?.w, data.rosters, data.users);
  const loser = rosterManagerName(game?.l, data.rosters, data.users);
  return {
    text: `${winner} beat ${loser} in the championship final.`,
    scores: [`${t1Name} ${formatScore(t1Score)}`, `${t2Name} ${formatScore(t2Score)}`],
  };
}

function matchupForGame(game, matchups) {
  if (!game) return [];
  const direct = matchups.filter((item) => item.matchup_id === game.m);
  if (direct.some((item) => item.roster_id === game.t1) && direct.some((item) => item.roster_id === game.t2)) return direct;
  return matchups.filter((item) => item.roster_id === game.t1 || item.roster_id === game.t2);
}

function playoffWeekForRound(round) {
  return Number(round || 1) + 14;
}

function formatScore(score) {
  return Number(score || 0).toFixed(2).replace(/\.00$/, "");
}

function finalFinishLabel(row, data) {
  const place = finalPlace(row, data);
  if (!place) return row.finish;
  let label = ordinal(place);
  if (row.rosterId === data.history.champion?.rosterId) label = "🏆";
  if (row.rosterId === archiveToiletHolder(data)?.rosterId) label = "💩 King";
  const movement = Number(row.rank) - Number(place);
  if (!Number.isFinite(movement) || movement === 0) return label;
  return `${label} ${movement > 0 ? "▲" : "▼"}${Math.abs(movement)}`;
}

function finishMovementClass(row, data) {
  const place = finalPlace(row, data);
  const movement = Number(row.rank) - Number(place);
  if (!Number.isFinite(movement) || movement === 0) return "finish-move same";
  return `finish-move ${movement > 0 ? "up" : "down"}`;
}

function finalPlace(row, data) {
  const id = row.rosterId;
  const winPlacement = playoffPlacement(id, data.winnersBracket, true);
  if (winPlacement) return winPlacement;
  const loserPlacement = playoffPlacement(id, data.losersBracket, false);
  if (loserPlacement) return 6 + loserPlacement;
  return row.rank;
}

function playoffPlacement(rosterId, bracket, normalWinner) {
  for (const game of bracket) {
    if (!game.p || (game.t1 !== rosterId && game.t2 !== rosterId)) continue;
    const badSideWon = game.w === rosterId;
    if (normalWinner) return badSideWon ? game.p : game.p + 1;
    const survivorSlot = 6 - game.p;
    return badSideWon ? survivorSlot + 1 : survivorSlot;
  }
  return null;
}

function opponentInGame(game, rosterId) {
  return game.t1 === rosterId ? game.t2 : game.t1;
}

function draftTeamMap(picks) {
  return new Map(
    picks
      .filter((pick) => pick.player_id && pick.metadata?.team)
      .map((pick) => [String(pick.player_id), pick.metadata.team]),
  );
}

function roundLabel(game, bracketType) {
  if (!game) return bracketType === "poop" ? "the Toilet Bowl" : "the playoff bracket";
  if (bracketType === "playoff") {
    if (game.p === 1) return "the championship final";
    if (game.p === 3) return "the third-place game";
    if (game.p === 5) return "the fifth-place game";
    return game.r === 1 ? "the playoff quarterfinal" : "the playoff semifinal";
  }
  if (game.p === 1) return "the Toilet Bowl final";
  if (game.p === 3) return "the Toilet Bowl third-place game";
  if (game.p === 5) return "the Toilet Bowl fifth-place game";
  return game.r === 1 ? "the first Toilet Bowl round" : "the second Toilet Bowl round";
}

function ordinal(value) {
  const number = Number(value);
  const suffix = number % 10 === 1 && number % 100 !== 11 ? "st" : number % 10 === 2 && number % 100 !== 12 ? "nd" : number % 10 === 3 && number % 100 !== 13 ? "rd" : "th";
  return `${number}${suffix}`;
}

function positionSort(position) {
  return { QB: 1, RB: 2, WR: 3, TE: 4, K: 5, DEF: 6 }[position] || 9;
}

function statRank(roster, rosters, key, direction) {
  const sorted = [...rosters].sort((a, b) => {
    const diff = totalPoints(a, key) - totalPoints(b, key);
    return direction === "asc" ? diff : -diff;
  });
  return sorted.findIndex((item) => item.roster_id === roster.roster_id) + 1;
}

function detectFootballMode(events) {
  const preview = previewModeDefinition();
  if (preview) return preview;
  if (isPreseasonMode()) return modeDefinition("preseason");
  const today = easternParts();
  const month = today.month - 1;
  const day = today.weekday;
  const isThanksgiving = month === 10 && day === 4 && today.day >= 22 && today.day <= 28;
  const liveOrToday = events.filter((event) => isToday(event.date) || event.status?.type?.state === "in");
  const isPlayoffs = liveOrToday.some((event) => event.season?.type === 3);

  if (isThanksgiving) {
    return {
      key: "thanksgiving",
      label: "Thanksgiving mode",
      title: "Thanksgiving Football Board",
      copy: "Track early lineup locks, short-week injury surprises, and afternoon/evening game exposure.",
      isGameday: true,
    };
  }
  if (isPlayoffs) {
    return {
      key: "playoffs",
      label: "Playoff mode",
      title: "Win-or-Go-Home Watch",
      copy: "Prioritize high-leverage snap counts, weather, inactive lists, and teams resting nobody.",
      isGameday: true,
    };
  }
  if (day === 4) {
    return modeDefinition("tnf");
  }
  if (day === 1) {
    return modeDefinition("mnf");
  }
  if ((day === 2 || day === 3) && liveOrToday.length) {
    return {
      key: "tnf",
      label: "Weeknight game mode",
      title: "Weeknight Football Board",
      copy: "A rare weekday game means lineup locks, inactives, and early matchup pressure take over the board.",
      isGameday: true,
    };
  }
  if ((day === 5 || day === 6) && liveOrToday.length) {
    return {
      key: "midweekend",
      label: "Midweekend game mode",
      title: "Saturday Football Board",
      copy: "A Friday or Saturday game shifts the week early. Track locks, injury pivots, and Sunday setup together.",
      isGameday: true,
    };
  }
  if (day === 5 || day === 6) {
    return modeDefinition("midweekend");
  }
  if (day === 0 || liveOrToday.length) {
    return modeDefinition("snf");
  }
  if (day === 2 || day === 3) {
    return modeDefinition("midweek");
  }
  return modeDefinition("snf-preview");
}

function previewModeDefinition() {
  if (PAGE !== "current") return null;
  const showcase = week7Showcase();
  if (showcase) return modeDefinition(showcase.mode);
  const allowed = new Set(["midweek", "tnf", "midweekend", "snf", "mnf"]);
  return allowed.has(MODE_PREVIEW) ? modeDefinition(MODE_PREVIEW) : null;
}

function historicalPreviewNflEvents() {
  if (isWeek7Showcase()) return week7ShowcaseNflEvents(week7Showcase().day);
  if (!isHistoricalCurrentPreview()) return null;
  if (SEASON_PREVIEW === "2025" && previewWeek() === 8) {
    return [
      {
        id: "2025-week8-tnf-min-lac",
        date: "2025-10-24T00:15:00Z",
        shortName: "MIN @ LAC",
        name: "Minnesota Vikings at Los Angeles Chargers",
        season: { year: 2025, type: 2 },
        status: { type: { state: "pre", description: "Scheduled", shortDetail: "Thu 8:15 PM ET" } },
        competitions: [
          {
            broadcast: "Prime Video",
            competitors: [
              { homeAway: "away", team: { abbreviation: "MIN", displayName: "Minnesota Vikings" } },
              { homeAway: "home", team: { abbreviation: "LAC", displayName: "Los Angeles Chargers" } },
            ],
          },
        ],
      },
    ];
  }
  return null;
}

function week7ShowcaseNflEvents(day) {
  const thursdayFinal = ["friday", "saturday", "sunday", "monday"].includes(day);
  const sundayFinal = day === "monday";
  return [
    showcaseNflGame("week7-tnf", "2025-10-16T00:15:00Z", "PIT", "CIN", "Pittsburgh Steelers at Cincinnati Bengals", day === "thursday" ? "in" : thursdayFinal ? "post" : "pre", "Prime Video"),
    showcaseNflGame("week7-sun-1", "2025-10-19T17:00:00Z", "LAR", "JAX", "Los Angeles Rams at Jacksonville Jaguars", day === "sunday" ? "in" : sundayFinal ? "post" : "pre", "FOX"),
    showcaseNflGame("week7-sun-2", "2025-10-19T17:00:00Z", "NE", "TEN", "New England Patriots at Tennessee Titans", day === "sunday" ? "in" : sundayFinal ? "post" : "pre", "CBS"),
    showcaseNflGame("week7-sun-3", "2025-10-19T17:00:00Z", "MIA", "CLE", "Miami Dolphins at Cleveland Browns", day === "sunday" ? "in" : sundayFinal ? "post" : "pre", "CBS"),
    showcaseNflGame("week7-sun-4", "2025-10-19T20:05:00Z", "GB", "ARI", "Green Bay Packers at Arizona Cardinals", day === "sunday" ? "in" : sundayFinal ? "post" : "pre", "FOX"),
    showcaseNflGame("week7-sun-5", "2025-10-19T20:25:00Z", "IND", "LAC", "Indianapolis Colts at Los Angeles Chargers", day === "sunday" ? "in" : sundayFinal ? "post" : "pre", "CBS"),
    showcaseNflGame("week7-snf", "2025-10-20T00:20:00Z", "ATL", "SF", "Atlanta Falcons at San Francisco 49ers", day === "sunday" ? "in" : sundayFinal ? "post" : "pre", "NBC"),
    showcaseNflGame("week7-mnf", "2025-10-21T00:15:00Z", "HOU", "SEA", "Houston Texans at Seattle Seahawks", day === "monday" ? "in" : "pre", "ESPN"),
  ];
}

function showcaseNflGame(id, date, away, home, name, state, broadcast) {
  const labels = { pre: "Scheduled", in: "Live", post: "Final" };
  return {
    id,
    date,
    shortName: `${away} @ ${home}`,
    name,
    season: { year: 2025, type: 2 },
    status: {
      type: {
        state,
        description: labels[state] || "Scheduled",
        shortDetail: state === "post" ? "Final" : state === "in" ? "Live" : formatKickoff(date),
      },
    },
    competitions: [
      {
        broadcast,
        competitors: [
          { homeAway: "away", team: { abbreviation: away, displayName: away } },
          { homeAway: "home", team: { abbreviation: home, displayName: home } },
        ],
      },
    ],
  };
}

function modeDefinition(key) {
  const modes = {
    preseason: {
      key: "midweek",
      label: "Preseason mode",
      title: "Preseason Board",
      copy: "Draft, schedule, and roster data will unlock this current-season sheet once Sleeper generates the league.",
      isGameday: false,
    },
    midweek: {
      key: "midweek",
      label: "Midweek mode",
      title: "Midweek Board",
      copy: "Waivers, injuries, trade chatter, and matchup setup live here before the week locks in.",
      isGameday: false,
    },
    tnf: {
      key: "tnf",
      label: "Thursday",
      title: "TNF Preview",
      copy: "Thursday night is about lineup locks, inactives, and whether anyone wants to start the week hate-watching.",
      isGameday: true,
    },
    midweekend: {
      key: "midweekend",
      label: "Midweekend mode",
      title: "Midweekend Mode",
      copy: "Thursday is in the books. Use Friday and Saturday to sort injuries, pivots, Sunday exposure, and hate-watch targets.",
      isGameday: false,
    },
    snf: {
      key: "snf",
      label: "Sunday",
      title: "Sunday War Room",
      copy: "Every Sunday window is live: early explosions, late-window leverage, night-game sweats, and what each swing means for Waxball matchups.",
      isGameday: true,
    },
    mnf: {
      key: "mnf",
      label: "Monday",
      title: "MNF Sweat",
      copy: "Monday night is for final margins, miracle paths, and the last players left to swing a matchup.",
      isGameday: true,
    },
    "snf-preview": {
      key: "snf",
      label: "SNF preview",
      title: "SNF Preview",
      copy: "Look ahead to the Sunday night swing players, late-swap decisions, and matchup leverage.",
      isGameday: false,
    },
  };
  return modes[key] || modes.midweek;
}

function applyModeTheme(mode) {
  document.body.dataset.theme = mode.key;
}

function renderHeroMode(mode) {
  if (els.heroModeLabel && mode?.label) {
    els.heroModeLabel.textContent = isWeek7Showcase() ? capitalize(week7Showcase().day) : mode.label;
  }
}

function renderLeagueAvatar(league) {
  if (!league?.avatar) return;
  const avatarSrc = `https://sleepercdn.com/avatars/thumbs/${league.avatar}`;
  setSiteAvatar(avatarSrc);
  if (!els.brandMark) return;
  els.brandMark.innerHTML = `<img alt="" src="${avatarSrc}" />`;
  els.brandMark.classList.add("has-image");
}

function sleeperLeagueUrl(league) {
  if (!league?.league_id) return "https://sleeper.com/";
  const suffix = league.status === "pre_draft" ? "/predraft" : "";
  return `https://sleeper.com/leagues/${league.league_id}${suffix}`;
}

function setSiteAvatar(src) {
  const icon = document.querySelector('link[rel="icon"]') || document.createElement("link");
  icon.rel = "icon";
  icon.href = src;
  icon.type = "image/png";
  if (!icon.parentNode) document.head.appendChild(icon);

  const touchIcon = document.querySelector('link[rel="apple-touch-icon"]') || document.createElement("link");
  touchIcon.rel = "apple-touch-icon";
  touchIcon.href = src;
  if (!touchIcon.parentNode) document.head.appendChild(touchIcon);
}

function hasCompletedWeek(rosters, league) {
  if (league.status === "pre_draft") return false;
  return rosters.some((roster) => stat(roster, "wins") || stat(roster, "losses") || totalPoints(roster, "fpts"));
}

function nextMatchdayGames(events) {
  const todayKey = easternDateKey();
  const upcoming = events
    .filter((event) => event.status?.type?.state === "in" || easternDateKey(event.date) >= todayKey)
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  const source = upcoming.length ? upcoming : events.slice().sort((a, b) => new Date(a.date) - new Date(b.date));
  const first = source[0];
  if (!first) return [];
  const key = easternDateKey(first.date);
  return source.filter((event) => easternDateKey(event.date) === key);
}

function mergeEvents(scheduleEvents, weeklyEvents) {
  const merged = new Map();
  for (const event of [...(scheduleEvents || []), ...(weeklyEvents || [])]) {
    if (!event?.id) continue;
    merged.set(event.id, event);
  }
  return [...merged.values()].sort((a, b) => new Date(a.date) - new Date(b.date));
}

function trackScheduleChanges(events) {
  if (typeof window === "undefined" || !window.localStorage) return [];
  const snapshot = Object.fromEntries(
    (events || [])
      .filter((event) => event?.id && event.date)
      .map((event) => [event.id, {
        date: event.date,
        label: event.shortName || event.name || "NFL game",
      }]),
  );
  if (!Object.keys(snapshot).length) return [];

  const previous = readStoredSchedule();
  window.localStorage.setItem(NFL_SCHEDULE_CACHE_KEY, JSON.stringify(snapshot));
  if (!previous) return [];

  return Object.entries(snapshot)
    .filter(([eventId, event]) => previous[eventId]?.date && previous[eventId].date !== event.date)
    .map(([eventId, event]) => ({
      label: event.label,
      oldKickoff: formatKickoff(previous[eventId].date),
      newKickoff: formatKickoff(event.date),
    }))
    .slice(0, 4);
}

function readStoredSchedule() {
  try {
    const raw = window.localStorage.getItem(NFL_SCHEDULE_CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.warn("Unable to read cached NFL schedule.", error);
    return null;
  }
}

function isFantasyRelevantArticle(article) {
  const text = `${article.headline || ""} ${article.description || ""}`.toLowerCase();
  return /injur|fantasy|depth|camp|starter|questionable|doubtful|out\b|ir\b|holdout|contract|suspension|waiver/.test(text);
}

function parseGame(event) {
  const competition = event.competitions?.[0] || {};
  const status = event.status?.type?.shortDetail || event.status?.type?.description || "Scheduled";
  const odds = competition.odds?.[0]?.details || "";
  return {
    shortName: event.shortName || event.name || "NFL game",
    kickoff: formatKickoff(event.date),
    status,
    broadcast: competition.broadcast || competition.broadcasts?.[0]?.names?.join(", ") || "",
    odds,
    watchNote: watchNoteForGame(event),
  };
}

function watchNoteForGame(event) {
  const competition = event.competitions?.[0] || {};
  const total = competition.odds?.[0]?.overUnder;
  if (event.status?.type?.state === "in") return "Live game: monitor usage, red-zone trips, injuries, and late-swap fallout.";
  if (total && Number(total) >= 47) return "Higher-total environment: prioritize skill players tied to passing volume and red-zone roles.";
  if (event.status?.type?.state === "pre") return "Before kickoff: confirm inactives, weather, and any last-minute depth chart surprises.";
  return "Review snap roles, injury reports, and matchup leverage for fantasy decisions.";
}

function selectedTeamMatchup(roster, matchups, rosters, users) {
  if (currentData?.league.status === "pre_draft") {
    return {
      title: "Pre-draft",
      detail: "Matchups will populate after the draft and Sleeper schedule generation. For now, use 2025 finish, waiver slot, and roster settings for context.",
      deltaLabel: "Status",
      deltaValue: "Pending",
      deltaClass: "neutral",
    };
  }
  const mine = matchups.find((matchup) => matchup.roster_id === roster.roster_id);
  if (!mine) return { title: "No matchup posted", detail: "Sleeper has not published this matchup yet.", deltaLabel: "Status", deltaValue: "Pending", deltaClass: "neutral" };
  const opponent = matchups.find((matchup) => matchup.matchup_id === mine.matchup_id && matchup.roster_id !== roster.roster_id);
  if (!opponent) return { title: "Bye or solo matchup", detail: `${teamName(roster, users)} has no opponent attached in Sleeper for this week.`, mine, deltaLabel: "Status", deltaValue: "Solo", deltaClass: "neutral" };
  const opponentRoster = rosters.find((item) => item.roster_id === opponent.roster_id);
  const mineScore = scoreFor(mine);
  const opponentScore = scoreFor(opponent);
  const diff = mineScore - opponentScore;
  const showScores = shouldShowMatchupScores();
  const deltaValue = isMatchupPreviewMode() && !showScores ? "0.00" : Math.abs(diff).toFixed(2);
  const deltaLabel = diff > 0 ? "Ahead by" : diff < 0 ? "Behind by" : "Tied";
  const deltaClass = diff > 0 ? "ahead" : diff < 0 ? "behind" : "neutral";
  if (isMatchupPreviewMode()) {
    return {
      title: `${teamName(roster, users)} vs ${teamName(opponentRoster, users)}`,
      detail: "",
      mine,
      opponent,
      opponentRoster,
      deltaLabel: showScores ? deltaLabel : "Pregame",
      deltaValue,
      deltaClass: showScores ? deltaClass : "neutral",
    };
  }
  return {
    title: `${teamName(roster, users)} vs ${teamName(opponentRoster, users)}`,
    detail: showScores
      ? matchupResultText(roster, opponentRoster, users, mineScore, opponentScore)
      : "",
    mine,
    opponent,
    opponentRoster,
    deltaLabel,
    deltaValue,
    deltaClass,
  };
}

function shouldShowMatchupScores() {
  if (isHistoricalCurrentPreview() && nflData?.mode?.key === "tnf") return false;
  if (isMatchupPreviewMode()) return ["midweekend", "snf", "mnf"].includes(nflData?.mode?.key);
  return (nflData?.events || []).some((event) => event.status?.type?.state === "post");
}

function matchupResultText(roster, opponentRoster, users, mineScore, opponentScore) {
  const margin = Math.abs(mineScore - opponentScore).toFixed(2);
  if (mineScore > opponentScore) {
    return `${teamName(roster, users)} won by ${margin}.`;
  }
  if (mineScore < opponentScore) {
    return `${teamName(roster, users)} lost to ${teamName(opponentRoster, users)} by ${margin}.`;
  }
  return `${teamName(roster, users)} tied ${teamName(opponentRoster, users)}.`;
}

function shouldShowPlayersToWatch() {
  if (isPreseasonMode()) return false;
  if (isModePreview() && ["midweek", "tnf", "midweekend", "snf", "mnf"].includes(nflData?.mode?.key)) return true;
  const day = easternParts().weekday;
  if (day === 2) return false;
  if (day === 3) {
    return nextMatchdayGames(nflData?.events || []).some((event) => easternParts(event.date).weekday === 4);
  }
  return true;
}

function matchupScoreBadge(matchup) {
  if (!shouldShowMatchupScores()) {
    return "";
  }
  return `
    <div class="matchup-delta ${matchup.deltaClass}">
      <span>${escapeHtml(matchup.deltaLabel)}</span>
      <strong>${escapeHtml(matchup.deltaValue)}</strong>
    </div>
  `;
}

function scrollToLeagueTable() {
  requestAnimationFrame(() => {
    document.querySelector("#standings")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

function matchupVersusShowpiece(roster, opponentRoster, users) {
  return `
    <div class="matchup-versus-showpiece">
      ${matchupVersusTeam(roster, users)}
      <span class="big-versus">vs</span>
      ${matchupVersusTeam(opponentRoster, users)}
    </div>
  `;
}

function matchupVersusTeam(roster, users) {
  if (!roster) return "";
  return `
    <div class="matchup-versus-team">
      ${avatar(roster, users)}
      <div class="team-copy">
        <strong>${escapeHtml(teamName(roster, users))}</strong>
        <span class="username">${escapeHtml(currentPosition(roster, currentData.rosters))}</span>
      </div>
    </div>
  `;
}

async function teamPlayerContext(roster, events, matchup = null) {
  const players = await loadPlayers();
  const starterIds = (matchup?.starters?.length ? matchup.starters : roster.starters || []).filter((id) => id && id !== "0");
  const starterSet = new Set(starterIds);
  const sourcePlayers = matchup?.players?.length ? matchup.players : roster.players || [];
  const benchIds = sourcePlayers.filter((id) => id && id !== "0" && !starterSet.has(id));
  const starters = starterIds.map((id) => playerSummary(id, players)).filter(Boolean);
  const bench = benchIds.map((id) => playerSummary(id, players)).filter(Boolean);
  const teamsInNextGames = new Set(nextMatchdayGames(events).flatMap((event) => nflTeamsForEvent(event)));
  const watch = [...starters, ...bench]
    .filter((player) => teamsInNextGames.has(player.team) || player.injuryStatus)
    .slice(0, 8);
  return { starters, bench, watch };
}

async function loadPlayers() {
  if (playersById) return playersById;
  playersById = await fetchJson("/players/nfl");
  return playersById;
}

function playerSummary(playerId, players) {
  const player = players[playerId];
  if (!player) return null;
  return {
    id: playerId,
    name: player.full_name || `${player.first_name || ""} ${player.last_name || ""}`.trim() || playerId,
    position: player.position || "",
    team: player.team || "",
    injuryStatus: player.injury_status || "",
  };
}

function playerList(players, fallback) {
  if (!players?.length) return `<p class="muted">${escapeHtml(fallback)}</p>`;
  return `
    <ul class="player-list">
      ${players.slice(0, 10).map((player) => `<li><strong>${escapeHtml(player.name)}</strong><span>${escapeHtml([player.position, player.team, player.injuryStatus].filter(Boolean).join(" · ") || "NFL")}</span></li>`).join("")}
    </ul>
  `;
}

function matchupRosterPanel(label, roster, users, context, matchup) {
  if (!roster) {
    return `
      <article class="roster-board">
        <span class="metric-label">${escapeHtml(label)}</span>
        <p class="muted">No opponent is attached yet.</p>
      </article>
    `;
  }
  return `
    <article class="roster-board">
      <header>
        ${avatar(roster, users)}
        <div class="team-copy">
          <span class="metric-label">${escapeHtml(label)}</span>
          <strong>${escapeHtml(teamName(roster, users))}</strong>
          <span class="username">${escapeHtml(ownerIdentityName(roster, users))}</span>
        </div>
      </header>
      ${scoreboardPlayerList(context?.starters, matchup, "Starters will appear after the draft.")}
      <details>
        <summary>Bench</summary>
        ${scoreboardPlayerList(context?.bench, matchup, "Bench will appear after the draft.")}
      </details>
    </article>
  `;
}

function scoreboardPlayerList(players, matchup, fallback) {
  if (!players?.length) return `<p class="muted">${escapeHtml(fallback)}</p>`;
  return `
    <ul class="player-list scoreboard-list">
      ${players.map((player) => scoreboardPlayerRow(player, matchup)).join("")}
    </ul>
  `;
}

function scoreboardPlayerRow(player, matchup) {
  const game = playerGameWindow(player);
  const score = playerCompletedScore(player, matchup, game);
  const meta = [player.position, player.team, game.label].filter(Boolean).join(" · ");
  return `
    <li>
      <strong>${escapeHtml(player.name)}</strong>
      <span>${escapeHtml(score || meta || "NFL")}</span>
    </li>
  `;
}

function thingsToWatchPanel(playerContext, opponentContext, matchup, roster, opponentRoster, users) {
  const mine = watchPlayers(playerContext, false);
  const theirs = watchPlayers(opponentContext, true);
  const pace = shouldShowMatchupScores() ? matchupScoreLine(matchup, roster, opponentRoster, users) : "";
  return `
    ${pace}
    <div class="watch-columns">
      <div class="watch-team-column">
        <header>${avatar(roster, users)}<div><span class="metric-label">Your players</span><strong>${escapeHtml(teamName(roster, users))}</strong></div></header>
        ${watchListRows(mine, "No rostered players are tied to the current or next game window.")}
      </div>
      <div class="watch-team-column hate-watch">
        <header>${avatar(opponentRoster, users)}<div><span class="metric-label">Hate-watch</span><strong>${escapeHtml(opponentRoster ? teamName(opponentRoster, users) : "Opponent")}</strong></div></header>
        ${watchListRows(theirs, "No opponent players are tied to the current or next game window.")}
      </div>
    </div>
  `;
}

function historicalRosterSnapshots(matchup, roster, opponentRoster, users, playerContext, opponentContext) {
  if (!matchup?.mine) return "";
  return `
    <div class="team-panel-grid roster-snapshot-grid">
      ${historicalRosterBoard("Week 8 roster snapshot", roster, users, playerContext)}
      ${historicalRosterBoard("Opponent roster snapshot", opponentRoster, users, opponentContext)}
    </div>
  `;
}

function historicalRosterBoard(label, roster, users, context) {
  if (!roster) {
    return `
      <article class="roster-board">
        <span class="metric-label">${escapeHtml(label)}</span>
        <p class="muted">No opponent roster is attached yet.</p>
      </article>
    `;
  }
  return `
    <article class="roster-board">
      <header>
        ${avatar(roster, users)}
        <div class="team-copy">
          <span class="metric-label">${escapeHtml(label)}</span>
          <strong>${escapeHtml(teamName(roster, users))}</strong>
          <span class="username">${escapeHtml(ownerIdentityName(roster, users))}</span>
        </div>
      </header>
      <span class="roster-subhead">Starters</span>
      ${contextualPlayerList(context?.starters, "No starters found in this Sleeper matchup snapshot.")}
      <details open>
        <summary>Bench</summary>
        ${contextualPlayerList(context?.bench, "No bench players found in this Sleeper matchup snapshot.")}
      </details>
    </article>
  `;
}

function contextualPlayerList(players, fallback) {
  if (!players?.length) return `<p class="muted">${escapeHtml(fallback)}</p>`;
  return `
    <ul class="player-list">
      ${players.map((player) => `
        <li>
          <strong>${escapeHtml(player.name)}</strong>
          <span>${escapeHtml([player.position, player.team || "FA"].filter(Boolean).join(" · "))}</span>
        </li>
      `).join("")}
    </ul>
  `;
}

function matchupScoreLine(matchup, roster, opponentRoster, users) {
  const mineScore = scoreFor(matchup?.mine).toFixed(2);
  const opponentScore = scoreFor(matchup?.opponent).toFixed(2);
  return `
    <div class="current-scoreline">
      <span>${escapeHtml(teamName(roster, users))} <strong>${escapeHtml(mineScore)}</strong></span>
      <span>${escapeHtml(opponentRoster ? teamName(opponentRoster, users) : "Opponent")} <strong>${escapeHtml(opponentScore)}</strong></span>
    </div>
  `;
}

function watchPlayers(context, hateWatch) {
  const players = [...(context?.starters || []), ...(context?.bench || [])]
    .map((player) => ({ ...player, game: playerGameWindow(player) }))
    .filter((player) => player.game.isTarget)
    .slice(0, 8);
  return players.map((player) => ({
    ...player,
    note: hateWatch ? `Hate-watch ${player.position || "player"} usage` : `${player.position || "Player"} usage watch`,
  }));
}

function watchListRows(players, fallback) {
  if (!players.length) return `<p class="muted">${escapeHtml(fallback)}</p>`;
  return `
    <ul class="player-list">
      ${players.map((player) => `
        <li>
          <strong>${escapeHtml(player.name)}</strong>
          <span>${escapeHtml([player.position, player.team, player.game.label || player.note].filter(Boolean).join(" · "))}</span>
        </li>
      `).join("")}
    </ul>
  `;
}

function playerGameWindow(player) {
  const events = nflData?.events || [];
  const event = events.find((item) => nflTeamsForEvent(item).includes(player.team));
  if (!event) return { label: "No game found", isTarget: false, complete: false };
  const state = event.status?.type?.state;
  const isTarget = state === "in" || nextMatchdayGames(events).includes(event);
  return {
    label: state === "post" ? "Final" : state === "in" ? "Live" : formatKickoff(event.date),
    isTarget,
    complete: state === "post",
  };
}

function playerCompletedScore(player, matchup, game) {
  if (!game.complete || !player.id || !matchup?.players_points) return "";
  const score = matchup.players_points[player.id];
  return Number.isFinite(Number(score)) ? `${Number(score).toFixed(2)} pts` : "";
}

function playerWatchList(playerContext, nfl) {
  if (!playerContext?.watch?.length) {
    const nextGames = nextMatchdayGames(nfl.events);
    if (!nextGames.length) return `<p class="muted">No NFL matchday watch items yet.</p>`;
    return `<p class="muted">After the draft, this will flag rostered players tied to the next NFL matchday and injury report.</p>`;
  }
  return playerList(playerContext.watch, "No player watch items.");
}

function nflTeamsForEvent(event) {
  return (event.competitions?.[0]?.competitors || [])
    .map((competitor) => competitor.team?.abbreviation)
    .filter(Boolean);
}

function matchupCard(pair, rosters, users) {
  const [first, second] = pair;
  const firstScore = scoreFor(first);
  const secondScore = second ? scoreFor(second) : 0;
  return `
    <div class="matchup-card">
      <div class="matchup-row">
        ${matchupTeam(first, rosters, users, firstScore > secondScore)}
        <div class="versus">vs</div>
        ${second ? matchupTeam(second, rosters, users, secondScore > firstScore, "away") : `<div class="matchup-team away"><span class="avatar">--</span><div class="team-copy"><strong>Bye</strong></div></div>`}
      </div>
    </div>
  `;
}

function matchupTeam(matchup, rosters, users, leads, side = "") {
  const roster = rosters.find((item) => item.roster_id === matchup.roster_id);
  const scoreLabel = shouldShowMatchupScores() ? scoreFor(matchup).toFixed(2) : currentPosition(roster, rosters);
  return `
    <button class="matchup-team ${side}" type="button" data-roster-link="${escapeHtml(matchup.roster_id)}" aria-label="Open ${escapeHtml(roster ? teamName(roster, users) : `Roster ${matchup.roster_id}`)} team page">
      ${avatar(roster, users)}
      <div class="team-copy">
        <strong>${escapeHtml(roster ? teamName(roster, users) : `Roster ${matchup.roster_id}`)}</strong>
        <span class="score ${leads ? "leads" : ""}">${escapeHtml(scoreLabel)}</span>
      </div>
    </button>
  `;
}

function standingsThroughWeek(rosters, matchupsByWeek, throughWeek) {
  const totals = new Map(
    rosters.map((roster) => [Number(roster.roster_id), {
      wins: 0,
      losses: 0,
      ties: 0,
      fpts: 0,
      fptsAgainst: 0,
    }]),
  );

  for (let week = 1; week <= throughWeek; week += 1) {
    const matchups = matchupsByWeek[week] || [];
    const grouped = groupBy(matchups, (matchup) => matchup.matchup_id || matchup.roster_id);
    for (const pair of grouped.values()) {
      const [first, second] = pair;
      if (!first) continue;
      const firstTotal = totals.get(Number(first.roster_id));
      if (!firstTotal) continue;
      const firstScore = scoreFor(first);
      firstTotal.fpts += firstScore;
      if (!second) continue;
      const secondTotal = totals.get(Number(second.roster_id));
      const secondScore = scoreFor(second);
      firstTotal.fptsAgainst += secondScore;
      if (secondTotal) {
        secondTotal.fpts += secondScore;
        secondTotal.fptsAgainst += firstScore;
      }
      if (firstScore > secondScore) {
        firstTotal.wins += 1;
        if (secondTotal) secondTotal.losses += 1;
      } else if (firstScore < secondScore) {
        firstTotal.losses += 1;
        if (secondTotal) secondTotal.wins += 1;
      } else {
        firstTotal.ties += 1;
        if (secondTotal) secondTotal.ties += 1;
      }
    }
  }

  return rosters.map((roster) => {
    const total = totals.get(Number(roster.roster_id));
    if (!total) return roster;
    return {
      ...roster,
      settings: {
        ...roster.settings,
        wins: total.wins,
        losses: total.losses,
        ties: total.ties,
        fpts: Math.floor(total.fpts),
        fpts_decimal: Math.round((total.fpts % 1) * 100),
        fpts_against: Math.floor(total.fptsAgainst),
        fpts_against_decimal: Math.round((total.fptsAgainst % 1) * 100),
      },
    };
  });
}

function buildHistory(league, rosters, users, winnersBracket, losersBracket) {
  const sorted = sortRosters(rosters);
  const final = finalGame(winnersBracket);
  const loserFinal = finalGame(losersBracket);
  const championRosterId = Number(league.metadata?.latest_league_winner_roster_id) || final?.w || null;
  const runnerUpRosterId = final?.p === 1 ? final.l : null;
  const toiletWinnerRosterId = loserFinal?.l || null;
  const biggestLoserRosterId = loserFinal?.w || null;

  const rows = sorted.map((roster, index) => {
    const finish = historyFinish(roster, index, championRosterId, runnerUpRosterId, toiletWinnerRosterId, biggestLoserRosterId);
    return {
      ownerId: roster.owner_id,
      rosterId: roster.roster_id,
      roster,
      rank: index + 1,
      team: teamName(roster, users),
      owner: ownerName(roster, users),
      record: `${stat(roster, "wins")}-${stat(roster, "losses")}`,
      pointsFor: points(roster, "fpts"),
      pointsAgainst: points(roster, "fpts_against"),
      finish,
    };
  });

  return {
    leagueId: league.league_id,
    season: league.season || "2025",
    rows,
    champion: rows.find((row) => row.rosterId === championRosterId),
    runnerUp: rows.find((row) => row.rosterId === runnerUpRosterId),
    toiletWinner: rows.find((row) => row.rosterId === toiletWinnerRosterId),
    biggestLoser: rows.find((row) => row.rosterId === biggestLoserRosterId),
  };
}

function bracketCards(bracket, rosters, users, label) {
  return bracket
    .slice()
    .sort((a, b) => (a.r || 0) - (b.r || 0) || (a.m || 0) - (b.m || 0))
    .map((game) => `
      <div class="bracket-game">
        <span class="bracket-meta">${label} Round ${game.r || "?"} · Game ${game.m || "?"}</span>
        <strong>${escapeHtml(rosterName(game.t1, rosters, users))} vs ${escapeHtml(rosterName(game.t2, rosters, users))}</strong>
        <span class="muted">Winner: ${escapeHtml(rosterName(game.w, rosters, users))}</span>
      </div>
    `);
}

function activityItem(transaction, rosters, users, index = 0) {
  const names = (transaction.roster_ids || []).map((id) => rosterName(id, rosters, users)).join(" / ");
  const adds = Object.keys(transaction.adds || {}).length;
  const drops = Object.keys(transaction.drops || {}).length;
  const type = transaction.type === "trade" ? "Trade" : transaction.type === "waiver" ? "Waiver" : "Free agent";
  const detail = transaction.type === "trade" ? `${transaction.roster_ids.length} teams involved` : `${adds} add${adds === 1 ? "" : "s"}, ${drops} drop${drops === 1 ? "" : "s"}`;
  return `
    <div class="activity-item">
      <span class="activity-meta">Week ${transaction.leg} · ${type}${transaction.created ? ` · ${escapeHtml(transactionDate(transaction.created))}` : ""}</span>
      <strong>${escapeHtml(names || "League move")}</strong>
      <span class="muted" data-transaction-detail="${index}">${detail}</span>
    </div>
  `;
}

async function hydrateTransactionDetails(transactions, data) {
  if (!transactions.length) return;
  try {
    const players = await loadPlayers();
    transactions.forEach((transaction, index) => {
      const target = document.querySelector(`[data-transaction-detail="${index}"]`);
      if (target) target.textContent = transactionDetail(transaction, data.rosters, data.users, players);
    });
  } catch (error) {
    console.warn("Player names unavailable for transaction details.", error);
  }
}

function transactionDetail(transaction, rosters, users, players) {
  if (!transaction) return "";
  const bid = transaction.settings?.waiver_bid ? ` · FAAB $${transaction.settings.waiver_bid}` : "";
  if (transaction.type === "trade") {
    return (transaction.roster_ids || [])
      .map((rosterId) => {
        const acquired = playerNamesForRoster(transaction.adds, rosterId, players);
        const moved = playerNamesForRoster(transaction.drops, rosterId, players);
        const pieces = [];
        if (acquired.length) pieces.push(`got ${acquired.join(", ")}`);
        if (moved.length) pieces.push(`sent ${moved.join(", ")}`);
        return `${rosterName(rosterId, rosters, users)} ${pieces.join("; ") || "moved assets"}`;
      })
      .join(" | ");
  }
  const adds = playerNamesForMap(transaction.adds, players);
  const drops = playerNamesForMap(transaction.drops, players);
  const parts = [];
  if (adds.length) parts.push(`Added ${adds.join(", ")}`);
  if (drops.length) parts.push(`Dropped ${drops.join(", ")}`);
  return `${parts.join(" · ") || "Roster move"}${bid}`;
}

function playerNamesForRoster(map, rosterId, players) {
  return Object.entries(map || {})
    .filter(([, destinationRosterId]) => Number(destinationRosterId) === Number(rosterId))
    .map(([playerId]) => playerName(playerId, players))
    .filter(Boolean);
}

function playerNamesForMap(map, players) {
  return Object.keys(map || {}).map((playerId) => playerName(playerId, players)).filter(Boolean);
}

function playerName(playerId, players) {
  const player = players[playerId];
  if (!player) return playerId;
  return player.full_name || `${player.first_name || ""} ${player.last_name || ""}`.trim() || playerId;
}

function movementStats(transactions, rosters, users) {
  const byRoster = new Map();
  let tradeCount = 0;
  let addDropCount = 0;
  for (const transaction of transactions) {
    if (transaction.type === "trade") tradeCount += 1;
    else addDropCount += 1;
    for (const rosterId of transaction.roster_ids || []) {
      byRoster.set(rosterId, (byRoster.get(rosterId) || 0) + 1);
    }
  }
  const top = [...byRoster.entries()].sort((a, b) => b[1] - a[1])[0];
  const roster = rosters.find((item) => item.roster_id === top?.[0]);
  return { tradeCount, addDropCount, waiverHawk: roster ? { name: teamName(roster, users), count: top[1] } : null };
}

function sortRosters(rosters) {
  return [...rosters].sort((a, b) => {
    const winDiff = stat(b, "wins") - stat(a, "wins");
    if (winDiff) return winDiff;
    const lossDiff = stat(a, "losses") - stat(b, "losses");
    if (lossDiff) return lossDiff;
    return totalPoints(b, "fpts") - totalPoints(a, "fpts");
  });
}

function teamCell(roster, users) {
  return `
    <div class="team-cell">
      ${avatar(roster, users)}
      <div class="team-copy">
        <strong>${escapeHtml(teamName(roster, users))}</strong>
        <span class="username">${escapeHtml(ownerIdentityName(roster, users))}</span>
      </div>
    </div>
  `;
}

function avatar(roster, users) {
  if (!roster) return `<span class="avatar">--</span>`;
  const user = userForRoster(roster, users);
  const avatarUrl = user?.metadata?.avatar;
  const avatarId = user?.avatar;
  const initials = initialsFor(teamName(roster, users));
  if (avatarUrl) return `<span class="avatar"><img alt="" src="${escapeHtml(avatarUrl)}" loading="lazy" /></span>`;
  if (!avatarId) return `<span class="avatar">${escapeHtml(initials)}</span>`;
  return `<span class="avatar"><img alt="" src="https://sleepercdn.com/avatars/thumbs/${avatarId}" loading="lazy" /></span>`;
}

function displayWeek(league, state = {}) {
  if (!league) return 1;
  if (league.status === "complete") return clampWeek(league.settings?.last_scored_leg || league.settings?.leg || 17);
  return clampWeek(state.display_week || state.week || league.settings?.leg || 1);
}

function finalGame(bracket) {
  return [...bracket].sort((a, b) => (b.r || 0) - (a.r || 0)).find((game) => game.p === 1 || game.w);
}

function historyFinish(roster, index, championRosterId, runnerUpRosterId, toiletWinnerRosterId, biggestLoserRosterId) {
  if (roster.roster_id === championRosterId) return "Champion";
  if (roster.roster_id === runnerUpRosterId) return "Runner-up";
  if (roster.roster_id === toiletWinnerRosterId) return "Toilet Bowl survivor";
  if (roster.roster_id === biggestLoserRosterId) return "💩 King";
  return `Seed #${index + 1}`;
}

function historyForRoster(roster, history) {
  return history?.rows.find((row) => row.ownerId === roster.owner_id) || history?.rows.find((row) => row.rosterId === roster.roster_id);
}

function shortFinish(finish) {
  return finish.replace("Toilet Bowl survivor", "Survivor").replace("Runner-up", "2nd").replace("Champion", "Champ");
}

function teamName(roster, users) {
  const user = userForRoster(roster, users);
  return user?.metadata?.team_name?.trim() || user?.display_name || user?.username || `Roster ${roster.roster_id}`;
}

function ownerName(roster, users) {
  const user = userForRoster(roster, users);
  return user?.display_name || user?.username || "Sleeper owner";
}

function ownerIdentityName(roster, users) {
  const user = userForRoster(roster, users);
  const username = user?.username?.toLowerCase();
  if (username && OWNER_REAL_NAMES[username]) return OWNER_REAL_NAMES[username];
  const displayName = user?.display_name?.toLowerCase();
  if (displayName && OWNER_REAL_NAMES[displayName]) return OWNER_REAL_NAMES[displayName];
  return user?.display_name || user?.username || "Sleeper owner";
}

function userForRoster(roster, users) {
  return users.find((user) => user.user_id === roster.owner_id);
}

function rosterName(rosterId, rosters, users) {
  const roster = rosters.find((item) => item.roster_id === rosterId);
  return roster ? teamName(roster, users) : "TBD";
}

function rosterManagerName(rosterId, rosters, users) {
  const roster = rosters.find((item) => item.roster_id === rosterId);
  return roster ? ownerIdentityName(roster, users) : "TBD";
}

function stat(roster, key) {
  return Number(roster.settings?.[key] || 0);
}

function totalPoints(roster, key) {
  return stat(roster, key) + stat(roster, `${key}_decimal`) / 100;
}

function points(roster, key) {
  return totalPoints(roster, key).toFixed(2);
}

function shortPoints(roster, key) {
  return Math.round(totalPoints(roster, key));
}

function scoreFor(matchup) {
  return Number(matchup?.custom_points ?? matchup?.points ?? 0);
}

function statusLabel(status) {
  return String(status || "").replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function buildWeekOptions() {
  els.weekSelect.innerHTML = WEEKS.map((week) => `<option value="${week}">Week ${week}</option>`).join("");
}

function groupBy(items, callback) {
  const grouped = new Map();
  for (const item of items) {
    const key = callback(item);
    const group = grouped.get(key) || [];
    group.push(item);
    grouped.set(key, group);
  }
  return grouped;
}

function setStatus(message, state) {
  if (!els.status || !els.statusDot) return;
  els.status.textContent = message;
  els.statusDot.classList.toggle("ready", state === "ready");
  els.statusDot.classList.toggle("error", state === "error");
}

function clampWeek(week) {
  return Math.min(Math.max(Number(week) || 1, 1), 18);
}

function formatTime() {
  return new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit", timeZone: EASTERN_TIME_ZONE }).format(currentDate());
}

function formatKickoff(value) {
  if (!value) return "TBD";
  return new Intl.DateTimeFormat(undefined, { weekday: "short", hour: "numeric", minute: "2-digit", timeZone: EASTERN_TIME_ZONE }).format(new Date(value));
}

function transactionDate(ms) {
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", timeZone: EASTERN_TIME_ZONE }).format(new Date(ms));
}

function relativeDate(ms) {
  const diff = Date.now() - ms;
  const minutes = Math.max(Math.round(diff / 60000), 0);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

function isToday(value) {
  return easternDateKey(value) === easternDateKey();
}

function currentDate() {
  const showcase = week7Showcase();
  if (showcase) return new Date(`${showcase.date}T12:00:00-04:00`);
  if (!DATE_PREVIEW || !/^\d{4}-\d{2}-\d{2}$/.test(DATE_PREVIEW)) return new Date();
  return new Date(`${DATE_PREVIEW}T12:00:00-04:00`);
}

function easternParts(value = currentDate()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: EASTERN_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  }).formatToParts(new Date(value));
  const get = (type) => parts.find((part) => part.type === type)?.value || "";
  const weekdays = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return {
    year: Number(get("year")),
    month: Number(get("month")),
    day: Number(get("day")),
    weekday: weekdays[get("weekday")] ?? 0,
  };
}

function easternDateKey(value = currentDate()) {
  const parts = easternParts(value);
  return `${parts.year}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}`;
}

function initialsFor(name) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char]);
}

function capitalize(value) {
  return String(value || "").replace(/^\w/, (char) => char.toUpperCase());
}
