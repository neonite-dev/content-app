<script lang="ts" setup>
import type { IMenuState } from '@/types/menu'
import type { ISoundInfo } from '@/types/frame'
import type { IEdubaseInfo } from '@/types/edubase'
import type { IPopItem } from '@/types/popup'
import type { AudioHTMLAttributes } from 'vue'
import { useMenusStore } from '@/stores/menus'
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'
import { useHybridApp } from '@/composables/use-hybrid-app'
import { ref, useRoute, watch, onMounted, onUnmounted, computed, nextTick } from '@nuxtjs/composition-api'
import ContentsEdubase from '@/components/contents/Edubase.vue'
import ContentsRecPop from '@/components/contents/RecPop.vue'

import { compEdubasePageType } from '@/utils'
const userStore = useUserStore()
const { userInfo } = storeToRefs(userStore)

interface IProps {
	menus: IMenuState
}

const route = useRoute()
const { menus } = defineProps<IProps>()
const menusStore = useMenusStore()
const {
	setMediaTime,
	fetchConfigItem,
	setStatus,
	setPlayTime,
	setRequestHisComplete,
	getMenuData,
} = menusStore
const isLocal = process.env.BASE_TARGET === 'local'
const baseTarget = process.env.BASE_TARGET
const edubaseTarget = process.env.API_MILKT_APP_SERVER_ELE_EDUBASE

const frame = ref()
const frameSrc = ref<string>('')
// 서버와 클라이언트에서 일치하는 초기 상태
const frameEdubase = ref<boolean>(false)

const videoPlayer = ref()
const videoSrc = ref<string>('')
const videoNextPath = ref<string>('')

const canvasCapture = ref()
const canvasCaptureDataSrc = ref<string>('')

const audioList = ref<ISoundInfo[]>([])

const loaded = ref<boolean>(false)

const hbApp = useHybridApp()

const curExamInfo = ref<IEdubaseInfo>({
	isTest: false,
	isLecture: false,
	isSimilar: false,
	isChallenge: false,
	isTemp: false,
	userId: '',
	mCode: '',
	pageType: '',
	testType: '',
	strComplete: 'N',
})
const edubaseFilePath = ref<string>('')
const recitem = ref<IPopItem>({
	isShow: false,
	isHide: true,
	id: 'voiceRec',
})
const recpop = ref()

// 이벤트 리스너 정리를 위한 변수들
const messageEventListener = ref<((event: { data: string }) => void) | null>(null)
const frameLoadEventListeners = ref<Map<HTMLIFrameElement, () => void>>(new Map())
const beforeUnloadEventListeners = ref<Map<HTMLIFrameElement, () => void>>(new Map())

// 컴포넌트 정리 함수
const cleanup = () => {
	
	// message 이벤트 리스너 제거
	if (messageEventListener.value) {
		window.removeEventListener('message', messageEventListener.value)
		messageEventListener.value = null
	}
	
	// iframe 이벤트 리스너들 제거
	frameLoadEventListeners.value.forEach((listener, iframe) => {
		if (iframe && iframe.removeEventListener) {
			iframe.removeEventListener('load', listener)
		}
	})
	frameLoadEventListeners.value.clear()
	
	// beforeunload 이벤트 리스너들 제거
	beforeUnloadEventListeners.value.forEach((listener, iframe) => {
		if (iframe?.contentWindow?.removeEventListener) {
			iframe.contentWindow.removeEventListener('beforeunload', listener)
		}
	})
	beforeUnloadEventListeners.value.clear()
	
	// 모든 iframe 요소 강제 정리
	const allIframes = document.querySelectorAll('iframe')
	allIframes.forEach(iframe => {
		try {
			// iframe src를 about:blank로 설정
			iframe.src = 'about:blank'
			
			// iframe contentWindow 정리
			if (iframe.contentWindow) {
				// contentWindow의 모든 이벤트 리스너 제거 시도
				try {
					iframe.contentWindow.onload = null
					iframe.contentWindow.onbeforeunload = null
					iframe.contentWindow.onunload = null
				} catch (e) {
					console.error('contentWindow 이벤트 정리 중 오류:', e)
				}
			}
			
			// iframe 자체 이벤트 리스너 제거
			iframe.onload = null
			iframe.onerror = null
			
		} catch (e) {
			console.error('iframe 정리 중 오류:', e)
		}
	})
	
	// frame ref 정리
	if (frame.value) {
		try {
			frame.value.src = 'about:blank'
			frame.value.onload = null
			frame.value.onerror = null
			frame.value = null
		} catch (e) {
			console.error('frame ref 정리 중 오류:', e)
		}
	}
	
	// 전역 함수 제거
	if ((window as any).clearFrmContentInFrame) {
		delete (window as any).clearFrmContentInFrame
	}
	
	// 전역 변수 정리
	if ((window as any).HybridApp) {
		try {
			delete (window as any).HybridApp
		} catch (e) {
			console.error('HybridApp 전역 변수 정리 중 오류:', e)
		}
	}
	
	// DOM에서 frmContent 요소 완전 제거
	const frmContent = document.getElementById('frmContent')
	if (frmContent) {
		try {
			frmContent.remove()
		} catch (e) {
			console.error('frmContent 요소 제거 중 오류:', e)
		}
	}
	
	// 메모리 정리 강제 실행
	if (window.gc) {
		try {
			window.gc()
		} catch (e) {
			console.error('가비지 컬렉션 강제 실행 중 오류:', e)
		}
	}
}

