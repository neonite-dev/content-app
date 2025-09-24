<script lang="ts" setup>
import { ref, watch, onMounted, onUnmounted, computed } from '@nuxtjs/composition-api'
import { getData, postData } from '~/api'
import { loadMovie, setHTML, curEdubasePageType, lastEdubasePageType, waitForJQuery } from '@/utils'
import type { ITestJsonData, IEdubaseInfo, ILectureInfo } from '~/types/edubase'
import type { IPopItem } from '@/types/popup'
import ContentsLayerPop from '@/components/contents/LayerPop.vue'
import { CJConfigInfo } from '~/types/cj-app'
import { useHybridApp } from '@/composables/use-hybrid-app'
import { useMenusStore } from '@/stores/menus'
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'

const emit = defineEmits(['chgsrc', 'chgstate', 'edubasecompleted'])
interface IProps {
	src: String
	examinfo: IEdubaseInfo
	configinfo: CJConfigInfo
}

const { src, examinfo, configinfo } = defineProps<IProps>()

// HybridApp 관련 변수들
const userStore = useUserStore()
const { userInfo } = storeToRefs(userStore)
const menusStore = useMenusStore()
const hbApp = useHybridApp()

const loadHtmlValue = ref<string>('')
const quizCnt = ref<number>(0)
const testJsonData = ref<ITestJsonData[]>([])
const curExamNum = ref<number>(0)
const curExamIsComp = ref<boolean>(false)
const examTitle = ref<string>('')
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
const curEdubasePageTypeVal = ref<string>('TEST')
const bufEdubasePageTypeVal = ref<string>('TEST')
const prevPageType = ref<string>('')
const lecInfoList = ref<ILectureInfo[]>([])
const lecEdubaseUrl = ref<string>('')

const layerpop = ref<HTMLDivElement | null>(null)
const popitem = ref<IPopItem>({
	isShow: false,
	id: 'lecPlayer',
	type: 'lecture',
	url: '',
})

// 전체보기/한문항보기 상태 관리
const isOneProblemView = ref<boolean>(true)



onMounted(() => {
	// 클라이언트에서만 실행
	if (!process.client) return
	
	// 메모리 정리: 이전 데이터 초기화
	
	// 창 닫기 이벤트 리스너 추가 (임시저장 후 창 닫기)
	const handleBeforeUnload = (event: BeforeUnloadEvent) => {
		// 임시저장 실행
		if (typeof window?.TempSave !== 'undefined') {
			window.TempSave()
		} else {
			console.warn('🔥 TempSave 함수가 정의되지 않음')
		}
		
		// 사용자에게 확인 메시지 표시
		event.preventDefault()
		event.returnValue = '임시저장 후 종료됩니다. 정말 종료하시겠습니까?'
		return '임시저장 후 종료됩니다. 정말 종료하시겠습니까?'
	}
	
	window.addEventListener('beforeunload', handleBeforeUnload)
	
	// 컴포넌트 언마운트 시 이벤트 리스너 제거를 위해 저장
	;(window as any).__edubaseBeforeUnloadHandler = handleBeforeUnload
	
	// userInfo가 로드될 때까지 대기하는 함수
	const waitForUserInfo = () => {
		return new Promise<void>((resolve) => {
			if (userInfo.value?.UserID && userInfo.value.UserID !== 'default') {
				resolve()
			} else {
				const checkUserInfo = () => {
					if (userInfo.value?.UserID && userInfo.value.UserID !== 'default') {
						resolve()
					} else {
						setTimeout(checkUserInfo, 100) // 100ms마다 확인
					}
				}
				checkUserInfo()
			}
		})
	}
	
	// userInfo 로드 대기 후 초기화
	waitForUserInfo().then(() => {
		// DOM이 완전히 렌더링될 때까지 대기
		setTimeout(() => {
			try {
				curExamInfo.value = examinfo
				
							// 실제 로그인한 사용자 정보로 userId 업데이트
			if (userInfo.value?.UserID && userInfo.value.UserID !== 'default') {
				curExamInfo.value.userId = userInfo.value.UserID
			} else {
				console.warn('🔥 사용자 정보가 로드되지 않음, 기본값 사용')
			}
				
				curEdubasePageTypeVal.value = curEdubasePageType(configinfo)
			

			
			// iframe postMessage 설정
			window.addEventListener(
				'message',
				(event: { data: string }) => {
			if (['object', 'string'].includes(typeof event.data)) {
				const jsonData = typeof event.data === 'string' ? JSON.parse(event.data) : event.data
				if (jsonData.type && jsonData.type !== '') {
					switch (jsonData.type) {
						case 'viewPaper':
							curExamInfo.value.isTemp = jsonData.isTemp
							curExamInfo.value.strComplete = jsonData.strComplete
							curExamInfo.value.pageType = jsonData.pageType
							curEdubasePageTypeVal.value = curEdubasePageType(configinfo)
							switch (curExamInfo.value.pageType) {
								case 'TEST':
									curExamInfo.value.testType = 'P'
									curExamInfo.value.isTest = true
									curExamInfo.value.isSimilar = false
									curExamInfo.value.isChallenge = false
									break
								case 'SIMILAR':
									curExamInfo.value.testType = 'L'
									curExamInfo.value.isTest = false
									curExamInfo.value.isSimilar = true
									curExamInfo.value.isChallenge = false
									break
								case 'CHALLENGE':
									curExamInfo.value.testType = 'C'
									curExamInfo.value.isTest = false
									curExamInfo.value.isSimilar = false
									curExamInfo.value.isChallenge = true
									break
							}
							break
						case 'GetTestCode':
						case 'GetTestResultExApp':
						case 'TempSaveList':
							
							quizCnt.value = jsonData.data.length
							testJsonData.value = jsonData.data as ITestJsonData[]
							curExamNum.value = 1
							curExamIsComp.value = jsonData.type === 'GetTestResultExApp'
							curExamInfo.value.strComplete = curExamIsComp.value ? 'Y' : 'N'
							if (curExamIsComp.value) {
								fetchLecInfoList(jsonData.pageType)
								// 쌍둥이 문제 완료 시 도전 문제 활성화
								if (jsonData.pageType === 'SIMILAR' && (configinfo.ChallengeYN === 'Y' || configinfo.ChallengeYN === undefined)) {
									bufEdubasePageTypeVal.value = 'CHALLENGE'
								}
							}
							emit('chgstate', curExamInfo.value.userId, curExamInfo.value.mCode)
							
							// 문항번호가 지정된 경우 해당 문항으로 자동 이동
							if (examinfo.questionNumber && examinfo.questionNumber !== '1') {
								// DOM 업데이트 완료 후 처리 (더 긴 지연시간)
								setTimeout(() => {
									const questionNum = parseInt(examinfo.questionNumber!)
									if (!isNaN(questionNum) && questionNum > 0) {
										onClickGoNum(questionNum)
									}
								}, 500)
							}
							break
						case 'goNum':
							curExamNum.value = jsonData.data
							break
						case 'TestJsonData':
						case 'TempSave_Ins':
							break
						case 'TestResult_INS':
							if (jsonData.result) {
								emit('chgstate', curExamInfo.value.userId, curExamInfo.value.mCode)
								if (jsonData.pageType === lastEdubasePageType(configinfo)) {
									emit('edubasecompleted')
								}
								if (jsonData.pageType === 'SIMILAR' && (configinfo.ChallengeYN === 'Y' || configinfo.ChallengeYN === undefined)) {
									bufEdubasePageTypeVal.value = 'CHALLENGE'
								}
							}
							break
						case 'TestQuizResultData_DelProc':
							if (jsonData.chkval === 'Y') {
								Object.assign(curExamInfo.value, {
									isTest: false,
									isLecture: false,
									isSimilar: false,
									isChallenge: false,
									isTemp: false,
									pageType: 'TEST',
									testType: 'P',
									strComplete: 'N',
								})
								curEdubasePageTypeVal.value = curExamInfo.value.pageType

								prevPageType.value = ''
								lecInfoList.value = [] as ILectureInfo[]

								// 실제 로그인 사용자 ID로 업데이트
								if (userInfo.value?.UserID && userInfo.value.UserID !== 'default') {
									curExamInfo.value.userId = userInfo.value.UserID
								}
								
								emit('chgstate', curExamInfo.value.userId, curExamInfo.value.mCode)
								emit('chgsrc', curExamInfo.value)
								loadDataHtml(
									`/app_edubase/AppQuestionBank/IndexExApp?strUserID=${curExamInfo.value.userId}&strMCode=${curExamInfo.value.mCode}&pageType=${curExamInfo.value.pageType}&testType=${curExamInfo.value.testType}&strComplete=${curExamInfo.value.strComplete}`,
								)
							}
							break
					}
				}
			}
		},
		false,
	)
			} catch (error) {
				console.error('🔥 Edubase.vue onMounted 오류:', error)
			}
		}, 100)
	})
})
watch(
	() => curExamInfo.value?.pageType,
	val => {
		if (val !== '') {
			try {
				switch (val) {
					case 'LEC':
						curExamInfo.value.testType = ''
						break
					case 'SIMILAR':
						examTitle.value = '쌍둥이 문제'
						curExamInfo.value.testType = 'L'
						break
					case 'CHALLENGE':
						examTitle.value = '도전 문제'
						curExamInfo.value.testType = 'C'
						break
					default:
						examTitle.value = '기본 문제'
						curExamInfo.value.testType = 'P'
						break
				}
					} catch (e) {
			console.error(e)
		}
		}
	},
	{ deep: true, immediate: true },
)
watch(
	() => popitem.value,
	val => {
		if (val !== null) {
			const lp = layerpop.value as any
			if (lp) {
				if (typeof lp.init !== 'undefined') {
					if (val.isShow) {
						lp.init(popitem.value)
					} else {
						lp.init({
							isShow: false,
							id: 'lecPlayer',
							type: 'lecture',
							url: '',
							msg: '',
							btnName: null,
							action: null,
							action2: null,
							actionclose: null,
						})
					}
				}
			}
		}
	},
	{ deep: true, immediate: true },
)

