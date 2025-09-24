export default function ({ app }, inject) {
  // 클라이언트에서만 jQuery 로드
  if (process.client) {
    const script = document.createElement('script')
    script.src = '//cdndata.milkt.co.kr/ele/app/web-static-dev/js/jquery-1.7.min.js'
    script.onload = () => {
      console.log('🔥 jQuery 로드 완료')
      // jQuery가 로드된 후 전역으로 노출
      window.$ = window.jQuery
    }
    script.onerror = () => {
      console.error('🔥 jQuery 로드 실패')
    }
    document.head.appendChild(script)
  }
}
