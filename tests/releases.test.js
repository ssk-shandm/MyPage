import test from 'node:test'
import assert from 'node:assert/strict'
import { normalizeRelease, isValidRelease, repositories, extractReleaseSummary, validateSummary } from '../lib/releases.js'
import { readFileSync } from 'node:fs'
import { getProjectRelease, FRESH_MS, RETAIN_SECONDS } from '../functions/api/releases.js'

const repo = repositories.biejuan
function fixture(version = 'v0.3.0') {
  return {
    tag_name: version, draft: false, prerelease: false,
    published_at: '2026-10-22T12:00:00Z',
    html_url: `https://github.com/${repo}/releases/tag/${version}`,
    assets: [{
      name: 'biejuan-0.3.0-x64-setup.exe', size: 7000000, state: 'uploaded',
      browser_download_url: `https://github.com/${repo}/releases/download/${version}/biejuan-0.3.0-x64-setup.exe`,
    }],
  }
}
function memoryCache() {
  const map = new Map()
  return {
    async match(key) { return map.get(key.url)?.clone() },
    async put(key, response) { map.set(key.url, response.clone()) },
  }
}
function options(overrides = {}) {
  return {
    cache: memoryCache(), origin: 'https://example.pages.dev', now: Date.parse('2026-10-22T13:00:00Z'),
    fetcher: async () => Response.json(fixture()), ...overrides,
  }
}

test('normalizes an uploaded x64 installer with verified metadata', () => {
  const data = normalizeRelease(fixture(), repo)
  assert.equal(data.version, 'v0.3.0')
  assert.equal(data.installer.size, 7000000)
  assert.equal(isValidRelease(data, repo), true)
})

test('extracts only opening summary bullets, stopping before detailed notes', () => {
  const body = '# 别卷 v0.3.0\n\n## 更新摘要\n- 新增题库管理。\n- 修复导入问题。\n\n## 详细更新\n- 私人日志不应展示。\n## 安装说明\n更多内容。'
  assert.deepEqual(extractReleaseSummary(body), ['新增题库管理。', '修复导入问题。'])
  assert.deepEqual(extractReleaseSummary('\uFEFF' + body.replaceAll('\n', '\r\n')), ['新增题库管理。', '修复导入问题。'])
  assert.deepEqual(extractReleaseSummary('## 更新摘要\n- 新增功能。'), ['新增功能。'])
  assert.deepEqual(extractReleaseSummary('## 更新摘要\n- 新增功能。\n### 更多细节\n- 不展示。'), ['新增功能。'])
})

test('missing, misplaced, empty or malformed summary does not guess from detailed notes', () => {
  for (const body of [null, '', '旧版更新内容', '## 修复\n- 改动\n## 更新摘要\n- 不该被找到',
    '```md\n## 更新摘要\n- 示例\n```', '介绍文字\n## 更新摘要\n- 新增',
    '## 更新摘要\n\n## 详细更新\n- 细节', '## 更新摘要\n说明段落',
    '## 更新摘要\n- 第一行\n  第二行', '## 更新摘要\n- 第一条\n- 第二条\n- 第三条\n- 第四条',
    '## 更新摘要\n- ```js\nalert(1)\n```', '## 更新摘要\n- <script>alert(1)</script>',
    '## 更新摘要\n- [链接](https://example.com)', '## 更新摘要\n- **加粗**',
    '## 更新摘要\n| 项目 | 内容 |']) {
    assert.deepEqual(extractReleaseSummary(body), [], JSON.stringify(body))
  }
})

test('enforces a total 200-codepoint summary limit without truncation or splitting emoji', () => {
  assert.deepEqual(extractReleaseSummary('## 更新摘要\n- ' + '🙂'.repeat(200)), ['🙂'.repeat(200)])
  assert.deepEqual(extractReleaseSummary('## 更新摘要\n- ' + '中'.repeat(201)), [])
  assert.deepEqual(validateSummary(['中'.repeat(100), '文'.repeat(101)]), [])
  for (const items of [null, 'text', [], [null], [''], ['one\ntwo'], ['one\ttwo'], ['a', 'b', 'c', 'd']]) {
    assert.deepEqual(validateSummary(items), [])
  }
})

test('checked-in release template conforms to the extraction contract', () => {
  const body = readFileSync(new URL('../docs/RELEASE_TEMPLATE.md', import.meta.url), 'utf8')
  assert.equal(extractReleaseSummary(body).length, 3)
})

test('normalizes summary as part of the same version snapshot; old bodies yield an empty summary', () => {
  assert.deepEqual(normalizeRelease({ ...fixture(), body: '## 更新摘要\n- 修复题库导入。\n\n## 细节\n其他' }, repo).summary, ['修复题库导入。'])
  assert.deepEqual(normalizeRelease(fixture(), repo).summary, [])
})

