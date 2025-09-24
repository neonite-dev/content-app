<script lang="ts" setup>
import LayoutHeader from '~/components/header.vue'
import Navbar from '~/components/navbar.vue'
import { defineComponent, useAsync } from '@nuxtjs/composition-api'
import { useMenusStore } from '~/stores/menus'
import { storeToRefs } from 'pinia'
import EventEmitter from 'events'
EventEmitter.defaultMaxListeners = 20

const menusStore = useMenusStore()
const { fetchMenuData } = menusStore
const { menuData } = storeToRefs(menusStore)
useAsync(() => fetchMenuData())
</script>
<script lang="ts">
export default defineComponent({
	name: 'LayoutDefault',
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
	<div id="contents">
		<LayoutHeader :menus="menuData"></LayoutHeader>
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
zz