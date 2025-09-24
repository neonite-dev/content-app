<script lang="ts" setup>
import Navbar from '~/components/navbar.vue'
import { defineComponent, useAsync, useRoute, watch } from '@nuxtjs/composition-api'
import { useMenusStore } from '~/stores/menus'
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'
import EventEmitter from 'events'
EventEmitter.defaultMaxListeners = 20

const menusStore = useMenusStore()
const { fetchMCodeData } = menusStore
const { menuData } = storeToRefs(menusStore)
const userStore = useUserStore()
const { userInfo } = storeToRefs(userStore)

const route = useRoute()?.value
interface IRouteParam {
	id: string | ''
	mCode: string | ''
}

watch(
	// () => (route?.query as unknown as IRouteParam)?.mCode,
	() => (route?.params as unknown as IRouteParam)?.id,
	val => {
		if (val != null) {
			useAsync(() => fetchMCodeData(userInfo.value?.UserID, val))
		}
	},
	{ deep: true, immediate: true },
)
</script>
<script lang="ts">
export default defineComponent({
	name: 'LayoutPopup',
	head: {
		link: [
			{
				rel: 'stylesheet',
				href: '//cdndata.milkt.co.kr/ele/www/web-static/css/common_v5.css',
			},
		],
		script: [
			{
				src: '//cdata.milkt.co.kr/edubank/edubank/common/js/jquery-1.10.2.min.js',
			},
		],
	},
})
</script>
<template>
	<div id="contents">
		<Navbar :menus="menuData"></Navbar>
		<div><nuxt /></div>
	</div>
</template>

<style>
body {
	width: 100%;
	overflow-x: hidden;
	min-width: 1280px !important;
}
#__nuxt {
	width: 100%;
	height: 100%;
	background-color: #ffffff;
}
#__layout {
	width: 100%;
	height: 100%;
	background-color: #ffffff;
}
</style>
