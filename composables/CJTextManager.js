/**
 * 기존 textManager에 함수를 추가하면서 작성.
 *
 * webGL 에서 사용할 수 있도록 모든 Text를 관리
 * Text를 생성한 후 bitmap으로 변경하여 적용
 * 단위별 색상 변경을 위해 모든 택스트를 분리하여 관리
 * @class textManager
 * @classdesc 텍스트 모듈 클래스
 * @param {*} mcThis       텍스트 객체가 add 될 부모 객체 or 텍스트가 붙여질 객체
 * @param {*} nSize        폰트 크기
 * @param {*} strFontName  폰트 이름
 * @param {*} strColor     기본 폰트 색상
 */
function textManager(mcThis, nSize, strFontName, strColor, nLineHeight) {
    var m_this = this;

    var m_mcGuide;
    var m_rectGuide;
    var m_mcTextSet;

    var m_strFontStyle = '' + nSize + 'px ' + strFontName;
    var m_strFontColor = strColor;

    var m_strMess = '';
    var m_cacheArea = null;
    var m_bIgnoreLimitWidth = false;
    var m_limitedWidth = 0;
    var m_nLineHeight = nLineHeight;


    var m_attrObj = {
        textColorSet: [],
        arrImageBox: []
    }

    // 초기화
    function init() {
        if (m_nLineHeight == null) m_nLineHeight = 30;

        m_mcGuide = new createjs.MovieClip();
        m_mcGuide.gotoAndStop(0);
        mcThis.addChild(m_mcGuide);
        m_rectGuide = { x: 0, y: 0, width: mcThis.nominalBounds.width, height: mcThis.nominalBounds.height };

        m_limitedWidth = m_rectGuide.width;
    }

    /**
     * 텍스트와 가로세로 정렬 지정.
     * @param {*} strMess 텍스트 
     * @param {*} strTextWalign 가로정렬 (left, center, right) 기본값 center
     * @param {*} strTextHalign 세로정렬 (top, middle) 기본값 top
     */
    m_this.setText = function (strMess, strTextWalign, strTextHalign) {
        m_originText = strMess;
        var replaceText = strMess.replace(/( -n- )/g, "\n");
        var totalOrigiStrMess = replaceText;
        // if(strTextWalign == undefined)
        m_strTextWalign = strTextWalign || "center";
        // if(strTextHalign == undefined) 
        m_strTextHalign = strTextHalign || "top";

        if (m_mcTextSet) {
            m_mcGuide.removeAllChildren();
            m_strMess = "";
        }
        m_mcTextSet = new createjs.MovieClip();
        m_mcTextSet.name = "mcTextSet";
        m_mcTextSet.myArrContainer = [];
        m_mcTextSet.myArrOutlineContainer = [];
        m_mcTextSet.myArrLineText = [];
        m_mcTextSet.myArrLineContainer = [];

        var arrSentence = totalOrigiStrMess.split("");

        var text, strMess, container;

        var ntextIdx = 0;
        var nPosTextX = 0;
        var nPosTextY = 0;
        var lineBreak = 0;
        var nTextLineIdx = 0;
        var arrOneLineText = "";
        var arrOneLineContainer = new Array();

        //밑줄
        var bUnderline = false;
        var nStartUnderline = 0;
        //기울기
        var bItalic = false;
        var nStartItalic = 0;
        //폰트색
        var bFontColor = false;
        var bCustomCase = false;
        var customColor = "";
        var nStartFontColor = 0;
        var arrColor = [];
        //박스 이미지로 대체
        var bImageBox = false;
        var nStartImageBox = 0;
        var arrWrappingText = [];

        for (i = 0; i < arrSentence.length; ++i) {
            //1 음절
            strMess = arrSentence[i];

            // //밑줄
            // if (strMess == "#") {
            //     bTextUnderline = true;
            //     nStartUnderline++;
            //     if (nStartUnderline % 2 == 0) {
            //         bUnderline = false;
            //         continue;
            //     }
            //     bUnderline = true;
            //     continue;
            // }

            // //기울기
            // if (strMess == "☆") {
            //     nStartItalic++;
            //     if (nStartItalic % 2 == 0) {
            //         bItalic = false;
            //         continue;
            //     }
            //     bItalic = true;
            //     continue;
            // }

            // //폰트색 
            // if (strMess == "%") {
            //     nStartFontColor++;
            //     if (nStartFontColor % 2 == 0) {
            //         bFontColor = false;
            //         bCustomCase = true;
            //         m_attrObj.textColorSet.push({ arrColor: arrColor });
            //         arrColor = [];
            //         continue;
            //     }
            //     bFontColor = true;
            //     bCustomCase = false;
            //     continue;
            // }
            // //폰트색 커스텀한다. ex) %R, %B ... 
            // if (bFontColor && !bCustomCase) {
            //     bCustomCase = true;
            //     switch (strMess) {
            //         case "R": customColor = "#CC3333"; continue;
            //         case "B": customColor = "#CC3333"; continue;
            //         default: customColor = m_strFontColor;
            //     }

            // }

            // //박스 이미지
            // if (strMess == "§") {
            //     // 박스가 텍스트보다 클경우 
            //     //정규식 이용 먼저 바꾼다./[§](.*?)[§]/gi 사이값 정규식
            //     nStartImageBox++;
            //     if (nStartImageBox % 2 == 0) {
            //         bImageBox = false;
            //         m_attrObj.arrWrappingText.push({ arrText: arrWrappingText });
            //         arrWrappingText = [];
            //         continue;
            //     }
            //     bImageBox = true;
            //     continue;
            // }

            //1 음절 컨테이너
            container = new createjs.Container();
            text = new createjs.Text(strMess, m_strFontStyle, m_strFontColor);

            // if (bUnderline) {
            //     var shape = new createjs.Shape();
            //     shape.graphics.ss(nSize / 10, "round").s(m_strFontColor)
            //         .mt(text.x, text.y + text.getBounds().height)
            //         .lt(text.x + text.getBounds().width, text.y + text.getBounds().height);
            //     container.addChild(shape);
            // }

            // if (bItalic) {
            //     text.font = "italic " + m_strFontStyle;
            // }

            // if (bFontColor) {
            //     text.color = customColor;
            //     arrColor.push({ textIdx: ntextIdx, container: container });
            // }

            // if (bImageBox) {
            //     arrWrappingText.push({ textIdx: ntextIdx, container: container });
            // }

            container.x = nPosTextX;
            container.y = nPosTextY;
            container.text = strMess;
            container.mcText = text;
            container.idx = ntextIdx;
            container.lineIdx = nTextLineIdx;

            m_mcTextSet.addChild(container);
            container.addChild(text);
            nPosTextX += container.getBounds().width;

            // 텍스트가 가이드 영역 밖이면 개행
            if (!m_bIgnoreLimitWidth && nPosTextX > m_limitedWidth) {
                nPosTextX = 0;
                nTextLineIdx = 0;
                container.lineIdx = nTextLineIdx;
                nPosTextY += container.getBounds().height + m_nLineHeight;
                container.x = nPosTextX;
                container.y = nPosTextY;
                nPosTextX += strMess == " " ? 0 : container.getBounds().width;
                m_mcTextSet.myArrLineText[lineBreak] = arrOneLineText;
                m_mcTextSet.myArrLineContainer[lineBreak] = arrOneLineContainer;
                lineBreak++;
                arrOneLineText = "";
                arrOneLineContainer = new Array();
            }
            // 선택적 개행 \n
            // if (/\n/.test(strMess)) {
            //     nPosTextX = 0;
            //     nTextLineIdx = 0;
            //     container.lineIdx = nTextLineIdx;
            //     nPosTextY += container.getBounds().height / 2 + m_nLineHeight;
            //     container.removeChild(text);
            //     m_mcTextSet.myArrLineText[lineBreak] = arrOneLineText;
            //     m_mcTextSet.myArrLineContainer[lineBreak] = arrOneLineContainer;
            //     lineBreak++;
            //     arrOneLineText = "";
            //     arrOneLineContainer = new Array();
            //     nTextLineIdx = 0;
            // }

            container.lineBreak = lineBreak;
            container.rect = {
                x: container.x,
                y: container.y,
                width: (nPosTextX - container.x) < 0 ? 0 : nPosTextX - container.x,
                height: nPosTextY == 0 ? container.getBounds().height : nPosTextY / lineBreak
            };

            arrOneLineContainer.push(container);
            arrOneLineText += container.mcText.text;
            m_mcTextSet.myArrContainer.push(container);
            m_strMess += strMess;
            ntextIdx++;
            nTextLineIdx++;

            if (i == arrSentence.length - 1) {
                m_mcTextSet.myArrLineText[lineBreak] = arrOneLineText;
                m_mcTextSet.myArrLineContainer[lineBreak] = arrOneLineContainer;
                arrOneLineText = [];
                arrOneLineContainer = new Array();
            }
        }

        m_mcGuide.addChild(m_mcTextSet);

        var nPosX;
        switch (m_strTextWalign) {
            case "left":
                nPosX = m_rectGuide.width <= 0 ? m_rectGuide.x + m_rectGuide.width - m_mcTextSet.getBounds().width : m_rectGuide.x;
                break;

            case "center":
                nPosX = (m_rectGuide.width - m_mcTextSet.getBounds().width) / 2;

                for (var i = 1; i < m_mcTextSet.myArrLineContainer.length; i++) {
                    var nWidth = 0;
                    var arrLastContainer = m_mcTextSet.myArrLineContainer[i];
                    for (var j = 0; j < arrLastContainer.length; j++) {
                        nWidth += arrLastContainer[j].rect.width;
                    }
                    var nCenter = m_rectGuide.width / 2 - nWidth / 2;
                    for (var j = 0; j < arrLastContainer.length; j++) {
                        arrLastContainer[j].x += nCenter;
                    }
                }

                break;

            case "right":
                nPosX = m_rectGuide.width <= 0 ? m_rectGuide.x : m_rectGuide.x + m_rectGuide.width - m_mcTextSet.getBounds().width;
                break;
        }

        m_mcTextSet.x = nPosX;

        m_mcTextSet.y = m_strTextHalign == "top" ? 0 : (m_rectGuide.height - m_mcTextSet.getBounds().height) / 2;

        m_mcTextSet.setBounds(

            m_mcTextSet.getBounds().x,
            m_mcTextSet.getBounds().y,
            m_mcTextSet.getBounds().width,
            m_mcTextSet.getBounds().height
        );

        SetCacheBounds(
            m_mcTextSet.getBounds().x,
            m_mcTextSet.getBounds().y - 1,
            m_mcTextSet.getBounds().width * 1.3,
            m_mcTextSet.getBounds().height + 4
        );
    }

    /**
     * 찾는 텍스트의 index 값을 반환한다.
     * @param {*} text 찾을 텍스트 
     * @param {*} mactchIdx 텍스트 위치
     */
    m_this.textIndexOf = function (text, mactchIdx) {
        var matchTextIndex = 0;
        for (var i = 0; i < mactchIdx + 1; i++) {
            matchTextIndex = m_strMess.indexOf(text, matchTextIndex + i);
        }
        return matchTextIndex;
    }

    /**
     * 영역의 행을 정렬 시킨다.
     * @param {*} text 정렬할 텍스트
     * @param {*} nline 행 위치 인덱스 0부터 시작.
     */
    m_this.selectTextAlign = function (strAlign, nline) {
        if (nline == undefined) {
            for (var i = 0; i < m_mcTextSet.myArrLineText.length; i++) {
                textAlign(i);
            }
        } else {
            textAlign(nline);
        }

        function textAlign(n) {
            var container;
            var arrContainer = m_mcTextSet.myArrLineText[n];
            if (!arrContainer) return;
            var lastText = arrContainer[arrContainer.length - 1];
            var textWidth = lastText.x + lastText.getBounds().width;
            var centerX = (m_limitedWidth - textWidth) / 2;

            for (var i = 0; i < arrContainer.length; i++) {
                container = arrContainer[i];
                switch (strAlign) {
                    case "left":
                        break;
                    case "center":
                        container.x = container.x + centerX;
                        break;
                    case "right":
                        container.x = container.x + m_mcTextSet.getBounds().width - textWidth;
                        break;
                }
            }
        }

        SetCacheBounds(
            m_cacheArea.x,
            m_cacheArea.y,
            m_rectGuide.width,
            m_cacheArea.height
        );
    }

    /**
     * 텍스트 색 변경
     * @param {*} strColor 변경할 색
     * @param {*} textIdx 변경할 텍스트 번호 // undefined 텍스트 전부 // -1 선택된 텍스트 전부 // orderIdx 선택된 텍스트 0부터
     */
    m_this.setColor = function (strColor, textIdx) {
        var orderIdx = (textIdx == undefined) ? -2 : textIdx;
        var textColorSet = m_attrObj.textColorSet;
        var arrContainer = m_mcTextSet.myArrContainer;
        var container;
        switch (orderIdx) {
            case -2:
                for (var i = 0; i < m_strMess.length; i++) {
                    container = arrContainer[i];
                    container.mcText.color = strColor;
                }
                break;
            case -1:
                for (var i = 0; i < textColorSet.length; i++) {
                    var arr = textColorSet[i].arrColor;
                    for (var j = 0; j < arr.length; j++) {
                        var mcText = arr[j].container.mcText;
                        mcText.color = strColor;
                    }
                }
                break;
            default:
                if (!textColorSet[textIdx]) return;
                var arr = textColorSet[textIdx].arrColor;
                for (var j = 0; j < arr.length; j++) {
                    var mcText = arr[j].container.mcText;
                    mcText.color = strColor;
                }
                break;
        }

        SetCacheBounds(
            m_cacheArea.x,
            m_cacheArea.y,
            m_cacheArea.width,
            m_cacheArea.height
        );
    }

    /**
     * 아웃라인 생성
     * @param {*} nThickness 아웃라인 두께 
     * @param {*} strColor 지정 색
     */
    m_this.makeOutline = function (nThickness, strColor) {

        var arrOutlineContainer = m_mcTextSet.myArrOutlineContainer;
        var arrContainer = m_mcTextSet.myArrContainer;
        var mcText, clone, container;

        if (arrOutlineContainer.length == 0) {
            for (var i = 0; i < arrContainer.length; i++) {
                mcText = arrContainer[i].mcText;
                clone = mcText.clone();
                clone.outline = nThickness;
                clone.color = strColor;
                container = new createjs.Container();
                container.x = arrContainer[i].x;
                container.y = arrContainer[i].y;
                container.mcText = clone;
                container.addChild(clone);

                arrOutlineContainer.push(container);
                m_mcTextSet.addChildAt(container, 0);
            }
        } else {
            for (var i = 0; i < arrOutlineContainer.length; i++) {
                mcText = arrOutlineContainer[i].mcText;
                mcText.outline = nThickness;
                mcText.color = strColor;
            }
        }


        SetCacheBounds(
            m_cacheArea.x - nThickness / 2,
            m_cacheArea.y - nThickness / 2,
            m_cacheArea.width + nThickness,
            m_cacheArea.height + nThickness
        )

        // var shape = new createjs.Shape();
        // // shape.graphics.beginFill("green").drawRect(-nThickness / 2, -nThickness / 2, m_mcTextSet.getBounds().width + (nThickness), m_mcTextSet.getBounds().height + (nThickness));
        // shape.graphics.beginFill("yellow").drawRect( 
        //     m_mcTextSet.getBounds().x - nThickness/2, 
        //     m_mcTextSet.getBounds().y - nThickness/2, 
        //     m_mcTextSet.getBounds().width  + nThickness, 
        //     m_mcTextSet.getBounds().height  + nThickness
        // );
        // m_mcTextSet.addChild(shape);
        // shape.alpha = 0.2;
    };

    /**
     * @function textManager.removeOutline
     * @description 외곽선 삭제 
     */
    m_this.removeOutline = function () {
        var arrOutlineContainer = m_mcTextSet.myArrOutlineContainer;
        for (var i = 0; i < arrOutlineContainer.length; i++) {
            m_mcTextSet.removeChild(arrOutlineContainer[i]);
        }
        m_mcTextSet.myArrOutlineContainer = [];
    }

    /**
     * @function textManager.makeShadow
     * @description 문자 그림자 생성
     * @param {object} shadow createjs의 shadow객체
     */
    m_this.makeShadow = function (shadow) {
        var x, y, width, height;
        x = shadow.offsetX <= 0 ? shadow.offsetX / 2 - shadow.blur : 0;
        y = shadow.offsetY <= 0 ? shadow.offsetY / 2 - shadow.blur : 0;
        width = shadow.offsetX >= 0 ? shadow.offsetX / 2 + shadow.blur : -(shadow.offsetX / 2 + shadow.blur);
        height = shadow.offsetY >= 0 ? shadow.offsetY / 2 + shadow.blur : -shadow.offsetY / 2 - shadow.blur;

        m_mcTextSet.shadow = shadow;

        SetCacheBounds(
            m_cacheArea.x + x,
            m_cacheArea.y + y,
            m_cacheArea.width + width,
            m_cacheArea.height + height
        );

        // var shape = new createjs.Shape();
        // shape.graphics.beginFill("yellow").drawRect(   
        //     m_mcTextSet.getBounds().x + x,
        //     m_mcTextSet.getBounds().y + y,
        //     m_mcTextSet.getBounds().width + width,
        //     m_mcTextSet.getBounds().height + height
        // );
        // m_mcTextSet.addChild(shape);
        // shape.alpha = 0.3;
    };

    /**
     * 텍스트 행간 간격을 넓혀준다. 
     * @param {*} number  간격
     * @param {*} nTargetline 해당 텍스트 라인. undefined 전체
     */
    m_this.setIntervalHight = function (number, nTargetline) {
        var lastLinebreak = 0;
        if (typeof nTargetline != 'number') nTargetline == undefined;
        var target = nTargetline;
        var currentLine = 0;
        // 바뀐 시점을 알아야 한다.
        for (var i = 0; i < m_mcTextSet.myArrContainer.length; i++) {
            currentLine = m_mcTextSet.myArrContainer[i].lineBreak;
            //따로 선택줄 조정.
            if (target >= 0) {
                lastLinebreak = nTargetline + 1 >= currentLine && nTargetline <= currentLine ? currentLine - nTargetline + 1 : lastLinebreak;
                m_mcTextSet.myArrContainer[i].y = m_mcTextSet.myArrContainer[i].y + number * lastLinebreak;
            }
            if (target == undefined) {
                lastLinebreak = currentLine;
                m_mcTextSet.myArrContainer[i].y = m_mcTextSet.myArrContainer[i].y + number * lastLinebreak;
            }
        }

        SetCacheBounds(
            m_cacheArea.x,
            m_cacheArea.y,
            m_cacheArea.width,
            m_cacheArea.height + (number * lastLinebreak)
        );
    }

    /**
     * 텍스트 자간 간격을 조정. 
     * @param {*} number  간격
     */
    m_this.setIntervalWidth = function (number) {
        if (typeof number != 'number') throw new Error('param is not a number');
        var containder;
        // 바뀐 시점을 알아야 한다.
        for (var i = 0; i < m_mcTextSet.myArrContainer.length; i++) {
            containder = m_mcTextSet.myArrContainer[i];
            containder.x = containder.x + (number * i);
        }

        SetCacheBounds(
            m_cacheArea.x,
            m_cacheArea.y,
            m_cacheArea.width,
            m_cacheArea.height
        );
    }

    /**
     * 가로길이 제한 여부 setText 사용전에 호출.
     * @param {*} bool boolean 
     */
    m_this.setIgnoreLimitWidth = function (bool) {
        m_bIgnoreLimitWidth = bool;
    }
    /**
     * 위치가 다른 텍스트를 한줄에 위치시킨다.
     */
    m_this.textRelocation = function () {
        if (m_attrObj.arrImageBox.length == 0) return;

        var arrContainer = m_mcTextSet.myArrContainer;
        var strMess, container, rect;
        var arrObj = m_attrObj.arrImageBox;

        var lineBreak = 0;
        var count = 0;
        var nPosTextX = 0;
        var nPosTextY = 0;
        var nPosRectWidth = 0;

        for (var i = 0; i < arrContainer.length; ++i) {
            //1 음절
            container = arrContainer[i];
            rect = container.rect;
            strMess = container.text;

            if (count < arrObj.length && i == arrObj[count].arrText[0].textIdx) {
                var arrImageBox = arrObj[count].arrText;
                for (var j = 0; j < arrImageBox.length; j++) {
                    nPosRectWidth += arrImageBox[j].container.rect.width;
                }
                count++;
            }

            if (!m_bIgnoreLimitWidth && nPosTextX + nPosRectWidth < m_limitedWidth) {
                //1 음절 컨테이너
                container.x = nPosTextX;
                container.y = nPosTextY;
                nPosTextX += rect.width;
                nPosRectWidth = 0;
            }

            if (!m_bIgnoreLimitWidth && nPosTextX + nPosRectWidth > m_limitedWidth) {
                nPosTextX = 0;
                nPosTextY += rect.height;
                container.x = nPosTextX;
                container.y = nPosTextY;
                nPosTextX += rect.width;
                nPosRectWidth = 0;
                lineBreak++;
            }

            // 선택적 개행 \n
            // if(/\n/.test(strMess)) {
            //     nPosTextX = 0;
            //     nPosTextY += rect.height;
            //     lineBreak++;
            // }

            container.lineBreak = lineBreak;

            container.rect = {
                x: container.x,
                y: container.y,
                width: (nPosTextX - container.x) < 0 ? 0 : nPosTextX - container.x,
                height: nPosTextY == 0 ? container.getBounds().height : nPosTextY / lineBreak
            };
        }

        SetCacheBounds(
            m_cacheArea.x,
            m_cacheArea.y,
            m_cacheArea.width,
            m_cacheArea.height + nPosTextY / lineBreak
        );



    }

    /**
     * @function textManager.getClip 
     * @description 택스트가 들어있는 무비클립을 리턴한다.
     */
    m_this.getClip = function () {
        return m_mcTextSet;
    }

    /**
     * @function textManager.getText
     * @description 택스트 객체가 가지고 있는 택스트를 리턴
     */
    m_this.getText = function () {
        return m_strMess;
    }

    m_this.getAttrObj = function () {
        return m_attrObj;
    }

    m_this.removeText = function () {
        mcThis.removeChild(m_mcGuide);
    }

    //케시영역 다시 설정해준다.
    //폰트 때문에 케시를 포기해야 할 수 있다.
    function SetCacheBounds(x, y, width, height) {
        m_cacheArea = { x: x, y: y, width: width, height: height };
        m_mcTextSet.cache(x, y, width, height);
    }

    /**
     * @function textManager.getBoundsByIndex
     * @description 지정된 인덱스에 해당되는 글자들의 rectangle을 리턴, 한줄 택스트만 지원
     * @param {number} nStart 시작 인덱스
     * @param {number} nCount 시작인덱스 부터의 글자 수
     */
    m_this.getBoundsByIndex = function (nStart, nCount) {
        var nLen = m_mcTextSet.numChildren;

        var arrTarget = [];
        var mcTarget;
        for (var i = 0; i < nLen; ++i) {
            mcTarget = m_mcTextSet.getChildAt(i);
            if (i >= nStart && i < (nStart + nCount)) {
                arrTarget.push(mcTarget);
            }
        }

        var mcStart = arrTarget[0];
        var mcEnd = arrTarget[arrTarget.length - 1];

        var rectRet = {};
        rectRet.x = m_mcTextSet.x + mcStart.x;
        rectRet.y = m_mcTextSet.y + mcStart.y;
        rectRet.width = mcEnd.x + mcEnd.getBounds().width - mcStart.x;
        rectRet.height = mcStart.getBounds().height;

        return rectRet;
    }
    init();
}