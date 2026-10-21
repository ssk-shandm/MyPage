<script setup>
import { projects as staticProjects } from './data/projects.js'
import { useReleases } from './composables/useReleases.js'
import SiteHeader from './components/SiteHeader.vue'
import HeroSection from './components/HeroSection.vue'
import TickerStrip from './components/TickerStrip.vue'
import ProjectsSection from './components/ProjectsSection.vue'
import AboutSection from './components/AboutSection.vue'
import ContactSection from './components/ContactSection.vue'
import SiteFooter from './components/SiteFooter.vue'

const { projects, notice } = useReleases(staticProjects)
</script>

<template>
  <div class="shell">
    <SiteHeader />
    <main id="top">
      <p class="notice" role="status">{{ notice }}</p>
      <HeroSection />
      <TickerStrip />
      <ProjectsSection :projects="projects" />
      <AboutSection />
      <ContactSection />
    </main>
    <SiteFooter />
  </div>
</template>
