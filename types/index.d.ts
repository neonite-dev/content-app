import { defineComponent as defineComponent$1 } from '@nuxtjs/composition-api'
import { NuxtApp } from '@nuxt/types/app'
import { NuxtAxiosInstance } from '@nuxtjs/axios'
import { Pinia } from 'pinia'

declare module 'vue/types/vue' {
	interface Vue {
		$axios: NuxtAxiosInstance
	}
}

declare module '@nuxt/types' {
	interface NuxtAppOptions {
		$axios: NuxtAxiosInstance
		$pinia: Pinia
	}

	interface Context {
		$axios: NuxtAxiosInstance
		$pinia: Pinia
		userAgent?: string
		$state: any
		$device: any
	}
}
declare global {
	const $nuxt: NuxtApp
	const defineComponent: typeof defineComponent$1
	interface Window {
		HybridApp: any
		isherpa?: any
		isherpatablet?: any
		jQuery?: any
		goNum?: Function
		TempSave: Function
		submitPaper: Function
		WebViewTestReset: Function
		showOneProblem: (questionNumber: string) => void
		showAllProblem: () => void
		user_tstatus_check_date?: Date
		user_tstatus_check_date_timestamp?: number
		currentTime?: Date
		startTime?: Date
	}
}