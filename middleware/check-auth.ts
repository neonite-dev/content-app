import type { Context, Middleware } from '@nuxt/types'
import Cookies from 'universal-cookie'
import { useUserStore } from '../stores/user' // '@/stores/user'
import type { IUserInfo } from '../types/user' // @/types/user'

const checkAuthMiddleware: Middleware = (context: Context) => {
	const userStore = useUserStore()
	const { fetchUserInfo } = userStore
	if (process.server) {
		const cookies = new Cookies(context?.req?.headers?.cookie, { path: '/' }) //, { path: '/' }
		if (cookies.get('UserID') === undefined) {
			if (
				context?.req?.headers?.host?.includes('localhost') ||
				context?.req?.headers?.host?.includes('local-') ||
				context?.req?.headers?.host?.includes('l-')
			) {
				cookies.set('UserID', 'webdevj3')
				cookies.set('selTopGrade', 3)
				cookies.set('selTopTerm', 1)
				cookies.set('SysUserId', 'c6cc1f51-87a9-4d45-9dd4-af04434b4d0c')
				console.log(cookies.get('UserID'))
				fetchUserInfo({
					UserID: cookies.get('UserID'),
					Name: cookies.get('UserID'),
					Grade: cookies.get('selTopGrade'),
					selTopGrade: cookies.get('selTopGrade'),
					selTopTerm: cookies.get('selTopTerm'),
					SysUserId: cookies.get('SysUserId'),
				})
			} else {
				return context.redirect(
					`${process.env.API_PILOT_SERVER_ELE}webapi/login?returnUrl=${process.env.API_BASE_URL}ele`,
				)
			}
		} else {
			const val = cookies.getAll()
			const setValue = {
				UserID: val.UserID,
				Name: val.Name,
				NickName: val.NickName,
				Grade: val.Grade,
				Grade7: val.Grade7,
				selTopGrade: val.selTopGrade,
				selTopTerm: val.selTopTerm,
				Status: val.Status,
				StartPage: val.StartPage,
				MemberType: val.MemberType,
				LoginPath: val.LoginPath,
				GradeUpChk17: val.GradeUpChk17,
				JoinRouteName: val.JoinRouteName,
				SysUserId: val.SysUserId,
				LoginSessionId: val.LoginSessionId,
				LoginDateTime: val.LoginDateTime,
			} as IUserInfo
			fetchUserInfo(setValue)
		}
	}
}

export default checkAuthMiddleware
