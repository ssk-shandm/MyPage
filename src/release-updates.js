import { isValidRelease, repositories } from '../lib/releases.js'

export async function updateReleases(root = document, fetcher = fetch) {
  const notice = root.querySelector('.preview-notice')
  try {
    const response = await fetcher('/api/releases', {
      headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(10000), cache: 'no-store',
    })
    if (!response.ok) throw new Error('Release service unavailable')
    const data = await response.json()
    let updated = 0
    let stale = false
    for (const [id, repository] of Object.entries(repositories)) {
      const item = data.projects?.[id]
      const card = root.querySelector(`[data-project="${id}"]`)
      if (!card || !isValidRelease(item?.release, repository)) continue
      const { release } = item
      // Remote text is never interpreted as HTML. Update version and asset together.
      card.querySelector('[data-version]').textContent = release.version
      const date = release.publishedAt.slice(0, 10)
      const button = card.querySelector('.download-link')
      button.href = release.installer?.url || release.releaseUrl
      button.textContent = release.installer ? '下载 Windows x64 安装包' : '查看发布页（暂无 Windows x64 安装包）'
      card.querySelector('.release-info').textContent = release.installer
        ? `${(release.installer.size / 1024 ** 2).toFixed(2)} MiB / ${date}（UTC）`
        : `${date}（UTC）/ 未找到唯一可用的 Windows x64 安装包`
      card.querySelector('[data-release-link]').href = release.releaseUrl
      card.querySelector('.release-summary').textContent = '版本更新内容与安装注意事项，请查看本版本发布说明。'
      card.querySelector('[data-download-note]').textContent = '下载文件由 GitHub Releases 提供。发布包可能未签名，请核对来源；安装或升级前请阅读对应版本说明并备份重要数据。'
      stale ||= item.status === 'stale'
      updated++
    }
    if (!updated) throw new Error('No valid release information')
    notice.textContent = updated < Object.keys(repositories).length
      ? '部分项目暂时无法同步，未更新的项目保留已核实的历史版本；可前往“最新发布与说明”确认。'
      : stale
        ? 'GitHub 暂时不可用，当前显示最近一次查询成功的版本；可前往“最新发布与说明”确认。'
        : '版本与安装包信息自动读取自 GitHub Releases，缓存约 15 分钟；完整变更请查看发布说明。'
  } catch {
    notice.textContent = '暂时无法同步版本信息，当前保留已核实的历史版本。获取新版本请前往各项目的“最新发布与说明”。'
  }
}
