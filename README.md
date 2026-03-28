# WeaveIQ

ML-powered engineering productivity analyzer. Input any public GitHub repo and get real insights — cycle times, reviewer bottlenecks, anomaly detection, and velocity trends — pulled directly from the GitHub API.

Live: https://weaveiq.vercel.app

---

## What It Does

- **Cycle Time Analysis** — mean, median, and P90 merge times across the last 50 PRs
- **Review Bottleneck Detection** — ranks reviewers by avg hours from PR open to first review
- **Anomaly Detection** — flags outlier PRs using IQR statistical method (same approach as production ML monitoring)
- **Merge Velocity** — weekly PR throughput over the last 10 weeks
- **Complexity Scoring** — per-PR complexity score based on file count and change volume
- **Recent PR Table** — every PR with cycle time, complexity, author, and file stats

All data is live from the GitHub API. No fake numbers.

---

## Stack

- **Framework:** Next.js 14 (full-stack — API routes + frontend in one repo)
- **GitHub API:** REST API v3, fetches PRs, reviews, and file diffs
- **Analytics:** Custom IQR anomaly detection, percentile cycle time, bottleneck ranking
- **Deploy:** Vercel (one-click, no separate backend)

---

## Run Locally
```bash
git clone https://github.com/Av1352/weaveiq
cd weaveiq
npm install
cp .env.example .env.local  # add your GITHUB_TOKEN
npm run dev
```

Open `http://localhost:3000`, paste any public GitHub repo URL, hit Analyze.

---

## Deploy

1. Push to GitHub
2. Import repo on Vercel
3. Add env var: `GITHUB_TOKEN=your_token`
4. Deploy

---

## Design Decisions

- **IQR for anomaly detection** — more robust than z-score for skewed PR distributions. Flags both unusually slow and unusually fast merges.
- **P90 cycle time** — median hides long tail. P90 shows what the worst 10% of PRs look like, which is what engineering leaders actually care about.
- **Bottleneck by time-to-review** — reviewer load alone doesn't tell you who's blocking merges. Time from PR open to first review is the real signal.
- **Complexity score** — file count + change volume as a proxy for review burden. Not perfect, but directionally correct and explainable.
- **Next.js full-stack** — no separate backend service. API routes handle GitHub calls server-side so the token never hits the client.

---

Built by Anju Vilashni Nandhakumar — vxanju.com