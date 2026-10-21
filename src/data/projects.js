// 静态兜底数据：接口不可用时页面仍显示已核实的版本与下载地址。
// 版本、日期、大小会在 GitHub Releases 同步成功后整体替换。
// downloadUrl 是 GitHub 原始地址；downloadHref 是按钮实际使用的加速地址。
export const projects = [
  {
    id: 'biejuan',
    no: '01',
    title: '别卷',
    type: '刷题与错题复习',
    description: '面向刷题与错题复习的应用，支持考试、背题、专项练习、错题本、备份恢复与 AI 文档转题库。',
    tags: ['Vue 3', 'Tauri 2', 'Windows'],
    tone: 'coral',
    source: 'https://github.com/ssk-shandm/Biejuan',
    version: 'v0.2.1',
    downloadUrl:
      'https://github.com/ssk-shandm/Biejuan/releases/download/v0.2.1/biejuan-0.2.1-x64-setup.exe',
    downloadHref:
      'https://ghproxy.net/https://github.com/ssk-shandm/Biejuan/releases/download/v0.2.1/biejuan-0.2.1-x64-setup.exe',
    releaseUrl: 'https://github.com/ssk-shandm/Biejuan/releases/tag/v0.2.1',
    downloadLabel: '下载 Windows x64 安装包',
    hasInstaller: true,
    info: '6.50 MiB / 2026-10-21',
    summary: '本次更新：新手指引、手动 Prompt 导出、文档转换规则改进与日志打包。',
    note: '仅 Windows x64；安装包未签名。此版本不提供 Android 或便携包；升级前建议导出全量备份，真实 Windows 安装与升级验收仍待完成。',
  },
  {
    id: 'grabmeta',
    no: '02',
    title: 'GrabMeta',
    type: '媒体下载工具',
    description:
      'yt-dlp 中文图形界面，支持视频下载、音频提取、字幕与封面下载。首次启动按需获取 yt-dlp、FFmpeg 和 ffprobe，支持应用内更新。',
    tags: ['Vue 3', 'Rust', 'Windows'],
    tone: 'blue',
    source: 'https://github.com/ssk-shandm/GrabMeta',
    version: 'v2.3.2',
    downloadUrl:
      'https://github.com/ssk-shandm/GrabMeta/releases/download/v2.3.2/GrabMeta_2.3.2_x64-setup.exe',
    downloadHref:
      'https://ghproxy.net/https://github.com/ssk-shandm/GrabMeta/releases/download/v2.3.2/GrabMeta_2.3.2_x64-setup.exe',
    releaseUrl: 'https://github.com/ssk-shandm/GrabMeta/releases/tag/v2.3.2',
    downloadLabel: '下载 Windows x64 安装包',
    hasInstaller: true,
    info: '6.35 MiB / 2026-10-09',
    summary: '本次更新：修复 Windows 首次安装工具时偶发的“拒绝访问”问题。',
    note: '仅 Windows x64；首次启动需联网获取工具。仅下载有权获取的内容。安装包未签名，不是完全离线安装包。',
  },
]
