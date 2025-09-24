<script lang="ts" setup>
import { defineComponent } from '@nuxtjs/composition-api'
import type { IMenuState } from '~/types/menu'

interface Props {
	menus: IMenuState
}
const { menus } = defineProps<Props>()

function groupTopMenu(groupId: string) {
	return menus.menuItems?.find(m => m.group_id === groupId)?.id
}
</script>

<script lang="ts">
export default defineComponent({
	name: 'LayoutHeader',
	head: {},
})
</script>

<template>
	<div id="header">
		<div class="header_top">
			<div>
				<div id="tnb">
					<ul class="specialMenu">
						<li>
							<a href="#" data-id="favorite"> 즐겨찾기 </a>
						</li>
						<li>
							<a href="/HME/sellpa">T셀파</a>
						</li>
						<li>
							<a href="https://mall.chunjae.co.kr/" target="_blank"> 천재교육 쇼핑몰 </a>
						</li>
						<li>
							<a href="/bookclub/index" target="_blank"> 밀크T북클럽 </a>
						</li>
						<li>
							<a href="https://i.milkt.co.kr/" target="_blank"> 밀크T아이 </a>
						</li>
						<li>
							<a href="http://mid.milkt.co.kr/" target="_blank"> 밀크T중학 </a>
						</li>
						<li>
							<a href="https://high.milkt.co.kr/" target="_blank"> 밀크T고등 </a>
						</li>
					</ul>

					<ul class="myMenu">
						<li>
							<a href="/Login/Login">로그인</a>
						</li>
						<li>
							<a href="/member/join_intro">가입하기</a>
						</li>
						<li>
							<a href="/cs/cs_faq">고객센터</a>
						</li>
						<li class="icoBell">
							<a href="/lounge/notice_list">밀크T 소식</a>
						</li>
					</ul>
				</div>
			</div>
		</div>
		<div class="gnb_area">
			<h1>
				<NuxtLink to="/"><span>밀크T 초등</span></NuxtLink>
			</h1>
			<ul id="gnb">
				<li
					v-for="(item, index) in menus.menuGroups"
					:key="index"
					:class="{
						on:
							$route.params.id == null ? index === 0 : $route.params.id.indexOf(item.group_id) == 0,
					}"
				>
					<NuxtLink :to="`/contents/${groupTopMenu(item.group_id)}`"
						><span>{{ item.group_nm }} </span></NuxtLink
					>
				</li>
			</ul>
			<div class="gnbMenu">
				<a href="/Common/Sitemap" class="allMenu"></a>
			</div>
			<div class="gnb_back"></div>
		</div>
	</div>
</template>

<style scoped>
#header {
	position: relative;
	z-index: 200;
	width: 100%;
	min-width: 1280px !important;
	height: 111px;
	margin: 0;
	padding: 0;
	background: #fff;
}
</style>
