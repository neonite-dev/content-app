/*
    eBook starter class
*/

"user strict";

let CJSpeak = new (function () {
    let m_this = this;
    let m_mcThis;

    let m_mcTitle;
    let m_mcBoxSet;
    let m_mcNarrSet;
    let m_mcSoundSet;
    let m_mcBtnSet;
    let m_mcMic;
    let arrStrData;
    let m_mcCompSet;

    let strVoiceText = "";
    let voiceClass;
    let fnVoiceTimeout;
    let fnAffodance;

    let nStep = 0;

    m_this.init = function (mcThis) {
        pageBase.setEnableStageTouch(true);
        console.log("CJSpeak init", mcThis);
        m_mcThis = mcThis;
        m_mcThis.gotoAndStop(0);
        m_mcTitle = m_mcThis.mcTitle;
        m_mcBoxSet = m_mcThis.mcBoxSet;
        m_mcNarrSet = m_mcThis.mcNarrSet;
        m_mcSoundSet = m_mcThis.mcSoundSet;
        for (let i = 0; i < m_mcSoundSet.numChildren; ++i) {
            if (m_mcSoundSet["mcSound" + i]) m_mcSoundSet["mcSound" + i].visible = false;
        }
        m_mcMic = m_mcThis.mcMicro;
        m_mcBtnSet = m_mcThis.mcBtnSet;
        m_mcCompSet = m_mcThis.mcCompSet;
        nStep = 0;
        arrStrData = answerWord.getData();
        console.log("현재 스텝 상태 : " + pageBase.isCompleteStep());
        console.log("정답 글자 : " + arrStrData);
        pageBase.setVisibleGNB(true);

        voiceClass = new cjVoiceRecog();
        voiceClass.onResultSTTMode = function (m_nSttType, str) {
            openPop(str);
        };
        const bIntro = m_mcThis.setIntroEnabled();
        console.log(m_mcThis.setIntroEnabled());
        if (bIntro) {
            introScreenSet(true);
            pageBase.stepNaviVisible(true);
            titleNarr();
        } else {
            pageBase.stepNaviVisible(false);
            introScreenSet(false);
            Util.setClipCompleteCallback(m_mcThis.mcIntro, function () {
                pageBase.stepNaviVisible(true);
                introScreenSet(true);
                m_this.setEnabled(false);
                titleNarr();
            });
        }

    }
    //간지 on/off
    function introScreenSet(bEnabled) {
        for (let i = 0; i < m_mcThis.numChildren; ++i) {
            m_mcThis.getChildAt(i).visible = bEnabled;
        }
        m_mcThis.mcIntro.visible = bEnabled == false ? true : false;
    }
    //지시문 나레이션 재생
    function titleNarr() {
        for (let i = 0; i < m_mcBoxSet.numChildren; ++i) {
            if (m_mcBoxSet["mcBox" + i]) {
                m_mcBoxSet["mcBox" + i].bReplay = false;
                if (m_mcBoxSet["mcBox" + i].mcGuide) m_mcBoxSet["mcBox" + i].mcGuide.visible = false;
            }
        }
        m_mcMic.visible = false;
        m_mcBtnSet.visible = false;
        Util.setClipCompleteCallback(m_mcTitle, function (params) {
            m_mcTitle.stop();
            startModule();
            // openPop();
        });

    }
    //모듈시작
    function startModule() {
        startBoxNarr();
    }

    //박스 생성및 나레이션
    function startBoxNarr() {
        //완료
        console.log(nStep);
        if (nStep == m_mcBoxSet.numChildren) {
            completeStep();
            // pageBase.gotoAndStep(1);
            return;
        }

        let mcBox = m_mcBoxSet["mcBox" + nStep];
        console.log(mcBox);
        //보기박스생성
        mcBox.gotoAndStop(0);
        Util.setClipCompleteCallback(mcBox.getChildAt(1), function () {
            mcBox.getChildAt(1).stop();
            setType();
        });
    }

    function setType() {
        let mcNarr = m_mcNarrSet["mcNarr" + nStep];
        switch (nStep) {
            case 0:
                //나레이션 재생
                Util.setClipCompleteCallback(mcNarr, function () {
                    setMic();
                });
                break;
            case 1:
                setPop();
                break;
            case 2:
                setPop();
                break;
            case 3:
                setPop();
                break;
            case 4:
                setPop();
                break;
        }
    }
    /** 음성인식후 텍스트변환 api 개발미완 */
    //마이크 준비
    function setMic() {
        m_mcMic.visible = true;
        m_mcMic.gotoAndStop(1);
        Util.setClipCompleteCallback(m_mcMic.getChildAt(0), function () {
            m_this.setEnabled(true);
            m_mcMic.gotoAndStop(0);
            m_mcMic.addEventListener("click", onClickMic);
        });
    }
    //마이크 클릭
    function onClickMic(e) {
        console.log("클릭", voiceClass);
        voiceClass.startSTTMode(0, 1);
        fnVoiceTimeout = Util.setTimeout(function () {
            voiceClass.stop();
            setMic();
            // console.log("5초중지");
        }, 3000);
        m_mcMic.visible = false;
        m_mcMic.removeEventListener("click", onClickMic);
        // openPop();
    }

    //설명 세팅
    function setPop(params) {
        m_this.setEnabled(true);
        let mcBox = m_mcBoxSet["mcBox" + nStep];
        mcBox.getChildAt(0).visible = true;
        mcBox.addEventListener("click", onClickPopQues);
    }
    //클릭시 설명과 함께 다음문항
    function onClickPopQues(e) {
        let mcBox = m_mcBoxSet["mcBox" + nStep];
        mcBox.getChildAt(0).visible = false;
        mcBox.removeEventListener("click", onClickPopQues);
        mcBox.gotoAndStop(1);
        Util.setClipCompleteCallback(mcBox.getChildAt(1), function () {
            mcBox.gotoAndStop(2);
            nStep++;
            startBoxNarr();
        });
    }
    //말풍선 생성
    function openPop(strVoice) {
        let mcBox = m_mcBoxSet["mcBox" + nStep];
        console.log(strVoice);
        Util.clearTimeout(fnVoiceTimeout);
        //공백제거
        let subString = strVoice.replace(/ /gi, "");
        //첫번째 문자열만
        strVoiceText = subString.substr(0, 1);
        //stt결과가 정답이거나 다시하기를 이미 진행했다면
        if (arrStrData[nStep] == strVoice || mcBox.bReplay) {
            m_mcSoundSet["mcSound" + nStep].visible = false;
            mcBox.gotoAndStop(1);
            //나레이션 재생
            Util.setClipCompleteCallback(mcBox.getChildAt(1), function () {
                mcBox.gotoAndStop(2);
                nStep++;
                startBoxNarr(nStep);
            });
        } else {
            m_mcSoundSet["mcSound" + nStep].gotoAndStop(2);
            m_mcSoundSet["mcSound" + nStep].getChildAt(0).myText = strVoiceText;
            Util.setTextData(m_mcSoundSet["mcSound" + nStep].getChildAt(0).mcSound, "bold " + 60, "NPSfont_bold", "#A82A2A", "center", "middle");
            Util.setClipCompleteCallback(m_mcSoundSet["mcSound" + nStep].getChildAt(0), function () {
                m_mcSoundSet["mcSound" + nStep].visible = true;
                m_mcSoundSet["mcSound" + nStep].gotoAndStop(1);
                Util.setClipCompleteCallback(m_mcSoundSet["mcSound" + nStep].getChildAt(0), function () {
                    m_mcSoundSet["mcSound" + nStep].gotoAndStop(0);
                    let mcSoundBox = m_mcSoundSet["mcSound" + nStep].getChildAt(0);
                    mcSoundBox.myText = strVoiceText;
                    Util.setTextData(mcSoundBox.mcSound, "bold " + 60, "NPSfont_bold", "#A82A2A", "center", "middle");
                    btnSet(true);
                });
            });

        }

        //정답일경우
        // if (arrStrData[nStep] == strVoice) {

        // }
    }
    //다시하기,확인버튼 on/off
    function btnSet(bEnabled) {
        let btnFrame = bEnabled ? 1 : 2;
        m_mcBtnSet.visible = true;
        for (let i = 0; i < m_mcBtnSet.numChildren; ++i) {
            let m_mcBtn = m_mcBtnSet["mcBtn" + i];
            if (m_mcBtn) {
                if (m_mcBtn.mcGuide) m_mcBtn.mcGuide.visible = false;
                if (i == 1) {
                    m_mcBtn.addEventListener("click", onClickCompBtn);
                } else {
                    m_mcBtn.addEventListener("click", onClickReplayBtn);
                }
                m_mcBtn.gotoAndStop(btnFrame);
                Util.setClipCompleteCallback(m_mcBtn.getChildAt(0), function () {
                    m_mcBtn.getChildAt(0).stop();
                    if (bEnabled) m_mcBtn.gotoAndStop(0);
                    if (m_mcBtn.mcGuide) m_mcBtn.mcGuide.visible = bEnabled;

                })
            }
        }
    }
    //확인
    function onClickCompBtn(e) {
        let mcBtn = e.currentTarget;
        let mcBox = m_mcBoxSet["mcBox" + nStep];
        m_this.setEnabled(false);
        mcBtn.removeEventListener("click", onClickCompBtn);
        m_mcMic.visible = false;
        m_mcSoundSet["mcSound" + nStep].gotoAndStop(2);
        m_mcSoundSet["mcSound" + nStep].getChildAt(0).gotoAndStop(0);
        m_mcSoundSet["mcSound" + nStep].getChildAt(0).myText = strVoiceText;
        Util.setTextData(m_mcSoundSet["mcSound" + nStep].getChildAt(0).mcSound, "bold " + 60, "NPSfont_bold", "#A82A2A", "center", "middle");
        Util.setClipCompleteCallback(m_mcSoundSet["mcSound" + nStep].getChildAt(0), function () {
            m_mcSoundSet["mcSound" + nStep].getChildAt(0).stop();
            btnSet(false);
            mcBox.gotoAndStop(1);
            //나레이션 재생
            Util.setClipCompleteCallback(mcBox.getChildAt(1), function () {
                mcBox.gotoAndStop(2);
                nStep++;
                startBoxNarr(nStep);
            });
        });


    }
    //다시하기
    function onClickReplayBtn(e) {
        let mcBtn = e.currentTarget;
        m_this.setEnabled(false);
        mcBtn.removeEventListener("click", onClickReplayBtn);
        let mcBox = m_mcBoxSet["mcBox" + nStep];
        let mcNarr = m_mcNarrSet["mcNarr" + nStep];
        if (mcBox.bReplay) return;
        m_mcSoundSet["mcSound" + nStep].visible = false;
        mcBox.bReplay = true;
        btnSet(false);
        //나레이션 재생
        Util.setClipCompleteCallback(mcNarr, function () {
            setMic();
        })
    }

    function completeStep() {
        // m_mcThis.setStepEnabled(true);
        m_mcTitle.visible = false;
        m_this.setEnabled(false);
        for (let i = 0; i < m_mcBoxSet.numChildren; ++i) {
            let mcBox = m_mcBoxSet["mcBox" + i];
            if (mcBox) {
                mcBox.gotoAndStop(3);
                Util.setClipCompleteCallback(mcBox.getChildAt(1), function () {
                    mcBox.getChildAt(1).stop();
                    pageBase.completeStep();
                    m_mcThis.setIntroEnabled(true);
                })
            }
        }
        //3개 하나 랜덤
        // let nRandomFrame = Math.floor(Math.random() * m_mcCompSet.totalFrames);
        // m_mcCompSet.gotoAndStop(nRandomFrame);
        // Util.setClipCompleteCallback(m_mcCompSet.getChildAt(0), function () {
        // pageBase.gotoStep(2);
        // })
        // pageBase.completeStep();
    }


    m_this.setEnabled = function (b) {
        m_mcThis.mouseEnabled = b;
    }

})();