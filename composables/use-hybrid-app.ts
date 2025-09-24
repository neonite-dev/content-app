import type { ISoundInfo, IRecorderOption ,ImageDataItem} from '@/types/frame'
import type { IMenuState } from '@/types/menu'
import type { IPopItem } from '@/types/popup'
import Recorder from '@/utils/record/Recorder'
import { Ref, onUnmounted, ref } from '@nuxtjs/composition-api'
import { isEdubaseCompleted, loadMovie } from '@/utils'

// C01_01_Image.js에서 mcCanvasArea를 지우는 것을 방지하기 위한 오버라이드
if (typeof window !== 'undefined' && (window as any).createjs) {
	const originalRemoveAllChildren = (window as any).createjs.Container.prototype.removeAllChildren
	;(window as any).createjs.Container.prototype.removeAllChildren = function() {
		// mcCanvasArea가 아닌 경우에만 원래 함수 실행
		if (this.name !== 'mcCanvasArea') {
			return originalRemoveAllChildren.call(this)
		} else {
			console.log('Prevented mcCanvasArea from being cleared by removeAllChildren')
		}
	}
}

// const consola = require('consola')
const ifWinCamera = ref()
const ifWinRecord = ref()
const ifWinRecordCallbackId = ref('')
const ifData = ref<string>('')
const ifInstantData = ref<string>('')
const ifIsCompleteContents = ref<boolean>(false)
const ifLocalStream = ref()
const ifCurrentMenuScore = ref<number>(0)

const ifCanvasW = ref<string>('')
const ifCanvasH = ref<string>('')
const ifCanvasX = ref<string>('')
const ifCanvasY = ref<string>('')

const bgmBufStopId = ref<string>('')
const bgmListGroup = ref([])

const imageSaveGroup = ref<ImageDataItem[]>([]);

const recitem = ref<IPopItem>({
	isShow: false,
	isHide: false,
	id: 'voiceRec',
})
const refSttStart = ref<boolean>(false)

export const useHybridApp = () => {
	onUnmounted(() => {
		if (typeof window === 'undefined') return
		initLocalStream()
		console.log('useHybridApp onUnmounted')
	})
	return {
		initFrameEvt,
		loadMovie,
	}
}

const initLocalStream = () => {
	if (ifLocalStream.value !== undefined) {
		try {
			const vidTrack = ifLocalStream.value?.getVideoTracks()
			vidTrack?.forEach((track: any) => {
				ifLocalStream.value.removeTrack(track)
			})
		} catch (e) {}
	}
}