// 강제 메모리 정리 함수
const forceMemoryCleanup = () => {
	
	// 모든 iframe 요소 강제 제거
	const allIframes = document.querySelectorAll('iframe')
	allIframes.forEach(iframe => {
		try {
			// iframe을 DOM에서 완전 제거
			iframe.remove()
		} catch (e) {
			console.error('iframe 강제 제거 중 오류:', e)
		}
	})
	
	// 전역 객체 정리
	const globalObjects = ['HybridApp', 'clearFrmContentInFrame', 'frmContent', 'curExamInfo']
	globalObjects.forEach(objName => {
		if ((window as any)[objName]) {
			try {
				delete (window as any)[objName]
			} catch (e) {
				console.error(`${objName} 전역 객체 정리 중 오류:`, e)
			}
		}
	})
	
	// 이벤트 리스너 맵 초기화
	frameLoadEventListeners.value.clear()
	beforeUnloadEventListeners.value.clear()
	
	// 메뉴 데이터 정리
	if (menusStore.clearMenuData) {
		menusStore.clearMenuData()
	}
	
	// 로컬 상태 초기화
	audioList.value = []
	frameSrc.value = ''
	videoSrc.value = ''
	videoNextPath.value = ''
	canvasCaptureDataSrc.value = ''
	edubaseFilePath.value = ''
	
	// 가비지 컬렉션 강제 실행 (가능한 경우)
	if (typeof window !== 'undefined' && (window as any).gc) {
		(window as any).gc()
	}
	

}

