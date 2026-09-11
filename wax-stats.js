(() => {
  const data = window.WAXBALL_H2H_DATA || {};
  const games = Array.isArray(data.matchups) ? data.matchups : [];
  const managers = Array.isArray(data.managers) ? data.managers : [];
  const EPSILON = 0.005;
  const API_BASE = "https://api.sleeper.app/v1";
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

  function countWeeklyExtremes(rows, mode) {
    const counts = new Map();
    groupByWeek(rows).forEach((weekRows) => {
      tiedRows(weekRows, (row) => row.points, mode).forEach((row) => {
        counts.set(row.manager, (counts.get(row.manager) || 0) + 1);
      });
    });
    const entries = [...counts.entries()].map(([manager, count]) => ({ manager, count }));
    return tiedRows(entries, (row) => row.count, "max");
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

  function scheduleRows(mode) {
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
    return tiedRows(rows, (row) => row.pointsAgainst, mode);
  }

  function seasonPfRows(mode) {
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
    return tiedRows(rows, (row) => row.pointsFor, mode);
  }

  function playoffPerformerRows() {
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
    return tiedRows(byManager, (row) => row.average, "max");
  }

  function weeklyTopThreeRows() {
    const counts = new Map();
    groupByWeek(sideRows()).forEach((weekRows) => {
      [...weekRows]
        .sort((a, b) => b.points - a.points)
        .slice(0, 3)
        .forEach((row) => counts.set(row.manager, (counts.get(row.manager) || 0) + 1));
    });
    const entries = [...counts.entries()].map(([manager, count]) => ({ manager, count }));
    return tiedRows(entries, (row) => row.count, "max");
  }

  function weeklyBottomThreeRows() {
    const counts = new Map();
    groupByWeek(sideRows()).forEach((weekRows) => {
      [...weekRows]
        .sort((a, b) => a.points - b.points)
        .slice(0, 3)
        .forEach((row) => counts.set(row.manager, (counts.get(row.manager) || 0) + 1));
    });
    const entries = [...counts.entries()].map(([manager, count]) => ({ manager, count }));
    return tiedRows(entries, (row) => row.count, "max");
  }

  function streaks(rows, resultType) {
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
    return tiedRows(byManager, (row) => row.count, "max");
  }

  function statCard({ title, value, details, tone = "" }) {
    const detailItems = Array.isArray(details) ? details : [details];
    return `
      <article class="wax-stat-card ${tone}">
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
      <article class="recent-stat-card ${adjustment.tone || ""}">
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
    ];
    const shownStats = selectedManager ? statItems.filter((stat) => stat.managers.includes(selectedManager)) : statItems;
    const shownAdjustments = selectedManager
      ? recentAdjustments.filter((adjustment) => (adjustment.managers || []).includes(selectedManager))
      : recentAdjustments;

    if (recentEl) {
      recentEl.closest(".recent-stat-adjustments").hidden = !shownAdjustments.length;
      recentEl.innerHTML = shownAdjustments.map(recentAdjustmentCard).join("");
    }

    allEl.innerHTML = shownStats.length
      ? shownStats.map(statCard).join("")
      : `<p class="wax-stats-empty">No Wax Stats involve ${escapeHtml(selectedManager)} yet.</p>`;
  }

  function populateManagerFilter() {
    if (!filterEl) return;
    const options = [...managers].sort((a, b) => a.localeCompare(b));
    filterEl.innerHTML = `<option value="">All managers</option>${options.map((manager) => (
      `<option value="${escapeHtml(manager)}">${escapeHtml(manager)}</option>`
    )).join("")}`;
    filterEl.addEventListener("change", () => render());
  }

  async function loadPlayerPprStat() {
    try {
      playerPprRows = await fetchSleeperPlayerPprRows();
    } catch (error) {
      playerPprRows = [];
    }
    render();
  }

  if (allEl) {
    populateManagerFilter();
    render();
    loadPlayerPprStat();
  }
})();
