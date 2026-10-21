# 个人主页

一个可以直接部署到 GitHub + Cloudflare Pages 的静态个人主页，使用 Vite 构建。

## 本地运行

```bash
npm install
npm run dev
```

## 发布到 GitHub

```bash
git init
git add .
git commit -m "build personal homepage"
git branch -M main
git remote add origin https://github.com/你的用户名/你的仓库名.git
git push -u origin main
```

## 发布到 Cloudflare Pages

1. 在 Cloudflare 控制台进入 **Workers & Pages → Create application → Pages → Connect to Git**。
2. 选择上面的 GitHub 仓库，生产分支选 `main`。
3. 构建命令填 `npm run build`，输出目录填 `dist`，根目录保持默认。Node 使用 22.12 或更高版本（本项目提供 `.node-version`，设置为 22）。无需设置服务端密钥。
4. 保存部署。之后每次推送到 `main`，Cloudflare Pages 会自动重新构建。

## 上线前替换

项目数据已写入 `src/main.js`，目前对应 `ssk-shandm/Biejuan` 与 `ssk-shandm/GrabMeta`，下载按钮直达两个仓库的最新 Windows x64 Release 安装包。发布新版本后，请同步更新这里的版本号与下载 URL。页面的颜色、字体与间距集中在 `src/style.css` 顶部的变量中。

当前项目仅包含本地网站和 Git 仓库；GitHub 远程仓库与 Cloudflare Pages 项目需要另行创建、连接。不要将访问令牌或其他密钥写进前端代码或提交到 Git。