onMounted(async () => {
	// 클라이언트에서만 실행
	if (!process.client) return
	
	// DOM이 완전히 렌더링될 때까지 대기
	await nextTick()
	
	// 에듀베이스 모드 초기화 (DOM 접근이 필요한 부분)
	initializeEdubaseMode()
	
	// message 이벤트 리스너 함수 정의 및 저장
	messageEventListener.value = (event: { data: string }) => {
			if (['object', 'string'].includes(typeof event.data)) {
				const jsonData = typeof event.data === 'string' ? JSON.parse(event.data) : event.data
				if (jsonData.type && jsonData.type !== '') {
					postMsgAction(jsonData)
				}
			}
	}
	
	window.addEventListener('message', messageEventListener.value, false)
	const postMsgAction = (jsonData: any): void => {
		switch (jsonData.type) {
			case 'initHybridApp':
				hbApp.initFrameEvt(
					menusStore,
					userInfo,
					menus,
					frame,
					audioList,
					frameSrc,
					videoSrc,
					videoNextPath,
					canvasCapture,
					canvasCaptureDataSrc,
					baseTarget,
					recpop,
				)
				break
		}
	}

	// frame ref가 존재하는지 확인하고 이벤트 리스너 추가
	const setupFrameEventListeners = (retryCount = 0, maxRetries = 50) => {
		// frame ref가 준비된 경우
		if (frame.value) {

			setupFrameLoadEvent(frame.value)
		} else {
			// frame ref가 준비되지 않은 경우 DOM에서 직접 찾기 시도
			const iframeElement = document.querySelector('#frmContent') as HTMLIFrameElement
			if (iframeElement) {

				setupFrameLoadEvent(iframeElement)
				return
			}
			
			// 최대 재시도 횟수 초과 시 중단
			if (retryCount >= maxRetries) {
				console.error('🔥 frame ref 설정 실패: 최대 재시도 횟수 초과')
				return
			}
			
			console.warn(`🔥 frame ref가 아직 준비되지 않았습니다. 재시도 ${retryCount + 1}/${maxRetries}`)
			// 잠시 후 다시 시도 (재시도 횟수 증가)
			setTimeout(() => setupFrameEventListeners(retryCount + 1, maxRetries), 100)
		}
	}
	
	// iframe 로드 이벤트 설정 함수
const setupFrameLoadEvent = (iframeElement: HTMLIFrameElement) => {
	// 이미 등록된 이벤트 리스너가 있는지 확인
	if (frameLoadEventListeners.value.has(iframeElement)) {
		return
	}
	
	// load 이벤트 리스너 정의 및 저장
	const loadListener = () => {
		try {
			const iDoc = iframeElement?.contentDocument || iframeElement?.contentWindow?.document
			if (iDoc !== undefined) {
				loaded.value = true
				
				// beforeunload 이벤트 리스너 정의 및 저장
				const beforeUnloadListener = () => {
					audioList.value = [] as ISoundInfo[]
					document.querySelectorAll('audio').forEach(elem => elem.remove())
				}
				
				// 중복 등록 방지
				if (!beforeUnloadEventListeners.value.has(iframeElement)) {
					iframeElement?.contentWindow?.addEventListener('beforeunload', beforeUnloadListener)
					beforeUnloadEventListeners.value.set(iframeElement, beforeUnloadListener)
				}
				
				setTimeout(() =>{
					console.warn("비디오 소스",videoSrc.value)
					
					hbApp.initFrameEvt(
						menusStore,
						userInfo,
						menus,
						frame,
						audioList,
						frameSrc,
						videoSrc,
						videoNextPath,
						canvasCapture,
						canvasCaptureDataSrc,
						baseTarget,
						recpop,
					)
				},0 )
				
			}
		} catch (e) {
			loaded.value = false
			console.error(e)
		}
	}
	
	iframeElement.addEventListener('load', loadListener)
	frameLoadEventListeners.value.set(iframeElement, loadListener)
}
	
	// frame 이벤트 리스너 설정 (에듀베이스 모드가 아닌 경우에만)
	if (!frameEdubase.value) {
		setupFrameEventListeners()
	} else {
		// 에듀베이스 모드에서는 frame 이벤트 리스너 설정하지 않음
	}
})

const filePath = computed(() => {
	// 서버 사이드에서는 빈 문자열 반환하여 hydration 일치
	if (!process.client) {
		return ''
	}
	
	// 에듀베이스 모드인 경우 빈 문자열 반환 (iframe이 처리)
	if (frameEdubase.value) {
		return ''
	}
	
	// 일반 콘텐츠 처리
	const uid = (route?.value?.params as any)?.id
	const menuId = menus.mCode
	const pid = menus.pid
	// xmlFilePath 가져오기 로직 개선
	let xmlFilePath: string | undefined
	
	// 방법 1: menus.listMenuDatas에서 가져오기
	if (menus.listMenuDatas?.cjMenuDatas?.length > 0 && menus.listMenuDatas?.menuIdx !== undefined) {
		const currentMenuData = menus.listMenuDatas.cjMenuDatas[menus.listMenuDatas.menuIdx]
		xmlFilePath = currentMenuData?.filePath

	}
	
	// 방법 2: menus.cjCurMenuData에서 가져오기
	if (!xmlFilePath && menus.cjCurMenuData?.filePath) {
		xmlFilePath = menus.cjCurMenuData.filePath

	}
	
	// 방법 3: route params에서 파일명 추출
	if (!xmlFilePath && route?.value?.params?.id) {
		const routeId = route.value.params.id as string
		if (routeId !== menuId) {
			// route ID가 menuId와 다른 경우, 해당 ID를 파일명으로 사용
			xmlFilePath = `${routeId}.html`

		}
	}
	

	
	// 에듀베이스 URL 패턴 감지: /ele/차시코드/edubase/문항번호
	const isEdubaseUrlPattern = route?.value?.path?.includes('/edubase/')
	
	// 에듀베이스 URL 패턴인 경우 우선 처리
	if (isEdubaseUrlPattern) {

		
		// 서버사이드에서는 window.location 접근하지 않음
		
		try {
			activateEdubaseMode()

			// 에듀베이스 모드일 때는 빈 문자열 반환하여 iframe이 로드되지 않도록 함
			return ''
		} catch (error) {
			console.error('에듀베이스 모드 활성화 실패:', error)
			// 에러가 발생해도 빈 문자열 반환
			return ''
		}
	}
	
	// 일반 콘텐츠 처리 로직 개선
	if (menuId !== undefined) {
		
		// mp4 파일인 경우
		if (xmlFilePath && xmlFilePath.endsWith('.mp4')) {
			return `${xmlFilePath}`
		}
		
		// 기존 로직: xmlFilePath가 비어있고 cjCurMenuData.id가 '999'인 경우
		if (xmlFilePath === '' && menus.cjCurMenuData?.id === '999') {

			activateEdubaseMode()
			// DOM 접근은 onMounted에서 처리하도록 변경
			return ''
		}
		
		// 일반 HTML 파일인 경우
		if (xmlFilePath && xmlFilePath.endsWith('.html')) {
			const htmlUrl = `${isLocal ? process.env.API_BASE_URL : process.env.API_PILOT_SERVER}/HTML_TEST/${pid}/${xmlFilePath}`

			return htmlUrl
		}
		
		// xmlFilePath가 있는 경우
		if (xmlFilePath) {
			const contentUrl = `${isLocal ? process.env.API_BASE_URL : process.env.API_PILOT_SERVER}/HTML_TEST/${pid}/${xmlFilePath}`

			return contentUrl
		}		
	}
	

		
	return ''
})

