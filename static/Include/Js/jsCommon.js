// 실 vss
//<![CDATA[

//webview 키보드 제어 관련
//$(document).ready(function () {
//    $("input[type=text], textarea").bind("focus", function () { window.HybridApp.disableAppButton(); });
//    $("input[type=text], textarea").bind("blur", function () { window.HybridApp.ableAppButton(); });
//    return;
//});

// 로그인 체크
function loginchk(req_msg) {

	$.ajax({
		type: "post",
		url: "/AppLogin/WebFormsAuthCheck",
		data: "",
		success: function (data) {
			if (data.Return != "True") {
				if (req_msg != "") {
					LayerShow(req_msg, "LayerHide(undefined)");
				}
				location.href = "/AppLogin/Index";
			}
		}
	});

}

// 디바이스 체크
function fn_deviceCheck() {

	$.ajax({
		type: "post",
		url: "/AppLogin/DeviceCheck",
		data: "",
		success: function (data) {
			if (data == "N") {
				location.href = "/AppLogin/LogOut";
			}
		}
	});

}

// 날자체크
function dateCheck(cdate, fnYes, fnNo) {

	var td = new Date();
	var y = td.getFullYear() - 3;
	var m = (td.getMonth() + 1 < 10 ? "0" + (td.getMonth() + 1) : td.getMonth() + 1);
	var d = (td.getDate() < 10 ? "0" + td.getDate() : td.getDate());
	var fnY = fnText(fnYes);
	var fnN = fnText(fnNo);

	if (cdate < (y + "-" + m + "-" + d)) {
		LayerShowConfirmYesNo("이전 데이터를 조회 하시겠습니까?", fnY + "LayerConfirmHide();", fnN + "LayerConfirmHide();");
	} else {
		eval(fnY);
	}

}

function fnText(fn) {
	var t = "";
	fn.forEach(function (v, i, a) {
		if (a.length > 0) {
			if (a.length == 1) {
				t += v + "();";
			}
			else if (i == 0) {
				t += v + "(";
			} else if (i == (a.length - 1)) {
				t += "'" + v + "');";
			} else {
				t += "'" + v + "',";
			}
		}
	});
	return t;
}

var TempPkName = "";
var TempPkName2 = "";
var strModelNm = "";
var accessToken = "";

$(document).ready(function () {

	var userAgent = navigator.userAgent.toLowerCase();

	if (userAgent.indexOf("sm-p610") > -1) {
		strModelNm = "SM-P610";
	} else if (userAgent.indexOf("sm-p580") > -1) {
		strModelNm = "SM-P580";
	} else if (userAgent.indexOf("sm-p600") > -1) {
		strModelNm = "SM-P600";
	}

});


function chkNull(val) {
	if (val == "" || val == null || val == undefined || (val != null && typeof val == "object" && !Object.keys(val).length)) {
		return "";
	} else {
		return val;
	}
}

var strCompleteMCodeComm = "";

Date.prototype.getWeek = function () {
	var onejan = new Date(this.getFullYear(), 0, 1);
	//    return Math.ceil((((this - onejan) / 86400000) + onejan.getDay() + 1) / 7);
}

function Select_SetFocus(objSel, Selval) {
	setTimeout(function () {
		if (typeof (objSel) != undefined && objSel != undefined) {
			objSel.find("option[value='" + Selval + "']").attr("selected", true);
			objSel.find(".sbOptions li a").each(function () {
				var curRel = $(this).attr("rel");

				if (curRel == Selval) {
					$(this).addClass("sbFocus");
				}
				else {
					$(this).removeClass("sbFocus");
				}
			});
		}
	}, 500);
}

function FileDownLoad(strFilePathName) {
	try { window.HybridApp.FileOpen(strFilePathName); }
	catch (ex) { alert(ex); }
	return;
}

//공지사항 파일
function openNoticeFile(strFileName) {
	try { window.HybridApp.FileOpen(strFileName); }
	catch (ex) { alert(ex); }
	return;
}

// 영상 다운로드
function MediaFileDownLoad(mCode, path) {
	try { window.HybridApp.preliminaryOTMediaDownload(mCode, path); } // path : /sdcard/Download/milkT/middle_school_lecture
	catch (ex) { alert(ex); }
	return;
}


// 문제은행 버전체크로 수정 (171218 sik)
var Question_MCode = '';
var Question_pageType = '';
var Question_testType = '';
var Question_strComplete = '';
var Question_strPlayerLockYN = '';
var Question_Grdae = '';
var Question_Open = 'N'; // Y 일 경우 문제은행 띄우기
var Question_danCnt = '0';

function QuestionView(strGetMcode, pageType, testType, strComplete) {
	strCompleteMCodeComm = strGetMcode;

    /**
    * strGetMcode 강의코드
    * pageType 확인문제 type 확인 TEST,심화 SIMWHA,보충 BOGANG, 단원평가 DANWON, 오답 WRONG
    * testType 오답문제  확인 P, (심화,보충) B
    * strComplete 완강 여부 Y,N
    */
	try {
		if (typeof window.HybridApp.getVersionName == 'function') {

			TempPkName = "kr.hbstudy.apphbstudy";

			Question_MCode = strGetMcode;
			Question_pageType = pageType;
			Question_testType = testType;
			Question_strComplete = strComplete;

			//            // 성취도평가 겨울방학용
			//            // 2018.01.29 성치호 수정
			//            if (pageType == "S_Achieve") {
			//                if ($("#top_selGrade").val() != undefined) {
			//                    if ($("#top_selGrade").val().indexOf("_") > -1) {
			//                        Question_Grdae = ($("#top_selGrade").val().split("_")[0] * 1) + 1;
			//                    }
			//                }
			//                else {
			//                    Question_Grdae = (jsGetCookie("selTopGrade") * 1) + 1;
			//                }
			//            } else {
			//                Question_Grdae = jsGetCookie("selTopGrade");
			//            }

			//            // 2018.01.29 성치호 수정//

			Question_Grdae = jsGetCookie("selTopGrade");


			Question_Open = "Y";

			// ask#40398 MYLIBRARY 추가
			if (pageType == "Jindan" || pageType == "DANWON_E" || pageType == "ACHIEVE_E" || pageType == "MYLIBRARY" || pageType == "AI_TEST" || pageType == "AIMASTER_C") {  // 수준별 영어는 고학번 디자인으로 통일
				Question_Grdae = "6";
			}

			window.HybridApp.getVersionName(TempPkName);
		}
		else {
			LayerShow("밀크T의 새로운 버전이 오픈되었습니다.<br/>홈 화면에서 최신 버전으로 업데이트해주세요.", "LayerHide(null);");
		}

	} catch (ex) { alert(ex); }
	return;
}
function QuestionView2(strGetMcode, pageType, testType, strComplete, LecGrade) {

	strCompleteMCodeComm = strGetMcode;

	//임시
	if (strGetMcode == "Jindan") {
		strGetMcode = "Jindan1";
	}

    /**
    * strGetMcode 강의코드
    * pageType 확인문제 type 확인 TEST,심화 SIMWHA,보충 BOGANG, 단원평가 DANWON, 오답 WRONG
    * testType 오답문제  확인 P, (심화,보충) B
    * strComplete 완강 여부 Y,N
    * LecGrade 차시학년
    */
	try {
		if (typeof window.HybridApp.getVersionName == 'function') {

            TempPkName = "kr.hbstudy.apphbstudy";
            TempPkName2 = "";   // #113855 (다른 학습창 실행 오류 관련 초기화)

			Question_MCode = strGetMcode;
			Question_pageType = pageType;
			Question_testType = testType;
			Question_strComplete = strComplete;
			Question_Grdae = LecGrade;
			Question_Open = "Y";

			// ask#40398 MYLIBRARY 추가
			if (pageType == "Jindan" || pageType == "DANWON_E" || pageType == "ACHIEVE_E" || pageType == "MYLIBRARY") {  // 수준별 영어는 고학번 디자인으로 통일
				Question_Grdae = "6";
			}

			window.HybridApp.getVersionName(TempPkName);
		}
		else {
			LayerShow("밀크T의 새로운 버전이 오픈되었습니다.<br/>홈 화면에서 최신 버전으로 업데이트해주세요.", "LayerHide(null);");
		}

	} catch (ex) { alert(ex); }
	return;
}


function QuestionView_dan(strGetMcode, pageType, testType, strComplete, danCnt) {
	strCompleteMCodeComm = strGetMcode;

	//alert(Question_danCnt);
	//alert(danCnt);

    /**
    * strGetMcode 강의코드
    * pageType 확인문제 type 확인 TEST,심화 SIMWHA,보충 BOGANG, 단원평가 DANWON, 오답 WRONG
    * testType 오답문제  확인 P, (심화,보충) B
    * strComplete 완강 여부 Y,N
    */
	try {
		if (typeof window.HybridApp.getVersionName == 'function') {

			TempPkName = "kr.hbstudy.apphbstudy";

			Question_MCode = strGetMcode;
			Question_pageType = pageType;
			Question_testType = testType;
			Question_strComplete = strComplete;

			Question_Grdae = jsGetCookie("selTopGrade");
			Question_Open = "Y";

			Question_danCnt = danCnt;

			window.HybridApp.getVersionName(TempPkName);
		}
		else {
			LayerShow("밀크T의 새로운 버전이 오픈되었습니다.<br/>홈 화면에서 최신 버전으로 업데이트해주세요.", "LayerHide(null);");
		}

	} catch (ex) { alert(ex); }
	return;
}

function QuestionExit() {
	try { window.HybridApp.QuestionBankExit(); }
	catch (ex) { alert(ex); }
	return;
}

function openQnaPlayer(strUrl) {
	try { window.HybridApp.QnaPlayer(strUrl); }
	catch (ex) { alert(ex); }
	return;
}

function QnaPlayerExit() {
	try { window.HybridApp.QnaPlayerExit(); }
	catch (ex) { alert(ex); }
	return;
}

function openFlashPlayer(mCode, strValue, strTitle, strFile, strComplete, wideYN) {
	try { window.HybridApp.openFlashPlayer(mCode, strValue, strTitle, strFile, strComplete, wideYN, (jsGetCookie("selTopGrade") == jsGetCookie("Grade") ? "Y" : "N"), jsGetCookie("selTopGrade")); }
	catch (ex) { alert(ex); }
	return;
}

function openFlashPlayer2(mCode, strValue, strTitle, strFile, strComplete, wideYN, LecGrade) {
	try { window.HybridApp.openFlashPlayer(mCode, strValue, strTitle, strFile, strComplete, wideYN, (jsGetCookie("selTopGrade") == jsGetCookie("Grade") ? "Y" : "N"), LecGrade); }
	catch (ex) { alert(ex); }
	return;
}

function openFlashListPlayer(mcode, strValue, strTitle, strFile, strComplete, LecGrade) {
	try { window.HybridApp.openFlashListPlayer(mcode, strValue, strTitle, strFile, strComplete, (jsGetCookie("selTopGrade") == jsGetCookie("Grade") ? "Y" : "N"), LecGrade); }
	catch (ex) { alert(ex); }
	return;
}

var FlashPlayerZip_strFile = "";
var FlashPlayerZip_mCode = "";
var FlashPlayerZip_isPocket = true;
function openFlashPlayerZip(strFile, mCode) {
	try {
		if (typeof window.HybridApp.getVersionName == 'function') {

			TempPkName = "RAPIAirViewerApp3.0";
			FlashPlayerZip_strFile = strFile;
			FlashPlayerZip_mCode = mCode;

			window.HybridApp.getVersionName("com.remoteapi.smartviewer.air.RAPIAirViewerApp");
		}
		else {
			LayerShow("플래시뷰어의 새로운 버전이 오픈되었습니다.<br/>홈 화면에서 최신 버전으로 업데이트해주세요.", "LayerHide(null);");
		}
	}
	catch (ex) { alert(ex); }
	return;
    /*
    //try { window.HybridApp.openFlashPlayerZip(strFile); }
    try { window.HybridApp.openFlashPlayerZip(strFile, mCode); }
    catch (ex) { window.HybridApp.openFlashPlayerZip(strFile); }

    openZipFile_StudyHis_Ins(mCode, "N");

    return;
    */
}

function openFlashPlayerZip(strFile, mCode, isPocket) {
	try {
		if (typeof window.HybridApp.getVersionName == 'function') {

			TempPkName = "RAPIAirViewerApp3.0";
			FlashPlayerZip_strFile = strFile;
			FlashPlayerZip_mCode = mCode;
			FlashPlayerZip_isPocket = isPocket;

			window.HybridApp.getVersionName("com.remoteapi.smartviewer.air.RAPIAirViewerApp");
		}
		else {
			LayerShow("플래시뷰어의 새로운 버전이 오픈되었습니다.<br/>홈 화면에서 최신 버전으로 업데이트해주세요.", "LayerHide(null);");
		}
	}
	catch (ex) { alert(ex); }
	return;
    /*
    //try { window.HybridApp.openFlashPlayerZip(strFile); }
    try { window.HybridApp.openFlashPlayerZip(strFile, mCode); }
    catch (ex) { window.HybridApp.openFlashPlayerZip(strFile); }

    openZipFile_StudyHis_Ins(mCode, "N");

    return;
    */
}



var MultiPlayer_MCode = '';
var MultiPlayer_Complete = '';  // 완강 여부
var MultiPlayer_Integration = ''; // 통합 학습창 여부 (1~2학년 기존 / 3~6학년 통합)
var MultiPlayer_MediaYN = 'Y'; // 멀티플레이어(Y) or 미디어(N)

function openMultiPlayer(mCode) {
	try {
		MultiPlayer_Integration = "N";
		if (typeof window.HybridApp.getVersionName == 'function') {

            TempPkName = "com.remoteapi.smartviewer.air.RAPIAirViewerApp";
            TempPkName2 = "";

			MultiPlayer_MediaYN = "Y";
			MultiPlayer_MCode = mCode;

			window.HybridApp.getVersionName(TempPkName);
		}
		else {
			LayerShow("플래시뷰어의 새로운 버전이 오픈되었습니다.<br/>홈 화면에서 최신 버전으로 업데이트해주세요.", "LayerHide(null);");
		}
	}
	catch (ex) { alert(ex); }
	return;
}
function openMultiPlayerInte(mCode, strComplete) {
	try {
		MultiPlayer_Integration = "Y";
		if (typeof window.HybridApp.getVersionName == 'function') {

            TempPkName = "com.remoteapi.smartviewer.air.RAPIAirViewerApp";
            TempPkName2 = "";

			MultiPlayer_MediaYN = "Y";
			MultiPlayer_MCode = mCode;
			MultiPlayer_Complete = (strComplete == "1" || strComplete == "Y" ? "Y" : "N");

			window.HybridApp.getVersionName(TempPkName);
		}
		else {
			LayerShow("플래시뷰어의 새로운 버전이 오픈되었습니다.<br/>홈 화면에서 최신 버전으로 업데이트해주세요.", "LayerHide(null);");
		}
	}
	catch (ex) { alert(ex); }
	return;
}

var Media_MCode = '';
var Media_Grade = '';
var Media_LockYN = 'N';
var Media_NuriYN = 'Y';

function openMediaPlayer(mCode, PlayerLockYN, NuriYN) { //1709_누리동화_추가
	try {
		if (typeof window.HybridApp.getVersionName == 'function') {
			TempPkName = "com.remoteapi.smartviewer.air.RAPIAirViewerApp";

			MultiPlayer_MediaYN = "N";
			Media_MCode = mCode;
			Media_LockYN = PlayerLockYN;
			Media_NuriYN = NuriYN;

			window.HybridApp.getVersionName(TempPkName);
		}
		else {
			LayerShow("플래시뷰어의 새로운 버전이 오픈되었습니다.<br/>홈 화면에서 최신 버전으로 업데이트해주세요.", "LayerHide(null);");
		}
	}
	catch (ex) { alert(ex); }
	return;
}

// 뉴턴키즈 오픈
function OpenNewtonKids(step, num) {

	startExternalApp("media.chunjae.newtonact", "milkt://newtonkids?step=" + step + "&booknum=" + num);
}

//버터몬 앱실행
function OpenButtorMon(mcode) {

	if (mcode == null) mcode = "";


	//if (!/sm-p600/i.test(navigator.userAgent)) {
	//}

	if (strModelNm == "SM-P600") {
		LayerShow('사용중인 기기로는 이용이 불가한 서비스입니다.', "LayerHide(null);");
	}
	else
	{
		startExternalApp("com.milkt.buttermon", "milkt_buttermon://post_main?sys_id=" + jsGetCookie('SysUserId') + "&user_id=" + jsGetCookie('UserID') + "&user_name=" + jsGetCookie_urlDecode('Name') + "&grade=" + jsGetCookie('Grade') + "&mCode=" + mcode);
	}

	//alert(jsGetCookie_urlDecode('Name'));
	//alert("milkt_buttermon://post_main?sys_id=" + jsGetCookie('SysUserId') + "&user_id=" + jsGetCookie('UserID') + "&user_name=" + jsGetCookie_urlDecode('Name') + "&grade=" + jsGetCookie('Grade') + "&mCode=" + mcode);

}

// 매일보는 동화 생각놀이 20180810 zino
function OpenMailDonghwa(userid, mCode, completeYn, Cha) {
	//startExternalApp("com.chunjae.donghwa1", "milkt://donghwa1?serverUrl=test-app.milkt.co.kr&filePath=cdata.milkt.co.kr/edubank/Donghwa&userId=" + userid + "&mCode=" + mCode + "&completeYn=" + completeYn);
	startExternalApp("com.chunjae.donghwa" + Cha, "milkt://donghwa" + Cha + "?serverUrl=" + getAppHost() + "&filePath=pd.onetimetest.gscdn.com:8080/onetime/milkT/app/Services/2018/DailyStory&userId=" + userid + "&mCode=" + mCode + "&completeYn=" + completeYn);
}

//function openMediaPlayer(mCode) {
//    try { window.HybridApp.openMediaPlayer(mCode, jsGetCookie("selTopGrade")); }
//    catch (ex) { alert(ex); }
//    return;
//}
function openMediaPlayer2(mCode, LecGrade) {
    try {
        TempPkName = "kr.hbstudy.apphbstudy";
        Media_MCode = mCode;
        Media_Grade = LecGrade;
        TempPkName2 = "MediaCheck";

        window.HybridApp.getVersionName(TempPkName);
    }
    catch (ex) {
        alert(ex);
    }
}




var Media_Cha = '0'; // 매일보는 동화 차수 전역 변수 zino 2018-09-14
// 매일보는 동화 라피에어 호출 함수 zino 2018-09-14
function openMediaEveryday(mCode, PlayerLockYN, NuriYN, Cha) {
	Media_Cha = Cha;
	try {
		if (typeof window.HybridApp.getVersionName == 'function') {
			TempPkName = "com.remoteapi.smartviewer.air.RAPIAirViewerApp";
			MultiPlayer_MediaYN = "N";
			Media_MCode = mCode;
			Media_LockYN = PlayerLockYN;
			Media_NuriYN = NuriYN;
			window.HybridApp.getVersionName(TempPkName);
		}
		else {
			LayerShow("플래시뷰어의 새로운 버전이 오픈되었습니다.<br/>홈 화면에서 최신 버전으로 업데이트해주세요.", "LayerHide(null);");
		}
	}
	catch (ex) { alert(ex); }
	return;
}

function openMediaPlayer_Rest(strCvalue, strTitle, strUrl) {
    /*
    strUrl 영상 경로
    strCvalue 타이틀, strTitle 타이틀
    */

	try { window.HybridApp.openMediaPlayer_Rest(strCvalue, strTitle, strUrl, jsGetCookie("Grade")); }
	catch (ex) { alert(ex); }
	return;
}
function openCSPlayer(title, csCode) {
	try { window.HybridApp.openCSPlayer(title, csCode, jsGetCookie("selTopGrade")); }
	catch (ex) { alert(ex); }
	return;
}

function openHanjaPlayer(userid, mCode) {
	//alert("개발중")
	try { startExternalApp("kr.co.chunjae.android.hanjapad", "milkt://hanjapad?UserName=" + userid + "&mCode=" + mCode); }
	catch (ex) { alert(ex); }
	return;
}



