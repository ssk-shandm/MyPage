import './style.css'

const projects = [
  {
    no: '01',
    title: '山海之间',
    type: '品牌网站 / 2024',
    description: '为一间沿海民宿重做数字入口，让慢下来成为一种清晰的选择。',
    tags: ['Art direction', 'Web design'],
    tone: 'coral',
  },
  {
    no: '02',
    title: 'Field Notes',
    type: '独立产品 / 2023',
    description: '一个把灵感、链接和未完成想法放在一起的轻量工作台。',
    tags: ['Product', 'Development'],
    tone: 'blue',
  },
  {
    no: '03',
    title: '城市观察',
    type: '视觉实验 / 进行中',
    description: '收集街角招牌、公共字体和那些不经意的颜色关系。',
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
      <section class="hero section-grid" aria-labelledby="hero-title">
        <div class="hero-aside rail-label">个人主页 / 2024—25</div>
        <div class="hero-main">
          <p class="kicker"><span class="pulse"></span>正在把好奇心变成作品</p>
          <h1 id="hero-title">把想法，<br /><em>做成</em>值得访问的页面。</h1>
          <p class="hero-copy">你好，我是<span class="editable">你的名字</span>。我在设计、文字和代码之间工作，喜欢把复杂的事讲得清楚，把平凡的日常做得有一点惊喜。</p>
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
        <div class="about-copy"><p class="rail-label">关于 / 一点点背景</p><h2 id="about-title">保持开放，<br /><em>持续输出。</em></h2><p>我相信好的工作始于好的提问。比起追逐某一种风格，我更在意每个项目真正需要什么：也许是一套更诚实的视觉语言，也许是一段让人愿意读完的文字，又或者只是一个终于好用的按钮。</p><p>这个页面是我的小小工作台。它会持续更新，也欢迎你把自己的内容替换进来。</p><a class="text-link" href="#contact">了解更多 <span>↗</span></a></div>
        <div class="about-facts"><div><strong>04</strong><span>年设计与开发经验</span></div><div><strong>18</strong><span>个已发布的项目</span></div><div><strong>∞</strong><span>还没做完的好奇心</span></div></div>
      </section>

      <section class="contact section-grid" id="contact" aria-labelledby="contact-title">
        <div class="contact-lead"><p class="rail-label">联系 / 现在开始</p><h2 id="contact-title">有事发生<br /><em>就写信。</em></h2></div>
        <div class="contact-card"><p>无论是一个新项目、一份工作机会，还是你刚刚想到的一个奇怪点子，我都想听听。</p><a class="email" href="mailto:hello@example.com">hello@example.com <span>↗</span></a><div class="socials"><a href="https://github.com" target="_blank" rel="noreferrer">GitHub</a><a href="https://www.linkedin.com" target="_blank" rel="noreferrer">LinkedIn</a><a href="https://instagram.com" target="_blank" rel="noreferrer">Instagram</a></div></div>
      </section>
    </main>

    <footer class="footer"><span>© 2024 你的名字</span><span>Made with curiosity <b>✳</b></span><a href="#top">回到顶部 ↑</a></footer>
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
