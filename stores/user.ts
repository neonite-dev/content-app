import type { IUserInfo } from '@/types/user'
import { defineStore } from 'pinia'

export const useUserStore = defineStore('userStore', {
	state: (): {
		userInfo: IUserInfo
	} => ({
		userInfo: {
			UserID: '',
			Name: '',
			NickName: '',
			Grade: 0,
			Grade7: 'N',
			selTopGrade: 0,
			selTopTerm: 0,
			Status: '',
			StartPage: '',
			MemberType: '',
			LoginPath: '',
			SysUserId: '',
			LoginSessionId: '',
			LoginDateTime: '',
			GradeUpChk17: '',
			JoinRouteName: '',
		},
	}),
	getters: {
		getUserInfo: state => state.userInfo,
	},
	actions: {
		fetchUserInfo(info: IUserInfo) {
			this.userInfo = info
		},
	},
})
