import type { Context, Middleware } from '@nuxt/types'

const checkRouteMiddleware: Middleware = (context: Context) => {
	const to = context?.route
	if (to) {
		if (to.params?.company !== undefined) {
			console.log('Middlewae companyId', to.params?.company)
			// useState('companyId', () => to.params.company)
		} else {
			// useState('companyId', () => '')
		}
		// if (to.params?.id !== undefined) {
		// 	console.log('Middlewae routeParamId', to.params.id)
		// 	useState('routeParamId', () => to.params.id)
		// } else {
		// 	useState('routeParamId', () => '')
		// }
	}
	// console.log(context?.app)
	// console.log(context?.route)
}

export default checkRouteMiddleware
