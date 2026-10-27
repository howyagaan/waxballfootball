(function () {
  const data = window.WAXBALL_H2H_DATA || { managers: [], matchups: [] };
  const managers = [...data.managers].sort((a, b) => a.localeCompare(b));
  const EPSILON = 0.005;
  const CURRENT_SEASON_FALLBACK_MATCHUPS = [
    { season: 2026, week: 1, stage: "Regular season", managers: ["Miles Elliot", "Jakob Cooper"], scores: [115, 154.06] },
    { season: 2026, week: 1, stage: "Regular season", managers: ["Nic Hamilton", "Miles Blue"], scores: [156.02, 121.92] },
    { season: 2026, week: 1, stage: "Regular season", managers: ["Milo Manheim", "Jacob Moskovitz"], scores: [139.96, 94.04] },
    { season: 2026, week: 1, stage: "Regular season", managers: ["Erik Ohno Dagoberg", "Christian Engelhardt"], scores: [115.4, 121.96] },
    { season: 2026, week: 1, stage: "Regular season", managers: ["Travis Roy Rogers", "Sam Labovitz"], scores: [149.9, 100.76] },
    { season: 2026, week: 1, stage: "Regular season", managers: ["Will Price", "Paul Legallet"], scores: [127.96, 120.56] },
    { id: "2026-w2-m1", season: 2026, week: 2, stage: "Regular season", managers: ["Erik Ohno Dagoberg", "Jacob Moskovitz"], teams: ["Pamela Mari Ohno Dagoberg", "poonfullofsugar"], scores: [143.26, 124.28] },
    { id: "2026-w2-m2", season: 2026, week: 2, stage: "Regular season", managers: ["Milo Manheim", "Miles Blue"], teams: ["Nacua Matata", "blueballs"], scores: [100.7, 145.36] },
    { id: "2026-w2-m3", season: 2026, week: 2, stage: "Regular season", managers: ["Travis Roy Rogers", "Christian Engelhardt"], teams: ["darryluvr3000", "Steeler Virginity"], scores: [87.36, 126.52] },
    { id: "2026-w2-m4", season: 2026, week: 2, stage: "Regular season", managers: ["Nic Hamilton", "Paul Legallet"], teams: ["Stat Fag", "helloimpaul"], scores: [117.5, 101.8] },
    { id: "2026-w2-m5", season: 2026, week: 2, stage: "Regular season", managers: ["Jakob Cooper", "Sam Labovitz"], teams: ["Papi Coop", "mistahbigdick"], scores: [89.34, 104.82] },
    { id: "2026-w2-m6", season: 2026, week: 2, stage: "Regular season", managers: ["Miles Elliot", "Will Price"], teams: ["Daddy Campbell", "poon messiah"], scores: [120.18, 110.78] },
    { id: "2026-w3-m1", season: 2026, week: 3, stage: "Regular season", managers: ["Miles Elliot", "Nic Hamilton"], teams: ["Daddy Campbell", "Stat Fag"], scores: [169.18, 102.24] },
    { id: "2026-w3-m2", season: 2026, week: 3, stage: "Regular season", managers: ["Jakob Cooper", "Christian Engelhardt"], teams: ["Papi Coop", "Steeler Virginity"], scores: [120.32, 114.46] },
    { id: "2026-w3-m3", season: 2026, week: 3, stage: "Regular season", managers: ["Milo Manheim", "Paul Legallet"], teams: ["Nacua Matata", "helloimpaul"], scores: [111.74, 118.88] },
    { id: "2026-w3-m4", season: 2026, week: 3, stage: "Regular season", managers: ["Miles Blue", "Jacob Moskovitz"], teams: ["blueballs", "poonfullofsugar"], scores: [115.98, 93.46] },
    { id: "2026-w3-m5", season: 2026, week: 3, stage: "Regular season", managers: ["Erik Ohno Dagoberg", "Travis Roy Rogers"], teams: ["Pamela Mari Ohno Dagoberg", "darryluvr3000"], scores: [156.24, 102.14] },
    { id: "2026-w3-m6", season: 2026, week: 3, stage: "Regular season", managers: ["Sam Labovitz", "Will Price"], teams: ["mistahbigdick", "poon messiah"], scores: [123.14, 102.28] },
    { id: "2026-w4-m1", season: 2026, week: 4, stage: "Regular season", managers: ["Travis Roy Rogers", "Jacob Moskovitz"], scores: [84.78, 154.28] },
    { id: "2026-w4-m2", season: 2026, week: 4, stage: "Regular season", managers: ["Miles Blue", "Paul Legallet"], scores: [130.32, 124.52] },
    { id: "2026-w4-m3", season: 2026, week: 4, stage: "Regular season", managers: ["Jakob Cooper", "Erik Ohno Dagoberg"], scores: [116.52, 104.40] },
    { id: "2026-w4-m4", season: 2026, week: 4, stage: "Regular season", managers: ["Miles Elliot", "Milo Manheim"], scores: [133.34, 123.28] },
    { id: "2026-w4-m5", season: 2026, week: 4, stage: "Regular season", managers: ["Christian Engelhardt", "Will Price"], scores: [102.12, 138.92] },
    { id: "2026-w4-m6", season: 2026, week: 4, stage: "Regular season", managers: ["Nic Hamilton", "Sam Labovitz"], scores: [106.58, 110.56] },
    { id: "2026-w5-m1", season: 2026, week: 5, stage: "Regular season", managers: ["Jacob Moskovitz", "Paul Legallet"], scores: [111.94, 97.80] },
    { id: "2026-w5-m2", season: 2026, week: 5, stage: "Regular season", managers: ["Jakob Cooper", "Travis Roy Rogers"], scores: [120.92, 149.34] },
    { id: "2026-w5-m3", season: 2026, week: 5, stage: "Regular season", managers: ["Miles Elliot", "Miles Blue"], scores: [147.26, 133.96] },
    { id: "2026-w5-m4", season: 2026, week: 5, stage: "Regular season", managers: ["Erik Ohno Dagoberg", "Will Price"], scores: [134.62, 81.90] },
    { id: "2026-w5-m5", season: 2026, week: 5, stage: "Regular season", managers: ["Milo Manheim", "Sam Labovitz"], scores: [144.32, 133.48] },
    { id: "2026-w5-m6", season: 2026, week: 5, stage: "Regular season", managers: ["Nic Hamilton", "Christian Engelhardt"], scores: [117.78, 126.20] },
    { id: "2026-w6-m1", season: 2026, week: 6, stage: "Regular season", managers: ["Jakob Cooper", "Jacob Moskovitz"], scores: [108.30, 111.68] },
    { id: "2026-w6-m2", season: 2026, week: 6, stage: "Regular season", managers: ["Miles Elliot", "Paul Legallet"], scores: [119.16, 92.22] },
    { id: "2026-w6-m3", season: 2026, week: 6, stage: "Regular season", managers: ["Travis Roy Rogers", "Will Price"], scores: [130.64, 118.58] },
    { id: "2026-w6-m4", season: 2026, week: 6, stage: "Regular season", managers: ["Miles Blue", "Sam Labovitz"], scores: [109.30, 114.90] },
    { id: "2026-w6-m5", season: 2026, week: 6, stage: "Regular season", managers: ["Nic Hamilton", "Erik Ohno Dagoberg"], scores: [128.94, 95.92] },
    { id: "2026-w6-m6", season: 2026, week: 6, stage: "Regular season", managers: ["Milo Manheim", "Christian Engelhardt"], scores: [75.38, 112.50] },
    { id: "2026-w7-m1", season: 2026, week: 7, stage: "Regular season", managers: ["Miles Elliot", "Jacob Moskovitz"], scores: [113.22, 109.82] },
    { id: "2026-w7-m2", season: 2026, week: 7, stage: "Regular season", managers: ["Jakob Cooper", "Will Price"], scores: [133.20, 93.62] },
    { id: "2026-w7-m3", season: 2026, week: 7, stage: "Regular season", managers: ["Sam Labovitz", "Paul Legallet"], scores: [116.42, 126.38] },
    { id: "2026-w7-m4", season: 2026, week: 7, stage: "Regular season", managers: ["Nic Hamilton", "Travis Roy Rogers"], scores: [112.56, 50.90] },
    { id: "2026-w7-m5", season: 2026, week: 7, stage: "Regular season", managers: ["Miles Blue", "Christian Engelhardt"], scores: [149.04, 103.32] },
    { id: "2026-w7-m6", season: 2026, week: 7, stage: "Regular season", managers: ["Milo Manheim", "Erik Ohno Dagoberg"], scores: [141.28, 121.28] },
  ];
  const MANAGER_COLORS = {
    "Christian Engelhardt": "255, 20, 147",
    "Erik Ohno Dagoberg": "176, 32, 64",
    "Jacob Moskovitz": "34, 197, 94",
    "Jakob Cooper": "142, 161, 255",
    "Miles Blue": "86, 185, 255",
    "Miles Elliot": "255, 184, 77",
    "Milo Manheim": "255, 93, 120",
    "Nic Hamilton": "0, 206, 184",
    "Paul Legallet": "250, 204, 21",
    "Sam Labovitz": "255, 138, 31",
    "Travis Roy Rogers": "168, 85, 247",
    "Will Price": "245, 248, 251",
  };
  const RANK_SHORT_NAMES = {
    "Christian Engelhardt": "Christian", "Erik Ohno Dagoberg": "Erik", "Jacob Moskovitz": "Mosko",
    "Jakob Cooper": "Havi", "Miles Blue": "Blue", "Miles Elliot": "Miles E", "Milo Manheim": "Milo",
    "Nic Hamilton": "Nic", "Paul Legallet": "Paul", "Sam Labovitz": "Sam", "Travis Roy Rogers": "Trav", "Will Price": "Will",
  };
  const OWNER_REAL_NAMES = {
    helloimpaul: "Paul Legallet", bigboybluey: "Miles Blue", erikohno: "Erik Ohno Dagoberg",
    eviandon: "Milo Manheim", pigmanbigman: "Nic Hamilton", "10w5l": "Jacob Moskovitz",
    dicklesscameltoe: "Nic Hamilton",
    "daddy campbell": "Miles Elliot", waxobwaxkovitz: "Jacob Moskovitz", willyboyp: "Will Price",
    bigdicksenior: "Sam Labovitz", blueballs: "Miles Blue", darryluvr: "Travis Roy Rogers",
    darryluvr3000: "Travis Roy Rogers", chrissy511: "Christian Engelhardt", mistahbigdick: "Sam Labovitz",
    "nacua matata": "Milo Manheim", "pamela mari ohno dagoberg": "Erik Ohno Dagoberg",
    papicoop: "Jakob Cooper", "papi coop": "Jakob Cooper", "poon messiah": "Will Price",
    poonfullofsugar: "Jacob Moskovitz", "stat fag": "Nic Hamilton", "steeler virginity": "Christian Engelhardt",
    millsberry27: "Miles Elliot",
  };

  const matchups = mergeMatchups(data.matchups || [], CURRENT_SEASON_FALLBACK_MATCHUPS);
  const fmt = (value) => Number(value || 0).toFixed(2);
  const pts = (value) => `${fmt(value)}pts`;
  const slug = (value) => String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const escapeHtml = (value = "") => String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#039;",
  }[char]));
  const managerStyle = (manager) => {
    const color = MANAGER_COLORS[manager] || "0, 206, 184";
    const [r, g, b] = color.split(",").map((part) => Number(part.trim()));
    const readable = ((r * 299 + g * 587 + b * 114) / 1000) < 70 ? "245, 248, 251" : color;
    const textStroke = "0 transparent";
    return `--manager-color-rgb: ${color}; --manager-color: rgb(${color}); --manager-readable-color: rgb(${readable}); --manager-text-stroke: ${textStroke};`;
  };

  function mergeMatchups(...groups) {
    const merged = new Map();
    groups.flat().forEach((game) => {
      const key = [game.season, game.week, ...(game.managers || []).slice().sort()].join("||");
      if (key) merged.set(key, game);
    });
    return [...merged.values()];
  }

  function sideRows() {
    return matchups.flatMap((game) => [0, 1].map((index) => ({
      game,
      manager: game.managers[index],
      opponent: game.managers[index === 0 ? 1 : 0],
      points: Number(game.scores[index] || 0),
      oppPoints: Number(game.scores[index === 0 ? 1 : 0] || 0),
    })));
  }

  function rankRows(rawRows, mode = "desc") {
    const rows = [...rawRows].sort((a, b) => {
      const diff = mode === "asc" ? a.value - b.value : b.value - a.value;
      return Math.abs(diff) > EPSILON ? diff : a.manager.localeCompare(b.manager);
    });
    let lastValue = null;
    let lastRank = 0;
    return rows.map((row, index) => {
      const tied = lastValue !== null && Math.abs(row.value - lastValue) < EPSILON;
      const rank = tied ? lastRank : index + 1;
      lastValue = row.value;
      lastRank = rank;
      return { ...row, rank };
    });
  }

  function denseRankRows(rawRows, mode = "desc") {
    const rows = [...rawRows].sort((a, b) => {
      const diff = mode === "asc" ? a.value - b.value : b.value - a.value;
      return Math.abs(diff) > EPSILON ? diff : a.manager.localeCompare(b.manager);
    });
    let lastValue = null;
    let rank = 0;
    return rows.map((row) => {
      if (lastValue === null || Math.abs(row.value - lastValue) >= EPSILON) rank += 1;
      lastValue = row.value;
      return { ...row, rank };
    });
  }

  function buildLeaderboards() {
    const rows = sideRows();
    const winningStreakRows = managers.flatMap((manager) => {
      const managerRows = rows
        .filter((row) => row.manager === manager)
        .sort((a, b) => Number(a.game.season) - Number(b.game.season) || Number(a.game.week) - Number(b.game.week));
      const streaks = [];
      let current = [];
      const finishStreak = () => {
        if (!current.length) return;
        const first = current[0].game;
        const last = current[current.length - 1].game;
        const range = Number(first.season) === Number(last.season)
          ? `${first.season} W${first.week}${Number(first.week) === Number(last.week) ? "" : `-W${last.week}`}`
          : `${first.season} W${first.week}-${last.season} W${last.week}`;
        streaks.push({ manager, value: current.length, display: `${current.length} wins - ${range}` });
        current = [];
      };
      managerRows.forEach((row) => {
        if (row.points > row.oppPoints) current.push(row);
        else finishStreak();
      });
      finishStreak();
      return streaks;
    });
    const weekToWeekDrops = managers.flatMap((manager) => {
      const managerRows = rows
        .filter((row) => row.manager === manager && row.game.stage === "Regular season")
        .sort((a, b) => Number(a.game.season) - Number(b.game.season) || Number(a.game.week) - Number(b.game.week));
      return managerRows.slice(1).flatMap((row, index) => {
        const previous = managerRows[index];
        if (Number(previous.game.season) !== Number(row.game.season) || Number(row.game.week) !== Number(previous.game.week) + 1) return [];
        const drop = previous.points - row.points;
        if (drop <= 0) return [];
        return [{ manager, value: drop, display: `${fmt(drop)}pts · ${row.game.season} W${previous.game.week}-W${row.game.week}` }];
      });
    });
    const weekToWeekRises = managers.flatMap((manager) => {
      const managerRows = rows
        .filter((row) => row.manager === manager && row.game.stage === "Regular season")
        .sort((a, b) => Number(a.game.season) - Number(b.game.season) || Number(a.game.week) - Number(b.game.week));
      return managerRows.slice(1).flatMap((row, index) => {
        const previous = managerRows[index];
        if (Number(previous.game.season) !== Number(row.game.season) || Number(row.game.week) !== Number(previous.game.week) + 1) return [];
        const rise = row.points - previous.points;
        if (rise <= 0) return [];
        return [{ manager, value: rise, display: `${fmt(rise)}pts · ${row.game.season} W${previous.game.week}-W${row.game.week}` }];
      });
    });
    const profiles = managers.map((manager) => {
      const managerRows = rows.filter((row) => row.manager === manager);
      const wins = managerRows.filter((row) => row.points > row.oppPoints).length;
      const pf = managerRows.reduce((sum, row) => sum + row.points, 0);
      const pa = managerRows.reduce((sum, row) => sum + row.oppPoints, 0);
      return { manager, games: managerRows.length, wins, losses: managerRows.length - wins, pf, pa, average: managerRows.length ? pf / managerRows.length : 0 };
    }).filter((profile) => profile.games);
    const topThreeCounts = new Map();
    const byWeek = rows.reduce((map, row) => {
      const key = `${row.game.season}-${row.game.week}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(row);
      return map;
    }, new Map());
    const regularByWeek = rows.filter((row) => row.game.stage === "Regular season").reduce((map, row) => {
      const key = `${row.game.season}-${row.game.week}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(row);
      return map;
    }, new Map());
    byWeek.forEach((weekRows) => {
      [...weekRows].sort((a, b) => b.points - a.points).slice(0, 3).forEach((row) => {
        topThreeCounts.set(row.manager, (topThreeCounts.get(row.manager) || 0) + 1);
      });
    });
    const careerLowRows = managers.map((manager) => {
      const lowest = rows.filter((row) => row.manager === manager).sort((a, b) => a.points - b.points)[0];
      return { manager, value: lowest.points, display: `${fmt(lowest.points)}pts - ${lowest.game.season} W${lowest.game.week}` };
    });
    const weeklyHighScoreRows = [...byWeek.entries()].map(([key, weekRows]) => {
      const highest = [...weekRows].sort((a, b) => b.points - a.points)[0];
      const [season, week] = key.split("-");
      return { manager: highest.manager, value: highest.points, display: `${fmt(highest.points)}pts - ${season} W${week}` };
    });
    const weeklyRangeRows = [...regularByWeek.entries()].map(([key, weekRows]) => {
      const scores = weekRows.map((row) => row.points);
      const [season, week] = key.split("-");
      const value = Math.max(...scores) - Math.min(...scores);
      const highManager = weekRows.find((row) => Math.abs(row.points - Math.max(...scores)) < EPSILON)?.manager;
      const lowManager = weekRows.find((row) => Math.abs(row.points - Math.min(...scores)) < EPSILON)?.manager;
      return { manager: "", label: `${season} Week ${week}`, value, display: `${fmt(value)}pts (between ${RANK_SHORT_NAMES[highManager] || highManager} and ${RANK_SHORT_NAMES[lowManager] || lowManager})` };
    });
    const highScorerOpponentCounts = new Map(managers.map((manager) => [manager, 0]));
    const lowScorerOpponentCounts = new Map(managers.map((manager) => [manager, 0]));
    regularByWeek.forEach((weekRows) => {
      const high = Math.max(...weekRows.map((row) => row.points));
      const low = Math.min(...weekRows.map((row) => row.points));
      weekRows.filter((row) => Math.abs(row.points - high) < EPSILON).forEach((row) => {
        highScorerOpponentCounts.set(row.opponent, (highScorerOpponentCounts.get(row.opponent) || 0) + 1);
      });
      weekRows.filter((row) => Math.abs(row.points - low) < EPSILON).forEach((row) => {
        lowScorerOpponentCounts.set(row.opponent, (lowScorerOpponentCounts.get(row.opponent) || 0) + 1);
      });
    });
    const regularSeasonWeeks = rows.filter((row) => row.game.stage === "Regular season").reduce((map, row) => {
      const key = `${row.game.season}-${row.game.week}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(row.points);
      return map;
    }, new Map());
    const weeklyAverageRows = [...regularSeasonWeeks.entries()].map(([key, scores]) => {
      const [season, week] = key.split("-");
      const value = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      return { manager: "", label: `${season} Week ${week}`, value, display: `${fmt(value)}pts` };
    });
    const weeklyLowCounts = new Map();
    byWeek.forEach((weekRows) => {
      const low = Math.min(...weekRows.map((row) => row.points));
      weekRows.filter((row) => Math.abs(row.points - low) < EPSILON).forEach((row) => {
        weeklyLowCounts.set(row.manager, (weeklyLowCounts.get(row.manager) || 0) + 1);
      });
    });
    const standingsPodiumCounts = new Map();
    [...new Set(matchups.filter((game) => game.stage === "Regular season").map((game) => Number(game.season)))].forEach((season) => {
      const seasonGames = matchups.filter((game) => Number(game.season) === season && game.stage === "Regular season");
      const seasonManagers = [...new Set(seasonGames.flatMap((game) => game.managers || []))];
      const totals = new Map(seasonManagers.map((manager) => [manager, { wins: 0, losses: 0, pf: 0 }]));
      const maxWeek = Math.max(0, ...seasonGames.map((game) => Number(game.week) || 0));
      for (let week = 1; week <= maxWeek; week += 1) {
        seasonGames.filter((game) => Number(game.week) === week).forEach((game) => {
          const [first, second] = game.managers;
          const firstScore = Number(game.scores?.[0] || 0);
          const secondScore = Number(game.scores?.[1] || 0);
          totals.get(first).pf += firstScore;
          totals.get(second).pf += secondScore;
          if (firstScore > secondScore) {
            totals.get(first).wins += 1;
            totals.get(second).losses += 1;
          } else if (secondScore > firstScore) {
            totals.get(second).wins += 1;
            totals.get(first).losses += 1;
          }
        });
        [...seasonManagers].sort((a, b) => {
          const first = totals.get(a);
          const second = totals.get(b);
          return second.wins - first.wins || first.losses - second.losses || second.pf - first.pf;
        }).slice(0, 3).forEach((manager) => {
          standingsPodiumCounts.set(manager, (standingsPodiumCounts.get(manager) || 0) + 1);
        });
      }
    });
    const blowoutRows = matchups.map((game) => {
      const firstScore = Number(game.scores?.[0] || 0);
      const secondScore = Number(game.scores?.[1] || 0);
      const winnerIndex = firstScore >= secondScore ? 0 : 1;
      return {
        manager: game.managers[winnerIndex],
        value: Math.abs(firstScore - secondScore),
        display: `${fmt(Math.abs(firstScore - secondScore))}pts - ${game.season} W${game.week} vs ${game.managers[winnerIndex === 0 ? 1 : 0]}`,
      };
    });
    const standingsThroughWeek = (throughWeek) => profiles.map((profile) => {
      const managerRows = rows.filter((candidate) => candidate.manager === profile.manager && Number(candidate.game.season) === 2026 && Number(candidate.game.week) <= throughWeek);
      const wins = managerRows.filter((row) => row.points > row.oppPoints).length;
      const losses = managerRows.filter((row) => row.points < row.oppPoints).length;
      const pf = managerRows.reduce((sum, row) => sum + row.points, 0);
      const pa = managerRows.reduce((sum, row) => sum + row.oppPoints, 0);
      return { manager: profile.manager, value: (wins * 1000000) + pf, display: managerRows.length ? `${wins}-${losses}, ${fmt(pf)}pts PF, ${fmt(pa)}pts PA` : "0-0" };
    }).filter((row) => row.display !== "0-0");
    return {
      standings2026w1: { title: "Week 1 Standings", rows: rankRows(profiles.map((profile) => {
        const row = rows.find((candidate) => (
          candidate.manager === profile.manager
          && Number(candidate.game.season) === 2026
          && Number(candidate.game.week) === 1
        ));
        return {
          manager: profile.manager,
          value: (row?.points > row?.oppPoints ? 1000 : 0) + (row?.points || 0),
          display: row ? `${row.points > row.oppPoints ? "1-0" : "0-1"}, ${fmt(row.points)}pts PF, ${fmt(row.oppPoints)}pts PA` : "0-0",
        };
      }).filter((row) => row.display !== "0-0")) },
      standings2026w2: { title: "Week 2 Standings", rows: rankRows(profiles.map((profile) => {
        const managerRows = rows.filter((candidate) => (
          candidate.manager === profile.manager
          && Number(candidate.game.season) === 2026
          && Number(candidate.game.week) <= 2
        ));
        const wins = managerRows.filter((row) => row.points > row.oppPoints).length;
        const losses = managerRows.filter((row) => row.points < row.oppPoints).length;
        const pf = managerRows.reduce((sum, row) => sum + row.points, 0);
        const pa = managerRows.reduce((sum, row) => sum + row.oppPoints, 0);
        return {
          manager: profile.manager,
          value: (wins * 1000000) + pf,
          display: managerRows.length ? `${wins}-${losses}, ${fmt(pf)}pts PF, ${fmt(pa)}pts PA` : "0-0",
        };
      }).filter((row) => row.display !== "0-0")) },
      standings2026w3: { title: "Week 3 Standings", rows: rankRows(standingsThroughWeek(3)) },
      weekScore2026w2: { title: "Week 2 Scores", rows: rankRows(rows.filter((row) => Number(row.game.season) === 2026 && Number(row.game.week) === 2).map((row) => ({ manager: row.manager, value: row.points, display: pts(row.points) }))) },
      pa2026w2: { title: "2026 Points Against Through Week 2", rows: rankRows(profiles.map((profile) => {
        const value = rows.filter((row) => row.manager === profile.manager && Number(row.game.season) === 2026 && Number(row.game.week) <= 2).reduce((sum, row) => sum + row.oppPoints, 0);
        return { manager: profile.manager, value, display: pts(value) };
      })) },
      weekToWeekDrop: { title: "Largest Week-to-Week Scoring Drops", rows: rankRows(weekToWeekDrops) },
      weekToWeekRise: { title: "Largest Week-to-Week Scoring Rebounds", rows: rankRows(weekToWeekRises).slice(0, 10) },
      average: { title: "Average Score", rows: rankRows(profiles.map((profile) => ({ manager: profile.manager, value: profile.average, display: pts(profile.average) }))) },
      pf: { title: "All-Time Points For", rows: rankRows(profiles.map((profile) => ({ manager: profile.manager, value: profile.pf, display: pts(profile.pf) }))) },
      pa: { title: "All-Time Points Against", rows: rankRows(profiles.map((profile) => ({ manager: profile.manager, value: profile.pa, display: pts(profile.pa) }))) },
      pointDiff: { title: "All-Time Point Difference", rows: rankRows(profiles.map((profile) => ({ manager: profile.manager, value: profile.pf - profile.pa, display: `${profile.pf >= profile.pa ? "+" : "-"}${fmt(Math.abs(profile.pf - profile.pa))}` }))) },
      weeklyTopThree: { title: "Weekly Top-Three Finishes", rows: rankRows(managers.map((manager) => ({ manager, value: topThreeCounts.get(manager) || 0, display: `${topThreeCounts.get(manager) || 0} finishes` }))) },
      weeklyLows: { title: "Most Weekly Low Scores", rows: rankRows(managers.map((manager) => ({ manager, value: weeklyLowCounts.get(manager) || 0, display: `${weeklyLowCounts.get(manager) || 0} weekly lows` }))) },
      standingsPodiums: { title: "Weeks Ended on the Podium", rows: rankRows(managers.map((manager) => ({ manager, value: standingsPodiumCounts.get(manager) || 0, display: `${standingsPodiumCounts.get(manager) || 0} weeks` }))) },
      blowoutMargins: { title: "Largest Blowout Margins", rows: rankRows(blowoutRows).slice(0, 14) },
      winningStreaks: { title: "Longest Winning Streaks", rows: denseRankRows(winningStreakRows.filter((row) => row.value >= 4)) },
      careerLows: { title: "Career Low Scores", rows: rankRows(careerLowRows, "asc") },
      weeklyHighScores: { title: "Lowest Weekly High Scores", rows: rankRows(weeklyHighScoreRows, "asc") },
      weeklyAverages: { title: "Lowest Weekly League Averages", rows: rankRows(weeklyAverageRows, "asc") },
      weeklyRanges: { title: "Widest Weekly Scoring Ranges", rows: rankRows(weeklyRangeRows).slice(0, 13) },
      highScorerOpponents: { title: "Most Weeks Facing the Weekly High Scorer", rows: rankRows(managers.map((manager) => { const value = highScorerOpponentCounts.get(manager) || 0; return { manager, value, display: `${value} week${value === 1 ? "" : "s"}` }; })) },
      lowScorerOpponents: { title: "Most Weeks Facing the Weekly Low Scorer", rows: rankRows(managers.map((manager) => { const value = lowScorerOpponentCounts.get(manager) || 0; return { manager, value, display: `${value} week${value === 1 ? "" : "s"}` }; })) },
      lastPlaceWeeks: { title: "Weeks Ended in Last Place", rows: rankRows([
        ["Will Price", 14], ["Miles Elliot", 8], ["Travis Roy Rogers", 5], ["Jacob Moskovitz", 3],
        ["Paul Legallet", 2], ["Miles Blue", 1], ["Jakob Cooper", 1], ["Erik Ohno Dagoberg", 1],
      ].map(([manager, value]) => ({ manager, value, display: `${value} week${value === 1 ? "" : "s"}` }))) },
    };
  }

  function showLeaderboard(key, activeManager) {
    const board = buildLeaderboards()[key];
    if (!board) return;
    let popover = document.querySelector("#manager-rank-popover");
    if (!popover) {
      popover = document.createElement("aside");
      popover.id = "manager-rank-popover";
      popover.className = "manager-rank-popover";
      document.body.appendChild(popover);
    }
    popover.innerHTML = `
      <div class="manager-rank-dialog" role="dialog" aria-modal="true" aria-label="${escapeHtml(board.title)} standings">
        <button class="manager-rank-close" type="button" aria-label="Close stat standings">×</button>
        <button class="share-capture-button" type="button" data-share-capture data-share-title="Waxball - ${escapeHtml(board.title)}">Share</button>
        <p class="eyebrow">League Rank</p>
        <h3>${escapeHtml(board.title)}</h3>
        <ol class="manager-rank-list">
          ${board.rows.map((row) => {
            const isManager = managers.includes(row.manager);
            return `
            <li class="${row.manager === activeManager ? "is-active" : ""}" ${isManager ? `style="${managerStyle(row.manager)}" data-manager-profile="${escapeHtml(row.manager)}" role="button" tabindex="0" aria-label="Open ${escapeHtml(row.manager)} database"` : ""}>
              <small class="rank-line-title" data-share-only>${escapeHtml(board.title)}</small>
              <span>#${row.rank}</span>
              <strong>${escapeHtml(row.label || row.manager)}</strong>
              <em>${escapeHtml(row.display)}</em>
              <button class="share-capture-button rank-line-share" type="button" data-share-capture data-share-title="${escapeHtml(row.manager)} - ${escapeHtml(board.title)}">Share</button>
            </li>
          `; }).join("")}
        </ol>
      </div>
    `;
    popover.removeAttribute("hidden");
  }

  document.addEventListener("click", (event) => {
    const rankButton = event.target.closest("[data-article-rank-key]");
    if (rankButton) {
      showLeaderboard(rankButton.dataset.articleRankKey, rankButton.dataset.articleRankManager || "");
      return;
    }
    const popover = document.querySelector("#manager-rank-popover");
    if (!popover || popover.hasAttribute("hidden")) return;
    const managerPanel = event.target.closest("[data-manager-profile]");
    if (managerPanel) {
      window.location.href = `../../managers.html#${slug(managerPanel.dataset.managerProfile)}`;
      return;
    }
    if (event.target.closest(".manager-rank-close") || event.target === popover) {
      popover.setAttribute("hidden", "");
    }
  });

  document.addEventListener("keydown", (event) => {
    const rankButton = event.target.closest("[data-article-rank-key]");
    if (rankButton && ["Enter", " "].includes(event.key)) {
      event.preventDefault();
      showLeaderboard(rankButton.dataset.articleRankKey, rankButton.dataset.articleRankManager || "");
      return;
    }
    const popover = document.querySelector("#manager-rank-popover");
    if (!popover || popover.hasAttribute("hidden")) return;
    if (event.key === "Escape") {
      popover.setAttribute("hidden", "");
      return;
    }
    const managerPanel = event.target.closest("[data-manager-profile]");
    if (!managerPanel || !["Enter", " "].includes(event.key)) return;
    event.preventDefault();
    window.location.href = `../../managers.html#${slug(managerPanel.dataset.managerProfile)}`;
  });

  async function hydrateArticleMatchupAvatars() {
    const targets = [...document.querySelectorAll(".article-matchup-teams > div")];
    if (!targets.length) return;
    targets.forEach((target) => {
      const manager = target.querySelector("em")?.textContent?.trim() || "";
      if (!manager) return;
      const initials = manager.split(/\s+/).map((part) => part[0]).slice(0, 2).join("");
      target.insertAdjacentHTML("afterbegin", `<span class="article-matchup-avatar" data-article-avatar-manager="${escapeHtml(manager)}">${escapeHtml(initials)}</span>`);
    });
    try {
      const users = await fetch("https://api.sleeper.app/v1/league/1312219624808419328/users", { cache: "no-store" }).then((response) => response.ok ? response.json() : []);
      const avatars = new Map(users.map((user) => {
        const username = String(user.username || "").toLowerCase();
        const displayName = String(user.display_name || "").toLowerCase();
        const manager = OWNER_REAL_NAMES[username] || OWNER_REAL_NAMES[displayName] || user.metadata?.real_name || user.display_name || user.username;
        const src = user.metadata?.avatar || (user.avatar ? `https://sleepercdn.com/avatars/thumbs/${user.avatar}` : "");
        return [manager, src];
      }));
      document.querySelectorAll("[data-article-avatar-manager]").forEach((avatar) => {
        const src = avatars.get(avatar.dataset.articleAvatarManager);
        if (!src) return;
        const fallback = avatar.textContent;
        avatar.innerHTML = `<img src="${escapeHtml(src)}" alt="" loading="lazy" />`;
        avatar.querySelector("img")?.addEventListener("error", () => {
          avatar.textContent = fallback;
        }, { once: true });
      });
    } catch {
      // Initials remain visible when Sleeper is unavailable.
    }
  }

  hydrateArticleMatchupAvatars();
})();