const initFrameEvt = (
	menusStore: any,
	userInfo: Ref<{
		UserID: string
		Name: string
		Grade: number
		MemberType: string
		SysUserId: string
	}>,
	menus: IMenuState,
	frame: Ref<any>,
	audioList: Ref<any>,
	frameSrc: Ref<any>,
	videoSrc: Ref<any>,
	videoNextPath: Ref<any>,
	canvasCapture: Ref<any>,
	canvasCaptureDataSrc: Ref<any>,
	baseTarget?: string,
	recpop?: Ref<any>,
) => {
	console.log('🔥 initFrameEvt 호출됨')
	console.log('🔥 userInfo.value:', userInfo.value)
	console.log('🔥 userInfo.value?.UserID:', userInfo.value?.UserID)
	
	const ifWin = frame.value?.contentWindow
	if (!ifWin) {
		console.error('🔥 ifWin이 없습니다')
		return
	}

	const {
		setStatus,
		setStep,
		setPlayTime,
		setContinueStudy,
		setIfXmlDocMenuIdx,
		setInitContinueStudy,
		setRequestHisComplete,
	} = menusStore
	if (!ifWin.HybridApp) {
		ifWin.HybridApp = {} as any
	}

	ifWin.HybridApp.getServerType = (): string => {
		const stype = baseTarget === 'stage' ? 's' : baseTarget === 'production' ? 'r' : 't'
		return stype // 's' 'r'
	}
	ifWin.HybridApp.completeContents = (): void => {
		const nPrevStatus = parseInt(menus.cjCurMenuData.status.toString()) // copy
		// 에듀베이스
		if (menus.cjCurMenuData.id === '999') {
			// 에듀베이스 항목 완료 여부 체크
			const isEdubaseComp = isEdubaseCompleted(menus.configInfo)
			isEdubaseComp ? setStatus(2) : setStatus(1)
		} else {
			setStatus(2)
		}
		setPlayTime()

		let isCompleteNow =
			menus.listMenuDatas.cjMenuDatas
				.filter((m, i) => i <= menus.listMenuDatas.menuIdx)
				.find(m2 => m2.status !== 2) == null
		// 테스트를 위해 임시 설정
		if (!isCompleteNow) {
			menus.listMenuDatas.cjMenuDatas
				.filter((m, i) => i <= menus.listMenuDatas.menuIdx)
				.forEach((v, i) => {
					v.status = 2
				})
			isCompleteNow = true
		}
		if (isCompleteNow) {
			// 전체 종료 (에듀베이스 예외 -> testYN 구분 후 추가 메뉴구성)
			if (menus.listMenuDatas?.cjMenuDatas?.length - 1 === menus.listMenuDatas?.menuIdx) {
				ifIsCompleteContents.value = true
				setRequestHisComplete(userInfo.value?.UserID, true)
			} else {
				setRequestHisComplete(userInfo.value?.UserID, true)
			}
		}
	}
	ifWin.HybridApp.remainFace = (strCode: string): void => {}
	ifWin.HybridApp.getBluetoothDeviceInfo = () => {
		return '[]'
	}
	ifWin.HybridApp.getMenuCount = () => {
		return menus.listMenuDatas?.cjMenuDatas?.length // mCnt
	}
	ifWin.HybridApp.getMenuIndex = () => {
		return menus.listMenuDatas?.menuIdx // idx
	}
	ifWin.HybridApp.nextMenu = () => {
		if (menus.listMenuDatas != null) {
			const menuIdx = menus.listMenuDatas?.menuIdx
			if (menuIdx > -1) {
				if (menuIdx + 1 <= menus.listMenuDatas?.cjMenuDatas?.length - 1) {
					setIfXmlDocMenuIdx(menuIdx + 1)
					audioList.value.forEach((v: any) => {
						v.currentTime = 0
						const audioItem = document.getElementById(v.id) as any
						if (audioItem != null) audioItem?.pause()
					})
					audioList.value = [] as ISoundInfo[]
				}
			}
		}
		initLocalStream()
	}
	ifWin.HybridApp.setMenu = (menuIdx: number) => {
		try {
			if (menuIdx >= 0) {
				setIfXmlDocMenuIdx(menuIdx)
			}
		} catch (e) {
			console.log(e)
			ifWin.HybridApp.setMenu(menuIdx - 1)
		}
	}

	ifWin.HybridApp.resetMenu = (menuIdx: number) => {
		//menuIdx = menuIdx + 1
		try {
			if (menuIdx >= 0) {
				console.log(`resetMenu : ${menuIdx}`)
				setIfXmlDocMenuIdx(menuIdx + 1 )
				setTimeout(function(){setIfXmlDocMenuIdx(menuIdx)},1000)
			}
		} catch (e) {
			console.log(e)
			ifWin.HybridApp.setMenu(menuIdx - 1)
		}
	}

	ifWin.HybridApp.message = (msg: any, callback: any, callback2: any) => {}
	ifWin.HybridApp.setData = (strData: string) => {
		ifData.value = strData
	}
	ifWin.HybridApp.getData = () => {
		return ifData.value
	}
	ifWin.HybridApp.setInstantData = (strData: string) => {
		ifInstantData.value = strData
	}
	ifWin.HybridApp.getInstantData = () => {
		return ifInstantData.value
	}
	ifWin.HybridApp.setLastStep = (nStep: number) => {
		setStep(nStep)
		menus.cjCurMenuData.step = nStep
	}
	ifWin.HybridApp.getLastStep = () => {
		return menus.cjCurMenuData.step || 1
	}
	ifWin.HybridApp.toast = (msg: any) => {}
	ifWin.HybridApp.getNowStatus = () => {
		/**
		 * 서버에 저장 된 현재 메뉴의 학습 진행 이력을 가지고 온다.
		 * 0 : 미진행 / 1 : 진행중 / 2 : 진행완료
		 */
		return menus.cjCurMenuData.status
	}
	ifWin.HybridApp.startCameraPreview = async (
		camFacing: any,
		x: any,
		y: any,
		width: any,
		height: any,
	) => {
		if (navigator.mediaDevices) {
			const devices = await navigator.mediaDevices.enumerateDevices()
			const videoDevices = devices?.filter(device => device.kind === 'videoinput')
			if (videoDevices?.length > 0) {
				if (ifWin.document.querySelector('#ifWinCamera') != null) {
					ifWin.document.querySelector('#ifWinCamera').remove()
				}
				const videoEl = ifWin.document.createElement('video')
				videoEl.setAttribute('id', 'ifWinCamera')
				videoEl.setAttribute('playsinline', '')
				videoEl.setAttribute('autoplay', '')
				videoEl.setAttribute('muted', '')
				videoEl.style.width = `${width}px`
				videoEl.style.height = `${height}px`
				videoEl.style.position = 'fixed'
				videoEl.style.marginLeft = `${x}px`
				videoEl.style.marginTop = `${y}px`
				videoEl.style.zIndex = `0`
				ifCanvasW.value = width
				ifCanvasH.value = height
				ifCanvasX.value = x
				ifCanvasY.value = y
				ifWinCamera.value = videoEl
				if (camFacing === 'front') {
					ifWin.document.body.prepend(videoEl)
				} else {
					ifWin.document.body.firstElementChild.prepend(videoEl)
				}
				/* Setting up the constraint */
				const facingMode = 'user' // Can be 'user' or 'environment' to access back or front camera (NEAT!)
				const constraints = {
					audio: false,
					video: {
						facingMode,
					},
				}
				/* Stream it to video element */
				navigator.mediaDevices?.getUserMedia(constraints).then(function success(stream) {
					ifWinCamera.value.srcObject = stream
					ifLocalStream.value = stream
				})
			}
		} else {
			console.log('camera 설정이 되어있지 않습니다.')
		}
	}
	ifWin.HybridApp.stopCameraPreview = () => {}
	ifWin.HybridApp.stopAndHideCameraPreview = () => {}
	ifWin.HybridApp.saveCameraPreview = (fn: any) => {
		if (ifWinCamera.value !== undefined) {
			// 기본 형태
			// data:[<mediatype>][;base64],<data>
			// HTML ➡︎ img태그 src
			// <img src="data:image/<이미지확장자>;base64,<data코드>")
			const doScreenshot = () => {
				const canvas = canvasCapture.value // document.createElement('canvas') as HTMLCanvasElement
				canvas.width = ifCanvasW.value // ifWinCamera.value.videoWidth
				canvas.height = ifCanvasH.value // ifWinCamera.value.videoHeight
				const canvasContext = canvas.getContext('2d') as any
				canvasContext.drawImage(ifWinCamera.value, 0, 0, ifCanvasW.value, ifCanvasH.value)
				// canvasContext.drawImage(ifWinCamera.value, 0, 0)
				canvasCaptureDataSrc.value = canvas.toDataURL('image/png')
				if (typeof fn === 'function') {
					fn()
				} else if (typeof fn === 'string') {
					// eslint-disable-next-line no-eval
					eval(
						`ifWin.${fn}('${canvasCaptureDataSrc.value.length > 1 ? canvasCaptureDataSrc.value : ''}')`,
					)
				}
				setTimeout(() => {
					const picEl = ifWin.document.querySelector('.user-profile>.pic') as any
					if (picEl) {
						picEl.style.zIndex = -1
					}
					const picElMath = ifWin.document.querySelector('.captureImg') as any
					if (picElMath && picElMath.src !== '') {
						picElMath.style.zIndex = 0
						ifWin.document.querySelector('#ifWinCamera').style.display = 'none'
						ifWin.document.querySelector('.save-btn .mode-03').addEventListener('click', () => {
							ifWin.document.querySelector('#ifWinCamera').style.display = 'block'
						})
					}
				}, 1000)
			}
			doScreenshot()
		}
	}
	ifWin.HybridApp.capture = (fn: (arg0: string) => void) => {
		if (ifWin.document.querySelector('#ifWinCamera') != null) {
			// ifWin.document.querySelector('#ifWinCamera').style.display = 'none'
		}
		// 리턴값 확인 필요 : data:image/png;base64,undefined
		const parseImg = canvasCaptureDataSrc.value.split('data:image/png;base64,')
		if (typeof fn === 'function') {
			fn(parseImg.length > 1 ? parseImg[1] : '')
		} else if (typeof fn === 'string') {
			// eslint-disable-next-line no-eval
			eval(`ifWin.${fn}('${parseImg.length > 1 ? parseImg[1] : ''}')`)
			initLocalStream()
		}
	}

	ifWin.HybridApp.startSilvySTTMode = (val: any) => {
		// audio paused
		const pauseAudioList = [] as any
		document.querySelectorAll('audio').forEach((m: HTMLAudioElement, i: number) => {
			if (!m.paused && m.duration > 0) {
				m.pause()
				pauseAudioList.push(m)
			}
		})

		refSttStart.value = true
		console.log('startSilvySTTMode start with val:', val)
		
		// 마이크 권한 확인
		navigator.mediaDevices.getUserMedia({ audio: true })
			.then(stream => {
				console.log('Microphone access granted')
				stream.getTracks().forEach(track => {
					console.log('Audio track settings:', track.getSettings())
				})
			})
			.catch(error => {
				console.error('Microphone access denied:', error)
			})
		
		const lp = recpop?.value as any
		if (lp) {
			console.log('Recorder instance found:', lp)
			setTimeout(() => {
				if (refSttStart.value === true) {
					if (typeof ifWin.HybridApp.onResultSTTMode === 'function') {
						// 안전성 검사 추가 - DOM이 준비될 때까지 지연
						setTimeout(() => {
							try {
								// iframe이 준비되었는지 확인
								if (ifWin && ifWin.document && ifWin.document.body) {
									// 더 유연한 안전성 검사 - 일반적인 DOM 요소들이 있는지 확인
									const hasContent = ifWin.document.body.children.length > 0 || 
													  ifWin.document.querySelector('canvas') || 
													  ifWin.document.querySelector('div') ||
													  ifWin.document.querySelector('span')
									
									if (hasContent) {
										console.log('DOM elements found, processing STT result')
										
										// STT 결과 유효성 검사
										const sttResult = lp.getResultValue().replace(/ /g, '')
										console.log('Raw STT result:', lp.getResultValue())
										console.log('Processed STT result:', sttResult)
										
										if (sttResult && sttResult.trim() !== '' && sttResult !== '<eps>') {
											// setSilvyText만 사용 (CJTextManager 에러 방지)
											if (ifWin.setSilvyText && typeof ifWin.setSilvyText === 'function') {
												console.log('Using setSilvyText for STT conversion:', sttResult)
												//ifWin.setSilvyText(sttResult)
												ifWin.HybridApp.onResultSTTMode(sttResult)
											} else {
												console.warn('setSilvyText not available, skipping STT conversion to prevent CJTextManager errors')
											}
										} else {
											console.log('Empty or invalid STT result, skipping conversion')
											console.log('Result analysis - length:', sttResult?.length, 'trimmed:', sttResult?.trim(), 'isEps:', sttResult === '<eps>')
										}
									} else {
										console.warn('No DOM content found, skipping STT conversion')
									}
								} else {
									console.warn('iframe not ready, skipping STT conversion')
								}
							} catch (error) {
								console.error('STT processing error in actionCallback:', error)
							}
						}, 1000) // 1초로 증가
						refSttStart.value = false
					}
				}
			}, 5000)
			recitem.value = {
				isShow: true,
				msg: '',
				isHide: true,
				actionCallback: (ret: string) => {
					console.log(`actionCallback(${ret})`)
					if (val === 0 && typeof ifWin.HybridApp.onResultSTTMode === 'function') {
						// 안전성 검사 추가 - DOM이 준비될 때까지 지연
						setTimeout(() => {
							try {
								// iframe이 준비되었는지 확인
								if (ifWin && ifWin.document && ifWin.document.body) {
									// 더 유연한 안전성 검사 - 일반적인 DOM 요소들이 있는지 확인
									const hasContent = ifWin.document.body.children.length > 0 || 
													  ifWin.document.querySelector('canvas') || 
													  ifWin.document.querySelector('div') ||
													  ifWin.document.querySelector('span')
									
									if (hasContent) {
										console.log('DOM elements found, processing STT result')
										
										// STT 결과 유효성 검사
										const sttResult = lp.getResultValue().replace(/ /g, '')
										if (sttResult && sttResult.trim() !== '' && sttResult !== '<eps>') {
											// setSilvyText를 우선적으로 사용 (CJTextManager 에러 방지)
											if (ifWin.setSilvyText && typeof ifWin.setSilvyText === 'function') {
												console.log('Using setSilvyText for STT conversion:', sttResult)
												ifWin.setSilvyText(sttResult)
											} else if (ifWin.HybridApp.onResultSTTMode) {
												console.log('Falling back to onResultSTTMode:', sttResult)
												try {
													ifWin.HybridApp.onResultSTTMode(sttResult)
												} catch (sttError) {
													console.error('STT conversion error:', sttError)
												}
											} else {
												console.warn('No STT conversion method available')
											}
										} else {
											console.log('Empty or invalid STT result, skipping conversion')
										}
									} else {
										console.warn('No DOM content found, skipping STT conversion')
									}
								} else {
									console.warn('iframe not ready, skipping STT conversion')
								}
							} catch (error) {
								console.error('STT processing error in actionCallback:', error)
							}
						}, 1000) // 1초로 증가
						refSttStart.value = false
					}
				},
				actionFinish: (ret: string) => {
					console.log(`actionFinish called with ret:`, ret)
					console.log(`actionFinish ret type:`, typeof ret)
					console.log(`actionFinish ret length:`, ret?.length)
					
					// ret이 객체인 경우 JSON 파싱 시도
					let parsedRet: any = ret
					let actualText = ''
					
					if (typeof ret === 'string' && ret.startsWith('{')) {
						try {
							parsedRet = JSON.parse(ret)
							console.log('Parsed ret as JSON:', parsedRet)
							
							// JSON 객체에서 실제 텍스트 추출 - 여러 소스 시도
							if (parsedRet.analysisResult) {
								// 1. analysisResult.result에서 추출
								if (parsedRet.analysisResult.result && parsedRet.analysisResult.result.trim() !== '') {
									actualText = parsedRet.analysisResult.result
									console.log('Extracted text from analysisResult.result:', actualText)
								}
								// 2. wordResult에서 유효한 토큰 추출
								else if (parsedRet.analysisResult.wordResult && parsedRet.analysisResult.wordResult.length > 0) {
									const validWords = parsedRet.analysisResult.wordResult
										.filter((word: any) => word.token && word.token !== '<eps>' && word.token.trim() !== '')
										.map((word: any) => word.token)
										.join(' ')
									
									if (validWords.trim() !== '') {
										actualText = validWords
										console.log('Extracted text from wordResult:', actualText)
									}
								}
								// 3. 짧은 음성도 허용하도록 더 관대한 처리
								else {
									console.log('No clear text found, but allowing short speech recognition')
									// 짧은 음성도 유효한 것으로 간주
									actualText = '음성인식됨' // 기본 텍스트 설정
								}
							}
						} catch (e) {
							console.log('Failed to parse ret as JSON, using as string')
							actualText = ret
						}
					} else {
						actualText = ret
					}
					
					if (typeof ifWin.HybridApp.onResultSTTMode === 'function') {
						// 안전성 검사 추가 - DOM이 준비될 때까지 지연
						setTimeout(() => {
							try {
								// iframe이 준비되었는지 확인
								if (ifWin && ifWin.document && ifWin.document.body) {
									// 더 유연한 안전성 검사 - 일반적인 DOM 요소들이 있는지 확인
									const hasContent = ifWin.document.body.children.length > 0 || 
													  ifWin.document.querySelector('canvas') || 
													  ifWin.document.querySelector('div') ||
													  ifWin.document.querySelector('span')
									
									if (hasContent) {
										console.log('DOM elements found, processing STT result')
										
										// STT 결과 유효성 검사 - 더 관대한 조건
										const sttResult = actualText.replace(/ /g, '')
										console.log('Raw STT result from actionFinish:', ret)
										console.log('Extracted actual text:', actualText)
										console.log('Processed STT result from actionFinish:', sttResult)
										
										// 더 관대한 조건: 빈 문자열이 아니고 기본 텍스트가 아닌 경우
										if (sttResult && sttResult.trim() !== '' && sttResult !== '음성인식됨') {
											// setSilvyText만 사용 (CJTextManager 에러 방지)
											if (ifWin.setSilvyText && typeof ifWin.setSilvyText === 'function') {
												console.log('Using setSilvyText for STT conversion:', sttResult)
												ifWin.HybridApp.onResultSTTMode(sttResult)
											} else {
												console.warn('setSilvyText not available, skipping STT conversion to prevent CJTextManager errors')
											}
										} else if (sttResult === '음성인식됨') {
											// 짧은 음성 인식 성공으로 처리
											console.log('Short speech detected, using default text')
											if (ifWin.setSilvyText && typeof ifWin.setSilvyText === 'function') {
												//ifWin.setSilvyText('음성인식됨')
												ifWin.HybridApp.onResultSTTMode(sttResult)
											}
										} else {
											console.log('Empty or invalid STT result, skipping conversion')
											console.log('Result analysis - length:', sttResult?.length, 'trimmed:', sttResult?.trim(), 'isEps:', sttResult === '<eps>')
											
											// 음성 인식 실패 시 사용자에게 알림
											console.warn('Speech recognition failed - no valid text detected')
											console.warn('Possible causes:')
											console.warn('- Microphone not working properly')
											console.warn('- Speech too quiet or unclear')
											console.warn('- Recording time too short')
											console.warn('- Network issues with STT service')
										}
									} else {
										console.warn('No DOM content found, skipping STT conversion')
									}
								} else {
									console.warn('iframe not ready, skipping STT conversion')
								}
							} catch (error) {
								console.error('STT processing error in actionFinish:', error)
							}
						}, 1000) // 1초로 증가
						refSttStart.value = false
					}
					recitem.value = {
						isShow: false,
					}
					lp.init(recitem.value)
					console.log('startSilvySTTMode actionFinish - ret')
					if (pauseAudioList.length > 0) {
						pauseAudioList.forEach((m: HTMLAudioElement, i: number) => {
							m.play()
						})
					}
				},
			}
			lp.init(recitem.value)
		}
	}

    ifWin.HybridApp.startSilvySTTMode2  = (model : number, uiType : number) => {
            ifWin.HybridApp.startSilvySTTMode(model, uiType);
    }

	ifWin.HybridApp.startSilvySTTMode2 = (model : number , uiType : number , strText : string,  strAnswer : string) => {        
		ifWin.HybridApp.startSilvySTTMode(model, uiType , strText, strAnswer);
    }


	ifWin.HybridApp.stopSilvy = () => {
		debugger
	}

	/**
	 * Description
	 * @param {any} id:string
	 * @returns {any}
	 */
	ifWin.HybridApp.startRecord = async (id: string): Promise<void> => {
		console.log(`window.HybridApp.startRecord(${id})`)
		if (navigator.mediaDevices) {
			const devices = await navigator.mediaDevices.enumerateDevices()
			const audioDevices = devices.filter(device => device.kind === 'audioinput')
			if (audioDevices.length > 0) {
				ifWinRecordCallbackId.value = id
				const options = { bitRate: 128, sampleRate: 44100 } as unknown as IRecorderOption
				ifWinRecord.value = new Recorder({
					micFailed: () => {
						console.log('Recorder error')
					},
					bitRate: options.bitRate,
					sampleRate: options.sampleRate,
					volume: 1,
				})
				ifWinRecord.value?.start()
			} else {
				console.log('마이크 설정이 되어있지 않습니다.')
			}
		} else {
			console.log('마이크 설정이 되어있지 않습니다.')
		}
	}
	ifWin.HybridApp.afterRecording = (args: any) => {
		console.log(`afterRecording => ${args}`)
		ifWin.HybridApp.createSound(ifWinRecordCallbackId.value, args.url)
	}
	ifWin.HybridApp.stopRecord = async () => {
		if (ifWinRecord.value && ifWinRecordCallbackId.value !== '') {
			await ifWinRecord.value.stop()
			const recordList = ifWinRecord.value?.recordList()
			if (recordList) {
				const idx = audioList.value?.findIndex(
					(item: { id: string }) => item.id === ifWinRecordCallbackId.value,
				)
				if (idx > -1) audioList.value?.splice(idx, 1)
				setTimeout(() => {
					ifWin.HybridApp.createSound(ifWinRecordCallbackId.value, recordList[0].url)
					ifWin.document.querySelector('.btn-play')?.addEventListener('click', () => {
						ifWin.HybridApp.playSound(ifWinRecordCallbackId.value)
						const audioEl = document.getElementById(
							`${ifWinRecordCallbackId.value}`,
						) as HTMLAudioElement
						if (audioEl) {
							audioEl.addEventListener('ended', function () {
								const optional = ifWin?.exportRoot?.mc_stamp as any
								if (optional) {
									optional.visible = true
									optional.gotoAndPlay(0)
								}
								setTimeout(() => {
									ifWin.HybridApp.nextMenu()
								}, 1000)
							})
						}
					})
					// 영어 AI Talk Talk 항목 녹음 후 실행 이벤트 강제 추가
					if (
						menus.curMenuItem.subject === 'E' &&
						ifWin.document.querySelector('.playerSet .play') == null
					) {
						ifWin.document.querySelector('#talk .send-btn')?.addEventListener('click', () => {
							setTimeout(() => {
								ifWin.document.querySelector('.playerSet .play')?.addEventListener('click', () => {
									console.log('.playerSet .play click 이벤트 미설정으로 인해 강제 추가')
									ifWin.HybridApp.playSound(ifWinRecordCallbackId.value)
									ifWin.effectSound?.bgmAudio?.pause()
									const audioEl = document.getElementById(
										`${ifWinRecordCallbackId.value}`,
									) as HTMLAudioElement
									if (audioEl) {
										audioEl.addEventListener('ended', function () {
											ifWin.document.querySelector('.playerSet .pause')?.click()
											ifWin.effectSound?.bgmAudio?.play()
										})
									}
								})
								ifWin.document.querySelector('.playerSet .pause')?.click()
							}, 1000)
						})
					}
				}, 1)
			}
		}
	}
	// 	// Sound
	ifWin.HybridApp.createSound = (strId: string, strPath: string) => {
		const audioItem = audioList.value?.find((item: { id: string }) => item.id === strId)
		const srcFullPath = () => {
			const spl = frame.value.src.split('/HTML_TEST/')
			let path = ''
			const nDot = strPath.startsWith('../') ? 2 : 1
			if (spl.length > 1) {
				path = spl[1]
					.split('/')
					.slice(0, spl[1].split('/').length - nDot)
					.join('/')
			}
			return `${spl[0]}/HTML_TEST/${path}/${strPath.replace('../', '')}`
		}
		const fullPath = strId === ifWinRecordCallbackId.value ? strPath : srcFullPath()
		if (audioItem === undefined) {
			audioList.value.push({
				id: strId,
				src: fullPath,
			} as ISoundInfo)
		} else if (audioItem.src !== fullPath) {
			audioItem.src = fullPath
		}
	}
	ifWin.HybridApp.playSound = (strId: string, bLoop: any, nVolume: any, strCallbackName: any) => {
		if (typeof window === 'undefined') return
		let audioItem = audioList.value?.find((m: { id: string }) => m.id === strId)
		console.log(`audioItem=${audioItem}`)
		console.log(audioItem)
		
		// 파일없을 경우 예외처리 - 사회 게임하기
		if (audioItem == null && (strId === 'bgm' || strId === 'click')) {
			ifWin.HybridApp.createSound(strId, `audio/${strId === 'click' ? 'effect_' : ''}${strId}.mp3`)
			audioItem = audioList.value?.find((m: { id: string }) => m.id === strId)
		}
		if (audioItem != null) {
			Object.assign(audioItem, {
				loop: bLoop || false,
				volume: nVolume,
				callback: strCallbackName,
				isplaying: true,
			} as ISoundInfo)
			setTimeout(() => {
				try {
					const audioEl = document.getElementById(`${audioItem.id}`) as HTMLAudioElement
					if (audioEl) {
						if (audioEl.id.toLocaleLowerCase().includes('bgm')) {
							const bgmList = audioList.value.filter((m: { id: string }) =>
								m.id.toLocaleLowerCase().includes('bgm'),
							)
							if (bgmList.length > 1) {
								bgmListGroup.value = bgmList
								bgmList.forEach(
									(v: { volume: number; loop: boolean; id: string; pause: () => any }) => {
										if (v.id !== audioEl.id && v.loop) {
											bgmBufStopId.value = v.id
											v.volume = 0
											;(document.getElementById(v.id) as HTMLAudioElement).volume = 0
										}
									},
								)
							}
						}

						if (audioEl.ended && audioEl.currentTime > 0) {
							audioEl.currentTime = 0
						}
						if (audioEl.paused && audioEl.duration > 0 && !audioEl.ended) {
							//audioEl.play().then().catch(error =>{
							//음원 자동재생
							ifWin.HybridApp.handleAutoplay(audioEl)

							if (audioEl.volume === 0) {
								if (bgmBufStopId.value !== '') {
									audioEl.volume = nVolume || 1
								}
							}
						}
						if (audioItem.callback !== undefined && audioItem.callback) {
							audioEl.addEventListener('ended', function (m) {
								if (bgmListGroup.value.find((v: any) => v.id === audioEl.id)) {
									if (bgmBufStopId.value !== '') {
										const stopBgm = bgmListGroup.value.find(
											(v: any) => v.id === bgmBufStopId.value && v.loop,
										) as any
										if (stopBgm != null) {
											bgmBufStopId.value = ''
											stopBgm.volume = 1
											;(document.getElementById(stopBgm.id) as HTMLAudioElement).volume = 1
										}
									}
								}
								if (audioItem.callback.length > 1) {
									// eslint-disable-next-line no-eval
									eval(
										`ifWin.${audioItem.callback}('${audioItem.id.length > 1 ? audioItem.id : ''}')`,
									)
								}
							})
						}
					}
				} catch (error: any) {
					console.log(error?.message)
				}
			}, 500)
		}
	}
	ifWin.HybridApp.handleAutoplay = (mediaElement: HTMLMediaElement) => {
		return new Promise<void>((resolve, reject) => {
			let buttonId = "dyBgmPlayBtn"
			// 기존 버튼이 있으면 제거
			let playBtn = document.getElementById(buttonId);
			if (playBtn) {
				playBtn.remove();
			}
	
			let buttonText = "🎶 자동재생이 차단되었습니다. 페이지를 새로고침 합니다."
			let buttonBgColor = '#8e44ad'

			const playPromise = mediaElement.play();
			
			// play() 메서드가 Promise를 반환하는지 확인
			if (playPromise && typeof playPromise.then === 'function') {
				playPromise
					.then(() => {
						// 재생 성공 시, 혹시 남아있을 수 있는 버튼 제거
						if (playBtn) {
							playBtn.remove();
						}
						console.log(`▶️ 재생 성공`);
						resolve(); // Promise resolve
					})
					.catch(error => {
						if (error.name === 'NotAllowedError') {
							console.warn(`${buttonText.replace('🎶 ', '').replace('▶️ ', '')} 자동 재생이 차단되었습니다. 사용자 상호작용 필요.`);
		
							// 사용자에게 재생을 요청하는 버튼 생성
							playBtn = document.createElement('button');
							playBtn.id = buttonId;
							playBtn.textContent = buttonText;
							playBtn.style.cssText = `
								position:fixed;
								top:50%;
								left:50%;
								transform:translate(-50%,-50%);
								padding:20px 40px;
								font-size:24px;
								font-weight:bold;
								cursor:pointer;
								background-color:${buttonBgColor};
								color:white;
								border:none;
								border-radius:8px;
								box-shadow:0 4px 8px rgba(0,0,0,0.2);
								z-index:10001;
							`;
							document.body.appendChild(playBtn);
		
							const clickHandler = () => {
								// 버튼 클릭 시 미디어 재생 재시도
								mediaElement.muted = false; // 혹시라도 음소거 상태면 해제
								const retryPlayPromise = mediaElement.play();
								
								if (retryPlayPromise && typeof retryPlayPromise.then === 'function') {
									retryPlayPromise
										.then(() => {
											console.log(`${buttonText.replace('🎶 ', '').replace('▶️ ', '')} 사용자 상호작용으로 재생 성공`);
											if (playBtn) playBtn.remove();
											resolve(); // Promise resolve
											ifWin.HybridApp.resetMenu(menus.listMenuDatas.menuIdx)
										})
										.catch(err => {
											alert(`${buttonText.replace('🎶 ', '').replace('▶️ ', '')}을(를) 재생할 수 없습니다. 파일을 확인하거나 브라우저 설정을 확인해주세요.`);
											console.error(`${buttonText.replace('🎶 ', '').replace('▶️ ', '')} 재생 실패 (사용자 상호작용 후):`, err);
											if (playBtn) playBtn.remove();
											reject(err); // Promise reject
										});
								} else {
									// Promise가 아닌 경우 즉시 성공으로 처리
									console.log(`${buttonText.replace('🎶 ', '').replace('▶️ ', '')} 사용자 상호작용으로 재생 성공 (동기)`);
									if (playBtn) playBtn.remove();
									resolve();
									ifWin.HybridApp.resetMenu(menus.listMenuDatas.menuIdx)
								}
								if (playBtn) playBtn.removeEventListener('click', clickHandler);
							};
		
							// 중복 이벤트 리스너 방지 및 추가
							playBtn.removeEventListener('click', clickHandler);
							playBtn.addEventListener('click', clickHandler);
		
						} else {
							// NotAllowedError 외의 다른 에러는 콘솔에 기록하고 reject
							console.error(`${buttonText.replace('🎶 ', '').replace('▶️ ', '')} 재생 중 알 수 없는 에러 발생:`, error);
							reject(error); // Promise reject
						}
					});
			} else {
				// play() 메서드가 Promise를 반환하지 않는 경우 (오래된 브라우저 등)
				console.log(`▶️ 재생 성공 (동기)`);
				resolve();
			}
		});
	}

	ifWin.HybridApp.seekSound = (strId: string, nMilliSec: number) => {
		const audioEl = document.getElementById(`${strId}`) as HTMLAudioElement
		if (audioEl) {
			audioEl.currentTime = nMilliSec || 0
			audioEl.pause()
		}
	}
	ifWin.HybridApp.pauseSound = (strId: string) => {
		const audioEl = document.getElementById(`${strId}`) as HTMLAudioElement
		audioEl?.pause()
	}
	ifWin.HybridApp.resumeSound = (strId: string) => {
		const audioEl = document.getElementById(`${strId}`) as HTMLAudioElement
		audioEl?.play()
	}
	ifWin.HybridApp.getSoundDuration = (strId: string) => {
		// 사운드 전체 시간 반환
		const audioEl = document.getElementById(`${strId}`) as HTMLAudioElement
		return audioEl?.duration
	}
	ifWin.HybridApp.getSoundCurrent = (strId: string) => {
		// 사운드 현재 시간 반환
		const audioEl = document.getElementById(`${strId}`) as HTMLAudioElement
		if (audioEl) {
			return audioEl.currentTime
		}
		return 0
	}
	ifWin.HybridApp.setVolume = (strId: string, nVolumn: any) => {
		try {
			const audioEl = document.getElementById(`${strId}`) as HTMLAudioElement
			if (audioEl) {
				if (audioEl.volume === 0 && audioEl.currentTime === 0 && nVolumn > 0) {
					setTimeout(() => {
						audioEl.play()
					}, 100)
				}
				audioEl.volume = nVolumn
			}
		} catch (error: any) {
			console.log(error.message)
		}
	}

	ifWin.HybridApp.playMovie = async (path: string, mode?: any, nextPath?: any) => {
		const res = await loadMovie(path)
		if (res) {
			audioList.value = [] as ISoundInfo[]
			videoSrc.value = res
			frameSrc.value = ''
			videoNextPath.value = nextPath
		}
	}
	ifWin.HybridApp.onClosePopupMovie = () => {
		if (ifWin.opener) {
			ifWin.opener.close()
		}
	}
	ifWin.HybridApp.isFirstLoadedMenu = (): boolean => {
		return menus.isFirstLoadedMenu
	}

	ifWin.HybridApp.isContinueStudy = (): boolean => {
		let strComYN = 'N'
		const datas = menus?.listMenuDatas?.cjMenuDatas
		if (datas.length > 0) {
			if (datas.filter(m => m.status === 2).length === datas.length) {
				strComYN = 'Y'
			}
		}

		console.log(`strComYN==${strComYN}`)
		if (strComYN === 'Y') {
			if (confirm('학습이 완료 되었습니다. 처음부터 진행하시겠습니까?')) {
				setInitContinueStudy()
			}
		} else if (menus.netStudyInfo.length > 0 && !menus.isContinueStudy) {
			// alert창 띄움
			if (confirm('진행중인 학습을 이어서 진행 하시겠습니까?')) {
				setContinueStudy()
				return true
			} else {
				setInitContinueStudy()
				return true
			}
		}

		return false
	}

	// 팝업 동영상 플레이어를 실행한다.
	ifWin.HybridApp.showPopMovie = function (url: string) {
		ifWin.HybridApp.playMovie(url, null, null)
	}
	// 팝업 종료 이벤트 핸들러
	ifWin.HybridApp.onClosePopupMovie = function () {
		if (window.opener) {
			window.opener?.close()
		}
	}
	// Intent 데이터를 가지고 온다.
	ifWin.HybridApp.getIntentData = function () {
		console.log('🔥 getIntentData 호출됨')
		console.log('🔥 userInfo.value.UserID:', userInfo.value?.UserID)
		console.log('🔥 userInfo.value.SysUserId:', userInfo.value?.SysUserId)
		
		const param = {
			id: userInfo.value?.UserID || 'default',
			mCode: menus.mCode,
			strSysUserID: userInfo.value?.SysUserId || 'default',
		}
		console.log('🔥 getIntentData param:', param)
		return new URLSearchParams(param).toString()
	}

	/**
	 * AI 복습 게임 점수 저장
	 * @param {any} nScore:number
	 * @returns {any}
	 */
	ifWin.HybridApp.setCurrentMenuScore = (nScore: number): void => {
		ifCurrentMenuScore.value = nScore
	}

	ifWin.HybridApp.exit = (isExit: boolean): void => {}

	// Edubase 시작 ***********************************************
	ifWin.HybridApp.QuesTionFinish = (isFinish: boolean): void => {}
	ifWin.HybridApp.userInputDoneStatus = (userInputStatus: string): void => {}
	ifWin.HybridApp.returnResultBaejum = (args: string): void => {}
	ifWin.HybridApp.returnResult = (args: string): void => {}

	// Edubase 끝  ***********************************************

	//추가작업 필요	
	ifWin.HybridApp.saveBase64ImgToPng = (strFile: string,strBase64: string) => { 
		try {
			const newImageData = "data:image/png;base64," + strBase64;
			let found = false;
			imageSaveGroup.value.forEach(element => {
				if (element.filename === strFile) {
					element.imageData = newImageData;
					found = true; 					
				}
			});
			if (!found) {
				imageSaveGroup.value.push({
					filename: strFile,
					imageData: newImageData
				});
			}
			
			console.log(`Image saved to imageSaveGroup: ${strFile}`)
			console.log(`Total images in group: ${imageSaveGroup.value.length}`)
			
			// 이미지 저장 후 자동으로 서버에 업로드
			console.log(`Auto uploading image to server: ${strFile}`)
			
			// eventUploadImg 대신 직접 업로드 로직 실행
			setTimeout(() => {
				ifWin.HybridApp.eventUploadImg(strFile)
			}, 100)
			
		} catch (e) {
			console.error("imageSaveGroup에 이미지 데이터를 저장하는 중 오류 발생:", e);
		}
		
		ifWin.HybridApp.onImageSaved(strFile)
		return strFile
	}

	// onImageSaved 함수 추가
	ifWin.HybridApp.onImageSaved = (strFile: string) => {
		console.log(`onImageSaved called with file: ${strFile}`)
		// externalManager.js에서 설정한 콜백이 있으면 실행
		// window.HybridApp.onImageSaved는 별도의 콜백 함수이므로 직접 호출
		if (window.HybridApp && typeof window.HybridApp.onImageSaved === 'function' && window.HybridApp.onImageSaved !== ifWin.HybridApp.onImageSaved) {
			window.HybridApp.onImageSaved(strFile)
		}
	}

	// uploadResult 함수 추가
	ifWin.HybridApp.uploadResult = (result: string) => {
		console.log(`uploadResult called with result: ${result}`)
		// externalManager.js에서 설정한 콜백이 있으면 실행
		if (window.HybridApp && typeof window.HybridApp.uploadResult === 'function' && window.HybridApp.uploadResult !== ifWin.HybridApp.uploadResult) {
			window.HybridApp.uploadResult(result)
		}
	}

	ifWin.HybridApp.convertCharacterCJ = async (type : string, jsonData : string )  => {
		
		let endpointPath = "hangul_r"; 
		if(type !="kor" )endpointPath = "alphabet_r";
		const serverUrl = `/dit/hand/${endpointPath}`;
		const formData = new FormData(); 
		const imagesToUpload = imageSaveGroup.value;

		if (!imagesToUpload || imagesToUpload.length === 0) {
			console.warn("imageSaveGroup에 전송할 이미지가 없습니다.");
			return { status: 'failed', error: 'No images to upload' };
		}

		for (let i = 0; i < imagesToUpload.length; i++) {
			const item = imagesToUpload[i];
			const { filename, imageData } = item;
			const fileKey = `img_file${i + 1}`;
			const base64Data = imageData.split(',')[1];
			if (!base64Data) {
				console.error(`[${filename}] 잘못된 imageData 형식입니다. 전송에서 제외됩니다.`);
				continue; 
			}

			try {
				const byteCharacters = atob(base64Data);
				const byteNumbers = new Array(byteCharacters.length);
				for (let j = 0; j < byteCharacters.length; j++) {
					byteNumbers[j] = byteCharacters.charCodeAt(j);
				}
				const byteArray = new Uint8Array(byteNumbers);
				const imageBlob = new Blob([byteArray], { type: 'image/png' });

				formData.append(fileKey, imageBlob, `${filename}.png`);
			} catch (error) {}
		}

		let hasEntries = false;
		for (const pair of formData as any) {
			hasEntries = true;
			break;
		}
		
		if (!hasEntries) {
			return { status: 'failed', error: 'No valid images to send' };
		}

		try {
			const response = await fetch(serverUrl, {
				method: 'POST',
				body: formData,
			});

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
			}

			const result = await response.json(); 
			ifWin.HybridApp.onConvertResultsCharacterCJ(JSON.stringify(result))
			imageSaveGroup.value = []; 
			return { status: 'success', data: result };
		} catch (error: any) {
			return { status: 'failed', error: error.message };
		}

	}

	ifWin.HybridApp.captureNSave = (strFuncName: string, strPath: string, nQuality: number) => {
		console.log(`captureNSave - strPath: ${strPath}, nQuality: ${nQuality}`)
		
		// 최종 콜백 함수 (항상 호출되도록 보장)
		const finalCallback = (success: boolean = true) => {
			console.log(`captureNSave finalCallback called with success: ${success}`)
			try {
				// 콜백 함수 찾기 (externalManager.functionName 형태 지원)
				let callbackFunction: any = null
				let callbackContext: any = null
				
				// ifWin에서 먼저 찾기
				if (ifWin) {
					if (typeof ifWin[strFuncName] === 'function') {
						callbackFunction = ifWin[strFuncName]
						callbackContext = ifWin
					} else if (strFuncName.includes('.')) {
						// externalManager.functionName 형태 처리
						const parts = strFuncName.split('.')
						const objectName = parts[0]
						const functionName = parts[1]
						
						if (ifWin[objectName] && typeof ifWin[objectName][functionName] === 'function') {
							callbackFunction = ifWin[objectName][functionName]
							callbackContext = ifWin[objectName]
						}
					}
				}
				
				// ifWin에서 못 찾으면 window에서 찾기
				if (!callbackFunction && typeof (window as any)[strFuncName] === 'function') {
					callbackFunction = (window as any)[strFuncName]
					callbackContext = window
				} else if (!callbackFunction && strFuncName.includes('.')) {
					// window에서도 externalManager.functionName 형태 처리
					const parts = strFuncName.split('.')
					const objectName = parts[0]
					const functionName = parts[1]
					
					if ((window as any)[objectName] && typeof (window as any)[objectName][functionName] === 'function') {
						callbackFunction = (window as any)[objectName][functionName]
						callbackContext = (window as any)[objectName]
					}
				}
				
				// 콜백 함수 호출
				if (callbackFunction) {
					console.log(`Calling ${strFuncName}(${strPath})`)
					callbackFunction.call(callbackContext, strPath)
				} else {
					console.log(`Callback function ${strFuncName} not found in ifWin or window`)
					// 디버깅을 위해 사용 가능한 함수들 출력
					if (ifWin) {
						console.log('Available functions in ifWin:', Object.keys(ifWin).filter(key => typeof ifWin[key] === 'function'))
					}
					if ((window as any).externalManager) {
						console.log('Available functions in window.externalManager:', Object.keys((window as any).externalManager).filter(key => typeof (window as any).externalManager[key] === 'function'))
					}
				}
			} catch (error) {
				console.error('Error calling callback function:', error)
			}
		}
		
		// 화면 캡처 기능 구현
		const captureScreen = (callback: (result: boolean, dataUrl?: string) => void) => {
			// 웹뷰 캡처 (iframe 내용)
			const captureWebview = (webviewCallback: (bitmapWebview: string) => void) => {
				try {
					// frmContent iframe 찾기
					const iframeElement = document.getElementById('frmContent') as HTMLIFrameElement
					if (!iframeElement) {
						console.error('frmContent iframe not found')
						webviewCallback('')
						return
					}

					// iframe 내부의 document에 접근
					const iframeDoc = iframeElement.contentDocument || iframeElement.contentWindow?.document
					if (!iframeDoc) {
						console.error('Cannot access iframe content - CORS issue or iframe not loaded')
						webviewCallback('')
						return
					}

					// iframe 내부의 canvas 요소 찾기
					const canvasElement = iframeDoc.querySelector('#contents') as HTMLCanvasElement
					if (!canvasElement) {
						console.error('Canvas element with id "contents" not found in iframe')
						webviewCallback('')
						return
					}

					console.log('Canvas found:', canvasElement.width, 'x', canvasElement.height)

					// canvas를 직접 캡처
					try {
						const dataUrl = canvasElement.toDataURL('image/png', nQuality / 100)
						console.log('Canvas captured successfully')
						webviewCallback(dataUrl)
					} catch (canvasError) {
						console.error('Canvas toDataURL failed:', canvasError)
						
						// 대체 방법: canvas를 새 캔버스에 그리기
						const newCanvas = document.createElement('canvas')
						const context = newCanvas.getContext('2d')
						
						if (!context) {
							console.error('New canvas context not available')
							webviewCallback('')
							return
						}

						newCanvas.width = canvasElement.width
						newCanvas.height = canvasElement.height
						
						// 원본 canvas를 새 canvas에 그리기
						context.drawImage(canvasElement, 0, 0)
						
						const dataUrl = newCanvas.toDataURL('image/png', nQuality / 100)
						console.log('Canvas captured using fallback method')
						webviewCallback(dataUrl)
					}
				} catch (error) {
					console.error('Webview capture failed:', error)
					webviewCallback('')
				}
			}

			// 카메라 프리뷰 캡처 (선택적)
			const takeSnapPhotoOrg = (cameraCallback: (bResult: boolean, cameraBitmap?: string) => void) => {
				// 카메라 프리뷰가 있는지 확인 (ifWinCamera 사용)
				if (ifWinCamera.value) {
					try {
						const canvas = document.createElement('canvas')
						const context = canvas.getContext('2d')
						
						if (!context) {
							console.error('Camera canvas context not available')
							cameraCallback(false)
							return
						}

						canvas.width = ifWinCamera.value.videoWidth || 640
						canvas.height = ifWinCamera.value.videoHeight || 480
						
						context.drawImage(ifWinCamera.value, 0, 0, canvas.width, canvas.height)
						const dataUrl = canvas.toDataURL('image/png', nQuality / 100)
						cameraCallback(true, dataUrl)
					} catch (error) {
						console.error('Camera capture failed:', error)
						cameraCallback(false)
					}
				} else {
					console.log('No camera preview available')
					cameraCallback(false)
				}
			}

			// 이미지 병합
			const mergeImage = (bitmapWebview: string, cameraBitmap?: string, finalCallback?: (result: boolean, dataUrl?: string) => void) => {
				try {
					if (!bitmapWebview) {
						console.error('Webview bitmap is empty')
						if (finalCallback) finalCallback(false)
						return
					}

					// 카메라 이미지가 있으면 병합, 없으면 웹뷰만 사용
					let finalDataUrl = bitmapWebview
					
					if (cameraBitmap) {
						// 이미지 병합 로직 (간단한 버전)
						const canvas = document.createElement('canvas')
						const context = canvas.getContext('2d')
						
						if (!context) {
							console.error('Merge canvas context not available')
							if (finalCallback) finalCallback(false)
							return
						}

						// 웹뷰 이미지 로드
						const webviewImg = new Image()
						webviewImg.onload = () => {
							// 카메라 이미지 로드
							const cameraImg = new Image()
							cameraImg.onload = () => {
								// 캔버스 크기 설정 (웹뷰 크기 사용)
								canvas.width = webviewImg.width
								canvas.height = webviewImg.height
								
								// 웹뷰 이미지 그리기
								context.drawImage(webviewImg, 0, 0)
								
								// 카메라 이미지를 우상단에 작게 그리기
								const cameraWidth = Math.min(cameraImg.width, webviewImg.width * 0.3)
								const cameraHeight = (cameraImg.height * cameraWidth) / cameraImg.width
								context.drawImage(cameraImg, webviewImg.width - cameraWidth - 10, 10, cameraWidth, cameraHeight)
								
								finalDataUrl = canvas.toDataURL('image/png', nQuality / 100)
								if (finalCallback) finalCallback(true, finalDataUrl)
							}
							cameraImg.onerror = () => {
								console.error('Camera image load failed')
								if (finalCallback) finalCallback(true, finalDataUrl)
							}
							cameraImg.src = cameraBitmap
						}
						webviewImg.onerror = () => {
							console.error('Webview image load failed')
							if (finalCallback) finalCallback(false)
						}
						webviewImg.src = bitmapWebview
					} else {
						// 카메라 이미지가 없으면 웹뷰만 사용
						if (finalCallback) finalCallback(true, finalDataUrl)
					}
				} catch (error) {
					console.error('Image merge failed:', error)
					if (finalCallback) finalCallback(false)
				}
			}

			// 메인 캡처 로직 실행
			captureWebview((bitmapWebview) => {
				if (bitmapWebview) {
					// 카메라 프리뷰가 있는지 확인하고 캡처
					takeSnapPhotoOrg((bResult, cameraBitmap) => {
						mergeImage(bitmapWebview, cameraBitmap, callback)
					})
				} else {
					console.error('Webview capture failed')
					callback(false)
				}
			})
		}

		// 메인 로직 실행 (타임아웃 추가)
		const captureTimeout = setTimeout(() => {
			console.warn('Capture timeout - calling final callback')
			finalCallback(false)
		}, 10000) // 10초 타임아웃

		captureScreen((bResult, dataUrl) => {
			clearTimeout(captureTimeout)
			console.log('captureScreen.onComplete() - result:', bResult)
			
			if (bResult && dataUrl) {
				// 웹에서는 파일 시스템에 직접 저장할 수 없으므로
				// 이미지 데이터를 저장하고 콜백 호출
				const imageData = {
					path: strPath,
					data: dataUrl,
					quality: nQuality
				}
				
				// 이미지 데이터를 저장 (실제 구현에서는 서버로 전송하거나 로컬 스토리지 사용)
				console.log('Image captured and processed:', imageData)
				
				// 콜백 함수 호출
				finalCallback(true)
			} else {
				console.error('Screen capture failed')
				// 실패 시에도 콜백 호출
				finalCallback(false)
			}
		})
	}
	
	ifWin.HybridApp.onCaptureGalleryCallback = (result : boolean) => {
		console.log(`웹뷰영역갤러리저장완료|${result}`);
	}
	

	ifWin.HybridApp.eventImgCheck = () => { 
		console.log("eventImgCheck()")
		
		const sysID = userInfo.value?.SysUserId || ''
		const mcode = menus.mCode || ''
		const code = mcode.substring(2, 3)
		
		// API 호출 함수
		const callUrl = async (
			url: string, 
			clientUploadKey: string, 
			clientSiteKey: string,
			callbackSuccess: (result: string) => void,
			callbackError: (error: string) => void
		) => {
			try {
				// 헤더 설정
				const headers = {
					'Content-Type': 'application/x-www-form-urlencoded',
					'clientUploadKey': clientUploadKey,
					'clientSiteKey': clientSiteKey
				}
				
				// API 서버 URL (환경별 서버 URL 사용)
				let requestURL = process.env.SERVER_UPLOAD_DOMAIN + url
				
				console.log('callUrl requestURL:', requestURL)
				
				// fetch로 API 호출
				const response = await fetch(requestURL, {
					method: 'GET',
					headers: headers
				})
				
				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`)
				}
				
				const result = await response.text()
				callbackSuccess(result)
				
			} catch (error: any) {
				console.error('callUrl error:', error)
				callbackError(error.message || 'API call failed')
			}
		}
		
		// 이미지 다운로드 함수 (웹에서는 다운로드 대신 콜백 호출)
		const downloadImage = (filePath: string, outputPath: string) => {
			console.log(`downloadImage - filePath: ${filePath}, outputPath: ${outputPath}`)
			
			// filePath를 /dit/image/ 형식으로 변환
			let convertedPath = filePath
			if (filePath.includes(process.env.IMAGE_FILE_EVENT + '/webdata1/CacheMilkt/Files_Event/')) {
				convertedPath = filePath.replace(process.env.IMAGE_FILE_EVENT + '/webdata1/CacheMilkt/Files_Event/', '/dit/image/')
				console.log(`Converted filePath: ${filePath} -> ${convertedPath}`)
			}
			
			// window.HybridApp에서 직접 콜백 호출 (작동하는 방식)
			try {

				if (window.HybridApp && typeof window.HybridApp["eventImgCheckResult"] === 'function') {
					ifWin.HybridApp.eventHandle('eventImgCheckResult', convertedPath)						
				} else if (window.HybridApp && typeof window.HybridApp["imgcheckResult"] === 'function') {
					ifWin.HybridApp.eventHandle('imgcheckResult', convertedPath)						
				} else {
					console.log('Available HybridApp methods:', Object.keys(window.HybridApp || {}).filter(key => typeof window.HybridApp[key] === 'function'))
				}
			} catch (error) {
				console.error('Error executing callback:', error)
			}
		}
		
		// 메인 로직 실행
		const requestURL = `api/v1/upload/file-info?Path=/${code}/${mcode}/${sysID}/`
		const clientUploadKey = '94BAC0F8-5DA5-41E0-802E-8121A3F3667B'
		const clientSiteKey = '7092CA16-5558-4E68-8827-C372149B2059'
		
		console.log('eventImgCheck requestURL:', requestURL)
		
		callUrl(
			requestURL,
			clientUploadKey,
			clientSiteKey,
			(result: string) => {
				console.log('eventImgCheck() uploadresult:', result)
				
				try {
					const info = JSON.parse(result)
					const resultData = info.resultData
					const existFile = resultData.existFile
					const filePath = resultData.filePath
					const fileName = resultData.fileName
					
					console.log('eventImgCheck() existFile:', existFile)
					console.log('eventImgCheck() filePath:', filePath)
					console.log('eventImgCheck() fileName:', fileName)
					
					if (existFile) {
						// 웹에서는 파일 경로를 다르게 구성
						const currentMenuData = menus.cjCurMenuData
						const filePathParts = currentMenuData.filePath?.split('/') || []
						const htmlFileName = filePathParts[filePathParts.length - 1] || ''
						const strFolder = currentMenuData.filePath?.replace(htmlFileName, '') || ''
						const outputPath = strFolder + fileName
						
						console.log('uploadCheck() outputPath:', outputPath)
						
						// 이미지 다운로드 (웹에서는 콜백으로 결과 전달)
						downloadImage(filePath, outputPath)
					} else {
						// 파일이 존재하지 않으면 빈 문자열로 콜백
						if (ifWin && typeof ifWin.HybridApp.eventHandle === 'function') {
							ifWin.HybridApp.eventHandle('eventImgCheckResult', '')
						}
					}
				} catch (e) {
					console.error('JSON parsing error:', e)
					// 에러 시 빈 문자열로 콜백
					if (ifWin && typeof ifWin.HybridApp.eventHandle === 'function') {
						ifWin.HybridApp.eventHandle('eventImgCheckResult', '')
					}
				}
			},
			(error: string) => {
				console.error('uploadCheck() uploadError:', error)
				// 에러 시 빈 문자열로 콜백
				if (ifWin && typeof ifWin.HybridApp.eventHandle === 'function') {
					ifWin.HybridApp.eventHandle('eventImgCheckResult', '')
				}
			}
		)
	}

	ifWin.HybridApp.eventUploadImg = (strPath: string) => {
		console.log(`eventUploadImg() path: ${strPath}`)
		
		const outputPath = strPath
		
		// 파일 업로드 함수
		const uploadFileToAPIServer = async (
			path: string, 
			clientUploadKey: string, 
			clientSiteKey: string,
			callbackSuccess: (result: string) => void,
			callbackError: (error: string) => void
		) => {
			try {
				// 헤더 설정 (Content-Type은 제거하고 브라우저가 자동 설정하도록 함)
				const headers = {
					'clientUploadKey': clientUploadKey,
					'clientSiteKey': clientSiteKey
				}

				// FormData 생성
				const formData = new FormData()
				
				// imageSaveGroup에서 실제 이미지 데이터 찾기
				const fileName = path.split('/').pop() || 'file.png'
				const savedImage = imageSaveGroup.value.find(item => item.filename === fileName)
				
				if (savedImage && savedImage.imageData) {
					// 실제 이미지 데이터 사용
					const base64Data = savedImage.imageData.split(',')[1]
					if (base64Data) {
						try {
							const byteCharacters = atob(base64Data)
							const byteNumbers = new Array(byteCharacters.length)
							for (let j = 0; j < byteCharacters.length; j++) {
								byteNumbers[j] = byteCharacters.charCodeAt(j)
							}
							const byteArray = new Uint8Array(byteNumbers)
							const fileBlob = new Blob([byteArray], { type: 'image/png' })
							
							formData.append('fileData', fileBlob, fileName)
							console.log(`Using actual image data for: ${fileName}`)
						} catch (error) {
							console.error('Error creating blob from image data:', error)
							// 에러 시 빈 blob 사용
							const fileBlob = new Blob([''], { type: 'image/png' })
							formData.append('fileData', fileBlob, fileName)
						}
					} else {
						console.error('Invalid image data format')
						const fileBlob = new Blob([''], { type: 'image/png' })
						formData.append('fileData', fileBlob, fileName)
					}
				} else {
					console.warn(`No saved image found for: ${fileName}, using empty blob`)
					// 저장된 이미지가 없으면 빈 blob 사용
					const fileBlob = new Blob([''], { type: 'image/png' })
					formData.append('fileData', fileBlob, fileName)
				}
				
				// 업로드 경로 설정
				const code = menus.mCode?.substring(2, 3) || '0'
				const sysID = userInfo.value?.SysUserId || ''
				const mcode = menus.mCode || ''
				
				// 날짜 포맷
				const now = new Date()
				const yyyymm = now.getFullYear().toString() + (now.getMonth() + 1).toString().padStart(2, '0')
				const yyyymmdd = now.getFullYear().toString() + (now.getMonth() + 1).toString().padStart(2, '0') + now.getDate().toString().padStart(2, '0')
				
				let uploadPath = ''
				
				// 업로드 키에 따른 경로 분기
				if (clientUploadKey === 'EF0320D1-652E-416C-B778-26228D0C0FDB') {
					const lType = menus.lectureTitleInfo?.L_Type || 'T_CHI'
					uploadPath = `/${code}/${lType}/${mcode}/${sysID}/`
				} else if (clientUploadKey === '94BAC0F8-5DA5-41E0-802E-8121A3F3667B') {
					uploadPath = `/${code}/${mcode}/${sysID}/`
				} else {
					const lType = menus.lectureTitleInfo?.L_Type || 'T_CHI'
					uploadPath = `/${code}/${lType}/${yyyymm}/${mcode}/${yyyymmdd}/`
				}
				
				console.log('uploadFileToAPIServer() path:', path)
				console.log('uploadFileToAPIServer() fileName:', fileName)
				console.log('uploadFileToAPIServer() uploadPath:', uploadPath)
				
				formData.append('addUploadPath', uploadPath)
				
				// API 서버 URL (환경별 서버 URL 사용)
				let requestURL = process.env.SERVER_UPLOAD_DOMAIN + 'api/v1/upload/files'

				console.log('Upload server URL:', requestURL)
				
				// fetch로 파일 업로드 (Content-Type 헤더 제거하여 브라우저가 자동 설정)
				const response = await fetch(requestURL, {
					method: 'POST',
					headers: headers,
					body: formData
				})
				
				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`)
				}
				
				const result = await response.text()
				callbackSuccess(result)
				
			} catch (error: any) {
				console.error('uploadFileToAPIServer() error:', error)
				callbackError(error.message || 'Upload failed')
			}
		}
		
		// 메인 업로드 로직 실행
		uploadFileToAPIServer(
			outputPath,
			'94BAC0F8-5DA5-41E0-802E-8121A3F3667B',
			'7092CA16-5558-4E68-8827-C372149B2059',
			(result: string) => {
				console.log('uploadFileToAPIServer() result:', result)
				let sendResult = '1'
				
				try {
					const info = JSON.parse(result)
					const resultCode = info.resultCode
					const resultMessage = info.resultMessage
					
					console.log('eventUploadImg() existFile:', resultMessage)
					console.log('eventUploadImg() resultCode:', resultCode)
					
					if (resultCode && resultCode === '00000') {
						sendResult = '0'
					}
					
					// 웹뷰에 결과 전달
					if (ifWin && typeof ifWin.HybridApp.eventHandle === 'function') {
						ifWin.HybridApp.eventHandle('uploadResult', sendResult)
					}
					
				} catch (e) {
					console.error('JSON parsing error:', e)
					// 웹뷰에 결과 전달
					if (ifWin && typeof ifWin.HybridApp.eventHandle === 'function') {
						ifWin.HybridApp.eventHandle('uploadResult', sendResult)
					}
				}
			},
			(error: string) => {
				const sendResult = '1'
				console.error('uploadFileToAPIServer() error:', error)
				
				// 웹뷰에 결과 전달
				if (ifWin && typeof ifWin.HybridApp.eventHandle === 'function') {
					ifWin.HybridApp.eventHandle('uploadResult', sendResult)
				}
			}
		)
	}

	ifWin.HybridApp.setNodePlayerData = (pageID: number, stepID: number, strData: string) => {
		console.log(`setNodePlayerData() pageID: ${pageID}, stepID: ${stepID}, strData: ${strData}`)
		
		// API 호출 함수
		const setNodePlayerDataAPI = async (pageId: number,stepId: number,strData: string,callbackSuccess: (result: string) => void,callbackError: (error: string) => void) => {
			try {
				// FormData 생성
				const formData = new FormData()
				
				// 사용자 정보
				const systemID = userInfo.value?.SysUserId || ''
				const mCode = menus.mCode || ''
				
				console.log('setNodePlayerData() pageid:', pageId)
				console.log('setNodePlayerData() stepid:', stepId)
				console.log('setNodePlayerData() strData:', strData)
				console.log('setNodePlayerData() userid:', systemID)
				console.log('setNodePlayerData() mcode:', mCode)
				
				// FormData에 데이터 추가
				formData.append('userid', systemID)
				formData.append('mcode', mCode)
				formData.append('pageid', pageId.toString())
				formData.append('stepid', stepId.toString())
				formData.append('dataval', strData)
				
				// API 서버 URL (환경별 서버 URL 사용)
				let requestURL = process.env.API_MILKT_APP_SERVER_ELE + 'AppCommon/SetNodePlayerData'
				
				console.log('setNodePlayerData requestURL:', requestURL)
				
				// fetch로 API 호출
				const response = await fetch(requestURL, {
					method: 'POST',
					body: formData
				})
				
				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`)
				}
				
				const result = await response.text()
				callbackSuccess(result)
				
			} catch (error: any) {
				console.error('setNodePlayerData() error:', error)
				callbackError(error.message || 'API call failed')
			}
		}
		
		// 메인 API 로직 실행
		setNodePlayerDataAPI(pageID,stepID,strData,
			(result: string) => {
				console.log('setNodePlayerData() result:', result)
				if (ifWin && typeof ifWin.HybridApp.eventHandle === 'function') {
					ifWin.HybridApp.eventHandle('onResultSetNodePlayerData', result)
				}
			},
			(error: string) => {
				console.error('setNodePlayerData() error:', error)

				if (ifWin && typeof ifWin.HybridApp.eventHandle === 'function') {
					ifWin.HybridApp.eventHandle('onResultSetNodePlayerData', error)
				}
			}
		)
	}

	ifWin.HybridApp.getNodePlayerData = (pageID: number, stepID: number) => {
		console.log(`getNodePlayerData() pageID: ${pageID}, stepID: ${stepID}`)
		
		// API 호출 함수
		const getNodePlayerDataAPI = async (pageId: number,stepId: number
			,callbackSuccess: (result: string) => void
			,callbackError: (error: string) => void
		) => {
			try {
				// FormData 생성
				const formData = new FormData()
				
				// 사용자 정보
				const systemID = userInfo.value?.SysUserId || ''
				const mCode = menus.mCode || ''
				
				console.log('getNodePlayerData() pageid:', pageId)
				console.log('getNodePlayerData() stepid:', stepId)
				console.log('getNodePlayerData() userid:', systemID)
				console.log('getNodePlayerData() mcode:', mCode)
				
				// FormData에 데이터 추가
				formData.append('userid', systemID)
				formData.append('mcode', mCode)
				formData.append('pageid', pageId.toString())
				formData.append('stepid', stepId.toString())
				
				// API 서버 URL (환경별 서버 URL 사용)
				let requestURL = process.env.API_MILKT_APP_SERVER_ELE + 'AppCommon/getNodePlayerData'
				
				console.log('getNodePlayerData requestURL:', requestURL)
				
				// fetch로 API 호출
				const response = await fetch(requestURL, {
					method: 'POST',
					body: formData
				})
				
				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`)
				}
				
				const result = await response.text()
				callbackSuccess(result)
				
			} catch (error: any) {
				console.error('getNodePlayerData() error:', error)
				callbackError(error.message || 'API call failed')
			}
		}
		
		// 메인 API 로직 실행
		getNodePlayerDataAPI(pageID,stepID,
			(result: string) => {
				console.log('getNodePlayerData() result:', result)				
				try {
					if (result) {
						const info = JSON.parse(result)
						const resultData = info.Result_Data
						
						if (resultData && resultData.dataval) {
							const strDataval = resultData.dataval
							console.log('getNodePlayerData() strDataval:', strDataval)
							
							if (ifWin && typeof ifWin.HybridApp.eventHandle === 'function') {
								ifWin.HybridApp.eventHandle('onResultGetNodePlayerData', strDataval)
							}
 
						} else {
							console.log('No dataval found in result data')
							if (ifWin && typeof ifWin.HybridApp.eventHandle === 'function') {
								ifWin.HybridApp.eventHandle('onResultGetNodePlayerData', '')
							}
						}
					}
				} catch (e) {
					console.error('JSON parsing error:', e)
					if (ifWin && typeof ifWin.HybridApp.eventHandle === 'function') {
						ifWin.HybridApp.eventHandle('onResultGetNodePlayerData', '')
					}
				}
			},
			(error: string) => {
				console.error('getNodePlayerData() error:', error)
				if (ifWin && typeof ifWin.HybridApp.eventHandle === 'function') {
					ifWin.HybridApp.eventHandle('onResultGetNodePlayerData', error)
				}
			}
		)
	}

	ifWin.HybridApp.eventHandle = (callback: string, result: any) => {
		console.log(`eventHandle - callback: ${callback}, result: ${result}`)
		
		// window.HybridApp[callback](result) 형태로 실행
		if (window.HybridApp && typeof window.HybridApp[callback] === 'function') {
			console.log(`Executing window.HybridApp["${callback}"] with result:`, result)
			window.HybridApp[callback](result)
		} else {
			console.log(`Callback function "${callback}" not found in window.HybridApp`)
			console.log('Available HybridApp methods:', Object.keys(window.HybridApp || {}).filter(key => typeof window.HybridApp[key] === 'function'))
		}
	}

	ifWin.parent.addEventListener(
		'message',
		(event: { data: string }) => {
			if (['object', 'string'].includes(typeof event.data)) {
				const jsonData = typeof event.data === 'string' ? JSON.parse(event.data) : event.data
				if (jsonData.type && jsonData.type !== '') {
					postMsgAction(jsonData, ifWin)
				}
			}
		},
		false,
	)

	// Edubase 에서 window.HybridApp을 바로 접근하기 위해 추가
	// // eslint-disable-next-line no-use-before-define
	window.HybridApp = ifWin.HybridApp
}