var cjAir_Userid = "";
var cjAir_mCode = "";
var cjAir_zipPath = "";
var cjAir_zipDate = "";
var cjAir_optionPath = "";
var cjAir_testYN = "";
var cjAir_CoreWord = "";
var cjAir_movieControl = "";
var cjAir_swfControl = "";
var cjAir_SysUserid = "";
function openCjAirPlayer(userid, mCode, zipPath, zipDate, optionPath, CoreWord) {

	//    //var a = "koo3";     // 아이디
	//    //var b = "T9ME31U01017";  // 차시코드
	//    //var c = "http://cdata.hbstudy.co.kr/hbstudy/flash/MultiPlayer/A10/TT/J/11/001/KKJ120202/KKJ120202.zip";   // zip 파일 경로
	//    //var d = "2017/06/14/02/29/52";   // zip파일 생성일
	//    //var e = "http://cdata.hbstudy.co.kr/hbstudy/flash/MultiPlayer/default_option.xml"; // option 파일 경로
	//    //var f = "false";         // test 여부
	//    //var g = "사고,149|효종,150";   // 용어사전 정보( name,index|name,index.. )
	//    //var h = "auto";           // 영상 컨트롤 사용 여부
	//    //var i = "auto";           // swf 애니메이션 컨트롤 사용 여부

	//    //startExternalApp("air.kr.co.chunjae.android.cjairplayer", "milkt://cjairplayer?id=" + a + "&mCode=" + b + "&zipPath=" + c + "&createdDate=" + d + "&optionPath=" + e + "&test=" + f + "&dictionary=" + g + "&movieControl=" + h + "&swfControl=" + i);

	//    //alert(userid + " _ " + mCode + " _ " + zipPath + " _ " + zipDate + " _ " + optionPath + " _ " + CoreWord);

	//    try { startExternalApp("air.kr.co.chunjae.android.cjairplayer", "milkt://cjairplayer?id=" + userid + "&mCode=" + mCode + "&zipPath=" + zipPath + "&createdDate=" + zipDate + "&optionPath=" + optionPath + "&test=" + testYN + "&dictionary=" + CoreWord + "&movieControl=" + movieControl + "&swfControl=" + swfControl); }

	//    catch (ex) { alert(ex); }
	//    return;

	try {
		var testYN = "false";       // 테스트여부 (테스트서버:true, 운영서버:false)
		var movieControl = "auto";  // 영상 컨트롤 사용 여부
		var swfControl = "auto";    // swf 애니메이션 컨트롤 사용 여부
		if (isDevelopment()) {
			testYN = "true";
		}

		if (typeof window.HybridApp.getVersionName == 'function') {
			TempPkName = "air.kr.co.chunjae.android.cjairplayer";
			cjAir_Userid = userid;
			cjAir_mCode = mCode;
			cjAir_zipPath = zipPath;
			cjAir_zipDate = zipDate;
			cjAir_optionPath = optionPath;
			cjAir_testYN = testYN;
			cjAir_CoreWord = CoreWord;
			cjAir_movieControl = movieControl;
			cjAir_swfControl = swfControl;
			window.HybridApp.getVersionName(TempPkName);
		}
		else {
			LayerShow("플래시뷰어의 새로운 버전이 오픈되었습니다.<br/>홈 화면에서 최신 버전으로 업데이트해주세요.", "LayerHide(null);");
		}
	}
	catch (ex) { alert(ex); }
	return;
}

// cjAirPlayer 2.0 버전
var cjAir2_Userid = "";
var cjAir2_mCode = "";
var cjAir2_zipPath = "";
var cjAir2_zipDate = "";
var cjAir2_optionPath = "";
var cjAir2_testYN = "";
var cjAir2_CoreWord = "";
var cjAir2_movieControl = "";
var cjAir2_swfControl = "";
var cjAir2_edubase = "";
var cjAir2_testStudy = "";
function openCjAirPlayer2(userid, mCode, zipPath, zipDate, optionPath, CoreWord, edubase, testStudy) {

	try {
		var testYN = "false";        // 테스트여부 (테스트서버:true, 운영서버:false)
		var movieControl = "auto";  // 영상 컨트롤 사용 여부
		var swfControl = "auto";    // swf 애니메이션 컨트롤 사용 여부
		if (isDevelopment()) {
			testYN = "true";
		}

		if (typeof window.HybridApp.getVersionName == 'function') {
			TempPkName = "air.kr.co.chunjae.android.cjairplayer2";
			cjAir2_Userid = userid;
			cjAir2_mCode = mCode;
			cjAir2_zipPath = zipPath;
			cjAir2_zipDate = zipDate;
			cjAir2_optionPath = optionPath;
			cjAir2_testYN = testYN;
			cjAir2_CoreWord = CoreWord;
			cjAir2_movieControl = movieControl;
			cjAir2_swfControl = swfControl;
			cjAir2_edubase = edubase;
			cjAir2_testStudy = testStudy;
			window.HybridApp.getVersionName(TempPkName);
		}
		else {
			LayerShow("플래시뷰어의 새로운 버전이 오픈되었습니다.<br/>홈 화면에서 최신 버전으로 업데이트해주세요.", "LayerHide(null);");
		}
	}
	catch (ex) { alert(ex); }
	return;
}

// Html5 Player (#20527 sik)
var html5_Userid = "";				// 회원 아이디
var html5_mCode = "";				// 차시코드
var html5_zipPath = "";				// zip 파일 경로
var html5_zipDate = "";				// zip 파일 생성일
var html5_optionPath = "";			// 옵션 파일 경로
var html5_testYN = "";				// 테스트/운영 서버
var html5_movieControl = "";		// 영상 컨트롤
var html5_swfControl = "";			// swf 애니메이션 컨트롤
var html5_edubase = "";				// 에듀베이스 존재 여부
var html5_testStudy = "";			// 문제 완강 여부
var html5_similarTest = "";			// 유사문제 존재 여부
var html5_similarStudy = "";			// 유사문제 완강 여부
var html5_challengeTest = "";		// 도전문제 존재 여부
var html5_challengeStudy = "";		// 도전문제 완강 여부
var html5_sttType = "";				// 음성인식 공통앱 패키지 구분
var html5_sttModel = "";				// 음성인식 모델
function openHtml5Player(userid, mCode, zipPath, zipDate, optionPath, edubase, testStudy, similar, similarStudy, challenge, challengeStudy, sttType, sttModel) {
    /*
    var a = "koo3";     // 아이디
    var b = "T0KE31U01001";  // 차시코드
    var c = "http://cdata.hbstudy.co.kr/hbstudy/solution/html5.zip";   // zip 파일 경로
    var d = "2017/11/02/01/00/02";   // zip파일 생성일
    var e = "http://cdata.hbstudy.co.kr/hbstudy/flash/MultiPlayer/default_option.xml"; // option 파일 경로
    var f = "true";         // test 여부
    var g = "사고,149|효종,150";   // 용어사전 정보( name,index|name,index.. )
    var h = "auto";           // 영상 컨트롤 사용 여부
    var i = "auto";           // swf 애니메이션 컨트롤 사용 여부
    var j = "Y";              // 문제은행 표시 여부
    var k = "N"; // "N";              // 문제채점 여부


    startExternalApp("kr.co.chunjae.android.cjhtmlplayer", "milkt://cjhtmlplayer?id=" + a + "&mCode=" + b + "&zipPath=" + c + "&createdDate=" + d + "&optionPath=" + e + "&test=" + f + "&dictionary=" + g + "&movieControl=" + h + "&swfControl=" + i + "&edubase=" + j + "&testStudy=" + k);

    */
	try {
		var testYN = "R";        // 테스트여부 (테스트서버:T, 스테이징서버:S, 운영서버:R)

		if (isDevelopment()) {
			testYN = "T";
		} else if (isStaging()) {
			testYN = "S";
		}

		var movieControl = "auto";  // 영상 컨트롤 사용 여부
		var swfControl = "auto";    // swf 애니메이션 컨트롤 사용 여부

		if (typeof window.HybridApp.getVersionName == 'function') {
			// #76030 / "kr.co.chunjae.android.cjhtmlplayer"; // 610 분리 처리
			if (strModelNm == 'SM-P610') {
				$.ajax({
					url: "/AppCommon/GetPackageNameLCMS",
					type: "post",
					datatype: "json",
					async: false,
					data: ({ strMCode: mCode }),
					success: function (data, status) {
						//alert("openHtml5Player 610 LCMS 0 : " + data[0]["LCMS_PackageName"]);
						if (data != false) {
							if (data[0]["LCMS_PackageName"] == "kr.co.chunjae.android.cjhtmlplayer") {
								TempPkName = "kr.co.chunjae.android.cjhtmlplayer";
								//alert("openHtml5Player 610 크로스웩웹뷰 : " + TempPkName);
							}
							else {
								TempPkName = data[0]["LCMS_PackageName"];
								//alert("openHtml5Player 610 시스템웹뷰 : " + TempPkName);
							}
						}

						html5_Userid = userid;
						html5_mCode = mCode;
						html5_zipPath = zipPath;
						html5_zipDate = zipDate;
						html5_optionPath = optionPath;
						html5_testYN = testYN;
						html5_movieControl = movieControl;
						html5_swfControl = swfControl;
						html5_edubase = edubase;
						html5_testStudy = testStudy;
						html5_similarTest = similar;
						html5_similarStudy = similarStudy;
						html5_challengeTest = challenge;
						html5_challengeStudy = challengeStudy;
						html5_sttType = sttType;
						html5_sttModel = sttModel;
						window.HybridApp.getVersionName(TempPkName);
					}
				});
			}
			else {
				TempPkName = "kr.co.chunjae.android.cjhtmlplayer";
				html5_Userid = userid;
				html5_mCode = mCode;
				html5_zipPath = zipPath;
				html5_zipDate = zipDate;
				html5_optionPath = optionPath;
				html5_testYN = testYN;
				html5_movieControl = movieControl;
				html5_swfControl = swfControl;
				html5_edubase = edubase;
				html5_testStudy = testStudy;
				html5_similarTest = similar;
				html5_similarStudy = similarStudy;
				html5_challengeTest = challenge;
				html5_challengeStudy = challengeStudy;
				html5_sttType = sttType;
				html5_sttModel = sttModel;
				window.HybridApp.getVersionName(TempPkName);
			}
		}
		else {
			LayerShow("플래시뷰어의 새로운 버전이 오픈되었습니다.<br/>홈 화면에서 최신 버전으로 업데이트해주세요.", "LayerHide(null);");
		}
	}
	catch (ex) { alert(ex); }
	return;
}

function IntegrationPlayer(mCode, mComplete) {
	try {
		if (typeof window.HybridApp.getVersionName == 'function') {

			window.HybridApp.IntegrationPlayer(mCode, 'TEST', 'P', mComplete); // 학습창 통합 (강의+확인문제)

			externalAppPackage = 'kr.hbstudy.apphbstudy';
			externalAppScheme = 'window.HybridApp.IntegrationPlayer';
			externalAppContentId = mCode;

		}
		else {
			LayerShow("플래시뷰어의 새로운 버전이 오픈되었습니다.<br/>홈 화면에서 최신 버전으로 업데이트해주세요.", "LayerHide(null);");
		}
	}
	catch (ex) { alert(ex); }
	return;
}


function openPDFDown_Viewer(strUrl, strFileName) {
	try { window.HybridApp.downloadPDF(strUrl, strFileName); }
	catch (ex) { alert(ex); }
	return;
}


function startExternalApp(package, url) {
	try { window.HybridApp.startExternalApp(package, url); }
	catch (ex) { alert(ex); }
	return;
}



function openAppBook() {
	try { window.HybridApp.startSanta(); }
	catch (ex) { alert(ex); }
	return;
}


function openVocaPlayer(mCode) {
	try { window.HybridApp.openHMHVoca(mCode); }
	catch (ex) { alert(ex); }
}
function openReadPlayer(mCode) {
	try { window.HybridApp.openHMHReading(mCode); }
	catch (ex) { alert(ex); }
}
function openQuizPlayer(mCode) {
	try { window.HybridApp.openHMHQuiz(mCode); }
	catch (ex) { alert(ex); }
}

//웹 -> 셀바스
function openEngEBook(strUrl) {
    try {
        TempPkName = "kr.co.chunjae.android.engbookviewer";
        engBookUrl = strUrl;
        window.HybridApp.getVersionName(TempPkName);
    }
    catch (ex) { alert(ex); }
}

//웹 -> 퀴즈(완독되어 바로 실행)
function openQuiz(mCode, llevel) {
    try {
        TempPkName = "kr.co.chunjae.android.hmhwebapp";
        ebook_mCode = mCode;
        ebook_level = llevel;
        window.HybridApp.getVersionName(TempPkName);
    }
    catch (ex) { alert(ex); }
}

//퀴즈창 -> 셀바스로 back
function openEbookQuiz(mCode, mGrade, strUrl) {
    try { window.HybridApp.openEBookPlayer(mCode, mGrade, strUrl); }
    catch (ex) { alert(ex); }
}


function completeStudy(requstCode, reVal) {
	//App에서 호출 되는 메소드
	//requstCode 0멀티 1플래쉬 2영상
	//reVal 0 : 완강 1 : 미완강
	//alert("common completeStudy :  || rc : " + requstCode + " || re :" + reVal);
	//영역별수학_단원별보충학습

	if (requstCode == "3") {
		if ((typeof (ListViewReload) == "object" || typeof (ListViewReload) == "function")) {
			ListViewReload();
		}

		if (reVal == "0") {
			//영역별수학_단원별 보충학습_보충문제 완료시 여기탄다.
			BestChef_Event2StudyCnt();
		}
	}
	else {
		if (parseInt(reVal, 10) >= 0) {
			if ((typeof (InsertCompleteReload) == "object" || typeof (InsertCompleteReload) == "function")) {
				InsertCompleteReload(reVal);
			}
		}
	}
}


function insertStudyHis(strMCode, func) {
	//loginchk("다시 로그인 해주세요.");
	$.ajax({
		url: "/AppCommon/StudyComplete",
		type: "post",
		data: ({ mCode: strMCode }),
		success: function (data) {

			//            if (data == "1") {
			//
			//            }
			//            else {
			//                alert("오류!!");
			//            }
		},
		complete: function () {
			eval(func);
			BestChef_Event2StudyCnt();

			// 달려라달려 이벤트 (문제)
			//Event_RunAnimalInsert(strMCode);

			// 12월학습 이벤트 (문제)
			//Event_171204_Insert(strMCode);
		}
	});
}

function HanjaNoteComplete(strMCode, func) {
	$.ajax({
		url: "/AppCommon/HanjaComplete",
		type: "post",
		data: ({ mCode: strMCode }),
		success: function (data) {
		},
		complete: function () {
			eval(func);
		}
	});
}

//e-book
function openEBook(strUrl) {
	try { window.HybridApp.openEBook(strUrl); }
	catch (ex) { alert(ex); }
	return;
}
//SmartBookClub // 220613 중초프리패스 사용자 차단
function openSmartBook() {
	funcFreeMemberCheck();// #114874 프리패스 입장제한
	if (objFreeMemberCheck.states == "03") {
		LayerShow('밀크T프리패스 학습생은 이용할 수 없는 메뉴 입니다', "LayerHide();");
	} else {
		if (typeof window.HybridApp.getVersionName == 'function') {
			TempPkName = "kr.co.chunjae.android.bookclub";
			window.HybridApp.getVersionName(TempPkName);
		}
		else {
			LayerShow("천재북클럽의 새로운 버전이 오픈되었습니다.<br/>홈 화면에서 최신 버전으로 업데이트해주세요.", "LayerHide(null);");
		}
	}
}

//한글카드
function openKorCard(Userid, strMCode) {
	if (typeof window.HybridApp.getVersionName == 'function') {
		TempPkName = "com.milkt.card";
		Extra_userID = Userid;
		Extra_lmValue = strMCode;
		window.HybridApp.getVersionName(TempPkName);
	}
	else {
		LayerShow("한글카드의 새로운 버전이 오픈되었습니다.<br/>홈 화면에서 최신 버전으로 업데이트해주세요.", "LayerHide(null);");
	}
}
//한글사진
function openKorPhoto(Userid, strMCode) {
	if (typeof window.HybridApp.getVersionName == 'function') {
		TempPkName = "com.milkt.camera";
		Extra_userID = Userid;
		Extra_lmValue = strMCode;
		window.HybridApp.getVersionName(TempPkName);
	}
	else {
		LayerShow("한글사진의 새로운 버전이 오픈되었습니다.<br/>홈 화면에서 최신 버전으로 업데이트해주세요.", "LayerHide(null);");
	}
}

//첨삭뷰어
function openAppCorrect(msg) {
	//alert("첨삭뷰어:" + msg);
	try { window.HybridApp.openAppCorrect(msg); }
	catch (ex) { alert(ex); }
	return;
}


function openZipFile_StudyHis_Ins(mCode, CompYN) {
	//loginchk("다시 로그인 해주세요.");
	$.ajax({
		url: "/AppCommon/ZipFile_StudyHis_Ins",
		type: "post",
		data: ({ strmCode: mCode, strCompYN: CompYN }),
		success: function (data) {

		}
	});

}

// 페이징
function PageLink(curPage, totalPages, funName) {

	pageUrl = "";

	var pageLimit = 10;

	var startPage = parseInt((curPage - 1) / pageLimit) * pageLimit + 1;

	var endPage = startPage + pageLimit - 1;

	if (totalPages < endPage) endPage = totalPages;

	var nextPage = endPage + 1;

	if (curPage > 1 && pageLimit < curPage) {
		pageUrl += "<a href='javascript:" + funName + "(1);'><span class='btn_first'>처음으로</span></a>";
	}

	if (curPage > pageLimit) {
		pageUrl += "<a href='javascript:" + funName + "(" + (startPage == 1 ? 1 : startPage - 1) + ");'><span class='btn_prev'>이전</span></a>";
	}

	var strClassOn = "";

	for (var i = startPage; i <= endPage; i++) {

		strClassOn = "";
		if (i == curPage) strClassOn = "class='on'";

		pageUrl += "<a " + strClassOn + " href='javascript:" + funName + "(" + i + ");'><span>" + i + "</span></a>";
	}
	if (nextPage <= totalPages) {
		pageUrl += "<a href='javascript:" + funName + "(" + (nextPage < totalPages ? nextPage : totalPages) + ");'><span class='btn_next'>다음</span></a>";
	}
	if (curPage < totalPages && nextPage < totalPages) {
		pageUrl += "<a href='javascript:" + funName + "(" + totalPages + ");'><span class='btn_last'>끝으로</span></a>";
	}

	return pageUrl
}
//layer paging
function PageLayerLink(curPage, totalPages, funName) {

	pageUrl = "";

	var pageLimit = 5;

	var startPage = parseInt((curPage - 1) / pageLimit) * pageLimit + 1;

	var endPage = startPage + pageLimit - 1;

	if (totalPages < endPage) endPage = totalPages;

	var nextPage = endPage + 1;


	if (curPage > pageLimit) {
		pageUrl += "<a href='javascript:" + funName + "(" + (startPage == 1 ? 1 : startPage - 1) + ");' class='btn_prev'>이전</a>";
	}

	var strClassOn = "";

	for (var i = startPage; i <= endPage; i++) {

		strClassOn = "";
		if (i == curPage) strClassOn = "class='on'";

		pageUrl += "<a " + strClassOn + " href='javascript:" + funName + "(" + i + ");'><span>" + i + "</span></a>";
	}
	if (nextPage <= totalPages) {
		pageUrl += "<a href='javascript:" + funName + "(" + (nextPage < totalPages ? nextPage : totalPages) + ");' class='btn_next'>다음</a>";
	}

	return pageUrl
}

// 우편번호 페이징
function PostPageLink(curPage, totalPages, funName) {

	pageUrl = "";

	var pageLimit = 5;

	var startPage = parseInt((curPage - 1) / pageLimit) * pageLimit + 1;

	var endPage = startPage + pageLimit - 1;

	if (totalPages < endPage) endPage = totalPages;

	var nextPage = endPage + 1;

	if (curPage > 1 && pageLimit < curPage) {
		pageUrl += "<a href='javascript:" + funName + "(1);' class='btn_first'><span>처음으로</span></a>";
	}
	if (curPage > pageLimit) {
		pageUrl += "<a href='javascript:" + funName + "(" + (startPage == 1 ? 1 : startPage - 1) + ");' class='btn_prev'><span>이전</span></a>";
	}

	var strClassOn = "";

	for (var i = startPage; i <= endPage; i++) {

		strClassOn = "";
		if (i == curPage) strClassOn = "class='on'";

		pageUrl += "<a " + strClassOn + " href='javascript:" + funName + "(" + i + ");'><span>" + i + "</span></a>";
	}

	if (nextPage <= totalPages) {
		pageUrl += "<a href='javascript:" + funName + "(" + (nextPage < totalPages ? nextPage : totalPages) + ");' class='btn_next'><span>다음</span></a>";
	}
	if (curPage < totalPages && nextPage < totalPages) {
		pageUrl += "<a href='javascript:" + funName + "(" + totalPages + ");' class='btn_last'><span>끝으로</span></a>";
	}

	return pageUrl
}

/**
* 입력 문자열의 앞뒤 공백(white space)을 제거한다.
*
* @param str	문자열
* @return
*/
function trim(str) {
	var n = str.length;

	var i;
	for (i = 0; i < n; i++) {
		if (str.charAt(i) != " ") {
			break;
		}
	}

	var j;
	for (j = n - 1; j >= 0; j--) {
		if (str.charAt(j) != " ") {
			break;
		}
	}

	if (i > j) {
		return "";
	}
	else {
		return str.substring(i, j + 1);
	}
}


// Split
function stringSplit(strData, strIndex) {
	var stringList = new Array();

	while (strData.indexOf(strIndex) != -1) {
		stringList[stringList.length] = strData.substring(0, strData.indexOf(strIndex));
		strData = strData.substring(strData.indexOf(strIndex) + (strIndex.length), strData.length);
	}

	stringList[stringList.length] = strData;

	return stringList;
}


