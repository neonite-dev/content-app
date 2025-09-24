<template>
  <div>
    <Frame :menus="menus" />
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, useRoute, watch, defineComponent } from '@nuxtjs/composition-api'
import { useMenusStore } from '@/stores/menus'
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'
import Frame from '@/components/contents/Frame.vue'
import type { IMenuState, MenuItem } from '@/types/menu'

// 컴포넌트 이름을 명시적으로 정의
defineComponent({
  name: 'EdubaseQuestionNo'
})

const route = useRoute()
const menusStore = useMenusStore()
const userStore = useUserStore()
const { userInfo } = storeToRefs(userStore)

// URL에서 차시코드와 문항번호 추출
const chapterCode = route?.value?.params?.id
const questionNumber = route?.value?.params?.questionNo

// menus 상태 초기화
const menus = ref<IMenuState>({
  menuGroups: [],
  menuItems: [],
  curMenuItem: {} as MenuItem,
  studyTitle: '',
  studyChapter: '',
  pid: chapterCode || '',
  mCode: chapterCode || '',
  isFirstLoadedMenu: false,
  isContinueStudy: false,
  isTestStudyComplete: false,
  lectureTitleInfo: {} as any,
  listMenuDatas: {
    ui_type: '',
    chapter: '',
    title: '',
    entry_app: false,
    test_title_type: 1,
    menuIdx: 0,
    cjMenuDatas: []
  },
  cjCurMenuData: {
    id: '999',
    type: 999,
    title: `문제 ${questionNumber}`,
    titleCode: '',
    filePath: '',
    smiPath: '',
    ebookPath: '',
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
    score: -1
  },
  netStudyInfo: [],
  configInfo: {} as any
})

onMounted(() => {
  console.log('🔥 questionNo.vue onMounted 시작')
  console.log('🔥 차시코드:', chapterCode)
  console.log('🔥 문항번호:', questionNumber)
  console.log('🔥 현재 라우트:', route.value)
  console.log('🔥 사용자 정보:', userInfo.value)
})

// 사용자 정보가 로드된 후 메뉴 데이터 로딩
watch(userInfo, async (newUserInfo) => {
  if (newUserInfo?.UserID && chapterCode) {
    try {
      console.log('🔥 사용자 정보 로드됨, 메뉴 데이터 로딩 시작')
      console.log('🔥 사용자 ID:', newUserInfo.UserID)
      console.log('🔥 차시코드:', chapterCode)
      
      // 차시코드로 메뉴 데이터 가져오기 (fetchMCodeData 사용)
      await menusStore.fetchMCodeData(newUserInfo.UserID, chapterCode)
      
      // 스토어에서 가져온 데이터로 menus 상태 업데이트
      const storeMenuData = menusStore.getMenuData
      if (storeMenuData) {
        // 필요한 속성만 선택적으로 할당 (숫자 키 제외)
        menus.value.menuGroups = storeMenuData.menuGroups || []
        menus.value.menuItems = storeMenuData.menuItems || []
        menus.value.studyTitle = storeMenuData.studyTitle || ''
        menus.value.studyChapter = storeMenuData.studyChapter || ''
        menus.value.pid = chapterCode
        menus.value.mCode = chapterCode
        menus.value.isFirstLoadedMenu = storeMenuData.isFirstLoadedMenu || false
        menus.value.isContinueStudy = storeMenuData.isContinueStudy || false
        menus.value.isTestStudyComplete = storeMenuData.isTestStudyComplete || false
        menus.value.curMenuItem = storeMenuData.curMenuItem || {} as MenuItem
        menus.value.lectureTitleInfo = storeMenuData.lectureTitleInfo || {} as any
        menus.value.listMenuDatas = storeMenuData.listMenuDatas || {
          ui_type: '',
          chapter: '',
          title: '',
          entry_app: false,
          test_title_type: 1,
          menuIdx: 0,
          cjMenuDatas: []
        }
        menus.value.cjCurMenuData = {
          ...menus.value.cjCurMenuData,
          id: '999',
          type: 999,
          title: `문제 ${questionNumber}`,
          filePath: '',
        }
        menus.value.netStudyInfo = storeMenuData.netStudyInfo || []
        menus.value.configInfo = storeMenuData.configInfo || {} as any
        
        console.log('🔥 메뉴 데이터 로드 완료:', menus.value)
      } else {
        console.warn('🔥 스토어에서 메뉴 데이터를 가져올 수 없습니다. 기본값으로 진행합니다.')
      }
    } catch (error) {
      console.error('🔥 메뉴 데이터 로드 실패:', error)
      console.warn('🔥 에러가 발생했지만 기본값으로 진행합니다.')
    }
  }
}, { immediate: true })
</script>

<script lang="ts">
export default defineComponent({
  name: 'EdubaseQuestionNo',
  middleware: ['check-auth', 'check-route'],
})
</script>