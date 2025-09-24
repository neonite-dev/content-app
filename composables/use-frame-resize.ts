import { onMounted, onUnmounted, useContext } from '@nuxtjs/composition-api'

export const useFrameResize = () => {
	const ctx = useContext()
	onMounted(() => {
		if (typeof window === 'undefined') return
		// const div = document.querySelector('#contents') as HTMLDivElement
		const div = document.querySelector('#cont') as HTMLDivElement
		window.addEventListener('resize', resizeEvent)
		initScaleResize(div)
		setTimeout(() => initScaleResize(div), 100)
		setTimeout(() => initScaleResize(div), 3000)
	})

	onUnmounted(() => {
		if (typeof window === 'undefined') return
		window.removeEventListener('resize', resizeEvent)
	})
	function resizeEvent() {
		// const div = document.querySelector('#contents') as HTMLDivElement
		const div = document.querySelector('#cont') as HTMLDivElement
		fillDiv(div, true)
	}

	function initScaleResize(div: HTMLDivElement) {
		console.log(`initScaleResize===`)
		if (typeof window === 'undefined' || div == null) return
		fillDiv(div, true)
		addResizeEvt(div, 'resize', 0)
		
		
		// if ('onorientationchange' in window) {
		// 	console.log('Using orientationchange')
		// 	addResizeEvt(div, 'orientationchange', 500)
		// 	addResizeEvt(div, 'resize', 500)
		// } else if ('ondeviceorientation' in window) {
		// 	console.log('Using deviceorientation')
		// 	addResizeEvt(div, 'deviceorientation', 500)
		// 	addResizeEvt(div, 'resize', 500)
		// } else {
		// 	addResizeEvt(div, 'resize', 0)
		// }
	}

	function addResizeEvt(div: HTMLDivElement, evtName: string, delay: number) {
		console.log(`addResizeEvt===`)
		if (typeof window === 'undefined' || div == null) return
		window.addEventListener(evtName, function () {
			const proportional = true
			if (delay === 0) {
				fillDiv(div, proportional)
			} else {
				setTimeout(function () {
					fillDiv(div, proportional)
				}, delay)
			}
		})
	}

	function getMaxHeight(div: HTMLDivElement) {
		if (typeof window === 'undefined' || div == null) return
		let mHeight = div.offsetHeight
		div.childNodes.forEach((elm: any, i: any) => {
			const bufHeight = Math.max(elm.offsetHeight, elm.clientHeight, elm.scrollHeight)
			if (mHeight < bufHeight) {
				mHeight = bufHeight
			}
		})
		return mHeight
	}

	function fillDiv(div: HTMLDivElement, proportional?: boolean) {
		

		if (typeof window === 'undefined' || div == null) return
		if (!process.client) return
		// const { isMobile } = useDevice()
		const isMobile =
			ctx?.$device.isMobile ||
			/sm-p|iphone|ipad|ipod|android/i.test(window.navigator?.userAgent?.toLowerCase())

		
		const mHeight = getMaxHeight(div) || 0 // div.offsetHeight
		if (window.innerWidth > 1000) {
			if (isMobile) {
				const isP610 = /sm-p610/i.test(window.navigator?.userAgent?.toLowerCase())
				const perRate = isP610 ? 0.65 : 0.78
				const bufHeight = parseInt((parseFloat(mHeight.toString()) * perRate).toString())
				Object.assign(div.style, {
					'-webkit-transform': `translate(0px, 0px) scale3d(${perRate}, ${perRate}, 1)`,
					'-webkit-transform-origin': '0 0',
					width: `100%`,
					height: `${bufHeight}px`,
					paddingLeft: '13%',
				})
			} else {
				Object.assign(div.style, {
					'-webkit-transform': 'translate(0px, 0px) scale3d(1, 1, 1)',
					'-webkit-transform-origin': '0 0',
					width: `100%`,
					height: `${mHeight}px`,
				})
			}
			return
		}
		const availableWidth = window.innerWidth
		const scalePer = availableWidth / (isMobile ? 1280 : 1280) // 1280

		console.log(`fillDiv===`,isMobile)
		console.log(`isMobile : ${isMobile}`)
		console.log(`availableWidth : ${availableWidth}`)
		console.log(`scalePer : ${scalePer}`)
		scalePer
		Object.assign(div.style, {
			'-webkit-transform': 'translate(0px, 0px) scale3d(' + scalePer + ', ' + scalePer + ', 1)',
			'-webkit-transform-origin': '0 0',
			width: `${isMobile ? 1280 : 1280}px`,
		})
		if (mHeight != null) {
			Object.assign(div.style, {
				height: `${mHeight * scalePer}px`,
			})
		}
	}
}
