<script lang="ts" setup>
import type { IPopItem } from '@/types/popup'
interface IProps {
	propsitem: IPopItem
}
const { propsitem } = defineProps<IProps>()
const popitem = propsitem

const init = (item: any) => {
	Object.assign(popitem, item)
	preventBack()
}

const action = (act: any) => {
	if (typeof act === 'function') {
		act()
	}
	if (act == null) {
		close()
	}
}

const close = () => {
	popitem.isShow = false
}
const preventBack = () => {
	if (process.client) {
		history.pushState(null, '', location.href)
		window.onbeforeunload = null
		window.onpopstate = () => {
			history.go(1)
		}
	}
}

defineExpose({
	init,
})
</script>
<template>
	<div v-show="popitem.isShow" :id="popitem.id" class="winPopWrap wrapMathUpNS popMathUp">
		<div
			class="layerPop typeIntro"
			:class="{ lecture: popitem.type === 'lecture', typeIntro2: popitem.type === 'lecture' }"
			style="z-index: 10"
		>
			<a
				v-if="popitem.type != 'examretry'"
				href="javascript:;"
				class="btnClose"
				@click="action(popitem.actionclose)"
				>닫기</a
			>
			<p class="txtMsg" :class="{ mt20: popitem.type != 'lecture' }" v-html="popitem.msg"></p>
			<div class="groupButton">
				<template v-if="popitem.type == 'alert'">
					<button type="button" class="btnRound" @click="action(popitem.action)">
						<span class="txt" v-html="popitem.btnName != null ? popitem.btnName : '확인'"></span>
					</button>
				</template>
				<template v-else-if="popitem.type == 'confirm'">
					<button type="button" class="btnRound" @click="close">
						<span class="txt">취소</span>
					</button>
					<button type="button" class="btnRound" @click="action(popitem.action)">
						<span class="txt" v-html="popitem.btnName != null ? popitem.btnName : '확인'"></span>
					</button>
				</template>
				<template v-else-if="popitem.type == 'lecture'">
					<div v-if="popitem.url != ''">
						<video
							ref="videoPlayerEdubase"
							style="width: 100%; background-color: black; margin-top: -15px"
							autoplay
							controlsList="nodownload"
							oncontextmenu="return false"
							controls
							defaultmuted
						>
							<source :src="popitem.url" type="video/mp4" />
						</video>
					</div>
				</template>
			</div>
		</div>
	</div>
</template>

<style scoped>
/*-------------------------------------------------------------------
## 레이어 팝업
-------------------------------------------------------------------*/
/* custom */
.lecture {
	width: 100%;
	min-width: 900px !important;
	min-height: 620px !important;
	margin-left: -8% !important;
}
.mt20 {
	margin-top: 20px;
}
/*-- 레이어팝업 - 기본 */
.winPopWrap.popMathUp {
	background: rgba(0, 0, 0, 0.75);
}
.popMathUp .layerPop {
	position: absolute;
	top: 50%;
	left: 50%;
	min-width: 374px;
	min-height: 240px;
	box-sizing: border-box;
	border: 2px solid #b567fe;
	background: rgba(0, 18, 24, 0.8);
	clip-path: polygon(
		58px 0,
		100% 0,
		100% calc(100% - 58px),
		calc(100% - 58px) 100%,
		0 100%,
		0 58px
	);
	-webkit-transform: translate(-50%, -50%);
	transform: translate(-50%, -50%);
}
.popMathUp .layerPop.typeIntro {
	width: 374px;
	height: 240px;
	padding-top: 40px;
}
.popMathUp .layerPop.typeIntro2 {
	width: 640px !important;
	height: 280px !important;
	padding-top: 40px !important;
}
.popMathUp .layerPop:before,
.popMathUp .layerPop:after {
	position: absolute;
	display: block;
	width: 83.4px;
	height: 3px;
	background: #b567fe;
	-webkit-transform-origin: center center;
	transform-origin: center center;
	content: '';
}
.popMathUp .layerPop:before {
	top: 26px;
	left: -15px;
	-webkit-transform: rotate(135deg);
	transform: rotate(135deg);
}
.popMathUp .layerPop:after {
	bottom: 26px;
	right: -15px;
	-webkit-transform: rotate(135deg);
	transform: rotate(135deg);
}
.popMathUp .layerPop .btnClose {
	position: absolute;
	right: 10px;
	top: 10px;
	width: 40px;
	height: 40px;
	background: url(//cdndata.milkt.co.kr/high/happ/Images/contents/ai_mathupNS/btn_close.png)
		no-repeat;
	background-size: 20px;
	background-position: 50%;
	font-size: 0;
}
.popMathUp .txtMsg,
.popMathUp .listMsg li {
	font-size: 22px;
	line-height: 1.7;
	color: #fff; /*font-family: 'NotoKrMedium', sans-serif*/
}
.popMathUp .txtMsg > em,
.popMathUp .listMsg li > em {
	font-family: inherit;
	font-weight: bold;
}
.popMathUp .txtMsg > span {
	font-family: inherit;
	font-weight: bold;
	color: #695c6c;
	font-size: 19px;
}
.popMathUp .txtMsg {
	text-align: center;
}
.popMathUp .groupButton {
	padding: 30px 0 45px;
	text-align: center;
}
.popMathUp .btnDiagonal {
	width: 143px;
	height: 59px;
	padding: 20px 0 18px;
	text-align: center;
}
.popMathUp .btnDiagonal + .btnDiagonal {
	margin-left: 20px;
}
.popMathUp .btnRound + .btnRound {
	margin-left: 20px;
}
.popMathUp .btnDiagonal .txt {
	font-size: 22px;
	line-height: 1em;
}
.popMathUp .btnClose {
	position: absolute;
	top: 0;
	right: 0;
	/* padding: 20px; */
}
.popMathUp .btnClose .icoClose {
	width: 19.5px;
	height: 19.5px;
	background: url(//cdndata.milkt.co.kr/high/happ/Images/contents/ai_mathup/ico_close02.png)
		no-repeat;
	background-size: 100%;
	vertical-align: top;
}
</style>
