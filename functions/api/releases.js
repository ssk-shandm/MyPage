import { isValidRelease, normalizeRelease, repositories } from '../../lib/releases.js'

export const FRESH_MS = 15 * 60 * 1000
export const RETAIN_SECONDS = 24 * 60 * 60

function upstreamFailure(response, now) {
  const rateLimited = response.status === 429
    || (response.status === 403 && (response.headers.get('x-ratelimit-remaining') === '0'
      || response.headers.has('retry-after')))
  const code = rateLimited ? 'github_rate_limited'
    : response.status === 401 ? 'github_auth_failed' : 'github_http_error'
  let delay = 60000
  if (rateLimited) {
    const retry = response.headers.get('retry-after')
    const reset = response.headers.get('x-ratelimit-reset')
    const retryTime = retry === null ? NaN
      : /^\d+$/.test(retry) ? now + Number(retry) * 1000 : Date.parse(retry)
    const resetTime = reset === null ? NaN : Number(reset) * 1000
    const deadline = Number.isFinite(retryTime) ? retryTime : resetTime
    if (Number.isFinite(deadline)) delay = Math.min(3600000, Math.max(60000, deadline - now + 1000))
  }
  return { code, status: response.status, retryAt: now + delay }
}

export async function getProjectRelease(id, { cache, origin, fetcher, now, token }) {
  const repository = repositories[id]
  // Ignore visitor query parameters so they cannot bypass the cache or choose a repository.
  const key = new Request(`${origin}/__release-cache/v2/${id}`)
  let previous = null
  let retryAt = 0
  let lastError = null
  try {
    const hit = cache && await cache.match(key)
    if (hit) {
      const data = await hit.json()
      if (Number.isFinite(data.retryAt)) retryAt = data.retryAt
      lastError = data.error || null
      if (isValidRelease(data.release, repository) && Number.isFinite(data.checkedAt)
        && now >= data.checkedAt && now - data.checkedAt < RETAIN_SECONDS * 1000) previous = data
    }
  } catch {
    // A cache failure must not prevent fetching a public release.
  }
  if (previous && now - previous.checkedAt < FRESH_MS) return { ...previous, status: 'cached' }
  if (retryAt > now) return previous
    ? { ...previous, status: 'stale' }
    : { release: null, checkedAt: null, status: 'unavailable', error: lastError, retryAt }
  let failure = null
  try {
    const headers = {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'ssk-shandm-project-homepage',
      'X-GitHub-Api-Version': '2022-11-28',
    }
    if (token) headers.Authorization = `Bearer ${token}`
    if (previous?.etag) headers['If-None-Match'] = previous.etag
    const response = await fetcher(`https://api.github.com/repos/${repository}/releases/latest`, {
      headers, signal: AbortSignal.timeout(8000),
    })
    if (!response.ok && !(response.status === 304 && previous)) {
      failure = upstreamFailure(response, now)
      throw new Error('GitHub request failed')
    }
    let release
    try {
      release = response.status === 304 ? previous.release : normalizeRelease(await response.json(), repository)
    } catch {
      failure = { code: 'github_invalid_response', retryAt: now + 60000 }
      throw new Error('Invalid release response')
    }
    const data = { release, checkedAt: now }
    const etag = response.headers.get('etag') || (response.status === 304 ? previous.etag : null)
    if (etag) data.etag = etag
    try {
      if (cache) await cache.put(key, Response.json(data, {
        headers: { 'Cache-Control': `public, max-age=${RETAIN_SECONDS}` },
      }))
    } catch {
      // A cache write failure does not invalidate verified GitHub data.
    }
    return { ...data, status: 'live' }
  } catch (error) {
    failure ||= { code: ['TimeoutError', 'AbortError'].includes(error?.name)
      ? 'github_timeout' : 'github_network_error', retryAt: now + 60000 }
    // Only fixed codes/statuses are logged, never exception messages, tokens or GitHub bodies.
    console.warn('release_sync_failed', { project: id, ...failure })
    const fallback = {
      ...(previous || { release: null, checkedAt: null }),
      error: failure, retryAt: failure.retryAt,
    }
    try {
      const ttl = previous ? Math.max(1, Math.floor(RETAIN_SECONDS - (now - previous.checkedAt) / 1000))
        : Math.ceil((failure.retryAt - now) / 1000)
      if (cache) await cache.put(key, Response.json(fallback,
        { headers: { 'Cache-Control': `public, max-age=${ttl}` } }))
    } catch {
      // Cache is best effort; the frontend always retains a static fallback.
    }
    return { ...fallback, status: previous ? 'stale' : 'unavailable' }
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
