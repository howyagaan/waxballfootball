(() => {
  const managerAliases = {
    "Christian Engelhardt": ["Christian Engelhardt", "Steeler Virginity", "Christian"],
    "Erik Ohno Dagoberg": ["Erik Ohno Dagoberg", "Pamela Mari Ohno Dagoberg", "Erik"],
    "Jacob Moskovitz": ["Jacob Moskovitz", "poonfullofsugar", "Mosko"],
    "Jakob Cooper": ["Jakob Cooper", "Papi Coop", "Havi"],
    "Miles Blue": ["Miles Blue", "blueballs", "Miles B", "Blue"],
    "Miles Elliot": ["Miles Elliot", "Daddy Campbell", "Miles E", "Miles"],
    "Milo Manheim": ["Milo Manheim", "Nacua Matata", "Milo"],
    "Nic Hamilton": ["Nic Hamilton", "Stat Fag", "Nic"],
    "Paul Legallet": ["Paul Legallet", "helloimpaul", "Paul"],
    "Sam Labovitz": ["Sam Labovitz", "mistahbigdick", "Sam"],
    "Travis Roy Rogers": ["Travis Roy Rogers", "darryluvr3000", "Travis", "Trav"],
    "Will Price": ["Will Price", "poon messiah", "Will"],
  };
  const managerColors = {
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
  const aliasToManager = new Map();
  Object.entries(managerAliases).forEach(([manager, aliases]) => {
    aliases.forEach((alias) => aliasToManager.set(alias, manager));
  });
  const escapedAliases = [...aliasToManager.keys()]
    .sort((a, b) => b.length - a.length)
    .map((alias) => alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const aliasPattern = new RegExp(`\\b(${escapedAliases.join("|")})\\b`, "g");

  function colorManagerNames(root = document.querySelector(".wax-article-page")) {
    if (!root) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!aliasPattern.test(node.nodeValue || "")) {
          aliasPattern.lastIndex = 0;
          return NodeFilter.FILTER_REJECT;
        }
        aliasPattern.lastIndex = 0;
        const parent = node.parentElement;
        if (!parent || parent.closest("script, style, .article-manager-name, .article-matchup-panel")) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      },
    });
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);

    textNodes.forEach((node) => {
      const fragment = document.createDocumentFragment();
      const text = node.nodeValue || "";
      let cursor = 0;
      aliasPattern.lastIndex = 0;
      for (const match of text.matchAll(aliasPattern)) {
        fragment.append(document.createTextNode(text.slice(cursor, match.index)));
        const alias = match[0];
        const manager = aliasToManager.get(alias);
        const span = document.createElement("span");
        span.className = "article-manager-name";
        span.dataset.manager = manager;
        span.style.setProperty("--article-manager-color", `rgb(${managerColors[manager]})`);
        span.textContent = alias;
        fragment.append(span);
        cursor = match.index + alias.length;
      }
      fragment.append(document.createTextNode(text.slice(cursor)));
      node.replaceWith(fragment);
    });
  }

  colorManagerNames();
  new MutationObserver(() => colorManagerNames()).observe(document.querySelector(".wax-article-page") || document.body, {
    childList: true,
    subtree: true,
  });
})();