// appEdubaseUrl 함수를 먼저 정의
const appEdubaseUrl = () => {
	/// <param name="strMcode">강의코드</param>
	/// <param name="pageType">강의타입(TEST, DANWON, BOGANG, SIMWHA, WRONG, SIMILAR, CHALLENGE)</param>
	/// <param name="testType">강의코드(P:기본문제, B:보충/심화, L:유사문제, C:도전문제)</param>
	/// <param name="strComplete">완강여부(Y, N)</param>
	//alert("appEdubaseUrl")
	//document.querySelector("#cont").style.cssText='transform: translate(0px, 0px) scale3d(0.5, 0.5, 1); transform-origin: 0px 0px; width: 100%; height: 627px; padding-left: 13%;'
	

	
	// 기본값 설정으로 안전성 확보
	const pageType = curExamInfo.value.pageType || 'TEST'
	const testType = curExamInfo.value.testType || 'P'
	const strComplete = curExamInfo.value.strComplete || 'N'
	
	// userId 우선순위: curExamInfo.userId > userInfo.UserID > 'default'
	let userId = curExamInfo.value.userId
	if (!userId || userId === 'default') {
		userId = userInfo.value?.UserID || 'default'
	}
	
	const mCode = curExamInfo.value.mCode || 'default'
	

	
	return `/app_edubase/AppQuestionBank/IndexExApp?strUserID=${userId}&strMCode=${mCode}&pageType=${pageType}&testType=${testType}&strComplete=${strComplete}`
}

// 에듀베이스 모드 초기화 함수 (onMounted에서 호출)
const initializeEdubaseMode = () => {
	
	// 서버사이드에서는 실행하지 않음
	if (!process.client) {
		return
	}
	
	// 에듀베이스 URL 패턴 감지
	const isEdubaseUrlPattern = route?.value?.path?.includes('/edubase/')
	const isEdubaseCondition = menus.cjCurMenuData?.id === '999'
	
	if (isEdubaseUrlPattern || isEdubaseCondition) {
		activateEdubaseMode()
	}
}

