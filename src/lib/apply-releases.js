import { isValidRelease, proxiedUrl, repositories, validateSummary } from '../../lib/releases.js'

export const NOTICES = {
  pending: '正在查询最新发布信息；同步完成前显示 2026-10-21 核实的历史版本。',
  fresh: '版本与安装包信息自动读取自 GitHub Releases，缓存约 15 分钟；完整变更请查看发布说明。',
  partial: '部分项目暂时无法同步，未更新的项目保留已核实的历史版本；可前往“最新发布与说明”确认。',
  stale: 'GitHub 暂时不可用，当前显示最近一次查询成功的版本；可前往“最新发布与说明”确认。',
  unavailable: '暂时无法同步版本信息，当前保留已核实的历史版本。获取新版本请前往各项目的“最新发布与说明”。',
  // GitHub 对匿名请求按 IP 限流，Cloudflare 出口 IP 是共享的，被限时只能等它重置。
  rateLimited: 'GitHub 接口暂时达到匿名访问频率上限，当前保留已核实的历史版本；通常一小时左右自动恢复，也可直接前往各项目的“最新发布与说明”。',
}

export function noticeFor(updated, stale, total) {
  if (!updated) return NOTICES.unavailable
  if (updated < total) return NOTICES.partial
  if (stale) return NOTICES.stale
  return NOTICES.fresh
}

// 所有项目都因 GitHub 匿名限流失败时，说明真实原因，而不是笼统的“无法同步”。
function allRateLimited(data, projects) {
  return projects.length > 0 && projects.every((project) =>
    data?.projects?.[project.id]?.error?.code === 'github_rate_limited')
}

const INSTALLER_LABEL = '下载 Windows x64 安装包'
const RELEASE_PAGE_LABEL = '查看发布页（暂无 Windows x64 安装包）'
const SYNCED_SUMMARY = '版本更新内容与安装注意事项，请查看本版本发布说明。'
const SYNCED_NOTE = '下载经由第三方加速服务（ghproxy.net）转发 GitHub Releases 文件；如无法下载，可改用 GitHub 原始地址。发布包可能未签名，请核对来源；安装或升级前请阅读对应版本说明并备份重要数据。'

export function formatSize(bytes) {
  return `${(bytes / 1024 ** 2).toFixed(2)} MiB`
}

// 远端文本只作为纯文本写入，绝不拼进 HTML。
export function applyReleaseData(data, projects) {
  const rateLimited = allRateLimited(data, projects)
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
      // 安装包走加速前缀；没有安装包时仍是发布页，不加前缀。
      downloadHref: release.installer ? proxiedUrl(release.installer.url) : release.releaseUrl,
      downloadLabel: release.installer ? INSTALLER_LABEL : RELEASE_PAGE_LABEL,
      hasInstaller: Boolean(release.installer),
      info: release.installer
        ? `${formatSize(release.installer.size)} / ${date}（UTC）`
        : `${date}（UTC）/ 未找到唯一可用的 Windows x64 安装包`,
      summary: SYNCED_SUMMARY,
      summaryItems: validateSummary(release.summary),
      note: SYNCED_NOTE,
    }
  })
  if (!updated) {
    return {
      projects: next,
      notice: rateLimited ? NOTICES.rateLimited : NOTICES.unavailable,
      updated,
      stale,
      rateLimited,
    }
  }
  return {
    projects: next,
    notice: noticeFor(updated, stale, projects.length),
    updated,
    stale,
    rateLimited,
  }
}
