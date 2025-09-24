import type { MenuItem } from '@/types/menu'
import { useContext } from '@nuxtjs/composition-api'
import { getData, postData } from '@/api'
import { CJConfigInfo, CJListMenuDatas } from '~/types/cj-app'
import { INTRO_TYPE_STRINGS } from './fixedValues'
// const config = require('../nuxt.config.js')
export async function getXmlDoc(curMenu: MenuItem) {
	const parseObj = {} as CJListMenuDatas
	// const parseObj = {} as CJMenuData
	const context = useContext()
	if (curMenu && typeof DOMParser === 'function') {
		// const config = useRuntimeConfig()
		// const pathname =  //globalThis?.location?.pathname?.split('/')[1]
		// proxy 설정 추가 테스트 필요 임시 변환
		const isLocal = context.env.BASE_TARGET === 'local' || location.host.includes('local')
		const xmlDoc = await getData(`/c_api/${curMenu.path}`).then(str =>
			new DOMParser().parseFromString(str as any, 'text/html'),
		)
		if (xmlDoc) {
			Object.assign(parseObj, {
				ui_type: xmlDoc.querySelector('ui_type')?.textContent || '',
				chapter: xmlDoc.querySelector('chapter')?.textContent || '',
				title: xmlDoc.querySelector('title')?.textContent || '',
				entry_app: xmlDoc.querySelector('entry_app')?.textContent === 'true' || false,
				test_title_type: xmlDoc.querySelector('test_title_type')?.textContent || 0,
				menuIdx: 0,
				cjMenuDatas: [] as CJListMenuDatas[],
			})
			xmlDoc.querySelectorAll('menu')?.forEach(v => {
				parseObj.cjMenuDatas.push({
					id: v.id,
					type: parseInt(v.querySelector('type')?.textContent || '0'),
					title: v.querySelector('title')?.textContent || '',
					filePath: v.querySelector('file_path')?.textContent || '',
					smiPath: v.querySelector('smi_path')?.textContent || '',
					ebookPath: v.querySelector('ebook_path')?.textContent || '',
					titleCode: '',
					status: 0, // 0:잠김,1:진행,2:완료
					step: 1,
					playTime: 0,
					mediaTime: 0,
					contentHeight: 800,
					strData: '',
					calStartTime: undefined,
					stepMiddle: '',
					intro: '',
					pageType: '',
					score: -1,
				})
			})
			xmlDoc.querySelectorAll('study_unit')?.forEach(v => {
				return parseObj.cjMenuDatas.push({
					id: v.id,
					type: parseInt(v.querySelector('step_id')?.textContent || '0'),
					title: v.querySelector('title')?.textContent || '',
					filePath: v.querySelector('file_path')?.textContent || '',
					smiPath: v.querySelector('smi_path')?.textContent || '',
					ebookPath: v.querySelector('ebook_path')?.textContent || '',
					titleCode: '',
					status: 0,
					step: 1,
					playTime: 0,
					mediaTime: 0,
					contentHeight: 800,
					strData: '',
					calStartTime: undefined,
					stepMiddle: '',
					intro: '',
					pageType: '',
					score: -1,
				})
			})
		}
		console.log(parseObj)
	}
	return parseObj
}

export function getPageTypeString(nType: number) {
	switch (nType) {
		case 0:
			return 'FLASH'
		case 1:
			return 'MEDIA'
		case 2:
			return 'FLASH'
		case 3:
			return 'FLASH'
		case 4:
			return 'TEST'
		case 5:
			return 'HTML'
		case 6:
			return 'HTML'
		case 999:
			return 'EDUBASE'
		default:
			return 'NotDefined'
	}
}

export function getIntroTypeString(strTitle: string) {
	strTitle = strTitle.replaceAll(' ', '')
	const valIdx = INTRO_TYPE_STRINGS.map(m => Object.keys(m))?.findIndex(m2 => m2.includes(strTitle))
	if (valIdx > -1) {
		const val = Object.values(INTRO_TYPE_STRINGS[valIdx])
		return val.length > 0 ? val[0] : 'NotDefined'
	}
	return 'NotDefined'
}