// 에듀베이스 모드 활성화 함수
const activateEdubaseMode = () => {
	
	// 서버사이드에서는 실행하지 않음
	if (!process.client) {
		return
	}
	

	
	// 에듀베이스 모드 즉시 활성화
	frameEdubase.value = true
	
	// userInfo가 로드되지 않은 경우 userInfo 로드 대기
	if (!userInfo.value?.UserID || userInfo.value.UserID === '') {
		// userInfo가 로드될 때까지 대기하는 함수
		const waitForUserInfo = () => {
			return new Promise<void>((resolve) => {
				const checkUserInfo = () => {
					if (userInfo.value?.UserID && userInfo.value.UserID !== '') {
						resolve()
					} else {
						setTimeout(checkUserInfo, 100) // 100ms마다 확인
					}
				}
				checkUserInfo()
			})
		}
		
		// userInfo 로드 대기 후 에듀베이스 모드 활성화
		waitForUserInfo().then(() => {
			activateEdubaseMode() // 재귀 호출로 다시 실행
		})
		return
	}
	
	// URL에서 차시코드와 문항번호 추출 (에듀베이스 URL 패턴인 경우)
	let mCode = menus.mCode
	let questionNumber: string | undefined
	
	if (route?.value?.path?.includes('/edubase/')) {
		const pathParts = route.value.path.split('/')
		const eleIndex = pathParts.findIndex(part => part === 'ele')
		if (eleIndex !== -1 && pathParts[eleIndex + 1]) {
			mCode = pathParts[eleIndex + 1]
		}
		
		// 문항번호 추출
		const edubaseIndex = pathParts.findIndex(part => part === 'edubase')
		if (edubaseIndex !== -1 && pathParts[edubaseIndex + 1]) {
			questionNumber = pathParts[edubaseIndex + 1]
		}
	}
	
				curExamInfo.value = {
					isTest: false,
					isLecture: false,
					isSimilar: false,
					isChallenge: false,
					isTemp: false,
					userId: userInfo.value.UserID,
		mCode: mCode,
					pageType: compEdubasePageType(menus.configInfo),
					testType: 'P',
					strComplete: 'N',
		questionNumber: questionNumber, // 문항번호 추가
				}
	

				if (curExamInfo.value.pageType === 'SIMILAR') {
					curExamInfo.value.testType = 'L'
				}
				if (curExamInfo.value.pageType === 'CHALLENGE') {
					curExamInfo.value.testType = 'C'
				}
	try {
				edubaseFilePath.value = appEdubaseUrl()
	} catch (error) {
		console.error('appEdubaseUrl 호출 실패:', error)
		// 기본값으로 설정
		edubaseFilePath.value = `/app_edubase/AppQuestionBank/IndexExApp?strUserID=${userInfo.value.UserID}&strMCode=${mCode}&pageType=TEST&testType=P&strComplete=N`
	}
}

watch(
	() => filePath?.value,
	async val => {
		
		// 에듀베이스 모드일 때는 일반 콘텐츠 로딩 방지
		if (frameEdubase.value) {
			return
		}
		
		if (val !== '') {
			try {
				audioList.value = [] as ISoundInfo[]
				
				if (val.endsWith('.mp4')) {

					if (val.startsWith('/')) {
						val = val.slice(1)
					}
					const res = await hbApp.loadMovie(val)
					videoSrc.value = res
					frameSrc.value = ''

				} else {

					videoSrc.value = ''
					videoNextPath.value = ''
					
					if (val.endsWith('.html')) {
						frameSrc.value = `${val}?v=${new Date().getMinutes()}`
					} else {
						frameSrc.value = val
					}
					

				}
			} catch (e) {
				console.error('콘텐츠 로딩 중 오류:', e)
			}
		}
	},
	{ deep: true, immediate: true },
)

// frameSrc 변경 감지
watch(
	() => frameSrc.value,
	(val) => {
		if (val && val !== '' && !frameEdubase.value) {
			// frameSrc 설정됨, iframe 렌더링 준비
		}
	},
	{ deep: true, immediate: true },
)

watch(
	() => videoPlayer.value,
	val => {
		if (val != null) {
			try {
				val.addEventListener('ended', (_event: Event | any) => {
					videoSrc.value = ''
					const currentTime = _event?.target?.currentTime
					setMediaTime(currentTime)
					if (videoNextPath.value === '' || videoNextPath.value == null) {
						const ifWin = frame.value?.contentWindow
						ifWin.HybridApp.nextMenu()
					} else {
						frameSrc.value = `${isLocal ? process.env.API_BASE_URL : process.env.API_PILOT_SERVER}/HTML_TEST/${
							menus.curMenuItem?.id
						}/${videoNextPath.value}`
					}
				})
			} catch (e) {
				console.log(e)
			}
		}
	},
	{ deep: true, immediate: true },
)

function audioBindItem(item: ISoundInfo) {
	const attr = {} as AudioHTMLAttributes
	if (item.isplaying) {
		attr.autoplay = true
	}
	if (item.loop) {
		attr.loop = true
	}
	return attr
}

