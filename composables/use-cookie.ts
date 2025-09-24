import { useContext } from '@nuxtjs/composition-api'
import Cookies from 'universal-cookie'

export default function useCookie() {
	const ctx = useContext()
	const { cookies } = new Cookies(process.server ? ctx?.req?.headers?.cookie : document.cookie, {
		path: '/',
	}) as any
	return {
		cookies,
	}
}
