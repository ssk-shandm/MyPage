import './style.css'

const projects = [
  {
    no: '01',
    title: '山海之间',
    type: '示例项目 / 待替换',
    description: '这里可以介绍你的网站项目：为谁而做，解决了什么问题，以及你负责的部分。',
    tags: ['Art direction', 'Web design'],
    tone: 'coral',
  },
  {
    no: '02',
    title: 'Field Notes',
    type: '示例项目 / 待替换',
    description: '这里可以展示你的独立作品、开源工具，或者一个正在探索的小实验。',
    tags: ['Product', 'Development'],
    tone: 'blue',
  },
  {
    no: '03',
    title: '城市观察',
    type: '示例项目 / 待替换',
    description: '这里可以分享你的摄影、阅读笔记，或者任何想记录下来的日常发现。',
    tags: ['Research', 'Photography'],
    tone: 'yellow',
  },
]

document.querySelector('#app').innerHTML = `
  <div class="site-shell">
    <header class="topbar">
      <a class="wordmark" href="#top" aria-label="回到首页">Y/NAME<span class="mark">+</span></a>
      <nav class="nav-links" aria-label="主导航">
        <a href="#work">作品</a>
        <a href="#about">关于</a>
        <a href="#contact">联系</a>
      </nav>
      <button class="menu-button" type="button" aria-label="打开导航菜单" aria-expanded="false">
        <span></span><span></span>
      </button>
    </header>

    <main id="top">
      <p class="preview-notice">模板预览：名字、项目与联系方式均为占位内容，发布前请替换。</p>
      <section class="hero section-grid" aria-labelledby="hero-title">
        <div class="hero-aside rail-label">个人主页 / ${new Date().getFullYear()}</div>
        <div class="hero-main">
          <p class="kicker"><span class="pulse"></span>正在把好奇心变成作品</p>
          <h1 id="hero-title">把想法，<br /><em>做成</em>值得访问的页面。</h1>
          <p class="hero-copy">你好，我是<span class="editable">你的名字</span>。这里是我的个人空间，用来分享作品、记录想法，也让有共同兴趣的人找到我。</p>
          <div class="hero-actions">
            <a class="button button-dark" href="#work">看我的作品 <span>↓</span></a>
            <a class="text-link" href="#contact">聊聊你的想法 <span>↗</span></a>
          </div>
        </div>
        <div class="hero-stamp" aria-hidden="true">
          <span>MAKE<br />ROOM<br />FOR<br /><b>IDEAS</b></span>
          <i>✳</i>
        </div>
      </section>

      <section class="ticker" aria-label="个人标签">
        <div class="ticker-track"><span>DESIGN WITH INTENT</span><b>✳</b><span>BUILD WITH CARE</span><b>✳</b><span>STAY CURIOUS</span><b>✳</b><span>DESIGN WITH INTENT</span><b>✳</b></div>
      </section>

      <section class="work section-grid" id="work" aria-labelledby="work-title">
        <div class="section-intro">
          <p class="rail-label">选集 / 01—03</p>
          <h2 id="work-title">最近在做<br /><span>的事。</span></h2>
          <p class="section-note">不是所有想法都会变成项目，但它们都值得被认真对待。</p>
        </div>
        <div class="project-list">
          ${projects.map((project) => `
            <article class="project-card ${project.tone}">
              <div class="project-meta"><span>${project.no}</span><span>${project.type}</span></div>
              <div class="project-body"><h3>${project.title}</h3><p>${project.description}</p></div>
              <div class="project-footer"><div class="tag-list">${project.tags.map((tag) => `<span>${tag}</span>`).join('')}</div><span class="project-arrow">↗</span></div>
            </article>
          `).join('')}
        </div>
      </section>

      <section class="about section-grid" id="about" aria-labelledby="about-title">
        <div class="about-slice"><span class="big-asterisk">✳</span><span>ABOUT<br />THE<br />PERSON<br />BEHIND</span></div>
        <div class="about-copy"><p class="rail-label">关于 / 一点点背景</p><h2 id="about-title">保持开放，<br /><em>持续输出。</em></h2><p>在这里介绍你自己：你正在做什么、对哪些事情感兴趣，以及希望通过这个网站分享什么。不需要写得很长，用自己的语言就好。</p><p>也可以补充你的学习经历、工作方向或最近的计划。这部分内容等你提供真实资料后再完善。</p><a class="text-link" href="#contact">前往联系区 <span>↗</span></a></div>
        <div class="about-facts"><div><span>你的方向 / 待填写</span></div><div><span>你的兴趣 / 待填写</span></div><div><span>最近在做 / 待填写</span></div></div>
      </section>

      <section class="contact section-grid" id="contact" aria-labelledby="contact-title">
        <div class="contact-lead"><p class="rail-label">联系 / 现在开始</p><h2 id="contact-title">有事发生<br /><em>就写信。</em></h2></div>
        <div class="contact-card"><p>可以在这里留下你愿意公开的邮箱和社交账号。目前的邮箱仅作示例，请在发布前替换。</p><a class="email" href="mailto:hello@example.com">hello@example.com <span>↗</span></a><div class="socials"><span>GitHub 个人链接待添加</span></div></div>
      </section>
    </main>

    <footer class="footer"><span>© ${new Date().getFullYear()} 你的名字</span><span>Made with curiosity <b>✳</b></span><a href="#top">回到顶部 ↑</a></footer>
  </div>
`

const menuButton = document.querySelector('.menu-button')
const nav = document.querySelector('.nav-links')
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') === 'true'
  menuButton.setAttribute('aria-expanded', String(!open))
  nav.classList.toggle('is-open', !open)
})
nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  menuButton.setAttribute('aria-expanded', 'false')
  nav.classList.remove('is-open')
}))
