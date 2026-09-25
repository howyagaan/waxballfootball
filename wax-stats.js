(() => {
  const data = window.WAXBALL_H2H_DATA || {};
  const managers = Array.isArray(data.managers) ? data.managers : [];
  const EPSILON = 0.005;
  const API_BASE = "https://api.sleeper.app/v1";
  const CURRENT_LEAGUE_ID = "1312219624808419328";
  const REFRESH_MS = 60000;
  const CURRENT_SEASON_FALLBACK_MATCHUPS = [
    {
      id: "2026-w1-m1",
      season: 2026,
      week: 1,
      stage: "Regular season",
      managers: ["Miles Elliot", "Jakob Cooper"],
      teams: ["Daddy Campbell", "Papi Coop"],
      scores: [115, 154.06],
    },
    {
      id: "2026-w1-m2",
      season: 2026,
      week: 1,
      stage: "Regular season",
      managers: ["Nic Hamilton", "Miles Blue"],
      teams: ["Stat Fag", "blueballs"],
      scores: [156.02, 121.92],
    },
    {
      id: "2026-w1-m3",
      season: 2026,
      week: 1,
      stage: "Regular season",
      managers: ["Milo Manheim", "Jacob Moskovitz"],
      teams: ["Nacua Matata", "poonfullofsugar"],
      scores: [139.96, 94.04],
    },
    {
      id: "2026-w1-m4",
      season: 2026,
      week: 1,
      stage: "Regular season",
      managers: ["Erik Ohno Dagoberg", "Christian Engelhardt"],
      teams: ["Pamela Mari Ohno Dagoberg", "Steeler Virginity"],
      scores: [115.4, 121.96],
    },
    {
      id: "2026-w1-m5",
      season: 2026,
      week: 1,
      stage: "Regular season",
      managers: ["Travis Roy Rogers", "Sam Labovitz"],
      teams: ["darryluvr3000", "mistahbigdick"],
      scores: [149.9, 100.76],
    },
    {
      id: "2026-w1-m6",
      season: 2026,
      week: 1,
      stage: "Regular season",
      managers: ["Will Price", "Paul Legallet"],
      teams: ["poon messiah", "helloimpaul"],
      scores: [127.96, 120.56],
    },
    { id: "2026-w2-m1", season: 2026, week: 2, stage: "Regular season", managers: ["Erik Ohno Dagoberg", "Jacob Moskovitz"], teams: ["Pamela Mari Ohno Dagoberg", "poonfullofsugar"], scores: [143.26, 124.28] },
    { id: "2026-w2-m2", season: 2026, week: 2, stage: "Regular season", managers: ["Milo Manheim", "Miles Blue"], teams: ["Nacua Matata", "blueballs"], scores: [100.7, 145.36] },
    { id: "2026-w2-m3", season: 2026, week: 2, stage: "Regular season", managers: ["Travis Roy Rogers", "Christian Engelhardt"], teams: ["darryluvr3000", "Steeler Virginity"], scores: [87.36, 126.52] },
    { id: "2026-w2-m4", season: 2026, week: 2, stage: "Regular season", managers: ["Nic Hamilton", "Paul Legallet"], teams: ["Stat Fag", "helloimpaul"], scores: [117.5, 101.8] },
    { id: "2026-w2-m5", season: 2026, week: 2, stage: "Regular season", managers: ["Jakob Cooper", "Sam Labovitz"], teams: ["Papi Coop", "mistahbigdick"], scores: [89.34, 104.82] },
    { id: "2026-w2-m6", season: 2026, week: 2, stage: "Regular season", managers: ["Miles Elliot", "Will Price"], teams: ["Daddy Campbell", "poon messiah"], scores: [120.18, 110.78] },
  ];
  let games = mergeMatchups(Array.isArray(data.matchups) ? data.matchups : [], CURRENT_SEASON_FALLBACK_MATCHUPS);
  const SLEEPER_PLAYER_LEAGUES = [
    { season: 2025, leagueId: "1253094778665439232" },
    { season: 2026, leagueId: "1312219624808419328" },
  ];
  const SLEEPER_WEEKS = Array.from({ length: 18 }, (_, index) => index + 1);
  const OWNER_REAL_NAMES = {
    "10w5l": "Jacob Moskovitz",
    bigboybluey: "Miles Blue",
    bigdicksenior: "Sam Labovitz",
    chrissy511: "Christian Engelhardt",
    darryluvr: "Travis Roy Rogers",
    darryluvr3000: "Travis Roy Rogers",
    erikohno: "Erik Ohno Dagoberg",
    eviandon: "Milo Manheim",
    helloimpaul: "Paul Legallet",
    millsberry27: "Miles Elliot",
    papicoop: "Jakob Cooper",
    pigmanbigman: "Nic Hamilton",
    waxobwaxkovitz: "Jacob Moskovitz",
    willyboyp: "Will Price",
  };
  const ARCHIVE_PLAYER_PPR_ROWS = [
    {
      manager: "Sam Labovitz",
      team: "DaBigbootylatinas",
      season: 2024,
      week: 10,
      date: "2024-11-07",
      points: 55.4,
      playerName: "Ja'Marr Chase",
      playerTeam: "CIN",
      position: "WR",
      game: { season: 2024, week: 10, stage: "Regular season" },
    },
  ];
  const LOYALTY_ARCHIVE_PROFILE_ROWS = [
    { manager: "Jacob Moskovitz", team: "JacobNoWaxkovitz", season: 2024, kept: 9, drafted: 16 },
    { manager: "Jakob Cooper", team: "PapiCoop", season: 2024, kept: 9, drafted: 16 },
    { manager: "Sam Labovitz", team: "DaBigbootylatinas", season: 2024, kept: 9, drafted: 16 },
    { manager: "Travis Roy Rogers", team: "gaygun", season: 2024, kept: 8, drafted: 16 },
    { manager: "Miles Blue", team: "blueball", season: 2024, kept: 7, drafted: 16 },
    { manager: "Christian Engelhardt", team: "Steeler Virginity", season: 2024, kept: 6, drafted: 16 },
    { manager: "Erik Ohno Dagoberg", team: "Erik's Excellent Entourage", season: 2024, kept: 6, drafted: 16 },
    { manager: "Miles Elliot", team: "Daddy Campbell", season: 2024, kept: 6, drafted: 16 },
    { manager: "Will Price", team: "Leaping Jesters", season: 2024, kept: 3, drafted: 16 },
    { manager: "Nic Hamilton", team: "Balls? Say Less.", season: 2024, kept: 2, drafted: 16 },
    { manager: "Milo Manheim", team: "EvianDon", season: 2025, kept: 12, drafted: 16 },
    { manager: "Will Price", team: "Leaping Jesters", season: 2025, kept: 11, drafted: 16 },
    { manager: "Miles Blue", team: "BlueBalls", season: 2025, kept: 9, drafted: 16 },
    { manager: "Paul Legallet", team: "helloimpaul", season: 2025, kept: 9, drafted: 16 },
    { manager: "Sam Labovitz", team: "mistahbigdick", season: 2025, kept: 9, drafted: 16 },
    { manager: "Christian Engelhardt", team: "Steeler Virginity", season: 2025, kept: 8, drafted: 16 },
    { manager: "Jakob Cooper", team: "Papi Coop", season: 2025, kept: 8, drafted: 16 },
    { manager: "Jacob Moskovitz", team: "fantasyboy12345", season: 2025, kept: 7, drafted: 16 },
    { manager: "Nic Hamilton", team: "Dickless Cameltoe", season: 2025, kept: 7, drafted: 16 },
    { manager: "Erik Ohno Dagoberg", team: "Ricky McFricky", season: 2025, kept: 5, drafted: 16 },
    { manager: "Travis Roy Rogers", team: "yumyucker", season: 2025, kept: 5, drafted: 16 },
    { manager: "Miles Elliot", team: "Daddy Campbell", season: 2025, kept: 4, drafted: 16 },
  ];
  const FINAL_FINISH = {
    2024: {
      "Christian Engelhardt": "1st",
      "Erik Ohno Dagoberg": "2nd",
      "Travis Roy Rogers": "3rd",
      "Sam Labovitz": "4th",
      "Nic Hamilton": "5th",
      "Miles Blue": "6th",
      "Will Price": "7th",
      "Miles Elliot": "8th",
      "Jakob Cooper": "9th",
      "Jacob Moskovitz": "💩 King",
    },
    2025: {
      "Milo Manheim": "1st",
      "Miles Blue": "2nd",
      "Jacob Moskovitz": "3rd",
      "Paul Legallet": "4th",
      "Nic Hamilton": "5th",
      "Erik Ohno Dagoberg": "6th",
      "Will Price": "7th",
      "Sam Labovitz": "8th",
      "Christian Engelhardt": "9th",
      "Miles Elliot": "10th",
      "Travis Roy Rogers": "11th",
      "Jakob Cooper": "💩 King",
    },
  };

  const allEl = document.querySelector("#wax-stats-all");
  const recentEl = document.querySelector("#wax-stats-recent");
  const filterEl = document.querySelector("#wax-stats-manager-filter");
  let playerPprRows = null;
  let statLeaderboards = new Map();

  const score = (value) => Number(value || 0);
  const fmt = (value) => score(value).toFixed(2);
  const ordinal = (n) => {
    const suffix = n % 10 === 1 && n % 100 !== 11 ? "st" : n % 10 === 2 && n % 100 !== 12 ? "nd" : n % 10 === 3 && n % 100 !== 13 ? "rd" : "th";
    return `${n}${suffix}`;
  };
  const stageLabel = (game) => game.stage && game.stage !== "Regular season" ? ` • ${game.stage}` : "";
  const gameLabel = (game) => `${game.season} Week ${game.week}${stageLabel(game)}`;
  const weekLabelHtml = (game) => {
    if (!game) return "No games";
    const label = `${game.season} Week ${game.week}`;
    if (game.season === 2025 && Number.isInteger(game.week) && game.week >= 1 && game.week <= 17) {
      return `<a href="./articles/2025/week-${game.week}.html">${escapeHtml(label)}</a>`;
    }
    return escapeHtml(label);
  };
  const gameLabelHtml = (game) => {
    const label = escapeHtml(gameLabel(game));
    if (game.season === 2025 && Number.isInteger(game.week) && game.week >= 1 && game.week <= 17) {
      return `<a href="./articles/2025/week-${game.week}.html">${label}</a>`;
    }
    return label;
  };
  const escapeHtml = (value) =>
    String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  const managerList = (items, keys = ["manager"]) => [...new Set(
    items.flatMap((item) => keys.map((key) => item?.[key]).filter(Boolean)),
  )];
  const gameManagers = (items) => [...new Set(
    items.flatMap((item) => item.game?.managers || item.managers || []),
  )].filter(Boolean);
  const canonicalManagerName = (user = {}) => {
    const handle = String(user.display_name || user.username || "").toLowerCase();
    return OWNER_REAL_NAMES[handle] || user.metadata?.real_name || user.display_name || user.username || "Unknown manager";
  };
  const teamName = (user = {}) => user.metadata?.team_name || user.display_name || user.username || "Unknown team";

  async function fetchJson(path) {
    const response = await fetch(`${API_BASE}${path}`, { cache: "no-store" });
    if (!response.ok) throw new Error(`Sleeper request failed: ${path}`);
    return response.json();
  }

  async function fetchOptionalJson(path, fallback) {
    try {
      return await fetchJson(path);
    } catch (error) {
      return fallback;
    }
  }

  async function fetchSleeperPlayerPprRows() {
    const players = await fetchJson("/players/nfl");
    const seasonRows = await Promise.all(SLEEPER_PLAYER_LEAGUES.map(async ({ season, leagueId }) => {
      const [users, rosters, weeklyMatchups] = await Promise.all([
        fetchOptionalJson(`/league/${leagueId}/users`, []),
        fetchOptionalJson(`/league/${leagueId}/rosters`, []),
        Promise.all(SLEEPER_WEEKS.map(async (week) => ({
          week,
          matchups: await fetchOptionalJson(`/league/${leagueId}/matchups/${week}`, []),
        }))),
      ]);
      const usersById = new Map(users.map((user) => [user.user_id, user]));
      const rostersById = new Map(rosters.map((roster) => [Number(roster.roster_id), roster]));
      return weeklyMatchups.flatMap(({ week, matchups }) => matchups.flatMap((matchup) => {
        const roster = rostersById.get(Number(matchup.roster_id));
        const user = usersById.get(roster?.owner_id);
        const manager = canonicalManagerName(user);
        const team = teamName(user);
        return Object.entries(matchup.players_points || {}).map(([playerId, points]) => {
          const player = players[playerId] || {};
          const position = player.position || "";
          if (position === "DEF") return null;
          const playerPoints = Number(points);
          if (!Number.isFinite(playerPoints)) return null;
          return {
            manager,
            team,
            season,
            week,
            points: playerPoints,
            playerName: player.full_name || player.search_full_name || playerId,
            playerTeam: player.team || "FA",
            position,
            game: { season, week, stage: "Regular season" },
          };
        }).filter(Boolean);
      }));
    }));
    return seasonRows.flat();
  }

  async function refreshCompletedMatchups() {
    const currentMatchups = await loadCompletedSleeperMatchups();
    games = mergeMatchups(Array.isArray(data.matchups) ? data.matchups : [], CURRENT_SEASON_FALLBACK_MATCHUPS, currentMatchups);
    render();
  }

  async function loadCompletedSleeperMatchups() {
    try {
      const [league, state, rosters, users] = await Promise.all([
        fetchJson(`/league/${CURRENT_LEAGUE_ID}`),
        fetchJson("/state/nfl"),
        fetchJson(`/league/${CURRENT_LEAGUE_ID}/rosters`),
        fetchJson(`/league/${CURRENT_LEAGUE_ID}/users`),
      ]);
      const completedThrough = completedThroughWeek(league, state);
      const displayedWeek = Number(state?.display_week || state?.week || league?.settings?.leg || 1);
      const fetchThrough = Math.max(completedThrough, isTuesdayRefresh() ? displayedWeek : 0);
      if (fetchThrough < 1) return [];
      const weeks = Array.from({ length: Math.min(fetchThrough, 18) }, (_, index) => index + 1);
      const weekMatchups = await Promise.all(
        weeks.map(async (week) => [week, await fetchOptionalJson(`/league/${CURRENT_LEAGUE_ID}/matchups/${week}`, [])]),
      );
      return weekMatchups.flatMap(([week, matchups]) => sleeperWeekToGames(league, rosters, users, week, matchups));
    } catch (error) {
      return [];
    }
  }

  function isTuesdayRefresh() {
    const local = new Date(Date.now() - 3 * 60 * 60 * 1000);
    const weekday = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", weekday: "short" }).format(local);
    return weekday === "Tue";
  }

  function completedThroughWeek(league, state) {
    if (league?.status === "complete") return Number(league.settings?.last_scored_leg || league.settings?.leg || 18);
    const previousWeek = Number(state?.previous_week || 0);
    const stateWeek = Number(state?.display_week || state?.week || 1);
    const leagueWeek = Number(league?.settings?.leg || stateWeek || 1);
    return Math.max(0, Math.min(18, Math.max(previousWeek, Math.min(stateWeek, leagueWeek) - 1)));
  }

  function sleeperWeekToGames(league, rosters, users, week, matchups) {
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
          managers: [ownerName(leftRoster, users), ownerName(rightRoster, users)],
          teams: [ownerTeamName(leftRoster, users), ownerTeamName(rightRoster, users)],
          scores: [matchupScore(left), matchupScore(right)],
        };
      })
      .filter((game) => game.managers.every(Boolean) && game.scores.some((gameScore) => gameScore > 0));
  }

  function ownerName(roster, users) {
    const user = users.find((candidate) => candidate.user_id === roster?.owner_id);
    return canonicalManagerName(user);
  }

  function ownerTeamName(roster, users) {
    const user = users.find((candidate) => candidate.user_id === roster?.owner_id);
    return teamName(user);
  }

  function matchupScore(matchup) {
    return Number(matchup?.custom_points ?? matchup?.points ?? 0);
  }

  function mergeMatchups(...groups) {
    const merged = new Map();
    groups.flat().forEach((game) => {
      const key = gameKey(game);
      if (key) merged.set(key, game);
    });
    return [...merged.values()];
  }

  function gameKey(game) {
    const gameManagers = game?.managers || [];
    if (!game || gameManagers.length < 2) return "";
    return [
      Number(game.season || 0),
      Number(game.week || 0),
      ...gameManagers.map((manager) => String(manager || "").trim()).sort(),
    ].join("||");
  }

  function groupBy(items, keyFn) {
    return items.reduce((groups, item) => {
      const key = keyFn(item);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(item);
      return groups;
    }, new Map());
  }

  function winnerIndex(game) {
    const a = score(game.scores?.[0]);
    const b = score(game.scores?.[1]);
    if (Math.abs(a - b) < EPSILON) return -1;
    return a > b ? 0 : 1;
  }

  function sideRows() {
    return games.flatMap((game) => {
      const winner = winnerIndex(game);
      return [0, 1].map((index) => {
        const other = index === 0 ? 1 : 0;
        const points = score(game.scores?.[index]);
        const oppPoints = score(game.scores?.[other]);
        return {
          game,
          manager: game.managers?.[index],
          team: game.teams?.[index],
          opponent: game.managers?.[other],
          opponentTeam: game.teams?.[other],
          points,
          oppPoints,
          margin: points - oppPoints,
          result: winner === -1 ? "T" : winner === index ? "W" : "L",
        };
      });
    });
  }

  function tiedRows(rows, getValue, mode = "max") {
    if (!rows.length) return [];
    const target = rows.reduce((best, row) => {
      const value = getValue(row);
      return mode === "min" ? Math.min(best, value) : Math.max(best, value);
    }, getValue(rows[0]));
    return rows.filter((row) => Math.abs(getValue(row) - target) < EPSILON);
  }

  function chronologicalGames() {
    return [...games].sort((a, b) => (
      Number(a.season) - Number(b.season)
      || Number(a.week) - Number(b.week)
      || String(a.id || "").localeCompare(String(b.id || ""))
    ));
  }

  function groupByWeek(rows) {
    return rows.reduce((map, row) => {
      const key = `${row.game.season}-${row.game.week}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(row);
      return map;
    }, new Map());
  }

  function countWeeklyExtremes(rows, mode, includeAll = false) {
    const counts = new Map();
    groupByWeek(rows).forEach((weekRows) => {
      tiedRows(weekRows, (row) => row.points, mode).forEach((row) => {
        counts.set(row.manager, (counts.get(row.manager) || 0) + 1);
      });
    });
    const entries = managers.map((manager) => ({ manager, count: counts.get(manager) || 0 }));
    return includeAll ? entries : tiedRows(entries, (row) => row.count, "max");
  }

  function managerAverages(rows) {
    const totals = managers.map((manager) => {
      const managerRows = rows.filter((row) => row.manager === manager);
      const total = managerRows.reduce((sum, row) => sum + row.points, 0);
      return { manager, games: managerRows.length, average: managerRows.length ? total / managerRows.length : 0 };
    });
    return totals.filter((row) => row.games > 0);
  }

  function regularSeasonRows(rows) {
    return rows.filter((row) => row.game.stage === "Regular season");
  }

  function regularSeasonGameRows() {
    return games.filter((game) => game.stage === "Regular season");
  }

  function regularSeasonFinishMap(season) {
    const seasonRows = regularSeasonRows(sideRows()).filter((row) => row.game.season === season);
    const byManager = new Map();
    seasonRows.forEach((row) => {
      if (!byManager.has(row.manager)) byManager.set(row.manager, { manager: row.manager, wins: 0, losses: 0, pf: 0 });
      const record = byManager.get(row.manager);
      record.wins += row.result === "W" ? 1 : 0;
      record.losses += row.result === "L" ? 1 : 0;
      record.pf += row.points;
    });
    return [...byManager.values()]
      .sort((a, b) => b.wins - a.wins || b.pf - a.pf || a.manager.localeCompare(b.manager))
      .reduce((map, row, index) => {
        map.set(row.manager, ordinal(index + 1));
        return map;
      }, new Map());
  }

  function scheduleRows(mode, includeAll = false) {
    const regularGames = regularSeasonGameRows();
    const seasonFinishMaps = new Map([...new Set(regularGames.map((game) => game.season))].map((season) => [season, regularSeasonFinishMap(season)]));
    const rows = [];
    regularGames.forEach((game) => {
      [0, 1].forEach((index) => {
        const manager = game.managers?.[index];
        const opponentScore = score(game.scores?.[index === 0 ? 1 : 0]);
        let record = rows.find((row) => row.manager === manager && row.season === game.season);
        if (!record) {
          record = { manager, season: game.season, pointsAgainst: 0, regularFinish: "", finalFinish: "" };
          rows.push(record);
        }
        record.pointsAgainst += opponentScore;
        record.regularFinish = seasonFinishMaps.get(game.season)?.get(manager) || "--";
        record.finalFinish = FINAL_FINISH[game.season]?.[manager] || "--";
      });
    });
    return includeAll ? rows : tiedRows(rows, (row) => row.pointsAgainst, mode);
  }

  function seasonPfRows(mode, includeAll = false) {
    const rows = [];
    regularSeasonRows(sideRows()).forEach((row) => {
      let record = rows.find((item) => item.manager === row.manager && item.season === row.game.season);
      if (!record) {
        record = { manager: row.manager, team: row.team, season: row.game.season, pointsFor: 0, games: 0 };
        rows.push(record);
      }
      record.pointsFor += row.points;
      record.games += 1;
    });
    return includeAll ? rows : tiedRows(rows, (row) => row.pointsFor, mode);
  }

  function playoffPerformerRows(includeAll = false) {
    const rows = sideRows().filter((row) => row.game.stage !== "Regular season");
    const byManager = managers.map((manager) => {
      const managerRows = rows.filter((row) => row.manager === manager);
      const total = managerRows.reduce((sum, row) => sum + row.points, 0);
      const wins = managerRows.filter((row) => row.result === "W").length;
      return {
        manager,
        games: managerRows.length,
        total,
        average: managerRows.length ? total / managerRows.length : 0,
        wins,
      };
    }).filter((row) => row.games > 0);
    return includeAll ? byManager : tiedRows(byManager, (row) => row.average, "max");
  }

  function weeklyTopThreeRows(includeAll = false) {
    const counts = new Map();
    groupByWeek(sideRows()).forEach((weekRows) => {
      [...weekRows]
        .sort((a, b) => b.points - a.points)
        .slice(0, 3)
        .forEach((row) => counts.set(row.manager, (counts.get(row.manager) || 0) + 1));
    });
    const entries = managers.map((manager) => ({ manager, count: counts.get(manager) || 0 }));
    return includeAll ? entries : tiedRows(entries, (row) => row.count, "max");
  }

  function weeklyBottomThreeRows(includeAll = false) {
    const counts = new Map();
    groupByWeek(sideRows()).forEach((weekRows) => {
      [...weekRows]
        .sort((a, b) => a.points - b.points)
        .slice(0, 3)
        .forEach((row) => counts.set(row.manager, (counts.get(row.manager) || 0) + 1));
    });
    const entries = managers.map((manager) => ({ manager, count: counts.get(manager) || 0 }));
    return includeAll ? entries : tiedRows(entries, (row) => row.count, "max");
  }

  function streaks(rows, resultType, includeAll = false) {
    const byManager = managers.map((manager) => {
      const managerRows = rows
        .filter((row) => row.manager === manager)
        .sort((a, b) => a.game.season - b.game.season || a.game.week - b.game.week || a.game.id.localeCompare(b.game.id));
      let current = 0;
      let currentStart = null;
      let best = { manager, count: 0, start: null, end: null };
      managerRows.forEach((row) => {
        if (row.result === resultType) {
          current += 1;
          currentStart = currentStart || row.game;
          if (current > best.count) best = { manager, count: current, start: currentStart, end: row.game };
        } else {
          current = 0;
          currentStart = null;
        }
      });
      return best;
    });
    return includeAll ? byManager : tiedRows(byManager, (row) => row.count, "max");
  }

  function standingsCheckpointRows() {
    const counts = new Map(managers.map((manager) => [manager, { manager, top: 0, bottom: 0 }]));
    const regularRows = regularSeasonRows(sideRows());
    const seasons = [...new Set(regularRows.map((row) => Number(row.game.season)))];
    seasons.forEach((season) => {
      const seasonRows = regularRows.filter((row) => Number(row.game.season) === season);
      const weeks = [...new Set(seasonRows.map((row) => Number(row.game.week)))].sort((a, b) => a - b);
      weeks.forEach((week) => {
        const throughWeek = seasonRows.filter((row) => Number(row.game.week) <= week);
        const standings = [...new Set(seasonRows.map((row) => row.manager))].map((manager) => {
          const managerRows = throughWeek.filter((row) => row.manager === manager);
          return {
            manager,
            wins: managerRows.filter((row) => row.result === "W").length,
            pf: managerRows.reduce((sum, row) => sum + row.points, 0),
          };
        }).sort((a, b) => b.wins - a.wins || b.pf - a.pf || a.manager.localeCompare(b.manager));
        if (!standings.length) return;
        counts.get(standings[0].manager).top += 1;
        counts.get(standings.at(-1).manager).bottom += 1;
      });
    });
    return [...counts.values()];
  }

  function personalExtremeRows(rows, getValue, mode = "max") {
    return managers.flatMap((manager) => {
      const managerRows = rows.filter((row) => row.manager === manager);
      if (!managerRows.length) return [];
      return [tiedRows(managerRows, getValue, mode)[0]];
    });
  }

  function rankedLeaderboard(rows, getValue, mode, label, detail) {
    const ordered = [...rows].sort((a, b) => {
      const difference = mode === "min" ? getValue(a) - getValue(b) : getValue(b) - getValue(a);
      return Math.abs(difference) > EPSILON ? difference : label(a).localeCompare(label(b));
    });
    let previousValue = null;
    let previousRank = 0;
    return ordered.map((row, index) => {
      const value = getValue(row);
      const rank = previousValue !== null && Math.abs(value - previousValue) < EPSILON ? previousRank : index + 1;
      previousValue = value;
      previousRank = rank;
      return {
        rank,
        label: label(row),
        detail: detail(row),
        managers: row.managers || (row.manager ? [row.manager] : row.game?.managers || []),
      };
    });
  }

  function statCard({ title, value, details, tone = "", managers: statManagers = [] }) {
    const detailItems = Array.isArray(details) ? details : [details];
    return `
      <article class="wax-stat-card ${tone}" role="button" tabindex="0" data-wax-stat-key="${escapeHtml(title)}" data-wax-stat-managers="${escapeHtml(statManagers.join("||"))}" aria-label="Open ${escapeHtml(title)} leaderboard">
        <span>${escapeHtml(title)}</span>
        <strong>${escapeHtml(value)}</strong>
        <div class="wax-stat-details">
          ${detailItems.map((detail) => `<p>${detail}</p>`).join("")}
        </div>
      </article>
    `;
  }

  function recentAdjustmentCard(adjustment) {
    return `
      <article class="recent-stat-card ${adjustment.tone || ""}" role="button" tabindex="0" data-wax-stat-key="${escapeHtml(adjustment.title)}" data-wax-stat-managers="${escapeHtml((adjustment.managers || []).join("||"))}" aria-label="Open ${escapeHtml(adjustment.title)} leaderboard">
        <span>${escapeHtml(adjustment.title)}</span>
        <strong>${escapeHtml(adjustment.value)}</strong>
        <p>${adjustment.detail}</p>
      </article>
    `;
  }

  function sideDetail(row) {
    return `
      <b>${escapeHtml(row.manager)}</b>
      <span>${escapeHtml(row.team)} • ${gameLabelHtml(row.game)}</span>
      <em>${fmt(row.points)}-${fmt(row.oppPoints)} vs ${escapeHtml(row.opponent)}</em>
    `;
  }

  function gameDetail(game) {
    return `
      <b>${escapeHtml(game.managers?.[0])} vs ${escapeHtml(game.managers?.[1])}</b>
      <span>${gameLabelHtml(game)}</span>
      <em>${fmt(game.scores?.[0])}-${fmt(game.scores?.[1])}</em>
    `;
  }

  function scheduleDetail(row) {
    return `
      <b>${escapeHtml(row.manager)}</b>
      <span>${row.season} • Regular season ${escapeHtml(row.regularFinish)} • Final ${escapeHtml(row.finalFinish)}</span>
    `;
  }

  function seasonPfDetail(row) {
    return `
      <b>${escapeHtml(row.manager)}</b>
      <span>${escapeHtml(row.team)} • ${row.season} regular season</span>
      <em>${row.games} games</em>
    `;
  }

  function playoffDetail(row) {
    return `
      <b>${escapeHtml(row.manager)}</b>
      <span>${row.games} playoff/Toilet Bowl games • ${row.wins}-${row.games - row.wins}</span>
      <em>${fmt(row.average)} pts avg.</em>
    `;
  }

  function loyaltyDetail(row) {
    return `
      <b>${escapeHtml(row.manager)}</b>
      <span>${escapeHtml(row.team)} • ${row.season}</span>
      <em>${row.kept} of ${row.drafted} draft picks kept</em>
    `;
  }

  function streakDetail(row) {
    return `
      <b>${escapeHtml(row.manager)}</b>
      <span>${weekLabelHtml(row.start)} through ${weekLabelHtml(row.end)}</span>
    `;
  }

  function playerPprDetail(row) {
    return `
      <b>${escapeHtml(row.playerName)}</b>
      <span>${escapeHtml(row.position || "Player")} • ${escapeHtml(row.playerTeam)} • rostered by ${escapeHtml(row.manager)}</span>
      <em>${fmt(row.points)} pts • ${gameLabelHtml(row.game)}</em>
    `;
  }

  function recordAdjustmentRows(limit = 5, season = 2026, weekWindow = 4) {
    const records = [
      {
        title: "Highest one-week score",
        tone: "is-green",
        mode: "max",
        value: (row) => row.points,
        format: (row) => `${fmt(row.points)} pts`,
        detail: (row) => `${escapeHtml(row.manager)} set it in ${gameLabelHtml(row.game)} for ${escapeHtml(row.team)}.`,
      },
      {
        title: "Lowest one-week score",
        tone: "is-red",
        mode: "min",
        value: (row) => row.points,
        format: (row) => `${fmt(row.points)} pts`,
        detail: (row) => `${escapeHtml(row.manager)} reset the floor in ${gameLabelHtml(row.game)} for ${escapeHtml(row.team)}.`,
      },
      {
        title: "Lowest score in win",
        mode: "min",
        filter: (row) => row.result === "W",
        value: (row) => row.points,
        format: (row) => `${fmt(row.points)} pts`,
        detail: (row) => `${escapeHtml(row.manager)} escaped ${fmt(row.points)}-${fmt(row.oppPoints)} in ${gameLabelHtml(row.game)}.`,
      },
      {
        title: "Highest score in loss",
        mode: "max",
        filter: (row) => row.result === "L",
        value: (row) => row.points,
        format: (row) => `${fmt(row.points)} pts`,
        detail: (row) => `${escapeHtml(row.manager)} lost with ${fmt(row.points)} in ${gameLabelHtml(row.game)}.`,
      },
    ];
    const gameRecords = [
      {
        title: "Biggest blowout",
        mode: "max",
        value: (game) => Math.abs(score(game.scores?.[0]) - score(game.scores?.[1])),
        format: (game) => `${fmt(Math.abs(score(game.scores?.[0]) - score(game.scores?.[1])))} pts`,
        detail: (game) => `${escapeHtml(game.managers?.[0])} vs ${escapeHtml(game.managers?.[1])} in ${gameLabelHtml(game)}.`,
      },
      {
        title: "Tightest game",
        mode: "min",
        value: (game) => Math.abs(score(game.scores?.[0]) - score(game.scores?.[1])),
        format: (game) => `${fmt(Math.abs(score(game.scores?.[0]) - score(game.scores?.[1])))} pts`,
        detail: (game) => `${escapeHtml(game.managers?.[0])} vs ${escapeHtml(game.managers?.[1])} in ${gameLabelHtml(game)}.`,
      },
      {
        title: "Highest combined score",
        tone: "is-green",
        mode: "max",
        value: (game) => score(game.scores?.[0]) + score(game.scores?.[1]),
        format: (game) => `${fmt(score(game.scores?.[0]) + score(game.scores?.[1]))} pts`,
        detail: (game) => `${escapeHtml(game.managers?.[0])} and ${escapeHtml(game.managers?.[1])} combined in ${gameLabelHtml(game)}.`,
      },
      {
        title: "Lowest combined score",
        tone: "is-red",
        mode: "min",
        value: (game) => score(game.scores?.[0]) + score(game.scores?.[1]),
        format: (game) => `${fmt(score(game.scores?.[0]) + score(game.scores?.[1]))} pts`,
        detail: (game) => `${escapeHtml(game.managers?.[0])} and ${escapeHtml(game.managers?.[1])} combined in ${gameLabelHtml(game)}.`,
      },
    ];
    const adjustments = [];
    const sideRecords = records.map((record) => ({ ...record, best: null, seen: false }));
    const matchupRecords = gameRecords.map((record) => ({ ...record, best: null, seen: false }));

    chronologicalGames().forEach((game) => {
      const winner = winnerIndex(game);
      const gameRows = [0, 1].map((index) => {
        const other = index === 0 ? 1 : 0;
        const points = score(game.scores?.[index]);
        const oppPoints = score(game.scores?.[other]);
        return {
          game,
          manager: game.managers?.[index],
          team: game.teams?.[index],
          opponent: game.managers?.[other],
          points,
          oppPoints,
          result: winner === -1 ? "T" : winner === index ? "W" : "L",
        };
      });

      sideRecords.forEach((record) => {
        gameRows.filter((row) => !record.filter || record.filter(row)).forEach((row) => {
          const value = record.value(row);
          const brokeRecord = record.seen && (record.mode === "min" ? value < record.best - EPSILON : value > record.best + EPSILON);
          if (brokeRecord) adjustments.push({
            title: record.title,
            value: record.format(row),
            detail: record.detail(row),
            tone: record.tone,
            game,
            managers: [row.manager, row.opponent].filter(Boolean),
          });
          if (!record.seen || (record.mode === "min" ? value < record.best : value > record.best)) {
            record.best = value;
            record.seen = true;
          }
        });
      });

      matchupRecords.forEach((record) => {
        const value = record.value(game);
        const brokeRecord = record.seen && (record.mode === "min" ? value < record.best - EPSILON : value > record.best + EPSILON);
        if (brokeRecord) adjustments.push({
          title: record.title,
          value: record.format(game),
          detail: record.detail(game),
          tone: record.tone,
          game,
          managers: [...(game.managers || [])].filter(Boolean),
        });
        if (!record.seen || (record.mode === "min" ? value < record.best : value > record.best)) {
          record.best = value;
          record.seen = true;
        }
      });
    });

    const recentSeasonWeeks = chronologicalGames()
      .filter((game) => Number(game.season) === season)
      .map((game) => Number(game.week))
      .filter(Number.isFinite);
    const latestWeek = recentSeasonWeeks.length ? Math.max(...recentSeasonWeeks) : null;
    if (latestWeek === null) return [];
    const earliestWeek = latestWeek - weekWindow + 1;

    return adjustments
      .filter((adjustment) => Number(adjustment.game.season) === season && Number(adjustment.game.week) >= earliestWeek)
      .sort((a, b) => (
        Number(b.game.season) - Number(a.game.season)
        || Number(b.game.week) - Number(a.game.week)
        || String(b.game.id || "").localeCompare(String(a.game.id || ""))
      ))
      .slice(0, limit);
  }

  function playerPprAdjustmentRows(season = 2026, weekWindow = 4) {
    if (!Array.isArray(playerPprRows) || !playerPprRows.length) return [];
    const ordered = [...playerPprRows].sort((a, b) => (
      Number(a.season) - Number(b.season)
      || Number(a.week) - Number(b.week)
      || String(a.playerName || "").localeCompare(String(b.playerName || ""))
    ));
    let best = null;
    const adjustments = [];
    ordered.forEach((row) => {
      const brokeRecord = best !== null && row.points > best + EPSILON;
      if (brokeRecord) adjustments.push({
        title: "Highest rostered-player PPR week",
        value: `${fmt(row.points)} pts`,
        detail: `${escapeHtml(row.playerName)} hit ${fmt(row.points)} for ${escapeHtml(row.manager)} in ${gameLabelHtml(row.game)}.`,
        tone: "is-green",
        game: row.game,
        managers: [row.manager].filter(Boolean),
      });
      if (best === null || row.points > best) best = row.points;
    });

    const recentSeasonWeeks = ordered
      .filter((row) => Number(row.season) === season)
      .map((row) => Number(row.week))
      .filter(Number.isFinite);
    const latestWeek = recentSeasonWeeks.length ? Math.max(...recentSeasonWeeks) : null;
    if (latestWeek === null) return [];
    const earliestWeek = latestWeek - weekWindow + 1;
    return adjustments.filter((adjustment) => (
      Number(adjustment.game.season) === season
      && Number(adjustment.game.week) >= earliestWeek
    ));
  }

  function render(loyaltyRows = LOYALTY_ARCHIVE_PROFILE_ROWS) {
    const selectedManager = filterEl?.value || "";
    const rows = sideRows();
    const wins = rows.filter((row) => row.result === "W");
    const losses = rows.filter((row) => row.result === "L");
    const gameRecords = games.map((game) => ({
      game,
      total: score(game.scores?.[0]) + score(game.scores?.[1]),
      margin: Math.abs(score(game.scores?.[0]) - score(game.scores?.[1])),
    }));

    const highestScore = tiedRows(rows, (row) => row.points, "max");
    const lowestScore = tiedRows(rows, (row) => row.points, "min");
    const lowestWin = tiedRows(wins, (row) => row.points, "min");
    const highestLoss = tiedRows(losses, (row) => row.points, "max");
    const winStreak = streaks(rows, "W");
    const lossStreak = streaks(rows, "L");

    const biggestBlowout = tiedRows(gameRecords, (row) => row.margin, "max");
    const tightestGame = tiedRows(gameRecords, (row) => row.margin, "min");
    const highestCombined = tiedRows(gameRecords, (row) => row.total, "max");
    const lowestCombined = tiedRows(gameRecords, (row) => row.total, "min");
    const weeklyHighs = countWeeklyExtremes(rows, "max");
    const weeklyLows = countWeeklyExtremes(rows, "min");
    const averages = managerAverages(rows);
    const bestAverage = tiedRows(averages, (row) => row.average, "max");
    const worstAverage = tiedRows(averages, (row) => row.average, "min");
    const mostSeasonPf = seasonPfRows("max");
    const leastSeasonPf = seasonPfRows("min");
    const mostBrutalSchedule = scheduleRows("max");
    const easiestSchedule = scheduleRows("min");
    const bestPlayoffPerformer = playoffPerformerRows();
    const topThreeFinishes = weeklyTopThreeRows();
    const bottomThreeFinishes = weeklyBottomThreeRows();
    const standingsCheckpoints = standingsCheckpointRows();
    const weeksTopTable = tiedRows(standingsCheckpoints, (row) => row.top, "max");
    const weeksBottomTable = tiedRows(standingsCheckpoints, (row) => row.bottom, "max");
    const mostLoyal = tiedRows(loyaltyRows, (row) => row.kept, "max");
    const leastLoyal = tiedRows(loyaltyRows, (row) => row.kept, "min");
    const recentAdjustments = [...recordAdjustmentRows(), ...playerPprAdjustmentRows()]
      .sort((a, b) => (
        Number(b.game.season) - Number(a.game.season)
        || Number(b.game.week) - Number(a.game.week)
        || String(b.title || "").localeCompare(String(a.title || ""))
      ))
      .slice(0, 5);
    const playerRows = Array.isArray(playerPprRows) ? [...ARCHIVE_PLAYER_PPR_ROWS, ...playerPprRows] : ARCHIVE_PLAYER_PPR_ROWS;
    const highestPlayerPpr = Array.isArray(playerRows) ? tiedRows(playerRows, (row) => row.points, "max") : [];
    const statItems = [
      {
        title: "Highest one-week score",
        value: `${fmt(highestScore[0]?.points)} pts`,
        details: highestScore.map(sideDetail),
        tone: "is-green",
        managers: managerList(highestScore, ["manager", "opponent"]),
      },
      {
        title: "Lowest one-week score",
        value: `${fmt(lowestScore[0]?.points)} pts`,
        details: lowestScore.map(sideDetail),
        tone: "is-red",
        managers: managerList(lowestScore, ["manager", "opponent"]),
      },
      {
        title: "Lowest score in win",
        value: `${fmt(lowestWin[0]?.points)} pts`,
        details: lowestWin.map(sideDetail),
        managers: managerList(lowestWin, ["manager", "opponent"]),
      },
      {
        title: "Highest score in loss",
        value: `${fmt(highestLoss[0]?.points)} pts`,
        details: highestLoss.map(sideDetail),
        managers: managerList(highestLoss, ["manager", "opponent"]),
      },
      {
        title: "Highest rostered-player PPR week",
        value: highestPlayerPpr.length ? `${fmt(highestPlayerPpr[0]?.points)} pts` : "Unavailable",
        details: highestPlayerPpr.length
          ? highestPlayerPpr.map(playerPprDetail)
          : ["No player-week scoring is available yet."],
        tone: "is-green",
        managers: managerList(highestPlayerPpr),
      },
      {
        title: "Longest win streak",
        value: `${winStreak[0]?.count || 0} wins`,
        details: winStreak.map(streakDetail),
        tone: "is-green",
        managers: managerList(winStreak),
      },
      {
        title: "Longest losing streak",
        value: `${lossStreak[0]?.count || 0} losses`,
        details: lossStreak.map(streakDetail),
        tone: "is-red",
        managers: managerList(lossStreak),
      },
      {
        title: "Biggest blowout",
        value: `${fmt(biggestBlowout[0]?.margin)} pts`,
        details: biggestBlowout.map((row) => gameDetail(row.game)),
        managers: gameManagers(biggestBlowout),
      },
      {
        title: "Tightest game",
        value: `${fmt(tightestGame[0]?.margin)} pts`,
        details: tightestGame.map((row) => gameDetail(row.game)),
        managers: gameManagers(tightestGame),
      },
      {
        title: "Highest combined score",
        value: `${fmt(highestCombined[0]?.total)} pts`,
        details: highestCombined.map((row) => gameDetail(row.game)),
        managers: gameManagers(highestCombined),
      },
      {
        title: "Lowest combined score",
        value: `${fmt(lowestCombined[0]?.total)} pts`,
        details: lowestCombined.map((row) => gameDetail(row.game)),
        managers: gameManagers(lowestCombined),
      },
      {
        title: "Most weekly high scores",
        value: `${weeklyHighs[0]?.count || 0}`,
        details: weeklyHighs.map((row) => `<b>${escapeHtml(row.manager)}</b><span>${row.count} weekly high ${row.count === 1 ? "score" : "scores"}</span>`),
        tone: "is-green",
        managers: managerList(weeklyHighs),
      },
      {
        title: "Most weekly low scores",
        value: `${weeklyLows[0]?.count || 0}`,
        details: weeklyLows.map((row) => `<b>${escapeHtml(row.manager)}</b><span>${row.count} weekly low ${row.count === 1 ? "score" : "scores"}</span>`),
        tone: "is-red",
        managers: managerList(weeklyLows),
      },
      {
        title: "Best average score",
        value: `${fmt(bestAverage[0]?.average)} pts`,
        details: bestAverage.map((row) => `<b>${escapeHtml(row.manager)}</b><span>${row.games} recorded games</span>`),
        tone: "is-green",
        managers: managerList(bestAverage),
      },
      {
        title: "Worst average score",
        value: `${fmt(worstAverage[0]?.average)} pts`,
        details: worstAverage.map((row) => `<b>${escapeHtml(row.manager)}</b><span>${row.games} recorded games</span>`),
        tone: "is-red",
        managers: managerList(worstAverage),
      },
      {
        title: "Most PF in a regular season",
        value: `${fmt(mostSeasonPf[0]?.pointsFor)} PF`,
        details: mostSeasonPf.map(seasonPfDetail),
        tone: "is-green",
        managers: managerList(mostSeasonPf),
      },
      {
        title: "Least PF in a regular season",
        value: `${fmt(leastSeasonPf[0]?.pointsFor)} PF`,
        details: leastSeasonPf.map(seasonPfDetail),
        tone: "is-red",
        managers: managerList(leastSeasonPf),
      },
      {
        title: "Most brutal schedule",
        value: `${fmt(mostBrutalSchedule[0]?.pointsAgainst)} PA`,
        details: mostBrutalSchedule.map(scheduleDetail),
        tone: "is-red",
        managers: managerList(mostBrutalSchedule),
      },
      {
        title: "Easiest schedule",
        value: `${fmt(easiestSchedule[0]?.pointsAgainst)} PA`,
        details: easiestSchedule.map(scheduleDetail),
        tone: "is-green",
        managers: managerList(easiestSchedule),
      },
      {
        title: "Best playoff performer",
        value: `${fmt(bestPlayoffPerformer[0]?.average)} pts avg.`,
        details: bestPlayoffPerformer.map(playoffDetail),
        tone: "is-green",
        managers: managerList(bestPlayoffPerformer),
      },
      {
        title: "Most loyal manager",
        value: `${mostLoyal[0]?.kept || 0} kept`,
        details: mostLoyal.map(loyaltyDetail),
        tone: "is-green",
        managers: managerList(mostLoyal),
      },
      {
        title: "Least loyal manager",
        value: `${leastLoyal[0]?.kept || 0} kept`,
        details: leastLoyal.map(loyaltyDetail),
        tone: "is-red",
        managers: managerList(leastLoyal),
      },
      {
        title: "Most weekly top-three finishes",
        value: `${topThreeFinishes[0]?.count || 0}`,
        details: topThreeFinishes.map((row) => `<b>${escapeHtml(row.manager)}</b><span>${row.count} weekly top-three ${row.count === 1 ? "finish" : "finishes"}</span>`),
        managers: managerList(topThreeFinishes),
      },
      {
        title: "Most weekly bottom-three finishes",
        value: `${bottomThreeFinishes[0]?.count || 0}`,
        details: bottomThreeFinishes.map((row) => `<b>${escapeHtml(row.manager)}</b><span>${row.count} weekly bottom-three ${row.count === 1 ? "finish" : "finishes"}</span>`),
        tone: "is-red",
        managers: managerList(bottomThreeFinishes),
      },
      {
        title: "Weeks top of table",
        value: `${weeksTopTable[0]?.top || 0}`,
        details: weeksTopTable.map((row) => `<b>${escapeHtml(row.manager)}</b><span>${row.top} ${row.top === 1 ? "week" : "weeks"} in 1st</span>`),
        tone: "is-green",
        managers: managerList(weeksTopTable),
      },
      {
        title: "Weeks bottom of table",
        value: `${weeksBottomTable[0]?.bottom || 0}`,
        details: weeksBottomTable.map((row) => `<b>${escapeHtml(row.manager)}</b><span>${row.bottom} ${row.bottom === 1 ? "week" : "weeks"} in last</span>`),
        tone: "is-red",
        managers: managerList(weeksBottomTable),
      },
    ];

    const allWinStreaks = streaks(rows, "W", true);
    const allLossStreaks = streaks(rows, "L", true);
    const matchupLabel = (row) => `${row.game.managers?.[0]} vs ${row.game.managers?.[1]}`;
    const matchupDetail = (row, value) => `${value} pts • ${gameLabel(row.game)}`;
    statLeaderboards = new Map([
      ["Highest one-week score", rankedLeaderboard(personalExtremeRows(rows, (row) => row.points, "max"), (row) => row.points, "max", (row) => row.manager, (row) => `${fmt(row.points)} pts • ${gameLabel(row.game)}`)],
      ["Lowest one-week score", rankedLeaderboard(personalExtremeRows(rows, (row) => row.points, "min"), (row) => row.points, "min", (row) => row.manager, (row) => `${fmt(row.points)} pts • ${gameLabel(row.game)}`)],
      ["Lowest score in win", rankedLeaderboard(personalExtremeRows(wins, (row) => row.points, "min"), (row) => row.points, "min", (row) => row.manager, (row) => `${fmt(row.points)} pts • ${gameLabel(row.game)}`)],
      ["Highest score in loss", rankedLeaderboard(personalExtremeRows(losses, (row) => row.points, "max"), (row) => row.points, "max", (row) => row.manager, (row) => `${fmt(row.points)} pts • ${gameLabel(row.game)}`)],
      ["Highest rostered-player PPR week", rankedLeaderboard(playerRows, (row) => row.points, "max", (row) => row.playerName, (row) => `${fmt(row.points)} pts • ${row.manager} • ${gameLabel(row.game)}`)],
      ["Longest win streak", rankedLeaderboard(allWinStreaks, (row) => row.count, "max", (row) => row.manager, (row) => row.start ? `${row.count} wins • ${gameLabel(row.start)} to ${gameLabel(row.end)}` : "No wins")],
      ["Longest losing streak", rankedLeaderboard(allLossStreaks, (row) => row.count, "max", (row) => row.manager, (row) => row.start ? `${row.count} losses • ${gameLabel(row.start)} to ${gameLabel(row.end)}` : "No losses")],
      ["Biggest blowout", rankedLeaderboard(gameRecords, (row) => row.margin, "max", matchupLabel, (row) => matchupDetail(row, fmt(row.margin)))],
      ["Tightest game", rankedLeaderboard(gameRecords, (row) => row.margin, "min", matchupLabel, (row) => matchupDetail(row, fmt(row.margin)))],
      ["Highest combined score", rankedLeaderboard(gameRecords, (row) => row.total, "max", matchupLabel, (row) => matchupDetail(row, fmt(row.total)))],
      ["Lowest combined score", rankedLeaderboard(gameRecords, (row) => row.total, "min", matchupLabel, (row) => matchupDetail(row, fmt(row.total)))],
      ["Most weekly high scores", rankedLeaderboard(countWeeklyExtremes(rows, "max", true), (row) => row.count, "max", (row) => row.manager, (row) => `${row.count} weekly high ${row.count === 1 ? "score" : "scores"}`)],
      ["Most weekly low scores", rankedLeaderboard(countWeeklyExtremes(rows, "min", true), (row) => row.count, "max", (row) => row.manager, (row) => `${row.count} weekly low ${row.count === 1 ? "score" : "scores"}`)],
      ["Best average score", rankedLeaderboard(averages, (row) => row.average, "max", (row) => row.manager, (row) => `${fmt(row.average)} pts • ${row.games} games`)],
      ["Worst average score", rankedLeaderboard(averages, (row) => row.average, "min", (row) => row.manager, (row) => `${fmt(row.average)} pts • ${row.games} games`)],
      ["Most PF in a regular season", rankedLeaderboard(seasonPfRows("max", true), (row) => row.pointsFor, "max", (row) => `${row.manager} • ${row.season}`, (row) => `${fmt(row.pointsFor)} PF • ${row.games} games`)],
      ["Least PF in a regular season", rankedLeaderboard(seasonPfRows("min", true), (row) => row.pointsFor, "min", (row) => `${row.manager} • ${row.season}`, (row) => `${fmt(row.pointsFor)} PF • ${row.games} games`)],
      ["Most brutal schedule", rankedLeaderboard(scheduleRows("max", true), (row) => row.pointsAgainst, "max", (row) => `${row.manager} • ${row.season}`, (row) => `${fmt(row.pointsAgainst)} PA • regular season ${row.regularFinish}`)],
      ["Easiest schedule", rankedLeaderboard(scheduleRows("min", true), (row) => row.pointsAgainst, "min", (row) => `${row.manager} • ${row.season}`, (row) => `${fmt(row.pointsAgainst)} PA • regular season ${row.regularFinish}`)],
      ["Best playoff performer", rankedLeaderboard(playoffPerformerRows(true), (row) => row.average, "max", (row) => row.manager, (row) => `${fmt(row.average)} pts avg. • ${row.games} games`)],
      ["Most loyal manager", rankedLeaderboard(loyaltyRows, (row) => row.kept, "max", (row) => `${row.manager} • ${row.season}`, (row) => `${row.kept} of ${row.drafted} draft picks kept`)],
      ["Least loyal manager", rankedLeaderboard(loyaltyRows, (row) => row.kept, "min", (row) => `${row.manager} • ${row.season}`, (row) => `${row.kept} of ${row.drafted} draft picks kept`)],
      ["Most weekly top-three finishes", rankedLeaderboard(weeklyTopThreeRows(true), (row) => row.count, "max", (row) => row.manager, (row) => `${row.count} top-three ${row.count === 1 ? "finish" : "finishes"}`)],
      ["Most weekly bottom-three finishes", rankedLeaderboard(weeklyBottomThreeRows(true), (row) => row.count, "max", (row) => row.manager, (row) => `${row.count} bottom-three ${row.count === 1 ? "finish" : "finishes"}`)],
      ["Weeks top of table", rankedLeaderboard(standingsCheckpoints, (row) => row.top, "max", (row) => row.manager, (row) => `${row.top} ${row.top === 1 ? "week" : "weeks"} in 1st`)],
      ["Weeks bottom of table", rankedLeaderboard(standingsCheckpoints, (row) => row.bottom, "max", (row) => row.manager, (row) => `${row.bottom} ${row.bottom === 1 ? "week" : "weeks"} in last`)],
    ]);
    if (recentEl) {
      recentEl.innerHTML = recentAdjustments.map(recentAdjustmentCard).join("");
    }

    allEl.innerHTML = statItems.map(statCard).join("");
    applyManagerFilter(selectedManager);
  }

  function applyManagerFilter(selectedManager = filterEl?.value || "") {
    const matchesManager = (card) => {
      const cardManagers = String(card.dataset.waxStatManagers || "").split("||").filter(Boolean);
      return !selectedManager || cardManagers.includes(selectedManager);
    };
    allEl?.querySelectorAll(".wax-stat-card").forEach((card) => {
      card.hidden = !matchesManager(card);
    });
    if (recentEl) {
      const recentCards = [...recentEl.querySelectorAll(".recent-stat-card")];
      recentCards.forEach((card) => {
        card.hidden = !matchesManager(card);
      });
      recentEl.closest(".recent-stat-adjustments").hidden = !recentCards.some((card) => !card.hidden);
    }
  }

  function closeStatLeaderboard() {
    const popover = document.querySelector("#wax-stat-leaderboard");
    if (popover) popover.hidden = true;
  }

  function showStatLeaderboard(title) {
    const rows = statLeaderboards.get(title) || [];
    const selectedManager = filterEl?.value || "";
    let popover = document.querySelector("#wax-stat-leaderboard");
    if (!popover) {
      popover = document.createElement("aside");
      popover.id = "wax-stat-leaderboard";
      popover.className = "manager-rank-popover";
      popover.setAttribute("aria-modal", "true");
      popover.setAttribute("role", "dialog");
      document.body.appendChild(popover);
    }
    popover.setAttribute("aria-label", `${title} leaderboard`);
    popover.innerHTML = `
      <div class="manager-rank-dialog wax-stat-rank-dialog">
        <button class="manager-rank-close" type="button" data-close-wax-stat aria-label="Close leaderboard">&times;</button>
        <p class="eyebrow">Wax Stats leaderboard</p>
        <h3>${escapeHtml(title)}</h3>
        <ol class="manager-rank-list wax-stat-rank-list">
          ${rows.map((row) => `
            <li class="${selectedManager && row.managers.includes(selectedManager) ? "is-active" : ""}">
              <span>${row.rank}</span>
              <strong>${escapeHtml(row.label)}</strong>
              <em>${escapeHtml(row.detail)}</em>
            </li>
          `).join("")}
        </ol>
      </div>
    `;
    popover.hidden = false;
    popover.querySelector(".manager-rank-close")?.focus();
  }

  function populateManagerFilter() {
    if (!filterEl) return;
    const options = [...managers].sort((a, b) => a.localeCompare(b));
    filterEl.innerHTML = `<option value="">All managers</option>${options.map((manager) => (
      `<option value="${escapeHtml(manager)}">${escapeHtml(manager)}</option>`
    )).join("")}`;
    filterEl.addEventListener("input", () => applyManagerFilter());
    filterEl.addEventListener("change", () => applyManagerFilter());
  }

  async function loadPlayerPprStat() {
    try {
      playerPprRows = await fetchSleeperPlayerPprRows();
    } catch (error) {
      playerPprRows = [];
    }
    render();
  }

  document.addEventListener("click", (event) => {
    const card = event.target.closest("[data-wax-stat-key]");
    if (card && !event.target.closest("a")) {
      showStatLeaderboard(card.dataset.waxStatKey);
      return;
    }
    const popover = event.target.closest("#wax-stat-leaderboard");
    if (popover && (event.target === popover || event.target.closest("[data-close-wax-stat]"))) closeStatLeaderboard();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeStatLeaderboard();
    const card = event.target.closest?.("[data-wax-stat-key]");
    if (card && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      showStatLeaderboard(card.dataset.waxStatKey);
    }
  });

  if (allEl) {
    populateManagerFilter();
    render();
    refreshCompletedMatchups();
    window.setInterval(refreshCompletedMatchups, REFRESH_MS);
    loadPlayerPprStat();
  }
})();