// MaxLength 처리
function maxLengthCheck(object) {
	if (object.value.length > object.maxLength) {

		object.value = object.value.slice(0, object.maxLength);
		$('input#rdo_hide').focus();
		LayerShow("제목을 20자 이하로 입력해 주세요.", "LayerHide();");
	}
}


// 원화로 표시하기
function parseComma(wons) {
	var won = String(wons);
	var len = won.length;

	if (won.len < 4) return won;
	else {
		var loop = len / 3;
		var start = len % 3;
		var tmp = won.substring(0, start);

		for (var i = 1; i <= loop; i++) {
			tmp += (tmp == "" ? "" : ",") + won.substring(start + i * 3 - 3, start + i * 3);
		}

		return tmp;
	}
}


function IsEmpty(str) {
	var st_num, key_len;
	st_num = str.indexOf(" ");

	while (st_num != -1) {
		str = str.replace(" ", "");
		st_num = str.indexOf(" ");
	}
	key_len = str.length;

	if (parseInt(key_len, 10) > 0) {
		return true;
	}
	else {
		return false;
	}
}

function IsKorean(str) {
	var findStr = str.match(/[가-힣ㄱ-ㅣ]+/);

	if (str == findStr)
		return true;
	else
		return false;
}

function IsNumberEng413(str) {
	var findStr = str.match(/^[a-zA-Z0-9]{4,13}$/);

	if (str == findStr)
		return true;
	else
		return false;
}

function IsNumberEng410(str) {
	var findStr = str.match(/^[a-zA-Z0-9]{4,10}$/);

	if (str == findStr)
		return true;
	else
		return false;
}

function IsNumber(str) {
	var findStr = str.match(/^[0-9]*$/);

	if (str == findStr)
		return true;
	else
		return false;
}


function FuncEnterReplaceBR(strConts) {
	return strConts.replace(/\n/g, '<br />');
}

// 말줄임...
function FuncCutString(strContent, intCut) {

	return strContent.length > intCut ? (strContent.substr(0, intCut) + "...") : strContent;
}

function focusUserID() {
	if (typeof ($("#txt_UserID")) != undefined)
		$("#txt_UserID").focus();
}


function jsGetCookie_urlDecode(name) {
	var arg = name + '=';
	var alen = arg.length;
	var clen = document.cookie.length;
	var i = 0;

	while (i < clen) {
		var j = i + alen;
		if (document.cookie.substring(i, j) == arg) {

			var endstr = document.cookie.indexOf(';', j);
			if (endstr == -1)
				endstr = document.cookie.length;

			return decodeURIComponent(document.cookie.substring(j, endstr));
		}

		i = document.cookie.indexOf(' ', i) + 1;
		if (i == 0) break;
	}

	return "";
}

//쿠키설정-쿠키정보가져오기
function jsGetCookie(name) {


	var arg = name + '=';
	var alen = arg.length;
	var clen = document.cookie.length;
	var i = 0;

	while (i < clen) {
		var j = i + alen;
		if (document.cookie.substring(i, j) == arg)
			return (getCookieVal(j));

		i = document.cookie.indexOf(' ', i) + 1;
		if (i == 0) break;
	}

	return "";
}



function getCookieVal(offset) {
	var endstr = document.cookie.indexOf(';', offset);

	if (endstr == -1)
		endstr = document.cookie.length;

	return unescape(document.cookie.substring(offset, endstr));
	//return decodeURIComponent(document.cookie.substring(offset, endstr)); // 변경처리 없이 jsGetCookie_urlDecode 추가 처리
}

//쿠키설정-쿠키정보설정
function jsSetCookie(name, value, month) {
	var path = "/";
	var domain = "";
	var secure = null;
	var expire = null;

	if (month) {
		expire = new Date();
		expire.setMonth(expire.getMonth() + month);
	}
	document.cookie = name + "=" + escape(value) + ((expire) ? "; expires=" + expire.toGMTString() : "") + ((path) ? "; path=" + path : "") + ((domain) ? "; domain=" + domain : "") + ((secure) ? "; secure" : "");
	return true;
}

//쿠키설정-쿠키정보설정 하루 열리지 않게
function jsSetCookieDay(name, value, day) {
	var path = "/";
	var domain = "";
	var secure = null;
	var expire = null;

	if (day) {
		expire = new Date();
		expire.setDate(expire.getDate() + day);
	}
	document.cookie = name + "=" + escape(value) + ((expire) ? "; expires=" + expire.toGMTString() : "") + ((path) ? "; path=" + path : "") + ((domain) ? "; domain=" + domain : "") + ((secure) ? "; secure" : "");
	return true;
}

//쿠키설정-쿠키정보삭제
function jsDeleteCookie(name) {

	var expire = new Date();
	expire.setTime(expire.getTime() - 1);
	expire.setDate(expire.getDate() - 1);
	var value = jsGetCookie(name);
	document.cookie = name + "=" + value + "; expires=" + expire.toGMTString();
}


function fnDelay(gap) {
	var then, now;
	then = new Date().getTime();
	now = then;
	while ((now - then) < gap) {
		now = new Date().getTime();
	}
}

function appInstallAlert() {
	LayerShow("실행 앱이 설치되어 있지 않습니다.<br/>홈 화면에서 최신 버전으로 업데이트 해주세요.", "LayerHide(null);");

}


// 강제업데이트
function startAppUpdate() {

	window.HybridApp.startAppUpdate();

}


//------------------마법카드 이벤트 시작----------------------------------//
function fnMagicSchool_INS(mCode, v) {

	if (mCode == "") {
		mCode = strCompleteMCodeComm;
	}

    /*
    var mCodeVal = strCompleteMCode;
    if (mCodeVal == "") mCodeVal = strCompleteMCodeComm;
    */

	$.ajax({
		type: "POST"
		, asyn: false
		, url: "/AppEvent/Get_MagicSchoolRegi_Chk"
		, data: { mCode: mCode, status: v }
		, dataType: "json"
		, contentType: "application/x-www-form-urlencoded;charset=UTF-8"
		, beforeSend: function (xhr) { }
		, success: function (result) {

			if (result != null) {
				//				alert("E_Seq : "+result.E_Seq);
				//				alert("StudyGubun : "+result.StudyGubun);
				//				alert("MCnt : "+result.MCnt);
				//				alert("ECnt : "+result.ECnt);


				//StudyGubun 값이 있으면 첫수강
				if (result.StudyGubun != "" && Number(result.EndDay) > 0) {

					var className = "";
					var CardNum = Number(result.MCnt) + Number(result.ECnt);    //오늘 받은 마법카드
					var CardNumKor = "";

					if (CardNum == 1) {
						CardNumKor = "첫 번째 마법사 카드";
					} else if (CardNum == 2) {
						CardNumKor = "두 번째 마법사 카드";
					} else if (CardNum == 3) {
						CardNumKor = "세 번째 마법사 카드";
					} else if (CardNum == 4) {
						CardNumKor = "네 번째 마법사 카드";
						$(".lpop_event_150317_card .tip").show();
					}


					if (result.StudyGubun == "MATH") {

						if (Number(result.MCnt) < 3 && Number(result.MathEnd) == 0) {
							className = "수준별 수학";
							$(".lpop_event_150317_card").show();
							$(".lpop_event_150317_card .StudyCardName").html(className);
							$(".lpop_event_150317_card .StudyCardNumber").html(CardNumKor);
						}


					} else if (result.StudyGubun == "TALLENGLISH") {
						if (Number(result.ECnt) < 3 && Number(result.EngEnd) == 0) {
							className = "수준별 영어";
							$(".lpop_event_150317_card").show();
							$(".lpop_event_150317_card .StudyCardName").html(className);
							$(".lpop_event_150317_card .StudyCardNumber").html(CardNumKor);
						}
					}
				}


			}
		}
		, error: function (xhr, textStatus) {
			//alert(xhr + "\n\n" + textStatus);
		}
		, complete: function (xhr, textStatus) {
		}
	});

}


function fnStudyHis(mCode, eSeq) {
	$.ajax({
		type: "POST"
		, asyn: false
		, url: "/AppEvent/APP_EVENT_LEARN_MAGIC_CARD_INSERT"
		, data: { mCode: mCode, eSeq: eSeq, Status: "I" }
		, dataType: "json"
		, contentType: "application/x-www-form-urlencoded;charset=UTF-8"
		, beforeSend: function (xhr) { }
		, success: function (result) {
			fnMagicSchool_INS(mCode, "0");
		}
		, error: function (xhr, textStatus) {
			//alert(xhr + "\n\n" + textStatus);
		}
		, complete: function (xhr, textStatus) {
		}
	});

}

//------------------마법카드 이벤트 끝----------------------------------//

//--------------------- 룰렛 이벤트 ---------------------//

// 룰렛 이벤트 insert
function Event_RouletteInsert(mcode) {

	$.ajax({
		url: "/AppEvent/RouletteInsert",
		type: "post",
		datatype: "json",
		data: ({ mCode: mcode }),
		success: function (data, status) {

			if (data[0].LayerYn == "Y") {
				LayerShowConfirm("오늘의 학습을 하여 룰렛 돌리기 기회가 생겼습니다.<br/>룰렛을 돌려 선물을 받으러 갈까요?", "Event_RouletteUrl();", "LayerConfirmHide();");
			}

		}
	});
}

// 룰렛 이벤트 Url
function Event_RouletteUrl() {
	document.location.href = "/AppEvent?Page=Roulette";
}

//--------------------- 룰렛 이벤트 끝 ------------------//

//--------------------- 퍼즐 이벤트 ---------------------//

function Event_PuzzleInsert(mcode) {

	$.ajax({
		url: "/AppEvent/PuzzleInsert",
		type: "post",
		datatype: "json",
		data: ({ mCode: mcode }),
		success: function (data, status) {

			if (data[0].RESULT == "Y") {
				$("#lpop_puzzle").show();
			}

		}
	});

}

//--------------------- 퍼즐 이벤트 끝 ------------------//

//--------------------- 사다리 이벤트 ---------------------//

function Event_SadariLayerYn(mcode) {

	$.ajax({
		url: "/AppEvent/SadariLayer",
		type: "post",
		datatype: "json",
		data: ({ mCode: mcode }),
		success: function (data, status) {

			if (data[0].LayerYn == "Y") {
				$("#lpop_sadari").show();
			}

		}
	});

}

//--------------------- 사다리 이벤트 끝 ------------------//

//--------------------- 새싹 이벤트 ---------------------//

function Event_SproutInsert(mcode) {

	$.ajax({
		url: "/AppEvent/SproutInsert",
		type: "post",
		datatype: "json",
		data: ({ mCode: mcode }),
		success: function (data, status) {

			if (data[0].LayerYn == "Y") {
				$(".lpop_e160215").show();
			}

		}
	});

}

//--------------------- 새싹 이벤트 끝 ------------------//


//--------------------- 카네이션 이벤트 ---------------------//

function Event_CarnationInsert(mcode) {

	$.ajax({
		url: "/AppEvent/CarnationInsert",
		type: "post",
		datatype: "json",
		data: ({ mCode: mcode }),
		success: function (data, status) {

			if (data[0].LayerYn == "Y") {
				$(".lpop_e160418").show();
			}

		}
	});

}

//--------------------- 카네이션 이벤트 끝 ------------------//


//--------------------- 숨은글자찾기 이벤트 -------------------------//

function Event_HiddenMsgInsert(mcode) {

	$.ajax({
		url: "/AppEvent/HiddenMsgInsert",
		type: "post",
		datatype: "json",
		data: ({ mCode: mcode }),
		success: function (data, status) {

			if (data[0].LayerYn == "Y") {

				for (var i = 1; i <= 15; i++) {
					if (i < 10) {
						$("#spltt" + i).attr("style", "display:none");
					} else if (i > 9) {
						$("#spltt" + i).attr("style", "display:none");
					}
				}
				$("#lpop_hiddenMsg").show();
				$("#spltt" + data[0].MessageNo).attr("style", "display:block");
			}

		}
	});

}

//--------------------- 숨은글자찾기 이벤트 끝 ----------------------//

//--------------------- 과일모으기 이벤트 -------------------------//

function Event_FruitInsert(mcode) {

	$.ajax({
		url: "/AppEvent/FruitInsert",
		type: "post",
		datatype: "json",
		data: ({ mCode: mcode }),
		success: function (data, status) {

			if (data[0].LayerYn == "Y") {

				for (var i = 1; i <= 6; i++) {
					$("#fr_0" + i).attr("style", "display:none");
				}
				$("#lpop_fruit").show();
				$("#fr_0" + data[0].Num).attr("style", "display:block");
			}

		}
	});

}

//--------------------- 과일모으기 이벤트 끝 ----------------------//

//--------------------- 빙고 이벤트 ---------------------//

function Event_BingoInsert(mcode) {

	$.ajax({
		url: "/AppEvent/BingoInsert",
		type: "post",
		datatype: "json",
		data: ({ mCode: mcode }),
		success: function (data, status) {

			if (data[0].LayerYn == "Y") {
				$("#lpop_bingo").show();
			}

		}
	});

}

//--------------------- 빙고 이벤트 끝 ------------------//

//----------------- 한가위(송편) 이벤트 -----------------//

function Event_HangawiInsert(mcode) {

	$.ajax({
		url: "/AppEvent/HangawiInsert",
		type: "post",
		datatype: "json",
		data: ({ mCode: mcode }),
		success: function (data, status) {

			if (data[0].LayerYn == "Y") {
				// $("#lpop_hangawi").show();
			}

		}
	});

}

//---------------- 한가위(송편) 이벤트 끝 --------------//
//------------------ 간식뽑기 이벤트 ------------------//

function Event_BallMotionInsert(mcode) {

	$.ajax({
		url: "/AppEvent/BallMotionInsert",
		type: "post",
		datatype: "json",
		data: ({ mCode: mcode }),
		success: function (data, status) {

			if (data[0].LayerYn == "Y") {
				$("#lpop_ballmotion").show();
			}

		}
	});

}

//----------------- 간식뽑기 이벤트 끝 ---------------//
//--------------------- 빼빼로 이벤트 ---------------------//

function Event_PeperoInsert(mcode) {

	$.ajax({
		url: "/AppEvent/PeperoInsert",
		type: "post",
		datatype: "json",
		data: ({ mCode: mcode }),
		success: function (data, status) {

			if (data[0].LayerYn == "Y") {

				$("#lpop_pepero").show();
				$("#sc_pepero").attr("style", "display:block");
				$("#sc_pepero").attr("class", "source0" + data[0].Num);

			}

		}
	});

}

//------------------- 빼빼로 이벤트 끝 --------------------//
//------------------ 12월 학습 이벤트 ------------------//

function Event_StudyEvt12Insert(mcode) {

	$.ajax({
		url: "/AppEvent/Attend_StudyInsert",
		type: "post",
		datatype: "json",
		data: ({ mCode: mcode }),
		success: function (data, status) {

			if (data[0].LayerYn == "Y") {
				$("#lpop_attendNstudy").show();
			}

		}
	});

}

//----------------- 12월 학습 이벤트 끝 ---------------//

// 단원평가 배점
function GetBaejum(result, userinput, mCode) {

    $.ajax({
        url: "/AppQuestionBank/GetBaejum",
        type: "post",
        datatype: "json",
        data: ({ MCode: mCode }),
        success: function (data, status) {

            //			alert("result:" + result);
            //			alert("userinput:" + userinput);
            //			alert("baejum:" + data.Baejum);

            window.HybridApp.returnResultBaejum(result, userinput, data.Baejum);
        }

    })
}

// 단원평가 배점 (#104317_퀴즈코드 추가 버전)
function GetBaejum_quizCode(result, userinput, mCode, quizCode) {

	$.ajax({
        url: "/AppQuestionBank/GetBaejum_QuizCode",
		type: "post",
		datatype: "json",
        data: ({ MCode: mCode, QuizCode: quizCode }),
		success: function (data, status) {

			//			alert("result:" + result);
			//			alert("userinput:" + userinput);
			//			alert("baejum:" + data.Baejum);

			window.HybridApp.returnResultBaejum(result, userinput, data.Baejum);
		}

	})
}
//--------------------- 카드 맞추기 이벤트 ---------------------//

function Event_CardInsert(mcode) {

	$.ajax({
		url: "/AppEvent/CardInsert",
		type: "post",
		datatype: "json",
		data: ({ mCode: mcode }),
		success: function (data, status) {
			if (data[0].LayerYn == "Y") {
				$("#lpop_card").show();
			}
		}
	});

}

//------------------- 카드 맞추기 이벤트 끝 --------------------//

//--------------------- 준비물 모으기 이벤트 ---------------------//

function Event_SuppliesInsert(mcode) {

	$.ajax({
		url: "/AppEvent/SuppliesInsert",
		type: "post",
		datatype: "json",
		data: ({ mCode: mcode }),
		success: function (data, status) {
			if (data[0].LayerYn == "Y") {
				for (var i = 1; i <= 10; i++) {
					$("#s_item" + i).attr("style", "display:none");
				}

				$("#lpop_supplies").show();
				$("#s_item" + data[0].Num).attr("style", "display:block");
			}
		}
	});

}

//------------------- 준비물 모으기 이벤트 끝 --------------------//

//--------------------- 블록 퀴즈 이벤트 ---------------------//

function Event_BlockInsert(mcode) {

	$.ajax({
		url: "/AppEvent/BlockInsert",
		type: "post",
		datatype: "json",
		data: ({ mCode: mcode }),
		success: function (data, status) {
			if (data[0].LayerYn == "Y") {
				$("#lpop_block").show();
			}
		}
	});
}

//------------------- 블록 퀴즈 이벤트 끝 --------------------//

//--------------------- 놀이공원 이벤트 ---------------------//

function Event_AmusementInsert(mcode) {

	$.ajax({
		url: "/AppEvent/AmusementInsert",
		type: "post",
		datatype: "json",
		data: ({ mCode: mcode }),
		success: function (data, status) {
			if (data[0].LayerYn == "Y") {
				$("#lpop_amusement").show();
			}
		}
	});
}

//------------------- 놀이공원 이벤트 끝 --------------------//

//--------------------- 팥빙수 이벤트 ---------------------//

function Event_PatbingsuInsert(mcode) {
	$.ajax({
		url: "/AppEvent/PatbingsuInsert",
		type: "post",
		datatype: "json",
		data: ({ mCode: mcode }),
		success: function (data, status) {
			if (data[0].LayerYn == "Y") {
				$("#lpop_patbingsu").show();
				$("#lpop_patbingsu > div.txt_area > div > span > img").hide();
				$("#imgPatbingsuElement" + data[0].ElementNo).show();
			}
		}
	});
}

//------------------- 팥빙수 이벤트 끝 --------------------//

//--------------------- 아쿠아리움 이벤트 ---------------------//

function Event_AquariumInsert(mcode) {
	$.ajax({
		url: "/AppEvent/AquariumInsert",
		type: "post",
		datatype: "json",
		data: ({ mCode: mcode }),
		success: function (data, status) {
			if (data[0].LayerYn == "Y") {
				$("#lpop_aquarium").show();
			}
		}
	});
}

//------------------- 아쿠아리움 이벤트 끝 --------------------//

//--------------------- 달려라달려 이벤트 ---------------------//

function Event_RunAnimalInsert(mcode) {
	$.ajax({
		url: "/AppEvent/RunAnimal_LayerShow",
		type: "post",
		datatype: "json",
		data: ({ mCode: mcode }),
		success: function (data, status) {
			if (data.ResultYn == "Y") {
				$("#lpop_RunAnimal").show();
			}
		}
	});
}

//------------------- 달려라달려 이벤트 끝 --------------------//

//--------------------- 12월학습 이벤트 ---------------------//

function Event_171204_Insert(mcode) {
	$.ajax({
		url: "/AppEvent/Event171204_LayerShow",
		type: "post",
		datatype: "json",
		data: ({ mCode: mcode }),
		success: function (data, status) {
			if (data.ResultYn == "Y") {
				if (data.Item == "star") {
					$("#171204_img1").show();
					$("#171204_img2").hide();
					$("#171204_img3").hide();
				}
				else if (data.Item == "snow") {
					$("#171204_img2").show();
					$("#171204_img1").hide();
					$("#171204_img3").hide();
				}
				else if (data.Item == "bell") {
					$("#171204_img3").show();
					$("#171204_img1").hide();
					$("#171204_img2").hide();
				}

				$("#lpop_event171204").show();
			}
		}
	});
}

//------------------- 12월학습 이벤트 끝 --------------------//

//-------------------18년 1월학습 이벤트 ---------------------//

function Event_SpecialPuzzleInsert(mcode) {

	$.ajax({
		url: "/AppEvent/SpecialPuzzle_LayerShow",
		type: "post",
		datatype: "json",
		data: ({ mCode: mcode }),
		success: function (data, status) {
			if (data.ResultYn == "N") {
				$("#lpop_event180108").show();
			}
		}
	});

}

