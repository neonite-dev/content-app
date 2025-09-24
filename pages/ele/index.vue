<script lang="ts" setup>
import { useSubjectStore } from '@/stores/ele'
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'
import {
	computed,
	defineComponent,
	onMounted,
	ref,
	useAsync,
	useMeta,
} from '@nuxtjs/composition-api'
import { postData } from '@/api'
import { initAudioDevice, contentsReset } from '@/utils'
useMeta({
	title: 'MilkT Multi Device Player Svc4',
})

const subjectStore = useSubjectStore()
const { fetchSubjectData, fetchTextBookJindoList } = subjectStore
const { subjectData } = storeToRefs(subjectStore)
const userStore = useUserStore()
const { userInfo } = storeToRefs(userStore)

interface ITeacherInfo {
	bookName: string | ''
	tutorNo: string | ''
	lecTutorNo: string | ''
	ImageTitle: string | ''
	Image_Doc1: string | ''
	ImageDesc: string | ''
	ImageRedi_URL: string | ''
}

const userName = ref<string>(userInfo.value?.UserID)
const grade = ref<number>(userInfo.value?.selTopGrade)
const term = ref<number>(userInfo.value?.selTopTerm)
const subject = ref<string>('K')
const ltype = ref<string>('T_EBOOK_B') // T_WINTER_B
const lChapter = ref<string>('')
const Difficulty = ref<string>('')
const SelBookType = ref<string>('M01')

const cmnTeacherInfo = ref<ITeacherInfo>({
	bookName: '',
	tutorNo: '',
	lecTutorNo: '',
	ImageTitle: '',
	Image_Doc1: '',
	ImageDesc: '',
	ImageRedi_URL: '',
})
const lecTeacherInfo = ref<ITeacherInfo>({
	bookName: '',
	tutorNo: '',
	lecTutorNo: '',
	ImageTitle: '',
	Image_Doc1: '',
	ImageDesc: '',
	ImageRedi_URL: '',
})
const popTeacherInfo = ref<ITeacherInfo>({
	bookName: '',
	tutorNo: '',
	lecTutorNo: '',
	ImageTitle: '',
	Image_Doc1: '',
	ImageDesc: '',
	ImageRedi_URL: '',
})

const isPopTeacherProfile = ref<boolean>(false)

if (term.value === 3) {
	ltype.value = 'T_SUMMER_B'
} else if (term.value === 4) {
	ltype.value = 'T_WINTER_B'
}
useAsync(() => fetchSubjectData(grade.value, term.value, 'TEXTBOOK', userName.value))
useAsync(() =>
	fetchTextBookJindoList(
		grade.value,
		term.value,
		subject.value,
		ltype.value,
		userName.value,
		lChapter.value,
		Difficulty.value,
		SelBookType.value,
	),
)
onMounted(() => {
	try {
		// document.domain = 'milkt.co.kr'
		const sel = document.querySelectorAll('.selectbox')
		const $ = window.jQuery
		if (sel) {
			if (typeof $ === 'function') {
				$('.selectbox').selectbox()
				$('.session > .sbHolder').attr('style', 'width:130px')
				$('#div_selboxTop > .sbHolder').attr('style', 'width:110px')

				$('.selectbox')
					.unbind('change')
					.change((event: { target: { id: string; value: string } }) => {
						if (event?.target?.id === 'unitList') {
							if (event.target.value === '') {
								const val = $('#sbSelector_' + $(event.target).attr('sb'))
									.text()
									.replace(/[^0-9]/g, '')
								lChapter.value = val
								GetLectureList()
							} else {
								lChapter.value = event.target.value
								GetLectureList()
							}
						} else if (event?.target?.id === 'top_selGrade') {
							grade.value = parseInt(event.target.value)
							lChapter.value = ''
							GetLectureList()
						}
					})
			}
		}

		// postMessage
		window.addEventListener(
			'message',
			(event: { data: string }) => {
				if (['object', 'string'].includes(typeof event.data)) {
					const jsonData = typeof event.data === 'string' ? JSON.parse(event.data) : event.data
					if (jsonData.type && jsonData.type !== '') {
						console.log(jsonData)
						switch (jsonData.type) {
							case 'ContentsReload':
								GetLectureList()
								break
						}
					}
				}
			},
			false,
		)
	} catch {}
	// setTimeout(() => {
	// 교사정보 호출
	GetImageBuilderList()

	// 마이크 설정 우선 추가
	initAudioDevice()
	// }, 100)
})

const unitItems = computed(() => {
	return subjectData?.value?.textBookJindo
		.map(m => ({ lChapter: m.lChapter, lTitle: m.lTitle }))
		.reduce((distinct: any, m: any) => {
			return distinct.find((d: any) => d.lChapter === m.lChapter) != null
				? distinct
				: [...distinct, m]
		}, [])
})

const subjectName = computed(() => {
	return subjectData?.value?.subjectItems?.find(m => m.Subject === subject.value)?.SubjectAliasName
})

const lecChgType = computed(() => {
	return ['K', 'S', 'N'].includes(subject.value)
		? 'T_HONOR'
		: subject.value === 'M'
			? 'T_Leader'
			: subject.value === 'E'
				? 'T_Teacher_B'
				: ''
})

// eslint-disable-next-line camelcase
const Content_Load = (page?: any, sub?: string) => {
	subject.value = sub as string
	GetLectureList()
}

const Term = (val: number, typeVal: string) => {
	term.value = val
	ltype.value = typeVal
	GetLectureList()
}