function chgsrc(item: IEdubaseInfo) {
	frameEdubase.value = true
	curExamInfo.value = item
}
function chgstate(strUserID: string, strMCode: string) {
	fetchConfigItem(strUserID, strMCode)
}

function edubasecompleted() {
	document.domain = location.hostname
	completeContents()
}

const completeContents = (): void => {
	
	setStatus(2)
	setPlayTime()
	
	// cjMenuDatas가 배열인지 확인
	const cjMenuDatas = menus.listMenuDatas?.cjMenuDatas
	if (!cjMenuDatas || !Array.isArray(cjMenuDatas)) {
		console.warn('completeContents - cjMenuDatas가 없거나 배열이 아님:', cjMenuDatas)
		return
	}
	
	let isCompleteNow =
		cjMenuDatas
			.filter((m, i): any => i <= menus.listMenuDatas.menuIdx)
			.find((m2: any) => m2.status !== 2) == null
	

	
	// 테스트를 위해 임시 설정
	if (!isCompleteNow) {
		cjMenuDatas
			.filter((m, i): any => i <= menus.listMenuDatas.menuIdx)
			.forEach((v): any => {
				v.status = 2
			})
		isCompleteNow = true
	}
	
	if (isCompleteNow) {
		setRequestHisComplete(userInfo.value?.UserID)
	}
}

// frmContent iframe 초기화 함수
const clearFrmContentInFrame = () => {
	if (process.client) {
		const iframe = document.getElementById('frmContent') as HTMLIFrameElement
		if (iframe) {
			iframe.src = 'about:blank'
		}
	}
}

// 전역으로 노출 (클라이언트에서만)
if (process.client) {
	;(window as any).clearFrmContentInFrame = clearFrmContentInFrame
		;(window as any).forceMemoryCleanup = forceMemoryCleanup

		
		// curExamInfo를 전역으로 노출하여 Edubase.vue에서 접근 가능하도록 함
		;(window as any).curExamInfo = curExamInfo
	}

// frameEdubase 값 변경 감지
watch(frameEdubase, (newValue) => {
	
	if (newValue === true) {
		// 에듀베이스 모드로 전환
		if (process.client) {
			const iframe = document.getElementById('frmContent') as HTMLIFrameElement
			if (iframe) {
				iframe.src = 'about:blank'
				iframe.style.display = 'none'

			}
		}
		// frameSrc 초기화
		frameSrc.value = ''
	} else {
		// 일반 콘텐츠 모드로 전환
		// frame 이벤트 리스너 설정은 onMounted에서 처리됨
	}
}, { immediate: true })

// userInfo가 로드된 후 에듀베이스 모드 재활성화
watch(() => userInfo.value?.UserID, (newUserID) => {
	if (newUserID && newUserID !== '') {
		// curExamInfo.userId 업데이트
		if (curExamInfo.value.userId !== newUserID) {
			curExamInfo.value.userId = newUserID
		}
		
		// 에듀베이스 모드가 활성화된 경우 edubaseFilePath 재생성
		if (frameEdubase.value && route?.value?.path?.includes('/edubase/')) {
			edubaseFilePath.value = appEdubaseUrl()
		} else if (!frameEdubase.value && route?.value?.path?.includes('/edubase/')) {
			// 에듀베이스 모드가 아직 활성화되지 않은 경우 활성화
			activateEdubaseMode()
		}
	}
}, { immediate: true })

// curExamInfo 변경사항을 전역으로 동기화
watch(curExamInfo, (newValue) => {
	if (process.client && (window as any).curExamInfo) {
		;(window as any).curExamInfo = newValue
		console.log('🔥 curExamInfo 전역 동기화:', newValue)
	}
}, { deep: true, immediate: true })

// 에듀베이스 URL 패턴 확인 함수
const isEdubaseUrlPattern = computed(() => {
  const path = route?.value?.path
  return path?.includes('/edubase/') || false
})

// 에듀베이스 모드 활성화 여부 확인
const shouldActivateEdubaseMode = computed(() => {
  // 기존 조건: xmlFilePath가 비어있고 cjCurMenuData.id가 '999'인 경우
  const existingCondition = filePath.value === '' && menus.cjCurMenuData?.id === '999'
  
  // 새로운 조건: 에듀베이스 URL 패턴인 경우
  const urlPatternCondition = isEdubaseUrlPattern.value
  
  return existingCondition || urlPatternCondition
})