export function parseDateTime(date: any) {
	try {
		if (!date) {
			return new Date()
		}
		
		if (typeof date === 'string') {
			const parsedDate = new Date(date)
			// 유효한 Date 객체인지 확인
			if (isNaN(parsedDate.getTime())) {
				console.warn('🔥 parseDateTime: 잘못된 날짜 문자열, 현재 시간 사용:', date)
				return new Date()
			}
			return parsedDate
		}
		
		if (date instanceof Date) {
			// 유효한 Date 객체인지 확인
			if (isNaN(date.getTime())) {
				console.warn('🔥 parseDateTime: 잘못된 Date 객체, 현재 시간 사용:', date)
				return new Date()
			}
			return date
		}
		
		// 다른 타입인 경우 현재 시간 반환
		console.warn('🔥 parseDateTime: 알 수 없는 타입, 현재 시간 사용:', typeof date, date)
		return new Date()
	} catch (error) {
		console.error('🔥 parseDateTime 에러:', error)
		return new Date()
	}
}
export function convertDateTimeString(date: any, dateDiveder?: string) {
	// date가 유효하지 않은 경우 현재 날짜 사용
	if (!date || (typeof date === 'string' && date.trim() === '')) {
		date = new Date()
	}

	date = parseDateTime(date)

	// parseDateTime 후에도 유효한 Date 객체가 아닌 경우 현재 날짜 사용
	if (!(date instanceof Date) || isNaN(date.getTime())) {
		date = new Date()
	}

	// 최종 안전 검사 - 여전히 유효하지 않으면 현재 날짜 사용
	try {
		if (!date || typeof date.getFullYear !== 'function') {
			date = new Date()
		}
	} catch (error) {
		date = new Date()
	}

	if (dateDiveder == null) {
		dateDiveder = '-'
	}
	function padTwoDigits(num: number) {
		return num.toString().padStart(2, '0')
	}

	try {
		return (
			[date.getFullYear(), padTwoDigits(date.getMonth() + 1), padTwoDigits(date.getDate())].join(
				dateDiveder,
			) +
			' ' +
			[
				padTwoDigits(date.getHours()),
				padTwoDigits(date.getMinutes()),
				padTwoDigits(date.getSeconds()),
			].join(':')
		)
	} catch (error) {
		// 모든 시도가 실패하면 기본 날짜 문자열 반환
		const now = new Date()
		return (
			[now.getFullYear(), padTwoDigits(now.getMonth() + 1), padTwoDigits(now.getDate())].join(
				dateDiveder,
			) +
			' ' +
			[
				padTwoDigits(now.getHours()),
				padTwoDigits(now.getMinutes()),
				padTwoDigits(now.getSeconds()),
			].join(':')
		)
	}
}

// o: container to set the innerHTML
// html: html text to set.
// clear: if true, the container is cleared first (children removed)
export function setHTML(o: HTMLElement, html: string, clear: boolean) {
	if (clear) o.innerHTML = ''

	// Generate a parseable object with the html:
	const dv = document.createElement('div')
	dv.innerHTML = html

	// Handle edge case where innerHTML contains no tags, just text:
	if (dv.children.length === 0) {
		o.innerHTML = html
		return
	}

	for (let i = 0; i < dv.children.length; i++) {
		const c = dv.children[i] as any

		// n: new node with the same type as c
		const n = document.createElement(c.nodeName)

		// copy all attributes from c to n
		for (let j = 0; j < c.attributes.length; j++)
			n.setAttribute(c.attributes[j].nodeName, c.attributes[j].nodeValue)

		// If current node is a leaf, just copy the appropriate property (text or innerHTML)
		if (c.children.length === 0) {
			switch (c.nodeName) {
				case 'SCRIPT':
					if (c.text) {
						// jQuery가 이미 로드되어 있으면 즉시 실행, 아니면 대기
						if (c.text.includes('$') || c.text.includes('jQuery')) {
							// jQuery가 이미 로드되어 있는지 먼저 확인
							if (typeof window !== 'undefined' && (window.jQuery || (window as any).$)) {
								// jQuery가 이미 로드되어 있으면 즉시 실행
								try {
									const script = document.createElement('script')
									script.textContent = c.text
									document.head.appendChild(script)
								} catch (error) {
									console.error('🔥 jQuery 스크립트 즉시 실행 실패:', error)
								}
							} else {
								// jQuery가 로드될 때까지 대기 후 스크립트 실행
								waitForJQuery(() => {
									try {
										const script = document.createElement('script')
										script.textContent = c.text
										document.head.appendChild(script)
									} catch (error) {
										console.error('🔥 jQuery 스크립트 지연 실행 실패:', error)
									}
								})
							}
						} else {
							// jQuery를 사용하지 않는 스크립트는 즉시 실행
							n.text = c.text
						}
					}
					break
				default:
					if (c.innerHTML) n.innerHTML = c.innerHTML
					break
			}
		}
		// If current node has sub nodes, call itself recursively:
		else setHTML(n, c.innerHTML, false)
		o.appendChild(n)
	}
}

