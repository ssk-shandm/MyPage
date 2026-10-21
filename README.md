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
3. 构建命令填 `npm run build`，输出目录填 `dist`，Node 版本使用 18 或更高。
4. 保存部署。之后每次推送到 `main`，Cloudflare Pages 会自动重新构建。

## 上线前替换

在 `src/main.js` 中替换名字、项目、邮箱和社交链接；页面的颜色、字体与间距集中在 `src/style.css` 顶部的变量中。
