<template>
  <div class="error-page">
    <div class="error-content">
      <h1>{{ error.statusCode }}</h1>
      <h2>{{ error.message }}</h2>
      <p v-if="error.statusCode === 404">
        요청하신 페이지를 찾을 수 없습니다.
      </p>
             <div v-if="error.statusCode === 404" class="debug-info">
         <h3>디버깅 정보</h3>
         <p><strong>현재 URL:</strong> {{ $route?.fullPath || '알 수 없음' }}</p>
         <p><strong>요청 경로:</strong> {{ $route?.path || '알 수 없음' }}</p>
         <p><strong>라우트 파라미터:</strong> {{ JSON.stringify($route?.params || {}) }}</p>
         <p><strong>브라우저 URL:</strong> {{ browserInfo.url }}</p>
         <p><strong>Nuxt.js 사용 가능:</strong> {{ browserInfo.nuxtAvailable ? '예' : '아니오' }}</p>
         <p><strong>현재 시간:</strong> {{ browserInfo.currentTime }}</p>
       </div>
      <button @click="goHome" class="home-button">
        홈으로 돌아가기
      </button>
      <button @click="goBack" class="back-button">
        이전 페이지로
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useRouter, computed } from '@nuxtjs/composition-api'

const props = defineProps({
  error: {
    type: Object,
    required: true
  }
})

const router = useRouter()

const goHome = () => {
  router.push('/')
}

const goBack = () => {
  router.go(-1)
}

// 브라우저 정보를 computed로 처리
const browserInfo = computed(() => ({
  url: typeof window !== 'undefined' ? window.location.href : '알 수 없음',
  nuxtAvailable: !!$nuxt,
  currentTime: new Date().toLocaleString()
}))
</script>

<style scoped>
.error-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.error-content {
  text-align: center;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

h1 {
  font-size: 4rem;
  color: #e74c3c;
  margin: 0;
}

h2 {
  font-size: 1.5rem;
  color: #2c3e50;
  margin: 1rem 0;
}

p {
  color: #7f8c8d;
  margin: 1rem 0;
}

button {
  margin: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s;
}

.home-button {
  background-color: #3498db;
  color: white;
}

.home-button:hover {
  background-color: #2980b9;
}

.back-button {
  background-color: #95a5a6;
  color: white;
}

.back-button:hover {
  background-color: #7f8c8d;
}

.debug-info {
  margin: 1rem 0;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 4px;
  text-align: left;
}

.debug-info h3 {
  margin: 0 0 0.5rem 0;
  color: #495057;
  font-size: 1.1rem;
}

.debug-info p {
  margin: 0.25rem 0;
  font-size: 0.9rem;
  color: #6c757d;
}
</style>