export function getUrlParam(key: string, val?: any, prevUrl?: string) {
	let retVal = val || ''
	const searchUrl = prevUrl || location.search
	const currUrl = searchUrl.substr(searchUrl.indexOf('?') + 1)
	const currUrl2 = currUrl?.split('&')
	for (let i = 0; i < currUrl2.length; i++) {
		const temp = currUrl2[i].split('=')
		if (temp[0]?.toLowerCase() === key.toLowerCase()) {
			retVal = temp[1]
		}
	}
	return retVal
}

export const loadMovie = async (path: string) => {
	const splPath = path.split('//')
	if (splPath.length > 1) {
		path = splPath[1]
	}
	const data = await getData(
		`//app.milkt.co.kr/AppCommon/GSCDNAuthURL_Flash_8?strPath=${path}`,
	)
	if (data) {
		const res = data as any // data as ICdnMovie[]
		if (res.length > 0 && res[0].strAuthUrl !== '') {
			if (res[0].strAuthUrl.split('http:').length > 1) {
				return res[0].strAuthUrl.split('http:')[1]
			} else {
				return res[0].strAuthUrl
			}
		}
	}
	return ''
}

export const contentsReset = async (sysUserId: string, mCode: string, lectureType: string) => {
	// const data =
	return await postData('/e_api/AppQuestionBank/SetContentsReset', {
		sysUserId,
		mCode,
		lectureType,
	})
	// return data
}

export const isEdubaseCompleted = (conf: CJConfigInfo) => {
	let bRet = false
	if (conf) {
		bRet = conf.TestYN === 'Y' && conf.TestStudyYN === 'Y'
		bRet = conf.SimilarYN === 'Y' ? conf.SimilarStudyYN === 'Y' : bRet
		bRet = conf.ChallengeYN === 'Y' ? conf.ChallengeStudyYN === 'Y' : bRet
	}
	return bRet
}
export const compEdubasePageType = (conf: CJConfigInfo) => {
	let bRet = 'TEST'
	if (conf) {
		bRet = conf.TestYN === 'Y' && conf.TestStudyYN === 'Y' ? 'TEST' : bRet
		bRet = conf.SimilarYN === 'Y' && conf.SimilarStudyYN === 'Y' ? 'SIMILAR' : bRet
		bRet = conf.ChallengeYN === 'Y' && conf.ChallengeStudyYN === 'Y' ? 'CHALLENGE' : bRet
	}
	return bRet
}

export const curEdubasePageType = (conf: CJConfigInfo) => {
	let bRet = 'TEST'
	if (conf) {
		bRet = conf.TestYN === 'Y' ? 'TEST' : bRet
		if (conf.TestYN === 'Y' && conf.TestStudyYN === 'Y') {
			bRet = conf.SimilarYN === 'Y' ? 'SIMILAR' : bRet
			if (conf.SimilarYN === 'Y') {
				bRet = conf.SimilarStudyYN === 'Y' && conf.ChallengeYN === 'Y' ? 'CHALLENGE' : bRet
			} else {
				bRet = conf.ChallengeYN === 'Y' ? 'CHALLENGE' : bRet
			}
		}
	}
	return bRet
}

// jQuery 로딩 상태 확인 함수 (최적화됨)
export const waitForJQuery = (callback: () => void, maxWaitTime: number = 3000): void => {
	// jQuery가 이미 로드되어 있으면 즉시 실행 ($ 또는 jQuery)
	if (typeof window !== 'undefined' && (window.jQuery || (window as any).$)) {
		callback()
		return
	}
	
	// 짧은 지연 후 한 번 더 확인 (대부분의 경우 jQuery가 이미 로드됨)
	setTimeout(() => {
		if (typeof window !== 'undefined' && (window.jQuery || (window as any).$)) {
			callback()
			return
		}
		
		// 그래도 없으면 주기적 체크 (더 짧은 간격)
		const startTime = Date.now()
		const checkInterval = setInterval(() => {
			if (typeof window !== 'undefined' && (window.jQuery || (window as any).$)) {
				clearInterval(checkInterval)
				callback()
			} else if (Date.now() - startTime > maxWaitTime) {
				clearInterval(checkInterval)
				console.warn('🔥 jQuery 로딩 대기 시간 초과, 스크립트 실행 시도')
				// 타임아웃되어도 스크립트 실행 시도
				callback()
			}
		}, 30) // 50ms → 30ms로 더 단축
	}, 50) // 100ms → 50ms로 단축
}

