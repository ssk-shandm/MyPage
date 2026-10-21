import { isValidRelease, repositories } from '../../lib/releases.js'

export const NOTICES = {
  pending: '正在查询最新发布信息；同步完成前显示 2026-10-21 核实的历史版本。',
  fresh: '版本与安装包信息自动读取自 GitHub Releases，缓存约 15 分钟；完整变更请查看发布说明。',
  partial: '部分项目暂时无法同步，未更新的项目保留已核实的历史版本；可前往“最新发布与说明”确认。',
  stale: 'GitHub 暂时不可用，当前显示最近一次查询成功的版本；可前往“最新发布与说明”确认。',
  unavailable: '暂时无法同步版本信息，当前保留已核实的历史版本。获取新版本请前往各项目的“最新发布与说明”。',
}

const INSTALLER_LABEL = '下载 Windows x64 安装包'
const RELEASE_PAGE_LABEL = '查看发布页（暂无 Windows x64 安装包）'
const SYNCED_SUMMARY = '版本更新内容与安装注意事项，请查看本版本发布说明。'
const SYNCED_NOTE = '下载文件由 GitHub Releases 提供。发布包可能未签名，请核对来源；安装或升级前请阅读对应版本说明并备份重要数据。'

export function formatSize(bytes) {
  return `${(bytes / 1024 ** 2).toFixed(2)} MiB`
}

// 远端文本只作为纯文本写入，绝不拼进 HTML。
export function applyReleaseData(data, projects) {
  let updated = 0
  let stale = false
  const next = projects.map((project) => {
    const repository = repositories[project.id]
    const item = data?.projects?.[project.id]
    if (!repository || !isValidRelease(item?.release, repository)) return project
    const { release } = item
    const date = release.publishedAt.slice(0, 10)
    updated += 1
    stale ||= item.status === 'stale'
    return {
      ...project,
      version: release.version,
      releaseUrl: release.releaseUrl,
      downloadUrl: release.installer?.url || release.releaseUrl,
      downloadLabel: release.installer ? INSTALLER_LABEL : RELEASE_PAGE_LABEL,
      info: release.installer
        ? `${formatSize(release.installer.size)} / ${date}（UTC）`
        : `${date}（UTC）/ 未找到唯一可用的 Windows x64 安装包`,
      summary: SYNCED_SUMMARY,
      note: SYNCED_NOTE,
    }
  })
  if (!updated) throw new Error('No valid release information')
  const notice = updated < projects.length ? NOTICES.partial : stale ? NOTICES.stale : NOTICES.fresh
  return { projects: next, notice, updated, stale }
}
