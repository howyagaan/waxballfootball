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
  ];
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
    return `--manager-color-rgb: ${color}; --manager-color: rgb(${color}); --manager-readable-color: rgb(${readable});`;
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

  function buildLeaderboards() {
    const rows = sideRows();
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
    byWeek.forEach((weekRows) => {
      [...weekRows].sort((a, b) => b.points - a.points).slice(0, 3).forEach((row) => {
        topThreeCounts.set(row.manager, (topThreeCounts.get(row.manager) || 0) + 1);
      });
    });
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
      weekScore2026w2: { title: "Week 2 Scores", rows: rankRows(rows.filter((row) => Number(row.game.season) === 2026 && Number(row.game.week) === 2).map((row) => ({ manager: row.manager, value: row.points, display: pts(row.points) }))) },
      pa2026w2: { title: "2026 Points Against Through Week 2", rows: rankRows(profiles.map((profile) => {
        const value = rows.filter((row) => row.manager === profile.manager && Number(row.game.season) === 2026 && Number(row.game.week) <= 2).reduce((sum, row) => sum + row.oppPoints, 0);
        return { manager: profile.manager, value, display: pts(value) };
      })) },
      weekToWeekDrop: { title: "Largest Week-to-Week Scoring Drops", rows: rankRows(weekToWeekDrops) },
      average: { title: "Average Score", rows: rankRows(profiles.map((profile) => ({ manager: profile.manager, value: profile.average, display: pts(profile.average) }))) },
      pf: { title: "All-Time Points For", rows: rankRows(profiles.map((profile) => ({ manager: profile.manager, value: profile.pf, display: pts(profile.pf) }))) },
      pa: { title: "All-Time Points Against", rows: rankRows(profiles.map((profile) => ({ manager: profile.manager, value: profile.pa, display: pts(profile.pa) }))) },
      pointDiff: { title: "All-Time Point Difference", rows: rankRows(profiles.map((profile) => ({ manager: profile.manager, value: profile.pf - profile.pa, display: `${profile.pf >= profile.pa ? "+" : "-"}${fmt(Math.abs(profile.pf - profile.pa))}` }))) },
      weeklyTopThree: { title: "Weekly Top-Three Finishes", rows: rankRows(managers.map((manager) => ({ manager, value: topThreeCounts.get(manager) || 0, display: `${topThreeCounts.get(manager) || 0} finishes` }))) },
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
        <p class="eyebrow">League Rank</p>
        <h3>${escapeHtml(board.title)}</h3>
        <ol class="manager-rank-list">
          ${board.rows.map((row) => `
            <li class="${row.manager === activeManager ? "is-active" : ""}" style="${managerStyle(row.manager)}" data-manager-profile="${escapeHtml(row.manager)}" role="button" tabindex="0" aria-label="Open ${escapeHtml(row.manager)} database">
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
        if (src) avatar.innerHTML = `<img src="${escapeHtml(src)}" alt="" loading="lazy" />`;
      });
    } catch {
      // Initials remain visible when Sleeper is unavailable.
    }
  }

  hydrateArticleMatchupAvatars();
})();
