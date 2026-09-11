(function () {
  const data = window.WAXBALL_H2H_DATA || { managers: [], matchups: [] };
  const managers = [...data.managers].sort((a, b) => a.localeCompare(b));
  const matchups = data.matchups || [];

  const FINAL_FINISH = {
    2024: {
      "Christian Engelhardt": "Champion",
      "Erik Ohno Dagoberg": "2nd",
      "Travis Roy Rogers": "3rd",
      "Sam Labovitz": "4th",
      "Nic Hamilton": "5th",
      "Miles Blue": "6th",
      "Will Price": "7th",
      "Miles Elliot": "8th",
      "Jakob Cooper": "9th",
      "Jacob Moskovitz": "Shit King",
    },
    2025: {
      "Milo Manheim": "Champion",
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
      "Jakob Cooper": "Shit King",
    },
  };

  const bubbleGrid = document.querySelector("#manager-bubble-grid");
  const databaseEl = document.querySelector("#manager-database");

  const MANAGER_COLORS = {
    "Christian Engelhardt": "255, 20, 147",
    "Erik Ohno Dagoberg": "176, 32, 64",
    "Jacob Moskovitz": "34, 197, 94",
    "Jakob Cooper": "192, 192, 192",
    "Miles Blue": "86, 185, 255",
    "Miles Elliot": "255, 184, 77",
    "Milo Manheim": "255, 93, 120",
    "Nic Hamilton": "0, 206, 184",
    "Paul Legallet": "250, 204, 21",
    "Sam Labovitz": "255, 138, 31",
    "Travis Roy Rogers": "168, 85, 247",
    "Will Price": "245, 248, 251",
  };

  const fmt = (value, digits = 2) => Number(value || 0).toFixed(digits);
  const pts = (value) => `${fmt(value)} pts`;
  const managerColor = (manager) => MANAGER_COLORS[manager] || "0, 206, 184";
  const managerStyle = (manager) => {
    const color = managerColor(manager);
    const [r, g, b] = color.split(",").map((part) => Number(part.trim()));
    const readable = ((r * 299 + g * 587 + b * 114) / 1000) < 70 ? "245, 248, 251" : color;
    return `--manager-color-rgb: ${color}; --manager-color: rgb(${color}); --manager-readable-color: rgb(${readable});`;
  };
  const slug = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const initials = (name) => name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  const escapeHtml = (value = "") => String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#039;",
  }[char]));

  const isRegular = (game) => String(game.stage || "").toLowerCase() === "regular season";
  const managerRows = (manager) => matchups.flatMap((game) => {
    const index = game.managers.indexOf(manager);
    if (index === -1) return [];
    const other = index === 0 ? 1 : 0;
    const points = Number(game.scores[index]);
    const opponentPoints = Number(game.scores[other]);
    return [{
      game,
      manager,
      team: game.teams[index],
      opponent: game.managers[other],
      opponentTeam: game.teams[other],
      points,
      opponentPoints,
      result: points > opponentPoints ? "W" : "L",
      margin: points - opponentPoints,
    }];
  });

  function seasonStandingMaps() {
    const bySeason = new Map();
    matchups.filter(isRegular).forEach((game) => {
      if (!bySeason.has(game.season)) bySeason.set(game.season, new Map());
      game.managers.forEach((manager, index) => {
        const map = bySeason.get(game.season);
        if (!map.has(manager)) map.set(manager, { manager, wins: 0, losses: 0, pf: 0, pa: 0 });
        const row = map.get(manager);
        const points = Number(game.scores[index]);
        const opp = Number(game.scores[index === 0 ? 1 : 0]);
        row.wins += points > opp ? 1 : 0;
        row.losses += points < opp ? 1 : 0;
        row.pf += points;
        row.pa += opp;
      });
    });

    const finishMaps = new Map();
    bySeason.forEach((map, season) => {
      const ranked = [...map.values()].sort((a, b) => b.wins - a.wins || b.pf - a.pf || a.manager.localeCompare(b.manager));
      finishMaps.set(season, new Map(ranked.map((row, index) => [row.manager, ordinal(index + 1)])));
    });
    return finishMaps;
  }

  function ordinal(n) {
    const suffix = n % 10 === 1 && n % 100 !== 11 ? "st" : n % 10 === 2 && n % 100 !== 12 ? "nd" : n % 10 === 3 && n % 100 !== 13 ? "rd" : "th";
    return `${n}${suffix}`;
  }

  const regularFinishMaps = seasonStandingMaps();

  function seasonSummary(manager, season) {
    const rows = managerRows(manager).filter((row) => row.game.season === season);
    if (!rows.length) return null;
    const regularRows = rows.filter((row) => isRegular(row.game));
    const playoffRows = rows.filter((row) => !isRegular(row.game));
    const total = rows.reduce((sum, row) => sum + row.points, 0);
    const against = rows.reduce((sum, row) => sum + row.opponentPoints, 0);
    const regularWins = regularRows.filter((row) => row.result === "W").length;
    const playoffWins = playoffRows.filter((row) => row.result === "W").length;
    const high = rows.reduce((best, row) => !best || row.points > best.points ? row : best, null);
    const low = rows.reduce((worst, row) => !worst || row.points < worst.points ? row : worst, null);
    const teams = [...new Set(rows.map((row) => row.team).filter(Boolean))];

    return {
      season,
      games: rows.length,
      wins: rows.filter((row) => row.result === "W").length,
      losses: rows.filter((row) => row.result === "L").length,
      regularWins,
      regularLosses: regularRows.length - regularWins,
      playoffWins,
      playoffLosses: playoffRows.length - playoffWins,
      pf: total,
      pa: against,
      average: total / rows.length,
      regularFinish: regularFinishMaps.get(season)?.get(manager) || "--",
      finalFinish: FINAL_FINISH[season]?.[manager] || "--",
      high,
      low,
      teams,
    };
  }

  function buildProfile(manager) {
    const rows = managerRows(manager);
    const seasons = [...new Set(rows.map((row) => row.game.season))].sort();
    const summaries = seasons.map((season) => seasonSummary(manager, season)).filter(Boolean);
    const wins = rows.filter((row) => row.result === "W").length;
    const total = rows.reduce((sum, row) => sum + row.points, 0);
    const against = rows.reduce((sum, row) => sum + row.opponentPoints, 0);
    const high = rows.reduce((best, row) => !best || row.points > best.points ? row : best, null);
    const low = rows.reduce((worst, row) => !worst || row.points < worst.points ? row : worst, null);
    const playoffRows = rows.filter((row) => !isRegular(row.game));
    const playoffWins = playoffRows.filter((row) => row.result === "W").length;

    return {
      manager,
      initials: initials(manager),
      seasons: summaries,
      games: rows.length,
      wins,
      losses: rows.length - wins,
      pf: total,
      pa: against,
      average: rows.length ? total / rows.length : 0,
      playoffRecord: `${playoffWins}-${playoffRows.length - playoffWins}`,
      high,
      low,
    };
  }

  function gameLine(row) {
    if (!row) return "--";
    return `${row.game.season} Week ${row.game.week} vs ${row.opponent} (${pts(row.points)}-${pts(row.opponentPoints)})`;
  }

  function rankRows(rawRows, mode = "desc") {
    const rows = [...rawRows].sort((a, b) => {
      const valueDiff = mode === "asc" ? a.value - b.value : b.value - a.value;
      return valueDiff || a.manager.localeCompare(b.manager);
    });
    let lastValue = null;
    let lastRank = 0;
    return rows.map((row, index) => {
      const tied = lastValue !== null && Math.abs(row.value - lastValue) < 0.005;
      const rank = tied ? lastRank : index + 1;
      lastValue = row.value;
      lastRank = rank;
      return { ...row, rank };
    });
  }

  function buildLeaderboards() {
    const profiles = managers.map(buildProfile).filter((profile) => profile.games);
    const ratio = (top, bottom) => bottom ? top / bottom : 0;
    return {
      record: {
        title: "All-Time Record",
        rows: rankRows(profiles.map((profile) => ({
          manager: profile.manager,
          value: ratio(profile.wins, profile.games),
          display: `${profile.wins}-${profile.losses} (${Math.round(ratio(profile.wins, profile.games) * 100)}%)`,
        }))),
      },
      average: {
        title: "Average Score",
        rows: rankRows(profiles.map((profile) => ({
          manager: profile.manager,
          value: profile.average,
          display: pts(profile.average),
        }))),
      },
      pf: {
        title: "All-Time Points For",
        rows: rankRows(profiles.map((profile) => ({
          manager: profile.manager,
          value: profile.pf,
          display: pts(profile.pf),
        }))),
      },
      pa: {
        title: "All-Time Points Against",
        rows: rankRows(profiles.map((profile) => ({
          manager: profile.manager,
          value: profile.pa,
          display: pts(profile.pa),
        }))),
      },
      avgPa: {
        title: "Average Points Against",
        rows: rankRows(profiles.map((profile) => ({
          manager: profile.manager,
          value: profile.games ? profile.pa / profile.games : 0,
          display: pts(profile.games ? profile.pa / profile.games : 0),
        }))),
      },
      pointDiff: {
        title: "All-Time Point Difference",
        rows: rankRows(profiles.map((profile) => {
          const diff = profile.pf - profile.pa;
          return {
            manager: profile.manager,
            value: diff,
            display: `${diff >= 0 ? "+" : "-"}${pts(Math.abs(diff))}`,
          };
        })),
      },
      playoff: {
        title: "Playoff/Toilet Bowl Record",
        rows: rankRows(profiles.map((profile) => {
          const [wins, losses] = profile.playoffRecord.split("-").map(Number);
          const games = wins + losses;
          return {
            manager: profile.manager,
            value: ratio(wins, games),
            display: `${profile.playoffRecord} (${games ? Math.round((wins / games) * 100) : 0}%)`,
          };
        })),
      },
      high: {
        title: "Highest Personal Score",
        rows: rankRows(profiles.map((profile) => ({
          manager: profile.manager,
          value: profile.high?.points || 0,
          display: `${pts(profile.high?.points)} - ${gameLine(profile.high)}`,
        }))),
      },
      low: {
        title: "Lowest Personal Score",
        rows: rankRows(profiles.map((profile) => ({
          manager: profile.manager,
          value: profile.low?.points || 0,
          display: `${pts(profile.low?.points)} - ${gameLine(profile.low)}`,
        })), "asc"),
      },
    };
  }

  function rankBadge(leaderboards, key, manager) {
    const board = leaderboards[key];
    const row = board?.rows.find((item) => item.manager === manager);
    if (!row) return "";
    const inverted = key === "pa" || key === "avgPa";
    const rankClass = row.rank === 1
      ? (inverted ? " is-red" : " is-gold")
      : row.rank === managers.length
        ? (inverted ? " is-gold" : " is-red")
        : "";
    return `<button class="manager-rank-button${rankClass}" type="button" data-rank-key="${key}">Rank #${row.rank}</button>`;
  }

  function statCard(label, value, leaderboards, key, manager) {
    return `
      <article>
        <span>${label}</span>
        <strong>${value}</strong>
        ${rankBadge(leaderboards, key, manager)}
      </article>
    `;
  }

  function finishClass(finish) {
    if (finish === "Champion") return "is-gold";
    if (finish === "Shit King") return "is-brown";
    return "";
  }

  function renderBubbles() {
    bubbleGrid.innerHTML = managers.map((manager) => {
      const profile = buildProfile(manager);
      return `
        <button class="manager-bubble" type="button" data-manager="${escapeHtml(manager)}" style="${managerStyle(manager)}" aria-label="Open ${escapeHtml(manager)} database">
          <span>${escapeHtml(profile.initials)}</span>
          <strong>${escapeHtml(manager.split(" ")[0])}</strong>
        </button>
      `;
    }).join("");
  }

  function renderProfile(manager) {
    const profile = buildProfile(manager);
    const leaderboards = buildLeaderboards();
    databaseEl.setAttribute("style", managerStyle(manager));
    const seasonCards = profile.seasons.map((season) => `
      <article class="manager-season-card">
        <span>${season.season}</span>
        <strong class="${finishClass(season.finalFinish)}">${escapeHtml(season.finalFinish)}</strong>
        <dl>
          <div><dt>Regular</dt><dd>${season.regularWins}-${season.regularLosses}, ${season.regularFinish}</dd></div>
          <div><dt>Playoffs</dt><dd>${season.playoffWins}-${season.playoffLosses}</dd></div>
          <div><dt>Avg</dt><dd>${pts(season.average)}</dd></div>
          <div><dt>Point Differential</dt><dd>${season.pf >= season.pa ? "+" : "-"}${pts(Math.abs(season.pf - season.pa))}</dd></div>
        </dl>
      </article>
    `).join("");

    databaseEl.innerHTML = `
      <article class="manager-profile-card" id="${slug(manager)}">
        <header class="manager-profile-head">
          <span class="manager-profile-avatar">${escapeHtml(profile.initials)}</span>
          <div>
            <p class="eyebrow">Manager database</p>
            <h2>${escapeHtml(profile.manager)}</h2>
          </div>
        </header>
        <p class="manager-rank-hint">Click Rank for full standings</p>

        <section class="manager-stat-strip" aria-label="${escapeHtml(manager)} all-time stats">
          ${statCard("All-time record", `${profile.wins}-${profile.losses}`, leaderboards, "record", manager)}
          ${statCard("Average score", pts(profile.average), leaderboards, "average", manager)}
          ${statCard("Points for", pts(profile.pf), leaderboards, "pf", manager)}
          ${statCard("Points against", pts(profile.pa), leaderboards, "pa", manager)}
          ${statCard("Average points against", pts(profile.games ? profile.pa / profile.games : 0), leaderboards, "avgPa", manager)}
          ${statCard("Point difference", `${profile.pf >= profile.pa ? "+" : "-"}${pts(Math.abs(profile.pf - profile.pa))}`, leaderboards, "pointDiff", manager)}
          ${statCard("Playoff record", profile.playoffRecord, leaderboards, "playoff", manager)}
        </section>

        <section class="manager-high-low" aria-label="${escapeHtml(manager)} best and worst games">
          <article>
            <span>Highest score</span>
            <strong>${pts(profile.high?.points)}</strong>
            ${rankBadge(leaderboards, "high", manager)}
            <p>${escapeHtml(gameLine(profile.high))}</p>
          </article>
          <article>
            <span>Lowest score</span>
            <strong>${pts(profile.low?.points)}</strong>
            ${rankBadge(leaderboards, "low", manager)}
            <p>${escapeHtml(gameLine(profile.low))}</p>
          </article>
        </section>

        <div class="manager-section-divider" aria-hidden="true"></div>

        <section class="manager-season-grid" aria-label="${escapeHtml(manager)} season history">
          ${seasonCards}
        </section>
      </article>
    `;

    document.querySelectorAll(".manager-bubble").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.manager === manager);
    });
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
        <p class="eyebrow">League Rank</p>
        <h3>${escapeHtml(board.title)}</h3>
        ${board.note ? `<p class="manager-rank-note">${escapeHtml(board.note)}</p>` : ""}
        <ol class="manager-rank-list">
          ${board.rows.map((row) => `
            <li class="${row.manager === activeManager ? "is-active" : ""}" style="${managerStyle(row.manager)}">
              <span>#${row.rank}</span>
              <strong>${escapeHtml(row.manager)}</strong>
              <em>${escapeHtml(row.display)}</em>
            </li>
          `).join("")}
        </ol>
      </div>
    `;
    popover.removeAttribute("hidden");
  }

  function openManager(manager, shouldScroll = true) {
    if (!managers.includes(manager)) return;
    renderProfile(manager);
    history.replaceState(null, "", `#${slug(manager)}`);
    if (shouldScroll) databaseEl.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  renderBubbles();
  const hashManager = managers.find((manager) => slug(manager) === location.hash.slice(1));
  if (hashManager) renderProfile(hashManager);

  bubbleGrid.addEventListener("click", (event) => {
    const button = event.target.closest(".manager-bubble");
    if (!button) return;
    openManager(button.dataset.manager);
  });

  databaseEl.addEventListener("click", (event) => {
    const button = event.target.closest("[data-rank-key]");
    if (!button) return;
    const active = document.querySelector(".manager-bubble.is-active")?.dataset.manager || managers[0];
    showLeaderboard(button.dataset.rankKey, active);
  });

  document.addEventListener("click", (event) => {
    const popover = document.querySelector("#manager-rank-popover");
    if (!popover || popover.hasAttribute("hidden")) return;
    if (event.target.closest(".manager-rank-close") || event.target === popover) {
      popover.setAttribute("hidden", "");
    }
  });
})();
