<script setup>
const words = ['OPEN SOURCE', 'WINDOWS TOOLS', 'SHIPPING UPDATES', 'OPEN SOURCE']
</script>

<template>
  <section class="ticker" aria-label="项目状态">
    <div class="ticker-inner">
      <div v-for="copy in 2" :key="copy" class="ticker-group" :aria-hidden="copy === 2 ? 'true' : undefined">
        <template v-for="(word, index) in words" :key="`${copy}-${index}`">
          <span>{{ word }}</span>
          <b aria-hidden="true">+</b>
        </template>
      </div>
    </div>
  </section>
</template>