// userInfo 변경 감지하여 curExamInfo.userId 업데이트
watch(
	() => userInfo.value?.UserID,
	(newUserID) => {
		if (newUserID && newUserID !== 'default' && curExamInfo.value.userId !== newUserID) {
			curExamInfo.value.userId = newUserID
		}
	},
	{ immediate: true }
)

async function loadDataHtml(chgUrlSrc?: string) {
	
	const data = await postData(chgUrlSrc || src.toString())
	if (data) {
		const divHtmlData = data
			.toString()
			.replace(/src="\/include/g, `src="${process.env.BASE_DIR}/app_edubase/include`)
			.replace(/"\/AppQuestionBank/g, `"${process.env.BASE_DIR}/app_edubase/AppQuestionBank`)
			.replace(/"\/AppLogin/g, `"${process.env.BASE_DIR}/app_edubase/AppLogin`)
		const divHtml = document.querySelector('#divLoadHtmlValue') as HTMLDivElement
		
		// setHTML 실행 함수 정의
		const executeSetHTML = () => {
			// URL 생성 전에 userId를 실제 로그인 사용자로 업데이트
			if (userInfo.value?.UserID && userInfo.value.UserID !== 'default') {
				curExamInfo.value.userId = userInfo.value.UserID
			}
			
			try {
				setHTML(divHtml, divHtmlData, true)
				
				// iframe이 로드된 후 initFrameEvt 호출
				setTimeout(() => {
					initializeHybridApp()
				}, 1000) // 1초 후 실행하여 iframe이 완전히 로드되도록 대기
			} catch (error) {
				console.error('setHTML 실행 실패:', error)
			}
		}
		
		// jQuery가 로드될 때까지 대기 후 setHTML 실행
		waitForJQuery(() => {
			executeSetHTML()
		}, 5000) // 최대 5초 대기
		
		// jQuery가 로드되지 않는 경우를 대비한 fallback (3초 후)
		setTimeout(() => {
			if (typeof window !== 'undefined' && !(window.jQuery || (window as any).$)) {
				console.warn('jQuery 로드 실패, fallback으로 setHTML 실행')
				executeSetHTML()
			}
		}, 3000)
	}
}
loadDataHtml()

// 컴포넌트 언마운트 시 메모리 정리
onUnmounted(() => {
	// beforeunload 이벤트 리스너 제거
	if ((window as any).__edubaseBeforeUnloadHandler) {
		window.removeEventListener('beforeunload', (window as any).__edubaseBeforeUnloadHandler)
		delete (window as any).__edubaseBeforeUnloadHandler
	}
	
	// 전역 객체 정리
	const globalObjects = ['HybridApp', 'curExamInfo']
	globalObjects.forEach(objName => {
		if ((window as any)[objName]) {
			try {
				delete (window as any)[objName]
					} catch (e) {
			console.error(`${objName} 전역 객체 정리 중 오류:`, e)
		}
		}
	})
	
	// 로컬 상태 초기화
	curExamInfo.value = {
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
	}
	
	// 가비지 컬렉션 강제 실행 (가능한 경우)
	if (typeof window !== 'undefined' && (window as any).gc) {
		(window as any).gc()
	}
})

// HybridApp 초기화 함수
const initializeHybridApp = () => {
	
	// iframe 찾기
	const iframe = document.querySelector('#divLoadHtmlValue iframe') as HTMLIFrameElement
	if (!iframe) {
		console.warn('iframe을 찾을 수 없습니다.')
		return
	}
	
	// iframe이 로드될 때까지 대기
	const checkIframeLoaded = () => {
		try {
			const ifWin = iframe.contentWindow
			if (ifWin && ifWin.document && ifWin.document.readyState === 'complete') {
				// iframe 내부 Date 객체 강력 초기화 (getTime() 에러 방지)
				try {
					// 모든 필요한 Date 객체들 초기화
					ifWin.user_tstatus_check_date = new Date()
					ifWin.user_tstatus_check_date_timestamp = ifWin.user_tstatus_check_date.getTime()
					ifWin.currentTime = new Date()
					ifWin.startTime = new Date()
					
					// iframe 내부에서 사용할 수 있는 전역 변수들도 설정
					ifWin.window.user_tstatus_check_date = ifWin.user_tstatus_check_date
					ifWin.window.user_tstatus_check_date_timestamp = ifWin.user_tstatus_check_date_timestamp
				} catch (e) {
					console.warn('iframe 내부 Date 객체 초기화 실패:', e)
				}
				
				// 필요한 변수들 설정
				const frame = ref(iframe)
				const audioList = ref([])
				const frameSrc = ref('')
				const videoSrc = ref('')
				const videoNextPath = ref('')
				const canvasCapture = ref(null)
				const canvasCaptureDataSrc = ref('')
				const recpop = ref(null)
				
				// initFrameEvt 호출
				if (hbApp && typeof hbApp.initFrameEvt === 'function') {
					hbApp.initFrameEvt(
						menusStore,
						userInfo,
						menusStore.menuData,
						frame,
						audioList,
						frameSrc,
						videoSrc,
						videoNextPath,
						canvasCapture,
						canvasCaptureDataSrc,
						process.env.BASE_TARGET,
						recpop
					)
				} else {
					console.error('🔥 hbApp.initFrameEvt가 함수가 아닙니다:', hbApp)
				}
				
			} else {
				setTimeout(checkIframeLoaded, 500) // 0.5초 후 다시 확인
			}
		} catch (error) {
			console.error('iframe 접근 오류:', error)
			// CORS 오류 등으로 iframe에 접근할 수 없는 경우
			// window.HybridApp을 직접 설정
			if (!window.HybridApp) {
				window.HybridApp = {} as any
			}
			
			// 기본 HybridApp 함수들 설정
			window.HybridApp.QuesTionFinish = (isFinish: boolean): void => {
				// QuesTionFinish 함수 직접 설정
			}
			window.HybridApp.userInputDoneStatus = (userInputStatus: string): void => {
				// userInputDoneStatus 함수 직접 설정
			}
		}
	}
	
	checkIframeLoaded()
}

const fetchLecInfoList = async (pageType: string) => {
	curExamInfo.value.testType = ''
	const lecInfos = lecInfoList.value.filter(m => m.pageType === pageType) as ILectureInfo[]
	curExamInfo.value.isLecture = lecInfos?.length > 0
	if (lecInfos?.length === 0) {
		const data = (await getData(
			`/app_api/AppQuestionBank/MultiPlayerWrongLecture?strUserID=${curExamInfo.value.userId}&strMCode=${curExamInfo.value.mCode}&TestType=${pageType}`,
		)) as any
		if (data && data.length > 0) {
			data.forEach((element: ILectureInfo, index: number) => {
				element.pageType = pageType
				element.intLM_IDX = index + 1
			}) as ILectureInfo[]
			lecInfoList.value.push(...data)
			curExamInfo.value.isLecture = true
		}
	}
}

const onClickGoNum = async (val: number) => {
	popitem.value.isShow = false
	
	const el = document.querySelector('#txtnum') as HTMLInputElement
	if (el) {
		el.value = val.toString()
		curExamNum.value = val
		//문항이동시 오디오 중지
		try{
			// iframe에서 오디오 중지 함수 호출
			const iframe = document.querySelector('#divLoadHtmlValue iframe') as HTMLIFrameElement
			if (iframe && iframe.contentWindow && (iframe.contentWindow as any).ifrview) {
				(iframe.contentWindow as any).ifrview.bnkSndStop()
			}
				}catch(e){
			console.error('오디오 중지 함수 호출 실패:', e)
		}
		
		if (typeof window?.goNum !== 'undefined') {
			window.goNum()
		} else {
			console.warn('window.goNum 함수가 정의되지 않음')
		}

		const pageType = curExamInfo.value.pageType
		if (pageType === 'LEC') {
			const item = lecInfoList.value.find(
				m => m.pageType === prevPageType.value && m.intLM_IDX === val,
			) as ILectureInfo
			if (item && item.LM_Value !== '') {
				// 영상 플레이
				const res = await loadMovie(item.LM_Value)
				if (res) {
					lecEdubaseUrl.value = res
					popitem.value = {
						isShow: true,
						id: 'lecPlayer',
						type: 'lecture',
						url: res,
						actionclose: () => {
							popitem.value.isShow = false
							popitem.value.url = ''
						},
					}
				}
			}
		}
	}
}
const onClickTempSave = () => {
	if (typeof window?.TempSave !== 'undefined') {
		window.TempSave()
	}
}

const onClickShowOneProblem = () => {
	if (typeof window?.showOneProblem !== 'undefined') {
		isOneProblemView.value = true
        window.showOneProblem(curExamNum.value.toString());
    }
}

const onClickShowAllProblem = () => {
	if (typeof window?.showAllProblem !== 'undefined') {
		isOneProblemView.value = false
        window.showAllProblem()
    }
}

const onClickSubmitPaper = () => {
	
	// iframe 내부에 Date 객체 강제 주입
	const iframe = document.querySelector('#divLoadHtmlValue iframe') as HTMLIFrameElement
	if (iframe && iframe.contentWindow) {
		try {
			const ifWin = iframe.contentWindow
			
			// iframe 내부에 Date 객체 직접 주입
			ifWin.user_tstatus_check_date = new Date()
			ifWin.user_tstatus_check_date_timestamp = ifWin.user_tstatus_check_date.getTime()
			
			// 추가 Date 객체들도 초기화
			ifWin.currentTime = new Date()
			ifWin.startTime = new Date()
		} catch (e) {
			console.error('iframe 내부 Date 객체 초기화 실패:', e)
		}
	}
	
	// 전역 window에도 Date 객체 초기화
	try {
		if (typeof window !== 'undefined') {
			window.user_tstatus_check_date = new Date()
			window.user_tstatus_check_date_timestamp = window.user_tstatus_check_date.getTime()
		}
	} catch (e) {
		console.error('전역 Date 객체 초기화 실패:', e)
	}
	
	// submitPaper 함수 호출
	try {
		if (typeof window?.submitPaper !== 'undefined') {

			window.submitPaper()
		} else {
			console.warn('submitPaper 함수가 정의되지 않음')
		}
	} catch (error) {
		console.error('submitPaper 함수 실행 중 오류:', error)
		
		// getTime() 에러인 경우 추가 처리
		if (error instanceof Error && error.message.includes('getTime')) {
			console.error('getTime() 에러 - Date 객체 문제')
			alert('날짜 정보 오류가 발생했습니다. 페이지를 새로고침 후 다시 시도해주세요.')
		} else if (error instanceof Error && error.message.includes('undefined')) {
			console.error('undefined 에러 - Date 객체가 정의되지 않음')
			alert('시스템 오류가 발생했습니다. 페이지를 새로고침 후 다시 시도해주세요.')
		}
	}
}

const onClickChangeSrc = (pageType: string) => {
	/// <param name="strMcode">강의코드</param>
	/// <param name="pageType">강의타입(TEST, DANWON, BOGANG, SIMWHA, WRONG, SIMILAR, CHALLENGE)</param>
	/// <param name="testType">강의코드(P:기본문제, B:보충/심화, L:유사문제, C:도전문제)</param>
	/// <param name="strComplete">완강여부(Y, N)</param>
	prevPageType.value = curExamInfo.value.pageType.toString()
	curExamInfo.value.pageType = pageType
	popitem.value.isShow = false
	curEdubasePageTypeVal.value = curEdubasePageType(configinfo)
	
	switch (pageType) {
		case 'TEST':
			curExamInfo.value.testType = 'P'
			curExamInfo.value.strComplete = configinfo.TestStudyYN
			break
		case 'SIMILAR':
			curExamInfo.value.testType = 'L'
			// 쌍둥이 문제는 항상 새로 풀기 시작하도록 'N'으로 설정
			curExamInfo.value.strComplete = 'N'
			break
		case 'CHALLENGE':
			curExamInfo.value.testType = 'C'
			// 도전 문제는 항상 새로 풀기 시작하도록 'N'으로 설정
			curExamInfo.value.strComplete = 'N'
			break
		default:
			return
	}
	// 실제 로그인 사용자 ID로 업데이트
	if (userInfo.value?.UserID && userInfo.value.UserID !== 'default') {
		curExamInfo.value.userId = userInfo.value.UserID
	}
	
	emit('chgsrc', curExamInfo.value)
	loadDataHtml(
		`/app_edubase/AppQuestionBank/IndexExApp?strUserID=${curExamInfo.value.userId}&strMCode=${curExamInfo.value.mCode}&pageType=${curExamInfo.value.pageType}&testType=${curExamInfo.value.testType}&strComplete=${curExamInfo.value.strComplete}`,
	)
}



const onClickClose = () => {
	popitem.value = {
		isShow: true,
		id: 'lecPlayerAlert',
		type: 'confirm',
		msg: '임시저장 후 종료 하시겠습니까?',
		action: () => {
			popitem.value.isShow = false
			
					// 임시저장 실행
		if (typeof window?.TempSave !== 'undefined') {
			window.TempSave()
		} else {
			console.warn('TempSave 함수가 정의되지 않음')
		}
			
			// 임시저장 후 창 닫기 (약간의 지연을 두어 임시저장이 완료되도록 함)
			setTimeout(() => {
				window.close()
			}, 1000)
		},
	}
}
const onClickWebViewTestReset = () => {
	popitem.value = {
		isShow: true,
		id: 'lecPlayerAlert',
		type: 'confirm',
		msg: '초기화 하시겠습니까?',
		action: () => {
			popitem.value.isShow = false
			if (typeof window.WebViewTestReset !== 'undefined') {
				window.WebViewTestReset()
			}
		},
	}
}
</script>

<template>
	<div class="winPopWrap wrapMathUpNS">
		<div style="position: relative; width: 1070px; height: 800px">
			<client-only>
				<div id="divLoadHtmlValue" v-html="loadHtmlValue"></div>
			</client-only>

		</div>
		<div class="popBodyB">
			<!-- 에듀베이스영역 -->
			<div class="areaEdubase"></div>
			<!-- // 에듀베이스영역 -->
			<div class="areaFeature">
				<div
					class="innerFeature"
					:style="{ paddingLeft: testJsonData.length > 10 ? '70px' : undefined }"
				>
					<div class="timeTypeA">
						<span class="titTime">{{ examTitle }}</span>
						<em v-if="curExamInfo.isLecture && curExamInfo.pageType === 'LEC'" class="numTime"
							>해설강의</em
						>
					</div>
					<ol class="listQuestion">
						<li v-for="(item, index) in testJsonData" :key="index">
							<a
								href="javascript:;"
								class="linkQuestion"
								:class="{
									active: curExamNum === index + 1,
									correct: curExamIsComp && item.result === '2',
									incorrect: curExamIsComp && item.result !== '2',
								}"
								@click.prevent="onClickGoNum(index + 1)"
								>{{ index + 1 }}</a
							>
						</li>
					</ol>

					<div class="groupCtrl">
						<button
							type="button"
							class="btnPrev"
							style="border: 0; background: border-box"
							:disabled="curExamNum === 1"
							@click="onClickGoNum(curExamNum - 1)"
						>
							<!-- 비활성화일경우 disabled 속성 추가 -->
							<span class="icoArrow">이전</span>
						</button>
						<button
							type="button"
							class="btnNext"
							style="border: 0; background: border-box"
							:disabled="curExamNum === testJsonData.length"
							@click="onClickGoNum(curExamNum + 1)"
						>
							<!-- 비활성화일경우 disabled 속성 추가 -->
							<span class="icoArrow">다음</span>
						</button>
					</div>
					<!-- <button type="button" class="btnRound"><span class="txt">다음문제</span></button> -->
					<button v-if="!curExamIsComp" type="button" class="btnRound">
						<span class="txt" @click.prevent="onClickSubmitPaper">일괄채점</span>
					</button>
					<button
						v-if="
							curExamInfo.pageType !== 'LEC' &&
							curExamInfo.strComplete == 'Y' &&
							curExamInfo.isLecture
						"
						type="button"
						class="btnRound"
						@click.prevent="onClickChangeSrc('LEC')"
					>
						<span class="txt">해설강의</span>
					</button>
					<button
						v-if="curExamInfo.pageType !== 'TEST'"
						type="button"
						class="btnRound"
						@click.prevent="onClickChangeSrc('TEST')"
					>
						<span class="txt"
							>기본 문제 {{ configinfo.TestStudyYN === 'Y' ? '보기' : '풀기' }}</span
						>
					</button>
					<button
						v-if="
							configinfo.SimilarYN === 'Y' &&
							curExamInfo.pageType !== 'SIMILAR' &&
							(curExamInfo.isTest || curExamInfo.isChallenge) &&
							curExamInfo.strComplete == 'Y'
						"
						type="button"
						class="btnRound"
						:v-bind="{ disabled: curExamInfo.isTest }"
						@click.prevent="onClickChangeSrc('SIMILAR')"
					>
						<span class="txt"
							>쌍둥이 문제
							{{
								configinfo.TestStudyYN === 'Y' && configinfo.SimilarStudyYN === 'Y'
									? '보기'
									: '풀기'
							}}</span
						>
					</button>
					<button
						v-if="(configinfo.ChallengeYN === 'Y' || configinfo.ChallengeYN === undefined) && curExamInfo.pageType !== 'CHALLENGE'"
						type="button"
						class="btnRound"
						v-bind="{
							disabled: bufEdubasePageTypeVal !== 'CHALLENGE',
						}"
						@click.prevent="onClickChangeSrc('CHALLENGE')"
					>
						<span class="txt"
							>도전 문제
							{{
								configinfo.TestStudyYN === 'Y' && configinfo.ChallengeStudyYN === 'Y'
									? '보기'
									: '풀기'
							}}</span
						>
					</button>
					<!--<button v-if="curExamInfo.isTemp" type="button" class="btnRound">-->
					<button type="button" class="btnRound">
						<span class="txt" @click.prevent="onClickTempSave">임시저장</span>
					</button>
					
					<button v-if="!isOneProblemView" type="button" class="btnRound">
						<span class="txt" @click.prevent="onClickShowOneProblem">한문항보기</span>
					</button>
					<button v-if="isOneProblemView" type="button" class="btnRound">
						<span class="txt" @click.prevent="onClickShowAllProblem">전체보기</span>
					</button>

					<button type="button" class="btnRound">
						<span class="txt" @click.prevent="onClickClose">끝내기</span>
					</button>
					<button v-if="curExamInfo.isTest" type="button" class="btnRound">
						<span class="txt" @click.prevent="onClickWebViewTestReset">다시풀기(초기화)</span>
					</button>
				</div>
			</div>
		</div>
		<ContentsLayerPop ref="layerpop" :propsitem="popitem"></ContentsLayerPop>
	</div>
</template>

<style scoped>
.innerFeature {
	top: 0px !important;
	width: 170px !important;
}
/*-------------------------------------------------------------------
## Edubase
-------------------------------------------------------------------*/
/* layout */
.winPopWrap .popHeadB {
	height: 133.5px;
	background: url(//cdndata.milkt.co.kr/high/happ/Images/contents/ai_mathupNS/bg_winpop_head02.jpg)
		no-repeat;
	background-size: cover;
}
.winPopWrap .popHeadB .tit {
	height: 74px;
	font-size: 0;
}
.winPopWrap .popHeadB .tit .txt {
	display: inline-block;
	font-family: 'GmarketSansBold', sans-serif;
	font-size: 32.5px;
	line-height: 78px;
	color: #fff;
	vertical-align: top;
}
.winPopWrap .popHeadB .tit .tag {
	display: inline-block;
	width: 58px;
	height: 30px;
	margin: 21px 0 0 10px;
	border: 1px solid #fff;
	border-radius: 15px;
	box-sizing: border-box;
	font-family: 'GmarketSansMedium', sans-serif;
	font-size: 19px;
	line-height: 28px;
	color: #fff;
	vertical-align: top;
}
.winPopWrap .popHeadB .groupInfo {
	display: -webkit-flex;
	display: flex;
	height: 59.5px;
	padding: 0 20px 0 43px;
	background: #201539;
	border-top: 1px solid #67387c;
	justify-content: space-between;
	align-items: center;
	-webkit-align-items: center;
}
.winPopWrap .infoLecture {
	padding: 30px 0;
	font-size: 0;
}
.winPopWrap .infoLecture.typeSmall {
	padding: 0;
}
.winPopWrap .infoLecture.typeSmall .titLecture {
	font-family: 'NotoKrMedium', sans-serif;
	font-size: 16px;
	color: #f155ff;
}
.winPopWrap .infoLecture.typeSmall .descLecture {
	font-family: 'NotoKrMedium', sans-serif;
	font-size: 16px;
	color: #f3f3f3;
}
.winPopWrap .infoLecture.typeSmall .titLecture + .descLecture:before {
	display: inline-block;
	width: 1px;
	height: 16px;
	margin: 1px 15px 0;
	background: #695c6c;
	vertical-align: top;
	content: '';
}
/* .winPopWrap .popBodyB { display:-webkit-flex; display:flex; height:100%; padding-top:133.5px; box-sizing:border-box; }  */
/* contents */
.wrapMathUpNS .areaEdubase {
	/*flex:1;*/ /*overflow:auto*/
}
.wrapMathUpNS .areaVod {
	width: 355px;
	padding: 40px;
	box-sizing: border-box;
} /* default는 vertical */
.wrapMathUpNS .areaEdubase .titArea {
	min-width: 834px;
	width: 100%;
	padding: 40px 40px 0 66px;
	box-sizing: border-box;
	font-size: 0;
}
.wrapMathUpNS .areaEdubase .titArea .tit {
	font-family: 'NotoKrBold', sans-serif;
	font-weight: 400 !important;
	font-size: 22px;
	color: #000;
}
.wrapMathUpNS .areaEdubase .titArea .icoBook {
	width: 24.5px;
	height: 19.5px;
	margin: 0 10px 0 0;
	background: url(//cdndata.milkt.co.kr/high/happ/Images/contents/ai_mathup/ico_book.png) no-repeat;
	background-size: 24.5px;
	vertical-align: top;
}
.wrapMathUpNS .areaEdubase .imgArea {
	min-width: 834px;
	width: 100%;
	padding: 33px 40px 40px 66px;
	box-sizing: border-box;
}
.wrapMathUpNS .itemVod {
	width: 277px;
}
.wrapMathUpNS .itemVod + .itemVod {
	margin-top: 20px;
}
.wrapMathUpNS .itemVod .linkVod {
	position: relative;
	display: block;
	width: 100%;
	height: 155.5px;
}
.wrapMathUpNS .itemVod .linkVod:after {
	position: absolute;
	top: 50%;
	left: 50%;
	width: 68px;
	height: 68px;
	background: url(//cdndata.milkt.co.kr/high/happ/Images/contents/ai_mathup/ico_play_vod01.png)
		no-repeat;
	background-size: cover;
	transform: translate(-50%, -50%);
	-webkit-transform: translate(-50%, -50%);
	content: '';
}
.wrapMathUpNS .itemVod .duration {
	position: absolute;
	bottom: 5px;
	right: 5px;
	height: 19px;
	padding: 0 5px;
	border-radius: 2px;
	font-size: 12px;
	line-height: 20px;
	color: #fff;
	background-color: #000;
}
.wrapMathUpNS .itemVod .titVod {
	display: block;
	padding: 13px 11px;
	font-weight: 600;
	font-size: 17px;
	line-height: 25px;
	color: #111;
}
.wrapMathUpNS .areaVod.typeHorizon {
	width: 100%;
	padding: 40px 24px;
	font-size: 0;
	flex: 1;
}
.wrapMathUpNS .areaVod.typeHorizon .itemVod {
	display: inline-block;
	width: 275px;
	height: 270px;
	padding: 0 16px;
	box-sizing: content-box;
	vertical-align: top;
}
.wrapMathUpNS .areaVod.typeHorizon .itemVod + .itemVod {
	margin-top: 0;
}
/*-- 문제풀이 - 우측 */
.wrapMathUpNS .infoQuestion {
	margin: 51px 50px 0 66px;
} /* 문항영역 스케일 줄임 */
.wrapMathUpNS .itemQuestion {
	margin: 20px 50px 60px 66px;
} /* 문항영역 스케일 줄임 */
.wrapMathUpNS .areaFeature {
	width: 220px;
	/* height: calc(100vh - 133.5px); */
}
.wrapMathUpNS .areaFeature .btnRound {
	margin-top: 10px;
	padding: 0;
	width: 150px;
	height: 30px;
	border-radius: 36px;
	text-align: center;
}
.wrapMathUpNS .areaFeature .btnRound .txt {
	font-family: 'NotoKrBold', sans-serif;
	font-size: 15px;
	color: #000;
}
.wrapMathUpNS .groupCtrl {
	display: -webkit-flex;
	display: flex;
	margin-top: 21px;
	justify-content: space-between;
	justify-content: space-between;
}
.wrapMathUpNS .groupCtrl [class*='btn'] .icoArrow {
	width: 55px;
	height: 55px;
	vertical-align: top;
	display: inline-block;
}
.wrapMathUpNS .groupCtrl .btnPrev {
	padding-left: 0;
}
.wrapMathUpNS .groupCtrl .btnPrev .icoArrow {
	background: url(//cdndata.milkt.co.kr/high/happ/Images/contents/ai_mathupNS/btn_pop_prev01.png)
		no-repeat;
	background-size: contain;
}
.wrapMathUpNS .groupCtrl .btnNext .icoArrow {
	background: url(//cdndata.milkt.co.kr/high/happ/Images/contents/ai_mathupNS/btn_pop_next01.png)
		no-repeat;
	background-size: contain;
}
.wrapMathUpNS .groupCtrl .btnPrev:disabled .icoArrow,
.wrapMathUp .groupCtrl .btnPrev[disabled] .icoArrow {
	opacity: 0.5;
}
.wrapMathUpNS .groupCtrl .btnNext:disabled .icoArrow,
.wrapMathUp .groupCtrl .btnNext[disabled] .icoArrow {
	opacity: 0.5;
}
.wrapMathUpNS .innerFeature {
	position: fixed;
	top: 152px;
	right: 0;
	width: 210px;
	height: 550px;
	padding: 95px 20px 38px;
	background: url(//cdndata.milkt.co.kr/high/happ/Images/contents/ai_mathupNS/bg_pop_feature01.png)
		no-repeat;
	background-size: 100%;
}
.wrapMathUpNS .innerFeature.typeLarge {
	height: 565px;
	background-image: url(//cdndata.milkt.co.kr/high/happ/Images/contents/ai_mathupNS/bg_pop_feature02.png);
}
.wrapMathUpNS .innerFeature.typeSmall {
	height: 454px;
	background-image: url(//cdndata.milkt.co.kr/high/happ/Images/contents/ai_mathupNS/bg_pop_feature03.png);
}
.wrapMathUpNS .innerFeature .timeTypeA {
	margin-bottom: 10px;
}
.wrapMathUpNS .innerFeature .timeTypeA .numTime {
	color: #f155ff;
}
.wrapMathUpNS .listQuestion {
	margin: 0 -6px 0 -3px;
	font-size: 0;
	text-align: left;
}
.wrapMathUpNS .listQuestion li {
	display: inline-block;
	padding: 4.5px 2px;
	vertical-align: top;
}
.wrapMathUpNS .listQuestion .linkQuestion {
	position: relative;
	display: block;
	width: 30px;
	height: 30px;
	border-radius: 2px;
	background: rgba(19, 8, 43, 0.7);
	font-family: 'NotoKrMedium', sans-serif;
	font-size: 1.125rem;
	line-height: 29px;
	color: #5e5064;
	text-align: center;
	vertical-align: middle;
}
.wrapMathUpNS .listQuestion .linkQuestion.active {
	color: #f155ff;
	border: 1px solid #f155ff;
}
/* .wrapMathUpNS .listQuestion .linkQuestion.active:after { overflow:hidden; position:absolute; top:-1px; left:-1px; right:-1px; bottom:-1px; border:1px solid #f155ff; border-radius:3px; content:'' } */
.wrapMathUpNS .listQuestion .linkQuestion.correct,
.wrapMathUpNS .listQuestion .linkQuestion.incorrect {
	background: rgba(133, 94, 161, 0.7);
	color: rgba(255, 255, 255, 0.4);
}
.wrapMathUpNS .listQuestion .linkQuestion.correct.active,
.wrapMathUpNS .listQuestion .linkQuestion.incorrect.active {
	background: rgba(0, 0, 0, 0.7);
	color: #f155ff;
}
.wrapMathUpNS .listQuestion .linkQuestion.correct:before,
.wrapMathUpNS .listQuestion .linkQuestion.incorrect:before {
	position: absolute;
	top: 50%;
	left: 50%;
	-webkit-transform: translate(-50%, -50%);
	transform: translate(-50%, -50%);
	content: '';
}
.wrapMathUpNS .listQuestion .linkQuestion.correct:before {
	width: 26px;
	height: 26px;
	background: url(//cdndata.milkt.co.kr/high/happ/Images/contents/ai_mathupNS/obj_mark_o.png)
		no-repeat;
	background-size: 26px;
}
.wrapMathUpNS .listQuestion .linkQuestion.incorrect:before {
	width: 22px;
	height: 22px;
	background: url(//cdndata.milkt.co.kr/high/happ/Images/contents/ai_mathupNS/obj_mark_x.png)
		no-repeat;
	background-size: 22px;
}
/* 권장풀이시간 */
.wrapMathUpNS .timeTypeA {
	height: 35px;
	line-height: 36px;
	border-radius: 20px;
	background: #000;
	padding: 0 10px;
	text-align: center;
}
.wrapMathUpNS .timeTypeA .titTime {
	padding-right: 5px;
	font-family: 'NotoKrMedium', sans-serif;
	font-size: 15px;
	font-weight: normal;
	color: #ccc;
}
.wrapMathUpNS .timeTypeA .numTime {
	font-family: 'NotoKrMedium', sans-serif;
	font-size: 10px;
	color: #b567fe;
}
/* 출제유형 */
.wrapMathUpNS .infoTypeA {
	display: inline-block;
	height: 30px;
	border-radius: 15px;
	background: #f2ecf3;
	padding: 7px 15px 0;
	font-family: 'NotoKrMedium', sans-serif;
	font-size: 16px;
	font-weight: normal;
	color: #695c6c;
}
.wrapMathUpNS .infoTypeA > span {
	display: inline-block;
	padding-left: 6px;
}
.wrapMathUpNS .infoTypeA > span + span::before {
	content: '';
	display: inline-block;
	width: 1px;
	height: 14px;
	margin-right: 6px;
	background: #d7cfd8;
	vertical-align: middle;
}
.wrapMathUpNS .infoTypeA .numInfo {
	font-family: 'NotoKrBold', sans-serif;
	padding-left: 5px;
	font-size: 16px;
	color: #f155ff;
}

.wrapMathUpNS .sideOption {
	position: fixed;
	bottom: 23px;
	right: 23px;
	z-index: 10;
}
.wrapMathUpNS .sideOption .inner {
	position: relative;
}
.wrapMathUpNS .sideOption.typeWinPop {
	right: 17.5px;
	bottom: 16.5px;
}
.wrapMathUpNS .sideOption .btnSideOption {
	overflow: hidden;
	position: absolute;
	right: 0;
	bottom: 0;
	z-index: 999;
	display: -webkit-flex;
	display: flex;
	width: 60px;
	height: 60px;
	border-radius: 100%;
	text-align: center;
	vertical-align: middle;
	-webkit-justify-content: center;
	justify-content: center;
	align-items: center;
	-webkit-align-items: center;
	-webkit-flex-direction: column;
	flex-direction: column;
}
.wrapMathUpNS .sideOption .btnSideOption .txt {
	padding-top: 2px;
	font-family: 'NotoKrMedium', sans-serif;
	font-size: 0.9375rem;
	line-height: 1.15rem;
}
.wrapMathUpNS .sideOption .typeMedium {
	width: 75px;
	height: 75px;
}
.wrapMathUpNS .sideOption .typeLarge {
	width: 90px;
	height: 90px;
	font-size: 1.0625rem;
	line-height: 1.25rem;
}

.wrapMathUpNS .sideOption .colorA {
	background: rgba(215, 215, 215, 0.8);
}
.wrapMathUpNS .sideOption .colorA .txt {
	color: #4c4e51;
}
.wrapMathUpNS .sideOption .colorB {
	background: rgb(255, 179, 41);
	background: linear-gradient(134deg, rgba(255, 179, 41, 1) 0%, rgba(254, 120, 40, 1) 100%);
}
.wrapMathUpNS .sideOption .colorB .txt {
	color: #fff;
}

.wrapMathUpNS .sideOption .colorC {
	padding-bottom: 25px;
	background: rgb(152, 84, 212);
	background:
		url(//cdndata.milkt.co.kr/high/happ/Images/contents/ai_mathup/bg_genia02.png) no-repeat 50% 60px,
		linear-gradient(134deg, rgba(152, 84, 212, 1) 0%, rgba(109, 64, 201, 1) 100%);
	background-size: 52.5px, 100%;
}
.wrapMathUpNS .sideOption .colorC .txt {
	color: #fff;
}
.wrapMathUpNS .sideOption .colorD {
	background: rgb(0, 230, 212);
	background: linear-gradient(134deg, rgba(0, 230, 212, 1) 0%, rgba(1, 153, 141, 1) 100%);
}
.wrapMathUpNS .sideOption .colorD .txt {
	color: #fff;
}
.wrapMathUpNS .sideOption .colorE {
	background: rgb(4, 181, 250);
	background: linear-gradient(134deg, rgba(4, 181, 250, 1) 0%, rgba(4, 120, 250, 1) 100%);
}
.wrapMathUpNS .sideOption .colorE .txt {
	color: #fff;
}

.wrapMathUpNS .sideOption .icoPencel {
	width: 18.5px;
	height: 18.5px;
	margin-bottom: 4px;
	background: url(//cdndata.milkt.co.kr/high/happ/Images/contents/ai_mathup/ico_pencel02.png)
		no-repeat;
	background-size: cover;
}
.wrapMathUpNS .sideOption .icoPencel + .txt {
	line-height: 1rem;
}
.wrapMathUpNS .sideOption .groupButton {
	display: none;
	position: fixed;
	top: 0;
	right: 0;
	bottom: 0;
	left: 0;
	z-index: 997;
	background: rgba(0, 0, 0, 0.7);
}
.wrapMathUpNS .sideOption .groupButton .bgCircle {
	position: fixed;
	bottom: -109.5px;
	right: -119.5px;
	z-index: 998;
	width: 352.5px;
	height: 352.5px;
	background: url(//cdndata.milkt.co.kr/high/happ/Images/contents/ai_mathup/bg_sideoption_circle01.png)
		no-repeat;
	background-size: cover;
	animation: rotating 25s infinite;
	-webkit-animation: rotating 25s infinite;
}
.wrapMathUpNS .sideOption .groupButton .btnSideOption:nth-child(1) {
	position: fixed;
	right: 185px;
	bottom: 15px;
	animation: fadeInScale 0.2s 0.2s forwards;
	-webkit-animation: fadeInScale 0.2s 0.2s forwards;
	opacity: 0;
} /* 맨아래부터 시계 방향 */
.wrapMathUpNS .sideOption .groupButton .btnSideOption:nth-child(2) {
	position: fixed;
	right: 130px;
	bottom: 130px;
	animation: fadeInScale 0.2s 0.4s forwards;
	-webkit-animation: fadeInScale 0.2s 0.4s forwards;
	opacity: 0;
}
.wrapMathUpNS .sideOption .groupButton .btnSideOption:nth-child(3) {
	position: fixed;
	right: 15px;
	bottom: 185px;
	animation: fadeInScale 0.2s 0.6s forwards;
	-webkit-animation: fadeInScale 0.2s 0.6s forwards;
	opacity: 0;
}
.wrapMathUpNS .sideOption .groupButton .btnSideOption.typeReverse:nth-child(1) {
	animation: fadeInScaleReverse 0.2s 0.5s forwards;
	-webkit-animation: fadeInScaleReverse 0.2s 0.5s forwards;
	opacity: 1;
} /* 맨아래부터 반시계 방향 */
.wrapMathUpNS .sideOption .groupButton .btnSideOption.typeReverse:nth-child(2) {
	animation: fadeInScaleReverse 0.2s 0.3s forwards;
	-webkit-animation: fadeInScaleReverse 0.2s 0.3s forwards;
	opacity: 1;
}
.wrapMathUpNS .sideOption .groupButton .btnSideOption.typeReverse:nth-child(3) {
	animation: fadeInScaleReverse 0.2s 0.2s forwards;
	-webkit-animation: fadeInScaleReverse 0.2s 0.2s forwards;
	opacity: 1;
}

/*-------------------------------------------------------------------
## typeEdubase(0.5배수로 작업)
-------------------------------------------------------------------*/
.typeEdubase {
	min-width: 640px;
}
.typeEdubase ::-webkit-scrollbar {
	width: 0;
	height: 0;
}
.typeEdubase ::-webkit-scrollbar-thumb {
	border-radius: 0;
	background: transparent;
}

.typeEdubase .btnPopClose {
	padding: 2px 8.5px 10px 10px;
}
.typeEdubase .btnPopClose .icoClose {
	width: 10px;
	height: 10px;
}
.typeEdubase .infoLecture {
	padding-top: 5px !important;
}
.typeEdubase .infoLecture.typeSmall .titLecture,
.typeEdubase .infoLecture.typeSmall .descLecture {
	font-size: 0.5rem !important;
}
.typeEdubase .infoLecture.typeSmall .titLecture + .descLecture:before {
	width: 0.5px;
	height: 7px;
	margin: 0 6px;
}
.typeEdubase .infoListA {
	padding-top: 10px;
}
.typeEdubase .infoListA li {
	font-size: 0.3906rem;
}
.typeEdubase .infoListA li:not(:first-child) {
	margin-top: 5px;
}
.typeEdubase .infoListA.bulList > li:before {
	padding-right: 1px;
}

.typeEdubase .infoListB {
	padding-top: 10px;
	margin: 0 -3.5px;
}
.typeEdubase .infoListB li {
	font-size: 0.375rem;
	color: #aa73ba;
	word-break: normal;
	letter-spacing: -0.5px;
}
.typeEdubase .infoListB li:not(:first-child) {
	margin-top: 3px;
}
.typeEdubase .infoListB.bulList > li:before {
	padding-right: 1px;
}

.typeEdubase .innerFeature .timeTypeA {
	margin-bottom: 5px;
}
.typeEdubase .timeTypeA {
	height: 17.5px;
	line-height: 16px;
	border-radius: 20px;
	padding: 0 3px;
}
.typeEdubase .timeTypeA.wide {
	padding: 0 10px;
}
/* .typeEdubase .timeTypeA .titTime {
	padding-right: 1px;
	font-size: 7.5px;
} */
.typeEdubase .timeTypeA .numTime {
	font-size: 10px;
}

.typeEdubase .infoTypeA {
	height: 15px;
	padding: 5px 10px 0;
	border-radius: 7.5px;
	background: #f2ecf3;
	font-size: 8px;
}
.typeEdubase .infoTypeA > span {
	display: inline-block;
	padding-left: 3px;
}
.typeEdubase .infoTypeA > span + span:before {
	width: 1px;
	height: 8px;
	margin-top: -1px;
	margin-left: 3px;
}
.typeEdubase .infoTypeA .numInfo {
	padding-left: 3px;
	font-size: 8px;
}

/* .typeEdubase .popBodyB {
	padding-top: 66.75px;
} */
.typeEdubase .popHeadB {
	height: 66.75px;
}
.typeEdubase .popHeadB .tit {
	height: 37px;
}
.typeEdubase .popHeadB .tit .txt {
	font-size: 16.25px;
	line-height: 40px;
}
/* .typeEdubase .popHeadB .tit .tag { width:29px; height:15px; margin:10.5px 0 0 5px; border-radius:7.5px; font-size:0.59375rem; line-height:0.875rem } */
.typeEdubase .popHeadB .groupInfo {
	height: 29.75px;
	padding: 0 10px 0 21.5px;
}
.typeEdubase .popHeadB .infoProcess > * {
	font-size: 8px;
	color: #1bffe1;
}
.typeEdubase .popHeadB .emphNum {
	margin-left: 2.5px;
}
.typeEdubase .popHeadB .percentBar {
	width: 85px;
	height: 6.5px;
	margin-top: -1px;
	margin-left: 5px;
	border-radius: 3.5px;
}
.typeEdubase .popHeadB .percent {
	width: 85px;
	height: 6.5px;
	border-radius: 3.5px;
}

.typeEdubase .tagTypeA {
	padding: 4px 5px 2px;
	border-radius: 10px;
	font-size: 0;
}
.typeEdubase .areaFeature .tagTypeA {
	padding: 2px 7px 4px;
}
.typeEdubase .tagTypeA > * {
	font-size: 0.5rem;
}
.typeEdubase .tagTypeA .icoClock {
	width: 8px;
	height: 8px;
	margin: 1px 2.5px 0;
	background-size: 8px;
}
.typeEdubase .tagTypeA + .txtDesc {
	font-size: 0.5rem;
}

.typeEdubase .infoQuestion {
	margin: 15px 25px 0 33px;
} /* 문항영역 스케일 줄임 */
/*.typeEdubase .itemQuestion { margin:10px 25px 30px 33px } /* 문항영역 스케일 줄임 */
.typeEdubase .itemQuestion {
	margin: -25px -25px 0 -33px;
	transform: scale(0.8);
	-webkit-transform: scale(0.8);
	-moz-transform: scale(0.8);
	-o-transform: scale(0.8);
}
.typeEdubase .areaFeature {
	width: 110px;
	/* height: 0px; */
	/* height: calc(100vh - 66.75px); */
}
.typeEdubase .areaFeature > .tagTypeA {
	margin: 25.5px 10px 0 -4px;
}
.typeEdubase .areaFeature > .btnRound {
	right: 10px;
	bottom: 57px;
}
.typeEdubase .areaFeature .btnRound {
	width: 85px;
	height: 30px;
	padding: 10px;
	border-radius: 15px;
}
.typeEdubase .areaFeature .btnRound .txt {
	font-size: 0.62rem;
}
.typeEdubase .btnRound .txt {
	padding-top: 2px;
}
.typeEdubase .sideOption.typeWinPop {
	right: 8.75px;
	bottom: 8.25px;
}
.typeEdubase .sideOption .btnSideOption {
	width: 37.5px;
	height: 37.5px;
}
.typeEdubase .sideOption .icoPencel {
	width: 9.25px;
	height: 9.25px;
	margin-bottom: 0px;
	background-size: 9.25px;
}
.typeEdubase .sideOption .colorA .txt {
	font-size: 0.47rem;
	color: #4c4e51;
}

/* .typeEdubase .innerFeature {
	top: 76px;
	width: 105px;
	padding: 44px 10px 19px;
} */
.typeEdubase .emphFeature {
	margin-top: 8.5px;
	font-size: 0.47rem;
}
.typeEdubase .innerFeature .txtTime {
	width: 85px;
	height: 20px;
	padding-top: 5px;
	margin-top: 5.5px;
	border-radius: 10px;
	font-size: 0.72rem;
}
.typeEdubase .listQuestion {
	margin: 0 -3.5px 0 -2.5px;
}
.typeEdubase .listQuestion li {
	padding: 2.25px 1px;
}
.typeEdubase .listQuestion .linkQuestion {
	width: 20px;
	height: 15px;
	line-height: 16px;
	border-radius: 1px;
	font-size: 0.56rem;
}
.typeEdubase .listQuestion .linkQuestion.active {
	line-height: 14px;
}
.typeEdubase .listQuestion .linkQuestion.active:after {
	top: -1px;
	left: -1px;
	right: -1px;
	bottom: -1px;
	border: 1px solid #f155ff;
	border-radius: 1px;
}

.typeEdubase .listQuestion .linkQuestion.correct:before {
	width: 13px;
	height: 13px;
	background-size: 13px;
}
.typeEdubase .listQuestion .linkQuestion.incorrect:before {
	width: 11px;
	height: 11px;
	background-size: 11px;
}
.typeEdubase .groupCtrl {
	margin-top: 7px;
}
.typeEdubase .groupCtrl [class*='btn'] .icoArrow {
	width: 27.5px;
	height: 27.5px;
}
.typeEdubase .innerFeature .btnRound {
	margin-top: 5px;
}
.typeEdubase .innerFeature .btnRound.mtSm {
	margin-top: 8px;
}
.typeEdubase .vodFeature {
	margin-top: 5px;
}
.typeEdubase .vodFeature .linkVod {
	width: 86px;
	height: 50px;
	margin-top: 5px;
}
.typeEdubase .vodFeature .linkVod:after {
	width: 21.5px;
	height: 21.75px;
}
.typeEdubase .vodFeature .duration {
	bottom: 2px;
	right: 2px;
	height: 12px;
	padding: 0 2px;
	border-radius: 2px;
	font-size: 0.4rem;
	line-height: 12px;
}

.typeEdubase .innerFeature.typeXSmall {
	height: 177.75px;
}
.typeEdubase .innerFeature.typeSmall {
	height: 227px;
}
.typeEdubase .innerFeature.typeMedium {
	height: 250.5px;
}
.typeEdubase .innerFeature.typeXSmall .btnRound.mtSm {
	margin-top: 19.5px !important;
}
.typeEdubase .innerFeature.typeMedium .btnRound.mtSm {
	margin-top: 17px !important;
}

.typeEdubase .popBodyB {
	height: auto;
}
.typeEdubase .popBodyB {
	position: absolute;
	top: 66.75px;
	right: 0;
	bottom: 0;
	left: 0;
	padding-top: 0;
}
.typeEdubase .popBodyB .areaEdubase {
	position: relative;
	margin-right: 75px;
}

.typeEdubase .popBodyB .areaFeature {
	position: absolute;
	top: 0;
	right: 0;
	bottom: 0;
	width: 110px;
	min-height: 150px;
}
.typeEdubase .popBodyB .areaFeature > .tagTypeA {
	float: right;
	height: 16px;
	margin: 25.5px 20px 0 0;
	white-space: nowrap;
}
.typeEdubase .popBodyB .areaFeature > .btnRound {
	position: absolute;
	right: 20px;
	bottom: 57px;
}

.typeEdubase .popHeadB .groupInfo.typeMockTest {
	position: relative;
	height: 38px;
	padding: 0 22.5px;
	border-bottom: 1px solid #202020;
}
.typeEdubase .popHeadB .groupInfo .txtClass {
	width: 41.25px;
}
.typeEdubase .popHeadB .groupInfo .txtInfo {
	margin: 2px 0 0 7.5px;
	font-size: 9px;
}
.typeEdubase .popHeadB .groupInfo .titClass {
	position: absolute;
	top: 11px;
	left: 50%;
	width: 200px;
	font-size: 17px;
	font-family: 'NotoKrBold', sans-serif;
	color: #000;
	letter-spacing: -0.05em;
	text-align: center;
	transform: translateX(-50%);
	-webkit-transform: translateX(-50%);
}
.typeEdubase .popHeadB .groupInfo .txtTime .icoClock {
	width: 9px;
	height: 9px;
	margin-top: 3px;
	background-size: 9px 9px;
}
.typeEdubase .popHeadB .groupInfo .txtTime .txt {
	margin: 3px 0 0 2.5px;
	font-size: 9px;
}
.typeEdubase .popHeadB .groupInfo .txtTime .time {
	margin: 3px 0 0 6.5px;
	font-weight: 900;
	font-size: 16px;
	line-height: 27px;
}
.typeEdubase .popHeadB .groupInfo .txtScore {
	font-size: 0;
}
.typeEdubase .popHeadB .groupInfo .txtScore .txt {
	font-size: 9px;
	color: #1a1a1a;
}
.typeEdubase .popHeadB .groupInfo .txtScore .num {
	margin-left: 5px;
	font-size: 12.5px;
	font-weight: 900;
	color: #000;
}
.typeEdubase .popHeadB .groupInfo .txtScore .num span {
	font-size: 16px;
	color: #f533a2;
}
</style>
