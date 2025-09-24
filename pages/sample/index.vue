<script lang="ts" setup>
import { defineComponent, onMounted, onUnmounted, ref } from '@nuxtjs/composition-api'
import { postData } from '@/api'
import Recorder from '@/utils/record/Recorder'
import type { IRecorderOption } from '@/types/frame'
import ContentsRecPop from '@/components/contents/RecPop.vue'
import type { IPopItem } from '@/types/popup'
import { loadScript, unloadScript } from '@/utils'

const ifWinRecord = ref('')
const ifWinRecordCallbackId = ref('')
const refRecord = ref<string>('')
const refSttId = ref<string>('')
const refSendData = ref([])
const refFinish = ref<string>('')
const refProgressCode = ref<string>('')
const refRecordDatas = ref([])
const refSendEnd = ref<string>('')
const refBlobUrl = ref()
const refDataIndex = ref<number>(0)
const refPopResult = ref<string>('')

const recpop = ref<HTMLDivElement | null>(null)
const popitem = ref<IPopItem>({
	isShow: false,
	id: 'recPlayer',
	type: 'alert',
	msg: '123',
})
// const fs = require('fs')
// const apiHost = 'https://t-stt.chunjaeai.com/stt/'
// const apiHost = 'https://wstt.chunjaeai.com/stt/'
// const apiHost = 'stt/'
const config = {
	headers: {
		'API-KEY-ID': process.env.API_STT_KEY_ID, // 'IMILKT_TEST',
		'API-KEY': process.env.API_STT_KEY, // 'xRpqzYT0RHVOAgFr',
	},
	withCredentials: true,
}
onMounted(() => {
	console.log('initLoad')
	init()
})
onUnmounted(() => {
	console.log('initLoad')
	init()
})

const init = () => {
	ifWinRecord.value = ''
	ifWinRecordCallbackId.value = ''
	refRecord.value = ''
	refSttId.value = ''
	refSendData.value = []
	refFinish.value = ''
	refProgressCode.value = ''
	refRecordDatas.value = []
	refSendEnd.value = ''
	refDataIndex.value = 0
	refPopResult.value = ''
}
const startStt = async (flag?: string) => {
	init()
	if (flag && flag === '1') {
		await prepare()
		await startRecordRealTime('1')
	} else {
		await startRecord('1')
	}
}

function sendView(view: any) {
	const base64 = encodeBase64Bytes(new Uint8Array(view.buffer))
	const xhr = new XMLHttpRequest()
	xhr.withCredentials = true
	xhr.open('post', 'stt/upload', true)
	xhr.setRequestHeader('API-KEY-ID', process.env.API_STT_KEY_ID)
	xhr.setRequestHeader('API-KEY', process.env.API_STT_KEY)
	// xhr.open('post', 'https://wstt.chunjaeai.com/stt/upload', true)
	// xhr.setRequestHeader('API-KEY-ID', 'IMILKT_SERVICE')
	// xhr.setRequestHeader('API-KEY', 'p0kagTWcNVWAm3kU')
	const frm = new FormData()
	frm.append('modelId', '1')
	frm.append('contentbytes', base64)
	frm.append('format', 'wav')
	frm.append('uploadType', '2')
	frm.append('codec', 1)

	xhr.onreadystatechange = function () {
		if (this.readyState === 4 && this.status === 200) {
			const jsonValue = JSON.parse(this.responseText)
			console.log(jsonValue)
			refFinish.value = jsonValue
		}
	}
	xhr.send(frm)
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
		// refSendData.value.push(data)
		if (data?.analysisResult?.progressCode === 'P03') {
			refSendEnd.value = '1'
			stopRecording(onRecordDone)
		}
	}

	return data
}
const finish = async () => {
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
		refFinish.value = data
	}
	return data
}

const startRecordRealTime = (id: string): Promise<void> => {
	console.log(`window.HybridApp.startRecord(${id})`)
	startRecording(onRecordUpdate)
}

const onRecordUpdate = (buffer: any) => {
	console.log(buffer)
	if (refFinish.value === '' && refSendEnd.value === '' && refSttId.value !== '') {
		const buf = encodeBase64Bytes(new Uint8Array(buffer))
		refDataIndex.value = refDataIndex.value + 1
		sendData(refDataIndex.value, buf)
	}
}

const stopRecordRealTime = () => {
	console.log('stopRecord')
	refSendEnd.value = '1'
	stopRecording(onRecordDone)
}

const onRecordDoneTimeout = () => {
	console.log('onRecordDoneTimeout')
	onRecordFinish()
}
const onRecordDone = () => {
	console.log('onRecordDone')
	onRecordFinish()
}

const onRecordFinish = () => {
	console.log('onRecordFinish')
	finish()
}

function encodeBase64Bytes(bytes: Uint8Array): string {
	return btoa(bytes.reduce((acc, current) => acc + String.fromCharCode(current), ''))
}

