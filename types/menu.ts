import type { MenuItem, IMenuState } from '~/types/menu'
import { defineStore } from 'pinia'
import { getData, postData } from '@/api'
import {
	convertDateTimeString,
	getIntroTypeString,
	getPageTypeString,
	getXmlDoc,
	parseDateTime,
	isEdubaseCompleted,
} from '@/utils'
import {
	CJLectureTitleInfo,
	CJMenuData,
	CJListMenuDatas,
	CJNetStudyInfo,
	CJConfigInfo,
} from '@/types/cj-app'
export const useMenusStore = defineStore('menusStore', {
	state: (): {
		menuData: IMenuState
	} => ({
		menuData: {
			menuGroups: [],
			menuItems: [] as MenuItem[],
			studyTitle: '',
			studyChapter: '',
			pid: '',
			mCode: '',
			isFirstLoadedMenu: false,
			isContinueStudy: false,
			isTestStudyComplete: false,
			curMenuItem: {} as MenuItem,
			lectureTitleInfo: {} as CJLectureTitleInfo,
			listMenuDatas: {} as CJListMenuDatas,
			cjCurMenuData: {} as CJMenuData,
			netStudyInfo: [] as CJNetStudyInfo[],
			configInfo: {} as CJConfigInfo,
		},
	}),
	getters: {
		getMenuData: state => state.menuData,
	},
	actions: {
		async fetchMCodeData(strUserID: string, strMCode: string) {
			// 메모리 정리: 기존 데이터 초기화
			this.clearMenuData()
			
			const [configItems, dataItems, studyHisItems]: any = await Promise.all([
				postData('/app_api/AppCommon/MulitPlayerCjAirContentRead', {
					strUserID,
					strMCode,
				}),
				postData('/app_api/AppCommon/MultiPlayerLectureTitleInfo', {
					strUserID,
					strMCode,
				}),
				postData('/app_api/AppCommon/FlashLectureLastInfoRead', {
					strUserID,
					strMCode,
				}),
			])
			
			if (dataItems.length > 0 && configItems.length > 0) {
				const configInfo = configItems.find((m: any) => m)
				const dataInfo = dataItems.find((m: CJLectureTitleInfo) => m) as CJLectureTitleInfo
				
				const convertId = configInfo.LM_VALUE.split('/')[configInfo.LM_VALUE.split('/').length - 1].replace(".zip","")
				
				// 메모리 효율적인 방식으로 menuItems 설정 (concat 대신 직접 할당)
				this.menuData.menuItems = [{
					group_id: convertId.substr(0, 3),
					grade: dataInfo.Grade.toString(),
					chapter: dataInfo.L_info,
					info: dataInfo.L_info,
					subject: dataInfo.Subject,
					step: '',
					id: convertId,
					path: `${convertId}/${convertId}.xml`,
					mCode: strMCode,
				} as MenuItem]
				
				this.menuData.pid = convertId
				this.menuData.mCode = strMCode
				this.menuData.lectureTitleInfo = dataInfo
				this.menuData.isFirstLoadedMenu = true
				this.menuData.configInfo = configInfo

				console.log("configInfo.LM_VALUE : "+ configInfo.LM_VALUE)
				console.log("pid === " + this.menuData.pid)
			}
			
			if (studyHisItems?.length > 0) {
				// concat 대신 spread operator 사용
				this.menuData.netStudyInfo = [...studyHisItems]
				this.menuData.isContinueStudy = false
			}
		},
		
		// 메모리 정리 함수 추가
		clearMenuData() {
			console.log('🔥 메뉴 데이터 메모리 정리 시작')
			
			// 기존 데이터 초기화
			this.menuData.menuItems = []
			this.menuData.menuGroups = []
			this.menuData.netStudyInfo = []
			this.menuData.listMenuDatas = {
				ui_type: '',
				chapter: '',
				title: '',
				entry_app: false,
				test_title_type: 1,
				menuIdx: 0,
				cjMenuDatas: []
			}
			this.menuData.cjCurMenuData = {} as CJMenuData
			this.menuData.lectureTitleInfo = {} as CJLectureTitleInfo
			this.menuData.configInfo = {} as CJConfigInfo
			
			// 가비지 컬렉션 강제 실행 (가능한 경우)
			if (typeof window !== 'undefined' && (window as any).gc) {
				(window as any).gc()
			}
			
			console.log('🔥 메뉴 데이터 메모리 정리 완료')
		},
		async fetchConfigItem(strUserID: string, strMCode: string) {
			const datas = await postData('/app_api/AppCommon/MulitPlayerCjAirContentRead', {
				strUserID,
				strMCode,
			})
			const configInfo = (datas as any)?.find((m: CJConfigInfo) => m)
			if (configInfo) {
				Object.assign(this.menuData.configInfo, configInfo)
			}
		},
		async fetchMenuData() {
			const response = await getData<IMenuState>('/api/test')
			if (response && response.result) {
				const data = response.result
				// Object.assign 대신 필요한 속성만 선택적으로 할당
				this.menuData.menuGroups = data.menuGroups || []
				this.menuData.menuItems = data.menuItems || []
				this.menuData.studyTitle = data.studyTitle || ''
				this.menuData.studyChapter = data.studyChapter || ''
				this.menuData.pid = data.pid || ''
				this.menuData.mCode = data.mCode || ''
				this.menuData.isFirstLoadedMenu = data.isFirstLoadedMenu || false
				this.menuData.isContinueStudy = data.isContinueStudy || false
				this.menuData.isTestStudyComplete = data.isTestStudyComplete || false
				this.menuData.curMenuItem = data.curMenuItem || {} as MenuItem
				this.menuData.lectureTitleInfo = data.lectureTitleInfo || {} as CJLectureTitleInfo
				this.menuData.listMenuDatas = data.listMenuDatas || {} as CJListMenuDatas
				this.menuData.cjCurMenuData = data.cjCurMenuData || {} as CJMenuData
				this.menuData.netStudyInfo = data.netStudyInfo || []
				this.menuData.configInfo = data.configInfo || {} as CJConfigInfo
			}
		},
		setPid(payload: string) {
			console.log(`setPid11=${payload}`)
			payload = payload || ''
			this.menuData.pid = payload
			this.setCurMenuItem(
				this.menuData?.menuItems?.find(m => m.id === this.menuData.pid) as MenuItem,
			)
			// this.setCurMenuItem(
			// 	this.menuData?.menuItems?.find(m => m.id === this.menuData.pid) as MenuItem,
			// )
		},
		setCurMenuItem(payload: MenuItem) {
			console.log(`setCurMenuItem=${payload}`)
			if (payload) {
				getXmlDoc(payload).then(xDoc => {
					console.log(`setCurMenuItem=curMenuItem=${xDoc}`)
					this.menuData.curMenuItem = payload
					this.setIfXmlDoc(xDoc)
					// 에듀베이스 추가
					if (this.menuData.lectureTitleInfo?.TestYn === 'Y') {
						xDoc?.cjMenuDatas?.push({
							id: '999',
							type: 999,
							title:
								xDoc.test_title_type === 1
									? '기초문제'
									: xDoc.test_title_type === 2
										? 'AI추천문제'
										: '기본 문제',
							filePath: '',
							smiPath: '',
							ebookPath: '',
							titleCode: '',
							status: isEdubaseCompleted(this.menuData.configInfo) ? 2 : 0, // 0:잠김,1:진행,2:완료
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
					}
				})
			}
		},
		setIfXmlDoc(payload: CJListMenuDatas) {
			console.log(`setIfXmlDoc=${payload}`)

			this.menuData.listMenuDatas = payload
			let nCurrentMenuIdx = 0
			if (this.menuData?.netStudyInfo?.length > 0 && payload?.cjMenuDatas?.length > 0) {
				this.menuData.netStudyInfo.forEach((v, i) => {
					console.log(`v.comYN=${v.comYN}`)
					console.log(`v.lastYN=${v.lastYN}`)
					console.log(`nCurrentMenuIdx=${i}`)

					if (v.comYN.toLowerCase() === 'y' && v.lastYN.toLowerCase() === 'y') {
						nCurrentMenuIdx = i
					}
					const items = this.menuData.listMenuDatas?.cjMenuDatas
					if (items?.length > i) {
						const ent = items[i] as CJMenuData
						if (ent.id === v.id) {
							ent.status = v.comYN.toLowerCase() === 'y' ? 2 : parseInt(v.status)
							ent.step = parseInt(v.step.toString())
							ent.playTime = parseInt(v.playTime.toString())
							ent.mediaTime = parseInt(v.mediaTime.toString())
							ent.score = v.score
							if (v.startDate != null) ent.calStartTime = parseDateTime(v.startDate)
							if (v.data != null) ent.strData = v.data
						}
					}
				})
				if (nCurrentMenuIdx === 0) {
					nCurrentMenuIdx = this.menuData.netStudyInfo.findIndex(
						m => m.comYN === 'N' && m.lastYN === 'Y',
					)
				}
			}
			this.menuData.listMenuDatas.menuIdx =
				nCurrentMenuIdx === -1
					? 0
					: nCurrentMenuIdx >= this.menuData.listMenuDatas?.cjMenuDatas?.length
						? nCurrentMenuIdx - 1
						: nCurrentMenuIdx
			if (this.menuData?.listMenuDatas?.cjMenuDatas?.length > 0) {
				this.menuData.cjCurMenuData =
					this.menuData?.listMenuDatas?.cjMenuDatas[this.menuData?.listMenuDatas?.menuIdx]
				if (this.menuData.cjCurMenuData) {
					if (this.menuData.cjCurMenuData?.status === 0) {
						this.menuData.cjCurMenuData.status = 1
					}
					this.menuData.cjCurMenuData.calStartTime = new Date()
				}
			}
			console.log(`nCurrentMenuIdx=${nCurrentMenuIdx}`)
			//this.setIfXmlDocMenuIdx(nCurrentMenuIdx)
			//this.setContinueStudy()
				 
		},
		setIfXmlDocMenuIdx(payload: number) {

			console.log(`setIfXmlDocMenuIdx=${payload}`)
			this.menuData.listMenuDatas.menuIdx = payload
			this.menuData.cjCurMenuData =
				this.menuData?.listMenuDatas?.cjMenuDatas[this.menuData.listMenuDatas.menuIdx]
			// this.menuData.cjCurMenuData = this.menuData?.listMenuDatas?.cjMenuDatas?.find(
			// 	(m: CJMenuData) => m.id === payload.toString(),
			// ) as CJMenuData
			if (this.menuData.cjCurMenuData != null) {
				if (this.menuData.cjCurMenuData.status === 0) {
					this.menuData.cjCurMenuData.status = 1
				}
				this.menuData.cjCurMenuData.calStartTime = new Date()
			}
		},
		setStatus(payload: number) {
			console.log("setStatus")
			this.menuData.cjCurMenuData.status = payload
		},
		setStep(payload: number) {
			console.log("setStep")
			this.menuData.cjCurMenuData.step = payload
		},
		setMediaTime(payload: number) {
			console.log("setMediaTime")
			const someBuf = this.menuData.cjCurMenuData.mediaTime + (payload || 0)
			this.menuData.cjCurMenuData.mediaTime = parseInt(someBuf.toString())
		},
		setPlayTime() {
			const startTime = parseDateTime(this.menuData.cjCurMenuData.calStartTime)
			const diffTime = new Date().getTime() - startTime.getTime()
			this.menuData.cjCurMenuData.playTime = diffTime / 1000
		},
		setContinueStudy() {
			this.menuData.isContinueStudy = true
			console.log(`setContinueStudy==${this.menuData.pid}`)
		},
		setInitContinueStudy() {
			console.log(`setInitContinueStudy`)
			this.menuData.isContinueStudy = true
			this.menuData.netStudyInfo = []
			this.menuData.listMenuDatas.cjMenuDatas.forEach(v => {
				v.status = 0
				v.step = 1
			})
			this.setIfXmlDocMenuIdx(0)
		},
		async setRequestHisComplete(strUserID: string, isSave?: boolean) {
			console.log(`setRequestHisComplete`)
			let strComYN = 'N'
			const datas = this.menuData?.listMenuDatas?.cjMenuDatas
			if (datas.length > 0) {
				if (datas.filter(m => m.status === 2).length === datas.length) {
					strComYN = 'Y'
				}
				const strStartTime = convertDateTimeString(datas[0]?.calStartTime || new Date())
				const strEndTime = convertDateTimeString(new Date())
				const nStudySec = parseInt(
					(
						(new Date().getTime() - parseDateTime(datas[0]?.calStartTime || new Date())?.getTime()) /
						1000
					).toString(),
				)

				const bufStudyInfos = [] as CJNetStudyInfo[]
				datas.forEach((v: CJMenuData, i: number) => {
					const sInfo = {
						mCode: this.menuData.mCode,
						comYN: strComYN,
						introType: getIntroTypeString(v.title),
						step: v.step,
						mediaTime: parseInt(v.mediaTime.toString()),
						playTime: parseInt(v.playTime.toString()),
						studySec: parseInt(nStudySec.toString()),
						startDate: strStartTime,
						endDate: strEndTime,
						lastYN: i === this.menuData.listMenuDatas.menuIdx ? 'Y' : 'N',
						pageType: getPageTypeString(v.type),
						id: v.id,
						data: v.strData,
						status: v.status,
						score: v.score || -1,
					} as unknown as CJNetStudyInfo
					bufStudyInfos.push(sInfo)
				})

				if ((bufStudyInfos.length > 0 && strComYN === 'Y') || isSave) {
					// 에듀베이스가 없을 경우 완강 처리가 되지않아 프로시져 별도 호출
					// const ret = await postData('/app_api/AppCommon/AppFlashHisComplete', {
					// 	strUserID,
					// 	strReqData: JSON.stringify(bufStudyInfos),
					// })
					const ret = await postData('/e_api/contents/AppFlashHisComplete', {
						strUserID,
						strReqData: JSON.stringify(bufStudyInfos),
					})
					console.log(`/app_api/AppCommon/AppFlashHisComplete => ${ret}`)
					if (ret && strComYN === 'Y') {
						const ret2 = await postData('/app_api/AppCommon/AppStudyComplete', {
							strUserID,
							mCode: this.menuData.mCode,
						})
						console.log(`/app_api/AppCommon/AppStudyComplete => ${ret2}`)
						console.log('컨텐츠 종료')

						// 재학습 종료 제외
						if (
							this.menuData.listMenuDatas.menuIdx ===
							this.menuData.listMenuDatas.cjMenuDatas.length - 1
						) {
							alert('학습이 완료 되었습니다.')

							if (/sm-p/i.test(window.navigator?.userAgent)) {
								if (typeof window?.HybridApp?.windowClose === 'function') {
									console.log(`window.HybridApp.windowClose`)
								}

								if (typeof window.isherpa !== 'undefined') {
									window.isherpa.windowClose()
									console.log(`isherpa.windowClose()`)
								}
							} else if (window?.opener != null) {
								const ret = {
									type: 'ContentsReload',
								}
								window.opener.postMessage(JSON.stringify(ret), '*')
								window.close()
							}
						}
					}
				}
			}
		},
	},
})
