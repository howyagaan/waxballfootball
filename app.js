const API_BASE = "https://api.sleeper.app/v1";
const CURRENT_LEAGUE_ID = "1312219624808419328";
const ARCHIVE_2025_LEAGUE_ID = "1253094778665439232";
const ARCHIVE_2025_DRAFT_ID = "1253094779571421184";
const AUTO_REFRESH_MS = 60000;
const WEEKS = Array.from({ length: 18 }, (_, index) => index + 1);
const PAGE = document.body.dataset.page || "current";
const EASTERN_TIME_ZONE = "America/New_York";
const DRAFT_DAY = "2026-09-05T18:00:00-04:00";
const FIRST_2026_KICKOFF = "2026-09-09T20:20:00-04:00";
const WAXBALL_AVATAR_SRC = "https://sleepercdn.com/avatars/thumbs/d67df8318914ca45733a411d66cbc8dd";
const SLEEPER_MATCHDAY_SCHEDULE = {
  "2026-1": [
    ["2026-w1-wed-ne-sea", "2026-09-09T20:20:00-04:00", "NE", "SEA", "NBC"],
    ["2026-w1-thu-sf-lar", "2026-09-10T20:35:00-04:00", "SF", "LAR", "Netflix"],
  ],
};
const QUERY_PARAMS = new URLSearchParams(window.location.search);
const SEASON_PREVIEW = QUERY_PARAMS.get("season");
const WEEK_PREVIEW = Number(QUERY_PARAMS.get("week"));
const DATE_PREVIEW = QUERY_PARAMS.get("date");
const PRESENTATION_PREVIEW = QUERY_PARAMS.get("presentation") || document.body.dataset.presentation || "";
const DRAFT_COMPLETE_PREVIEW = QUERY_PARAMS.get("preview") === "post-draft";
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
const PPR_LEADERS_2025 = [
  { name: "Christian McCaffrey", position: "RB", team: "SF" },
  { name: "Puka Nacua", position: "WR", team: "LAR" },
  { name: "Bijan Robinson", position: "RB", team: "ATL" },
  { name: "Jahmyr Gibbs", position: "RB", team: "DET" },
  { name: "Josh Allen", position: "QB", team: "BUF" },
  { name: "Jonathan Taylor", position: "RB", team: "IND" },
  { name: "Jaxon Smith-Njigba", position: "WR", team: "SEA" },
  { name: "Drake Maye", position: "QB", team: "NE" },
  { name: "Matthew Stafford", position: "QB", team: "LAR" },
  { name: "Trevor Lawrence", position: "QB", team: "JAX" },
  { name: "Amon-Ra St. Brown", position: "WR", team: "DET" },
  { name: "De'Von Achane", position: "RB", team: "MIA" },
];
const OWNER_REAL_NAMES = {
  helloimpaul: "Paul Legallet",
  bigboybluey: "Miles Blue",
  erikohno: "Erik Ohno Dagoberg",
  eviandon: "Milo Manheim",
  pigmanbigman: "Nic Hamilton",
  "10w5l": "Jacob Moskovitz",
  waxobwaxkovitz: "Jacob Moskovitz",
  willyboyp: "Will Price",
  bigdicksenior: "Sam Labovitz",
  darryluvr: "Travis Roy Rogers",
  darryluvr3000: "Travis Roy Rogers",
  chrissy511: "Christian Engelhardt",
  papicoop: "Jakob Cooper",
  millsberry27: "Miles Elliot",
};
const H2H_SEASON_OUTCOMES = {
  2024: {
    champion: "Christian Engelhardt",
    money: ["Christian Engelhardt", "Erik Ohno Dagoberg", "Travis Roy Rogers"],
    toiletBowlLoser: "Jacob Moskovitz",
  },
  2025: {
    champion: "Milo Manheim",
    money: ["Milo Manheim", "Miles Blue", "Jacob Moskovitz"],
    toiletBowlLoser: "Jakob Cooper",
  },
};
const DRAFT_ORDER_2026 = [
  "Miles Elliot",
  "Jakob Cooper",
  "Erik Ohno Dagoberg",
  "Christian Engelhardt",
  "Jacob Moskovitz",
  "Milo Manheim",
  "Nic Hamilton",
  "Miles Blue",
  "Paul Legallet",
  "Sam Labovitz",
  "Will Price",
  "Travis Roy Rogers",
];
const DRAFT_SCOUT_2025 = {
  "Jakob Cooper": {
    slot: "1st",
    finish: "12th / 💩 King",
    method: "Modified Zero RB. He opened WR-WR before taking his first back in round three, then stayed mostly balanced after the receiver-heavy start.",
    firstThree: ["Ja'Marr Chase (1.01)", "A.J. Brown (2.12)", "Omarion Hampton (3.01)"],
    rosterPositions: ["5WR", "4RB", "3TE", "2QB", "1K", "1D/ST"],
    read: "Started with two receiver anchors, then balanced running back and tight end depth before taking quarterbacks later.",
  },
  "Sam Labovitz": {
    slot: "2nd",
    finish: "8th",
    method: "Hero RB with an Elite QB. Bijan was the anchor back, then Sam bought quarterback advantage with Josh Allen in round three.",
    firstThree: ["Bijan Robinson (1.02)", "Tee Higgins (2.11)", "Josh Allen (3.02)"],
    rosterPositions: ["5WR", "4RB", "3TE", "2QB", "1D/ST", "1K"],
    read: "Grabbed an elite back, a receiver, and quarterback edge early, then filled out depth across every position.",
  },
  "Travis Roy Rogers": {
    slot: "3rd",
    finish: "11th",
    method: "Balanced RB/WR build. He alternated premium receivers and backs early, then waited on quarterback and tight end.",
    firstThree: ["CeeDee Lamb (1.03)", "James Cook (2.10)", "Alvin Kamara (3.03)"],
    rosterPositions: ["6WR", "4RB", "2QB", "2TE", "1K", "1D/ST"],
    read: "Opened with a clear WR/RB build, waited on quarterback, and used the middle rounds to pile up receiver depth.",
  },
  "Erik Ohno Dagoberg": {
    slot: "4th",
    finish: "6th",
    method: "Robust RB. He started RB-RB, then used the next receiver run to build weekly ceiling around a heavy backfield.",
    firstThree: ["Jahmyr Gibbs (1.04)", "Kyren Williams (2.09)", "Ladd McConkey (3.04)"],
    rosterPositions: ["6RB", "5WR", "2TE", "1QB", "1D/ST", "1K"],
    read: "Built from running backs first, then stacked receiver options before adding extra back depth late.",
  },
  "Will Price": {
    slot: "5th",
    finish: "7th",
    method: "Robust RB with an Elite QB. He opened RB-RB-Lamar, then spent the next stretch catching up at receiver.",
    firstThree: ["Saquon Barkley (1.05)", "Jonathan Taylor (2.08)", "Lamar Jackson (3.05)"],
    rosterPositions: ["6WR", "5RB", "2TE", "1QB", "1K", "1D/ST"],
    read: "Took two top backs and Lamar early, then spent most of the next stretch building receiver volume.",
  },
  "Paul Legallet": {
    slot: "6th",
    finish: "4th",
    method: "Anchor WR build. Jefferson was the first-round anchor, then Paul leaned receiver-heavy while still grabbing two backs in the first six.",
    firstThree: ["Justin Jefferson (1.06)", "Josh Jacobs (2.07)", "Jaxon Smith-Njigba (3.06)"],
    rosterPositions: ["6RB", "5WR", "2QB", "1TE", "1D/ST", "1K"],
    read: "Started receiver-heavy, then came back to running back depth and delayed tight end until late.",
  },
  "Jacob Moskovitz": {
    slot: "7th",
    finish: "3rd",
    method: "Anchor WR with an Elite QB. Amon-Ra started the build, then Jayden Daniels gave him an early quarterback edge.",
    firstThree: ["Amon-Ra St. Brown (1.07)", "Bucky Irving (2.06)", "Jayden Daniels (3.07)"],
    rosterPositions: ["5WR", "5RB", "2QB", "2TE", "1K", "1D/ST"],
    read: "Added elite quarterback upside early, then kept the roster balanced between receiver and running back.",
  },
  "Nic Hamilton": {
    slot: "8th",
    finish: "5th",
    method: "Modified Zero RB with an early QB. He started WR-WR, waited until round three for RB, then took quarterback in round four.",
    firstThree: ["Nico Collins (1.08)", "Drake London (2.05)", "Kenneth Walker (3.08)"],
    rosterPositions: ["6WR", "5RB", "2QB", "1TE", "1K", "1D/ST"],
    read: "Went receiver first, found running back starters next, then rounded out with late depth shots.",
  },
  "Christian Engelhardt": {
    slot: "9th",
    finish: "9th",
    method: "Hero RB with an Elite TE. McCaffrey anchored the build, then Brock Bowers came in round three as the positional advantage swing.",
    firstThree: ["Christian McCaffrey (1.09)", "Brian Thomas (2.04)", "Brock Bowers (3.09)"],
    rosterPositions: ["6WR", "4RB", "2QB", "2TE", "1D/ST", "1K"],
    read: "Paid up early for an elite tight end after a RB/WR start, then leaned receiver for depth.",
  },
  "Miles Blue": {
    slot: "10th",
    finish: "Runner-up",
    method: "Hero RB with Elite QB/TE. Derrick Henry anchored the roster before Blue bought Hurts and McBride inside the first four rounds.",
    firstThree: ["Derrick Henry (1.10)", "Puka Nacua (2.03)", "Jalen Hurts (3.10)"],
    rosterPositions: ["6WR", "4RB", "2QB", "2TE", "1K", "1D/ST"],
    read: "Used the turn to secure a power RB, elite receiver, quarterback, and tight end inside the first four rounds.",
  },
  "Miles Elliot": {
    slot: "11th",
    finish: "10th",
    method: "Anchor WR with an Elite QB. Malik Nabers started the build, then Joe Burrow gave him a round-three quarterback anchor.",
    firstThree: ["Malik Nabers (1.11)", "Chase Brown (2.02)", "Joe Burrow (3.11)"],
    rosterPositions: ["5WR", "5RB", "2QB", "2TE", "1K", "1D/ST"],
    read: "Balanced the board from the back of the round, pairing early QB stability with WR/RB depth.",
  },
  "Milo Manheim": {
    slot: "12th",
    finish: "Champion",
    method: "Robust RB with an Elite TE. Milo opened RB-RB, then added Trey McBride at the turn before balancing the roster.",
    firstThree: ["Ashton Jeanty (1.12)", "De'Von Achane (2.01)", "Trey McBride (3.12)"],
    rosterPositions: ["6WR", "4RB", "2QB", "2TE", "1K", "1D/ST"],
    read: "Double-tapped running back at the turn, took tight end early, then chased receiver depth through the middle rounds.",
  },
};
const DRAFT_SCOUT_2024 = {
  "Nic Hamilton": {
    slot: "1st",
    finish: "5th",
    method: "Hero RB with an Elite QB. McCaffrey was the lone RB anchor, then Josh Allen came in round three as the quarterback edge.",
    firstThree: ["Christian McCaffrey (1.01)", "Chris Olave (2.10)", "Josh Allen (3.01)"],
    rosterPositions: ["6WR", "5RB", "2QB", "1TE", "1K", "1D/ST"],
    read: "Paid for the best running back profile immediately, then locked in quarterback advantage early instead of waiting.",
  },
  "Miles Blue": {
    slot: "2nd",
    finish: "6th",
    method: "Anchor WR with an Elite QB. CeeDee Lamb was the receiver anchor, then Mahomes came in round three.",
    firstThree: ["CeeDee Lamb (1.02)", "Derrick Henry (2.09)", "Patrick Mahomes (3.02)"],
    rosterPositions: ["6WR", "4RB", "2QB", "2TE", "1K", "1D/ST"],
    read: "Took a top receiver first, paired him with Derrick Henry, then bought quarterback security with Mahomes.",
  },
  "Will Price": {
    slot: "3rd",
    finish: "7th",
    method: "Zero RB. Will went WR-WR-WR before taking his first back in round four, then added tight end and quarterback after that.",
    firstThree: ["Tyreek Hill (1.03)", "Davante Adams (2.08)", "Marvin Harrison Jr. (3.03)"],
    rosterPositions: ["6WR", "4RB", "2QB", "2TE", "1D/ST", "1K"],
    read: "Committed hardest to receivers early, which left the roster depending on mid-round backs to become usable starters.",
  },
  "Erik Ohno Dagoberg": {
    slot: "4th",
    finish: "Runner-up",
    method: "Zero RB. Erik opened WR-WR-WR, then took RB-TE-RB before waiting until round seven for quarterback.",
    firstThree: ["Amon-Ra St. Brown (1.04)", "Puka Nacua (2.07)", "Mike Evans (3.04)"],
    rosterPositions: ["6RB", "6WR", "1TE", "1QB", "1K", "1D/ST"],
    read: "Loaded up on receiver value first, then used the middle rounds to patch running back and tight end.",
  },
  "Jacob Moskovitz": {
    slot: "5th",
    finish: "10th / 💩 King",
    method: "Robust RB with an Elite TE. He started RB-RB-TE and had three backs inside the first six rounds.",
    firstThree: ["Breece Hall (1.05)", "Travis Etienne Jr. (2.06)", "Travis Kelce (3.05)"],
    rosterPositions: ["7RB", "5WR", "2QB", "1TE", "1K", "1D/ST"],
    read: "Built around running back volume and Kelce, then took Lamar to complete a very position-advantage focused start.",
  },
  "Travis Roy Rogers": {
    slot: "6th",
    finish: "3rd",
    method: "Robust RB with an Elite QB. He opened RB-RB, grabbed Hurts in round four, and kept hammering receivers through the middle.",
    firstThree: ["Bijan Robinson (1.06)", "Isiah Pacheco (2.05)", "Nico Collins (3.06)"],
    rosterPositions: ["6WR", "4RB", "2QB", "2TE", "1D/ST", "1K"],
    read: "Started with two backs, then used Hurts and a long receiver run to build weekly ceiling.",
  },
  "Christian Engelhardt": {
    slot: "7th",
    finish: "Champion",
    method: "Balanced anchor build. He alternated premium receiver and running back starts, then added quarterback in round six.",
    firstThree: ["Justin Jefferson (1.07)", "Saquon Barkley (2.04)", "Michael Pittman Jr. (3.07)"],
    rosterPositions: ["6WR", "4RB", "2QB", "2TE", "1D/ST", "1K"],
    read: "Did not chase one extreme tactic. The draft was built around proven weekly starters across WR and RB.",
  },
  "Sam Labovitz": {
    slot: "8th",
    finish: "4th",
    method: "Anchor WR with an early TE. Chase anchored the build, then LaPorta came in round four before quarterback in round six.",
    firstThree: ["Ja'Marr Chase (1.08)", "Kyren Williams (2.03)", "Drake London (3.08)"],
    rosterPositions: ["6WR", "4RB", "2QB", "2TE", "1K", "1D/ST"],
    read: "Started with receiver ceiling, took Kyren as the running back anchor, and got tight end out of the way early.",
  },
  "Miles Elliot": {
    slot: "9th",
    finish: "8th",
    method: "Balanced anchor build. He opened WR-RB-RB-WR, then paired McBride and Kyler in rounds five and six.",
    firstThree: ["Garrett Wilson (1.09)", "Jahmyr Gibbs (2.02)", "De'Von Achane (3.09)"],
    rosterPositions: ["6WR", "4RB", "2QB", "2TE", "1K", "1D/ST"],
    read: "Used the turn area to grab two explosive backs after a receiver anchor, then paired McBride with Kyler.",
  },
  "Jakob Cooper": {
    slot: "10th",
    finish: "9th",
    method: "Hero RB / balanced build. Taylor anchored the roster, then Jakob alternated WR, RB, WR, TE, and WR before waiting on quarterback.",
    firstThree: ["Jonathan Taylor (1.10)", "A.J. Brown (2.01)", "Alvin Kamara (3.10)"],
    rosterPositions: ["6WR", "4RB", "2QB", "2TE", "1K", "1D/ST"],
    read: "Used the turn to pair Taylor with A.J. Brown, then kept alternating reliable RB/WR pieces before Burrow in round nine.",
  },
};
const DRAFT_SCOUT_COMPARISONS = {
  "Jakob Cooper": "Jakob moved from a Taylor-led Hero RB build in 2024 to a modified Zero RB approach in 2025, opening Chase and A.J. Brown before touching running back.",
  "Sam Labovitz": "Sam kept the same broad WR/RB balance, but 2025 was more aggressive at quarterback: Josh Allen in round three instead of waiting until round six.",
  "Travis Roy Rogers": "Trav was more running-back heavy in 2024, starting RB-RB. In 2025 he softened that into a balanced RB/WR build and waited longer on quarterback.",
  "Erik Ohno Dagoberg": "Erik made the sharpest tactical flip: Zero RB in 2024 with three straight receivers, then Robust RB in 2025 with Gibbs and Kyren to start.",
  "Will Price": "Will went from full Zero RB in 2024 to the opposite in 2025, opening Saquon, Jonathan Taylor, and Lamar before addressing receiver.",
  "Jacob Moskovitz": "Mosko shifted away from the 2024 scarce-position build of RB-RB-TE-QB and moved toward an Amon-Ra anchor with Jayden Daniels as the early edge.",
  "Nic Hamilton": "Nic kept the early quarterback instinct from 2024, but moved from Hero RB at 1.1 to a modified Zero RB start with two receivers first.",
  "Christian Engelhardt": "Christian stayed balanced both years, but 2025 was more clearly built around positional leverage with McCaffrey plus Brock Bowers inside three rounds.",
  "Miles Blue": "Blue took an elite quarterback in round three both years. The main change was the anchor: CeeDee first in 2024, Derrick Henry first in 2025.",
  "Miles Elliot": "Miles stayed balanced across both drafts. In 2025 he pushed quarterback earlier with Joe Burrow in round three after taking Kyler in round six in 2024.",
};
const ARCHIVE_2025_TEAM_NAME_OVERRIDES = {
  "10w5l": "fantasyboy12345",
  erikohno: "Ricky McFricky",
  helloimpaul: "helloimpaul",
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
  draftCountdown: document.querySelector("#draft-countdown"),
  draftCountdownValue: document.querySelector("#draft-countdown-value"),
  draftScoutPanel: document.querySelector("#draft-scout-panel"),
  draftScoutSelect: document.querySelector("#draft-scout-select"),
  draftScoutBody: document.querySelector("#draft-scout-body"),
  avatarRail: document.querySelector("#league-avatar-rail"),
  countdown: document.querySelector("#preseason-countdown"),
  countdownValue: document.querySelector("#countdown-value"),
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
  standingsEyebrow: document.querySelector("#standings-eyebrow"),
  standingsAction: document.querySelector("#standings-action"),
  standingsHead: document.querySelector("#standings-head"),
  standingsNote: document.querySelector("#standings-note"),
  refreshStamp: document.querySelector("#refresh-stamp"),
  standings: document.querySelector("#standings-body"),
  weekSelect: document.querySelector("#week-select"),
  matchups: document.querySelector("#matchups-list"),
  notes: document.querySelector("#notes-list"),
  archiveSummary: document.querySelector("#archive-summary"),
  archiveBody: document.querySelector("#archive-body"),
  archiveDraftTop: document.querySelector("#archive-draft-top"),
  archivePprTop: document.querySelector("#archive-ppr-top"),
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
let playersLoadedAt = 0;

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
      if (PAGE === "current" && currentData) renderLeagueAvatarRail(currentData.rosters, currentData.users);
      if (PAGE === "archive" && archiveData) renderLeagueAvatarRail(archiveData.rosters, archiveData.users);
      if (selectedRosterId !== "league") scrollToLeagueTable();
    });
  }
  if (els.draftScoutSelect) {
    els.draftScoutSelect.addEventListener("change", () => {
      renderDraftScoutReport(els.draftScoutSelect.value);
    });
  }
  document.addEventListener("click", (event) => {
    const leaderToggle = event.target.closest("[data-leader-toggle]");
    if (leaderToggle) {
      toggleArchiveLeaders(!document.body.classList.contains("leaders-expanded"));
      return;
    }

    const rosterTarget = event.target.closest("[data-roster-link]");
    if (rosterTarget) {
      selectRosterFromShortcut(Number(rosterTarget.dataset.rosterLink), { scroll: rosterTarget.hasAttribute("data-avatar-shortcut") ? "profile" : "table" });
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
        matchupWeeks: PAGE === "current" || isHistoricalCurrentPreview() ? WEEKS : null,
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
    if (isDraftCompletePreview()) {
      applyDraftCompletePreview(currentData);
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

function applyDraftCompletePreview(data) {
  if (!data) return;
  data.previewMode = "draft-complete";
  data.league = {
    ...data.league,
    status: "in_season",
    settings: {
      ...data.league.settings,
      start_week: 1,
    },
  };
  data.week = 1;
  data.rosters = data.rosters.map((roster) => ({
    ...roster,
    ...draftPreviewRosterPatch(roster, data.users),
    settings: {
      ...roster.settings,
      wins: 0,
      losses: 0,
      ties: 0,
      fpts: 0,
      fpts_decimal: 0,
      fpts_against: 0,
      fpts_against_decimal: 0,
    },
  }));
  data.matchupsByWeek = {
    ...data.matchupsByWeek,
    1: draftCompletePreviewMatchups(data.rosters, data.users),
  };
  nflData = {
    ...nflData,
    events: draftCompletePreviewEvents(),
    mode: modeDefinition("tnf"),
  };
}

function draftPreviewRosterPatch(roster, users) {
  const players = DRAFT_COMPLETE_PREVIEW_ROSTERS[ownerIdentityName(roster, users)];
  if (!players) return {};
  const ids = players.map((player) => player.id);
  return {
    players: ids,
    starters: ids.slice(0, 9),
    previewPlayers: players,
  };
}

const DRAFT_COMPLETE_PREVIEW_ROSTERS = {
  "Milo Manheim": [
    previewPlayer("preview-hurts", "Jalen Hurts", "QB", "PHI"),
    previewPlayer("preview-saquon", "Saquon Barkley", "RB", "PHI"),
    previewPlayer("preview-cook", "James Cook", "RB", "BUF"),
    previewPlayer("preview-ajb", "A.J. Brown", "WR", "PHI"),
    previewPlayer("preview-lamb", "CeeDee Lamb", "WR", "DAL"),
    previewPlayer("preview-kittle", "George Kittle", "TE", "SF"),
    previewPlayer("preview-devonta", "DeVonta Smith", "WR", "PHI"),
    previewPlayer("preview-elliott", "Jake Elliott", "K", "PHI"),
    previewPlayer("preview-eagles", "Eagles D/ST", "D/ST", "PHI"),
    previewPlayer("preview-stroud", "C.J. Stroud", "QB", "HOU"),
    previewPlayer("preview-pollard", "Tony Pollard", "RB", "TEN"),
    previewPlayer("preview-mclaurin", "Terry McLaurin", "WR", "WAS"),
  ],
  "Nic Hamilton": [
    previewPlayer("preview-dak", "Dak Prescott", "QB", "DAL"),
    previewPlayer("preview-gibbs", "Jahmyr Gibbs", "RB", "DET"),
    previewPlayer("preview-kyren", "Kyren Williams", "RB", "LAR"),
    previewPlayer("preview-pickens", "George Pickens", "WR", "DAL"),
    previewPlayer("preview-waddle", "Jaylen Waddle", "WR", "MIA"),
    previewPlayer("preview-ferguson", "Jake Ferguson", "TE", "DAL"),
    previewPlayer("preview-dsmith", "DeVonta Smith", "WR", "PHI"),
    previewPlayer("preview-aubrey", "Brandon Aubrey", "K", "DAL"),
    previewPlayer("preview-cowboys", "Cowboys D/ST", "D/ST", "DAL"),
    previewPlayer("preview-love", "Jordan Love", "QB", "GB"),
    previewPlayer("preview-dobbins", "J.K. Dobbins", "RB", "DEN"),
    previewPlayer("preview-jamo", "Jameson Williams", "WR", "DET"),
  ],
};

function previewPlayer(id, name, position, team) {
  return { id, name, position, team, injuryStatus: "" };
}

function draftCompletePreviewEvents() {
  return [
    presentationEvent("2026-week1-thu-dal-phi", "2026-09-10T00:20:00Z", "DAL @ PHI", "Dallas Cowboys at Philadelphia Eagles", "DAL", "PHI", "NBC"),
  ];
}

function draftCompletePreviewMatchups(rosters, users) {
  const ordered = rostersByDraftOrder(rosters, users);
  const pairings = [
    [0, 11],
    [1, 10],
    [2, 9],
    [3, 8],
    [4, 7],
    [5, 6],
  ];
  return pairings.flatMap((pair, matchupIndex) => pair
    .map((orderedIndex) => ordered[orderedIndex])
    .filter(Boolean)
    .map((roster) => ({
      roster_id: roster.roster_id,
      matchup_id: matchupIndex + 1,
      points: 0,
      starters: roster.starters || [],
      players: roster.players || [],
      starters_points: roster.starters?.map(() => 0) || [],
    })));
}

function rostersByDraftOrder(rosters, users) {
  return [...rosters].sort((a, b) => {
    const draftDiff = draftOrderRank(a, users) - draftOrderRank(b, users);
    if (draftDiff) return draftDiff;
    return ownerIdentityName(a, users).localeCompare(ownerIdentityName(b, users), undefined, { sensitivity: "base" });
  });
}

async function loadNflContext() {
  const previewEvents = historicalPreviewNflEvents();
  if (previewEvents) {
    return {
      season: { year: Number(SEASON_PREVIEW) || 2025 },
      week: { number: previewWeek() },
      events: previewEvents,
      articles: [],
      mode: detectFootballMode(previewEvents),
    };
  }

  const state = await fetchJson("/state/nfl");
  const seasonYear = Number(state.season) || new Date().getFullYear();
  const weekNumber = clampWeek(state.display_week || state.week || 1);
  const events = sleeperMatchdayEvents(seasonYear, weekNumber);
  return {
    season: { year: seasonYear },
    week: { number: weekNumber },
    events,
    articles: [],
    mode: detectFootballMode(events),
  };
}

function sleeperMatchdayEvents(seasonYear, weekNumber) {
  return (SLEEPER_MATCHDAY_SCHEDULE[`${seasonYear}-${weekNumber}`] || []).map(([id, date, away, home, broadcast]) => {
    const state = localGameState(date);
    return {
      id,
      date,
      shortName: `${away} @ ${home}`,
      name: `${away} at ${home}`,
      season: { year: seasonYear, type: 2 },
      status: { type: { state, description: state === "post" ? "Final" : state === "in" ? "Live" : "Scheduled", shortDetail: state === "post" ? "Final" : formatKickoff(date) } },
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
  });
}

function localGameState(date) {
  const now = currentDate();
  const kickoff = new Date(date);
  const finalWindow = new Date(kickoff.getTime() + 4.5 * 60 * 60 * 1000);
  if (now < kickoff) return "pre";
  if (now < finalWindow) return "in";
  return "post";
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
  const response = await fetch(`${API_BASE}${path}`, { cache: "no-store" });
  if (!response.ok) throw new Error(`Sleeper returned ${response.status} for ${path}.`);
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
  const leader = sortRosters(rosters, users)[0];
  const showCurrentLeader = hasCompletedWeek(rosters, league);

  applyModeTheme(nflData.mode);
  renderHeroMode(nflData.mode);
  renderLeagueAvatar(league);
  if (els.heroTitle) els.heroTitle.textContent = `Waxball ${league.season || "2026"}`;
  if (els.sleeperLink) {
    els.sleeperLink.href = sleeperLeagueUrl(league);
    els.sleeperLink.textContent = "Open Sleeper";
  }
  els.heroCopy.textContent = heroLeagueCopy(league);
  renderModeHeroCopy(league);
  els.season.textContent = league.season || "2026";
  els.week.textContent = modeWeekLabel(nflData.mode, league);
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
  renderPreseasonCountdown();
  renderDraftScoutPanel(shouldShowDraftOrderMock(rosters));
  renderLeagueAvatarRail(rosters, users);
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

function renderPreseasonCountdown() {
  const now = currentDate();
  if (currentData?.league?.status === "pre_draft") {
    renderCountdown(els.draftCountdown, els.draftCountdownValue, new Date(DRAFT_DAY), now);
  } else {
    els.draftCountdown?.setAttribute("hidden", "");
  }
  renderCountdown(els.countdown, els.countdownValue, new Date(FIRST_2026_KICKOFF), now);
}

function renderDraftScoutPanel(show) {
  if (!els.draftScoutPanel || !els.draftScoutSelect || !els.draftScoutBody) return;
  els.draftScoutPanel.toggleAttribute("hidden", !show);
  if (!show) return;

  const currentValue = els.draftScoutSelect.value;
  els.draftScoutSelect.innerHTML = `
    <option value="">Choose manager</option>
    ${Object.keys(DRAFT_SCOUT_2025).map((manager) => `<option value="${escapeHtml(manager)}">${escapeHtml(manager)}</option>`).join("")}
  `;
  if (currentValue && DRAFT_SCOUT_2025[currentValue]) {
    els.draftScoutSelect.value = currentValue;
    renderDraftScoutReport(currentValue);
  } else {
    els.draftScoutBody.innerHTML = `<p>Select a manager to see his draft review.</p>`;
  }
}

function renderDraftScoutReport(manager) {
  if (!els.draftScoutBody) return;
  const report2025 = DRAFT_SCOUT_2025[manager];
  const report2024 = DRAFT_SCOUT_2024[manager];
  if (!report2025 && !report2024) {
    els.draftScoutBody.innerHTML = `<p>Select a manager to see his draft review.</p>`;
    return;
  }
  els.draftScoutBody.innerHTML = `
    ${draftScoutComparisonHtml(manager)}
    ${draftScoutSeasonHtml("2025", report2025)}
    ${draftScoutSeasonHtml("2024", report2024)}
  `;
}

function draftScoutComparisonHtml(manager) {
  const comparison = DRAFT_SCOUT_COMPARISONS[manager];
  if (!comparison) return "";
  return `
    <div class="draft-scout-comparison">
      <span class="metric-label">Year-to-Year Read</span>
      <p>${escapeHtml(comparison)}</p>
    </div>
  `;
}

function draftScoutSeasonHtml(season, report) {
  if (!report) return "";
  return `
    <section class="draft-scout-season" aria-label="${season} draft review">
      <h3>${season} Draft Review</h3>
      <div class="draft-scout-grid">
        <div>
          <span class="metric-label">Draft Slot</span>
          <strong>${escapeHtml(report.slot)}</strong>
          <p>Finished ${escapeHtml(report.finish)}</p>
        </div>
        <div>
          <span class="metric-label">Method</span>
          <p>${escapeHtml(report.method)}</p>
        </div>
        <div class="wide-card">
          <span class="metric-label">First Three Picks</span>
          <div class="scout-stars">
            ${report.firstThree.map((player) => `<span>${escapeHtml(player)}</span>`).join("")}
          </div>
        </div>
        <div class="wide-card">
          <span class="metric-label">Roster Composition</span>
          <div class="scout-stars">
            ${report.rosterPositions.map((position) => `<span>${escapeHtml(position)}</span>`).join("")}
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderCountdown(element, valueElement, target, now = currentDate()) {
  if (!element || !valueElement) return;
  const show = PAGE === "current" && isPreseasonMode() && now < target;
  element.toggleAttribute("hidden", !show);
  const label = element.querySelector("p");
  if (label) label.textContent = formatCountdownTarget(target);
  if (!show) return;
  const diff = Math.max(target - now, 0);
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  valueElement.textContent = `${days}d ${hours}h ${minutes}m`;
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
  renderArchiveLeaderPanels(archiveData);
  renderLeagueAvatarRail(archiveData.rosters, archiveData.users);
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
          <span class="metric-label">Playoff champion</span>
          <strong>${escapeHtml(ownerIdentityName(champion.roster, data.users))}</strong>
          <span class="username">${escapeHtml(champion.team)}</span>
          <p class="result-reward money">$900</p>
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
          <span class="metric-label">💩 King</span>
          <strong>${escapeHtml(ownerIdentityName(poopKing.roster, data.users))}</strong>
          <span class="username">${escapeHtml(poopKing.team)}</span>
          <p class="result-reward punishment">Calendar Spread</p>
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
  const isDraftOrder = shouldShowDraftOrderMock(rosters);
  renderStandingsHeader(isDraftOrder);

  if (isDraftOrder) {
    renderDraftOrderMock(rosters, users);
    return;
  }

  const rows = sortRosters(rosters, users)
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

function renderStandingsHeader(isDraftOrder) {
  if (els.standingsEyebrow) els.standingsEyebrow.textContent = isDraftOrder ? "Draft room" : "Sleeper live";
  if (els.standingsTitle) els.standingsTitle.textContent = isDraftOrder ? "Draft Order" : "League Table";
  if (els.standingsAction) els.standingsAction.textContent = isDraftOrder ? "Draft Order" : "League Table";
  const standingsTable = els.standings?.closest("table");
  standingsTable?.classList.toggle("draft-order-table", isDraftOrder);
  standingsTable?.closest(".mobile-table-card")?.classList.toggle("draft-order-card", isDraftOrder);
  const teamControl = els.teamSelect?.closest(".hero-team-control");
  if (teamControl && PAGE === "current") teamControl.hidden = isDraftOrder;
  if (!els.standingsHead) return;
  els.standingsHead.innerHTML = isDraftOrder
    ? `
      <tr>
        <th>#</th>
        <th>Manager</th>
        <th>Team</th>
      </tr>
    `
    : `
      <tr>
        <th>#</th>
        <th>Team</th>
        <th>Rec</th>
        <th>PF</th>
        <th>PA</th>
      </tr>
    `;
}

function renderDraftOrderMock(rosters, users) {
  const rows = sortRosters(rosters, users)
    .map((roster, index) => `
      <tr class="${Number(selectedRosterId) === Number(roster.roster_id) ? "selected-row" : ""}">
        <td class="rank">${index + 1}</td>
        <td>${managerCell(roster, users)}</td>
        <td class="draft-team-name">${escapeHtml(teamName(roster, users))}</td>
      </tr>
    `)
    .join("");
  els.standings.innerHTML = rows || `<tr><td colspan="3">Draft order will appear here.</td></tr>`;
}

function renderLeagueAvatarRail(rosters, users) {
  if (!els.avatarRail || !["current", "archive"].includes(PAGE)) return;
  const ordered = PAGE === "archive"
    ? archiveRowsForTable(archiveData).map((row) => row.roster).filter(Boolean)
    : [...rosters].sort((a, b) => ownerIdentityName(a, users).localeCompare(ownerIdentityName(b, users), undefined, { sensitivity: "base" }));
  document.body.classList.add("has-avatar-rail");
  els.avatarRail.innerHTML = ordered.map((roster) => `
    <button
      class="league-avatar-shortcut ${Number(selectedRosterId) === Number(roster.roster_id) ? "active" : ""}"
      type="button"
      data-roster-link="${escapeHtml(roster.roster_id)}"
      data-avatar-shortcut
      aria-label="Open ${escapeHtml(ownerIdentityName(roster, users))}"
      title="${escapeHtml(ownerIdentityName(roster, users))}"
    >
      ${avatar(roster, users, { initialsSource: ownerIdentityName(roster, users) })}
      <span>${escapeHtml(compactManagerName(ownerIdentityName(roster, users)))}</span>
    </button>
  `).join("");
}

async function selectRosterFromShortcut(rosterId, options = {}) {
  selectedRosterId = Number(rosterId);
  if (els.teamSelect) els.teamSelect.value = String(selectedRosterId);
  await renderSelectedTeam();
  if (PAGE === "current" && currentData) renderStandings(currentData.rosters, currentData.users);
  if (PAGE === "archive" && archiveData) renderLeagueAvatarRail(archiveData.rosters, archiveData.users);
  if (PAGE === "current" && currentData) renderLeagueAvatarRail(currentData.rosters, currentData.users);
  if (options.scroll === "profile") {
    scrollToSelectedTeamPanel();
  } else {
    scrollToLeagueTable();
  }
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
  const groups = Array.from(grouped.values());
  const heatedKeys = heatedRivalryKeys(groups, rosters, users);
  if (isTuesdayMode()) {
    const previousWeek = currentData.matchupsByWeek[currentWeek - 1] || [];
    const previousGrouped = groupBy(previousWeek, (matchup) => matchup.matchup_id || matchup.roster_id);
    const previousGroups = Array.from(previousGrouped.values());
    const previousHeatedKeys = heatedRivalryKeys(previousGroups, rosters, users);
    els.matchups.innerHTML = `
      <div class="matchup-subsection">
        <span class="metric-label">Last week recap</span>
        ${previousGroups.map((pair) => matchupCard(pair, rosters, users, { forceScores: true, heatedRivalry: previousHeatedKeys.has(matchupPairKey(pair)) })).join("")}
      </div>
      <div class="matchup-subsection">
        <span class="metric-label">Week ${week} preview</span>
        ${groups.map((pair) => matchupCard(pair, rosters, users, { heatedRivalry: heatedKeys.has(matchupPairKey(pair)) })).join("")}
      </div>
    `;
    return;
  }
  els.matchups.innerHTML = groups.map((pair) => matchupCard(pair, rosters, users, { heatedRivalry: heatedKeys.has(matchupPairKey(pair)) })).join("");
}

function renderTeamSelector(rosters, users) {
  if (!els.teamSelect) return;
  const optionName = (roster) => (PAGE === "current" ? ownerIdentityName(roster, users) : teamName(roster, users));
  const sorted = [...rosters].sort((a, b) => optionName(a).localeCompare(optionName(b)));
  const leagueOption = PAGE === "current" ? `<option value="league">LEAGUE VIEW</option>` : "";
  const options = sorted
    .map((roster) => `<option value="${roster.roster_id}">${escapeHtml(optionName(roster))}</option>`)
    .join("");
  els.teamSelect.innerHTML = leagueOption + options;
  if (
    !selectedRosterId ||
    (selectedRosterId !== "league" && !rosters.some((roster) => roster.roster_id === selectedRosterId))
  ) {
    const previewRoster = isDraftCompletePreview()
      ? rosters.find((roster) => ownerIdentityName(roster, users) === "Milo Manheim")
      : null;
    selectedRosterId = previewRoster?.roster_id || (PAGE === "current" ? "league" : sorted[0]?.roster_id || null);
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
  const selectedIsHeated = isHeatedSelectedMatchup(matchup, currentData.matchupsByWeek[currentWeek] || [], currentData.rosters, currentData.users);
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
    ${tuesdayLastWeekResult(roster, source.rosters, source.users)}
    <div class="matchup-focus-card ${selectedIsHeated ? "heated-rivalry-card" : ""}">
      <div class="matchup-focus-head">
        <div>
          <span class="metric-label">Current matchup</span>
          ${matchup.detail ? `<p class="muted">${escapeHtml(matchup.detail)}</p>` : ""}
        </div>
        ${matchupScoreBadge(matchup)}
      </div>
      ${matchupVersusShowpiece(roster, opponentRoster, source.users)}
      ${matchupHistoryPanel(roster, opponentRoster, source.users, { heatedRivalry: selectedIsHeated })}
    </div>
    ${historicalRosterSnapshot}
    ${playersToWatch}
    <button class="button league-view-button" type="button" data-league-view>See All Matchups in League View</button>
  `;
}

function tuesdayLastWeekResult(roster, rosters, users) {
  if (!isTuesdayMode()) return "";
  const matchup = selectedTeamMatchup(roster, currentData.matchupsByWeek[currentWeek - 1] || [], rosters, users, { forceScores: true });
  if (!matchup?.mine || !matchup?.opponentRoster) return "";
  return `
    <article class="matchup-focus-card last-week-result-card">
      <span class="metric-label">Last week result</span>
      <h3>${escapeHtml(matchupResultText(roster, matchup.opponentRoster, users, scoreFor(matchup.mine), scoreFor(matchup.opponent)))}</h3>
      ${matchupScoreLine(matchup, roster, matchup.opponentRoster, users)}
    </article>
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
  els.archiveBody.innerHTML = archiveRowsForTable(data)
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

function archiveRowsForTable(data) {
  return data?.history?.rows || [];
}

function renderArchiveLeaderPanels(data) {
  if (els.archiveDraftTop) {
    const topPicks = [...(data.draftPicks || [])]
      .sort((a, b) => Number(a.pick_no) - Number(b.pick_no))
      .slice(0, 12);
    els.archiveDraftTop.innerHTML = topPicks.length
      ? expandableLeaderList(topPicks.map((pick) => archiveDraftLeaderItem(pick, data)), "Show picks 6-12")
      : `<ol class="leader-list"><li><div class="leader-copy"><strong>No draft picks found.</strong></div></li></ol>`;
  }

  if (els.archivePprTop) {
    els.archivePprTop.innerHTML = expandableLeaderList(
      PPR_LEADERS_2025.map((leader) => archivePprLeaderItem(leader, data)),
      "Show players 6-12",
    );
  }

  toggleArchiveLeaders(document.body.classList.contains("leaders-expanded"));
}

function expandableLeaderList(items, summary) {
  const firstFive = items.slice(0, 5).join("");
  const extra = items.slice(5).join("");
  const hideLabel = summary.replace(/^Show/i, "Hide");
  return `
    <ol class="leader-list">
      ${firstFive}
    </ol>
    ${extra ? `
      <ol class="leader-list leader-list-extra" hidden>
        ${extra}
      </ol>
      <button class="leader-toggle" type="button" data-leader-toggle data-show-label="${escapeHtml(summary)}" data-hide-label="${escapeHtml(hideLabel)}">
        ${escapeHtml(summary)}
      </button>
    ` : ""}
  `;
}

function toggleArchiveLeaders(expanded) {
  document.body.classList.toggle("leaders-expanded", expanded);
  document.querySelectorAll(".leader-list-extra").forEach((list) => {
    list.hidden = !expanded;
  });
  document.querySelectorAll("[data-leader-toggle]").forEach((button) => {
    button.textContent = expanded ? button.dataset.hideLabel : button.dataset.showLabel;
    button.setAttribute("aria-expanded", String(expanded));
  });
}

function archiveDraftLeaderItem(pick, data) {
  const player = draftPickPlayer(pick);
  const manager = draftManagerByRosterId(pick.roster_id, data);
  return `
    <li>
      <div class="leader-copy">
        <strong>${escapeHtml(player.name)}</strong>
        <span>${escapeHtml(player.position)} · ${escapeHtml(player.team)}</span>
        <span class="leader-source">Drafted by ${escapeHtml(manager)}</span>
      </div>
    </li>
  `;
}

function archivePprLeaderItem(leader, data) {
  const pick = draftPickForPlayer(leader.name, data.draftPicks || []);
  const manager = pick ? draftManagerByRosterId(pick.roster_id, data) : "Undrafted in Waxball";
  return `
    <li>
      <div class="leader-copy">
        <strong>${escapeHtml(leader.name)}</strong>
        <span>${escapeHtml(leader.position)} · ${escapeHtml(leader.team)}</span>
        <span class="leader-source">${pick ? "Drafted by " : ""}${escapeHtml(manager)}</span>
      </div>
    </li>
  `;
}

function draftPickPlayer(pick) {
  return {
    name: `${pick.metadata?.first_name || ""} ${pick.metadata?.last_name || ""}`.trim() || String(pick.player_id || "Unknown player"),
    position: pick.metadata?.position || "NFL",
    team: pick.metadata?.team || "FA",
  };
}

function draftPickForPlayer(playerName, picks) {
  const target = normalizePlayerName(playerName);
  return picks.find((pick) => normalizePlayerName(draftPickPlayer(pick).name) === target);
}

function draftManagerByRosterId(rosterId, data) {
  const roster = data.rosters.find((item) => Number(item.roster_id) === Number(rosterId));
  return roster ? ownerIdentityName(roster, data.users) : "Unknown manager";
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
  if (isDraftCompletePreview()) {
    return "Draft complete preview: the draft countdown is gone, standings are live, the team selector is back, and Week 1 matchups are ready for Sleeper data.";
  }
  if (isHistoricalCurrentPreview()) {
    return `${league.season} preview mode: Thursday Week ${currentWeek}, rebuilt from Sleeper matchups, rosters, avatars, and standings through the prior week.`;
  }
  if (isPreseasonMode()) {
    return "Waxball is back for its 3rd season. This site will update automatically throughout the year and act as an archive for previous seasons. Godspeed boys, and happy Waxing.";
  }
  const modeCopy = syncModeHeroCopy();
  if (modeCopy) return modeCopy;
  if (!currentSeasonHasResults()) {
    return nextScheduledGameCopy(nflData?.events || [], nflData?.mode) || nflData?.mode?.copy;
  }
  if (currentSeasonHasResults()) {
    const leader = sortRosters(currentData.rosters, currentData.users)[0];
    const last = lastPlaceRoster(currentData.rosters);
    return `${teamName(leader, currentData.users)} leads Waxball right now, while ${teamName(last, currentData.users)} is staring at the danger zone. Matchups and player windows update as the week unfolds.`;
  }
  if (league.status === "pre_draft" || isMatchupPreviewMode()) {
    return "Waxball is back for its 3rd season. This site will update automatically throughout the year and act as an archive for previous seasons. Godspeed boys, and happy Waxing.";
  }
  return "Waxball is live. League table, matchups, roster windows, and weekly pressure points will update as the season moves.";
}

async function renderModeHeroCopy(league) {
  if (!els.heroCopy || PAGE !== "current" || isPreseasonMode() || isDraftCompletePreview() || isHistoricalCurrentPreview()) return;
  try {
    const modeCopy = await asyncModeHeroCopy();
    if (modeCopy) els.heroCopy.textContent = modeCopy;
  } catch (error) {
    console.warn("Mode hero copy unavailable.", error);
  }
}

function syncModeHeroCopy() {
  const label = nflData?.mode?.label;
  if (label === "Wednesday" || label === "Thursday") {
    return nextScheduledGameCopy(nflData?.events || [], nflData?.mode);
  }
  if (label === "Saturday") {
    return saturdayFootballCopy(nflData?.events || []);
  }
  return "";
}

async function asyncModeHeroCopy() {
  const label = nflData?.mode?.label;
  if (label === "Tuesday") {
    return previousWeekTopPprCopy();
  }
  if (label === "Friday") {
    return fridayTnfRecapCopy();
  }
  return "";
}

function modeWeekLabel(mode, league) {
  if (isPreseasonMode()) return "Preseason";
  if (league?.status === "pre_draft") return "Pre-draft";
  if (mode?.weekLabelPrefix) return `${mode.weekLabelPrefix} Week ${currentWeek}`;
  return `Week ${currentWeek}`;
}

function nextScheduledGameCopy(events, mode) {
  const game = prioritizedGameForMode(events, mode);
  if (!game) return "";
  const parsed = parseGame(game);
  return `Next NFL game: ${parsed.shortName} - ${parsed.kickoff}${parsed.broadcast ? ` on ${parsed.broadcast}` : ""}.`;
}

function prioritizedGameForMode(events, mode) {
  if (mode?.label === "Sunday" || mode?.label === "Saturday") {
    return sundayNightGame(events) || nextScheduledGame(events);
  }
  if (mode?.label === "Wednesday" || mode?.label === "Thursday") {
    return thursdayNightGame(events) || nextScheduledGame(events);
  }
  return nextScheduledGame(events);
}

function nextScheduledGame(events) {
  const now = currentDate();
  return [...events]
    .filter((event) => event.status?.type?.state !== "post" && new Date(event.date) >= now)
    .sort((a, b) => new Date(a.date) - new Date(b.date))[0] || null;
}

function thursdayNightGame(events) {
  return [...events]
    .filter((event) => {
      const kickoff = new Date(event.date);
      const parts = easternParts(kickoff);
      return parts.weekday === 4 && event.status?.type?.state !== "post" && kickoff >= currentDate();
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date))[0] || null;
}

function sundayNightGame(events) {
  return [...events]
    .filter((event) => {
      const kickoff = new Date(event.date);
      const parts = easternParts(kickoff);
      return parts.weekday === 0 && event.status?.type?.state !== "post" && kickoff >= currentDate();
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date))[0] || null;
}

function latestCompletedGameForWeekday(events, weekday) {
  return [...events]
    .filter((event) => event.status?.type?.state === "post" && easternParts(event.date).weekday === weekday)
    .sort((a, b) => new Date(b.date) - new Date(a.date))[0] || null;
}

function saturdayFootballCopy(events) {
  const game = sundayNightGame(events) || nextScheduledGame(events);
  if (!game) return "";
  const parsed = parseGame(game);
  return `SNF game: ${parsed.shortName} - ${parsed.kickoff}${parsed.broadcast ? ` on ${parsed.broadcast}` : ""}.`;
}

async function fridayTnfRecapCopy() {
  const tnf = latestCompletedGameForWeekday(nflData?.events || [], 4);
  if (!tnf) return nextScheduledGameCopy(nflData?.events || [], nflData?.mode) || nflData?.mode?.copy || "";
  const parsed = parseGame(tnf);
  const topPlayer = await topPprPlayersForWeek(currentWeek, new Set(nflTeamsForEvent(tnf)), 1);
  const score = finalGameScore(tnf);
  const scoreText = score ? ` ${score}.` : ".";
  const leaderText = topPlayer.length
    ? ` Top PPR player: ${topPlayer[0].player.name} (${topPlayer[0].points.toFixed(2)}) for ${ownerIdentityName(topPlayer[0].roster, currentData.users)}.`
    : " Top PPR player will appear once Sleeper scores the rostered TNF players.";
  return `TNF final: ${parsed.shortName}${scoreText}${leaderText}`;
}

async function previousWeekTopPprCopy() {
  const week = Math.max(1, currentWeek - 1);
  const topPlayers = await topPprPlayersForWeek(week, null, 3);
  if (!topPlayers.length) return nextScheduledGameCopy(nflData?.events || [], nflData?.mode) || "";
  const leaders = topPlayers
    .map((item, index) => `${index + 1}. ${item.player.name} (${item.points.toFixed(2)}) - ${ownerIdentityName(item.roster, currentData.users)}`)
    .join("; ");
  return `Previous week top PPR players: ${leaders}.`;
}

async function topPprPlayersForWeek(week, teamFilter = null, limit = 3) {
  const players = await loadPlayers();
  const matchups = currentData?.matchupsByWeek?.[week] || [];
  return matchups.flatMap((matchup) => {
    const roster = currentData.rosters.find((item) => Number(item.roster_id) === Number(matchup.roster_id));
    if (!roster) return [];
    return Object.entries(matchup.players_points || {}).map(([playerId, points]) => {
      const player = playerSummary(playerId, players);
      return player ? { roster, player, points: Number(points) || 0 } : null;
    }).filter(Boolean);
  })
    .filter((item) => item.points > 0)
    .filter((item) => !teamFilter || teamFilter.has(item.player.team))
    .sort((a, b) => b.points - a.points)
    .slice(0, limit);
}

function finalGameScore(event) {
  const competitors = event.competitions?.[0]?.competitors || [];
  const away = competitors.find((competitor) => competitor.homeAway === "away");
  const home = competitors.find((competitor) => competitor.homeAway === "home");
  const awayScore = Number(away?.score);
  const homeScore = Number(home?.score);
  if (!Number.isFinite(awayScore) || !Number.isFinite(homeScore)) return "";
  return `${away?.team?.abbreviation || "Away"} ${awayScore}, ${home?.team?.abbreviation || "Home"} ${homeScore}`;
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
  if (isHistoricalCurrentPreview()) return false;
  if (isDraftCompletePreview()) return false;
  return PAGE === "current" && !isModePreview() && currentDate() < new Date(DRAFT_DAY);
}

function isModePreview() {
  return Boolean(previewModeDefinition());
}

function isDraftCompletePreview() {
  return PAGE === "current" && DRAFT_COMPLETE_PREVIEW;
}

function isHistoricalCurrentPreview() {
  return PAGE === "current" && (
    (SEASON_PREVIEW === "2025" && Number.isInteger(WEEK_PREVIEW) && WEEK_PREVIEW >= 1) ||
    isPresentationPreview()
  );
}

function previewWeek() {
  if (isPresentationPreview()) return 8;
  return isHistoricalCurrentPreview() ? clampWeek(WEEK_PREVIEW) : 0;
}

function isPresentationPreview() {
  return ["tnf", "friday", "saturday", "snf"].includes(PRESENTATION_PREVIEW);
}

function activeCurrentLeagueId() {
  return isHistoricalCurrentPreview() ? ARCHIVE_2025_LEAGUE_ID : CURRENT_LEAGUE_ID;
}

function currentPosition(roster, rosters, users = currentData?.users || []) {
  const rank = sortRosters(rosters, users).findIndex((item) => item.roster_id === roster.roster_id) + 1;
  return rank ? `#${rank}` : "--";
}

function teamNameByRosterId(rosterId) {
  const roster = currentData?.rosters?.find((item) => Number(item.roster_id) === Number(rosterId));
  return roster ? teamName(roster, currentData.users) : "team view";
}

function isMatchupPreviewMode() {
  return currentData?.previewMode === "matchups";
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
      return `${title} He made the playoff bracket and was knocked out by ${rosterName(elimination.w, data.rosters, data.users)} in ${roundLabel(elimination, "playoff")}.`;
    }
    return `${title} He made the playoff bracket and stayed alive deeper than his seed suggested.`;
  }

  const survival = [...data.losersBracket].reverse().find((game) => game.l === historyRow.rosterId);
  if (survival) {
    return `${title} He landed in the Toilet Bowl and survived by beating ${rosterName(opponentInGame(survival, historyRow.rosterId), data.rosters, data.users)} in ${roundLabel(survival, "poop")}.`;
  }

  const danger = data.losersBracket.find((game) => game.w === historyRow.rosterId);
  if (danger) {
    return `${title} He landed in the Toilet Bowl and was pushed toward danger by ${rosterName(opponentInGame(danger, historyRow.rosterId), data.rosters, data.users)} in ${roundLabel(danger, "poop")}.`;
  }

  return `${title} His playoff or Toilet Bowl path was not recorded in the bracket feed.`;
}

function draftedPlayersForRoster(roster, picks) {
  return picks
    .filter((pick) => Number(pick.roster_id) === Number(roster.roster_id))
    .sort((a, b) => a.pick_no - b.pick_no)
    .map((pick) => ({
      id: String(pick.player_id),
      name: `${pick.metadata?.first_name || ""} ${pick.metadata?.last_name || ""}`.trim() || String(pick.player_id),
      position: normalizeRosterPosition(pick.metadata?.position || ""),
      team: pick.metadata?.team || "",
      pick: pick.pick_no,
      round: pick.round,
    }))
    .sort((a, b) => positionSort(a.position) - positionSort(b.position) || a.name.localeCompare(b.name));
}

function finalPlayersForRoster(roster, players) {
  const reserveIds = new Set((roster.reserve || []).map(String));
  const playerIds = [...new Set([...(roster.players || []), ...(roster.reserve || [])].map(String))];
  return playerIds
    .filter((playerId) => playerId && playerId !== "0")
    .map((playerId) => {
      if (/^[A-Z]{2,3}$/.test(String(playerId))) {
        return { id: String(playerId), name: `${playerId} D/ST`, position: "D/ST", team: String(playerId), ir: reserveIds.has(String(playerId)) };
      }
      const summary = playerSummary(playerId, players);
      return summary ? { ...summary, position: normalizeRosterPosition(summary.position), id: String(playerId), ir: reserveIds.has(String(playerId)) } : null;
    })
    .filter(Boolean)
    .sort((a, b) => positionSort(a.position) - positionSort(b.position) || a.name.localeCompare(b.name));
}

function playerSimpleList(players, fallback) {
  if (!players?.length) return `<p class="muted">${escapeHtml(fallback)}</p>`;
  return `
    <ul class="player-list compact-player-list">
      ${players.map((player) => `<li>${playerNameHtml(player)}<span>${playerTagHtml(player)}</span></li>`).join("")}
    </ul>
  `;
}

function playerTagHtml(player) {
  const tags = [];
  if (player.position) tags.push(escapeHtml(player.position));
  if (player.team) tags.push(escapeHtml(player.team));
  if (player.ir) tags.push("IR");
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
    return ordinal(place);
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
  const margin = Math.abs(t1Score - t2Score);
  const marginText = Number.isFinite(margin) ? ` by a slim ${margin.toFixed(1)}pt margin` : "";
  return {
    text: `${winner} beat ${loser}${marginText} in the championship final.`,
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
  return { QB: 1, RB: 2, WR: 3, TE: 4, K: 5, "D/ST": 6, DEF: 6 }[normalizeRosterPosition(position)] || 9;
}

function normalizeRosterPosition(position) {
  if (position === "DEF") return "D/ST";
  return position || "";
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
  return modeDefinition(["snf", "mnf", "tuesday", "wednesday", "tnf", "friday", "saturday"][day] || "midweek");
}

function previewModeDefinition() {
  if (PRESENTATION_PREVIEW === "wednesday") return modeDefinition("wednesday");
  if (PRESENTATION_PREVIEW === "tnf") return modeDefinition("tnf");
  if (PRESENTATION_PREVIEW === "friday") return modeDefinition("friday");
  if (PRESENTATION_PREVIEW === "saturday") return modeDefinition("saturday");
  if (PRESENTATION_PREVIEW === "snf") return modeDefinition("snf");
  return null;
}

function historicalPreviewNflEvents() {
  if (!isHistoricalCurrentPreview()) return null;
  if (PRESENTATION_PREVIEW === "tnf") return presentationTnfEvents();
  if (PRESENTATION_PREVIEW === "friday") return presentationFridayEvents();
  if (PRESENTATION_PREVIEW === "saturday") return presentationSaturdayEvents();
  if (PRESENTATION_PREVIEW === "snf") return presentationSnfEvents();
  if (SEASON_PREVIEW === "2025" && previewWeek() === 8) {
    return [
      {
        id: "2025-week8-tnf-min-lac",
        date: "2025-10-24T00:15:00Z",
        shortName: "MIN @ LAC",
        name: "Minnesota Vikings at Los Angeles Chargers",
        season: { year: 2025, type: 2 },
        status: { type: { state: "pre", description: "Scheduled", shortDetail: formatKickoff("2025-10-24T00:15:00Z") } },
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

function presentationTnfEvents() {
  return [
    presentationEvent("2025-week8-tnf-min-lac", "2025-10-24T00:15:00Z", "MIN @ LAC", "Minnesota Vikings at Los Angeles Chargers", "MIN", "LAC", "Prime Video"),
  ];
}

function presentationFridayEvents() {
  return [
    presentationEvent("2025-week8-fri-recap-min-lac", "2025-10-24T00:15:00Z", "MIN @ LAC", "Minnesota Vikings at Los Angeles Chargers", "MIN", "LAC", "Prime Video", "post"),
    ...presentationSnfEvents(),
  ];
}

function presentationSaturdayEvents() {
  return presentationSnfEvents();
}

function presentationSnfEvents() {
  return [
    presentationEvent("2025-week8-sun-early-atl-mia", "2025-10-26T17:00:00Z", "ATL @ MIA", "Atlanta Falcons at Miami Dolphins", "ATL", "MIA", "FOX"),
    presentationEvent("2025-week8-sun-early-nyj-cin", "2025-10-26T17:00:00Z", "NYJ @ CIN", "New York Jets at Cincinnati Bengals", "NYJ", "CIN", "CBS"),
    presentationEvent("2025-week8-sun-early-cle-ne", "2025-10-26T17:00:00Z", "CLE @ NE", "Cleveland Browns at New England Patriots", "CLE", "NE", "CBS"),
    presentationEvent("2025-week8-sun-early-chi-bal", "2025-10-26T17:00:00Z", "CHI @ BAL", "Chicago Bears at Baltimore Ravens", "CHI", "BAL", "CBS"),
    presentationEvent("2025-week8-sun-late-dal-den", "2025-10-26T20:25:00Z", "DAL @ DEN", "Dallas Cowboys at Denver Broncos", "DAL", "DEN", "FOX"),
    presentationEvent("2025-week8-sun-late-gb-pit", "2025-10-27T00:20:00Z", "GB @ PIT", "Green Bay Packers at Pittsburgh Steelers", "GB", "PIT", "NBC"),
  ];
}

function presentationEvent(id, date, shortName, name, away, home, broadcast, state = "pre") {
  const final = state === "post";
  return {
    id,
    date,
    shortName,
    name,
    season: { year: 2025, type: 2 },
    status: { type: { state, description: final ? "Final" : "Scheduled", shortDetail: final ? "Final" : formatKickoff(date) } },
    competitions: [
      {
        broadcast,
        competitors: [
          { homeAway: "away", team: { abbreviation: away, displayName: `${away} Football` } },
          { homeAway: "home", team: { abbreviation: home, displayName: `${home} Football` } },
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
      copy: "Draft is complete. Rosters, standings, and Week 1 matchups are live from Sleeper while the league waits for first kickoff.",
      isGameday: false,
    },
    midweek: {
      key: "midweek",
      label: "Midweek mode",
      title: "Midweek Board",
      copy: "Waivers, injuries, trade chatter, and matchup setup live here before the week locks in.",
      isGameday: false,
    },
    tuesday: {
      key: "midweek",
      label: "Tuesday",
      title: "Waiver Tuesday",
      copy: "Previous-week PPR leaders will appear here once Sleeper has matchup scoring.",
      isGameday: false,
      weekLabelPrefix: "Tuesday",
    },
    wednesday: {
      key: "midweek",
      label: "Wednesday",
      title: "Wednesday Football Board",
      copy: "Wednesday football means the week starts early. Check lineup locks, first-game exposure, and matchup pressure before kickoff.",
      isGameday: true,
      weekLabelPrefix: "Wednesday",
    },
    tnf: {
      key: "tnf",
      label: "Thursday",
      title: "TNF Preview",
      copy: "Thursday night is about lineup locks, inactives, and whether anyone wants to start the week hate-watching.",
      isGameday: true,
      weekLabelPrefix: "Thursday",
    },
    friday: {
      key: "midweekend",
      label: "Friday",
      title: "Friday Reset",
      copy: "Thursday is in the books. Use Friday to process the damage, sort injury pivots, and set up the weekend slate.",
      isGameday: false,
      weekLabelPrefix: "Friday",
    },
    saturday: {
      key: "midweekend",
      label: "Saturday",
      title: "Saturday Setup",
      copy: "Saturday is for final injury checks, stash decisions, and Sunday lineup pressure.",
      isGameday: false,
      weekLabelPrefix: "Saturday",
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
      weekLabelPrefix: "Sunday",
    },
    mnf: {
      key: "mnf",
      label: "Monday",
      title: "MNF Sweat",
      copy: "Monday night is for final margins, miracle paths, and the last players left to swing a matchup.",
      isGameday: true,
      weekLabelPrefix: "Monday",
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
    els.heroModeLabel.textContent = PAGE === "current" && !isPreseasonMode() ? weekdayName() : mode.label;
  }
}

function renderLeagueAvatar(league) {
  const avatarSrc = league?.avatar ? `https://sleepercdn.com/avatars/thumbs/${league.avatar}` : WAXBALL_AVATAR_SRC;
  setSiteAvatar(WAXBALL_AVATAR_SRC);
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
  const targetEvents = targetGameWindowEvents(events);
  if (targetEvents.length) {
    return targetEvents;
  }
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

function targetGameWindowEvents(events) {
  if (PAGE !== "current") return [];
  const todayKey = easternDateKey();
  const targetWeekdays = targetMatchdayWeekdays(events);
  if (!targetWeekdays.length) return [];
  const earliestKey = targetWeekdays.includes(3) && targetWeekdays.includes(4)
    ? easternDateKey(fantasyWeekWindowStart())
    : todayKey;
  return (events || [])
    .filter((event) => {
      const key = easternDateKey(event.date);
      const eventDay = easternParts(event.date).weekday;
      return key >= earliestKey && targetWeekdays.includes(eventDay);
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date));
}

function targetMatchdayWeekdays(events) {
  const todayKey = easternDateKey();
  const upcoming = (events || [])
    .filter((event) => event.status?.type?.state === "in" || easternDateKey(event.date) >= todayKey)
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  const referenceDay = isPreseasonMode() && upcoming[0] ? easternParts(upcoming[0].date).weekday : easternParts().weekday;
  const windows = {
    2: [3, 4],
    3: [3, 4],
    4: [3, 4],
    5: [6],
    6: [6],
    0: [0],
    1: [1],
  };
  return windows[referenceDay] || [];
}

function isTuesdayMode() {
  return PAGE === "current" && !isPreseasonMode() && easternParts().weekday === 2;
}

function weekdayName(value = currentDate()) {
  return new Intl.DateTimeFormat("en-US", { weekday: "long", timeZone: EASTERN_TIME_ZONE }).format(new Date(value));
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

function selectedTeamMatchup(roster, matchups, rosters, users, options = {}) {
  if (currentData?.league.status === "pre_draft") {
    return {
      title: "Pre-draft",
      detail: "Matchups will populate after the draft and Sleeper schedule generation.",
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
  const showScores = options.forceScores || shouldShowMatchupScores();
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
  if (PAGE === "current" && !isPreseasonMode()) return hasCompletedGameInCurrentWeekWindow();
  if (isMatchupPreviewMode()) return ["midweekend", "snf", "mnf"].includes(nflData?.mode?.key);
  return (nflData?.events || []).some((event) => event.status?.type?.state === "post");
}

function hasCompletedGameInCurrentWeekWindow() {
  const day = easternParts().weekday;
  if (day === 2 || day === 3) return false;
  return (nflData?.events || []).some((event) => {
    if (event.status?.type?.state !== "post") return false;
    const date = new Date(event.date);
    return date >= fantasyWeekWindowStart() && date <= currentDate();
  });
}

function fantasyWeekWindowStart() {
  const now = currentDate();
  const day = easternParts(now).weekday;
  const daysSinceTuesday = (day + 5) % 7;
  const start = new Date(now);
  start.setDate(start.getDate() - daysSinceTuesday);
  start.setHours(0, 0, 0, 0);
  return start;
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
  return nextMatchdayGames(nflData?.events || []).length > 0;
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

function matchupHistoryPanel(roster, opponentRoster, users, options = {}) {
  if (!roster || !opponentRoster) return "";
  const firstManager = ownerIdentityName(roster, users);
  const secondManager = ownerIdentityName(opponentRoster, users);
  const summary = managerMatchupHistory(firstManager, secondManager);
  const heatLabel = options.heatedRivalry ? `<span class="heated-rivalry-pill">Heated rivalry</span>` : "";
  if (!summary.games.length) {
    return `
      <div class="matchup-history-card ${options.heatedRivalry ? "heated" : ""}">
        <span class="metric-label">Manager history</span>
        <strong>First meeting</strong>
        <p>${escapeHtml(firstManager)} and ${escapeHtml(secondManager)} have no completed Waxball matchup on record.</p>
      </div>
    `;
  }
  const last = summary.games.at(-1);
  const waxStats = waxStatHighlightsForSeries(summary);
  const rivalryUrl = rivalryPageUrl(firstManager, secondManager);
  return `
    <div class="matchup-history-card ${options.heatedRivalry ? "heated" : ""}">
      <span class="metric-label">Manager history</span>${heatLabel}
      <strong>${escapeHtml(firstManager)} ${escapeHtml(formatH2HRecord(summary))} ${escapeHtml(secondManager)}</strong>
      <div class="matchup-history-facts">
        <div>
          <span>Last meeting</span>
          <b>${escapeHtml(h2hGameLabel(last))}</b>
          <em>${escapeHtml(h2hResultText(last))}</em>
        </div>
        <div>
          <span>Rivalry score</span>
          <a class="matchup-rivalry-link" href="${rivalryUrl}"><b>${rivalryScoreOutOf100(summary)}/100</b></a>
        </div>
        ${waxStats.length ? `
          <div class="matchup-wax-stats">
            <span>Wax Stats</span>
            ${waxStats.map((stat) => `<b>${escapeHtml(stat.label)}</b><em>${escapeHtml(stat.detail)}</em>`).join("")}
          </div>
        ` : ""}
      </div>
    </div>
  `;
}

function heatedRivalryKeys(groups, rosters, users) {
  const scored = groups
    .map((pair) => ({ key: matchupPairKey(pair), score: rivalryScoreForMatchupPair(pair, rosters, users) }))
    .filter((item) => item.key && item.score > 0);
  if (!scored.length) return new Set();
  const highest = Math.max(...scored.map((item) => item.score));
  return new Set(scored.filter((item) => item.score === highest).map((item) => item.key));
}

function isHeatedSelectedMatchup(matchup, matchups, rosters, users) {
  if (!matchup?.mine || !matchup?.opponent) return false;
  const grouped = groupBy(matchups, (item) => item.matchup_id || item.roster_id);
  const groups = Array.from(grouped.values());
  return heatedRivalryKeys(groups, rosters, users).has(matchupPairKey([matchup.mine, matchup.opponent]));
}

function matchupPairKey(pair) {
  if (!pair?.[0] || !pair?.[1]) return "";
  return pair
    .map((matchup) => Number(matchup.roster_id))
    .sort((a, b) => a - b)
    .join("-");
}

function rivalryScoreForMatchupPair(pair, rosters, users) {
  const [first, second] = pair || [];
  if (!first || !second) return 0;
  const firstRoster = rosters.find((item) => item.roster_id === first.roster_id);
  const secondRoster = rosters.find((item) => item.roster_id === second.roster_id);
  if (!firstRoster || !secondRoster) return 0;
  const summary = managerMatchupHistory(ownerIdentityName(firstRoster, users), ownerIdentityName(secondRoster, users));
  return summary.games.length ? rivalryScoreOutOf100(summary) : 0;
}

function matchupHistoryLine(first, second, rosters, users, options = {}) {
  if (!first || !second) return "";
  const firstRoster = rosters.find((item) => item.roster_id === first.roster_id);
  const secondRoster = rosters.find((item) => item.roster_id === second.roster_id);
  if (!firstRoster || !secondRoster) return "";
  const firstManager = ownerIdentityName(firstRoster, users);
  const secondManager = ownerIdentityName(secondRoster, users);
  const summary = managerMatchupHistory(firstManager, secondManager);
  if (!summary.games.length) {
    return `
      <div class="matchup-history-line ${options.heatedRivalry ? "heated" : ""}">
        <div class="matchup-history-record">
          <span>H2H</span>
          <strong>First meeting</strong>
        </div>
      </div>
    `;
  }
  const rivalryUrl = rivalryPageUrl(firstManager, secondManager);
  return `
    <div class="matchup-history-line ${options.heatedRivalry ? "heated" : ""}">
      <div class="matchup-history-record">
        <span>H2H</span>
        <strong>${escapeHtml(compactManagerName(firstManager))} ${escapeHtml(formatH2HRecord(summary))} ${escapeHtml(compactManagerName(secondManager))}</strong>
      </div>
      <div class="matchup-history-score">
        <a class="matchup-rivalry-link" href="${rivalryUrl}"><em>Rivalry score ${rivalryScoreOutOf100(summary)}/100</em></a>
      </div>
    </div>
  `;
}

function rivalryPageUrl(firstManager, secondManager) {
  const params = new URLSearchParams({
    managerA: firstManager,
    managerB: secondManager,
    highlight: "rivalry-score",
  });
  return `./h2h.html?${params.toString()}#compare`;
}

function managerMatchupHistory(firstManager, secondManager) {
  const games = allH2HGames()
    .filter((game) => game.managers?.includes(firstManager) && game.managers?.includes(secondManager))
    .sort((a, b) => (Number(a.season) - Number(b.season)) || (Number(a.week) - Number(b.week)) || String(a.id || "").localeCompare(String(b.id || "")));
  return games.reduce((summary, game) => {
    const firstIndex = game.managers.indexOf(firstManager);
    const secondIndex = game.managers.indexOf(secondManager);
    const firstScore = Number(game.scores?.[firstIndex] || 0);
    const secondScore = Number(game.scores?.[secondIndex] || 0);
    summary.firstPoints += firstScore;
    summary.secondPoints += secondScore;
    summary.margins.push(Math.abs(firstScore - secondScore));
    if (firstScore > secondScore) summary.firstWins += 1;
    else if (secondScore > firstScore) summary.secondWins += 1;
    else summary.ties += 1;
    return summary;
  }, { games, firstWins: 0, secondWins: 0, ties: 0, firstPoints: 0, secondPoints: 0, margins: [] });
}

function allH2HGames() {
  const staticGames = window.WAXBALL_H2H_DATA?.matchups || [];
  return [...staticGames, ...currentSeasonCompletedH2HGames()];
}

function currentSeasonCompletedH2HGames() {
  if (PAGE !== "current" || !currentData?.matchupsByWeek) return [];
  const completedThrough = completedThroughCurrentSeasonWeek();
  return Object.entries(currentData.matchupsByWeek).flatMap(([week, matchups]) => {
    if (Number(week) > completedThrough) return [];
    const grouped = groupBy(matchups, (matchup) => matchup.matchup_id || matchup.roster_id);
    return Array.from(grouped.values()).flatMap((pair, index) => {
      const [first, second] = pair;
      if (!first || !second) return [];
      const firstScore = scoreFor(first);
      const secondScore = scoreFor(second);
      if (!firstScore && !secondScore) return [];
      const firstRoster = currentData.rosters.find((roster) => roster.roster_id === first.roster_id);
      const secondRoster = currentData.rosters.find((roster) => roster.roster_id === second.roster_id);
      if (!firstRoster || !secondRoster) return [];
      return [{
        id: `2026-w${week}-m${index + 1}`,
        season: 2026,
        week: Number(week),
        stage: "Regular season",
        managers: [ownerIdentityName(firstRoster, currentData.users), ownerIdentityName(secondRoster, currentData.users)],
        teams: [teamName(firstRoster, currentData.users), teamName(secondRoster, currentData.users)],
        scores: [firstScore, secondScore],
      }];
    });
  });
}

function completedThroughCurrentSeasonWeek() {
  if (!currentData?.league) return Math.max(0, Number(currentWeek || 1) - 1);
  return completedThroughWeek(currentData.league, currentData.state);
}

function formatH2HRecord(summary) {
  return summary.ties ? `${summary.firstWins}-${summary.secondWins}-${summary.ties}` : `${summary.firstWins}-${summary.secondWins}`;
}

function rivalryScoreOutOf100(summary) {
  if (!summary?.games?.length) return 0;
  const gamesPlayed = summary.games.length;
  const recordGap = Math.abs(summary.firstWins - summary.secondWins) / gamesPlayed;
  const recordBalance = 1 - recordGap;
  const averageMargin = summary.margins.reduce((sum, margin) => sum + margin, 0) / gamesPlayed;
  const closeness = 86 / (averageMargin + 4);
  const meetings = gamesPlayed * 5.5;
  const stakes = summary.games.reduce((sum, game) => sum + gameRivalryWeight(game), 0);
  const scoringJuice = summary.games.reduce((sum, game) => sum + Number(game.scores[0] || 0) + Number(game.scores[1] || 0), 0) / gamesPlayed / 20;
  const tiesBonus = summary.ties * 3;
  return Math.max(1, Math.min(100, Math.round(closeness + meetings + stakes + (recordBalance * 20) + scoringJuice + tiesBonus)));
}

function waxStatHighlightsForSeries(summary) {
  const seriesIds = new Set(summary.games.map((game) => game.id));
  const allGames = allH2HGames();
  const sideRows = allGames.flatMap((game) => [0, 1].map((index) => {
    const other = index === 0 ? 1 : 0;
    const points = Number(game.scores?.[index] || 0);
    const opponentPoints = Number(game.scores?.[other] || 0);
    return {
      game,
      manager: game.managers?.[index] || "",
      opponent: game.managers?.[other] || "",
      points,
      opponentPoints,
      margin: points - opponentPoints,
      result: points === opponentPoints ? "T" : points > opponentPoints ? "W" : "L",
    };
  }));
  const stats = [
    ...waxSideStat("Highest one-week score", sideRows, (row) => row.points, "max", (row) => `${row.manager} dropped ${row.points.toFixed(2)} in ${h2hGameLabel(row.game)}.`),
    ...waxSideStat("Lowest one-week score", sideRows, (row) => row.points, "min", (row) => `${row.manager} put up ${row.points.toFixed(2)} in ${h2hGameLabel(row.game)}.`),
    ...waxSideStat("Lowest score in a win", sideRows.filter((row) => row.result === "W"), (row) => row.points, "min", (row) => `${row.manager} escaped ${row.points.toFixed(2)}-${row.opponentPoints.toFixed(2)} in ${h2hGameLabel(row.game)}.`),
    ...waxSideStat("Highest score in a loss", sideRows.filter((row) => row.result === "L"), (row) => row.points, "max", (row) => `${row.manager} lost with ${row.points.toFixed(2)} in ${h2hGameLabel(row.game)}.`),
    ...waxGameStat("Tightest game ever", allGames, (game) => Math.abs(Number(game.scores?.[0] || 0) - Number(game.scores?.[1] || 0)), "min", (game) => `${game.managers?.[0]} ${Number(game.scores?.[0] || 0).toFixed(2)} vs ${game.managers?.[1]} ${Number(game.scores?.[1] || 0).toFixed(2)}.`),
    ...waxGameStat("Biggest blowout", allGames, (game) => Math.abs(Number(game.scores?.[0] || 0) - Number(game.scores?.[1] || 0)), "max", (game) => `${h2hResultText(game)}.`),
    ...waxGameStat("Highest-scoring matchup", allGames, (game) => Number(game.scores?.[0] || 0) + Number(game.scores?.[1] || 0), "max", (game) => `${(Number(game.scores?.[0] || 0) + Number(game.scores?.[1] || 0)).toFixed(2)} combined points in ${h2hGameLabel(game)}.`),
    ...waxGameStat("Lowest-scoring matchup", allGames, (game) => Number(game.scores?.[0] || 0) + Number(game.scores?.[1] || 0), "min", (game) => `${(Number(game.scores?.[0] || 0) + Number(game.scores?.[1] || 0)).toFixed(2)} combined points in ${h2hGameLabel(game)}.`),
  ];
  const seen = new Set();
  return stats
    .filter((stat) => seriesIds.has(stat.game.id))
    .filter((stat) => {
      const key = `${stat.label}-${stat.game.id}-${stat.detail}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function waxSideStat(label, rows, valueFn, mode, detailFn) {
  return tiedRecords(rows, valueFn, mode).map((row) => ({
    label,
    detail: detailFn(row),
    game: row.game,
  }));
}

function waxGameStat(label, games, valueFn, mode, detailFn) {
  return tiedRecords(games, valueFn, mode).map((game) => ({
    label,
    detail: detailFn(game),
    game,
  }));
}

function tiedRecords(items, valueFn, mode) {
  if (!items.length) return [];
  const values = items.map(valueFn);
  const target = mode === "min" ? Math.min(...values) : Math.max(...values);
  return items.filter((item) => Math.abs(valueFn(item) - target) < 0.005);
}

function gameRivalryWeight(game) {
  const stage = game.stage || "";
  let weight = 0;
  if (stage === "Championship") weight += 34;
  else if (stage === "Toilet Bowl final") weight += 32;
  else if (stage === "3rd-place game") weight += 22;
  else if (stage === "5th-place game") weight += 16;
  else if (stage === "Playoffs") weight += 20;
  else if (stage === "Toilet Bowl") weight += 18;
  else if (stage === "Toilet Bowl placement") weight += 12;
  const outcomes = H2H_SEASON_OUTCOMES[Number(game.season)];
  if (!outcomes) return weight;
  const winner = h2hWinnerManager(game);
  const loser = h2hLoserManager(game);
  if (winner === outcomes.champion) weight += 4;
  if (outcomes.money.includes(winner)) weight += 2.5;
  if (loser === outcomes.toiletBowlLoser) weight += 3.5;
  return weight;
}

function h2hWinnerManager(game) {
  const [firstScore, secondScore] = (game.scores || []).map((score) => Number(score || 0));
  if (firstScore === secondScore) return "";
  return firstScore > secondScore ? game.managers?.[0] : game.managers?.[1];
}

function h2hLoserManager(game) {
  const [firstScore, secondScore] = (game.scores || []).map((score) => Number(score || 0));
  if (firstScore === secondScore) return "";
  return firstScore < secondScore ? game.managers?.[0] : game.managers?.[1];
}

function h2hGameLabel(game) {
  const stage = game.stage && game.stage !== "Regular season" ? ` ${game.stage}` : "";
  return `${game.season} Week ${game.week}${stage}`;
}

function h2hResultText(game) {
  const [firstManager, secondManager] = game.managers || [];
  const [firstScore, secondScore] = (game.scores || []).map((score) => Number(score || 0));
  if (firstScore === secondScore) return `${firstManager} tied ${secondManager} ${firstScore.toFixed(2)}-${secondScore.toFixed(2)}`;
  const winner = firstScore > secondScore ? firstManager : secondManager;
  const loser = firstScore > secondScore ? secondManager : firstManager;
  const winnerScore = Math.max(firstScore, secondScore).toFixed(2);
  const loserScore = Math.min(firstScore, secondScore).toFixed(2);
  return `${winner} beat ${loser} ${winnerScore}-${loserScore}`;
}

function compactManagerName(name) {
  const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "";
  if (parts[0] === "Miles" && parts[1]) return `Miles ${parts[1][0]}`;
  if (parts[0] === "Travis") return "Travis";
  if (parts[0] === "Nic") return "Nic";
  return parts[0];
}

function scrollToLeagueTable() {
  requestAnimationFrame(() => {
    document.querySelector("#standings")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

function scrollToSelectedTeamPanel() {
  requestAnimationFrame(() => {
    const target = PAGE === "archive" ? document.querySelector(".archive-team-lab") : document.querySelector("#team-panel-section");
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
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
  if (isDraftCompletePreview() && roster.previewPlayers?.length) {
    const starterIds = matchup?.starters?.length ? matchup.starters : roster.starters || [];
    const starterSet = new Set(starterIds);
    const starters = starterIds
      .map((id) => roster.previewPlayers.find((player) => player.id === id))
      .filter(Boolean);
    const bench = roster.previewPlayers.filter((player) => !starterSet.has(player.id));
    const teamsInNextGames = new Set(nextMatchdayGames(events).flatMap((event) => nflTeamsForEvent(event)));
    const watch = [...starters, ...bench]
      .filter((player) => teamsInNextGames.has(player.team))
      .slice(0, 8);
    return { starters, bench, watch };
  }
  const players = await loadPlayers();
  const starterIds = (matchup?.starters?.length ? matchup.starters : roster.starters || []).filter((id) => id && id !== "0");
  const starterSet = new Set(starterIds);
  const sourcePlayers = matchup?.players?.length ? matchup.players : roster.players || [];
  const benchIds = sourcePlayers.filter((id) => id && id !== "0" && !starterSet.has(id));
  const starters = starterIds.map((id) => playerSummary(id, players)).filter(Boolean);
  const bench = benchIds.map((id) => playerSummary(id, players)).filter(Boolean);
  const teamsInNextGames = new Set(nextMatchdayGames(events).flatMap((event) => nflTeamsForEvent(event)));
  const watch = [...starters, ...bench]
    .filter((player) => teamsInNextGames.has(player.team) || isSleeperPlayerInTargetWindow(player) || player.injuryStatus)
    .slice(0, 8);
  return { starters, bench, watch };
}

async function loadPlayers() {
  if (playersById && Date.now() - playersLoadedAt < 10 * 60 * 1000) return playersById;
  playersById = await fetchJson("/players/nfl");
  playersLoadedAt = Date.now();
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
    gameStart: sleeperPlayerGameStart(player),
  };
}

function sleeperPlayerGameStart(player) {
  return player.game_start_time
    || player.game_start
    || player.game_date
    || player.metadata?.game_start_time
    || player.metadata?.game_start
    || player.metadata?.game_date
    || "";
}

function playerList(players, fallback) {
  if (!players?.length) return `<p class="muted">${escapeHtml(fallback)}</p>`;
  return `
    <ul class="player-list">
      ${players.slice(0, 10).map((player) => `<li>${playerNameHtml(player)}<span>${escapeHtml([player.position, player.team, player.injuryStatus].filter(Boolean).join(" · ") || "NFL")}</span></li>`).join("")}
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
      ${playerNameHtml(player)}
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
          ${playerNameHtml(player)}
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
          ${playerNameHtml(player)}
          <span>${escapeHtml([player.position, player.team, player.game.label || player.note].filter(Boolean).join(" · "))}</span>
        </li>
      `).join("")}
    </ul>
  `;
}

function playerNameHtml(player) {
  return `<strong>${escapeHtml(player.name)}</strong>`;
}

function playerGameWindow(player) {
  const events = nflData?.events || [];
  const event = events.find((item) => nflTeamsForEvent(item).includes(player.team));
  if (!event && player.gameStart) {
    const state = localGameState(player.gameStart);
    return {
      label: state === "post" ? "Final" : state === "in" ? "Live" : formatKickoff(player.gameStart),
      isTarget: isSleeperPlayerInTargetWindow(player),
      complete: state === "post",
    };
  }
  if (!event) return { label: "No game found", isTarget: false, complete: false };
  const state = event.status?.type?.state;
  const isTarget = state === "in" || nextMatchdayGames(events).includes(event);
  return {
    label: state === "post" ? "Final" : state === "in" ? "Live" : formatKickoff(event.date),
    isTarget,
    complete: state === "post",
  };
}

function isSleeperPlayerInTargetWindow(player) {
  if (!player?.gameStart) return false;
  const targetWeekdays = targetMatchdayWeekdays(nflData?.events || []);
  if (!targetWeekdays.length) return false;
  return targetWeekdays.includes(easternParts(player.gameStart).weekday);
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

function matchupCard(pair, rosters, users, options = {}) {
  const [first, second] = pair;
  const firstScore = scoreFor(first);
  const secondScore = second ? scoreFor(second) : 0;
  return `
    <div class="matchup-card ${options.heatedRivalry ? "heated-rivalry-card" : ""}">
      <div class="matchup-row">
        ${matchupTeam(first, rosters, users, firstScore > secondScore, "", options)}
        <div class="versus">vs</div>
        ${second ? matchupTeam(second, rosters, users, secondScore > firstScore, "away", options) : `<div class="matchup-team away"><span class="avatar">--</span><div class="team-copy"><strong>Bye</strong></div></div>`}
      </div>
      ${matchupHistoryLine(first, second, rosters, users, options)}
    </div>
  `;
}

function matchupTeam(matchup, rosters, users, leads, side = "", options = {}) {
  const roster = rosters.find((item) => item.roster_id === matchup.roster_id);
  const scoreLabel = options.forceScores || shouldShowMatchupScores() ? scoreFor(matchup).toFixed(2) : currentPosition(roster, rosters);
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

function sortRosters(rosters, users = currentData?.users || []) {
  if (shouldSortLeagueTableByFirstName(rosters)) {
    return [...rosters].sort((a, b) => {
      const draftDiff = draftOrderRank(a, users) - draftOrderRank(b, users);
      if (draftDiff) return draftDiff;
      const aName = ownerIdentityName(a, users);
      const bName = ownerIdentityName(b, users);
      const firstDiff = trueFirstName(aName).localeCompare(trueFirstName(bName), undefined, { sensitivity: "base" });
      if (firstDiff) return firstDiff;
      return aName.localeCompare(bName, undefined, { sensitivity: "base" });
    });
  }
  return [...rosters].sort((a, b) => {
    const winDiff = stat(b, "wins") - stat(a, "wins");
    if (winDiff) return winDiff;
    const lossDiff = stat(a, "losses") - stat(b, "losses");
    if (lossDiff) return lossDiff;
    return totalPoints(b, "fpts") - totalPoints(a, "fpts");
  });
}

function draftOrderRank(roster, users) {
  const name = ownerIdentityName(roster, users).toLowerCase();
  const index = DRAFT_ORDER_2026.findIndex((manager) => manager.toLowerCase() === name);
  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
}

function shouldSortLeagueTableByFirstName(rosters) {
  return shouldShowDraftOrderMock(rosters);
}

function shouldShowDraftOrderMock(rosters) {
  return PAGE === "current"
    && currentData?.league?.status === "pre_draft"
    && rosters.every((roster) => !stat(roster, "wins") && !stat(roster, "losses") && !totalPoints(roster, "fpts"));
}

function trueFirstName(name) {
  return String(name || "").trim().split(/\s+/)[0] || "";
}

function teamCell(roster, users) {
  const tag = PAGE === "current" ? "button" : "div";
  const attrs = PAGE === "current"
    ? `type="button" data-roster-link="${escapeHtml(roster.roster_id)}" aria-label="Open ${escapeHtml(teamName(roster, users))} team page"`
    : "";
  return `
    <${tag} class="team-cell" ${attrs}>
      ${avatar(roster, users)}
      <div class="team-copy">
        <strong>${escapeHtml(teamName(roster, users))}</strong>
        <span class="username">${escapeHtml(ownerIdentityName(roster, users))}</span>
      </div>
    </${tag}>
  `;
}

function managerCell(roster, users, options = {}) {
  const isInteractive = options.interactive !== false && PAGE === "current";
  const tag = isInteractive ? "button" : "div";
  const attrs = isInteractive
    ? `type="button" data-roster-link="${escapeHtml(roster.roster_id)}" aria-label="Open ${escapeHtml(ownerIdentityName(roster, users))} team page"`
    : "";
  const subline = options.subline
    ? `<span class="username">${escapeHtml(options.subline)}</span>`
    : "";
  return `
    <${tag} class="team-cell" ${attrs}>
      ${avatar(roster, users)}
      <div class="team-copy">
        <strong>${escapeHtml(ownerIdentityName(roster, users))}</strong>
        ${subline}
      </div>
    </${tag}>
  `;
}

function avatar(roster, users, options = {}) {
  if (!roster) return `<span class="avatar">--</span>`;
  const user = userForRoster(roster, users);
  const avatarUrl = user?.metadata?.avatar;
  const avatarId = user?.avatar;
  const initials = initialsFor(options.initialsSource || teamName(roster, users));
  if (avatarUrl) return `<span class="avatar"><img alt="" src="${escapeHtml(avatarUrl)}" loading="lazy" /></span>`;
  if (!avatarId) return `<span class="avatar">${escapeHtml(initials)}</span>`;
  return `<span class="avatar"><img alt="" src="https://sleepercdn.com/avatars/thumbs/${avatarId}" loading="lazy" /></span>`;
}

function displayWeek(league, state = {}) {
  if (!league) return 1;
  if (league.status === "complete") return clampWeek(league.settings?.last_scored_leg || league.settings?.leg || 17);
  return clampWeek(state.display_week || state.week || league.settings?.leg || 1);
}

function completedThroughWeek(league, state = {}) {
  if (league?.status === "complete") return clampWeek(league.settings?.last_scored_leg || league.settings?.leg || 18);
  const previousWeek = Number(state?.previous_week || 0);
  const stateWeek = Number(state?.display_week || state?.week || 1);
  const leagueWeek = Number(league?.settings?.leg || stateWeek || 1);
  return Math.max(0, Math.min(18, Math.max(previousWeek, Math.min(stateWeek, leagueWeek) - 1)));
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
  const override = archive2025TeamNameOverride(user);
  if (override) return override;
  return user?.metadata?.team_name?.trim() || user?.display_name || user?.username || `Roster ${roster.roster_id}`;
}

function archive2025TeamNameOverride(user) {
  if (!user || (PAGE !== "archive" && !isHistoricalCurrentPreview())) return "";
  const username = user.username?.toLowerCase();
  const displayName = user.display_name?.toLowerCase();
  return ARCHIVE_2025_TEAM_NAME_OVERRIDES[username] || ARCHIVE_2025_TEAM_NAME_OVERRIDES[displayName] || "";
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
  return `${new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(currentDate())} ${localTimezoneLabel()}`;
}

function formatKickoff(value) {
  if (!value) return "TBD";
  return `${new Intl.DateTimeFormat(undefined, { weekday: "short", hour: "numeric", minute: "2-digit" }).format(new Date(value))} ${localTimezoneLabel()}`;
}

function formatCountdownTarget(value) {
  return `${new Intl.DateTimeFormat(undefined, { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(value))} ${localTimezoneLabel()}`;
}

function localTimezoneLabel(date = new Date()) {
  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  const mapped = {
    "America/New_York": "ET",
    "America/Detroit": "ET",
    "America/Indiana/Indianapolis": "ET",
    "America/Kentucky/Louisville": "ET",
    "America/Chicago": "CT",
    "America/Winnipeg": "CT",
    "America/Denver": "MT",
    "America/Phoenix": "MT",
    "America/Los_Angeles": "PT",
    "America/Vancouver": "PT",
  }[zone];
  if (mapped) return mapped;
  return offsetTimezoneLabel(date);
}

function offsetTimezoneLabel(date = new Date()) {
  const minutes = -date.getTimezoneOffset();
  const sign = minutes >= 0 ? "+" : "-";
  const absolute = Math.abs(minutes);
  const hours = String(Math.floor(absolute / 60)).padStart(2, "0");
  const mins = String(absolute % 60).padStart(2, "0");
  return `UTC${sign}${hours}:${mins}`;
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
  if (PRESENTATION_PREVIEW === "wednesday") return new Date("2026-09-09T12:00:00-04:00");
  if (PRESENTATION_PREVIEW === "tnf") return new Date("2025-10-23T12:00:00-04:00");
  if (PRESENTATION_PREVIEW === "friday") return new Date("2025-10-24T12:00:00-04:00");
  if (PRESENTATION_PREVIEW === "saturday") return new Date("2025-10-25T12:00:00-04:00");
  if (PRESENTATION_PREVIEW === "snf") return new Date("2025-10-26T12:00:00-04:00");
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

function normalizePlayerName(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}