//-------------------18년 1월학습 이벤트 끝 --------------------//


//-------------------18년 4~7월학습 이벤트 ---------------------//

function Event_MonthlyStudyEventLayerShow(mcode) {

	$.ajax({
		url: "/AppEvent/MonthlyStudyEventLayerShow",
		type: "post",
		datatype: "json",
		data: ({ mCode: mcode }),
		success: function (data, status) {

			// ask#34660
			//alert('data.LayerYN=' + data.LayerYN);
			// 레이어 보여줌
			if (data.LayerYN == "N") {

				if (data.PrizeYN == "Y") {          // 이번달 목표를 달성했으면
					var item03 = 1;

					if (data.PrizeCnt == "1") {          // 금요일이 아니면
						$("#lpop_e190618_2_left_span").html("<img src='https://cdndata.milkt.co.kr/ele/app/Images/event/190618/today_item01_1.png' alt='스티커 1개' />");
						$("#lpop_e190618_2_left_p_span").html("<span>학습을 완료하고<br/><em>아이스크림 스티커 " + data.PrizeCnt + "개</em>를 받았어요.</span>");

					} else if (data.PrizeCnt == "2") {   // 금요일이면
						$("#lpop_e190618_2_left_span").html("<img src='https://cdndata.milkt.co.kr/ele/app/Images/event/190618/today_item01_2.png' alt='스티커 2개' />");
						$("#lpop_e190618_2_left_p_span").html("<span>오늘은 행복한 금요일!<br/>학습을 완료하고<br/><em>스티커 " + data.PrizeCnt + "개</em>를 받았어요.</span>");
					}

					if (data.TotPrizeCnt < 5) {//시즌1
						$("#lpop_e190618_2_right_span").html("<img src='https://cdndata.milkt.co.kr/ele/app/images/event/181219/today_item03_" + data.TotPrizeCnt + ".png' alt='미션카드" + data.TotPrizeCnt + "' />");
					} else if (data.TotPrizeCnt < 9) {//시즌2
						item03 = data.TotPrizeCnt % 4;
						if (item03 == 0) item03 = 4;
						$("#lpop_e190618_2_right_span").html("<img src='https://cdndata.milkt.co.kr/ele/app/images/event/181219/today_v2_item03_" + item03 + ".png' alt='미션카드" + data.TotPrizeCnt + "' />");
					} else if (data.TotPrizeCnt < 13) {//시즌3
						item03 = data.TotPrizeCnt % 4;
						if (item03 == 0) item03 = 4;
						$("#lpop_e190618_2_right_span").html("<img src='https://cdndata.milkt.co.kr/ele/app/images/event/181219/today_v3_item03_" + item03 + ".png' alt='미션카드" + data.TotPrizeCnt + "' />");
					} else {//시즌4
						item03 = data.TotPrizeCnt % 4;
						if (item03 == 0) item03 = 4;
						$("#lpop_e190618_2_right_span").html("<img src='https://cdndata.milkt.co.kr/ele/app/images/event/181219/today_v4_item03_" + item03 + ".png' alt='미션카드" + data.TotPrizeCnt + "' />");
					}
					$("#lpop_e190618_2_right_p_span").html("<span>축하합니다!<br/>" + data.PrizeGoalCnt + "개의 스티커를 모아<br/><em>미션 카드</em>를 받으셨습니다.</span>");

					$("#lpop_e190618_2").show();

				} else if (data.PrizeYN == "N") {   // 이번달 목표를 달성전이면

					if (data.PrizeCnt == "1") {          // 금요일이 아니면
						$("#lpop_e190618_1_span").html("<img src='https://cdndata.milkt.co.kr/ele/app/Images/event/190618/today_item01_1.png' alt='스티커 1개' />");
						$("#lpop_e190618_1_p_span").html("<span>학습을 완료하고<br/><em>아이스크림 스티커 " + data.PrizeCnt + "개</em>를 받았어요.</span>");

					} else if (data.PrizeCnt == "2") {   // 금요일이면
						$("#lpop_e190618_1_span").html("<img src='https://cdndata.milkt.co.kr/ele/app/Images/event/190618/today_item01_2.png' alt='스티커 2개' />");
						$("#lpop_e190618_1_p_span").html("<span>오늘은 행복한 금요일!<br/>학습을 완료하고<br/><em>아이스크림 스티커 " + data.PrizeCnt + "개</em>를 받았어요.</span>");
					}
					$("#lpop_e190618_1").show();

				}
			}

		}
	});

}

//-------------------18년 4~7월학습 이벤트 끝 --------------------//

// 뷰아이디어 3D
function StartVUIdeaApp(pkName, activityName, gubun) {

	try { window.HybridApp.startVUIdeaApp(pkName, activityName, gubun); }
	catch (ex) { alert(ex); }
	return;
}


// 패키지별 버전 체크(서버)
function GetAppVersionCheck_Server(pkName) {

	$.ajax({
		url: "/AppCommon/GetAppVersionCheck",
		type: "post",
		datatype: "json",
		data: ({ PackageName: pkName }),
		success: function (data, status) {

			alert(pkName + "(서버): " + data.Version);
		}

	})
}


// 패키지별 버전 체크(로컬)
function GetAppVersionCheck(pkName) {
	if (typeof window.HybridApp.getVersionName == 'function') {
		TempPkName = pkName;
		window.HybridApp.getVersionName(TempPkName);
	}
	else {
		alert("밀크T 앱 1.6.21 로 업데이트 받으세요.");
	}
}


var Launcher_UserId = "";
var EngGame_UserId = "";
var EngGame_UserName = "";
var EngGame_Grade = "";
var EngGame_StudyCount = "";
var EngPop_UserName = "";
var Intro_LoginId = "";
var Intro_UserId = "";
var Intro_CategoryId = "";
var Intro_Gubun = "";
var Intro_Year = "";
var Diary_UserId = "";
var Diary_Year = "";
var Diary_Month = "";
var Diary_Day = "";
var Intro_Grade = "";

var Extra_userID = "";
var Extra_milktid = "";
var Extra_milktname = "";
var Extra_milktgrade = "";
var Extra_classcd = "";
var Extra_lmValue = "";
var Extra_completeYn = "";
var Extra_lecType = "";
var upEng_gubun = "";

var color_mcode = "";

var kidsStudyJson = "";
var oneTestStudyJson = "";
var str_OnlyVersion = "";
var str_VersionName = "";
var isCaliperEdAppVersionCheck = false;

var SpeechRecognition_param = ""; // ask#59568
var CjSpeechRecognition_param = ""; // ask#90896

var user_tstatus_check_date = new Date();   // #103406 날짜 비교 변수
var user_tstatus_check_date_timestamp = user_tstatus_check_date.getTime();  // #103406 날짜 비교 변수

var pickImageChooser_obj = ""; //이미지 업로드 기능 설정 변수

var engBookUrl = ""; //Ebook 뷰어 기능 변수

var ebook_mCode = ""; //HMH 뷰어 mCode
var ebook_level = ""; //HMH 뷰어 레벨

