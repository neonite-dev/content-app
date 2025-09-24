<script setup lang="ts">
import { useRouter, computed, useRoute, defineComponent } from '@nuxtjs/composition-api'
import { useState } from '@/composables/use-state'
import { useMenusStore } from '~/stores/menus'
import type { MenuItem, IMenuState } from '~/types/menu'
const menusStore = useMenusStore()
const { setIfXmlDocMenuIdx } = menusStore
const router = useRouter()
const route = useRoute()
interface IProps {
	menus: IMenuState
}
const { menus } = defineProps<IProps>()
const [companyId] = useState(route.value?.params?.company || '')
const menuItemsFilter = computed(() => {
	const item = menus.menuItems.find(m => m.id === menus.pid) || ({} as MenuItem)
	return menus.menuItems.filter(m => m.group_id === item?.group_id)
})

const selMenuItemChange = (event: any): void => {
	const item = menus.menuItems.find(m => m.id === event.target?.value)
	if (item?.id !== undefined) {
		router.push(`/${companyId?.value === '' ? 'contents' : companyId?.value}/${item.id}`)
	}
}

const selMenuItemSubChange = (event: any): void => {
	const idx = parseInt(event.target?.value)
	console.log(event.target)
	if (menus.listMenuDatas?.menuIdx !== idx) {
		setIfXmlDocMenuIdx(menus.listMenuDatas.menuIdx !== idx ? idx : 0)
	}
}

const selPoupuChange = (event: any): void => {
	const popurl = event.target?.value
	//setIfXmlDocMenuIdx(menus.listMenuDatas.menuIdx !== idx ? idx : 0)
		
	if(popurl == "0"){
		alert("서드파티 앱입니다.")
		return
	}
	const cbW = 1280
	const cbH = 800 + 55 + 5
	
	let xPos = document.body.offsetWidth / 2 - cbW / 2 // 가운데 정렬
	xPos += window.screenLeft // 듀얼 모니터일 때
	const yPos = window.screen.height / 2 - cbH / 2
	window.open(
		`${popurl}`,
		'hbapp_popup',
		`width=${cbW}, height=${cbH}, left=${xPos}, top=${yPos - 50}, scrollbars=no, menubar=no, status=no, titlebar=no, resizable=no`,
	)

}

const btnMoveNext = (): void => {
	if (menus.listMenuDatas.menuIdx < menus.listMenuDatas.cjMenuDatas.length - 1) {
		setIfXmlDocMenuIdx(menus.listMenuDatas.menuIdx + 1)
	}
}
</script>
<script lang="ts">
export default defineComponent({
	head: {},
})
</script>

<template>
	<div class="top_con">
		<!-- 레벨 셀렉트박스 -->
		<div id="div_Unit1" class="selbox lvl">
			<select v-show="menuItemsFilter.length == 0"></select>
			<ClientOnly>
				<select
					id="ddl_Unit1"
					class="selectbox"
					tabindex="1"
					title="레벨"
					downHeight="584px"
					@change="selMenuItemChange"
				>
					<option
						v-for="(item, index) in menuItemsFilter"
						:key="index"
						:value="item.id"
						:selected="item.id === menus.pid"
					>
						{{
							item.info != null ? item.info : `${item.grade}학년 ${item.chapter}단원 - ${item.step}`
						}}
					</option>
				</select>
			</ClientOnly>
		</div>

		<h4>
			<div id="div_info1">
				{{ menus.listMenuDatas?.title }}
				<span class="step"
					><em>{{ menus.listMenuDatas?.chapter }} 단원</em>
				</span>
			</div>
		</h4>

		<!-- 중단원 셀렉트박스 -->
		<div id="div_Unit2" class="selbox lesson">
			<select
				id="ddl_Unit2"
				class="selectbox"
				tabindex="1"
				title="unit2"
				@change="selMenuItemSubChange"
			>
				<option
					v-for="(item, index) in menus.listMenuDatas?.cjMenuDatas"
					:key="item.filePath"
					:value="index"
					:selected="index == menus.listMenuDatas.menuIdx"
				>
					{{ item.title }}
				</option>
			</select>
		</div>
		<!--성취도 평가 -->
		<div id="div_Achieve">
			<a href="javascript:;" class="btn_achieve" @click="btnMoveNext"><span>다음메뉴</span></a>
		</div>
		<!-- 중단원 셀렉트박스 -->
		<div id="div_Unit3" class="selbox lv2">
			<select @change="selPoupuChange">
				<option value="">외부링크 팝업</option>
				<option value="//app.milkt.co.kr/AppDictionary/Dictionary_MyDic?SubjectCode=MY&Cs=1&vbGrade=3&vbTerm=1">용어사전</option>
				<option value="0">백과사전</option>
				<option value="//app.milkt.co.kr/AppCommon/AIChatbot?strPage=AppMain">AI 학습챗봇</option>
				<option value="//app.milkt.co.kr/AppDictionary/Dictionary_kr?Cs=1&vbGrade=3">국어사전</option>
				
			</select>
		</div>
	</div>