test('supports GrabMeta underscore naming and encoded non-ASCII asset names', () => {
  for (const name of ['GrabMeta_2.3.2_x64-setup.exe', '别卷_0.3.0_x64-setup.exe']) {
    const data = fixture()
    data.assets[0].name = name
    data.assets[0].browser_download_url = `https://github.com/${repo}/releases/download/v0.3.0/${encodeURIComponent(name)}`
    assert.equal(normalizeRelease(data, repo).installer.name, name)
  }
})

test('rejects drafts, prereleases, bad dates and release URLs outside the fixed repository', () => {
  for (const change of [{ draft: true }, { prerelease: true }, { published_at: null },
    { html_url: 'https://evil.test/release' }, { html_url: 'https://github.com/other/repo/releases/tag/v0.3.0' }]) {
    assert.throws(() => normalizeRelease({ ...fixture(), ...change }, repo))
  }
})

test('missing, incomplete, wrong architecture, portable, signature and source assets are not installers', () => {
  for (const assets of [[], [{ ...fixture().assets[0], state: 'new' }],
    ...['app_arm64-setup.exe', 'app_x64-portable.exe', 'app_x64-setup.exe.sig', 'Source.zip'].map(name =>
      [{ ...fixture().assets[0], name }])]) {
    assert.equal(normalizeRelease({ ...fixture(), assets }, repo).installer, null)
  }
})

test('rejects foreign or mismatched installer URLs, zero sizes and ambiguous installers', () => {
  for (const change of [{ browser_download_url: 'javascript:alert(1)' },
    { browser_download_url: fixture('v0.2.1').assets[0].browser_download_url }, { size: 0 }]) {
    const data = fixture()
    Object.assign(data.assets[0], change)
    assert.equal(normalizeRelease(data, repo).installer, null)
  }
  const data = fixture()
  data.assets.push({ ...data.assets[0] })
  assert.equal(normalizeRelease(data, repo).installer, null)
})

test('reuses fresh cache and refreshes version and installer atomically after TTL', async () => {
  let calls = 0
  const config = options({ fetcher: async (url, init) => {
    calls++
    assert.equal(url, 'https://api.github.com/repos/ssk-shandm/Biejuan/releases/latest')
    assert.equal(init.headers.Authorization, undefined)
    return Response.json(fixture(calls === 1 ? 'v0.3.0' : 'v0.3.1'))
  } })
  assert.equal((await getProjectRelease('biejuan', config)).status, 'live')
  assert.equal((await getProjectRelease('biejuan', config)).status, 'cached')
  assert.equal(calls, 1)
  config.now += FRESH_MS + 1
  const refreshed = await getProjectRelease('biejuan', config)
  assert.equal(refreshed.release.version, 'v0.3.1')
  assert.ok(refreshed.release.installer.url.includes('/v0.3.1/'))
})

test('rate limit, timeout, malformed JSON and upstream failure return stale cache or unavailable', async () => {
  for (const fetcher of [async () => new Response('', { status: 403 }),
    async () => { throw new Error('timeout') }, async () => new Response('not JSON'),
    async () => new Response('', { status: 500 })]) {
    const config = options()
    const initial = await getProjectRelease('biejuan', config)
    config.now += FRESH_MS + 1
    config.fetcher = fetcher
    const stale = await getProjectRelease('biejuan', config)
    assert.equal(stale.status, 'stale')
    assert.deepEqual(stale.release, initial.release)
    config.now += RETAIN_SECONDS * 1000
    assert.equal((await getProjectRelease('biejuan', config)).status, 'unavailable')
  }
})

test('one failed repository does not affect the other', async () => {
  const config = options({ fetcher: async (url) => url.includes('/GrabMeta/')
    ? new Response('', { status: 404 }) : Response.json(fixture()) })
  const result = await Promise.all(['biejuan', 'grabmeta'].map(id => getProjectRelease(id, config)))
  assert.equal(result[0].status, 'live')
  assert.equal(result[1].status, 'unavailable')
})

test('backs off for a minute after an upstream failure without extending stale data age', async () => {
  let calls = 0
  const config = options({ fetcher: async () => { calls++; return new Response('', { status: 403 }) } })
  assert.equal((await getProjectRelease('biejuan', config)).status, 'unavailable')
  assert.equal((await getProjectRelease('biejuan', config)).status, 'unavailable')
  assert.equal(calls, 1)
  config.now += 60001
  await getProjectRelease('biejuan', config)
  assert.equal(calls, 2)
})

test('cache failure still serves GitHub data and server token never appears in the returned data', async () => {
  const config = options({ token: 'test-secret-value', cache: {
    async match() { throw Error('cache unavailable') }, async put() { throw Error('quota') },
  }, fetcher: async (_url, init) => {
    assert.equal(init.headers.Authorization, 'Bearer test-secret-value')
    return Response.json(fixture())
  } })
  const result = await getProjectRelease('biejuan', config)
  assert.equal(result.status, 'live')
  assert.ok(!JSON.stringify(result).includes('test-secret-value'))
})
