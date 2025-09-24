// if(typeof($) == 'undefined'){
//     var $ = {}
// }
function OnWebViewPause() {}

function OnWebViewResume() {}

function onActivityResult() {}

function onBackPressed() {
	if (location != null && location.href.toLowerCase().includes('chatbot')) {
		return { msg: encodeURI('AI 학습챗봇을 종료 하시겠습니까?'), url: '' }
	}
	return { msg: encodeURI('현재 화면을 닫으시겠습니까?'), url: '' }
}

// 음성인식 결과값
function onSttResult(jsonResult) {
	try {
		window.__NUXT__.state.voiceResult = jsonResult
		// console.log("onSttResult:" +  JSON.stringify(jsonResult))
		// if (jsonResult.code == '200') {
		// 	//성공
		// 	//$('#txt_Word').val(jsonResult.result)
		// } else {
		// 	alert(jsonResult.result)
		// }
	} catch (e) {
		console.log('onSttResult error:' + e.message)
		alert(e.message)
	}
}

// 음성인식 결과값
function onSttResultExt(jsonResult) {
	try {
		window.__NUXT__.state.voiceResult = jsonResult
		// console.log("onSttResultExt:" +  JSON.stringify(jsonResult))
		// if (jsonResult.code == '200') {
		// 	//성공
		// 	//$('#txt_Word').val(jsonResult.result)
		// } else {
		// 	alert(jsonResult.result)
		// }
	} catch (e) {
		console.log('onSttResultExt error:' + e.message)
		alert(e.message)
	}
}

function onContentFrameLoad(ifObj) {
	try {
		setTimeout(function () {
			if (ifObj && ifObj.contentWindow && ifObj.contentDocument) {
				var video = ifObj.contentDocument.querySelector('video')
				if (video && video.paused) {
					video.muted = true
					video.play()
					// video.muted = false
				}
			}
		}, 500)
	} catch (e) {
		console.log('onContentFrameLoad error:' + e.message)
		alert(e.message)
	}
}

function initLoadHybridApp() {
	if (!window.HybridApp) {
		window.HybridApp = {}
		window.HybridApp.getNowStatus = function () {
			return 1
		}
		window.HybridApp.getLastStep = function () {
			return 0
		}
		window.HybridApp.isContinueStudy = function () {
			return false
		}
	}
	var ifWin = document.querySelector('iframe').contentWindow
	if (!ifWin.HybridApp) {
		ifWin.HybridApp = {}
		ifWin.HybridApp.getNowStatus = function () {
			return 1
		}
		ifWin.HybridApp.getLastStep = function () {
			return 0
		}
		ifWin.HybridApp.isContinueStudy = function () {
			return false
		}
	}
	return window.HybridApp
}