// 버전정보 콜백함수
function onGetVersionName(versionName) {

	var ver_arry = versionName.split('.');
	var ver_string = ver_arry.join('');
	var num = 0;
	var num2 = 0;
	var increment = 1;
	var index = ver_arry.length - 1;
	while (index > -1) {
		num += ver_arry[index] * increment;
		increment *= 100;
		index--;
    }

    // #103406_이월 학습생 탭 로그인 및 학습 불가 관련 기능
    var user_tstatus_check_date_diff = new Date();
    var user_tstatus_check_date_timestamp_diff = user_tstatus_check_date_diff.getTime();
    var user_tstatus_check_date_timestamp_term = 300000; // 5*60*1000(5분)
    if (isDevelopment()) {
        user_tstatus_check_date_timestamp_term = 60000;
    }

    if ((user_tstatus_check_date_timestamp_diff - user_tstatus_check_date_timestamp) >= user_tstatus_check_date_timestamp_term) {
        var tstatus = Fn_MemberStatusCheck($("input#hid_UserID").val());
        if (tstatus == "N") { // 학습관련 없으면 로그아웃 처리
            location.href = "/AppLogin/Logout";
        } else {
            user_tstatus_check_date_timestamp = user_tstatus_check_date_timestamp_diff;
        }
    }

	var milktAppVersion = null, externalAppPackage = null, externalAppScheme = null, externalAppContentId = null;

	// 버전정보만 가져오기 | 2020/09/21 웹개발팀 조재희
	if (str_OnlyVersion == "Y") {

		str_VersionName = versionName;

		if (isCaliperEdAppVersionCheck) {
			try {
				window.caliperCore.setMilktAppVersion(versionName);
			} catch (e) {
				console.log('Caliper.Core', e);
			}

			isCaliperEdAppVersionCheck = false;
			str_OnlyVersion = "N";
		}


		return;
	}

    if (TempPkName == "kr.hbstudy.apphbstudy") {           // 밀크T앱
        milktAppVersion = versionName;
        TempPkName = "";
        //1.7.49버전 -> 10749
        //10974->10976
		if (num < 20001) { //20230816
            LayerShow("밀크T의 새로운 버전이 오픈되었습니다.<br/>홈 화면에서 최신 버전으로 업데이트해주세요.", "LayerHide(null);");
        }
        else {
            if (TempPkName2 == "com.remoteapi.smartviewer.air.RAPIAirViewerApp") {
                if (MultiPlayer_MediaYN == "Y") {
                    TempPkName2 = "";
                    //window.HybridApp.IntegrationPlayer(MultiPlayer_MCode, 'TEST', 'P', MultiPlayer_Complete); // 학습창 통합 (강의+확인문제)

                    if (MultiPlayer_Integration == "N") {
                        window.HybridApp.openMultiPlayer(MultiPlayer_MCode);

                        externalAppPackage = 'kr.hbstudy.apphbstudy';
                        externalAppScheme = 'window.HybridApp.openMultiPlayer';
                        externalAppContentId = MultiPlayer_MCode;
                    }

                    else {
                        window.HybridApp.IntegrationPlayer(MultiPlayer_MCode, 'TEST', 'P', MultiPlayer_Complete); // 학습창 통합 (강의+확인문제)

                        externalAppPackage = 'kr.hbstudy.apphbstudy';
                        externalAppScheme = 'window.HybridApp.IntegrationPlayer';
                        externalAppContentId = MultiPlayer_MCode;
                    }
                }

                else {
                    TempPkName2 = "";
                    if (Media_Cha != '0') {// 매일보는 동화 미디어 호출용...  Media_Cha는  생각놀이 차수  zino 2018-09-14
                        //alert('Media_Cha=' + Media_Cha);
                        window.HybridApp.openMediaPlayerByDongHwa(Media_MCode, jsGetCookie("selTopGrade"), Media_LockYN, Media_NuriYN, Media_Cha, 'pd.onetimetest.gscdn.com:8080/onetime/milkT/app/Services/2018/DailyStory');

                        externalAppPackage = 'kr.hbstudy.apphbstudy';
                        externalAppScheme = 'window.HybridApp.openMediaPlayerByDongHwa';
                        externalAppContentId = Media_MCode;
                    } else {
                        window.HybridApp.openMediaPlayer(Media_MCode, jsGetCookie("selTopGrade"), Media_LockYN, Media_NuriYN);

                        externalAppPackage = 'kr.hbstudy.apphbstudy';
                        externalAppScheme = 'window.HybridApp.openMediaPlayer';
                        externalAppContentId = Media_MCode;
                    }
                }
            }
            else if (TempPkName2 == "MediaCheck") {
                TempPkName2 = '';
                window.HybridApp.openMediaPlayer(Media_MCode, Media_Grade);

                Media_MCode = '';
                Media_Grade = '';

            }
            else if (TempPkName2 == "AI_suda") {
                var url = "/AppHBMath/AISudaTest?classcode=" + MultiPlayer_MCode + "&grade=6&comyn=N&todayyn=N";
                if (/Android/i.test(navigator.userAgent)) {
                    //alert('andr');
                    obj = "{url:'" + url + "', mode:0, backkey:'y'}";
                    try { window.HybridApp.openMyScriptView(obj, 0); }
                    catch (ex) { alert(ex.Message); }
                    return;
                } else if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
                    alert('IOS');
                } else {
                    //alert('else');
                    //window.open(url);
                    window.open(url, "AITest", "left=0,top=0,width=1290,height=850,scrollbars=no, resizable=no, toolbars=no, menubar=no");
                }
            }
            else if (TempPkName2 == "window.HybridApp.QuestionBankKids") {
                TempPkName2 = "";
                window.HybridApp.QuestionBankKids(JSON.stringify(kidsStudyJson));
                kidsStudyJson = "";

                externalAppPackage = 'kr.hbstudy.apphbstudy';
                externalAppScheme = 'window.HybridApp.QuestionBankKids';
            }
            else if (TempPkName2 == "window.HybridApp.QuestionBankOne") {
                TempPkName2 = "";
                window.HybridApp.QuestionBankOne(JSON.stringify(oneTestStudyJson));
                oneTestStudyJson = "";

                externalAppPackage = 'kr.hbstudy.apphbstudy';
                externalAppScheme = 'window.HybridApp.QuestionBankOne';
            }
            else if (Question_Open == "Y") { // 문제은행 (171218 sik)
                TempPkName2 = "";

                if (Question_danCnt == "3") {
                    //QuestionBank(String strGetMcode, String pageType, String testType, String strComplete, String strGrade, String strLock, String dancnt)
                    window.HybridApp.QuestionBank(Question_MCode, Question_pageType, Question_testType, Question_strComplete, Question_Grdae, Question_strPlayerLockYN, Question_danCnt);
                }
                else {
                    window.HybridApp.QuestionBank(Question_MCode, Question_pageType, Question_testType, Question_strComplete, Question_Grdae);
                }

                externalAppPackage = 'kr.hbstudy.apphbstudy';
                externalAppScheme = 'window.HybridApp.QuestionBank';
                externalAppContentId = Question_MCode;
            }
            else if (TempPkName2 == "window.HybridApp.pickImageChooser") {
                TempPkName2 = "";
                window.HybridApp.pickImageChooser(pickImageChooser_obj);
                pickImageChooser_obj = "";
            }
        }
    }
    else if (TempPkName == "kr.co.chunjae.mathodd") {      // 수학놀이터

        TempPkName = "";

        if (num < 10102) {
            LayerShow("수학놀이터의 새로운 버전이 오픈되었습니다.<br/>홈 화면에서 최신 버전으로 업데이트해주세요.", "LayerHide(null);");
        }
        else {
            window.HybridApp.mathodd(Mathodd_UserId, Mathodd_UserName, Mathodd_Grade, Mathodd_Franchiseid, Mathodd_Url);

            externalAppPackage = 'kr.hbstudy.apphbstudy';
            externalAppScheme = 'window.HybridApp.mathodd';
        }
    }
    else if (TempPkName == "air.com.eni.milktgamecenter") {   // 톡톡체험월드

        TempPkName = "";

        if (num < 10204) {
            LayerShow("톡톡체험월드의 새로운 버전이 오픈되었습니다.<br/>홈 화면에서 최신 버전으로 업데이트해주세요.", "LayerHide(null);");
        }
        else {
            externalAppPackage = 'air.com.eni.milktgamecenter';
            externalAppScheme = "milkt://gamecenter?extra_userid=" + Launcher_UserId + "&extra_playtime=10";

            startExternalApp(externalAppPackage, externalAppScheme);
        }
    }
    else if (TempPkName == "com.chunjae.livepromotion") {   // LIVE시리즈

        TempPkName = "";

        if (num < 10004) { // 버전 1.0.4
            LayerShow("LIVE시리즈의 새로운 버전이 오픈되었습니다.<br/>홈 화면에서 최신 버전으로 업데이트해주세요.", "LayerHide(null);");
        }
        else {
            externalAppPackage = 'com.chunjae.livepromotion';
            externalAppScheme = "milkt://livepromotion?extra_userid=" + Launcher_UserId + "&extra_playtime=10";

            startExternalApp(externalAppPackage, externalAppScheme);
        }
    }
    else if (TempPkName == "com.eroum.milkt.launcher") {   // 런처

        TempPkName = "";

        if (num < 20747) {
            Lpop_launcher_info_show();
        }
        else {
            TempPkName = "kr.hbstudy.apphbstudy";
            window.HybridApp.getVersionName(TempPkName);
        }
    }
    else if (TempPkName == "com.lingrets.englishgame") {      // 영단어 랭킹왕

        TempPkName = "";

        if (num < 20010) {
            LayerShow("영단어 랭킹왕의 새로운 버전이 오픈되었습니다.<br/>홈 화면에서 최신 버전으로 업데이트해주세요.", "LayerHide(null);");
        }
        else {
            externalAppPackage = 'com.lingrets.englishgame';
            externalAppScheme = "lingrets://englishgame?userid=" + EngGame_UserId + "&name=" + EngGame_UserName + "&grade=" + EngGame_Grade + "&count=" + EngGame_StudyCount;

            startExternalApp(externalAppPackage, externalAppScheme);
        }
    }
    else if (TempPkName == "kr.co.chunjae.android.englishpop") {      // 잉글리쉬팝

        TempPkName = "";

        if (num < 10004) {
            LayerShow("잉글리쉬팝의 새로운 버전이 오픈되었습니다.<br/>홈 화면에서 최신 버전으로 업데이트해주세요.", "LayerHide(null);");
        }
        else {
            externalAppPackage = 'kr.co.chunjae.android.englishpop';
            externalAppScheme = "milkt://englishpop?UserName=" + EngPop_UserName;

            startExternalApp(externalAppPackage, externalAppScheme);
        }
    }
    else if (TempPkName == "kr.co.chunjae.android.mathpark") {      // 수학파크

        TempPkName = "";

        if (num < 10002) {
            LayerShow("수학파크의 새로운 버전이 오픈되었습니다.<br/>홈 화면에서 최신 버전으로 업데이트해주세요.", "LayerHide(null);");
        }
        else {
            externalAppPackage = 'kr.co.chunjae.android.mathpark';
            externalAppScheme = "milkt://mathpark";

            startExternalApp(externalAppPackage, externalAppScheme);
        }
    }
    else if (TempPkName == "kr.co.chunjae.android.bookclub") {      // 천재북클럽 시즌2

        TempPkName = "";

        if (num < 10110) { //천재도서관 앱 버전 수정 #107424 초등 서브 메인 개편 수준별 국어
            LayerShow("천재도서관의 새로운 버전이 오픈되었습니다.<br/>홈 화면에서 최신 버전으로 업데이트해주세요.", "LayerHide(null);");
        }
        else {

            //천재도서관 앱 실행 후, 특정 메뉴로 이동시키기 위한 API가 추가됨 #107424 초등 서브 메인 개편 수준별 국어
            if (typeof window.HybridApp.openSmartBookByUrl == 'function'
                && typeof _openSmartBook_param != "undefined") {
                window.HybridApp.openSmartBookByUrl(_openSmartBook_param);
            } else {
                window.HybridApp.openSmartBook();
            }

            // app 종료를 감지할 수 없으므로 Log 기록 안함
            //externalAppPackage = 'kr.hbstudy.apphbstudy';
            //externalAppScheme = "window.HybridApp.openSmartBook";
        }
    }
    else if (TempPkName == "kr.co.chunjae.introduction") { // 자기소개하기

        TempPkName = "";

        if (num < 10112) { // 1.1.12
            LayerShow("자기소개하기의 새로운 버전이 오픈되었습니다.<br/>홈 화면에서 최신 버전으로 업데이트해주세요.", "LayerHide(null);");
        }
        else {
            externalAppPackage = 'kr.co.chunjae.introduction';
            externalAppScheme = "";

            if (Intro_Grade == "kids") {
                externalAppScheme = "milkt://introduction?loginId=" + Intro_LoginId + "&userId=" + Intro_UserId + "&categoryId=" + Intro_CategoryId + "&gubun=" + Intro_Gubun + "&year=" + Intro_Year + "&from=" + Intro_Grade;
            } else {
                externalAppScheme = "milkt://introduction?loginId=" + Intro_LoginId + "&userId=" + Intro_UserId + "&categoryId=" + Intro_CategoryId + "&gubun=" + Intro_Gubun + "&year=" + Intro_Year;
            }

            startExternalApp(externalAppPackage, externalAppScheme);
        }
    }
    else if (TempPkName == "com.remoteapi.smartviewer.air.RAPIAirViewerApp") {          // 플래시에어뷰어

        TempPkName = "";

        if (num < 10306) { // 1.3.6버전 -> 10306
            LayerShow("플래시뷰어의 새로운 버전이 오픈되었습니다.<br/>홈 화면에서 최신 버전으로 업데이트해주세요.", "LayerHide(null);");
        }
        else {
            TempPkName = "kr.hbstudy.apphbstudy";
            TempPkName2 = "com.remoteapi.smartviewer.air.RAPIAirViewerApp";
            window.HybridApp.getVersionName(TempPkName);
        }
    }
    else if (TempPkName == "air.kr.co.chunjae.android.cjairplayer") {          // 8월 플래시에어뷰어 cjAir1.0

        TempPkName = "";

        if (num < 11009) { // 1.10.9버전 -> 11009
            LayerShow("플래시뷰어의 새로운 버전이 오픈되었습니다.<br/>홈 화면에서 최신 버전으로 업데이트해주세요.", "LayerHide(null);");
        }
        else {
            externalAppPackage = 'air.kr.co.chunjae.android.cjairplayer';
            externalAppScheme = "milkt://cjairplayer?id=" + cjAir_Userid + "&mCode=" + cjAir_mCode + "&zipPath=" + cjAir_zipPath + "&createdDate=" + cjAir_zipDate + "&optionPath=" + cjAir_optionPath + "&test=" + cjAir_testYN + "&dictionary=" + cjAir_CoreWord + "&movieControl=" + cjAir_movieControl + "&swfControl=" + cjAir_swfControl;
            externalAppContentId = cjAir_mCode;

            startExternalApp(externalAppPackage, externalAppScheme);
        }
    }
    else if (TempPkName == "air.kr.co.chunjae.android.cjairplayer2") {          // 겨울방학 플래시에어뷰어 cjAir2.0

        TempPkName = "";

        if (num < 10003) { // 1.0.3버전 -> 10003
            LayerShow("플래시뷰어의 새로운 버전이 오픈되었습니다.<br/>홈 화면에서 최신 버전으로 업데이트해주세요.", "LayerHide(null);");
        }
        else {
            externalAppPackage = "air.kr.co.chunjae.android.cjairplayer2";
            externalAppContentId = cjAir2_mCode;
            externalAppScheme = "milkt://cjairplayer2?id=" + cjAir2_Userid + "&mCode=" + cjAir2_mCode + "&zipPath=" + cjAir2_zipPath + "&createdDate=" + cjAir2_zipDate + "&optionPath=" + cjAir2_optionPath + "&test=" + cjAir2_testYN + "&dictionary=" + cjAir2_CoreWord + "&movieControl=" + cjAir2_movieControl + "&swfControl=" + cjAir2_swfControl + "&edubase=" + cjAir2_edubase + "&testStudy=" + cjAir2_testStudy;

            startExternalApp(externalAppPackage, externalAppScheme);
        }
    }
    else if (TempPkName == "kr.co.chunjae.android.cjhtmlplayer") {          // 1학기 html5 플레이어 (#20527 sik)

		if (num < 10120) { // 1.1.20 버전 -> 10120
            LayerShow("학습 플레이어(기존)의 새로운 버전이 오픈되었습니다.<br/>홈 화면에서 최신 버전으로 업데이트해주세요.", "LayerHide(null);");
        }
        else {
            externalAppPackage = TempPkName;
            TempPkName = "";
            externalAppContentId = html5_mCode;
			externalAppScheme = "milkt://cjhtmlplayer?id=" + html5_Userid + "&mCode=" + html5_mCode + "&zipPath=" + html5_zipPath + "&createdDate=" + html5_zipDate + "&optionPath=" + html5_optionPath + "&test=" + html5_testYN + "&dictionary=" + "&movieControl=" + html5_movieControl + "&swfControl=" + html5_swfControl + "&edubase=" + html5_edubase + "&testStudy=" + html5_testStudy + "&similar=" + html5_similarTest + "&similarStudy=" + html5_similarStudy + "&challenge=" + html5_challengeTest + "&challengeStudy=" + html5_challengeStudy  + "&strSysUserID=" + jsGetCookie('SysUserId') + "&sttType=" + html5_sttType + "&sttModel=" + html5_sttModel;
            startExternalApp(externalAppPackage, externalAppScheme);
        }
    }
    else if (TempPkName == "kr.co.chunjae.android.cjhtmlplayer2") {          // 1학기 html5 플레이어 (#20527 sik)

		if (num < 10120) { // 1.1.20 버전 -> 10120
            LayerShow("학습 플레이어(신규)의 새로운 버전이 오픈되었습니다.<br/>홈 화면에서 최신 버전으로 업데이트해주세요.", "LayerHide(null);");
        }
        else {
            externalAppPackage = TempPkName;
            TempPkName = "";
            externalAppContentId = html5_mCode;
			externalAppScheme = "milkt://cjhtmlplayer2?id=" + html5_Userid + "&mCode=" + html5_mCode + "&zipPath=" + html5_zipPath + "&createdDate=" + html5_zipDate + "&optionPath=" + html5_optionPath + "&test=" + html5_testYN + "&dictionary=" + "&movieControl=" + html5_movieControl + "&swfControl=" + html5_swfControl + "&edubase=" + html5_edubase + "&testStudy=" + html5_testStudy + "&similar=" + html5_similarTest + "&similarStudy=" + html5_similarStudy + "&challenge=" + html5_challengeTest + "&challengeStudy=" + html5_challengeStudy + "&strSysUserID=" + jsGetCookie('SysUserId') + "&sttType=" + html5_sttType + "&sttModel=" + html5_sttModel;
            startExternalApp(externalAppPackage, externalAppScheme);
        }
    }
    else if (TempPkName == "kr.co.chunjae.android.GeniusStudy") {          // 도형의 성

        TempPkName = "";

        if (num < 10001) { // 버전 1.0.1
            LayerShow("도형의 성의 새로운 버전이 오픈되었습니다.<br/>홈 화면에서 최신 버전으로 업데이트해주세요.", "LayerHide(null);");
        }
        else {
            startExternalApp("kr.co.chunjae.android.GeniusStudy", "milkt://geniusstudy");
        }
    }
    else if (TempPkName == "RAPIAirViewerApp3.0") {          // 수준별 영어 등 라피 3.0 호출 시
        TempPkName = "";

        if (num < 10312) { // 1.3.6버전 -> 10306
            LayerShow("플래시뷰어의 새로운 버전이 오픈되었습니다.<br/>홈 화면에서 최신 버전으로 업데이트해주세요.", "LayerHide(null);");
        }
        else {
            try {
                if (FlashPlayerZip_isPocket == false) {
                    window.HybridApp.openFlashPlayerZip(FlashPlayerZip_strFile, FlashPlayerZip_mCode, FlashPlayerZip_isPocket);
                }
                else {
                    window.HybridApp.openFlashPlayerZip(FlashPlayerZip_strFile, FlashPlayerZip_mCode);
                }

                externalAppPackage = "kr.hbstudy.apphbstudy";
                externalAppContentId = FlashPlayerZip_mCode;
                externalAppScheme = "window.HybridApp.openFlashPlayerZip";
            }
            catch (ex) { window.HybridApp.openFlashPlayerZip(FlashPlayerZip_strFile); }

            openZipFile_StudyHis_Ins(FlashPlayerZip_mCode, "N");
        }
    }
    else if (TempPkName == "com.logibrothers.lcstudy") {          // 코딩모험
        TempPkName = "";

        if (num < 10107) { // 버전 1.3.5
            LayerShow("코딩모험의 새로운 버전이 오픈되었습니다.<br/>홈 화면에서 최신 버전으로 업데이트해주세요.", "LayerHide(null);");
        }
    }
    else if (TempPkName == "kr.co.chunjae.android.ummiche") {    //음미체
        TempPkName = "";
        if (num < 40003) { // 버전 4.0.3
            LayerShow("음미체의 새로운 버전이 오픈되었습니다.<br/>홈 화면에서 최신 버전으로 업데이트해주세요.", "LayerHide(null);");
        }
        else {
            externalAppPackage = "kr.co.chunjae.android.ummiche";
            externalAppScheme = "milkt://ummiche?serverUrl=" + getAppHost() + "&filePath=cdata.milkt.co.kr/edubank" + Extra_lmValue + "&userId=" + Extra_userID + "&mCode=" + cjAir_mCode + "&completeYn=" + Extra_completeYn + "&lecType=" + Extra_lecType;

            startExternalApp(externalAppPackage, externalAppScheme);
        }

        Extra_userID = "";
        cjAir_mCode = "";
        Extra_lmValue = "";
        Extra_completeYn = "";
        Extra_lecType = "";
    }
    else if (TempPkName == "kr.co.chunjae.android.livehistory1") {          // 라이브 한국사

        TempPkName = "";

        if (num < 10001) { // 버전 1.0.1
            LayerShow("라이브 한국사의 새로운 버전이 오픈되었습니다.<br/>홈 화면에서 최신 버전으로 업데이트해주세요.", "LayerHide(null);");
        }
        else {
            externalAppPackage = "kr.co.chunjae.android.livehistory1";
            externalAppScheme = "milkt://livehistory1";

            startExternalApp(externalAppPackage, externalAppScheme);
        }
    }
    else if (TempPkName == "com.chunjae.livehistorygame1") {          // #66141 - 라이브 한국사 v2

        TempPkName = "";

        //if (num < 10001) { // 버전 1.0.1
        //	LayerShow("라이브 한국사의 새로운 버전이 오픈되었습니다.<br/>홈 화면에서 최신 버전으로 업데이트해주세요.", "LayerHide(null);");
        //}
        //else {
        externalAppPackage = "com.chunjae.livehistorygame1";
        externalAppScheme = "milkt://livehistorygame1";

        startExternalApp(externalAppPackage, externalAppScheme);
        //}
    }
    else if (TempPkName == "com.chunjae.kidspeech") {          // 키즈스피치
        TempPkName = "";
        TempParaURL = "milkt://kidsspeech?serverUrl=" + getAppHost() + "&userId=" + cjAir_Userid + "&mCode=" + cjAir_mCode;
        if (num < 10004) { // 버전 1.0.2
            LayerShow("키즈 스피치의 새로운 버전이 오픈되었습니다.<br/>홈 화면에서 최신 버전으로 업데이트해주세요.", "LayerHide(null);");
        }
        else {
            externalAppPackage = "com.chunjae.kidspeech";
            externalAppScheme = TempParaURL;
            externalAppContentId = cjAir_mCode;

            startExternalApp(externalAppPackage, externalAppScheme);
        }
    }
    else if (TempPkName == "com.chunjae.safelife1") {          // 안전한 생활1
        TempPkName = "";
        TempParaURL = "milkt://safelife1?serverUrl=" + getAppHost() + "&filePath=pd.onetimetest.gscdn.com:8080/onetime/milkT/app/Services/2018" + Extra_lmValue + "&userId=" + cjAir_Userid + "&mCode=" + cjAir_mCode + "&completeYn=" + Extra_completeYn;
        if (isDevelopment()) {
            TempParaURL = "milkt://safelife1?serverUrl=" + getAppHost() + "&filePath=pd.onetimetest.gscdn.com:8080/onetime/milkT/app/Tests/2018" + Extra_lmValue + "&userId=" + cjAir_Userid + "&mCode=" + cjAir_mCode + "&completeYn=" + Extra_completeYn;
        }

        if (num < 10006) { // 버전 1.0.6
            LayerShow("안전한 생활의 새로운 버전이 오픈되었습니다.<br/>홈 화면에서 최신 버전으로 업데이트해주세요.", "LayerHide(null);");
        }
        else {
            externalAppPackage = "com.chunjae.safelife1";
            externalAppScheme = TempParaURL;
            externalAppContentId = cjAir_mCode;

            startExternalApp(externalAppPackage, externalAppScheme);
        }

        Extra_lmValue = "";
        cjAir_Userid = "";
        cjAir_mCode = "";
        Extra_completeYn = "";
    }
    else if (TempPkName == "com.chunjae.safelife2") {          // 안전한 생활2
        TempPkName = "";
        TempParaURL = "milkt://safelife2?serverUrl=" + getAppHost() + "&filePath=pd.onetimetest.gscdn.com:8080/onetime/milkT/app/Services/2018" + Extra_lmValue + "&userId=" + cjAir_Userid + "&mCode=" + cjAir_mCode + "&completeYn=" + Extra_completeYn;
        if (isDevelopment()) {
            TempParaURL = "milkt://safelife2?serverUrl=" + getAppHost() + "&filePath=pd.onetimetest.gscdn.com:8080/onetime/milkT/app/Tests/2018" + Extra_lmValue + "&userId=" + cjAir_Userid + "&mCode=" + cjAir_mCode + "&completeYn=" + Extra_completeYn;
        }

        if (num < 10006) { // 버전 1.0.6
            LayerShow("안전한 생활의 새로운 버전이 오픈되었습니다.<br/>홈 화면에서 최신 버전으로 업데이트해주세요.", "LayerHide(null);");
        }
        else {
            externalAppPackage = "com.chunjae.safelife2";
            externalAppScheme = TempParaURL;
            externalAppContentId = cjAir_mCode;

            startExternalApp(externalAppPackage, externalAppScheme);
        }

        Extra_lmValue = "";
        cjAir_Userid = "";
        cjAir_mCode = "";
        Extra_completeYn = "";
    }
    else if (TempPkName == "kr.co.chunjae.android.gobrain") {   // 고브레인
        TempParaURL = "gobrain://milkt?gobrainid=" + Extra_userID + "&milktid=" + Extra_milktid + "&milktname=" + Extra_milktname + "&milktgrade=" + Extra_milktgrade + "&classcd=" + Extra_classcd

        TempPkName = "";
        Extra_userID = "";
        Extra_milktid = "";
        Extra_milktname = "";
        Extra_milktgrade = "";
        Extra_classcd = "";

        if (num < 10008) { // 버전 1.0.7
            LayerShow("고브레인 새로운 버전이 오픈되었습니다.<br/>홈 화면에서 최신 버전으로 업데이트해주세요.", "LayerHide(null);");
        }
        else {
            externalAppPackage = "kr.co.chunjae.android.gobrain";
            externalAppScheme = TempParaURL;

            startExternalApp(externalAppPackage, externalAppScheme);
        }
    }
    else if (TempPkName == "kr.co.chunjae.android.upenglish") {   // ABC 영어 1.0.9
        TempPkName = "";
        TempParaURL = "milkt://upenglish?userid=" + cjAir_Userid + "&gubun=" + upEng_gubun;
        cjAir_Userid = "";
        upEng_gubun = "";

        if (num < 10010) { // 버전 1.0.10
            LayerShow("영어앱 새로운 버전이 오픈되었습니다.<br/>홈 화면에서 최신 버전으로 업데이트해주세요.", "LayerHide(null);");
        }
        else {
            externalAppPackage = "kr.co.chunjae.android.upenglish";
            externalAppScheme = TempParaURL;

            startExternalApp(externalAppPackage, externalAppScheme);
        }

    }
    else if (TempPkName == "com.milkt.card") {   // 한글카드 1.0.3
        TempParaURL = "milkcard://launch?mcode=" + Extra_lmValue + "&userid=" + Extra_userID;

        if (num < 10003) { // 버전 1.0.3
            LayerShow("한글카드 새로운 버전이 오픈되었습니다.<br/>홈 화면에서 최신 버전으로 업데이트해주세요.", "LayerHide(null);");
        }
        else {
            externalAppPackage = "com.milkt.card";
            externalAppScheme = TempParaURL;
            externalAppContentId = Extra_lmValue;

            startExternalApp(externalAppPackage, externalAppScheme);
        }

        TempPkName = "";
        Extra_lmValue = "";
        Extra_userID = "";
        Extra_milktid = "";
        Extra_milktname = "";
        Extra_milktgrade = "";
        Extra_classcd = "";
    }
    else if (TempPkName == "com.milkt.camera") {   // 한글사진 1.0.6
        TempParaURL = "milkcamera://launch?mcode=" + Extra_lmValue + "&userid=" + Extra_userID;

        if (num < 10006) { // 버전 1.0.6
            LayerShow("한글사진 새로운 버전이 오픈되었습니다.<br/>홈 화면에서 최신 버전으로 업데이트해주세요.", "LayerHide(null);");
        }
        else {
            externalAppPackage = "com.milkt.camera";
            externalAppScheme = TempParaURL;
            externalAppContentId = Extra_lmValue;

            startExternalApp(externalAppPackage, externalAppScheme);
        }

        TempPkName = "";
        Extra_lmValue = "";
        Extra_userID = "";
        Extra_milktid = "";
        Extra_milktname = "";
        Extra_milktgrade = "";
        Extra_classcd = "";
    }
    else if (TempPkName == "com.chunjae.samething") {   // MR(무엇이 똑같을까)
        TempParaURL = "milkt://" + Extra_milktname + "?serverUrl=" + getAppHost() + "&filePath=pd.onetimetest.gscdn.com:8080/onetime/milkT/app/Services/2018/" + Extra_milktname + "&userId=" + Extra_userID + "&mCode=" + Extra_lmValue;

        if (num < 10003) { // 버전 1.0.3
            LayerShow("\"무엇이 똑같을까?\" 새로운 버전이 오픈되었습니다.<br/>홈 화면에서 최신 버전으로 업데이트해주세요.", "LayerHide(null);");
        }
        else {
            externalAppPackage = "com.chunjae.samething";
            externalAppScheme = TempParaURL;
            externalAppContentId = Extra_lmValue;

            startExternalApp(externalAppPackage, externalAppScheme);
            complete_3DStudy("2", "0");
        }

        TempPkName = "";
        Extra_userID = "";
        Extra_milktname = "";
        Extra_lmValue = "";
    }
    else if (TempPkName == "com.chunjae.lightpath") {   // MR(빛이 나아가는 길)
        TempParaURL = "milkt://" + Extra_milktname + "?serverUrl=" + getAppHost() + "&filePath=pd.onetimetest.gscdn.com:8080/onetime/milkT/app/Services/2018/" + Extra_milktname + "&userId=" + Extra_userID + "&mCode=" + Extra_lmValue;

        if (num < 10003) { // 버전 1.0.3
            LayerShow("\"빛이 나아가는 길\" 새로운 버전이 오픈되었습니다.<br/>홈 화면에서 최신 버전으로 업데이트해주세요.", "LayerHide(null);");
        }
        else {
            externalAppPackage = "com.chunjae.lightpath";
            externalAppScheme = TempParaURL;
            externalAppContentId = Extra_lmValue;

            startExternalApp(externalAppPackage, externalAppScheme);
            complete_3DStudy("2", "0");
        }

        TempPkName = "";
        Extra_userID = "";
        Extra_milktname = "";
        Extra_lmValue = "";
    }
    else if (TempPkName == "kr.co.chunjaetext.android.edits") { // 첨삭과외
        var editsUrl = "edits.milkt.co.kr";
        if (isDevelopment()) {
            editsUrl = "test-edits.milkt.co.kr";
        } else if (isStaging()) {
            editsUrl = "st-edits.milkt.co.kr";
        }

        TempPkName = "";
        if (num < 20108) { // 버전 2.1.8
            LayerShow("첨삭과외 새로운 버전이 오픈되었습니다.<br/>홈 화면에서 최신 버전으로 업데이트해주세요.", "LayerHide(null);");
        }
        else {
            var UserId = $("input#hid_UserID").val();

            /*************************************************/
            // 안상욱_2020.02.12 #47488
            var GetCookie_JoinRouteName = escape(jsGetCookie("JoinRouteName"));
            var DecodeJoinRouteName = decodeURI(GetCookie_JoinRouteName);

            externalAppPackage = "kr.co.chunjaetext.android.edits";
            externalAppScheme = "milktapp://edits?host=http://" + editsUrl + "&cCode=" + hid_cCode + "&UserId=" + UserId + "&JoinRouteName=" + DecodeJoinRouteName;

            startExternalApp(externalAppPackage, externalAppScheme);
            //startExternalApp("kr.co.chunjaetext.android.edits", "milktapp://edits?host=http://" + editsUrl + "&cCode=" + hid_cCode + "&UserId=" + UserId);
            /*************************************************/
        }
    }
    else if (TempPkName == "kr.co.chunjae.android.schoollife1") {   // 학교 체험
        TempParaURL = "milkt://schoollife1?userid=" + Extra_userID + "&mcode=" + cjAir_mCode;

        if (num < 10000) { // 버전 1.0.0
            LayerShow("학교 체험 새로운 버전이 오픈되었습니다.<br/>홈 화면에서 최신 버전으로 업데이트해주세요.", "LayerHide(null);");
        }
        else {
            externalAppPackage = "kr.co.chunjae.android.schoollife1";
            externalAppScheme = TempParaURL;
            externalAppContentId = cjAir_mCode;

            startExternalApp(externalAppPackage, externalAppScheme);
        }

        TempPkName = "";
        Extra_userID = "";
        cjAir_mCode = "";
    }
    else if (TempPkName == "kr.co.chunjae.android.drawingdiary") {   // 일기쓰기
        TempPkName = "";
        if (num < 10006) { // 버전 1.0.6
            LayerShow("일기쓰기 새로운 버전이 오픈되었습니다.<br/>홈 화면에서 최신 버전으로 업데이트해주세요.", "LayerHide(null);");
        }
        else {
            externalAppPackage = "kr.hbstudy.apphbstudy";
            externalAppScheme = "window.HybridApp.startDrawingDiary";

            window.HybridApp.startDrawingDiary(Diary_UserId, Diary_Year, Diary_Month, Diary_Day);
        }
    }
    else if (TempPkName == "com.chunjae.collectinginsect") {   // 곤충 숨바꼭질 // ASK#46821
        TempParaURL = "milkt://collectinginsect?serverUrl=" + getAppHost() + "&filePath=pd.onetimetest.gscdn.com:8080/onetime/milkT/app/Services/2019/CollectingInsect&userId=" + Extra_userID + "&mCode=T0WE00U01001&completeYn=";
        TempPkName = "";
        Extra_userID = "";
        if (num < 20002) { // 버전 2.0.2
            LayerShow("곤충 숨바꼭질 새로운 버전이 오픈되었습니다.<br/>홈 화면에서 최신 버전으로 업데이트해주세요.", "LayerHide(null);");
        }
        else {
            externalAppPackage = "com.chunjae.collectinginsect";
            externalAppScheme = TempParaURL;

            startExternalApp(externalAppPackage, externalAppScheme);
        }
    }
    else if (TempPkName == "com.chunjae.seaanimals.kids") { //#111084 밀크T키즈 디지털체험 바다 탐험 오픈의 건

        externalAppPackage = "com.chunjae.seaanimals.kids";
        externalAppScheme = "milkt://kids_seaanimals";
        TempPkName = "";
        Extra_userID = "";

        startExternalApp(externalAppPackage, externalAppScheme);
    }
    else if (TempPkName == "com.chunjae.paintingstudy") {   // 색칠공부 // ASK#46821 , YS#82484(2학기 개편)
        //테스트 서버 호출
        //TempParaURL = "milkt://paintingstudy?serverUrl=" + getAppHost() + "&filePath=pd.onetimetest.gscdn.com:8080/onetime/milkT/app/Tests/2019/PaintingStudy&userId=" + Extra_userID + "&mCode=" + color_mcode + "&SysUserId=" + System_userID;
        //스테이징 및 실서버 호출
        TempParaURL = "milkt://paintingstudy?serverUrl=" + getAppHost() + "&filePath=pd.onetimetest.gscdn.com:8080/onetime/milkT/app/Services/2019/PaintingStudy&userId=" + Extra_userID + "&mCode=" + color_mcode + "&SysUserId=" + System_userID;

        if (num < 10104) { // 버전 1.1.4
            LayerShow("색칠공부 새로운 버전이 오픈되었습니다.<br/>홈 화면에서 최신 버전으로 업데이트해주세요.", "LayerHide(null);");
        }
        else {
            externalAppPackage = "com.chunjae.paintingstudy";
            externalAppScheme = TempParaURL;
            externalAppContentId = color_mcode;

            startExternalApp(externalAppPackage, externalAppScheme);
        }

        TempPkName = "";
        Extra_userID = "";
        color_mcode = "";
    }
    else if (TempPkName == "com.milkt.piano") {   // 동당동당 피아노 // ASK#46821
        TempPkName = "";
        if (num < 10001) { // 버전 1.0.1
            LayerShow("동당동당 피아노 새로운 버전이 오픈되었습니다.<br/>홈 화면에서 최신 버전으로 업데이트해주세요.", "LayerHide(null);");
        }
        else {
            externalAppPackage = "com.milkt.piano";
            externalAppScheme = "milkt://dingdongpiano";

            startExternalApp(externalAppPackage, externalAppScheme);
        }
    }
    else if (TempPkName == "com.chunjae.foreshorekids") {   // 갯벌 친구 찾기
        TempParaURL = "milkt://foreshorekids?serverUrl=" + getAppHost() + "&filePath=pd.onetimetest.gscdn.com:8080/onetime/milkT/app/Services/2021/Foreshore";
        TempPkName = "";
        Extra_userID = "";
        if (num < 10000) { // 버전 1.0.0
            LayerShow("갯벌 친구 찾기 새로운 버전이 오픈되었습니다.<br/>홈 화면에서 최신 버전으로 업데이트해주세요.", "LayerHide(null);");
        }
        else {
            externalAppPackage = "com.chunjae.foreshorekids";
            externalAppScheme = TempParaURL;

            startExternalApp(externalAppPackage, externalAppScheme);
        }
    }
    else if (TempPkName == "com.chunjae.kidsspeechkor") {          // 한글 스피치
        TempPkName = "";

        var uploadAPIHost = "http://upload.milkt.co.kr";
        var apiHost = "http://api.milkt.co.kr";
        var appAPIHost = "http://" + getAppHost();
        if (isDevelopment()) {
            uploadAPIHost = "http://dev-upload.milkt.co.kr";
            apiHost = "http://dev-api.milkt.co.kr";
        } else if (isStaging()) {
            uploadAPIHost = "http://st-upload.milkt.co.kr";
            apiHost = "http://st-api.milkt.co.kr";
        }

        TempParaURL = "milkt://kidsspeechkor?userId=" + cjAir_Userid + "&mCode=" + cjAir_mCode + "&SysUserId=" + cjAir_SysUserid + "&UploadAPIHost=" + encodeURIComponent(uploadAPIHost) + "&appAPIHost=" + encodeURIComponent(appAPIHost);

        if (num < 10009) { // 버전 1.0.9
            LayerShow("한글 스피치의 새로운 버전이 오픈되었습니다.<br/>홈 화면에서 최신 버전으로 업데이트해주세요.", "LayerHide(null);");
        }
        else {
            // 어느 경로에서 한글스피치 앱을 실행하는지 체크하기 위해..
            /*try {
                $.ajax({
                    url: apiHost + "/v1/log/exception",
                    type: "POST",
                    accept: "application/json",
                    contentType: "application/json; charset=utf-8",
                    data: JSON.stringify({
                        SiteKey: "44B7AA58-0004-4DB7-9F62-F60518F14773",
                        RequestUrl: "Kor_Speech_App_Execute",
                        RefererUrl: document.location.href,
                        RequestHeaders: document.cookie,
                        ResponseText: JSON.stringify({
                            "UserId": cjAir_Userid
                            , "mCode": cjAir_mCode
                            , "SysUserId": cjAir_SysUserid
                        })
                    }),
                    dataType: "json",
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader("clientSiteKey", "44B7AA58-0004-4DB7-9F62-F60518F14773");
                    },
                    success: function (data) {

                    },
                    error: function (a, b, c) {

                    }
                });
            } catch (e) {
            }*/

            externalAppPackage = "com.chunjae.kidsspeechkor";
            externalAppScheme = TempParaURL;
            externalAppContentId = cjAir_mCode;

            startExternalApp(externalAppPackage, externalAppScheme);
        }
    }
    else if (TempPkName == "com.milktcodingexit") {   // 코드탈출
        TempParaURL = "milkt_codingexit://post_mainactivity?UserName=" + Extra_milktid + "&WebDNS=" + getAppHost() + "&ApiDNS=" + getAppHost() + "&moveTo=main&mp4Url=pd.onetimetest.gscdn.com:8080/onetime/CodeEscape/&dataUrl=cdndata.milkt.co.kr/ele/app/data/CodeEscape/"
        Extra_milktid = "";
        //alert(TempParaURL + " : " + num);
        if (num < 10006) { // 버전 1.0.6
            LayerShow("코드탈출 새로운 버전이 오픈되었습니다.<br/>홈 화면에서 최신 버전으로 업데이트해주세요.", "LayerHide(null);");
        }
        else {
            externalAppPackage = "com.milktcodingexit";
            externalAppScheme = TempParaURL;

            startExternalApp(externalAppPackage, externalAppScheme);
        }
    }
    else if (TempPkName == "kr.co.chunjae.android.entry") {   // 엔트리앱
        TempParaURL = "milkt_entry://post_splash?url=https://playentry.org/ws/new&mode=1";

        //alert(TempParaURL + " : " + num);
        if (num < 10114) { // 버전 1.0.3
            LayerShow("엔트리 새로운 버전이 오픈되었습니다.<br/>홈 화면에서 최신 버전으로 업데이트해주세요.", "LayerHide(null);");
        }
        else {
            externalAppPackage = "kr.co.chunjae.android.entry";
            externalAppScheme = TempParaURL;

            startExternalApp(externalAppPackage, externalAppScheme);
        }
    }
    else if (TempPkName == "org.manlev.rungame") {   //뛰어VOCA

        var userId = jsGetCookie("SysUserId");
        var userName = strSysUserID;
        var name = escape(jsGetCookie("Name"));
        var grade = jsGetCookie("Grade");
        //var webdms = "st-app.milkt.co.kr";
        //var webdms = "app.milkt.co.kr";
        //var webdns = "st-runningvoca.milkt.co.kr";
        var webdns = "runningvoca.milkt.co.kr";
        if (isDevelopment()) {
            webdns = "st-runningvoca.milkt.co.kr";//getAppHost();
        } else if (isStaging()) {
            webdns = "st-runningvoca.milkt.co.kr";
        }

        //TempParaURL = "milkt_codingexit://post_mainactivity?UserName=" + Extra_milktid + "&WebDNS=app.milkt.co.kr&ApiDNS=app.milkt.co.kr&mp4Url=pd.onetimetest.gscdn.com:8080/onetime/CodeEscape/&dataUrl=cdndata.milkt.co.kr/ele/app/data/CodeEscape/"
        TempParaURL = "milkt_rungame://post_app?userid=" + userId + "&username=" + userName + "&webdns=" + webdns + "&grade=" + grade + "&name=" + name;

        //alert("TempParaURL : " + TempParaURL);
        //alert("num : " + num);
        //Extra_milktid = "";
        //alert(TempParaURL + " : " + num);
        //if (num < 10002) { // 버전 1.0.2
        //LayerShow("뛰어VOCA 새로운 버전이 오픈되었습니다.<br/>홈 화면에서 최신 버전으로 업데이트해주세요.", "LayerHide(null);");
        //}
        //else {
        //startExternalApp("org.manlev.rungame", TempParaURL);
        //}
        //startExternalApp("org.manlev.rungame", TempParaURL);
        //try { window.HybridApp.startExternalAppNewTask("org.manlev.rungame", TempParaURL); }
        if (num < 10001) { // 버전 1.0.1
            LayerShow("뛰어VOCA 새로운 버전이 오픈되었습니다.<br/>홈 화면에서 최신 버전으로 업데이트해주세요.", "LayerHide(null);");
        }
        else {
            try {
                externalAppPackage = "org.manlev.rungame";
                externalAppScheme = TempParaURL;

                window.HybridApp.startExternalApp(externalAppPackage, externalAppScheme);
            }
            catch (ex) {
                console.log(ex);
            }
        }
        return;
    }
    else if (TempPkName == "kr.co.chunjae.android.threemin") {      // 3분 쿡쿡

        TempPkName = "";

        if (num < 20021) {	//버전 2.0.21
            LayerShow("3분 쿡쿡의 새로운 버전이 오픈되었습니다.<br/>홈 화면에서 최신 버전으로 업데이트해주세요.", "LayerHide(null);");
        } else {
            if (strDailyarithmeticText != "") {
                externalAppPackage = "kr.co.chunjae.android.threemin";
                externalAppScheme = strDailyarithmeticText;

                startExternalApp(externalAppPackage, externalAppScheme);
                strDailyarithmeticText = "";
            } else if (threeminAppExecuteString != "") {
                externalAppPackage = "kr.co.chunjae.android.threemin";
                externalAppScheme = threeminAppExecuteString;

                startExternalApp(externalAppPackage, externalAppScheme);
                threeminAppExecuteString = "";
            } else {
                LayerShow("3분 쿡쿡을 실행하지 못했습니다. 다시 로그인 후 이용 해주시기 바랍니다.", "LayerHide(null);");
            }
        }
    }
    else if (TempPkName == "com.chunjae.spptangram") {      // 칠교놀이

		/*
		 - AppName : 칠교놀이
		- versionName : 1.0.6
		- versionCode : 7
		- 업데이트 내용 : 신규 차시 추가(6, 7단계 - 18개 차시), spptangramevent(칠교놀이 이벤트) 앱 통합
		*/

        TempPkName = "";
        var userId = jsGetCookie("UserID");
        //alert(userId);

        //alert(isStaging());

        var filePath = "pd.onetimetest.gscdn.com:8080/onetime/milkT/app/Services/2020/SppTangram";
        if (isDevelopment()) {
            filePath = "pd.onetimetest.gscdn.com:8080/onetime/milkT/app/Tests/2020/SppTangram";
        }

        if (num < 10006) { // 버전 1.0.6
            LayerShow("칠교놀이의 새로운 버전이 오픈되었습니다.<br/>홈 화면에서 최신 버전으로 업데이트해주세요.", "LayerHide(null);");
        }
        else {
            externalAppPackage = "com.chunjae.spptangram";
			externalAppScheme = "milkt://spptangram?serverUrl=" + getAppHost() + "&filePath=" + filePath + "&userId=" + userId + "&lecType=T_TANGRAM&mCode=" + cjAir_mCode;

            startExternalApp(externalAppPackage, externalAppScheme);
        }
    }

    else if (TempPkName == "com.chunjae.crosswordKids") { //#115784 밀크T키즈 십자말풀이 오픈의 건

        TempPkName = "";
        var userId = jsGetCookie("UserID");

        var filePath = "pd.onetimetest.gscdn.com:8080/onetime/milkT/app/Services/2023/CrossWordKids/data";
        if (isDevelopment()) {
            filePath = "pd.onetimetest.gscdn.com:8080/onetime/milkT/app/Tests/2023/CrossWordKids/data";
        }

        externalAppPackage = "com.chunjae.crosswordKids";
        externalAppScheme = "milkt://crosswordKids?serverUrl=" + getAppHost() + "&filePath=" + filePath + "&userId=" + userId + "&lecType=T_crossWORDkids&mCode=" + _crosswordPuzzle_mCode;

        startExternalApp(externalAppPackage, externalAppScheme);

    } //\\#115784 밀크T키즈 십자말풀이 오픈의 건

    else if (TempPkName == "co.kr.chunjae.findanotherpicture") { //#114593 키즈 디지털체험 다른 그림 찾기 오픈의 건

        TempPkName = "";
        var userId = jsGetCookie("UserID");

        var filePath = "pd.onetimetest.gscdn.com:8080/onetime/milkT/app/Services/2024/FindAnotherPicture/data";
        if (isDevelopment()) {
            filePath = "pd.onetimetest.gscdn.com:8080/onetime/milkT/app/Tests/2024/FindAnotherPicture/data";
        }

        externalAppPackage = "co.kr.chunjae.findanotherpicture";
        externalAppScheme = "milkt://findanotherpicture?serverUrl=" + getAppHost() + "&filePath=" + filePath + "&userId=" + userId + "&mCode=" + _spotTheDifference_mCode;

        startExternalApp(externalAppPackage, externalAppScheme);

    } //\\#114593 키즈 디지털체험 다른 그림 찾기 오픈의 건

    //#56726 AI 구구단 게임 서비스 개발요청
    else if (TempPkName == "com.chunjae.gugudan") {

        var userName = jsGetCookie("UserID");
        var userId = jsGetCookie("SysUserId");
        var grade = jsGetCookie("Grade");

        TempParaURL = "milkt://gugudan?serverUrl=" + getAppHost() + "&userId=" + userName + "&Grade=" + grade + "&SysUserId=" + userId;

        //AI 구구단(1.0.10) 버전코드 : 11 - #85147 AI 구구단(십구단) 추가 고도화
        if (num < 10010) {
            LayerShow("AI 구구단 게임 새로운 버전이 오픈되었습니다.<br/>홈 화면에서 최신 버전으로 업데이트해주세요.", "LayerHide(null);");
        }
        else {
            externalAppPackage = "com.chunjae.gugudan";
            externalAppScheme = TempParaURL;

            startExternalApp(externalAppPackage, externalAppScheme);
        }
    }

    // 셀바스 음성인식 공통앱 ask#59568
    else if (TempPkName == "kr.co.chunjae.android.stt") {
        TempPkName = "";

        if (num < 10000) { // 버전 1.0.0
            SpeechRecognition_param = "";
            LayerShow("음성인식의 새로운 버전이 오픈되었습니다.<br/>홈 화면에서 최신 버전으로 업데이트해주세요.", "LayerHide(null);");
        }
        else {
            window.HybridApp.requestSpeechRecognition(SpeechRecognition_param);
            SpeechRecognition_param = "";
        }

    }

    // 천재 음성인식 공통앱 #98053
    else if (TempPkName == "kr.co.chunjae.android.cjstt") {
        TempPkName = "";

        if (num < 10000) { // 버전 1.0.0
            CjSpeechRecognition_param = "";
            LayerShow("음성인식의 새로운 버전이 오픈되었습니다.<br/>홈 화면에서 최신 버전으로 업데이트해주세요.", "LayerHide(null);");
        }
        else {
            window.HybridApp.requestCJSpeechRecognition(CjSpeechRecognition_param);
            CjSpeechRecognition_param = "";
        }

    }

    // 밀크T 지오그래픽 ask#58609
    else if (TempPkName == "com.MILKT.TapTapGeographic") {
        if (num < 10002) { // 버전 1.0.0
            LayerShow("밀크T 지오그래픽의 새로운 버전이 오픈되었습니다.<br/>홈 화면에서 최신 버전으로 업데이트해주세요.", "LayerHide(null);");
        }
        else {
            externalAppPackage = TempPkName;
            externalAppScheme = "TapTapGeographic://post_splash?serverUrl=" + getAppHost() + "&userid=" + Extra_milktid + "&usergrade=" + Extra_milktgrade + "&usertype=E";

            // userid : 학습생 아이디, usergrade = 학습생 학년, usertype = 학년등급 (E : 초등)
            startExternalApp(externalAppPackage, externalAppScheme);
        }

        TempPkName = "";
        Extra_milktid = "";
        Extra_milktgrade = "";

    }
	/*
    // 12월 이벤트
    else if (TempPkName == "com.chunjae.spptangramevent") {      // 칠교놀이

        TempPkName = "";
        var userId = jsGetCookie("UserID");


        if (num < 10002) { // 버전 1.0.2
            LayerShow("칠교놀이의 새로운 버전이 오픈되었습니다.<br/>홈 화면에서 최신 버전으로 업데이트해주세요.", "LayerHide(null);");
        } else {
            externalAppPackage = "com.chunjae.spptangramevent";
            externalAppScheme = "milkt://spptangramevent?serverUrl=" + getAppHost() + "&userId=" + userId + "&lecType=T_MONTLY_EVENT&mcode=" + color_mcode;

            //alert("milkt://spptangramevent?serverUrl=" + getAppHost() + "&userId=" + userId + "&lecType=T_MONTLY_EVENT&mcode=" + color_mcode);
            startExternalApp(externalAppPackage, externalAppScheme);
        }
    }
	*/
    else if (TempPkName == "com.thehrder.thegallery") { // 더 갤러리

        if (num < 10000) {
            LayerShow("더 갤러리 새로운 버전이 오픈되었습니다.<br/>홈 화면에서 최신 버전으로 업데이트해주세요.", "LayerHide(null);");
        }
        else {
            var sUserId = jsGetCookie("SysUserId");

            externalAppPackage = TempPkName;
            externalAppScheme = "milkt_thegallery://post_UnityPlayerActivity?serverUrl=" + getAppHost() + "&sUserId=" + sUserId;

            startExternalApp(externalAppPackage, externalAppScheme);
        }

        TempPkName = "";
    }

    else if (TempPkName == "com.chunjae.simsimdraw") {      // 슥슥 그려요

        TempPkName = "";
        var userId = jsGetCookie("UserID");
        //alert(userId);

        //alert(isStaging());

        var filePath = "pd.onetimetest.gscdn.com:8080/onetime/milkT/app/Services/2022/Simsim";
        if (isDevelopment()) {
            filePath = "pd.onetimetest.gscdn.com:8080/onetime/milkT/app/Tests/2022/Simsim";
        }

        if (num < 10000) { // 버전 1.0.0
            LayerShow("슥슥 그려요의 새로운 버전이 오픈되었습니다.<br/>홈 화면에서 최신 버전으로 업데이트해주세요.", "LayerHide(null);");
        }
        else {
            externalAppPackage = "com.chunjae.simsimdraw";
            externalAppScheme = "milkt://simsimdrawing?serverUrl=" + getAppHost() + "&filePath=" + filePath + "&userId=" + userId + "&MCode=&lecType=T_Drawing";

            startExternalApp(externalAppPackage, externalAppScheme);
        }
    }

    else if (TempPkName == "com.chunjae.simsimobserve") {      // 쏙쏙 찾아요

        TempPkName = "";
        var userId = jsGetCookie("UserID");
        //alert(userId);

        //alert(isStaging());

        var filePath = "pd.onetimetest.gscdn.com:8080/onetime/milkT/app/Services/2022/Simsim";
        if (isDevelopment()) {
            filePath = "pd.onetimetest.gscdn.com:8080/onetime/milkT/app/Tests/2022/Simsim";
        }

        if (num < 10000) { // 버전 1.0.0
            LayerShow("쏙쏙 찾아요의 새로운 버전이 오픈되었습니다.<br/>홈 화면에서 최신 버전으로 업데이트해주세요.", "LayerHide(null);");
        }
        else {
            externalAppPackage = "com.chunjae.simsimobserve";
            externalAppScheme = "milkt://simsimobserve?serverUrl=" + getAppHost() + "&filePath=" + filePath + "&userId=" + userId + "&MCode=&lecType=T_Observe";


            startExternalApp(externalAppPackage, externalAppScheme);
        }
    }

    //속담 톡톡 - 마무리 학습
    else if (TempPkName == "com.chunjae.proverbtoktok") {

        var filePath = "pd.onetimetest.gscdn.com:8080/onetime/milkT/app/Services/2023/ProverbToktok/Data";

        if (isDevelopment()) {
            filePath = "pd.onetimetest.gscdn.com:8080/onetime/milkT/app/Tests/2023/ProverbToktok/Data";
        }

        if (num < 10000) { // 버전 1.0.0
            LayerShow("속담 톡톡의 새로운 버전이 오픈되었습니다.<br/>홈 화면에서 최신 버전으로 업데이트해주세요.", "LayerHide(null);");
        }
        else {
            var userId = jsGetCookie("UserID");
            var sysUserId = jsGetCookie("SysUserId");

            externalAppPackage = "com.chunjae.proverbtoktok";
            externalAppScheme = "milkt://proverbtoktok?serverUrl=" + getAppHost() + "&filePath=" + filePath + "&userId=" + userId + "&MCode=" + proverbmCode + "&SystemUserId=" + sysUserId;

            startExternalApp(externalAppPackage, externalAppScheme);
        }
    }

    else if (TempPkName == "com.cjtext.drb.dbookpdf") {      // 20230816 디북앱

        TempPkName = "";

        if (num < 10000) {
            LayerShow("디북앱의 새로운 버전이 오픈되었습니다.<br/>홈 화면에서 최신 버전으로 업데이트해주세요.", "LayerHide(null);");
        }
        else {
            window.HybridApp.startDBookApp();

        }
    }
    else if (TempPkName == "com.aicodiny.milkt") {
        TempPkName = "";
        var userId = jsGetCookie("UserID");
        var sysUserId = jsGetCookie("SysUserId");

        externalAppPackage = "com.aicodiny.milkt";

        externalAppScheme = "milkt_aicodiny://post_main?accessToken=" + accessToken;
        accessToken = "";

        if (num < 115) {
            LayerShow("AI코디니앱의 새로운 버전이 오픈되었습니다.<br/>홈 화면에서 최신 버전으로 업데이트해주세요.", "LayerHide(null);");
        }
        else {
            startExternalApp(externalAppPackage, externalAppScheme);
        }

    }
    else if (TempPkName == "com.aicodiny.milkt.a6") {
        TempPkName = "";
        var userId = jsGetCookie("UserID");
        var sysUserId = jsGetCookie("SysUserId");

        externalAppPackage = "com.aicodiny.milkt.a6";

        externalAppScheme = "milkt_aicodiny_a6://post_main?accessToken=" + accessToken;
        accessToken = "";
        
        if (num < 10300) {
            LayerShow("AI코디니앱의 새로운 버전이 오픈되었습니다.<br/>홈 화면에서 최신 버전으로 업데이트해주세요.", "LayerHide(null);");
        }
        else {
            startExternalApp(externalAppPackage, externalAppScheme);
        }

    }
    else if (TempPkName == "kr.co.chunjae.android.engbookviewer") { //영어도서관 E-BOOK 뷰어
        TempPkName = "";

        if (num < 10000) {
            LayerShow("영어도서관 E-BOOK 뷰어의 새로운 버전이 오픈되었습니다.<br/>홈 화면에서 최신 버전으로 업데이트해주세요.", "LayerHide(null);");
        }
        else {
            window.HybridApp.openEngEBook(engBookUrl);
        }

    }
    else if (TempPkName == "kr.co.chunjae.android.hmhwebapp") { //HMH 뷰어(Voca/Quiz Time)
        TempPkName = "";

        if (num < 10112) {
            LayerShow("HMH 뷰어의 새로운 버전이 오픈되었습니다.<br/>홈 화면에서 최신 버전으로 업데이트해주세요.", "LayerHide(null);");
        }
        else {
            window.HybridApp.openHMHEBook(ebook_mCode, ebook_level);
        }

    }

	if (externalAppPackage !== null && externalAppScheme !== null) {
		// Caliper Event Dispatcher
		try {
			if (caliperEventNavigation.isEventedExternalApp(externalAppPackage, externalAppScheme)) {
				caliperEventNavigation.dispatchEvent({
					eventType: 'ExternalAppExecute',
					externalAppPackage: externalAppPackage,
					externalAppScheme: externalAppScheme,
					externalAppContentId: externalAppContentId,
					externalAppVersion: versionName
				});
			}
		} catch (e) {
			console.log('Caliper.Event.Dispatcher', e);
		}
	}

	if (milktAppVersion !== null) {
		try {
			window.caliperCore.setMilktAppVersion(milktAppVersion);
		} catch (e) {
			console.log('Caliper.Core', e);
		}
	}

	isCaliperEdAppVersionCheck = false;
}

