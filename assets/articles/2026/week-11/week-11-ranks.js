(function () {
  const data = window.WAXBALL_H2H_DATA || { managers: [], matchups: [] };
  const managers = [...data.managers].sort((a, b) => a.localeCompare(b));
  const EPSILON = 0.005;
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

  const matchups = data.matchups || [];
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
        .filter((row) => row.manager === manager && row.game.stage === "Regular season")
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
    const firstPlaceCounts = new Map();
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
    const careerHighRows = managers.map((manager) => {
      const highest = rows.filter((row) => row.manager === manager).sort((a, b) => b.points - a.points)[0];
      return { manager, value: highest.points, display: `${fmt(highest.points)}pts - ${highest.game.season} W${highest.game.week}` };
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
    const standingsPositionTotals = new Map();
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
        const standings = [...seasonManagers].sort((a, b) => {
          const first = totals.get(a);
          const second = totals.get(b);
          return second.wins - first.wins || first.losses - second.losses || second.pf - first.pf;
        });
        firstPlaceCounts.set(standings[0], (firstPlaceCounts.get(standings[0]) || 0) + 1);
        standings.forEach((manager, index) => {
          const totals = standingsPositionTotals.get(manager) || { position: 0, weeks: 0 };
          totals.position += index + 1;
          totals.weeks += 1;
          standingsPositionTotals.set(manager, totals);
        });
        standings.slice(0, 3).forEach((manager) => {
          standingsPodiumCounts.set(manager, (standingsPodiumCounts.get(manager) || 0) + 1);
        });
      }
    });
    const highestLossRows = rows
      .filter((row) => row.points < row.oppPoints)
      .map((row) => ({ manager: row.manager, value: row.points, display: `${fmt(row.points)}pts - ${row.game.season} W${row.game.week} vs ${row.opponent}` }));
    const lowestScoreRows = rows.map((row) => ({
      manager: row.manager,
      value: row.points,
      display: `${fmt(row.points)}pts - ${row.game.season} W${row.game.week} vs ${row.opponent}`,
    }));
    const allPlay2026w8 = managers.map((manager) => {
      let wins = 0;
      let losses = 0;
      for (let week = 1; week <= 8; week += 1) {
        const weekRows = rows.filter((row) => Number(row.game.season) === 2026 && Number(row.game.week) === week);
        const managerRow = weekRows.find((row) => row.manager === manager);
        if (!managerRow) continue;
        weekRows.filter((row) => row.manager !== manager).forEach((row) => {
          if (managerRow.points > row.points) wins += 1;
          else if (managerRow.points < row.points) losses += 1;
        });
      }
      return { manager, value: wins, display: `${wins}-${losses}` };
    });
    const allPlay2026w9 = managers.map((manager) => {
      let wins = 0;
      let losses = 0;
      for (let week = 1; week <= 9; week += 1) {
        const weekRows = rows.filter((row) => Number(row.game.season) === 2026 && Number(row.game.week) === week);
        const managerRow = weekRows.find((row) => row.manager === manager);
        if (!managerRow) continue;
        weekRows.filter((row) => row.manager !== manager).forEach((row) => {
          if (managerRow.points > row.points) wins += 1;
          else if (managerRow.points < row.points) losses += 1;
        });
      }
      return { manager, value: wins, display: `${wins}-${losses}` };
    });
    const allPlay2026w10 = managers.map((manager) => {
      let wins = 0;
      let losses = 0;
      for (let week = 1; week <= 10; week += 1) {
        const weekRows = rows.filter((row) => Number(row.game.season) === 2026 && Number(row.game.week) === week);
        const managerRow = weekRows.find((row) => row.manager === manager);
        if (!managerRow) continue;
        weekRows.filter((row) => row.manager !== manager).forEach((row) => {
          if (managerRow.points > row.points) wins += 1;
          else if (managerRow.points < row.points) losses += 1;
        });
      }
      return { manager, value: wins, display: `${wins}-${losses}` };
    });
    const heaviestDefeatRows = managers.map((manager) => {
      const defeat = rows
        .filter((row) => row.manager === manager && row.points < row.oppPoints)
        .sort((a, b) => (b.oppPoints - b.points) - (a.oppPoints - a.points))[0];
      const value = defeat.oppPoints - defeat.points;
      return { manager, value, display: `${fmt(value)}pts - ${defeat.game.season} W${defeat.game.week} vs ${defeat.opponent}` };
    });
    const activeWinningStreakRows = managers.map((manager) => {
      const managerRows = rows
        .filter((row) => row.manager === manager && Number(row.game.season) === 2026 && row.game.stage === "Regular season" && Number(row.game.week) <= 11)
        .sort((a, b) => Number(b.game.week) - Number(a.game.week));
      let value = 0;
      for (const row of managerRows) {
        if (row.points <= row.oppPoints) break;
        value += 1;
      }
      return { manager, value, display: `${value} active win${value === 1 ? "" : "s"}` };
    }).filter((row) => row.value > 0);
    const pfThroughWeek10Rows = [];
    [...new Set(rows.filter((row) => row.game.stage === "Regular season").map((row) => Number(row.game.season)))].forEach((season) => {
      managers.forEach((manager) => {
        const managerRows = rows.filter((row) => row.manager === manager && Number(row.game.season) === season && Number(row.game.week) <= 10 && row.game.stage === "Regular season");
        if (!managerRows.length) return;
        const value = managerRows.reduce((sum, row) => sum + row.points, 0);
        pfThroughWeek10Rows.push({ manager, value, display: `${pts(value)} - ${season}` });
      });
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
      standings2026w9: { title: "Week 9 Standings", rows: rankRows(standingsThroughWeek(9)) },
      standings2026w10: { title: "Week 10 Standings", rows: rankRows(standingsThroughWeek(10)) },
      weekScore2026w2: { title: "Week 2 Scores", rows: rankRows(rows.filter((row) => Number(row.game.season) === 2026 && Number(row.game.week) === 2).map((row) => ({ manager: row.manager, value: row.points, display: pts(row.points) }))) },
      weekScore2025w12: { title: "2025 Week 12 Scores", rows: rankRows(rows.filter((row) => Number(row.game.season) === 2025 && Number(row.game.week) === 12).map((row) => ({ manager: row.manager, value: row.points, display: pts(row.points) }))) },
      closestMargins: {
        title: "Closest Games in Waxball History",
        rows: rankRows(matchups.map((game) => {
          const winner = game.scores[1] > game.scores[0] ? 1 : 0;
          const value = Math.abs(game.scores[0] - game.scores[1]);
          return { manager: game.managers[winner], value,
            display: `${fmt(value)}pts vs ${game.managers[1 - winner]} · ${game.season} W${game.week}` };
        }), "asc").slice(0, 15),
      },
      allPlay2026w11: {
        title: "2026 All-Play Through Week 11",
        rows: rankRows(managers.map((manager) => {
          let wins = 0, losses = 0, ties = 0;
          for (let week = 1; week <= 11; week += 1) {
            const scores = rows.filter((row) => row.game.season === 2026 && row.game.week === week);
            const own = scores.find((row) => row.manager === manager);
            for (const row of scores) {
              if (row.manager === manager) continue;
              if (own.points > row.points) wins += 1;
              else if (own.points < row.points) losses += 1;
              else ties += 1;
            }
          }
          return { manager, value: wins + ties / 2, display: `${wins}-${losses}${ties ? "-" + ties : ""}` };
        })),
      },
      pa2026w11: {
        title: "2026 Points Against Through Week 11",
        rows: rankRows(managers.map((manager) => {
          const value = rows.filter((row) => row.manager === manager && row.game.season === 2026 && row.game.week <= 11)
            .reduce((sum, row) => sum + row.oppPoints, 0);
          return { manager, value, display: pts(value) };
        })),
      },
      weekScore2026w11: {
        title: "2026 Week 11 Scores",
        rows: rankRows(rows.filter((row) => row.game.season === 2026 && row.game.week === 11)
          .map((row) => ({ manager: row.manager, value: row.points, display: pts(row.points) }))),
      },
      weekMargin2026w11: {
        title: "2026 Week 11 Win Margins",
        rows: rankRows(rows.filter((row) => row.game.season === 2026 && row.game.week === 11 && row.points > row.oppPoints)
          .map((row) => ({ manager: row.manager, value: row.points - row.oppPoints, display: pts(row.points - row.oppPoints) }))),
      },
      pf2026w11: {
        title: "2026 Points For Through Week 11",
        rows: rankRows(managers.map((manager) => {
          const value = rows.filter((row) => row.manager === manager && row.game.season === 2026 && row.game.week <= 11)
            .reduce((sum, row) => sum + row.points, 0);
          return { manager, value, display: pts(value) };
        })),
      },
      weekScore2026w9: { title: "Week 9 Scores", rows: rankRows(rows.filter((row) => Number(row.game.season) === 2026 && Number(row.game.week) === 9).map((row) => ({ manager: row.manager, value: row.points, display: pts(row.points) }))) },
      pa2026w2: { title: "2026 Points Against Through Week 2", rows: rankRows(profiles.map((profile) => {
        const value = rows.filter((row) => row.manager === profile.manager && Number(row.game.season) === 2026 && Number(row.game.week) <= 2).reduce((sum, row) => sum + row.oppPoints, 0);
        return { manager: profile.manager, value, display: pts(value) };
      })) },
      weekToWeekDrop: { title: "Largest Week-to-Week Scoring Drops", rows: rankRows(weekToWeekDrops) },
      weekToWeekRise: { title: "Largest Week-to-Week Scoring Rebounds", rows: rankRows(weekToWeekRises).slice(0, 10) },
      average: { title: "Average Score", rows: rankRows(profiles.map((profile) => ({ manager: profile.manager, value: profile.average, display: pts(profile.average) }))) },
      pf: { title: "All-Time Points For", rows: rankRows(profiles.map((profile) => ({ manager: profile.manager, value: profile.pf, display: pts(profile.pf) }))) },
      pa: { title: "All-Time Points Against", rows: rankRows(profiles.map((profile) => ({ manager: profile.manager, value: profile.pa, display: pts(profile.pa) }))) },
      pointDiff: { title: "All-Time Point Difference", rows: rankRows(profiles.map((profile) => ({ manager: profile.manager, value: profile.pf - profile.pa, display: `${profile.pf >= profile.pa ? "+" : "-"}${fmt(Math.abs(profile.pf - profile.pa))}` })), "asc") },
      pointDiffHigh: { title: "All-Time Point Difference", rows: rankRows(profiles.map((profile) => ({ manager: profile.manager, value: profile.pf - profile.pa, display: `${profile.pf >= profile.pa ? "+" : "-"}${fmt(Math.abs(profile.pf - profile.pa))}` }))) },
      heaviestDefeats: { title: "Every Manager's Heaviest Defeat", rows: rankRows(heaviestDefeatRows) },
      weeklyTopThree: { title: "Weekly Top-Three Finishes", rows: rankRows(managers.map((manager) => ({ manager, value: topThreeCounts.get(manager) || 0, display: `${topThreeCounts.get(manager) || 0} finishes` }))) },
      weeklyLows: { title: "Most Weekly Low Scores", rows: rankRows(managers.map((manager) => ({ manager, value: weeklyLowCounts.get(manager) || 0, display: `${weeklyLowCounts.get(manager) || 0} weekly lows` }))) },
      averageStandingsPosition: {
        title: "Average Standings Position",
        rows: rankRows([...standingsPositionTotals].map(([manager, totals]) => {
          const value = totals.position / totals.weeks;
          return { manager, value, display: fmt(value) };
        }), "asc"),
      },
      standingsPodiums: { title: "Weeks Ended on the Podium", rows: rankRows(managers.map((manager) => ({ manager, value: standingsPodiumCounts.get(manager) || 0, display: `${standingsPodiumCounts.get(manager) || 0} weeks` }))) },
      weeksFirst: { title: "Weeks Ended in First Place", rows: rankRows(managers.map((manager) => ({ manager, value: firstPlaceCounts.get(manager) || 0, display: `${firstPlaceCounts.get(manager) || 0} week${firstPlaceCounts.get(manager) === 1 ? "" : "s"}` }))) },
      allPlay2026w8: { title: "2026 All-Play Through Week 8", rows: rankRows(allPlay2026w8) },
      allPlay2026w9: { title: "2026 All-Play Through Week 9", rows: rankRows(allPlay2026w9) },
      allPlay2026w10: { title: "2026 All-Play Through Week 10", rows: rankRows(allPlay2026w10) },
      activeWinningStreaks: { title: "Active Regular-Season Winning Streaks", rows: rankRows(activeWinningStreakRows) },
      pfThroughWeek10: { title: "Most Points Through Week 10", rows: rankRows(pfThroughWeek10Rows) },
      pf2026w9: { title: "2026 Points For Through Week 9", rows: rankRows(managers.map((manager) => {
        const value = rows.filter((row) => row.manager === manager && Number(row.game.season) === 2026 && Number(row.game.week) <= 9).reduce((sum, row) => sum + row.points, 0);
        return { manager, value, display: pts(value) };
      })) },
      pf2026w10: { title: "2026 Points For Through Week 10", rows: rankRows(managers.map((manager) => {
        const value = rows.filter((row) => row.manager === manager && Number(row.game.season) === 2026 && Number(row.game.week) <= 10).reduce((sum, row) => sum + row.points, 0);
        return { manager, value, display: pts(value) };
      })) },
      zeroOneWeek9: { title: "Best Week 9 Records After Starting 0-1", rows: rankRows([
        { manager: "Miles Elliot", value: 8, display: "8-1 · 2026" },
        { manager: "Erik Ohno Dagoberg", value: 6, display: "6-3 · 2024" },
        { manager: "Jacob Moskovitz", value: 6, display: "6-3 · 2025" },
        { manager: "Travis Roy Rogers", value: 5, display: "5-4 · 2024" },
        { manager: "Miles Blue", value: 5, display: "5-4 · 2024" },
        { manager: "Erik Ohno Dagoberg", value: 5, display: "5-4 · 2025" },
        { manager: "Will Price", value: 5, display: "5-4 · 2025" },
      ]) },
      benchedWeeklyHigh: { title: "Weekly Top NFL Scorers Benched", rows: [
        { manager: "Nic Hamilton", rank: 1, value: 36.50, display: "Tony Pollard · 36.50pts · 2026 W7 · Won" },
        { manager: "Christian Engelhardt", rank: 2, value: 35.36, display: "C.J. Stroud · 35.36pts · 2026 W9 · Lost" },
      ] },
      playoffDecisionWeeks: { title: "First Playoff Decisions", rows: [
        { manager: "", label: "2024", rank: 1, value: 11, display: "First elimination W11 · first berths W12" },
        { manager: "", label: "2025", rank: 2, value: 12, display: "First elimination and berth W12" },
        { manager: "", label: "2026", rank: 3, value: 14, display: "No decision through W9" },
      ] },
      highestScores: { title: "Highest Scores in Waxball History", rows: rankRows(rows.map((row) => ({ manager: row.manager, value: row.points, display: `${fmt(row.points)}pts - ${row.game.season} W${row.game.week}` }))).slice(0, 15) },
      careerHighs: { title: "Career High Scores", rows: rankRows(careerHighRows) },
      highestLosses: { title: "Highest Scores in a Loss", rows: rankRows(highestLossRows).slice(0, 10) },
      standingsSpreadWeek8: { title: "Closest Standings Through Week 8", rows: rankRows([
        { manager: "", label: "2026", value: 2, display: "2 games between 2nd and last" },
        { manager: "", label: "2025", value: 4, display: "4 games between 2nd and last" },
        { manager: "", label: "2024", value: 6, display: "6 games between 2nd and last" },
      ], "asc") },
      blowoutMargins: { title: "Largest Blowout Margins", rows: rankRows(blowoutRows).slice(0, 14) },
      winningStreaks: { title: "Longest Regular-Season Winning Streaks", rows: denseRankRows(winningStreakRows.filter((row) => row.value >= 4)) },
      careerLows: { title: "Career Low Scores", rows: rankRows(careerLowRows, "asc") },
      lowestScores: { title: "Lowest Scores in Waxball History", rows: rankRows(lowestScoreRows, "asc").slice(0, 15) },
      weeklyHighScores: { title: "Lowest Weekly High Scores", rows: rankRows(weeklyHighScoreRows, "asc") },
      weeklyAverages: { title: "Lowest Weekly League Averages", rows: rankRows(weeklyAverageRows, "asc") },
      weeklyRanges: { title: "Widest Weekly Scoring Ranges", rows: rankRows(weeklyRangeRows).slice(0, 13) },
      highScorerOpponents: { title: "Most Weeks Facing the Weekly High Scorer", rows: rankRows(managers.map((manager) => { const value = highScorerOpponentCounts.get(manager) || 0; return { manager, value, display: `${value} week${value === 1 ? "" : "s"}` }; })) },
      lowScorerOpponents: { title: "Most Weeks Facing the Weekly Low Scorer", rows: rankRows(managers.map((manager) => { const value = lowScorerOpponentCounts.get(manager) || 0; return { manager, value, display: `${value} week${value === 1 ? "" : "s"}` }; })) },
      lastPlaceWeeks: { title: "Weeks Ended in Last Place", rows: rankRows([
        ["Will Price", 14], ["Miles Elliot", 8], ["Travis Roy Rogers", 5], ["Jacob Moskovitz", 4],
        ["Paul Legallet", 2], ["Miles Blue", 1], ["Jakob Cooper", 1], ["Erik Ohno Dagoberg", 1],
      ].map(([manager, value]) => ({ manager, value, display: `${value} week${value === 1 ? "" : "s"}` }))) },
    };
  }

  function showLeaderboard(key, activeManager, activeValue) {
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
            const activeManagers = String(activeManager || "").split("|").filter(Boolean);
            const valueMatches = activeValue === "" || activeValue === undefined || Math.abs(Number(row.value) - Number(activeValue)) < EPSILON;
            const isActive = activeManagers.includes(row.manager) && valueMatches;
            return `
            <li class="${isActive ? "is-active" : ""}" ${isManager ? `style="${managerStyle(row.manager)}" data-manager-profile="${escapeHtml(row.manager)}" role="button" tabindex="0" aria-label="Open ${escapeHtml(row.manager)} database"` : ""}>
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
      showLeaderboard(rankButton.dataset.articleRankKey, rankButton.dataset.articleRankManager || "", rankButton.dataset.articleRankValue);
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
      showLeaderboard(rankButton.dataset.articleRankKey, rankButton.dataset.articleRankManager || "", rankButton.dataset.articleRankValue);
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
