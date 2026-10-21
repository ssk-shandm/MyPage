import { onMounted, ref } from 'vue'
import { applyReleaseData, NOTICES } from '../lib/apply-releases.js'

export function useReleases(initialProjects, fetcher = fetch) {
  const projects = ref(initialProjects)
  const notice = ref(NOTICES.pending)

  onMounted(async () => {
    try {
      const response = await fetcher('/api/releases', {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(10000),
        cache: 'no-store',
      })
      if (!response.ok) throw new Error('Release service unavailable')
      const result = applyReleaseData(await response.json(), projects.value)
      projects.value = result.projects
      notice.value = result.notice
    } catch {
      notice.value = NOTICES.unavailable
    }
  })

  return { projects, notice }
}