//#115784 밀크T키즈 십자말풀이 오픈의 건
function openCrosswordPuzzle(mCode) {

	//제한 대상자 체크 (B2B 밀크T 라이트)
	if (objFreeMemberCheck.states == "13") {
		fn_limits_memchek("Close");
	} else {

		//10.1기기에서는 십자말풀이 실행되지 않도록 처리
		if (strModelNm == "SM-P600") {
			LayerShow("사용 중인 기기로는 이용이 불가한 서비스입니다.", "LayerHide(null);");
			return;
		}

		//mCode가 입력되지 않은 경우, _crosswordPuzzle_mCode 초기화
		_crosswordPuzzle_mCode = (mCode == undefined ? '' : mCode);

		try {
			if (typeof window.HybridApp.getVersionName == 'function') {
				TempPkName = "com.chunjae.crosswordKids";
				window.HybridApp.getVersionName(TempPkName);
			}
			else {
				LayerShow("홈 화면에서 최신 버전으로 업데이트해주세요.", "LayerHide(null);");
			}
		}
		catch (ex) { alert(ex); }
	}
} //\\#115784 밀크T키즈 십자말풀이 오픈의 건


//#114593 키즈 디지털체험 다른 그림 찾기 오픈의 건
//다른 그림 찾기 앱 오픈
function openSpotTheDifference(mCode) {

    //10.1기기에서는 다른 그림 찾기 실행되지 않도록 처리
    if (strModelNm == "SM-P600") {
        LayerShow("사용 중인 기기로는 이용이 불가한 서비스입니다.", "LayerHide(null);");
        return;
    }

    //mCode가 입력되지 않은 경우, _spotTheDifference_mCode 초기화
    _spotTheDifference_mCode = (mCode == undefined ? '' : mCode);

    try {
        if (typeof window.HybridApp.getVersionName == 'function') {
            TempPkName = "co.kr.chunjae.findanotherpicture";
            window.HybridApp.getVersionName(TempPkName);
        }
        else {
            LayerShow("홈 화면에서 최신 버전으로 업데이트해주세요.", "LayerHide(null);");
        }
    }
    catch (ex) { alert(ex); }
} //\\openSpotTheDifference //다른 그림 찾기 앱 오픈

