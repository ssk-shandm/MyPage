import test from 'node:test'
import assert from 'node:assert/strict'
import { applyReleaseData, formatSize, NOTICES } from '../src/lib/apply-releases.js'
import { projects as staticProjects } from '../src/data/projects.js'

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

test('sends releases without installers to the release page, never to an older installer', () => {
  const result = applyReleaseData({ projects: { biejuan: release('biejuan', false) } }, staticProjects)
  const biejuan = byId(result.projects, 'biejuan')
  assert.equal(biejuan.downloadUrl, release('biejuan').release.releaseUrl)
  assert.match(biejuan.downloadLabel, /暂无/)
  assert.equal(byId(result.projects, 'grabmeta').version, 'v2.3.2')
  assert.equal(result.notice, NOTICES.partial)
})

test('rejects invalid release data and leaves static metadata untouched', () => {
  const bad = release('biejuan')
  bad.release.installer.url = 'https://evil.test/app_x64-setup.exe'
  for (const data of [
    null,
    {},
    { projects: { biejuan: bad } },
    { projects: { biejuan: { ...release('biejuan'), release: { ...release('biejuan').release, releaseUrl: 'https://evil.test/x' } } } },
    { projects: { biejuan: { ...release('biejuan'), release: { ...release('biejuan').release, publishedAt: 'nope' } } } },
  ]) {
    assert.throws(() => applyReleaseData(data, staticProjects), /No valid release information/)
  }
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
