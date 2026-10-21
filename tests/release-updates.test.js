import test from 'node:test'
import assert from 'node:assert/strict'
import { applyReleaseData, formatSize, NOTICES } from '../src/lib/apply-releases.js'
import { projects as staticProjects } from '../src/data/projects.js'
import { proxiedUrl } from '../lib/releases.js'

function release(id, installer = true) {
  const repo = id === 'biejuan' ? 'Biejuan' : 'GrabMeta'
  return {
    status: 'live',
    release: {
      version: 'v9.0.0', publishedAt: '2026-10-22T12:00:00Z',
      releaseUrl: `https://github.com/ssk-shandm/${repo}/releases/tag/v9.0.0`,
      installer: installer ? {
        name: 'app_x64-setup.exe', size: 10485760,
        url: `https://github.com/ssk-shandm/${repo}/releases/download/v9.0.0/app_x64-setup.exe`,
      } : null,
    },
  }
}
const payload = (overrides = {}) => ({ projects: { biejuan: release('biejuan'), grabmeta: release('grabmeta'), ...overrides } })
const byId = (list, id) => list.find((project) => project.id === id)

test('updates both cards, metadata and version-specific release links', () => {
  const result = applyReleaseData(payload(), staticProjects)
  const biejuan = byId(result.projects, 'biejuan')
  const grabmeta = byId(result.projects, 'grabmeta')
  assert.equal(biejuan.version, 'v9.0.0')
  assert.ok(biejuan.downloadUrl.includes('/v9.0.0/'))
  assert.equal(grabmeta.info, '10.00 MiB / 2026-10-22（UTC）')
  assert.match(biejuan.releaseUrl, /tag\/v9\.0\.0$/)
  assert.match(result.notice, /15/)
  assert.equal(result.updated, 2)
})

test('download button uses the proxy prefix while keeping the exact versioned asset name', () => {
  const result = applyReleaseData(payload(), staticProjects)
  const biejuan = byId(result.projects, 'biejuan')
  const asset = 'https://github.com/ssk-shandm/Biejuan/releases/download/v9.0.0/app_x64-setup.exe'
  assert.equal(biejuan.downloadUrl, asset)
  assert.equal(biejuan.downloadHref, `https://ghproxy.net/${asset}`)
  assert.equal(biejuan.hasInstaller, true)
  // 文件名由接口给出，新版本换名字也会自动跟随。
  const renamed = release('biejuan')
  renamed.release.version = 'v10.1.0'
  renamed.release.releaseUrl = 'https://github.com/ssk-shandm/Biejuan/releases/tag/v10.1.0'
  renamed.release.installer.name = 'biejuan_10.1.0_x64-setup.exe'
  renamed.release.installer.url = 'https://github.com/ssk-shandm/Biejuan/releases/download/v10.1.0/biejuan_10.1.0_x64-setup.exe'
  const next = byId(applyReleaseData(payload({ biejuan: renamed }), staticProjects).projects, 'biejuan')
  assert.equal(next.downloadHref, `https://ghproxy.net/${renamed.release.installer.url}`)
})

test('sends releases without installers to the release page, never to an older installer', () => {
  const result = applyReleaseData({ projects: { biejuan: release('biejuan', false) } }, staticProjects)
  const biejuan = byId(result.projects, 'biejuan')
  assert.equal(biejuan.downloadUrl, release('biejuan').release.releaseUrl)
  assert.equal(biejuan.downloadHref, release('biejuan').release.releaseUrl)
  assert.equal(biejuan.hasInstaller, false)
  assert.match(biejuan.downloadLabel, /暂无/)
  assert.equal(byId(result.projects, 'grabmeta').version, 'v2.3.2')
  assert.equal(result.notice, NOTICES.partial)
})