const leftMenuList = (val?: string) => {
	if (typeof val !== 'string' || val == null) {
		if (term.value === 3) {
			ltype.value = 'T_SUMMER_B'
		} else if (term.value === 4) {
			ltype.value = 'T_WINTER_B'
		} else {
			ltype.value = 'T_EBOOK_B'
		}
	} else {
		ltype.value = val
	}

	GetLectureList()
}

const GetLectureList = async () => {
	SelBookType.value =''

	if( grade.value > 2  )
	{
		if( subject.value == 'M') SelBookType.value ='M01' //수학 천재(박)
		if( subject.value == 'S') SelBookType.value ='S02' //사회 천재(박)
		if( subject.value == 'N') SelBookType.value ='N_CJ' //과학 천재(이)
		if( subject.value == 'E') SelBookType.value ='H' //영어 천재(함)
	}


	await fetchTextBookJindoList(
		grade.value,
		term.value,
		subject.value,
		ltype.value,
		userName.value,
		lChapter.value,
		Difficulty.value,
		SelBookType.value,
	)
	console.log(grade.value, term.value, subject.value, ltype.value, userName.value, lChapter.value,Difficulty.value,SelBookType.value)
	await GetImageBuilderList()
}

const GetImageBuilderList = async () => {
	let tutorNo = ''
	let lecTutorNo = '0'

	console.log(grade.value);
	// 아놔 하드코딩;;
	if (subject.value === 'K') {
		switch (grade.value) {
            case 1:
                if ([1, 2].includes(term.value)) {
                    tutorNo = "237"; //국어 서수빈
                } else {
                    tutorNo = "77"; // 국어 김정민
                }
                break;
            case 2:
                if ([1, 2].includes(term.value)) {
                    tutorNo = "234"; //국어 박예찬
                } else {
                    tutorNo = "77"; // 국어 김정민
                }
                break;
            case 3:
                if ([4].includes(term.value)) {
                    tutorNo = "398"; // 국어 최서연&엄은나 (#132397)
                } else if ([1].includes(term.value)) {
                    tutorNo = "410"; // 국어 오지현 (#137727)
                } else {
                    tutorNo = "79"; // 국어 최서연
                }
                break;
            case 4:
                tutorNo = "78"; // 국어 엄은아
                if ([4].includes(term.value)) {
                    tutorNo = "398"; // 국어 엄은나 (#132397)                    
                } else if ([1].includes(term.value)) {
                    tutorNo = "234"; // 국어 박예찬 (#137727)
                }
                break;
            case 5:
                tutorNo = '77' // 국어 김정민
                if ([4].includes(term.value)) {
                    tutorNo = "78"; // 국어 엄은아
                }
                break;
            case 6:
                tutorNo = "78"; // 국어 엄은아
                if ([4].includes(term.value)) {
                    tutorNo = "77"; // 국어 김정민
                }
                break;
        }
	} else if (subject.value === 'M') {
		if (grade.value === 4) {
			tutorNo = '82' // 수학  서채은
			if ([1, 2, 3].includes(term.value)) {
				tutorNo = '81' // 수학  박정은
			}
		} else if (
			(grade.value === 1 && [2, 3, 4].includes(term.value)) ||
			(grade.value === 2 && [2, 3].includes(term.value)) ||
			(grade.value === 4 && [4].includes(term.value)) ||
			(grade.value === 6 && [1, 2, 3, 4].includes(term.value))
		) {
			tutorNo = '82' // 수학  서채은
		} else if (
			(grade.value === 3 && [1, 2, 3, 4].includes(term.value)) ||
			(grade.value === 5 && [1, 2, 3, 4].includes(term.value))
		) {
			tutorNo = '83' // 수학  전지혜
		} else if (grade.value === 2 && [4].includes(term.value)) {
			tutorNo = '84' // 수학 문선진
		} else if (
			(grade.value === 1 && [1].includes(term.value)) ||
			(grade.value === 2 && [1].includes(term.value))
		) {
			tutorNo = '233' // 수학 서채은
		}
	} else if (subject.value === 'E') {
		if (grade.value === 3 && term.value === 4) {
			tutorNo = '86' // 영어 Bella
		} else if (grade.value === 6 && [1, 2, 3].includes(term.value)) {
			tutorNo = '87' // 영어 Lucy
		} else if (
			(grade.value === 5 && [1, 2, 3].includes(term.value)) ||
			(grade.value === 6 && term.value === 4)
		) {
			tutorNo = '88' // 영어 신이나
		} else if (
			(grade.value === 3 && [1, 2, 3].includes(term.value)) ||
			(grade.value === 4 && [1, 2, 3, 4].includes(term.value)) ||
			(grade.value === 5 && term.value === 4)
		) {
			tutorNo = '89' // 영어 알리샤
		}
	} else if (subject.value === 'S') {
		if (
			(grade.value === 3 && [1, 2].includes(term.value)) ||
			(grade.value === 5 && [1, 2].includes(term.value))
		) {
			tutorNo = '90' // 사회 김완신
		} else if (
			(grade.value === 3 && [3, 4].includes(term.value)) ||
			(grade.value === 5 && [3, 4].includes(term.value))
		) {
			tutorNo = '91' // 사회 신지현
		} else if (grade.value === 4 && [1, 2].includes(term.value)) {
			tutorNo = '92' // 사회 오지연
		} else if (
			(grade.value === 4 && [3, 4].includes(term.value)) ||
			(grade.value === 6 && [3, 4].includes(term.value))
		) {
			tutorNo = '93' // 사회 주혜령
		} else if (grade.value === 6 && [1, 2].includes(term.value)) {
			tutorNo = '94' // 사회 성하연
		}
	} else if (subject.value === 'O') {
		tutorNo = '101' // 봄여름가을겨울 성하연
	} else if (subject.value === '1') {
		if (grade.value === 1 && term.value === 1) {
			tutorNo = '230' // 통합교과 최한나
		} else {
			tutorNo = '204' // 통합교과 이마리
		}
	} else if (subject.value === 'N') {
		if (
			(grade.value === 5 && [1, 2].includes(term.value)) ||
			(grade.value === 6 && [1, 2].includes(term.value))
		) {
			tutorNo = '95' // 과학 김샛별
		} else if (
			(grade.value === 5 && [3, 4].includes(term.value)) ||
			(grade.value === 6 && [3, 4].includes(term.value))
		) {
			tutorNo = '96' // 과학 김항아
		} else if (
			(grade.value === 3 && [1, 2].includes(term.value)) ||
			(grade.value === 4 && [1, 2].includes(term.value))
		) {
			tutorNo = '97' // 과학 홍희진
		} else if (
			(grade.value === 3 && [3, 4].includes(term.value)) ||
			(grade.value === 4 && [3, 4].includes(term.value))
		) {
			tutorNo = '98' // 과학 황유하
		}
	} else if (subject.value === 'T') {
		tutorNo = '99'
	} else if (subject.value === 'L') {
		tutorNo = '100'
	}

	// 강의형
	if (subject.value === 'K' && term.value === 1) {
		if (grade.value === 3) {
			lecTutorNo = '232' // 강의형 국어 정채린
		} else if (grade.value === 4) {
			lecTutorNo = '234' // 강의형 국어 박예찬
		} else if (grade.value === 5) {
			lecTutorNo = '78' // 강의형 국어 엄은나
		} else if (grade.value === 6) {
			lecTutorNo = '232' // 강의형 국어 정채린
		}
	} else if (subject.value === 'M') {
		if (grade.value === 3) {
			lecTutorNo = '205' // 강의형 수학 나소은
		} else if (grade.value === 4) {
			lecTutorNo = '206' // 강의형 수학 전수진
		} else if (grade.value === 5) {
			lecTutorNo = '82' // 강의형 수학 서채은
		} else if (grade.value === 6) {
			lecTutorNo = '206' // 강의형 수학 전수진
		}
	} else if (subject.value === 'S') {
		if (grade.value === 3) {
			lecTutorNo = '94' // 강의형 사회 성하연
		} else if (grade.value === 4) {
			lecTutorNo = '90' // 강의형 사회 김완신
		} else if (grade.value === 5) {
			lecTutorNo = '230' // 강의형 사회 최한나
		} else if (grade.value === 6) {
			lecTutorNo = '229' // 강의형 사회 강재희
		}
	} else if (subject.value === 'N') {
		if (grade.value === 3) {
			lecTutorNo = '235' // 강의형 과학 김진희
		} else if (grade.value === 4) {
			lecTutorNo = '235' // 강의형 과학 김진희
		} else if (grade.value === 5) {
			lecTutorNo = '97' // 강의형 과학 홍희진
		} else if (grade.value === 6) {
			lecTutorNo = '231' // 강의형 과학 김설
		}
	} else if (subject.value === 'E') {
		if (grade.value === 3) {
			lecTutorNo = '236' // 강의형 영어 박정현
		} else if (grade.value === 4) {
			lecTutorNo = '85' // 강의형 영어 Bella
		} else if (grade.value === 5) {
			lecTutorNo = '86' // 강의형 영어 Julie
		} else if (grade.value === 6) {
			lecTutorNo = '236' // 강의형 영어 박정현
		}
	}

	if (tutorNo !== '') {
		const data = (await postData('/app_api/AppCommon/GetImageBuilderList_JSON', {
			ImageID: tutorNo,
			lec_ImageID: lecTutorNo,
		})) as any
		if (data && data.length > 0) {
			data[0].tutorNo = tutorNo
			cmnTeacherInfo.value = data[0]
			if (data.length > 1) {
				data[1].lecTutorNo = lecTutorNo
				lecTeacherInfo.value = data[1]
			}
		}
	}
}

