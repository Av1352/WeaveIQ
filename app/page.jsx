'use client'
import { useState } from 'react'

function formatHours(h) {
    if (h == null) return 'N/A'
    if (h < 1) return `${Math.round(h * 60)}m`
    if (h < 24) return `${h.toFixed(1)}h`
    return `${(h / 24).toFixed(1)}d`
}

function cycleColor(h) {
    if (!h) return 'var(--text-dim)'
    if (h < 4) return 'var(--green)'
    if (h < 24) return 'var(--yellow)'
    return 'var(--red)'
}

function complexColor(s) {
    if (s < 3) return 'var(--green)'
    if (s < 6) return 'var(--yellow)'
    return 'var(--red)'
}

const mono = "'JetBrains Mono', monospace"
const sans = "'Inter', sans-serif"

function VelocityChart({ data }) {
    const max = Math.max(...data.map(d => d.count), 1)
    return (
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '100px' }}>
            {data.map((d, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', height: '100%', justifyContent: 'flex-end' }}>
                    <div style={{ fontSize: '9px', color: 'var(--text-dim)', fontFamily: mono }}>{d.count}</div>
                    <div style={{
                        width: '100%',
                        height: `${Math.max((d.count / max) * 65, 4)}px`,
                        background: i === data.length - 1 ? 'var(--accent-bright)' : 'var(--accent-dim)',
                        borderRadius: '3px 3px 0 0'
                    }} />
                    <div style={{ fontSize: '8px', color: 'var(--text-dim)', fontFamily: mono, writingMode: 'vertical-rl', height: '28px', overflow: 'hidden' }}>{d.week}</div>
                </div>
            ))}
        </div>
    )
}

const DEMO_REPOS = ['vercel/next.js', 'facebook/react', 'microsoft/vscode']

