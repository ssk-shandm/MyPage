# ssk-shandm 的项目主页

一个可以直接部署到 GitHub + Cloudflare Pages 的静态个人主页，使用 Vite 构建。

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

项目数据已写入 `src/main.js`，目前对应 `ssk-shandm/Biejuan` 与 `ssk-shandm/GrabMeta`，下载按钮直达两个仓库的最新 Windows x64 Release 安装包。发布新版本后，请同步更新这里的版本号与下载 URL。页面的颜色、字体与间距集中在 `src/style.css` 顶部的变量中。

版本快照核对于 2026-10-21：别卷 v0.2.1、GrabMeta v2.3.2。页面不会自动请求 GitHub API；“最新发布与说明”指向各仓库的 `/releases/latest`，即使此页尚未更新，也可以在那里查找新版本。安装包由 GitHub Releases 托管，不会复制到 Cloudflare Pages。当前不提供 macOS、Linux 或最新版 Android 下载入口。

Cloudflare Pages 项目由仓库所有者在 Cloudflare 控制台创建并连接。连接后，推送到 `main` 的代码会自动触发部署。不要将访问令牌或其他密钥写进前端代码或提交到 Git。