const fnPopTutorInfo = (item: ITeacherInfo) => {
	popTeacherInfo.value = item
	isPopTeacherProfile.value = true
}

const html5Player = async (userid: string, mCode: string) => {
	const data = (await postData('/app_api/AppCommon/MulitPlayerCjAirContentRead', {
		strUserID: userid,
		strMCode: mCode,
	})) as any
	if (data != null && data.length > 0) {
		const item = data.find((m: any) => m)
		openHtml5Player(
			userid,
			mCode,
			item.LM_VALUE,
			// data[0].UpdateDate,
			// data[0].OP_VALUE,
			// data[0].TestYN,
			// data[0].TestStudyYN,
			// data[0].SimilarYN,
			// data[0].SimilarStudyYN,
			// data[0].ChallengeYN,
			// data[0].ChallengeStudyYN,
			// data[0].SttType,
			// data[0].SttModel,
		)
	}
}
const openHtml5Player = (userid: string, mCode: string, zipPath: string) => {
	if (typeof window?.HybridApp !== 'undefined') {
		console.log(window?.HybridApp)
	} else {
		const fileName = zipPath?.split('/')[zipPath?.split('/').length - 1].split('.')[0]
		const cbW = 1280
		const cbH = 800 + 55 + 5
		const cbUrl = `/dit/ele/${mCode}`
		if (/sm-p/i.test(window.navigator?.userAgent)) {
			if (typeof window.isherpa !== 'undefined' && typeof window.isherpatablet !== 'undefined') {
				window.isherpa.windowOpen(`${process.env.API_BASE_URL}ele/${mCode}`)
				return
			}
		}

		let xPos = document.body.offsetWidth / 2 - cbW / 2 // 가운데 정렬
		xPos += window.screenLeft // 듀얼 모니터일 때
		const yPos = window.screen.height / 2 - cbH / 2
		const wContPop = window.open(
			'',
			'hbapp_contents',
			`width=${cbW}, height=${cbH}, left=${xPos}, top=${yPos - 50}, scrollbars=no, menubar=no, status=no, titlebar=no, resizable=no`,
		)
		// wChatPop.window.document.body.innerHTML =
		// 	"<div class='loading' style='top: 40%; left: 42%; position: absolute !important;'><img src='https://cdndata.milkt.co.kr/mid/mapp/images/common/loading2.gif' alt='loading...' style='width:125px; height:125px;'></div>"
		if (document.querySelector(`form[target=hbapp_contents]`) != null) {
			document.querySelector(`form[target=hbapp_contents]`)?.remove()
		}
		const input = document.createElement('input')
		input.type = 'hidden'
		input.name = 'UserID'
		input.value = userInfo.value.UserID

		const frm = document.createElement('form')
		frm.setAttribute('method', 'post')
		frm.setAttribute('target', 'hbapp_contents')
		frm.setAttribute('action', cbUrl)
		frm.appendChild(input)

		document.body.appendChild(frm)
		frm.submit()

		let isCompletedCloseAction = false
		setTimeout(() => {
			// document.domain = 'milkt.co.kr'
			wContPop?.addEventListener('beforeunload', function () {
				if (!isCompletedCloseAction) {
					isCompletedCloseAction = true
					console.log('wContPop.beforeunload')
					fetchTextBookJindoList(
						grade.value,
						term.value,
						subject.value,
						ltype.value,
						userName.value,
						lChapter.value,
						Difficulty.value,
						SelBookType.value,
					)
				}
			})
			wContPop?.addEventListener('unload', function () {
				if (!isCompletedCloseAction) {
					isCompletedCloseAction = true
					console.log('wContPop.unload')
					fetchTextBookJindoList(
						grade.value,
						term.value,
						subject.value,
						ltype.value,
						userName.value,
						lChapter.value,
						Difficulty.value,
						SelBookType.value,
					)
				}
			})
		}, 1000)
	}
}
// eslint-disable-next-line camelcase
const StudyMenu_Log_Ins = (userid: string, mcode: string, menuname: string, playertype: string) => {
	try {
		const nowDate = new Date()
		const selDate = `${nowDate.getFullYear()}-${nowDate.getMonth() + 1 > 9 ? nowDate.getMonth() + 1 : '0' + (nowDate.getMonth() + 1).toString()}-${nowDate.getDate()}`
		postData('/app_api/AppCommon/StudyMenu_Log_Ins', {
			strUserID: userid,
			strMenuName: menuname,
			strSelDate: selDate,
			strMCode: mcode,
			strPlayerType: playertype,
		}) as any
	} catch (e) {
		console.log(e)
	}
}

