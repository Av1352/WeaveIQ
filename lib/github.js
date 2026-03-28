const BASE = 'https://api.github.com'

function headers(token) {
    return {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'X-GitHub-Api-Version': '2022-11-28'
    }
}

export async function fetchRepo(owner, repo, token) {
    const res = await fetch(`${BASE}/repos/${owner}/${repo}`, { headers: headers(token) })
    if (!res.ok) throw new Error(`Repo not found (${res.status}) — check the URL or repo visibility`)
    return res.json()
}

export async function fetchClosedPRs(owner, repo, token, limit = 50) {
    const prs = []
    let page = 1
    while (prs.length < limit) {
        const res = await fetch(
            `${BASE}/repos/${owner}/${repo}/pulls?state=closed&per_page=100&page=${page}&sort=updated&direction=desc`,
            { headers: headers(token) }
        )
        if (!res.ok) break
        const data = await res.json()
        if (!data.length) break
        prs.push(...data.filter(pr => pr.merged_at))
        if (data.length < 100 || prs.length >= limit) break
        page++
    }
    return prs.slice(0, limit)
}

export async function fetchPRReviews(owner, repo, prNumber, token) {
    const res = await fetch(
        `${BASE}/repos/${owner}/${repo}/pulls/${prNumber}/reviews`,
        { headers: headers(token) }
    )
    if (!res.ok) return []
    return res.json()
}

export async function fetchPRFiles(owner, repo, prNumber, token) {
    const res = await fetch(
        `${BASE}/repos/${owner}/${repo}/pulls/${prNumber}/files`,
        { headers: headers(token) }
    )
    if (!res.ok) return []
    return res.json()
}