//다른 그림 찾기 페이지로 이동
function moveToSpotTheDifference() {

    //10.1기기에서는 다른 그림 찾기 실행되지 않도록 처리
    if (strModelNm == "SM-P600") {
        LayerShow("사용 중인 기기로는 이용이 불가한 서비스입니다.", "LayerHide(null);");
        return;
    }

    //키즈 > 다른 그림 찾기 페이지로 이동
    kids_menu('/AppKids/PlayDigitalSpotTheDifference');

} //\\moveToSpotTheDifference //다른 그림 찾기 페이지로 이동
//\\#114593 키즈 디지털체험 다른 그림 찾기 오픈의 건


// 자기소개하기
function openIntroduction(loginId, userId, categoryId, gubun, year, grade) {

	if (typeof window.HybridApp.getVersionName == 'function') {
		TempPkName = "kr.co.chunjae.introduction";

		Intro_LoginId = loginId;
		Intro_UserId = userId;
		Intro_CategoryId = categoryId;
		Intro_Gubun = gubun;
		Intro_Year = year;
		Intro_Grade = grade;
		window.HybridApp.getVersionName(TempPkName);
	}
	else {
		LayerShow("자기소개하기의 새로운 버전이 오픈되었습니다.<br/>홈 화면에서 최신 버전으로 업데이트해주세요.", "LayerHide(null);");
	}

}

// 일기쓰기
function openDiary(strUserId, year, month, day) {

	if (typeof window.HybridApp.getVersionName == 'function') {
		TempPkName = "kr.co.chunjae.android.drawingdiary";

		Diary_UserId = strUserId;
		Diary_Year = year;
		Diary_Month = month;
		Diary_Day = day;

		window.HybridApp.getVersionName(TempPkName);
	}
	else {
		LayerShow("일기쓰기의 새로운 버전이 오픈되었습니다.<br/>홈 화면에서 최신 버전으로 업데이트해주세요.", "LayerHide(null);");
	}

}

// 매일학교공부 - 예비초등 - 학교 오픈 - 학교체험(시즌 2)
function openSchoolLife(userid, mCode) {
	if (typeof window.HybridApp.getVersionName == 'function') {
		TempPkName = "kr.co.chunjae.android.schoollife1";
		Extra_userID = userid;
		cjAir_mCode = mCode;
		window.HybridApp.getVersionName(TempPkName);
	} else {
		startExternalApp("kr.co.chunjae.android.schoollife1", "milkt://schoollife1?userid=" + userid + "&mcode=" + mCode);
	}
	// 학교 (시즌 1)
	//startExternalApp("kr.co.chunjae.android.schoollife", "milkt://schoollife?userid=" + userid + "&mcode=" + mCode);
}

// 매일학교공부 - 예비초등 - ABC영어 ( 1: 써봐요ABC , 2: (구)불러요ABC, 3: 키즈영어 불러요ABC )
function openUpEng(userid, gubun) {
	//startExternalApp("kr.co.chunjae.android.upenglish", "milkt://upenglish?userid=" + userid + "&gubun=" + gubun);
	cjAir_Userid = userid;
	upEng_gubun = gubun;
	TempPkName = "kr.co.chunjae.android.upenglish";
	window.HybridApp.getVersionName(TempPkName);

}

// 매일학교공부 - 예비초등 - 창의수학 ( A: 앱시작, B: 나의창의노트 )
function openCreativeMath(userid, gubun) {
	//alert("userid : " + userid + ", gubun : " + gubun);
	startExternalApp("kr.co.chunjae.android.creativemath", "milkt://creativemath?userid=" + userid + "&gubun=" + gubun);
}

function StudyMenu_Log_Ins(userid, mcode, menuname, playertype) {

	var selDate = $("#hid_SelDate").val();

	$.ajax({
		type: "post",
		datatype: "json",
		url: "/AppCommon/StudyMenu_Log_Ins",
		data: ({ strUserID: userid, strMenuName: menuname, strSelDate: selDate, strMCode: mcode, strPlayerType: playertype }),
		success: function (data) {

		}
	});
}

var Push_UserName = "";
// 로그인 신호 전달 -> 앱
function LoginNotice() {

	if (typeof window.HybridApp.LoginNotice == 'function') {
		window.HybridApp.LoginNotice();
	}
	else {
		LayerShow("밀크T의 새로운 버전이 오픈되었습니다.<br/>홈 화면에서 최신 버전으로 업데이트해주세요.", "LayerHide(null);");
	}

}



// 기기 모델명
function GetModelName() {


	if (typeof window.HybridApp.getModelName == 'function') {
		window.HybridApp.getModelName();
	}
	else {
		LayerShow("밀크T의 새로운 버전이 오픈되었습니다.<br/>홈 화면에서 최신 버전으로 업데이트해주세요.", "LayerHide(null);");
	}

}

// 170824 smPark 추가
// 사회과학특강
function openSSPlayer(mCode, strLock, completeYN) {
	$("#Lpop_RelatedStudy").hide();
	try {
		window.HybridApp.openSSPlayer(mCode, jsGetCookie("selTopGrade") == jsGetCookie("Grade") ? jsGetCookie("Grade") : jsGetCookie("selTopGrade"), strLock, completeYN);

		// Caliper Event Dispatcher
		try {
			caliperEventNavigation.dispatchEvent({
				eventType: 'ExternalAppExecute',
				externalAppPackage: 'kr.hbstudy.apphbstudy',
				externalAppScheme: 'window.HybridApp.openSSPlayer',
				externalAppContentId: mCode,
				externalAppVersion: null
			});
		} catch (e) {
			console.log('Caliper.Event.Dispatcher', e);
		}
	} catch (ex) {
		// alert(ex);
	}
	return;
}

// 사회과학특강 완강화면 호출
function SSPlayerFinish(cupCnt) {
	try { window.HybridApp.SSPlayerFinish(cupCnt); }
	catch (ex) { alert(ex); }
	return;
}

// 사회과학특강 동영상 플레이
function SSPlayerPlay() {
	try { window.HybridApp.SSPlayerPlay(); }
	catch (ex) { alert(ex); }
	return;
}

// 사회과학특강 수동 완강시그널
function SSPlayerTrueFin() {
	try { window.HybridApp.SSPlayerTrueFin(); }
	catch (ex) { alert(ex); }
	return;
}

// APP에서 아이디 받기 -> 재로그인 (getUserID 호출 시 응답, 학습창 시작&종료 시, 앱 wake up)
function onGetUserID(userid) {
	try {
		$.ajax({
			url: "/AppLogin/ReLogIn",
			type: "post",
			datatype: "json",
			data: ({ strUserID: userid }),
			success: function (data, status) {

			}
		});
	}
	catch (ex) { alert(ex); }
	return;
}

function ReLogin(userid) {
	//alert(userid);
    try {
		$.ajax({
            url: "/dit/AppLogin/ReLogIn2",
			type: "post",
			datatype: "json",
			data: ({ strUserID: userid }),
			success: function (data, status) {

			}
		});
	}
	catch (ex) { alert(ex); }
	return;
}

function getUserID() {
	if (typeof window.HybridApp.getUserID == 'function') {
		window.HybridApp.getUserID();
	}
	else {
		LayerShow("밀크T의 새로운 버전이 오픈되었습니다.<br/>홈 화면에서 최신 버전으로 업데이트해주세요.", "LayerHide(null);");
	}
}

// 천재학습백과
function OpenMilkTEncyclopedia(userid, usergrade) {
	startExternalApp("kr.co.chunjae.android.milkt100", "milktencscheme://milktenc?extra_userid=" + userid + "&extra_usergrade=" + usergrade);
}

function OpenMilkTEncyclopedia(userid, usergrade, strType) {
	var grade = -1
	try {
		grade = jsGetCookie('Grade');
	} catch (e) {

	}

	if (strType == "nodeapp") {
		document.location.href = "intent://milktenc?extra_userid=" + userid + "&extra_usergrade=ELE&grade=" + grade + "#Intent;scheme=milktencscheme;package=kr.co.chunjae.android.milkt100;end";
	} else {
		startExternalApp("kr.co.chunjae.android.milkt100", "milktencscheme://milktenc?extra_userid=" + userid + "&extra_usergrade=" + usergrade + "&grade=" + grade);

	}
}


// 코딩 모험 동의 여부 체크
function OpenLogicong(userid) {
	LogicongAgreeChk(userid);
}

// 코딩 모험 앱 호출
function OpenLogicong_Real(userid) {

	$.ajax({
		url: "/AppForm/LogiCongList_Json",
		type: "post",
		datatype: "json",
		data: ({ extra_userid: userid }),
		success: function (data, status) {
			startExternalApp("com.logibrothers.lcstudy", "logicong://milkt?logicongid=" + data.LogiCongID + "&userid=" + userid + "&name=" + escape(jsGetCookie("Name")) + "&sex=" + escape(jsGetCookie("Gender")) + "&birthdate=" + jsGetCookie("BirthDay") + "&grade=" + jsGetCookie("Grade") + "&stype=elementary");
		}
	});

}

// 3분 시리즈 앱 호출
var threeminAppExecuteString = "";
function OpenThreemin(userid, subject) {

	if (subject == null || subject == undefined) {
		subject = 'E';
	}

	var test = "r"; // 서버 기준 (r : 운영서버, s : 스테이징, t : 개발)
	if (isStaging()) {
		test = "s";
	} else if (isDevelopment()) {
		test = "t";
	}

	$.ajax({
		url: "/AppForm/MinuteList_Json",
		type: "post",
		datatype: "json",
		data: ({ extra_userid: userid }),
		success: function (data, status) {
			if (status == "success" && userid != "") {
				threeminAppExecuteString = "milkt://threemin?threeminid=" + data.AppID + "&userid=" + userid + "&name=" + escape(jsGetCookie("Name")) + "&subject=" + subject + "&grade=" + jsGetCookie("Grade") + "&stype=elementary&test=" + test + "&dailyplay=N&mylevel=0&step=0";

				TempPkName = "kr.co.chunjae.android.threemin";
				window.HybridApp.getVersionName(TempPkName);
			}
			else {
				LayerShow("3분 쿡쿡을 실행하지 못했습니다. 다시 로그인 후 이용 해주시기 바랍니다.", "LayerHide(null);");
			}
		}
	});
}

//#62746 수준별 영어 > 뻥뚫 Listening 신규 오픈의 건
function OpenThreesec() {
	window.HybridApp.threeVocaApp();
}

// 매일연산학습은 3분 시리즈와 같은 앱을 사용
// 매일연산학습 앱 호출, 테스트서버는 test=true, 실서버는 test=false // ask#32296
var strDailyarithmeticText = "";
function Dailyarithmetic(userid, mylevel, step, mcode, template, studyYn, subjectcode, pageType, testType, LecGrade, Gubun, PlayerType, FlashURL, C_VALUE, L_Title, LM_WIDETYPE, jsonData, AutoYn) {
	$.ajax({
		url: "/AppForm/MinuteList_Json",
		type: "post",
		datatype: "json",
		data: ({ extra_userid: userid }),
		success: function (data, status) {

			var test = "r"; // 서버 기준 (r : 운영서버, s : 스테이징, t : 개발)
			if (isStaging()) {
				test = "s";
			} else if (isDevelopment()) {
				test = "t";
			}

			TempPkName = "kr.co.chunjae.android.threemin";

			strDailyarithmeticText = "";
			strDailyarithmeticText += "milkt://threemin?threeminid=" + data.AppID + "&userid=" + userid + "&name=" + escape(jsGetCookie("Name")) + "&subject=E&grade=" + jsGetCookie("Grade") + "&stype=elementary&test=" + test;
			strDailyarithmeticText += "&dailyplay=Y&dailylevel=" + mylevel + "&dailystep=" + step;
			strDailyarithmeticText += "&mcode=" + mcode + "&template=" + template + "&studyYn=" + studyYn + "&subjectcode=" + subjectcode + "&pageType=" + pageType;
			strDailyarithmeticText += "&testType=" + testType + "&LecGrade=" + LecGrade + "&Gubun=" + Gubun + "&PlayerType=" + PlayerType + "&FlashURL=" + FlashURL;
			strDailyarithmeticText += "&C_VALUE=" + C_VALUE + "&L_Title=" + L_Title + "&LM_WIDETYPE=" + LM_WIDETYPE + "&jsonData=" + jsonData + "&AutoYn=" + AutoYn;

			window.HybridApp.getVersionName("kr.co.chunjae.android.threemin");

		}
	});
}

// 음미체앱 호출
function OpenUmiche(userid, mCode, completeYn, lecType, lmValue) {
	if (typeof window.HybridApp.getVersionName == 'function') {
		TempPkName = "kr.co.chunjae.android.ummiche";
		Extra_userID = userid;
		cjAir_mCode = mCode;
		Extra_lmValue = lmValue;
		Extra_completeYn = completeYn;
		Extra_lecType = lecType;
		window.HybridApp.getVersionName(TempPkName);
	}
	else {
		LayerShow("음미체의 새로운 버전이 오픈되었습니다.<br/>홈 화면에서 최신 버전으로 업데이트해주세요.", "LayerHide(null);");
	}
}