const logout = () => {
	location.href = `${process.env.API_PILOT_SERVER_ELE}webapi/login/logout?returnUrl=${encodeURIComponent(location.href)}`
}

const reset = async (sysUserId: string, mCode: string) => {
	if (confirm('학습을 초기화 하시겠습니까?')) {
		const data = await contentsReset(sysUserId, mCode, 'ALL')
		// const data = await postData('/e_api/AppQuestionBank/SetContentsReset', {
		// 	sysUserId,
		// 	mCode,
		// 	lectureType: 'ALL',
		// })

		if (data) {
			alert('초기화 되었습니다.')
			fetchTextBookJindoList(
				grade.value,
				term.value,
				subject.value,
				ltype.value,
				userName.value,
				lChapter.value,
				Difficulty.value,
				SelBookType.value,
			)
		}
	}
}
</script>

<script lang="ts">
export default defineComponent({
	name: 'PageEle',
	layout: 'ele',
	middleware: ['check-auth', 'check-route'],
	head: {
		link: [
			{
				rel: 'stylesheet',
				href: 'css/common.css',
			},
			{
				rel: 'stylesheet',
				href: 'css/aiSubject.css',
			},
			{
				rel: 'stylesheet',
				href: 'css/jquery.selectbox.css',
			},
		],
		script: [
			{ src: '//cdndata.milkt.co.kr/ele/app/web-static-dev/js/jquery-1.7.min.js' },
			{ src: '//cdndata.milkt.co.kr/ele/app/web-static-dev/js/jquery.selectbox-0.2.js' },
			{ src: '//mapp.milkt.co.kr/js/isherpa.js' },
		],
	},
})
</script>

