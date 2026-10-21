<script setup>
import { ref } from 'vue'

const open = ref(false)
const links = [
  { href: '#projects', label: '项目' },
  { href: '#about', label: '关于' },
  { href: '#contact', label: '联系' },
]
</script>

<template>
  <header class="topbar">
    <a class="wordmark" href="#top" aria-label="回到首页">SSK<span class="mark">+</span></a>
    <nav class="nav" :class="{ 'is-open': open }" aria-label="主导航">
      <a v-for="link in links" :key="link.href" :href="link.href" @click="open = false">{{ link.label }}</a>
    </nav>
    <button
      class="menu-button"
      type="button"
      aria-label="打开导航菜单"
      :aria-expanded="open"
      @click="open = !open"
    >
      <span></span><span></span>
    </button>
  </header>
</template>
