<script lang="ts" setup>
import { useMenusStore } from '@/stores/menus'
import { storeToRefs } from 'pinia'
import { defineComponent, ref, useMeta, watch } from '@nuxtjs/composition-api'
import { useFrameResize } from '@/composables/use-frame-resize'
import ContentsFrame from '@/components/contents/Frame.vue'

useMeta({
	title: `MilkT Multi Device Player`,
})

const menusStore = useMenusStore()
const { setPid } = menusStore
const { menuData } = storeToRefs(menusStore)

const cont = ref()

useFrameResize()
watch(
	() => menuData?.value?.pid,
	val => {
		if (val != null && val !== '') {
			setPid(val)
		}
	},
	{ deep: true, immediate: true },
)
</script>
<script lang="ts">
export default defineComponent({
	name: 'PageContents',
	layout: 'popup',
	middleware: ['check-auth', 'check-route'],
	head: {},
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
