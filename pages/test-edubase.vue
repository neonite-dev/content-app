<template>
  <div class="test-page">
    <h1>에듀베이스 라우팅 테스트</h1>
    <div class="test-info">
      <h2>현재 상태</h2>
      <p><strong>현재 URL:</strong> {{ currentUrl }}</p>
      <p><strong>라우트 경로:</strong> {{ $route?.path || '알 수 없음' }}</p>
      <p><strong>라우트 파라미터:</strong> {{ JSON.stringify($route?.params || {}) }}</p>
      <p><strong>Nuxt.js 상태:</strong> {{ nuxtStatus }}</p>
    </div>
    
    <div class="test-links">
      <h2>테스트 링크</h2>
      <a href="/dit/ele/T1SE31U12003/edubase/1" class="test-link">
        에듀베이스 테스트 1
      </a>
      <a href="/dit/ele/T1SE31U12003/edubase/2" class="test-link">
        에듀베이스 테스트 2
      </a>
      <a href="/dit/ele/T1KE31U12002/edubase/1" class="test-link">
        다른 차시 테스트
      </a>
    </div>
    
    <div class="debug-info">
      <h2>디버깅 정보</h2>
      <p><strong>페이지 로드 시간:</strong> {{ pageLoadTime }}</p>
      <p><strong>브라우저:</strong> {{ userAgent }}</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from '@nuxtjs/composition-api'

const currentUrl = ref('')
const pageLoadTime = ref('')
const userAgent = ref('')

onMounted(() => {
  currentUrl.value = window.location.href
  pageLoadTime.value = new Date().toLocaleString()
  userAgent.value = navigator.userAgent
})

const nuxtStatus = computed(() => {
  return $nuxt ? '사용 가능' : '사용 불가'
})
</script>

<style scoped>
.test-page {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.test-info, .test-links, .debug-info {
  margin: 2rem 0;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f9f9f9;
}

.test-link {
  display: block;
  margin: 0.5rem 0;
  padding: 0.5rem 1rem;
  background-color: #007bff;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  text-align: center;
}

.test-link:hover {
  background-color: #0056b3;
}

h1 {
  color: #333;
  text-align: center;
}

h2 {
  color: #666;
  margin-top: 0;
}

p {
  margin: 0.5rem 0;
}
</style>
