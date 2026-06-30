/* GitHub User Search — uses free GitHub REST API (60 req/hr without token) */
(() => {
  "use strict";
  const $ = (s) => document.querySelector(s);
  const RECENT_KEY = "gh-search.recent";
  const THEME_KEY = "gh-search.theme";
  const API = "https://api.github.com";
  let recent = [];
  try { recent = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]"); } catch {}

  async function ghFetch(path) {
    const r = await fetch(`${API}${path}`, { headers: { Accept: "application/vnd.github+json" } });
    if (r.status === 403) {
      const remaining = r.headers.get("X-RateLimit-Remaining");
      const reset = r.headers.get("X-RateLimit-Reset");
      const resetTime = reset ? new Date(parseInt(reset) * 1000).toLocaleTimeString() : "later";
      throw new Error(`Rate limit exceeded (${remaining || 0} remaining). Resets at ${resetTime}. Add a token to .env to increase to 5000/hr.`);
    }
    if (r.status === 404) throw new Error("User not found");
    if (!r.ok) throw new Error(`GitHub API error: ${r.status}`);
    return r.json();
  }

  async function searchUser(username) {
    showLoading(true); hideError();
    try {
      const user = await ghFetch(`/users/${encodeURIComponent(username)}`);
      // Fetch top repos (sorted by stars — GitHub API doesn't support sort=stars for user repos directly, so we fetch and sort)
      const repos = await ghFetch(`/users/${encodeURIComponent(username)}/repos?per_page=100&sort=updated`);
      repos.sort((a, b) => b.stargazers_count - a.stargazers_count);
      renderProfile(user, repos.slice(0, 12));
      addRecent(username);
      checkRateLimit();
    } catch (err) {
      showError(err.message);
    } finally {
      showLoading(false);
    }
  }

  function renderProfile(user, repos) {
    $("#profile").hidden = false;
    $("#avatar").src = user.avatar_url;
    $("#avatar").alt = user.login;
    $("#name").textContent = user.name || user.login;
    $("#login").textContent = `@${user.login}`;
    $("#bio").textContent = user.bio || "No bio available";
    $("#location").textContent = user.location ? `📍 ${user.location}` : "📍 —";
    $("#company").textContent = user.company ? `🏢 ${user.company}` : "🏢 —";
    $("#blog").innerHTML = user.blog ? `🔗 <a href="${user.blog}" target="_blank" rel="noopener">${user.blog}</a>` : "🔗 —";
    $("#joined").textContent = `📅 Joined ${new Date(user.created_at).toLocaleDateString()}`;
    $("#repos").textContent = user.public_repos;
    $("#followers").textContent = user.followers;
    $("#following").textContent = user.following;
    $("#gists").textContent = user.public_gists;

    const list = $("#reposList");
    list.innerHTML = "";
    if (repos.length === 0) {
      list.innerHTML = '<div style="color:var(--fg-muted);padding:12px">No public repositories</div>';
      return;
    }
    repos.forEach((r) => {
      const a = document.createElement("a");
      a.className = "repo";
      a.href = r.html_url;
      a.target = "_blank";
      a.rel = "noopener";
      a.innerHTML = `
        <div class="repo__name">${escapeHtml(r.name)}</div>
        <div class="repo__desc">${escapeHtml(r.description || "No description")}</div>
        <div class="repo__meta">
          <span>⭐ ${r.stargazers_count}</span>
          <span>🍴 ${r.forks_count}</span>
          <span>${r.language || "—"}</span>
        </div>`;
      list.appendChild(a);
    });
  }

  function addRecent(username) {
    recent = [username, ...recent.filter((r) => r !== username)].slice(0, 8);
    localStorage.setItem(RECENT_KEY, JSON.stringify(recent));
    renderRecent();
  }
  function renderRecent() {
    if (recent.length === 0) { $("#recent").hidden = true; return; }
    $("#recent").hidden = false;
    const list = $("#recentList");
    list.innerHTML = "";
    recent.forEach((u) => {
      const chip = document.createElement("button");
      chip.className = "recent__chip";
      chip.type = "button";
      chip.textContent = u;
      chip.addEventListener("click", () => { $("#usernameInput").value = u; searchUser(u); });
      list.appendChild(chip);
    });
  }

  async function checkRateLimit() {
    try {
      const r = await fetch(`${API}/rate_limit`);
      const d = await r.json();
      const core = d.resources.core;
      $("#rateLimit").hidden = core.remaining > 10;
      if (core.remaining <= 10) {
        $("#rateLimit").textContent = `⚠️ GitHub API rate limit: ${core.remaining}/${core.limit} requests remaining this hour.`;
      }
    } catch {}
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  function showLoading(yes) { $("#loading").hidden = !yes; }
  function showError(msg) { $("#error").textContent = "⚠️ " + msg; $("#error").hidden = false; }
  function hideError() { $("#error").hidden = true; }

  // Events
  $("#searchForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const u = $("#usernameInput").value.trim();
    if (u) searchUser(u);
  });

  // Theme
  const applyTheme = (t) => {
    document.documentElement.setAttribute("data-theme", t);
    $("#themeToggle").textContent = t === "light" ? "☀️" : "🌙";
  };
  const saved = localStorage.getItem(THEME_KEY);
  applyTheme(saved || (matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark"));
  $("#themeToggle").addEventListener("click", () => {
    const cur = document.documentElement.getAttribute("data-theme") || "dark";
    const next = cur === "dark" ? "light" : "dark";
    applyTheme(next);
    localStorage.setItem(THEME_KEY, next);
  });

  // Init
  renderRecent();
  checkRateLimit();
  // Default user
  searchUser("torvalds");
})();
