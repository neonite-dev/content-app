# pages

## 기능 정의

- `script` page, component 독립 스크립트 정의
```javascript
// typescript setup을 기본으로 사용 하며 composition-api를 적용
<script lang="ts" setup>
import {
	computed,
	defineComponent,
	onMounted,
	ref,
	useAsync,
	useMeta,
} from '@nuxtjs/composition-api'
</script>

```

- setup 에서 meta정보 및 스크립트 적용시  defineComponent를 사용
- 로컬 개발 시 `webdevj3` 계정으로 연결되도록 설정됨
    - url 구분 [middleware/check-auth.ts](../middleware/check-auth.ts) - 최초 접근시 미들웨어에서 자동 설정
```javascript
// defineComponent 적용 시
<script lang="ts">
export default defineComponent({
	name: 'PageEle',
	layout: 'ele',
	middleware: ['check-auth', 'check-route'],
	head: {
		link: [
			{
				rel: 'stylesheet',
				href: 'css/common.css',
			},
		],
		script: [
			{ src: '//cdndata.milkt.co.kr/ele/app/web-static-dev/js/jquery-1.7.min.js' },
		],
	},
})
</script>

```
- `template` body 영역의 html source
```javascript

<template>
	<div id="content1" class="body_aiSubject">
        ....
    </div>
</template>

```
- `style` page, component 스타일 정의 (`<style scoped>` 사용시 해당 vue만 적용)
- nuxt3 의 bridge를 위해 `composition-api`를 적용
- 기본 사용법은 [Nuxt pages 참고](https://v2.nuxt.com/docs/directory-structure/pages)

```html

<style scoped>
.innerFeature {
	top: 0px !important;
	width: 170px !important;
}
</style>

```

1. `page 정의` - *index.vue 한페이지로 구성이 가능하나 옵션 및 도메인 변경시 이슈방지를 위해 분리*
    - [_company](./_company/_id.vue) : dynamic 라우팅을 위해 route id로 사이트 및 차시 구분 (최초의도는 회사별 접근이었으나 Prefix로 용도 변경 - 하위 컨텐츠의 _id는 차시코드 구분)
    - [contents](./contents/_id.vue) : 컨텐츠 별 HTML 화면구성. dynamic 라우팅을 위해 route id로 사이트 구분
    - [ele](./ele/index.vue) : 초등 컨텐츠 메인화면 (추후 확장을 위해 Prefix로 정의 ele/mid/high)
    - [index.vue](./index.vue): root index 페이지
    
2. `components` Route 될 폴더 추가
    - Components 폴더 명 + 파일명 지정시 별도 import를 설정 안함 (package - @nuxt/components)
        - contents : 컨텐츠 기능 구성
            - Edubase: 문제 풀이 컴포넌트
            - Frame: 컨텐츠 iframe 영역 컴포넌트
            - LayerPop: 컨텐츠 팝업 컴포넌트
        - header : header 구성
        - navbar : 네이게이션 구성
3. `API` - Route 될 폴더 추가
    - context.$axios 사용시 plugin으로 정의됨
    - instance 재정의를 위해 `api`폴더 이용
    - proxy 설정을 위해 [nuxt.config.js](../nuxt.config.js) 정의
    - 개발 의도 상 proxy 직접호출 이었으나 사이트 권한설정으로 인한 identity 직접변경이 불가하여 gate를 구성 후 참조
4. `composables` - nuxt3 의 bridge를 위해 hook 적용
    - use-cookie : 쿠키설정 hook
    - use-frame-resize : 화면 리사이징 정의 hook
    - use-hybrid-app : HybridApp 설정 hook
    - use-state : 상태값 설정 hook
5. `store` - nuxt3 의 bridge를 위해 pinia를 사용 (vuex 미적용)

##### [<< back](../README.md)