const postMsgAction = (jsonData: any, ifWin: any): void => {
	switch (jsonData.type) {
		case 'fromIf':
			postMsgActionFromIf(jsonData, ifWin)
			break
		case 'setGlobalUserData':
			setGlobalUserData(ifWin)
			break
	}
}

const postMsgActionFromIf = (jsonData: any, ifWin: any): void => {
	let ret = {} as Object
	switch (jsonData.executionFunction) {
		case 'hideLoading':
			console.log(jsonData.option.strMess)
			break
		case 'setGlobal':
			if (ifWin.Global.USER_DATA.usr_id == null) {
				setGlobalUserData(ifWin)
			}
			if (jsonData.option != null) {
				jsonData.option?.forEach((v: { target: string; data: any }) => {
					if (v.target === 'MAIN_FRAME_SET') {
						// 셋팅 데이터 재확인 필요
						ifWin.Global.MAIN_FRAME_SET = v.data
					}
				})
			}
			ret = {
				type: 'mode-1',
				data: ifWin.Global,
			}
			ifWin.postMessage(JSON.stringify(ret), '*')
			break
		case 'yesnoPop':
			console.log(jsonData.option.msg)
			ret = {
				type: 'mode-0',
				execution: 'yesornoSel',
				data: {
					bool: true,
				},
			}
			ifWin.postMessage(JSON.stringify(ret), '*')
			break
		case 'requestAPI':
			jsonData.option.apis?.forEach((v: any, i: number) => {
				const vUrl = v.url
				const vData = v.data
				ret = {
					type: 'requestAPI',
					data: {
						success: true,
						apiIndex: i,
						end: i === jsonData.option.apis.length - 1,
					},
				}
				ifWin.postMessage(JSON.stringify(ret), '*')
			})
			break
		case 'completeUnit':
			break
	}
}

const setGlobalUserData = (ifWin: any) => {
	if (typeof ifWin.Global === 'object') {
		ifWin.Global.LOCAL_DB = {
			bgm: '1',
		}
		ifWin.Global.USER_DATA = {
			usr_id: '7BC56245-7FCA-4FF4-A451-B82E8F71BAE3',
			usr_name: 'TEST_ID',
		}
		ifWin.Global.USER_STUDY_INFO = {
			grades: [
				{
					pass: '',
					stages: [
						{
							pass: '',
						},
					],
				},
			],
		}
		ifWin.Global.MAIN_FRAME_RETURN = {
			data: {
				grade: 0,
				stage: 0,
			},
		}
		ifWin.Global.AMANTA_API = ''
	}
}