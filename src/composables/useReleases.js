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
      // 接口本身可能只带回错误码，这里仍用兜底数据渲染，只替换提示语。
      const result = applyReleaseData(await response.json(), projects.value)
      projects.value = result.projects
      notice.value = result.notice
    } catch {
      notice.value = NOTICES.unavailable
    }
  })

  return { projects, notice }
}
