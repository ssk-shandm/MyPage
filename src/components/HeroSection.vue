<script setup>
const year = new Date().getFullYear()
</script>

<template>
  <section class="hero grid" aria-labelledby="hero-title">
    <p class="rail-label">独立开发 / {{ year }}</p>
    <div class="hero-main">
      <p class="kicker"><span class="pulse"></span>两个正在迭代的桌面项目</p>
      <h1 id="hero-title">把工具，<br /><em>做得更好用。</em></h1>
      <p class="hero-copy">
        你好，我是 <span class="editable">ssk-shandm</span>。我在做实用的桌面软件：一个帮助学习和整理题库，一个帮助下载和管理媒体内容。
      </p>
      <div class="hero-actions">
        <a class="button" href="#projects">查看项目 <span aria-hidden="true">↓</span></a>
        <a class="text-link" href="https://github.com/ssk-shandm" target="_blank" rel="noreferrer">
          GitHub 主页 <span aria-hidden="true">↗</span>
        </a>
      </div>
    </div>
    <div class="hero-stamp" aria-hidden="true">
      <span>BUILD<br />SHIP<br />IMPROVE<br /><b>REPEAT</b></span>
      <i>+</i>
    </div>
  </section>
</template>
