<script setup>
import ProjectCard from './ProjectCard.vue'

defineProps({ projects: { type: Array, required: true } })
</script>

<template>
  <section id="projects" class="work grid" aria-labelledby="projects-title">
    <div class="section-intro">
      <h2 id="projects-title">正在做<br /><span>的工具。</span></h2>
      <p class="section-note">下载已发布的安装包，或进入仓库查看功能、使用文档与后续更新。</p>
    </div>
    <div class="project-list">
      <ProjectCard v-for="project in projects" :key="project.id" :project="project" />
    </div>
  </section>
</template>