// 안전한 생활 호출
function openSafeLife(userid, mCode, completeYn, lmValue, LecGrade) {
	if (LecGrade == 1) {
		TempPkName = "com.chunjae.safelife1";
		Extra_lmValue = lmValue;
		cjAir_Userid = userid;
		cjAir_mCode = mCode;
		Extra_completeYn = completeYn;
		window.HybridApp.getVersionName("com.chunjae.safelife1");
		//startExternalApp("com.chunjae.safelife1", "milkt://safelife1?serverUrl=app.milkt.co.kr&filePath=cdata.milkt.co.kr/edubank" + lmValue + "&userId=" + userid + "&mCode=" + mCode + "&completeYn=" + completeYn);
		//startExternalApp("com.chunjae.safelife1", "milkt://safelife1?serverUrl=app.milkt.co.kr&filePath=pd.onetimetest.gscdn.com:8080/onetime/milkT/app/Services/2018" + lmValue + "&userId=" + userid + "&mCode=" + mCode + "&completeYn=" + completeYn);
	}
	else if (LecGrade == 2) {
		TempPkName = "com.chunjae.safelife2";
		Extra_lmValue = lmValue;
		cjAir_Userid = userid;
		cjAir_mCode = mCode;
		Extra_completeYn = completeYn;
		window.HybridApp.getVersionName("com.chunjae.safelife2");
		//startExternalApp("com.chunjae.safelife2", "milkt://safelife2?serverUrl=app.milkt.co.kr&filePath=cdata.milkt.co.kr/edubank" + lmValue + "&userId=" + userid + "&mCode=" + mCode + "&completeYn=" + completeYn);
		//startExternalApp("com.chunjae.safelife2", "milkt://safelife2?serverUrl=app.milkt.co.kr&filePath=pd.onetimetest.gscdn.com:8080/onetime/milkT/app/Services/2018" + lmValue + "&userId=" + userid + "&mCode=" + mCode + "&completeYn=" + completeYn);
	}
}

// 개편 첨삭 앱 호출 // ask#26452
var hid_cCode = "";
function OpenEdits(cCode) {
	TempPkName = "kr.co.chunjaetext.android.edits";
	hid_cCode = cCode;
	window.HybridApp.getVersionName("kr.co.chunjaetext.android.edits");
}

//AI 서술형평가 앱 호출 //ask#77008
function OpenEdits(cCode) {
	TempPkName = "kr.co.chunjaetext.android.edits";
	hid_cCode = cCode;
	window.HybridApp.getVersionName("kr.co.chunjaetext.android.edits");
}

// 라이브 퀴즈쇼
function OpenLiveQuizShow(name, userId, grade, schoolType) {
	startExternalApp("kr.co.chunjae.android.livequizshow", "milktapp://livequizshow?host=http://livequiz.milkt.co.kr&stGubun=M&strUid=" + userId + "&strUName=" + name + "&strddlUType=" + schoolType + "&strddlUGrade=" + grade);
}

var proverbmCode = "";
// 속담 톡톡 마무리 학습 호출
function OpenProverbToktok(mCode) {
    TempPkName = "com.chunjae.proverbtoktok";
    proverbmCode = mCode;
    window.HybridApp.getVersionName("com.chunjae.proverbtoktok");
}

// 토큰 요청 함수 호출
function GetToken(userId) {

	if (userId != '') {

		Push_UserName = userId;

		if (typeof (window.HybridApp) != "undefined") {
			if (typeof window.HybridApp.getRegistrationId == 'function') {
				window.HybridApp.getRegistrationId(); // 디바이스 토큰 요청 (콜백함수 : OnGetRegistrationId(token);)
			}
			else {	// AI챗봇 주석처리 분기처리 확인필요
				//LayerShow("밀크T의 새로운 버전이 오픈되었습니다.<br/>홈 화면에서 최신 버전으로 업데이트해주세요.", "LayerHide(null);");
			}
		}
	}

}



// 디바이스 토큰 받기(콜백함수)
function OnGetRegistrationId(token) {

	DeviceToken_INS(token);
}


// 디바이스 토큰 등록
function DeviceToken_INS(token) {

	//alert("1 :" + Push_UserName + ", 2 : " + token);

	// 토큰 등록 처리
	$.ajax({
		url: "/AppPush/Insert_Token",
		type: "post",
		data: ({ UserName: Push_UserName, Token: token }),
		success: function (data) {

			if (data == "1") {

				//alert("토큰 등록 완료!!");


				//Login(); // 로그인 처리

			}
			else {
				alert("토큰 등록 오류!!");
			}
		},
		error: function (e) { }
	});


}

// 키즈 앱 전체 화면 실행
function kids_menu(url) {
	window.HybridApp.openKidsView(url);
}

// 키즈 영어 사전 앱 팝업 실행
function openNewView(url) {
	try { window.HybridApp.openNewView(url); }
	catch (ex) { }
	return;
}

// ask#40398
// ask#41632
// 유료콘텐츠 구매 컵 소진
function BuyContentCupUse(type, mCode) {

	$.ajax({
		url: "/AppCommon/BuyContent_Json",
		type: "post",
		datatype: "json",
		data: ({ Type: type, mCode: mCode }),
		success: function (data, status) {
			if (data == "0001" && type == 1) {
				LayerShow("10cup이 사용되었습니다.<br/><br/>문제를 풀어 최종 제출하면 10cup을 받을 수 있고,<br/>100점을 받으면 30cup을 더 받을 수 있습니다.<br/><br/>문제를 풀어 보세요.", "LayerHide(undefined);onActivityResult();");
				return;
			} else if (data == "0001" && type == 2) {
				onActivityResult();
				ML_ReadingBooks(mCode);
				return;
			} else if (data == "0001" && type == 3) {//TV동화
				InsertCompleteReload(0);
				openPlayer(mCode);
			} else if (data == "0001" && type == 4) { //#92333 첨삭과외 한자 과목 추가의 건
				LayerShow("10cup이 사용되었습니다.<br/><br/>문제를 풀어 최종 제출하면 10cup을 받을 수 있고,<br/>100점을 받으면 30cup을 더 받을 수 있습니다.<br/><br/>문제를 풀어 보세요.", "LayerHide(undefined);onActivityResult();");
				return;
			} else if (data == "0002") {
				LayerShow("cup 수량이 부족합니다.", "LayerHide(undefined)");
				return;
			} else if (data == "8888") {
				LayerShow("구매에 실패하였습니다.", "LayerHide(undefined)");
				return;
			} else {
				LayerShow("오류가 발생하였습니다.<br/>관리자에게 문의하세요.", "LayerHide(undefined)");
				return;
			}
		}
	});
}

// 레이어 팝업창 열기(200513 조재희)
function LyPop_Show(id) {
	var popUpchkYn = jsGetCookie(id);

	if (popUpchkYn != "check") {
		$("#" + id).css("display", "block");
	}
}

// 레이어 팝업창 닫기(200513 조재희)
function LyPop_Hide(id, type) {
	//type : check(다시보지않기), select(##일간 보지 않기)

	var tmpday; //쿠키유효일자
	if (type == "select") {
		tmpday = Number($("#sel_" + id).val());
	}
	else {// type == check
		tmpday = Number($("#chk_" + id).val());
	}

	if ($("#chk_" + id).prop("checked")) {
		jsSetCookieDay(id, "check", tmpday);
	}

	$("#" + id).hide();
}

// 개발환경 체크
function isDevelopment() {
	if (typeof hostingEnv === 'string') {
		if (hostingEnv === 'DEVELOP') {
			return true;
		} else {
			return false;
		}
	} else {
		var href = document.location.href;
		if (href.indexOf('http://local-test-app') > -1 || href.indexOf('http://local-app') > -1 || href.indexOf('http://test-app') > -1 || href.indexOf('http://localhost') > -1) {
			return true;
		} else {
			return false;
		}
	}
}

// 스테이징 환경인지 체크
function isStaging() {
	if (typeof hostingEnv === 'string') {
		if (hostingEnv === 'STAGING') {
			return true;
		} else {
			return false;
		}
	} else {
		var href = document.location.href;
		if (href.indexOf('http://st-app') > -1) {
			return true;
		} else {
			return false;
		}
	}
}

function getAppHost() {
	/*var appHost = "app.milkt.co.kr";
	if (isDevelopment() || isStaging()) {
		appHost = document.location.host;
	}*/

	return document.location.host;
}

// 한문항 학습창 실행정보
function OneQuizOpenPlayer(userId, mCode, pageType, testType, complete, grade, subject) {

	if (complete == "1" || complete == "9") {
		complete = complete == "1" ? "Y" : "N";
	}

	// [2021-11-04] 서청훈 : 백과사전 호출 시 grade 값 추가
	var encGrade = -1
	try {
		encGrade = jsGetCookie('Grade');
	} catch (e) {

	}

	$.ajax({
		type: "post",
		datatype: "json",
		url: "/AppQuestionBank/OneQuizInterface_Info_Json",
		data: ({ strUserID: userId, mCode: mCode }),
		success: function (data, status) {
			var data1 = data.data[0];
			var mURL = data.materialURL + subject + "/" + grade + jsGetCookie("selTopTerm") + "/" + subject + grade + jsGetCookie("selTopTerm") + "_" + mCode + ".pdf";
			var dURL = subject == "E" ? "/AppDictionary/Dictionary_en" : "/AppDictionary?mCode=" + mCode;

			var materialURL = data1.materialyn == true ? mURL : ""; // 학습자료 URL
			var questionURL = data1.questionyn == true ? "/AppAsk/Question_List?mCode=" + mCode : "";   // 질문하기 URL
			var dictionaryURL = data1.dictionaryyn == true ? dURL : ""; // 용어사전 URL
			var encyclopediaURL = data1.encyclopediayn == true ? "milktencscheme://milktenc?extra_userid=" + userId + "&extra_usergrade=ELE&grade=" + encGrade : ""; // 백과사전 URL
			var encyclopediaPkN = data1.encyclopediayn == true ? "kr.co.chunjae.android.milkt100" : ""; // 백과사전 PackageName

			oneTestStudyJson = {
				userId: userId, mCode: mCode, pageType: pageType, testType: testType, complete: complete, grade: grade,
				IntroUseYN: data1.IntroUseYN, IntroType: data1.IntroType, DesignSkin: data1.designskin, OneTestView: data1.onetestview,
				TimerUseYN: data1.timeruseyn, TimerType: data1.TimerType, TimerMinuteSec: data1.TimerMinuteSec.TotalMilliseconds, RemainTime: data1.RemainTime.TotalMilliseconds, TimerFront: data1.timerfrontyn,
				addservice: data1.addservice,
				materialyn: data1.materialyn, materialURL: materialURL,
				questionyn: data1.questionyn, questionURL: questionURL,
				dictionaryyn: data1.dictionaryyn, dictionaryURL: dictionaryURL,
				encyclopediayn: data1.encyclopediayn, encyclopediaURL: encyclopediaURL, encyclopediaPkN: encyclopediaPkN
			};
			//console.log(oneTestStudyJson);
		},
		error: function (request, status, error) {
			console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);
		},
		complete: function () {
			try {
				if (typeof window.HybridApp.getVersionName == 'function') {
					TempPkName = 'kr.hbstudy.apphbstudy';
					TempPkName2 = "window.HybridApp.QuestionBankOne";
					window.HybridApp.getVersionName(TempPkName);
				}
			} catch (ex) { alert(ex); }
		}
	});
}

// 사용환경 정보 저장(200922 조재희)
function APKVersion_Log_Ins(SerialNo, LauncerVersion, MiltTVersion) {

	$.ajax({
		type: "post",
		datatype: "json",
		url: "/AppCommon/APKVersion_Log_Ins",
		data: ({ SerialNo: SerialNo, LauncerVersion: LauncerVersion, MiltTVersion: MiltTVersion }),
		success: function (data) {
			console.log(data);
		},
		error: function (request, status, error) {
			console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);
		}
	});
}

// AI 학교 공부 체크 ASK#59971
function Go_AI_abilityanalysis() {

	$.ajax({
		type: "post",
		datatype: "json",
		url: "/AppCommon/CourseAiStudyCheck",
		data: ({}),
		success: function (data) {
			if (data == "Y") {
				location.href = "/AppTmpCate/AI_abilityanalysis";
			} else {
				LayerShow("[AI 학교 공부] 코스로 공부하는<br/>친구들에게 제공되는 서비스입니다.", "LayerHide(undefined)");
			}
		}
	});

}

// 교과서타입 가져오기 ASK#74503
function GetUserTextBookType(subject, grade, term) {

	var UserTextBookType_Code = "";
	var UserTextBookType_Name = "";

	if
	(
		(subject == "E" || subject == "En")
		|| (grade > 2 && (term == 1 || term == 2) && (subject == "M" || subject == "S" || subject == "N" || subject == "Ma" || subject == "So" || subject == "Sc"))  //2학기 추가
	)
	{
		$.ajax({
			url: "/AppCommon/GetUserTextBookType",
			async: false,
			type: "post",
			datatype: "json",
			data: ({ subject: subject, grade: grade, term: term }),
			success: function (data, status) {
				if (data != false && data[0].TextBookType_Name != "undefined" && data[0].TextBookType_Name != "") {
					UserTextBookType_Code = data[0].TextBookType_Code;
					UserTextBookType_Name = data[0].TextBookType_Name;
				}
				else {
					UserTextBookType_Code = "";
					UserTextBookType_Name = "";
				}
			}
		});
	}

	return UserTextBookType_Code + "$$" + UserTextBookType_Name

}

// #114874 프리패스 입장제한
var objFreeMemberCheck = { states: "", msg:"밀크T프리패스 학습생은<br>이용할 수 없는 메뉴 입니다." };
function funcFreeMemberCheck_goTodayStudy() {
	if (objFreeMemberCheck.states == "03") {
		if (jsGetCookie("Grade") == "0") {
			LayerShow(objFreeMemberCheck.msg, "window.HybridApp.openKidsView('/AppKids/TodayStudy')");
		} else {
			LayerShow(objFreeMemberCheck.msg, "location.href ='/AppTodayStudy'");
		}
	}
}
function funcFreeMemberCheck(fn) {
	if (objFreeMemberCheck.states == "") {
		$.ajax({
			url: "/AppCommon/MemberCheak",
			async: false,
			type: "post",
			datatype: "json",
			data: {  },
			success: function (data) {
				objFreeMemberCheck.states = data;
				if (typeof fn == "function") {
					fn(objFreeMemberCheck);
				}
			}
		});
	} else {
		if (typeof fn == "function") {
			fn(objFreeMemberCheck);
		}
	}
}

// 제한 학습생 체크 (  B2B 밀크T 라이트 )
// type : Close → 팝업 닫기, Move → 경로 이동
function fn_limits_memchek(type) {

		// 제한 대상자 체크
		funcFreeMemberCheck();
		var Fmemcheak = objFreeMemberCheck.states;
		// 리턴 변수
		var deferred = $.Deferred();

		// 이동 할 경로
		var MoveUrl = "";
		if (Fmemcheak == "13") {	// B2B 밀크T 라이트
			if (type == "Move") {
				if (jsGetCookie("Grade") == 0) {
					MoveUrl = '/AppKids/TodayStudy';
				} else {
					MoveUrl = "/AppTodayStudy";
				}
				LayerShow('밀크T 라이트 학습생은 이용할 수 없는 메뉴입니다.', 'MoveMenu("' + MoveUrl + '")');
				deferred.resolve(false)
			} else {
				LayerShow('밀크T 라이트 학습생은 이용할 수 없는 메뉴입니다.', 'LayerHide()');
				deferred.resolve(true);
			}
		} else {
			deferred.resolve(true);
	}

	return deferred.promise();
}

// 키즈, 초등 페이지 이동
function MoveMenu (url) {

	if (jsGetCookie("Grade") == 0) {
		if (window.location.pathname.indexOf("/AppKids") > -1) {
			location.href = url;
		} else {
			// 키즈 화면 실행
			kids_menu(url);
		}
	} else {
		if (window.location.pathname.indexOf("/AppKids") > -1) {
			// 상단 키즈 메뉴 제거 후 이동
			window.HybridApp.moveFront(url);
		} else {
			location.href = url;
		}
	}
}

//화면 비활성화
function disablePage() {
	document.body.style.pointerEvents = 'none';
}

//화면 활성화
function enablePage() {
	document.body.style.pointerEvents = 'auto';
}

function requestSpeechRecognition(strParam) {

	//strParam = "{mode:'stt_mode', model:'0', membertype:'E', grade:'1'}"

	SpeechRecognition_param = strParam;
	try {
		if (typeof window.HybridApp.getVersionName == 'function') {
			TempPkName = "kr.co.chunjae.android.stt";
			window.HybridApp.getVersionName(TempPkName);
		}
		else {
			LayerShow("새로운 버전이 오픈되었습니다.<br/>홈 화면에서 최신 버전으로 업데이트해주세요.", "LayerHide(null);");
		}
	} catch (ex) {
		LayerShow("오류가 발생했습니다. 관리자에게 문의하여 주십시오.", "LayerHide(null);");

		//디버깅용
		//LayerShow(ex.message, "LayerHide(undefined)");
	}
}

function requestCJSpeechRecognition(strParam) {

	//strParam = "{"mode":"stt_mode","membertype":"E","model":2000,"uitype":"1","grade":"0","fileName":"myVoice_0.mp3“,”keywordList”:””,”keywordModelId”:“1”,”userKey”:“DA264662-8CE3-4F3D-91AE-A2C1F45BD9E3”,”age”:“6”,”level”:“Y4”,”subject”:“수학”,”unit”:“유닛코드”,”answer”:“정답”}"

	CjSpeechRecognition_param = strParam;
	try {
		if (typeof window.HybridApp.getVersionName == 'function') {
			TempPkName = "kr.co.chunjae.android.cjstt";
			window.HybridApp.getVersionName(TempPkName);
		}
		else {
			LayerShow("새로운 버전이 오픈되었습니다.<br/>홈 화면에서 최신 버전으로 업데이트해주세요.", "LayerHide(null);");
		}
	} catch (ex) {
		LayerShow("오류가 발생했습니다. 관리자에게 문의하여 주십시오.", "LayerHide(null);");

		//디버깅용
		//LayerShow(ex.message, "LayerHide(undefined)");
	}
}
//function Gami_CuP_info() {
//	var states = "";
//	$.ajax({
//		url: "/AppGamification/API_Cup_info",
//		async: false,
//		type: "post",
//		datatype: "json",
//		data: ({ strUserId: jsGetCookie("SysUserId") }),
//		success: function (data) {
//			alert(data);
//			console.log(data)
//			states = data
//		}
//	});
//	return states;
//}


//노드플레이어용 음성인식 요청
//nType : 0 (한글) 1(영어)
function requestSpeechRecognitionForNodeApp(nType) {

	try {
		window.HybridApp.startSilvySTTMode3(nType);
	} catch (ex) {
		LayerShow("오류가 발생했습니다. 관리자에게 문의하여 주십시오.", "LayerHide(null);");
	}
}

//중학 앱 바로가기, 자유이용권 대상자 체크
function milktMiddle() {
	//정학습생 여부
	if (jsGetCookie("Status") == '11') {
		//통합 동의 여부
		if (CheckMiddleApp(0) == 'Y' && CheckMiddleApp(1) == 1) {
			try { window.HybridApp.getLauncherSettingInfo(); }
			catch (ex) { alert(ex); }
		}
		else {
			$("body").append("<div id=\"div_freepass\"></div>");
			$("#div_freepass").load("/AppLayerPopUp/FreePass", function () {
				$("#lpop_freepass").show();
			});
		}
	}
	//준학습생
	else if (jsGetCookie("Status") == '01') {
		try { window.HybridApp.getLauncherSettingInfo(); }
		catch (ex) { alert(ex); }
	}
	//이용 불가
	else {
		LayerShow("밀크 T 중학 통합 서비스 이용<br/>대상자가 아닙니다.", "LayerHide(null);");
	}
}

//CRM 중학 앱 허용여부, 통합 동의 여부 체크
function CheckMiddleApp(type) {
	var result;

	$.ajax({
		url: "/AppLayerPopUp/FreePassCheck",
		async: false,
		type: "post",
		datatype: "json",
		data: ({ type: type }),
		success: function (data) {
			result = data;
		}
	});
	return result;
}

//중학 앱 업데이트 여부 체크
function getLauncherSettingInfo(data) {
	var jd = JSON.parse(data);

	if (jd.autoUpdate.indexOf('3') < 0) {
		LayerShowConfirm("밀크T 초등이 종료되고 중학을 실행합니다.", "window.HybridApp.sendGroupInfoChange(3, true);window.HybridApp.executeMilkTMid();", "LayerConfirmHide();");
	}
	else {
		LayerShowConfirm("밀크T 초등이 종료되고 중학을 실행합니다.", "window.HybridApp.executeMilkTMid();", "LayerConfirmHide();");
	}
}

// 메타버스 테스트
function metaWorld() {
	TempPkName = "com.chunjae.milkt_metaworld";
	window.HybridApp.getVersionName(TempPkName);
}

// #103406_이월 학습생 탭 로그인 및 학습 불가 관련 기능
function Fn_MemberStatusCheck(username) {

    var tstatus = "";
    $.ajax({
        url: "/AppCommon/MemberStatusCheck",
        async: false,
        type: "post",
        datatype: "json",
        data: ({ username: username }),
        success: function (data) {
            tstatus = data;
        }
    });
    return tstatus;
}


function goEbook(strLtype) {
    if (strModelNm == "SM-P600") {
        LayerShow("해당 기기는 지원하지 않는 메뉴입니다.", "LayerHide(null);");
        return false;
    } else {
        var url = "/AppTallEnglish/Ebook?eLType=" + strLtype;
        location.href = url;
    }

}

// #118421 쪽지보내기시 특정 이모지 제거
function delEmojiString(str) {
	var regex_emoji = /[\uD83D\uDD95]/gu;
	return str.replace(regex_emoji, "")
}

//]]>