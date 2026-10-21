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

在 `src/main.js` 中替换名字、项目、邮箱和社交链接，完成后删除 `.preview-notice` 模板提示；在 `index.html` 中更新页面标题和描述。页面的颜色、字体与间距集中在 `src/style.css` 顶部的变量中。

当前项目仅包含本地网站和 Git 仓库；GitHub 远程仓库与 Cloudflare Pages 项目需要另行创建、连接。不要将访问令牌或其他密钥写进前端代码或提交到 Git。