export default function Page() {
    const [url, setUrl] = useState('')
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState(null)
    const [error, setError] = useState(null)

    async function analyze() {
        if (!url.trim()) return
        setLoading(true)
        setError(null)
        setData(null)
        try {
            const res = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ repoUrl: url })
            })
            const json = await res.json()
            if (!res.ok) throw new Error(json.error)
            setData(json)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <header style={{
                borderBottom: '1px solid var(--border)', padding: '0 40px', height: '60px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: 'var(--bg)', position: 'sticky', top: 0, zIndex: 10
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                        width: '28px', height: '28px', borderRadius: '6px',
                        background: 'var(--accent)', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontSize: '13px', fontWeight: '700', color: '#fff', fontFamily: mono
                    }}>W</div>
                    <span style={{ fontSize: '15px', fontWeight: '600', letterSpacing: '-0.02em', color: 'var(--text)', fontFamily: sans }}>WeaveIQ</span>
                    <span style={{ fontSize: '10px', color: 'var(--text-dim)', fontFamily: mono, letterSpacing: '0.1em', textTransform: 'uppercase', marginLeft: '4px' }}>/ Engineering Intelligence</span>
                </div>
                <div style={{ fontSize: '11px', fontFamily: mono, color: 'var(--text-dim)', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '6px', padding: '5px 12px' }}>
                    GitHub API + IQR Anomaly Detection
                </div>
            </header>

            <main style={{ flex: 1, padding: '40px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
                {/* Input */}
                <div style={{ marginBottom: '40px' }}>
                    <div style={{ fontSize: '10px', color: 'var(--accent-bright)', fontFamily: mono, letterSpacing: '0.1em', marginBottom: '8px' }}>// REPOSITORY ANALYSIS</div>
                    <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text)', letterSpacing: '-0.03em', marginBottom: '8px', fontFamily: sans }}>
                        Engineering Intelligence
                    </h1>
                    <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px', fontFamily: sans }}>
                        Analyze any public GitHub repo — cycle times, bottlenecks, anomaly detection, velocity trends.
                    </p>

                    <div style={{ display: 'flex', gap: '12px', maxWidth: '600px' }}>
                        <input
                            value={url}
                            onChange={e => setUrl(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && analyze()}
                            placeholder="https://github.com/owner/repo"
                            style={{
                                flex: 1, background: 'var(--bg-card)', border: '1px solid var(--border)',
                                borderRadius: '10px', padding: '12px 16px', color: 'var(--text)',
                                fontSize: '14px', outline: 'none', fontFamily: sans, transition: 'border-color 0.2s'
                            }}
                            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                            onBlur={e => e.target.style.borderColor = 'var(--border)'}
                        />
                        <button onClick={analyze} disabled={loading || !url.trim()}
                            style={{
                                background: loading ? 'var(--bg-hover)' : 'var(--accent)',
                                border: 'none', borderRadius: '10px', padding: '12px 24px',
                                color: loading ? 'var(--text-dim)' : '#fff',
                                fontSize: '14px', fontWeight: '600', cursor: 'pointer',
                                fontFamily: sans, opacity: !url.trim() ? 0.4 : 1, transition: 'all 0.2s'
                            }}>
                            {loading ? 'Analyzing...' : 'Analyze →'}
                        </button>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: sans }}>Try:</span>
                        {DEMO_REPOS.map(r => (
                            <button key={r} onClick={() => setUrl(`https://github.com/${r}`)}
                                style={{
                                    fontSize: '11px', color: 'var(--text-muted)', background: 'var(--bg-card)',
                                    border: '1px solid var(--border)', borderRadius: '20px', padding: '4px 12px',
                                    cursor: 'pointer', fontFamily: mono, transition: 'all 0.15s'
                                }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent-bright)' }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)' }}>
                                {r}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div style={{ background: 'rgba(248,81,73,0.1)', border: '1px solid rgba(248,81,73,0.3)', borderRadius: '10px', padding: '16px', marginBottom: '24px', color: 'var(--red)', fontSize: '14px', fontFamily: sans }}>
                        ⚠ {error}
                    </div>
                )}

                {/* Loading */}
                {loading && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', gap: '16px' }}>
                        <div style={{ fontSize: '10px', color: 'var(--accent-bright)', fontFamily: mono, letterSpacing: '0.1em' }}>// FETCHING PR DATA · RUNNING ANALYSIS</div>
                        <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: sans }}>Fetching up to 50 merged PRs + reviews + files... 15-30 seconds for large repos.</div>
                    </div>
                )}

                {/* Dashboard */}
                {data && !loading && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                        {/* Repo banner */}
                        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text)', marginBottom: '4px', fontFamily: sans }}>{data.repo.fullName}</div>
                                <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: sans }}>{data.repo.description || 'No description'}</div>
                            </div>
                            <div style={{ display: 'flex', gap: '20px' }}>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '10px', color: 'var(--text-dim)', fontFamily: mono, marginBottom: '3px' }}>LANGUAGE</div>
                                    <div style={{ fontSize: '13px', color: 'var(--accent-bright)', fontFamily: sans }}>{data.repo.language || 'Mixed'}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '10px', color: 'var(--text-dim)', fontFamily: mono, marginBottom: '3px' }}>STARS</div>
                                    <div style={{ fontSize: '13px', color: 'var(--text)', fontFamily: sans }}>★ {data.repo.stars?.toLocaleString()}</div>
                                </div>
                            </div>
                        </div>

                        {/* Summary cards */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                            {[
                                { label: 'PRS ANALYZED', value: data.summary.totalPRs, sub: 'merged', color: 'var(--blue)' },
                                { label: 'AVG CYCLE TIME', value: formatHours(data.summary.avgCycleTimeHours), sub: 'mean', color: cycleColor(data.summary.avgCycleTimeHours) },
                                { label: 'P90 CYCLE TIME', value: formatHours(data.summary.p90CycleTimeHours), sub: '90th pct', color: cycleColor(data.summary.p90CycleTimeHours) },
                                { label: 'AVG COMPLEXITY', value: `${data.summary.avgComplexity}/10`, sub: 'score', color: complexColor(data.summary.avgComplexity) },
                            ].map(card => (
                                <div key={card.label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
                                    <div style={{ fontSize: '10px', color: 'var(--text-dim)', fontFamily: mono, letterSpacing: '0.08em', marginBottom: '10px' }}>{card.label}</div>
                                    <div style={{ fontSize: '30px', fontWeight: '700', color: card.color, fontFamily: mono, letterSpacing: '-0.02em' }}>{card.value}</div>
                                    <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '6px', fontFamily: sans }}>{card.sub}</div>
                                </div>
                            ))}
                        </div>

                        {/* Velocity + Bottlenecks */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
                                <div style={{ fontSize: '10px', color: 'var(--accent-bright)', fontFamily: mono, letterSpacing: '0.1em', marginBottom: '4px' }}>// MERGE VELOCITY</div>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '20px', fontFamily: sans }}>PRs merged per week — last 10 weeks</div>
                                {data.velocity.length > 0
                                    ? <VelocityChart data={data.velocity} />
                                    : <div style={{ fontSize: '13px', color: 'var(--text-dim)', textAlign: 'center', padding: '20px', fontFamily: sans }}>Insufficient data</div>
                                }
                            </div>

                            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
                                <div style={{ fontSize: '10px', color: 'var(--accent-bright)', fontFamily: mono, letterSpacing: '0.1em', marginBottom: '4px' }}>// REVIEW BOTTLENECKS</div>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px', fontFamily: sans }}>Avg hours from PR open to first review</div>
                                {data.bottlenecks.length > 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        {data.bottlenecks.slice(0, 5).map((b, i) => (
                                            <div key={b.login} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--bg-hover)', borderRadius: '8px' }}>
                                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                                    <span style={{ fontSize: '10px', color: 'var(--accent-bright)', fontFamily: mono, minWidth: '16px' }}>#{i + 1}</span>
                                                    <span style={{ fontSize: '13px', color: 'var(--text)', fontFamily: mono }}>{b.login}</span>
                                                </div>
                                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                                    <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: sans }}>{b.reviewCount} reviews · {b.approvalRate}% approve</span>
                                                    <span style={{ fontSize: '12px', color: cycleColor(b.avgHoursToReview), fontFamily: mono, fontWeight: '600' }}>{formatHours(b.avgHoursToReview)}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div style={{ fontSize: '13px', color: 'var(--text-dim)', textAlign: 'center', padding: '20px', fontFamily: sans }}>No review data available</div>
                                )}
                            </div>
                        </div>

                        {/* Anomalies + Recent PRs */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
                                <div style={{ fontSize: '10px', color: 'var(--accent-bright)', fontFamily: mono, letterSpacing: '0.1em', marginBottom: '4px' }}>// ANOMALY DETECTION</div>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px', fontFamily: sans }}>Outlier PRs by cycle time (IQR method)</div>
                                {data.anomalies.length > 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {data.anomalies.map(a => (
                                            <a key={a.number} href={a.url} target="_blank" rel="noreferrer">
                                                <div style={{
                                                    padding: '10px 12px', background: 'var(--bg-hover)', borderRadius: '8px',
                                                    borderLeft: `3px solid ${a.anomalyType === 'SLOW' ? 'var(--red)' : 'var(--green)'}`,
                                                    cursor: 'pointer'
                                                }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                        <span style={{ fontSize: '11px', color: a.anomalyType === 'SLOW' ? 'var(--red)' : 'var(--green)', fontFamily: mono }}>{a.anomalyType} · {a.deviation}</span>
                                                        <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: mono }}>#{a.number}</span>
                                                    </div>
                                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: sans }}>{a.title}</div>
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                ) : (
                                    <div style={{ fontSize: '13px', color: 'var(--green)', textAlign: 'center', padding: '20px', fontFamily: sans }}>✓ No anomalies detected</div>
                                )}
                            </div>

                            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
                                <div style={{ fontSize: '10px', color: 'var(--accent-bright)', fontFamily: mono, letterSpacing: '0.1em', marginBottom: '4px' }}>// RECENT PRS</div>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px', fontFamily: sans }}>Cycle time + complexity per PR</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '320px', overflowY: 'auto' }}>
                                    {data.recentPRs.map(pr => (
                                        <a key={pr.number} href={pr.url} target="_blank" rel="noreferrer">
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', background: 'var(--bg-hover)', borderRadius: '8px', cursor: 'pointer' }}>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ fontSize: '12px', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: sans }}>{pr.title}</div>
                                                    <div style={{ fontSize: '10px', color: 'var(--text-dim)', fontFamily: mono, marginTop: '2px' }}>{pr.author} · {pr.changedFiles} files · +{pr.additions} -{pr.deletions}</div>
                                                </div>
                                                <div style={{ display: 'flex', gap: '8px', marginLeft: '12px', flexShrink: 0 }}>
                                                    <span style={{ fontSize: '11px', color: cycleColor(pr.cycleTime), fontFamily: mono }}>{formatHours(pr.cycleTime)}</span>
                                                    <span style={{ fontSize: '11px', color: complexColor(pr.complexity), fontFamily: mono }}>c:{pr.complexity}</span>
                                                </div>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>

                    </div>
                )}
            </main>
        </div>
    )
}