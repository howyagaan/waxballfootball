(() => {
  const data = window.WAXBALL_H2H_DATA || {};
  const games = Array.isArray(data.matchups) ? data.matchups : [];
  const managers = Array.isArray(data.managers) ? data.managers : [];
  const EPSILON = 0.005;
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

  function playoffDetail(row) {
    return `
      <b>${escapeHtml(row.manager)}</b>
      <span>${row.games} playoff/Toilet Bowl games • ${row.wins}-${row.games - row.wins}</span>
      <em>${fmt(row.average)} pts avg.</em>
    `;
  }

  function streakDetail(row) {
    return `
      <b>${escapeHtml(row.manager)}</b>
      <span>${weekLabelHtml(row.start)} through ${weekLabelHtml(row.end)}</span>
    `;
  }

  function render() {
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
    const mostBrutalSchedule = scheduleRows("max");
    const easiestSchedule = scheduleRows("min");
    const bestPlayoffPerformer = playoffPerformerRows();
    const topThreeFinishes = weeklyTopThreeRows();
    const bottomThreeFinishes = weeklyBottomThreeRows();

    allEl.innerHTML = [
      statCard({
        title: "Highest one-week score",
        value: `${fmt(highestScore[0]?.points)} pts`,
        details: highestScore.map(sideDetail),
        tone: "is-green",
      }),
      statCard({
        title: "Lowest one-week score",
        value: `${fmt(lowestScore[0]?.points)} pts`,
        details: lowestScore.map(sideDetail),
        tone: "is-red",
      }),
      statCard({
        title: "Lowest score in win",
        value: `${fmt(lowestWin[0]?.points)} pts`,
        details: lowestWin.map(sideDetail),
      }),
      statCard({
        title: "Highest score in loss",
        value: `${fmt(highestLoss[0]?.points)} pts`,
        details: highestLoss.map(sideDetail),
      }),
      statCard({
        title: "Longest win streak",
        value: `${winStreak[0]?.count || 0} wins`,
        details: winStreak.map(streakDetail),
        tone: "is-green",
      }),
      statCard({
        title: "Longest losing streak",
        value: `${lossStreak[0]?.count || 0} losses`,
        details: lossStreak.map(streakDetail),
        tone: "is-red",
      }),
      statCard({
        title: "Biggest blowout",
        value: `${fmt(biggestBlowout[0]?.margin)} pts`,
        details: biggestBlowout.map((row) => gameDetail(row.game)),
      }),
      statCard({
        title: "Tightest game",
        value: `${fmt(tightestGame[0]?.margin)} pts`,
        details: tightestGame.map((row) => gameDetail(row.game)),
      }),
      statCard({
        title: "Highest combined score",
        value: `${fmt(highestCombined[0]?.total)} pts`,
        details: highestCombined.map((row) => gameDetail(row.game)),
      }),
      statCard({
        title: "Lowest combined score",
        value: `${fmt(lowestCombined[0]?.total)} pts`,
        details: lowestCombined.map((row) => gameDetail(row.game)),
      }),
      statCard({
        title: "Most weekly high scores",
        value: `${weeklyHighs[0]?.count || 0}`,
        details: weeklyHighs.map((row) => `<b>${escapeHtml(row.manager)}</b><span>${row.count} weekly high ${row.count === 1 ? "score" : "scores"}</span>`),
        tone: "is-green",
      }),
      statCard({
        title: "Most weekly low scores",
        value: `${weeklyLows[0]?.count || 0}`,
        details: weeklyLows.map((row) => `<b>${escapeHtml(row.manager)}</b><span>${row.count} weekly low ${row.count === 1 ? "score" : "scores"}</span>`),
        tone: "is-red",
      }),
      statCard({
        title: "Best average score",
        value: `${fmt(bestAverage[0]?.average)} pts`,
        details: bestAverage.map((row) => `<b>${escapeHtml(row.manager)}</b><span>${row.games} recorded games</span>`),
        tone: "is-green",
      }),
      statCard({
        title: "Worst average score",
        value: `${fmt(worstAverage[0]?.average)} pts`,
        details: worstAverage.map((row) => `<b>${escapeHtml(row.manager)}</b><span>${row.games} recorded games</span>`),
        tone: "is-red",
      }),
      statCard({
        title: "Most brutal schedule",
        value: `${fmt(mostBrutalSchedule[0]?.pointsAgainst)} PA`,
        details: mostBrutalSchedule.map(scheduleDetail),
        tone: "is-red",
      }),
      statCard({
        title: "Easiest schedule",
        value: `${fmt(easiestSchedule[0]?.pointsAgainst)} PA`,
        details: easiestSchedule.map(scheduleDetail),
        tone: "is-green",
      }),
      statCard({
        title: "Best playoff performer",
        value: `${fmt(bestPlayoffPerformer[0]?.average)} pts avg.`,
        details: bestPlayoffPerformer.map(playoffDetail),
        tone: "is-green",
      }),
      statCard({
        title: "Most weekly top-three finishes",
        value: `${topThreeFinishes[0]?.count || 0}`,
        details: topThreeFinishes.map((row) => `<b>${escapeHtml(row.manager)}</b><span>${row.count} weekly top-three ${row.count === 1 ? "finish" : "finishes"}</span>`),
      }),
      statCard({
        title: "Most weekly bottom-three finishes",
        value: `${bottomThreeFinishes[0]?.count || 0}`,
        details: bottomThreeFinishes.map((row) => `<b>${escapeHtml(row.manager)}</b><span>${row.count} weekly bottom-three ${row.count === 1 ? "finish" : "finishes"}</span>`),
        tone: "is-red",
      }),
    ].join("");
  }

  if (allEl) render();
})();