<template>
	<div id="content1" class="body_aiSubject">
		<header id="id_header" style="width: 100%">
			<div class="mainTit">AI 과목별 학교 공부</div>
			<div class="lnb">
				<div class="top">
					<div id="div_AiSelboxTop" class="session">
						<select
							id="top_selGrade"
							class="selectbox"
							tabindex="1"
							title="학기선택"
							downheight="296px"
							onchange="window.__NUXT__.selMenuItemChange"
							style="display: none"
						>
							<option
								v-for="(item, index) in [...Array(6)]"
								:key="index"
								:value="index + 1"
								:selected="index + 1 === grade"
							>
								{{ `${index + 1}학년` }}
							</option>
						</select>
					</div>
					<!--학년-->
					<ul id="div_LNB" class="depth1">
						<li
							v-for="(item, index) in subjectData.subjectItems"
							:id="`li_subject${item.Subject}`"
							:key="index"
							:order="item.RowNum"
							:class="{ on: item.Subject === subject }"
						>
							<a
								v-if="item.Subject !== 'W'"
								href="javascript:;"
								@click="Content_Load('TextBookJindo', item.Subject)"
								>{{ item.SubjectAliasName }}</a
							>
							<a
								v-else
								href="http://app.milkt.co.kr/AppSimwha?Page=CodingExpedition&strType=2&strPath=WEB&strGrade=3"
								>{{ item.SubjectAliasName }}</a
							>
						</li>
					</ul>
					<!--학년별 메뉴 -->
					<div>
						<div
							v-if="userInfo.UserID != null && userInfo.UserID !== ''"
							style="text-align: right; margin-left: 100px; font-size: 15px"
						>
							<span style="color: #ffffff; font-weight: bold; cursor: pointer" @click="logout"
								>로그아웃 {{ userInfo.UserID }}</span
							>
						</div>
					</div>
				</div>

				<div class="bottom">
					<ul id="ddl_Term" class="depth2">
						<li
							v-for="(item, index) in subjectData.subjectTerms"
							:key="index"
							:value="item.value"
							:class="{ on: item.value == term }" 							
						>
							<a href="javascript:;" @click="Term(item.value, item.ltype)" v-if="item.value=== 1"> {{ item.name }}</a>
						</li>
					</ul>
					<!--학기-->
					<div id="div_unit" class="session type2" style="display: block">
						<select
							id="unitList"
							class="selectbox"
							tabindex="1"
							title="단원선택"
							sb="53026273"
							style="display: none"
						>
							<option value="">전체 단원</option>
							<option v-for="(item, index) in unitItems" :key="index" :value="item.lChapter">
								{{ item.lTitle.indexOf('정리') == -1 ? `${item.lChapter}단원` : '정리' }}
							</option>
						</select>
					</div>
				</div>
			</div>
		</header>
		<div class="conbox">
			<article class="leftMenu">
				<div class="studyingBtn">
					<!-- [D] 교과서 정보(터치O) or 학습목표(터지X)에 따라 노출 부탁드립니다 !  -->
					<div id="nowCourse" style="display: none">
						<!--1학기에만 미노출 하면 됨.-->
						<button id="studyCourse" class="popupOpenBtn" data-popname="guide"></button>
					</div>
					<div id="subjectDesc" style="">
						<!--3,4,5,6학년 국수사과영 1학기에만 노출-->
						<p id="p_SubjectDesc" class="popupOpenBtn" data-popname="guide">
							<template v-if="subject === 'K'"> 개념과 지문을 꼼꼼하게 다지기 </template>
							<template v-else-if="subject === 'M'"> 교과 역량으로 생각의 힘 키우기 </template>
							<template v-else-if="subject === 'S'"> 풍부하고 생생한 자료로 개념 익히기 </template>
							<template v-else-if="subject === 'N'"> 통합적 사고와 이해력 키우기 </template>
							<template v-else-if="subject === 'E'"> 교과서 핵심 내용을 예문으로 익히기 </template>
							<template v-else-if="subject === 'T'"> 읽기와 글쓰기의 힘 기르기 </template>
							<template v-else-if="subject === 'L'"> 도덕적 사고 능력과 인성 기르기 </template>
						</p>
					</div>
				</div>
				<div class="list"  style="display:none;"> 
					<!-- 버튼 기능 없음 도덕, 독서논술-->
					<div v-if="['T', 'L'].includes(subject)" id="TLBox" class="thumbChar">
						<div>
							<div class="thumb">
								<img
									id="TLTeaher"
									:src="`//cdndata.milkt.co.kr/ele/app/images/mystudy/aiSubject/thumb_teacher/${cmnTeacherInfo.Image_Doc1}`"
									alt=""
								/>
							</div>
							<div class="name">
								<h2 id="TLTeacherName">{{ cmnTeacherInfo.ImageTitle }}</h2>
								<p id="TLTeacherInfo"></p>
							</div>
						</div>
					</div>
					<!--강의형-->
					<!--선생님 배경 컬러 : imgTch color A (기본), imgTch colorB (강의형)-->
					<div
						v-else-if="
							term == 1 && !['T', 'L', '0'].includes(subject) && [3, 4, 5, 6].includes(grade)
						"
						id="lecThumBtnBox"
						class="menuLect"
					>
						<ul id="div_Lec">
							<li
								:class="{ on: !['T_HONOR', 'T_Leader', 'T_Teacher_B'].includes(ltype) }"
								data-term="0"
							>
								<a
									id="commonThumBtn"
									href="javascript:;"
									class="popupOpenBtn"
									data-popname="teacher"
									@click="fnPopTutorInfo(cmnTeacherInfo)"
									><div class="imgTch colorA">
										<img
											id="CommonTeacherImg"
											:src="`//cdndata.milkt.co.kr/ele/app/images/mystudy/aiSubject/thumb_teacher/${cmnTeacherInfo.Image_Doc1}`"
											alt=""
										/></div></a
								><a href="javascript:;" class="lectBox" @click="leftMenuList()"
									><div class="sbj">
										<div id="commonTextBooktype" class="level">{{ cmnTeacherInfo.bookName }}</div>
										<p class="lName">교과서 기본 과정</p>
										<p id="CommonTeacherName" class="tName">
											{{ cmnTeacherInfo.ImageTitle }} <span> 선생님</span>
										</p>
									</div></a
								>
							</li>
							<li
								:class="{ on: ['T_HONOR', 'T_Leader', 'T_Teacher_B'].includes(ltype) }"
								:data-term="lecChgType"
							>
								<a
									id="lecThumBtn"
									href="javascript:;"
									class="popupOpenBtn"
									data-popname="teacher"
									@click="fnPopTutorInfo(lecTeacherInfo)"
									><div class="imgTch colorB">
										<img
											id="LecTeacherImg"
											:src="`//cdndata.milkt.co.kr/ele/app/images/mystudy/aiSubject/thumb_teacher/${lecTeacherInfo.Image_Doc1}`"
											alt=""
										/></div></a
								><a href="javascript:;" class="lectBox" @click="leftMenuList(lecChgType)"
									><div class="sbj">
										<div class="level">
											{{ `${grade}-${term} ${subjectName} ${subject === 'E' ? '교과서' : '교재'}` }}
										</div>
										<p v-if="['K', 'S', 'N'].includes(subject)" class="lName">
											우등생 {{ subjectName }}
										</p>
										<p v-if="subject === 'M'" class="lName">수학리더 기본</p>
										<p v-if="subject === 'E'" class="lName">선생님 자료 강의</p>
										<p id="LecTeacherName" class="tName">
											{{ lecTeacherInfo.ImageTitle }} <span> 선생님</span>
										</p>
									</div></a
								>
							</li>
						</ul>
					</div>
					<!-- 버튼형 -->
					<div v-else id="thumBtnBox" class="thumbTeacher">
						<button
							id="thumBtn"
							class="popupOpenBtn"
							data-popname="profile"
							@click="`fnPop_TutorInfo(${cmnTeacherInfo.tutorNo})`"
						>
							<!--onclick="fnPop_TutorInfo();"-->
							<div class="thumb">
								<img
									id="ThumTeacherImg"
									:src="`//cdndata.milkt.co.kr/ele/app/images/mystudy/aiSubject/thumb_teacher/${cmnTeacherInfo.Image_Doc1}`"
									alt=""
								/>
							</div>
							<div class="name">
								<h2 id="ThumTeacherName">
									<span>{{ cmnTeacherInfo.ImageTitle }}</span> 선생님
								</h2>
								<p id="ThumTeacherInfo" v-html="cmnTeacherInfo.ImageRedi_URL"></p>
							</div>
						</button>
					</div>
					<div class="menu">
						<ul id="div_Summer">
							<template v-if="term === 3 && !['T', 'L'].includes(subject) && grade !== 2">
								<li data-term="T_SUMMER_CM" :class="{ on: ltype === 'T_SUMMER_CM' }">
									<a href="javascript:;" @click="leftMenuList('T_SUMMER_CM')"
										><img
											src="//cdndata.milkt.co.kr/ele/app/images/mystudy/aiSubject/menu_icon03.png"
											alt=""
											height="31"
										/>{{ `${grade}-1 핵심개념` }}</a
									>
								</li>
								<li data-term="T_SUMMER_CT" :class="{ on: ltype === 'T_SUMMER_CT' }">
									<a href="javascript:;" @click="leftMenuList('T_SUMMER_CT')"
										><img
											src="//cdndata.milkt.co.kr/ele/app/images/mystudy/aiSubject/menu_icon04.png"
											alt=""
											width="35"
										/>{{ `${grade}-1 핵심문제` }}</a
									>
								</li>
								<li data-term="T_SUMMER_B" :class="{ on: ltype === 'T_SUMMER_B' }">
									<a href="javascript:;" @click="leftMenuList('T_SUMMER_B')"
										><img
											src="//cdndata.milkt.co.kr/ele/app/images/mystudy/aiSubject/menu_icon01.png"
											alt=""
											width="33"
										/>{{ `${grade}-2 기초과정` }}</a
									>
								</li>
							</template>
							<template
								v-else-if="term === 3 && ['L'].includes(subject) && [3, 4, 5, 6].includes(grade)"
							>
								<li data-term="0" class="on">
									<a href="javascript:;" @click="leftMenuList()"
										><img
											src="//cdndata.milkt.co.kr/ele/app/images/mystudy/aiSubject/menu_icon01.png"
											alt=""
											width="33"
										/>
										{{ `${grade}-1 기초과정` }}</a
									>
								</li>
							</template>
							<template
								v-else-if="
									!(term == 1 && !['T', 'L', '0'].includes(subject) && [3, 4, 5, 6].includes(grade))
								"
							>
								<li data-term="0" class="on">
									<a href="javascript:;" @click="leftMenuList()"
										><img
											:src="`//cdndata.milkt.co.kr/ele/app/images/mystudy/aiSubject/menu_icon0${[1, 2].includes(term) ? '2' : '1'}.png`"
											alt=""
											width="33"
										/>
										{{
											`${grade}-${term === 3 ? 2 : term === 4 ? 1 : term} ${[1, 2].includes(term) ? '기본' : '기초'}과정`
										}}</a
									>
								</li>
							</template>
						</ul>
						<!--단원 바인딩-->
					</div>
					<div class="bottomCont">
						<div class="completion">
							<div>
								<p id="div_status">60강 중 <span>0강 완료</span></p>
								<!--강의 수 바인딩-->
								<div class="progress" data-max="52" data-current="2">
									<!--?xml version="1.0" encoding="UTF-8" ?-->
									<svg
										id="_레이어_2"
										data-name="레이어 2"
										xmlns="http://www.w3.org/2000/svg"
										xmlns:xlink="http://www.w3.org/1999/xlink"
										viewBox="0 0 267.8 145.9"
									>
										<defs>
											<style>
												.cls-1 {
													stroke: #e7deff;
												}

												.cls-1,
												.cls-2 {
													fill: none;
													stroke-linecap: round;
													stroke-miterlimit: 10;
													stroke-width: 24px;
												}

												.cls-2 {
													stroke: url(#linear-gradient);
												}
											</style>
											<linearGradient
												id="linear-gradient"
												x1="0"
												y1="72.95"
												x2="267.8"
												y2="72.95"
												gradientUnits="userSpaceOnUse"
											>
												<stop offset="0" stop-color="#60f"></stop>
												web
												<stop offset=".99" stop-color="#bf3dff"></stop>
											</linearGradient>
										</defs>
										<g id="Layer_2" data-name="Layer 2">
											<path
												class="cls-1"
												d="M12,133.9C12,66.58,66.58,12,133.9,12s121.9,54.58,121.9,121.9"
											></path>
											<path
												class="cls-2"
												d="M12,133.9C12,66.58,66.58,12,133.9,12s121.9,54.58,121.9,121.9"
												style="stroke-dasharray: 392.5px"
											></path>
										</g>
									</svg>
									<img
										src="//cdndata.milkt.co.kr/ele/app/images/mystudy/aiSubject/progressCharacter.png"
										alt=""
										width="125"
									/>
								</div>
							</div>
						</div>
						<div class="popBtnGroup">
							<ul>
								<li>
									<button
										id="StudyGoal"
										onclick="javascript:StudyInfo_Layer('@studylist.Count');"
										style=""
									>
										<img
											src="//cdndata.milkt.co.kr/ele/app/images/mystudy/aiSubject/guidePopBtn.png"
											alt="학습 안내"
										/>
									</button>
								</li>
								<li id="RelatedStudy" style="display: none">
									<button onclick="javascript:Relation_Study();" class="linkBtn">
										<img
											src="//cdndata.milkt.co.kr/ele/app/images/mystudy/aiSubject/linkPopBtn.png"
											alt="관련 학습"
										/>
									</button>
								</li>
								<li id="MathRelatedStudy" style="">
									<button id="MathBtn" class="linkBtn">
										<img
											src="//cdndata.milkt.co.kr/ele/app/images/mystudy/aiSubject/linkPopBtn.png"
											alt="수학 관련 학습"
										/>
									</button>
									<div id="MathStudy" class="linkPopWrap">
										<a
											href="/AppHBMath?Page=AImaster_Fraction&amp;Sub=M&amp;Dep1=2&amp;Dep2=2&amp;Order=6&amp;strPath=WEB"
											>AI 분수/소수</a
										>
									</div>
								</li>
								<li id="BookReportLayerBTN" style="display: none">
									<button onclick="javascript:fnLnbRightShow();">
										<img
											src="//cdndata.milkt.co.kr/ele/app/images/mystudy/aiSubject/bookReportPopBtn.png"
											alt="독후감 쓰기"
										/>
									</button>
								</li>
								<!-- <li><button><img src="//cdndata.milkt.co.kr/ele/app/images/mystudy/aiSubject/bookReportPopBtn.png" alt="독후감 쓰기"> </button></li>
				<li><button><img src="//cdndata.milkt.co.kr/ele/app/images/mystudy/aiSubject/aiReportPopBtn.png" alt="AI 리포트"> </button></li> -->
							</ul>
						</div>
					</div>
				</div>
			</article>
			<article id="div_Content" class="lectureCont">
				<!-- AI수학 예외처리 #50506 -->

				<article id="cont_area_others" style="display: none">
					<div id="div_AwardView" class="today_noti" style="display: none"></div>

					<article class="lectureCont">
						<div id="ul_list" class="list listBox"></div>
					</article>

					<div id="no_LecList" class="vacation" style="display: none">
						<div class="inner">
							<div class="conL">
								<img
									src="//cdndata.milkt.co.kr/ele/app/images/mystudy/aiSubject/img_vacation_char.png"
									alt=""
								/>
							</div>
							<div class="conR">
								<p>
									<em id="em_NoEng"></em>에
									<br />
									단계별 맞춤 학습으로 영어 실력이 쑥쑥 커지는
									<br />
									<em>수준별 영어</em>에서 공부하세요!
								</p>
								<a href="/AppTallEnglish/Index" class="btnGoEng"
									><span><b>수준별 영어</b> 공부하러 가기</span></a
								>
							</div>
						</div>
					</div>
				</article>

				<!-- 안전한 생활-->
				<article id="cont_area_safelife" class="lectureCont" style="display: none">
					<div id="safety_list" class="cardList listBox type2"></div>
				</article>

				<!-- 카드형 리스트-->
				<article id="cont_area_season" class="lectureCont" style="display: none">
					<div id="season_list" class="cardList listBox"></div>
				</article>

				<!-- AI수학 AI국어(저학년) 예외처리 #50506 #116072-->
				<article id="cont_area_aiReport" class="lectureCont" style="">
					<div id="aiReport_lec_list" class="cardList listBox">
						<article v-for="(unitItem, unitIndex) in unitItems" :key="unitIndex">
							<div class="tit">{{ unitItem.lTitle }}</div>
							<ul>
								<li
									v-for="(item, index) in subjectData.textBookJindo.filter(
										m => m.lChapter === unitItem.lChapter,
									)"
									:key="index"
									style="z-index: 0"
								>
									<div class="thum">
										<a
											href="javascript:;"
											@click="
												html5Player(userName, item.mcode)
												StudyMenu_Log_Ins(userName, item.mcode, '과목별학교공부', 'HTML5_WEB')
											"
											><div class="img">
												<img
													v-if="item.MediaYN === 'N' && item.TestYN === 'N'"
													:src="`//cdndata.milkt.co.kr/ele/app/images/mystudy/aiSubject/thumb_ready.png`"
													alt="준비 중"
												/>
												<img
													v-else-if="
														item.AI_Sort == '1' && item.mTitle.indexOf('AI 오답 게임') === 0
													"
													:src="`//cdndata.milkt.co.kr/ele/app/images/mystudy/aiSubject/thumb_aiOdab.png`"
													alt="AI 오답 게임"
												/>
												<img
													v-else-if="
														item.mTitle.indexOf('단원 마무리 문제') === 0 ||
														item.mTitle.indexOf('1학기 마무리 문제') === 0 ||
														item.mTitle.indexOf('핵심 문제로 단원 정리하기') === 0
													"
													:src="`//cdndata.milkt.co.kr/ele/app/images/mystudy/aiSubject/thumb_test.png`"
													alt="단원 마무리 문제"
												/>
												<img
													v-else-if="item.AI_Sort == '3' || item.AI_Sort === '0'"
													:src="`//cdndata.milkt.co.kr/ele/app/images/mystudy/aiSubject/thumb_illust.png`"
													alt="AI 차시별 분석"
												/>
												<img
													v-else-if=" (item.Subject == 'S' || item.Subject == 'M' || item.Subject == 'N'|| item.Subject == 'E') &&  term == 1 && SelBookType !=''  "
													:src="`//cdndata.milkt.co.kr/ele/app/images/SH_BOOK_A${item.LecCode?.startsWith('T0') ? '10' : '11'}/${item.Subject}/${item.LecGrade}${term}/${item.mcode}_${SelBookType}.jpg`"
												/>
												<img
													v-else
													:src="`//cdndata.milkt.co.kr/ele/app/images/SH_BOOK_A${item.LecCode?.startsWith('T0') ? '10' : '11'}/${item.Subject}/${item.LecGrade}${term === 3 ? 'S' : term === 4 ? 'W' : term}/${item.mcode}.jpg`"
												/>
												<div class="num">
													<p>{{ index + 1 }}</p>
												</div>
												<div class="studying type1">
													<p>학습<br />하기</p>
												</div>
											</div>
											<div class="lectureName">
												<p v-if="item.AI_Sort == '3'">{{ item.mTitle }}</p>
												<p v-else>{{ item.mTitleInfro.substring(4) }} {{ item.mTitle }}</p>
											</div></a
										>
									</div>
									<div class="bar"></div>
									<div class="info">
										<div class="data">
											<div class="starPoint">
												<button
													onclick="javascript:fnOpenMarkScoreNewCase1(1,'T0ME31UAA001','어떻게 계산할까요?')"
													class="btnGradeStarC on"
												>
													-
												</button>
											</div>
											<div v-if="item.MediaStudyDate != null" class="date">
												학습일 {{ item.MediaStudyDate }}
												<img
													src="data:image/png;base64,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"
													style="width: 10px; height: 10px; cursor: pointer"
													@click.prevent="reset(userInfo.SysUserId, item.mcode)"
												/>
											</div>
											<div
												v-else-if="
													item.MediaYN.replace(/ /g, '') == 'N' &&
													item.TestYN.replace(/ /g, '') === 'N'
												"
												class="date"
											>
												학습일
												<span>{{
													item.L_StartDate != null && item.L_StartDate != ''
														? item.L_StartDate
														: '-'
												}}</span>
											</div>
											<div
												v-else-if="
													item.MediaYN.replace(/ /g, '') == 'Y' &&
													item.TestYN.replace(/ /g, '') === 'Y'
												"
												class="date"
											>
												학습일
												<span>{{
													item.TestStudyDate != null && item.TestStudyDate != ''
														? item.TestStudyDate
														: '-'
												}}</span>
											</div>
											<div v-else class="date none">학습일 <span>- -</span></div>
										</div>
									</div>
								</li>
							</ul>
						</article>
					</div>
				</article>

				<!--도덕 카드형 예외처리-->
				<div id="cont_area_ethics" style="display: none">
					<div class="cardList listBox">
						<article>
							<ul id="ethics_card"></ul>
						</article>
					</div>
				</div>
				<!--/cont_area -->
				<!-- // ask#39927 -->
			</article>
			<!--/sub -->
		</div>
		<div id="hbapp_contents"></div>
		<!--선생님 소개 팝업 -->
		<article
			v-if="isPopTeacherProfile"
			id="popTeacherProfile"
			class="popWrap teacher"
			data-popName="teacher"
			:style="{ display: isPopTeacherProfile ? 'block' : 'none' }"
		>
			<!-- [퍼블] 공통 팝업 [선생님 프로필] : 클래스 popWrap teacher로 맞춰주세요!! -->
			<div class="dim"></div>
			<div class="layout">
				<div class="popContents">
					<div class="popHeader flexBox">
						<div class="tit">
							<h3>
								<b id="teacherName">{{ popTeacherInfo.ImageTitle }} 선생님</b> 프로필
							</h3>
						</div>
					</div>
					<div class="popBody">
						<div class="contProf">
							<div class="imgProf">
								<img
									id="teacherImg"
									:src="`//cdndata.milkt.co.kr/ele/app/images/mystudy/aiSubject/thumb_teacher/${popTeacherInfo.Image_Doc1}`"
									alt=""
								/>
							</div>
							<!-- 선생님 스펙 : 어드민 영역 -->
							<div class="specProf">
								<ul id="teacherInfo" v-html="popTeacherInfo.ImageDesc"></ul>
							</div>
							<!-- / 선생님 스펙 : 어드민 영역 -->
						</div>
					</div>
					<button class="popupCloseBtn" @click="isPopTeacherProfile = false">닫기</button>
				</div>
			</div>
		</article>
		<!-- / 선생님 소개 팝업 -->
	</div>
</template>

<style>
#content1 {
	height: 725px !important;
	max-width: 1280px !important;
	position: relative !important;
	margin: 0 auto !important;
}
.center {
	text-align: center;
	margin-top: 0px;
	background-color: #ffffff;
}
/* .conbox {
	position: absolute !important;
	margin-top: 140px !important;
} */
.body_aiSubject .lectureCont {
	width: 105% !important;
	overflow: hidden;
}
</style>
