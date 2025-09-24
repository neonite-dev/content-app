<script lang="ts" setup>
import type { IPopItem } from '@/types/popup'
import { loadScript, unloadScript } from '@/utils'
import { onUnmounted, ref } from '@nuxtjs/composition-api'
import { postData } from '@/api'
interface IProps {
	recitem: IPopItem
}
const { recitem } = defineProps<IProps>()
const popitem = recitem

const refSttId = ref<string>('')
const refFinish = ref<string>('')
const refSendEnd = ref<string>('')
const refResult = ref<string>('')
const refDataIndex = ref<number>(0)
const config = {
	headers: {
		'API-KEY-ID': process.env.API_STT_KEY_ID,
		'API-KEY': process.env.API_STT_KEY,
	},
	withCredentials: true,
}

onUnmounted(() => {
	clear()
})

const init = (item: any) => {
	Object.assign(popitem, item)
	initVal()
	if (item.msg) {
		refResult.value = item.msg
	}
	loadScriptRecord()
	preventBack()
}

const initVal = () => {
	// refSttId.value = ''
	refFinish.value = ''
	refSendEnd.value = ''
	refDataIndex.value = 0
	// refResult.value = ''
}

const action = (act: any) => {
	if (typeof act === 'function') {
		act()
	}
	if (act == null) {
		close()
	}
}
const actionCallback = (act: any) => {
	if (typeof act === 'function') {
		act()
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

const clear = () => {
	if (document.head.querySelector("script[src*='recorder/recorder.js']") != null) {
		if (typeof DestroyAudio === 'function') DestroyAudio()
		unloadScript('js/recorder/recorder.js')
		unloadScript('js/recorder/recorderworker.js')
		unloadScript('js/recorder/useaudio.js')
	}
}

function loadScriptRecord() {
	if (popitem.isShow) {
		if (document.head.querySelector("script[src*='recorder/recorder.js']") == null) {
			loadScript('js/recorder/recorder.js').then(() => {
				loadScript('js/recorder/useaudio.js').then(() => {
					initAudio(
						function () {
							console.log('initAudio')
							startStt()
						},
						function () {
							micInitAudio = false
						},
					)
				})
			})
		} else {
			initAudio(
				function () {
					console.log('initAudio')
					startStt()
				},
				function () {
					micInitAudio = false
				},
			)
		}
	}
}
const startStt = async () => {
	initVal()
	refSttId.value = ''
	await prepare()
	startRecording(onRecordUpdate)
	console.log('startRecording(onRecordUpdate)')
}
const prepare = async () => {
	const data = (await postData(
		`stt/prepare`,
		{
			modelId: '1',
			useEpd: 1,
			codec: 1,
			midResult: 1,
			sttType: 0,
		},
		config,
	)) as any
	if (data) {
		refSttId.value = data.sttId
	}
	return data
}
const sendData = async (dataIdx: number, dataValue: string) => {
	if (refFinish.value !== '') return
	const data = (await postData(
		`stt/sendData`,
		{
			sttId: refSttId.value,
			dataIndex: dataIdx,
			data: dataValue,
		},
		config,
	)) as any
	if (data) {
		if (data.analysisResult?.progressCode === 'P03') {
			refSendEnd.value = '1'
			stopRecording(onRecordDone)
			console.log(`stopRecording(onRecordDone)`)
		}
		if (data.analysisResult?.midResult != null && data.analysisResult?.midResult !== '') {
			refResult.value = data.analysisResult?.midResult
			if (typeof popitem.actionCallback === 'function') {
				actionCallback(popitem.actionCallback(data.analysisResult?.midResult))
				console.log(`sendData > actionCallback - ${data.analysisResult?.midResult}`)
			}
		}
	}

	return data
}
const finish = async () => {
	console.log('finish')
	if (refFinish.value !== '') return
	refFinish.value = 'ready'
	const data = await postData(
		`stt/finish`,
		{
			sttId: refSttId.value,
		},
		config,
	)
	if (data) {
		refFinish.value = JSON.stringify(data)
		refResult.value = data?.analysisResult?.result
		refSttId.value = ''
		if (typeof popitem.actionFinish === 'function') {
			action(popitem.actionFinish(refResult.value))
			console.log(data)
			clear()
		}
	}
	return data
}

const onRecordUpdate = (buffer: any) => {
	if (refFinish.value === '' && refSendEnd.value === '' && refSttId.value !== '') {
		const buf = encodeBase64Bytes(new Uint8Array(buffer))
		refDataIndex.value = refDataIndex.value + 1
		sendData(refDataIndex.value, buf)
	}
}

const stopStt = () => {
	if (refSttId.value !== '') {
		refSendEnd.value = '1'
		stopRecording(onRecordDone)
	}
}

const onRecordDoneTimeout = () => {
	onRecordFinish()
}
const onRecordDone = () => {
	onRecordFinish()
}

const onRecordFinish = () => {
	finish()
}

function encodeBase64Bytes(bytes: Uint8Array): string {
	return btoa(bytes.reduce((acc, current) => acc + String.fromCharCode(current), ''))
}

function getResultValue(): string {
	return refResult.value
}
defineExpose({
	init,
	getResultValue,
})
</script>
<template>
	<div
		v-if="popitem.isShow"
		:id="popitem.id"
		class="winPopWrap wrapMathUpNS popMathUp"
		:style="{ display: popitem.isHide ? 'none' : 'block' }"
	>
		<div class="layerPop typeIntro" style="z-index: 10">
			<a href="javascript:;" class="btnClose" @click="action(popitem.actionclose)">닫기</a>
			<p v-if="refResult !== ''" class="txtMsg mtm20" v-html="refResult"></p>
			<p
				v-else-if="refResult === '' && popitem.msg !== ''"
				class="txtMsg mtm20"
				v-html="popitem.msg"
			></p>
			<p v-else class="txtMsg mtm20">큰소리로 말해보세요</p>
			<div class="groupButton">
				<div style="margin: -120px">
					<img src="include/img/play_00000.png" style="width: 300px; height: 300px" />
				</div>
				<div class="mt40">
					<button type="button" class="btnRound" @click="stopStt()">
						<span class="txt" v-html="popitem.btnName != null ? popitem.btnName : '확인'"></span>
					</button>
				</div>
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
.mt40 {
	margin-top: 40px;
}
.mtm20 {
	margin-top: -25px;
	font-size: 15px !important;
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
