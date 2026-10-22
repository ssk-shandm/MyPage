export const repositories = {
  biejuan: 'ssk-shandm/Biejuan',
  grabmeta: 'ssk-shandm/GrabMeta',
}

// 第三方 GitHub 文件加速。只在渲染阶段给已校验的 releases/download 地址加前缀，
// 版本号与文件名仍来自接口，所以新版本改了文件名也不用改代码。
export const DOWNLOAD_PROXY = 'https://ghproxy.net/'

export function proxiedUrl(value) {
  if (typeof value !== 'string') return value
  try {
    const url = new URL(value)
    if (url.origin !== 'https://github.com' || !url.pathname.includes('/releases/download/')) {
      return value
    }
    return `${DOWNLOAD_PROXY}${url.href}`
  } catch {
    return value
  }
}

// 上限只用于挡住异常长的正文，不用于裁剪正常写法：超出时保留前几条而不是整段丢弃，
// 否则一次写多了就完全看不到摘要，比截断更难排查。
export const SUMMARY_MAX_ITEMS = 5
export const SUMMARY_MAX_CODEPOINTS = 400

export function validateSummary(items) {
  if (!Array.isArray(items) || items.length < 1
    || items.some(item => typeof item !== 'string' || !item.trim()
      || /[\u0000-\u001f\u007f`<>]|!?\[[^\]]*\]\(|\*\*|__/.test(item))) return []
  const kept = []
  let total = 0
  for (const item of items) {
    if (kept.length >= SUMMARY_MAX_ITEMS) break
    const normalized = item.trim()
    const length = Array.from(normalized).length
    if (total + length > SUMMARY_MAX_CODEPOINTS) break
    kept.push(normalized)
    total += length
  }
  return kept
}

export function extractReleaseSummary(body) {
  if (typeof body !== 'string') return []
  const lines = body.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n').trim().split('\n')
  // Only the first section is public homepage copy; never search inside detailed notes or code.
  if (/^#\s+\S/.test(lines[0])) {
    lines.shift()
    while (lines[0]?.trim() === '') lines.shift()
  }
  if (lines.shift()?.trim() !== '## 更新摘要') return []
  const items = []
  for (const line of lines) {
    if (/^#{1,6}\s/.test(line)) break
    if (!line.trim()) continue
    const match = /^- ([^\s].*)$/.exec(line)
    if (!match) return []
    items.push(match[1])
  }
  // 条数与长度上限统一由 validateSummary 处理，超限时保留前几条。
  return validateSummary(items)
}

export function isReleaseUrl(value, repository, version, assetName) {
  try {
    const url = new URL(value)
    const path = url.pathname.split('/').map(decodeURIComponent)
    const [owner, repo] = repository.split('/')
    return url.origin === 'https://github.com'
      && !url.username && !url.password && !url.search && !url.hash
      && path[1]?.toLowerCase() === owner.toLowerCase()
      && path[2]?.toLowerCase() === repo.toLowerCase()
      && path[3] === 'releases'
      && (assetName
        ? path.length === 7 && path[4] === 'download' && path[5] === version && path[6] === assetName
        : path.length === 6 && path[4] === 'tag' && path[5] === version)
  } catch {
    return false
  }
}

export function isWindowsInstaller(name) {
  return typeof name === 'string' && /(?:^|[-_])x64[-_]/i.test(name) && /[-_]setup\.exe$/i.test(name)
}

export function normalizeRelease(release, repository) {
  if (!release || release.draft || release.prerelease
    || typeof release.tag_name !== 'string' || release.tag_name.length > 100
    || !isReleaseUrl(release.html_url, repository, release.tag_name)
    || !Number.isFinite(Date.parse(release.published_at))) {
    throw new Error('Invalid public release')
  }
  const installers = (Array.isArray(release.assets) ? release.assets : []).filter((asset) =>
    asset.state === 'uploaded' && isWindowsInstaller(asset.name)
    && Number.isSafeInteger(asset.size) && asset.size > 0
    && isReleaseUrl(asset.browser_download_url, repository, release.tag_name, asset.name))
  // Ambiguous builds send visitors to the release page rather than guessing.
  const installer = installers.length === 1 ? installers[0] : null
  return {
    version: release.tag_name,
    publishedAt: new Date(release.published_at).toISOString(),
    releaseUrl: release.html_url,
    summary: extractReleaseSummary(release.body),
    installer: installer ? { name: installer.name, size: installer.size, url: installer.browser_download_url } : null,
  }
}

export function isValidRelease(data, repository) {
  return !!data && typeof data.version === 'string' && data.version.length <= 100
    && Number.isFinite(Date.parse(data.publishedAt))
    && isReleaseUrl(data.releaseUrl, repository, data.version)
    && (data.installer === null || (!!data.installer
      && isWindowsInstaller(data.installer.name)
      && Number.isSafeInteger(data.installer.size) && data.installer.size > 0
      && isReleaseUrl(data.installer.url, repository, data.version, data.installer.name)))
}