onMounted(() => {
	if (process.client) {
		console.log('🔥 Frame.vue onMounted - clearFrmContentInFrame 전역 등록')
		;(window as any).clearFrmContentInFrame = clearFrmContentInFrame
	}
})

// 컴포넌트 언마운트 시 정리
onUnmounted(() => {
	cleanup()
})

// 라우트 변경 감지하여 정리
watch(() => route.value.path, (newPath, oldPath) => {
	if (oldPath && newPath !== oldPath) {
		console.log('🔥 라우트 변경 감지:', oldPath, '->', newPath)
		// 이전 라우트의 리소스 정리
		setTimeout(() => {
			cleanup()
		}, 100)
	}
}, { immediate: false })

// 페이지 언로드 시 정리
if (process.client) {
	window.addEventListener('beforeunload', () => {
		console.log('🔥 페이지 언로드 감지, 정리 시작')
		cleanup()
	})
	
	window.addEventListener('pagehide', () => {
		console.log('🔥 페이지 숨김 감지, 정리 시작')
		cleanup()
	})
}
</script>

<style scoped>
/* 에듀베이스 전체 화면 모드 */
.edubase-fullscreen {
	width: 100vw !important;
	height: 100vh !important;
	position: fixed;
	top: 0;
	left: 0;
	z-index: 1000;
	background-color: #ffffff;
}

.edubase-container {
	width: 100%;
	height: 100%;
	display: flex;
	flex-direction: column;
}

/* 에듀베이스 모드일 때 iframe 숨김 */
.edubase-fullscreen iframe {
	display: none !important;
}
</style>
<template>
	<div id="divframe" :class="{ 'edubase-fullscreen': frameEdubase }">
		<!-- Hydration 안전한 iframe 렌더링 -->
		<ClientOnly>
		<iframe
				v-if="!frameEdubase && frameSrc !== ''"
			id="frmContent"
			ref="frame"
			:src="frameSrc"
			:data-src="filePath"
			width="1280px"
			height="800px"
			frameborder="0"
			scrolling="no"
			allow="autoplay"
			allowfullscreen="true"
		></iframe>
		</ClientOnly>
		
		<!-- frameEdubase가 true일 때 빈 iframe -->
		<ClientOnly>
		<iframe
			v-if="frameEdubase"
			id="frmContent"
			src="about:blank"
			width="1280px"
			height="800px"
			frameborder="0"
			scrolling="no"
			allow="autoplay"
			allowfullscreen="true"
			style="display: none;"
		></iframe>
		</ClientOnly>
		
		<!-- 에듀베이스 컨테이너 -->
		<ClientOnly>
			<div v-if="frameEdubase" class="edubase-container">
			<ContentsEdubase
				:src="edubaseFilePath"
				:examinfo="curExamInfo"
					:configinfo="menus.configInfo"
				@chgsrc="chgsrc"
				@chgstate="chgstate"
				@edubasecompleted="edubasecompleted"
			/>
		</div>
		</ClientOnly>
		
		<!-- 비디오 플레이어 -->
		<ClientOnly>
		<video
			v-if="videoSrc !== ''"
			ref="videoPlayer"
			style="width: 100%; max-width: 1280px; min-height: 800px; background-color: black"
			:data-src="filePath"
			autoplay
			controlsList="nodownload"
			oncontextmenu="return false"
			controls
			defaultmuted
		>
			<source :src="videoSrc" type="video/mp4" />
		</video>
		</ClientOnly>
		
		<!-- 오디오 리스트 -->
		<ClientOnly>
		<div>
			<audio
				v-for="(item, index) in audioList"
				:id="item.id"
				:key="index"
				v-bind="audioBindItem(item)"
			>
				<source :src="item.src" type="audio/mpeg" />
			</audio>
		</div>
		</ClientOnly>
		
		<!-- 캔버스 캡처 -->
		<div style="display: none">
			<canvas ref="canvasCapture"></canvas>
		</div>
		
		<!-- 녹음 팝업 -->
		<ClientOnly>
		<div>
			<ContentsRecPop ref="recpop" :recitem="recitem"></ContentsRecPop>
		</div>
		</ClientOnly>
	</div>
</template>
