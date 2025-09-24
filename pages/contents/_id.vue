<script lang="ts" setup>
import type { IMenuState } from '@/types/menu'
import { useMenusStore } from '@/stores/menus'
import { storeToRefs } from 'pinia'
import { defineComponent, ref, useMeta, useRoute, watch } from '@nuxtjs/composition-api'
import { useFrameResize } from '@/composables/use-frame-resize'
import ContentsFrame from '@/components/contents/Frame.vue'
useMeta({
	title: `MilkT Multi Device Player`,
})

const menusStore = useMenusStore()
const { setPid } = menusStore
const { menuData } = storeToRefs(menusStore)

const cont = ref()

interface IRouteParam {
	id: string | ''
}
const route = useRoute()?.value
useFrameResize()
watch(
	() => (route?.params as unknown as IRouteParam)?.id,
	val => {
		if (menuData != null) {
			const menuInfo = menuData?.value as IMenuState
			if (menuInfo?.pid === undefined || val === undefined) {
				setPid(menuInfo?.menuItems[0]?.id)
			} else {
				setPid(val)
			}
		}
	},
	{ deep: true, immediate: true },
)
</script>
0
<script lang="ts">
export default defineComponent({
	name: 'PageContents',
	middleware: ['check-route'],
	head: {
		link: [
			{
				rel: 'stylesheet',
				href: '//cdndata.milkt.co.kr/ele/www/web-static/css/common_v5.css',
			},
		],
	},
})
</script>

<template>
	<div id="cont" ref="cont">
		<div class="center">
			<ContentsFrame :menus="menuData" />
		</div>
	</div>
</template>

<style>
.center {
	text-align: center;
	margin-top: 0px;
	background-color: #ffffff;
}
</style>
