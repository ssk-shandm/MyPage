import test from 'node:test'
import assert from 'node:assert/strict'
import { updateReleases } from '../src/release-updates.js'

function documentFixture() {
  const selectors = ['[data-version]', '.download-link', '.release-info', '[data-release-link]', '.release-summary', '[data-download-note]']
  const elements = Object.fromEntries(['biejuan', 'grabmeta'].map(id => [id,
    Object.fromEntries(selectors.map(selector => [selector, { textContent: 'original', href: 'original' }]))]))
  const notice = { textContent: '' }
  return {
    elements, notice,
    querySelector(selector) {
      if (selector === '.preview-notice') return notice
      const id = selector.includes('biejuan') ? 'biejuan' : 'grabmeta'
      return { querySelector: key => elements[id][key] }
    },
  }
}
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

test('frontend updates both cards, metadata and version-specific release links', async () => {
  const doc = documentFixture()
  await updateReleases(doc, async () => Response.json({ projects: { biejuan: release('biejuan'), grabmeta: release('grabmeta') } }))
  assert.equal(doc.elements.biejuan['[data-version]'].textContent, 'v9.0.0')
  assert.ok(doc.elements.biejuan['.download-link'].href.includes('/v9.0.0/'))
  assert.match(doc.elements.grabmeta['.release-info'].textContent, /10.00 MiB/)
  assert.match(doc.elements.grabmeta['[data-release-link]'].href, /tag\/v9.0.0$/)
  assert.match(doc.notice.textContent, /15/)
})

test('frontend sends releases without installers to the release page, never to an older installer', async () => {
  const doc = documentFixture()
  const item = release('biejuan', false)
  await updateReleases(doc, async () => Response.json({ projects: { biejuan: item } }))
  assert.equal(doc.elements.biejuan['.download-link'].href, item.release.releaseUrl)
  assert.match(doc.elements.biejuan['.download-link'].textContent, /暂无/)
  assert.equal(doc.elements.grabmeta['[data-version]'].textContent, 'original')
  assert.match(doc.notice.textContent, /部分/)
})

test('frontend keeps static metadata on offline, HTML fallback, server errors and invalid URLs', async () => {
  const bad = release('biejuan')
  bad.release.installer.url = 'https://evil.test/app_x64-setup.exe'
  for (const fetcher of [async () => { throw Error('offline') },
    async () => new Response('<html>SPA fallback</html>'),
    async () => new Response('', { status: 500 }),
    async () => Response.json({ projects: { biejuan: bad } })]) {
    const doc = documentFixture()
    await updateReleases(doc, fetcher)
    assert.equal(doc.elements.biejuan['[data-version]'].textContent, 'original')
    assert.equal(doc.elements.biejuan['.download-link'].href, 'original')
    assert.match(doc.notice.textContent, /无法同步/)
  }
})

test('frontend labels stale cached results honestly', async () => {
  const doc = documentFixture()
  await updateReleases(doc, async () => Response.json({ projects: {
    biejuan: { ...release('biejuan'), status: 'stale' }, grabmeta: release('grabmeta'),
  } }))
  assert.match(doc.notice.textContent, /最近一次/)
})
