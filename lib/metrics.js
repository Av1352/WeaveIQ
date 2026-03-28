export function cycleTimeHours(pr) {
    if (!pr.merged_at) return null
    return (new Date(pr.merged_at) - new Date(pr.created_at)) / 3600000
}

export function mean(arr) {
    return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0
}

export function percentile(arr, p) {
    if (!arr.length) return 0
    const sorted = [...arr].sort((a, b) => a - b)
    const idx = Math.ceil((p / 100) * sorted.length) - 1
    return sorted[Math.max(0, idx)]
}

export function detectAnomalies(items) {
    const times = items.map(i => i.cycleTime).filter(Boolean)
    if (times.length < 4) return []
    const q1 = percentile(times, 25)
    const q3 = percentile(times, 75)
    const iqr = q3 - q1
    const upper = q3 + 1.5 * iqr
    const lower = Math.max(0, q1 - 1.5 * iqr)
    const avg = mean(times)
    return items
        .filter(i => i.cycleTime && (i.cycleTime > upper || i.cycleTime < lower))
        .map(i => ({
            ...i,
            anomalyType: i.cycleTime > upper ? 'SLOW' : 'FAST',
            deviation: i.cycleTime > upper
                ? `${((i.cycleTime / avg - 1) * 100).toFixed(0)}% above avg`
                : `${((1 - i.cycleTime / avg) * 100).toFixed(0)}% below avg`
        }))
        .slice(0, 8)
}

export function detectBottlenecks(allReviews) {
    const stats = {}
    for (const { prCreatedAt, reviews } of allReviews) {
        const prTime = new Date(prCreatedAt)
        for (const review of reviews) {
            if (!review.user?.login || review.user.type === 'Bot') continue
            const login = review.user.login
            const timeToReview = (new Date(review.submitted_at) - prTime) / 3600000
            if (!stats[login]) stats[login] = { count: 0, totalTime: 0, approvals: 0, changes: 0 }
            stats[login].count++
            stats[login].totalTime += Math.max(0, timeToReview)
            if (review.state === 'APPROVED') stats[login].approvals++
            if (review.state === 'CHANGES_REQUESTED') stats[login].changes++
        }
    }
    return Object.entries(stats)
        .filter(([_, s]) => s.count >= 2)
        .map(([login, s]) => ({
            login,
            reviewCount: s.count,
            avgHoursToReview: s.totalTime / s.count,
            approvals: s.approvals,
            changesRequested: s.changes,
            approvalRate: ((s.approvals / s.count) * 100).toFixed(0)
        }))
        .sort((a, b) => b.avgHoursToReview - a.avgHoursToReview)
        .slice(0, 8)
}

export function complexityScore(pr, files) {
    const totalChanges = (pr.additions || 0) + (pr.deletions || 0)
    const fileCount = files.length
    const changeScore = Math.min(totalChanges / 200, 5)
    const fileScore = Math.min(fileCount / 8, 5)
    return parseFloat(Math.min(changeScore + fileScore, 10).toFixed(1))
}

export function calcVelocity(prs) {
    const weeks = {}
    for (const pr of prs) {
        if (!pr.merged_at) continue
        const d = new Date(pr.merged_at)
        d.setDate(d.getDate() - d.getDay())
        const key = d.toISOString().split('T')[0]
        weeks[key] = (weeks[key] || 0) + 1
    }
    return Object.entries(weeks)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-10)
        .map(([week, count]) => ({ week: week.slice(5), count }))
}