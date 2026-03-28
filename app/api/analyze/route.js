import { NextResponse } from 'next/server'
import { fetchRepo, fetchClosedPRs, fetchPRReviews, fetchPRFiles } from '@/lib/github'
import { cycleTimeHours, mean, percentile, detectAnomalies, detectBottlenecks, complexityScore, calcVelocity } from '@/lib/metrics'

export const maxDuration = 60

export async function POST(req) {
    try {
        const { repoUrl } = await req.json()

        const match = repoUrl.match(/github\.com\/([^/\s]+)\/([^/\s]+)/)
        if (!match) return NextResponse.json({ error: 'Invalid GitHub URL' }, { status: 400 })

        const [, owner, repoName] = match
        const repo = repoName.replace(/\.git$/, '')
        const token = process.env.GITHUB_TOKEN
        if (!token) return NextResponse.json({ error: 'GitHub token not configured on server' }, { status: 500 })

        const repoData = await fetchRepo(owner, repo, token)
        const prs = await fetchClosedPRs(owner, repo, token, 50)
        if (!prs.length) return NextResponse.json({ error: 'No merged PRs found in this repo' }, { status: 404 })

        // Enrich in batches of 5
        const enriched = []
        for (let i = 0; i < prs.length; i += 5) {
            const batch = prs.slice(i, i + 5)
            const results = await Promise.all(batch.map(async pr => {
                const [reviews, files] = await Promise.all([
                    fetchPRReviews(owner, repo, pr.number, token),
                    fetchPRFiles(owner, repo, pr.number, token)
                ])
                return { pr, reviews, files }
            }))
            enriched.push(...results)
        }

        const items = enriched.map(({ pr, reviews, files }) => ({
            number: pr.number,
            title: pr.title,
            url: pr.html_url,
            author: pr.user?.login,
            cycleTime: cycleTimeHours(pr),
            complexity: complexityScore(pr, files),
            additions: pr.additions,
            deletions: pr.deletions,
            changedFiles: files.length,
            mergedAt: pr.merged_at,
            reviews
        }))

        const validTimes = items.map(i => i.cycleTime).filter(Boolean)

        return NextResponse.json({
            repo: {
                fullName: repoData.full_name,
                description: repoData.description,
                stars: repoData.stargazers_count,
                language: repoData.language
            },
            summary: {
                totalPRs: prs.length,
                avgCycleTimeHours: parseFloat(mean(validTimes).toFixed(1)),
                medianCycleTimeHours: parseFloat(percentile(validTimes, 50).toFixed(1)),
                p90CycleTimeHours: parseFloat(percentile(validTimes, 90).toFixed(1)),
                avgComplexity: parseFloat(mean(items.map(i => i.complexity)).toFixed(1))
            },
            velocity: calcVelocity(prs),
            bottlenecks: detectBottlenecks(
                enriched.map(({ pr, reviews }) => ({ prCreatedAt: pr.created_at, reviews }))
            ),
            anomalies: detectAnomalies(items),
            recentPRs: items.slice(0, 15).map(i => ({
                number: i.number,
                title: i.title,
                url: i.url,
                author: i.author,
                cycleTime: i.cycleTime,
                complexity: i.complexity,
                changedFiles: i.changedFiles,
                additions: i.additions,
                deletions: i.deletions
            }))
        })
    } catch (err) {
        console.error(err)
        return NextResponse.json({ error: err.message || 'Analysis failed' }, { status: 500 })
    }
}