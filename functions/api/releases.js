import { isValidRelease, normalizeRelease, repositories } from '../../lib/releases.js'

export const FRESH_MS = 15 * 60 * 1000
export const RETAIN_SECONDS = 24 * 60 * 60

export async function getProjectRelease(id, { cache, origin, fetcher, now, token }) {
  const repository = repositories[id]
  // Ignore visitor query parameters so they cannot bypass the cache or choose a repository.
  const key = new Request(`${origin}/__release-cache/v2/${id}`)
  let previous = null
  let retryAt = 0
  try {
    const hit = cache && await cache.match(key)
    if (hit) {
      const data = await hit.json()
      if (Number.isFinite(data.retryAt)) retryAt = data.retryAt
      if (isValidRelease(data.release, repository) && Number.isFinite(data.checkedAt)
        && now >= data.checkedAt && now - data.checkedAt < RETAIN_SECONDS * 1000) previous = data
    }
  } catch {
    // A cache failure must not prevent fetching a public release.
  }
  if (previous && now - previous.checkedAt < FRESH_MS) return { ...previous, status: 'cached' }
  if (retryAt > now) return previous
    ? { ...previous, status: 'stale' }
    : { release: null, checkedAt: null, status: 'unavailable' }
  try {
    const headers = {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'ssk-shandm-project-homepage',
      'X-GitHub-Api-Version': '2022-11-28',
    }
    if (token) headers.Authorization = `Bearer ${token}`
    const response = await fetcher(`https://api.github.com/repos/${repository}/releases/latest`, {
      headers, signal: AbortSignal.timeout(6000),
    })
    if (!response.ok) throw new Error(`GitHub status ${response.status}`)
    const release = normalizeRelease(await response.json(), repository)
    const data = { release, checkedAt: now }
    try {
      if (cache) await cache.put(key, Response.json(data, {
        headers: { 'Cache-Control': `public, max-age=${RETAIN_SECONDS}` },
      }))
    } catch {
      // A cache write failure does not invalidate verified GitHub data.
    }
    return { ...data, status: 'live' }
  } catch {
    // Briefly back off on errors instead of hammering a rate-limited API on every visit.
    try {
      const ttl = previous ? Math.max(1, Math.floor(RETAIN_SECONDS - (now - previous.checkedAt) / 1000)) : 60
      if (cache) await cache.put(key, Response.json({
        ...(previous || { release: null, checkedAt: null }), retryAt: now + 60000,
      }, { headers: { 'Cache-Control': `public, max-age=${ttl}` } }))
    } catch {
      // Cache is best effort; the frontend always retains a static fallback.
    }
    return previous ? { ...previous, status: 'stale' } : { release: null, checkedAt: null, status: 'unavailable' }
  }
}

export async function onRequestGet({ request, env }) {
  const options = {
    cache: globalThis.caches?.default,
    origin: new URL(request.url).origin,
    fetcher: fetch,
    now: Date.now(),
    token: env?.GITHUB_TOKEN,
  }
  const entries = await Promise.all(Object.keys(repositories).map(async (id) =>
    [id, await getProjectRelease(id, options)]))
  return Response.json({ projects: Object.fromEntries(entries) }, {
    headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' },
  })
}
