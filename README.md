# ssk-shandm 的项目主页

一个部署在 GitHub + Cloudflare Pages 的项目主页，使用 Vite 构建，并通过同项目的 Pages Functions 自动查询 GitHub Releases。

## 本地运行

```bash
npm install
npm run dev
```

## GitHub 仓库

仓库地址：https://github.com/ssk-shandm/MyPage

首次获取代码：

```bash
git clone https://github.com/ssk-shandm/MyPage.git
cd MyPage
npm ci
npm run dev
```

## 发布到 Cloudflare Pages

1. 在 Cloudflare 控制台进入 **Workers & Pages → Create application → Pages → Connect to Git**。
2. 选择上面的 GitHub 仓库，生产分支选 `main`。
3. 构建命令填 `npm run build`，输出目录填 `dist`，根目录保持默认。Node 使用 22.12 或更高版本（本项目提供 `.node-version`，设置为 22）。无需设置服务端密钥。
4. 保存部署。之后每次推送到 `main`，Cloudflare Pages 会自动重新构建。

## 项目数据维护

项目介绍与静态兜底信息位于 `src/data/projects.js`，对应 `ssk-shandm/Biejuan` 与 `ssk-shandm/GrabMeta`。颜色、字体、间距与字号尺度集中在 `src/style.css` 顶部的变量中。项目介绍仍需手动维护，版本信息自动更新。

页面使用 Vue 3（`<script setup>`）构建，组件在 `src/components/`：顶栏、Hero、跑马灯、项目区、关于、联系、页脚。`src/App.vue` 负责组装并通过 `src/composables/useReleases.js` 拉取版本信息；`src/lib/apply-releases.js` 是不依赖 DOM 的纯函数，负责校验并合并远端数据，单元测试直接覆盖它。

## 自动更新版本与下载

- `functions/api/releases.js` 自动部署为同一 Pages 项目下的 `/api/releases`，无需创建独立 Worker、数据库或 KV。前端只访问本站接口。
- 接口并行读取两个仓库的最新正式 Release，并在 Cloudflare Cache API 中缓存约 15 分钟。缓存按数据中心隔离、可能被提前驱逐，并非全球统一或持久存储；同步在访客打开页面时触发，不是定时任务。
- GitHub 出错时，尽量返回缓存中不超过 24 小时的旧数据，并短暂退避一分钟。缓存不存在、被驱逐、接口失败或免费配额耗尽时，前端保留静态历史版本，明确提示同步失败。
- 版本、日期（UTC）、安装包大小和下载 URL 一起更新。接口只允许两个固定仓库，筛选已上传、名称含 `x64` 且以 `-setup.exe` 或 `_setup.exe` 结尾的安装包；没有或存在多个匹配包时，不猜测地址，改为引导查看该版本发布页。
- 主页只提取 Release 开头的 `## 更新摘要` 列表，并以纯文本展示；不渲染 Release 正文 HTML。详细变化及平台限制通过“本版本说明”查看。“最新发布与说明”始终指向仓库的 `/releases/latest`。
- 下载按钮指向第三方加速服务 `https://ghproxy.net/` 转发的 GitHub Releases 直链。接口返回的 `installer.url`（含版本号与真实文件名）经过校验后，由 `lib/releases.js` 的 `proxiedUrl()` 加上前缀；文件名随每个版本变化，所以不要在代码里写死安装包名。卡片下方同时保留“GitHub 原始地址”，代理不可用时可直接回退。
- 安装包不由 Pages 或 Functions 转发，也不占用 Functions 配额；代理服务本身是否可用不在本站控制范围内。API 不可用不影响源码和发布页链接。
- 静态兜底快照核对于 2026-10-21：别卷 v0.2.1、GrabMeta v2.3.2，建议不定期手动更新兜底数据。

公开仓库默认无需 Token。若 GitHub 匿名 API 限流，可在 **Cloudflare Pages 项目 → Settings → Variables and Secrets** 中添加服务端 Secret `GITHUB_TOKEN`，保存后重新部署；不要使用 `VITE_` 前缀，不要提交 Token，不必向此聊天提供 Token。只需要公开仓库读取能力，不要授予写权限。此功能会消耗 Pages Functions 免费额度，静态资源访问不会触发函数（由 `public/_routes.json` 限定）。

发布流程：先在 GitHub 创建草稿 Release，上传完整安装包，再正式发布。主页通常在当前数据中心的缓存到期后、下次访问时读取新版本，不需要重新部署网站。

## Release 文案规范

别卷与 GrabMeta 共用同一规范。发布时复制 [Release 模板](docs/RELEASE_TEMPLATE.md) 到 GitHub Release 正文，将占位内容替换成真实变化。无需修改项目介绍或网站代码。

```markdown
## 更新摘要
- 新增：一句话说明用户现在能做什么。
- 改进：一句话说明体验改善。
- 修复：一句话说明解决的问题。

## 详细更新
在此展开描述改动。

## 下载与安装
平台要求、备份提醒和安装方式。

## 已知问题与限制
使用边界、未完成的验证等。
```

摘要规则：
- `## 更新摘要` 必须是正文的第一个章节，之前只允许空行或一行可选的 `# 项目名 版本号` 标题。标题文本需完全一致。
- 写 1～3 条，每条单独一行，以 `- ` 开头，内容用纯文本；不放代码块、表格、图片、HTML、链接或多行段落。
- 所有条目合计不超过 200 个字符（含标点，不含 `- ` 与换行；emoji 按 Unicode 码点计数），无需凑满三条。摘要可包含重要兼容性提醒，不要为了简短隐瞒破坏性变更。
- 摘要到下一个 Markdown 标题结束；安装说明、详细日志和校验值必须放在后面的章节。后续章节不展示到项目卡片。
- 缺少摘要、格式不符合规范或超限时，不自动截断或推测内容，显示“版本更新内容与安装注意事项，请查看本版本发布说明”。版本号和下载仍正常同步，旧版 Release 不需要强制修改。
- 编辑已发布 Release 的摘要后，同样需等待约 15 分钟缓存到期；不需要重新部署网站。

模板只是一份写作约定，不会自动改写两个项目的 Release。当前旧版没有这个区块，因此仍显示发布说明入口；下次按此格式发布即会展示摘要。

## 验证与本地接口开发

```bash
npm test
npm run build
npx wrangler pages dev dist
```

普通 `npm run dev` 只有 Vite 静态开发服务，不运行 Pages Functions，出现“无法同步”提示是预期行为。完整本地测试请使用上面的 Wrangler 命令。线上可访问 `https://ssk-shandm.pages.dev/api/releases` 检查 JSON；如果返回 HTML 或 404，请检查 Cloudflare 构建日志中是否成功编译根目录的 `functions/`。

Cloudflare Pages 项目由仓库所有者在 Cloudflare 控制台创建并连接。连接后，推送到 `main` 的代码会自动触发部署。不要将访问令牌或其他密钥写进前端代码或提交到 Git。
