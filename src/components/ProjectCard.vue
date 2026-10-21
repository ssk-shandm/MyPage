<script setup>
defineProps({ project: { type: Object, required: true } })
</script>

<template>
  <article class="card" :class="project.tone">
    <p class="card-meta">{{ project.type }} / <span>{{ project.version }}</span></p>
    <div class="card-body">
      <h3>{{ project.title }}</h3>
      <p class="card-desc">{{ project.description }}</p>
      <ul class="tags">
        <li v-for="tag in project.tags" :key="tag">{{ tag }}</li>
      </ul>
    </div>
    <p class="card-summary">{{ project.summary }}</p>
    <div class="card-actions">
      <a class="download" :href="project.downloadUrl">{{ project.downloadLabel }}</a>
      <p class="card-info">{{ project.info }}</p>
      <div class="card-links">
        <a :href="`${project.source}/releases/latest`" target="_blank" rel="noreferrer">最新发布与说明</a>
        <a :href="project.releaseUrl" target="_blank" rel="noreferrer">本版本说明</a>
        <a :href="project.source" target="_blank" rel="noreferrer">GitHub 源码</a>
      </div>
      <p class="card-note">{{ project.note }}</p>
    </div>
  </article>
</template>