</template>

<style scoped>
.top_con {
	position: relative;
	padding: 5px 0px 8px 0px;
	width: 100%;
	height: 39px;
	border-bottom: 3px solid #69b3b9;
}
#div_info1 {
	padding-left: 60px;
}
.selbox.lvl {
	position: absolute;
	top: 10px;
	left: 30px;
}

.selbox.lv2 {
	position: absolute;
	top: 10px;
	left: 790px !important;
}
.selbox {
	z-index: 5;
	position: absolute;
	top: 16px;
	left: 98px;
}
.top_con h4 {
	display: inline-block;
	padding-left: 5%;
	/* background: url(http://cdndata.milkt.co.kr/ele/app/images/english/ico_english_00_x2.png) no-repeat 0 2px; */
	background-size: 35px;
}
.top_con h4 {
	display: inline-block;
	font-size: 21px;
	font-weight: normal;
	color: #2e2f2f;
	letter-spacing: -2px;
	line-height: 44px;
	margin: 0 0 0 110px;
}
.top_con .selbox.lesson {
	position: absolute;
	top: 10px;
	left: auto;
	right: 130px !important;
}
.selbox * {
	outline-style: none;
}
input,
select,
option {
	outline: none;
}
select {
	/* height: 32px; */
	min-width: 175px;
	padding: 0 0 0 6px;
	border: 1px solid #c1c1c1;
	border-radius: 5px;
	font-size: 20px;
	margin: 0 4px 0 0;
	/* background: url(http://cdndata.milkt.co.kr/ele/app/images/setting/ico_setting.png) no-repeat 100% -650px #fff; */
}
select {
	color: #848484;
	-webkit-appearance: listbox;
	font-family: 'Noto Sans KR', Dotum, '돋움', Arial, sans-serif;
}
.top_con .lvl .sbHolder {
	width: 125px;
	height: 37px;
}
.sbHolder {
	font-weight: bold;
	color: #2c2c2c;
	font-size: 18px;
	border: 1px solid #9d9d9d;
}
.selbox .sbOptions {
	top: 33px !important;
	left: -1px !important;
	padding-top: 8px !important;
	background: #fff;
	border: solid 1px #9d9d9d !important;
	border-radius: 6px !important;
	border-top-left-radius: 0px !important;
	border-top-right-radius: 0px !important;
	border-top: 0px !important;
}
.selbox .sbOptions {
	top: 33px !important;
	left: -1px !important;
	padding-top: 8px !important;
	background: #fff;
	border: solid 1px #9d9d9d !important;
	border-radius: 6px !important;
	border-top-left-radius: 0px !important;
	border-top-right-radius: 0px !important;
	border-top: 0px !important;
}
.sbOptions {
	background-color: #fff;
	border: solid 1px #457dd0;
	list-style: none;
	left: -1px;
	margin: 0;
	padding: 0;
	position: absolute;
	top: 30px;
	/* width: 200px; */
	width: 100%;
	z-index: 10;
	overflow-y: auto;
	border-radius: 5px;
}
.selbox .sbSelector {
	height: 37px !important;
	font-size: 18px !important;
	color: #2c2c2c !important;
	line-height: 37px !important;
}
.sbSelector:link,
.sbSelector:visited,
.sbSelector:hover {
	color: #000;
	outline: none;
	text-decoration: none;
}
a:link,
a:visited {
	text-decoration: none;
}
.sbSelector {
	display: block;
	height: 30px;
	left: 0;
	line-height: 30px;
	outline: none;
	overflow: hidden;
	position: absolute;
	text-indent: 10px;
	top: 0;
	width: 100%;
	/* width: 170px; */
}
a,
button {
	text-decoration: none;
	cursor: pointer;
	-webkit-tap-highlight-color: rgba(0, 0, 0, 0);
	text-decoration-skip-ink: none;
	outline: none;
}
em.tit {
	display: none;
	margin: 0;
	color: #ba3932;
	font-weight: bold;
}
em,
address {
	font-style: normal;
}
.step {
	display: inline-block;
	margin: 0 0 0 15px;
	height: 42px;
	line-height: 44px;
	font-size: 21px;
	font-weight: bold;
	color: #161719;
	background: url(//cdndata.milkt.co.kr/ele/app/images/english/ico_english_x2.png) no-repeat 0 -591px;
	background-size: 100px;
}
.step em {
	padding: 0 0 0 31px;
	color: #2b748a;
}
.btn_achieve {
	position: absolute;
	top: 9px;
	right: 20px;
	display: inline-block;
	vertical-align: top;
	width: 100px;
	height: 32px;
	line-height: 32px;
	text-align: center;
	background: #09b0aa;
	border: 1px solid #16aaa4;
	box-shadow: 0 1px 0 #72cbc8 inset;
	border-radius: 5px px;
}
.btn_achieve > span {
	font-size: 17px;
	font-weight: bold;
	color: #fff;
}
</style>
