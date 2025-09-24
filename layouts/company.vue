<script lang="ts" setup>
import Navbar from '~/components/navbar.vue'
import { useAsync } from '@nuxtjs/composition-api'
import { useMenusStore } from '~/stores/menus'
import { storeToRefs } from 'pinia'
import EventEmitter from 'events'
EventEmitter.defaultMaxListeners = 20

const menusStore = useMenusStore()
const { fetchMenuData } = menusStore
const { menuData } = storeToRefs(menusStore)
useAsync(() => fetchMenuData())
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
