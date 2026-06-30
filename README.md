# GitHub User Search

> Search GitHub users, view their profile details, and explore their top repositories. Uses the free GitHub REST API.

![CI](https://github.com/arjundroid12/github-user-search/actions/workflows/ci.yml/badge.svg)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

## ✨ Features

- **Search any GitHub user** by username
- **Profile details** — avatar, name, bio, location, company, blog, join date
- **Stats** — repos, followers, following, gists counts
- **Top 12 repositories** — sorted by stars, with description, language, stars, forks
- **Rate limit indicator** — warns when remaining API requests are low
- **Recent searches** — last 8 usernames saved, click to re-fetch
- **Smart error handling** — 404, rate limit, and network errors handled gracefully

## ⚠️ API Rate Limit Note

The GitHub REST API allows **60 requests/hour** without authentication. To increase to **5,000/hour**:

1. Generate a personal access token at https://github.com/settings/tokens
2. Add it to your requests (modify `assets/app.js`):
   ```js
   headers: { Authorization: 'Bearer YOUR_TOKEN' }
   ```
3. **Never commit your token** — use environment variables

## 🚀 Live Demo

| Host | URL | Notes |
|------|-----|-------|
| 🥇 Surge.sh | https://arjun-gh-search.surge.sh | Bangalore edge — best for India |
| 🥈 GitHub Pages | https://arjundroid12.github.io/github-user-search/ | May be blocked by some Indian ISPs |

## 📦 Run Locally

```bash
git clone https://github.com/arjundroid12/github-user-search.git
cd github-user-search
python3 -m http.server 8000
```

## 📄 License

MIT © Arjun Vashishtha
