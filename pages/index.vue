<script lang="ts" setup>
import type { IMenuState } from '@/types/menu'
import { useMenusStore } from '@/stores/menus'
import { storeToRefs } from 'pinia'
import { defineComponent, ref, useMeta, useRoute, watch } from '@nuxtjs/composition-api'
import { useFrameResize } from '@/composables/use-frame-resize'
import ContentsFrame from '@/components/contents/Frame.vue'
useMeta({
	title: 'MilkT Multi Device Player Svc4',
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
		if (menuData?.value != null) {
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

<script lang="ts">
export default defineComponent({
	middleware: ['check-route'],
	head: {},
})
</script>

<template>
	<div id="cont" ref="cont">
		<div class="center">
			<!-- menuData가 로드된 후에만 Frame.vue 렌더링 -->
			<ContentsFrame v-if="menuData" :menus="menuData" />
			<div v-else style="padding: 20px; text-align: center; color: #666;">
				메뉴 데이터 로딩 중...
			</div>
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