const startRecord = async (id: string): Promise<void> => {
	console.log(`window.HybridApp.startRecord(${id})`)
	if (navigator.mediaDevices) {
		const devices = await navigator.mediaDevices.enumerateDevices()
		const audioDevices = devices.filter(device => device.kind === 'audioinput')
		if (audioDevices.length > 0) {
			ifWinRecordCallbackId.value = id
			// let idx = 1
			const options: IRecorderOption = {
				bitRate: 128,
				sampleRate: 44100,
				// onaudioprocessCallback: function (stream) {
				// 	if (refSendEnd.value !== '2' && refSttId.value !== '') {
				// 		const buf = encodeBase64Bytes(new Uint8Array(stream.buffer))
				// 		sendData(idx, buf)
				// 		idx = idx + 1
				// 	}
				// },
			}
			ifWinRecord.value = new Recorder({
				micFailed: () => {
					console.log('Recorder error')
				},
				bitRate: options.bitRate,
				sampleRate: options.sampleRate,
				// onaudioprocessCallback: options.onaudioprocessCallback,
				volume: 1,
			})
			ifWinRecord.value?.startStt()
		} else {
			console.log('마이크 설정이 되어있지 않습니다.')
		}
	} else {
		console.log('마이크 설정이 되어있지 않습니다.')
	}
}

const stopRecord = async () => {
	if (ifWinRecord.value && ifWinRecordCallbackId.value !== '') {
		await ifWinRecord.value.stopStt()
		const recordList = ifWinRecord.value?.recordList()
		if (recordList) {
			console.log(recordList)
			// const reader = new FileReader()
			// reader.readAsDataURL(recordList[0]?.blob)
			// console.log(recordList[0]?.url)
			refBlobUrl.value = recordList[0]?.url
			const view = recordList[0]?.view
			const buf = encodeBase64Bytes(new Uint8Array(view.buffer))
			refRecord.value = buf
			refRecordDatas.value.push(buf)
			if (refSttId.value === '') {
				sendView(view)
			} else {
				finish()
			}
			// sendView2(view)
			//
			setTimeout(() => {
				// const base64String = reader.result
				// console.log(
				// 	`Base64 String without Tags- ${base64String.substr(base64String.indexOf(',') + 1)}`,
				// )
				// refRecord.value = base64String.substr(base64String.indexOf(',') + 1)
				// chgStt()
				// chgSttFinish()
			}, 500)
		}
	}
}

function openLayerRec(isHide?: boolean) {
	const lp = recpop.value as any
	if (lp) {
		popitem.value = {
			isShow: true,
			id: 'recPlayer',
			type: 'record',
			msg: '',
			isHide,
			action: () => {
				const retVal = lp.getResultValue()
				if (retVal !== '') {
					refPopResult.value = retVal
				}
				popitem.value = {
					isShow: false,
					msg: '',
				}
				lp.init(popitem.value)
			},
			actionCallback: (msg: string) => {
				console.log(`actionCallback(${msg})`)
				if (msg !== '') {
					refPopResult.value = msg
				}
			},
			actionFinish: (msg: string) => {
				console.log(`actionFinish ${msg}`)
				if (msg !== '') {
					refPopResult.value = msg
				}
			},
			actionclose: () => {
				popitem.value = {
					isShow: false,
					id: 'recPlayer',
				}
				lp.init(popitem.value)
			},
		}
		lp.init(popitem.value)
	}
}

function loadScriptRecord() {
	loadScript('js/recorder/recorder.js').then(() => {
		loadScript('js/recorder/useaudio.js').then(() => {
			initAudio(null, function () {
				micInitAudio = false
			})
			startStt('1')
		})
	})
}
</script>
<script lang="ts">
export default defineComponent({
	name: 'PageTest',
	layout: 'empty',
	head: {
		script: [
			{
				src: '//cdata.milkt.co.kr/edubank/edubank/common/js/jquery-1.10.2.min.js',
			},
		],
	},
})
</script>
<template>
	<div>
		<div>sttId : {{ refSttId }}</div>
		<div><br /></div>
		<div>refRecord : {{ refRecord }}</div>
		<div><br /></div>
		<div>
			<button @click="startStt()">음성 변환 업로드 시작</button>
			<button @click="stopRecord">음성 변환 종료</button>
		</div>
		<div><br /></div>
		<div>
			<button @click="loadScriptRecord">실시간 음성 변환 시작</button>
			<button @click="stopRecord">음성 변환 종료</button>
		</div>
		<div><br /></div>
		<div>
			<button @click="openLayerRec()">팝업 호출</button>
			<button @click="openLayerRec(true)">팝업 숨김 호출</button>
			<div v-if="refPopResult != ''">result: {{ refPopResult }}</div>
		</div>
		<div><br /></div>
		<div>
			sendData :
			<ul v-for="(item, index) in refSendData" :key="index">
				<li>{{ item }}</li>
			</ul>
		</div>

		<div><br /></div>
		<div>
			finish =>

			<div v-if="refFinish?.analysisResult" style="color: blue; padding: 20px 0 20px 0">
				result: {{ refFinish?.analysisResult?.result }}
			</div>
			<div v-if="refFinish">{{ refFinish }}</div>
		</div>

		<div>
			refBlobUrl:
			<a :href="refBlobUrl" target="_blank">{{ refBlobUrl }}</a>
		</div>
		<ContentsRecPop ref="recpop" :recitem="popitem"></ContentsRecPop>
	</div>
</template>
<style></style>
