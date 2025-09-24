const dotenv = require('dotenv')
const path = require('path')
dotenv.config({ path: path.join(__dirname, `.env.${process.env.NODE_ENV}`) })

module.exports = {
	telemetry: false,
	ssr: true,
	target: 'server',
	css: [],
	head: {
		title: '천재교과서 밀크T',
		meta: [
			{ charset: 'utf-8' },
			// { 'http-equiv': 'X-UA-Compatible', content: 'IE=edge,chrome=1' },
			{ name: 'viewport', content: 'width=device-width, initial-scale=1' },
			{
				hid: 'description',
				name: 'description',
				content: 'A Multi device contents to start a Nuxt+TS project quickly',
			},
		],
		link: [
			{
				rel: 'shortcut icon',
				type: 'image/x-icon',
				href: '//cdndata.milkt.co.kr/mid/www/img/icon/favicon_32x32.ico',
			},
			// {
			// 	rel: 'stylesheet',
			// 	href: '//cdndata.milkt.co.kr/ele/www/web-static/css/common_v5.css',
			// },
		],
		script: [
			{ src: 'js/url-search-params.js' },
			{ src: 'js/ext-polyfill.js' },
			{ src: 'js/polyfill.min.js' },
			{ src: 'js/ext-apps.js?v=3' },
		],
	},
	env: {
		API_BASE_URL: process.env.API_BASE_URL,
		API_PILOT_SERVER: process.env.API_PILOT_SERVER,
		BASE_TARGET: process.env.BASE_TARGET,
		API_PILOT_SERVER_ELE: process.env.API_PILOT_SERVER_ELE,
		API_MILKT_APP_SERVER_ELE: process.env.API_MILKT_APP_SERVER_ELE,
		API_MILKT_APP_SERVER_ELE_EDUBASE: process.env.API_MILKT_APP_SERVER_ELE_EDUBASE,
		BASE_DIR: process.env.BASE_DIR,
		API_STT: process.env.API_STT,
		API_STT_KEY_ID: process.env.API_STT_KEY_ID,
		API_STT_KEY: process.env.API_STT_KEY,
	},
	plugins: [
		'~/plugins/jquery.client.js'
	],
	buildModules: ['@nuxtjs/composition-api/module', '@nuxt/typescript-build', '@pinia/nuxt'],
	modules: [
		'@nuxtjs/axios',
		'@nuxtjs/device',
		['@nuxtjs/dotenv', { filename: `.env.${process.env.NODE_ENV}`, systemvars: true }],
	],
	build: {
		publicPath: '/dit/_nuxt/',
		babel: {
			presets({ isServer }) {
				return [
					[
						require.resolve('@nuxt/babel-preset-app'),
						{
							buildTarget: isServer
								? { node: 'current' }
								: { browsers: ['last 2 versions'], ie: 11 },
							corejs: { version: 3 },
						},
					],
				]
			},
		},
		transpile: [
			({ isDev, isLegacy }) => isDev && isLegacy && 'ansi-regex',
			({ isDev, isLegacy }) => isDev && isLegacy && 'strip-ansi',
			'defu',
			'ufo',
			'vue',
			'pinia',
			'axios',
		],
		extend(cfg, ctx) {
			if (ctx.isDev) {
				cfg.devtool = ctx.isClient ? 'source-map' : 'inline-source-map'
			}
		},
	},
	// Hydration 문제 해결을 위한 설정
	render: {
		bundleRenderer: {
			shouldPreload: () => false,
		},
		// Hydration 오류 방지
		fallback: {
			dist: {
				index: '/dit/',
				assets: '/dit/_nuxt/'
			}
		}
	},
	// Vue 설정 - HierarchyRequestError 방지
	vue: {
		config: {
			productionTip: false,
			devtools: process.env.NODE_ENV === 'development',
		},
		compilerOptions: {
			// Hydration 오류 방지
			whitespace: 'condense',
			comments: false
		}
	},
	pinia: {
		storesDirs: ['./stores/**'],
	},
	axios: {
		proxy: true,
		baseURL: process.env.API_BASE_URL,
		proxyHeaders: false,
		credentials: false,
	},
	proxy: {
		'/dit/api/': {
			target: process.env.API_PILOT_SERVER,
			pathRewrite: { '/dit/api/': '/hbapp/api/' },
			changeOrigin: true,
		},
		'/dit/c_api/': {
			target: process.env.API_PILOT_SERVER,
			pathRewrite: { '/dit/c_api/': '/HTML_TEST/' },
			changeOrigin: true,
		},
		'/dit/e_api/': {
			target: process.env.API_PILOT_SERVER_ELE,
			pathRewrite: { '/dit/e_api/': '/webapi/' },
			changeOrigin: true,
		},
		'/dit/app_api/': {
			target: process.env.API_MILKT_APP_SERVER_ELE,
			pathRewrite: { '/dit/app_api/': '' },
			changeOrigin: true,
		},
		'/dit/app_edubase/': {
			target: process.env.API_MILKT_APP_SERVER_ELE_EDUBASE,
			pathRewrite: { '/dit/app_edubase/': '/webapi/' },
			changeOrigin: true,
		},
		'/dit/include/': {
			target: process.env.API_MILKT_APP_SERVER_ELE_EDUBASE,
			pathRewrite: { '/dit/include/': '/webapi/include/' },
			changeOrigin: true,
		},

		'/dit/AppLogin/': {
			target: process.env.API_MILKT_APP_SERVER_ELE_EDUBASE,
			pathRewrite: { '/dit/AppLogin/': '/webapi/AppLogin/' },
			changeOrigin: true,
		},

		'/dit/Edubank/': {
			target: process.env.API_MILKT_APP_SERVER_ELE_EDUBASE,
			pathRewrite: { '/dit/Edubank/': '/webapi/Edubank/' },
			changeOrigin: true,
		},
		'/dit/edubank/': {
			target: process.env.API_MILKT_APP_SERVER_ELE_EDUBASE,
			pathRewrite: { '/dit/edubank/': '/webapi/edubank/' },
			changeOrigin: true,
		},
		'/dit/HTML_TEST/': {
			target: process.env.API_MILKT_APP_SERVER_ELE_EDUBASE,
			pathRewrite: { '/dit/HTML_TEST/': '/webapi/HTML_TEST/' },
			changeOrigin: true,
		},
		'/dit//HTML_TEST/': {
			target: process.env.API_MILKT_APP_SERVER_ELE_EDUBASE,
			pathRewrite: { '/dit//HTML_TEST/': '/webapi/HTML_TEST/' },
			changeOrigin: true,
		},
		'/dit/stt/': {
			target: process.env.API_STT,
			pathRewrite: { '/dit/stt/': '/stt/' },
			changeOrigin: true,
			secure: false,
		},
		'/dit/hand/': {
			target: process.env.API_HAND,
			pathRewrite: { '/dit/hand/': '/' },
			changeOrigin: true,
			secure: false,
		},
		'/dit/image/': {
			target: process.env.IMAGE_FILE_EVENT,
			pathRewrite: { '/dit/image/': '/webdata1/CacheMilkt/Files_Event/' },
			changeOrigin: true,
			secure: false,
		},
	},
	router: {
		base: '/dit/',
		extendRoutes(routes, resolve) {
			// 에듀베이스 라우트 명시적 추가
			routes.push({
				path: '/ele/:id/edubase/:question',
				component: resolve(__dirname, 'pages/ele/_id/edubase/_question.vue')
			})
		}
	},
}