test('rejects invalid release data and keeps the verified static snapshot', () => {
  const bad = release('biejuan')
  bad.release.installer.url = 'https://evil.test/app_x64-setup.exe'
  for (const data of [
    null,
    {},
    { projects: { biejuan: bad } },
    { projects: { biejuan: { ...release('biejuan'), release: { ...release('biejuan').release, releaseUrl: 'https://evil.test/x' } } } },
    { projects: { biejuan: { ...release('biejuan'), release: { ...release('biejuan').release, publishedAt: 'nope' } } } },
  ]) {
    const result = applyReleaseData(data, staticProjects)
    assert.equal(result.updated, 0)
    assert.deepEqual(result.projects, staticProjects)
    assert.equal(result.notice, NOTICES.unavailable)
  }
})

test('explains GitHub anonymous rate limiting instead of a generic sync failure', () => {
  const limited = (id) => ({
    release: null, checkedAt: null, status: 'unavailable',
    error: { code: 'github_rate_limited', status: 403, retryAt: Date.now() + 600000 },
  })
  const result = applyReleaseData({ projects: { biejuan: limited('biejuan'), grabmeta: limited('grabmeta') } }, staticProjects)
  assert.equal(result.rateLimited, true)
  assert.equal(result.notice, NOTICES.rateLimited)
  assert.match(result.notice, /频率上限/)
  assert.deepEqual(result.projects, staticProjects)
  // 只有部分项目被限流时，仍按“部分无法同步”处理，不夸大原因。
  const mixed = applyReleaseData(payload({ grabmeta: limited('grabmeta') }), staticProjects)
  assert.equal(mixed.rateLimited, false)
  assert.equal(mixed.notice, NOTICES.partial)
})

test('labels stale cached results honestly', () => {
  const result = applyReleaseData(payload({ biejuan: { ...release('biejuan'), status: 'stale' } }), staticProjects)
  assert.equal(result.notice, NOTICES.stale)
  assert.equal(result.stale, true)
})

test('formats installer sizes in MiB with two decimals', () => {
  assert.equal(formatSize(10485760), '10.00 MiB')
  assert.equal(formatSize(6815744), '6.50 MiB')
})

test('only proxies github release downloads and leaves every other link alone', () => {
  const asset = 'https://github.com/ssk-shandm/GrabMeta/releases/download/v2.3.2/GrabMeta_2.3.2_x64-setup.exe'
  assert.equal(proxiedUrl(asset), `https://ghproxy.net/${asset}`)
  for (const url of [
    'https://github.com/ssk-shandm/GrabMeta/releases/tag/v2.3.2',
    'https://github.com/ssk-shandm/GrabMeta',
    'https://evil.test/https://github.com/a/b/releases/download/v1/x-setup.exe',
    'https://ghproxy.net/https://github.com/a/b/releases/download/v1/x-setup.exe',
    'javascript:alert(1)',
    '',
    undefined,
  ]) {
    assert.equal(proxiedUrl(url), url)
  }
})

test('merges the validated release summary without changing the project introduction', () => {
  const biejuan = release('biejuan')
  biejuan.release.summary = ['新增题库管理。', '修复导入问题。']
  const result = applyReleaseData(payload({ biejuan }), staticProjects)
  const project = byId(result.projects, 'biejuan')
  assert.deepEqual(project.summaryItems, ['新增题库管理。', '修复导入问题。'])
  assert.equal(project.description, byId(staticProjects, 'biejuan').description)
  assert.deepEqual(byId(result.projects, 'grabmeta').summaryItems, [])
})

test('invalid summaries do not block version updates or keep an old version summary', () => {
  for (const summary of [undefined, null, '<script>bad</script>', ['x'.repeat(201)], ['<img src=x onerror=alert(1)>'], ['a', 'b', 'c', 'd']]) {
    const biejuan = release('biejuan')
    biejuan.release.summary = summary
    const initial = staticProjects.map(project => ({ ...project, summaryItems: ['旧版本的摘要。'] }))
    const result = applyReleaseData(payload({ biejuan }), initial)
    const project = byId(result.projects, 'biejuan')
    assert.deepEqual(project.summaryItems, [])
    assert.equal(project.version, 'v9.0.0')
    assert.match(project.summary, /请查看本版本发布说明/)
  }
})