export const lastEdubasePageType = (conf: CJConfigInfo) => {
	let bRet = 'TEST'
	if (conf) {
		bRet = conf.TestYN === 'Y' ? 'TEST' : bRet
		bRet = conf.SimilarYN === 'Y' ? 'SIMILAR' : bRet
		bRet = conf.ChallengeYN === 'Y' ? 'CHALLENGE' : bRet
	}
	return bRet
}

export function initAudioDevice() {
	const constraints = {
		audio: {
			channelCount: 1,
			echoCancellation: false,
		},
	}
	navigator?.mediaDevices?.getUserMedia(constraints).then(stream => {
		// const audioContext = new AudioContext()
		// audioContext.resume()
	})
}

export function loadScript(src: string) {
	return new Promise(function (resolve, reject) {
		let shouldAppend = false
		let el = document.querySelector('script[src="' + src + '"]') as HTMLScriptElement
		if (!el) {
			el = document.createElement('script')
			el.type = 'text/javascript'
			el.async = true
			el.src = src
			shouldAppend = true
		} else if (el.hasAttribute('data-loaded')) {
			resolve(el)
			return
		}

		el.addEventListener('error', reject)
		el.addEventListener('abort', reject)
		el.addEventListener('load', function loadScriptHandler() {
			try {
				el.setAttribute('data-loaded', 'true')
			} catch {}

			resolve(el)
		})

		if (shouldAppend) document.head.appendChild(el)
	})
}
export function unloadScript(src: string) {
	return new Promise<void>(function (resolve, reject) {
		const el = document.querySelector('script[src="' + src + '"]')
		if (!el) {
			// 스크립트가 존재하지 않으면 성공으로 처리 (이미 언로드된 상태)
			resolve()
			return
		}
		try {
			document.head.removeChild(el)
			resolve()
		} catch (error) {
			reject(new Error(`Failed to unload script: ${src}`))
		}
	})
}

// export function initMediaDevices() {
// 	// if (navigator.mediaDevices === undefined) {
// 	// 	navigator.mediaDevices = {} as any
// 	// }
// 	if (navigator?.mediaDevices?.getUserMedia === undefined) {
// 		navigator.mediaDevices.getUserMedia = function (constraints) {
// 			// First get ahold of the legacy getUserMedia, if present
// 			const getUserMedia = window.navigator?.webkitGetUserMedia || window.navigator?.mozGetUserMedia

// 			// Some browsers just don't implement it - return a rejected promise with an error
// 			// to keep a consistent interface
// 			if (!getUserMedia) {
// 				return Promise.reject(new Error('getUserMedia is not implemented in this browser'))
// 			}

// 			// Otherwise, wrap the call to the old navigator.getUserMedia with a Promise
// 			return new Promise(function (resolve, reject) {
// 				getUserMedia.call(navigator, constraints, resolve, reject)
// 			})
// 		}
// 	}

// 	const constraints = { audio: true, video: { width: 1280, height: 800 } }
// 	if (navigator.mediaDevices !== undefined) {
// 		navigator.mediaDevices
// 			.getUserMedia(constraints)
// 			.then(function (stream: any) {
// 				const video = document.querySelector('video') as any
// 				if (video) {
// 					if ('srcObject' in video) {
// 						// Older browsers may not have srcObject
// 						video.srcObject = stream
// 					} else {
// 						// Avoid using this in new browsers, as it is going away.
// 						video.src = window.URL.createObjectURL(stream)
// 					}
// 					video.onloadedmetadata = function (e: any) {
// 						video.play()
// 					}
// 				}
// 			})
// 			.catch(function (err) {
// 				console.log(err.name + ': ' + err.message)
// 			})
// 	}
// }
