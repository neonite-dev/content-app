$(function () {

    // select 디자인을 위해 텍스트 다시쓰고,첫번째 li 제거함
    $('.wrapPlayer .selectResult').each(function (i) {
        switch (i) {
            case 0:
                $('.wrapPlayer .selectResult').eq(i).html('<em>오늘 계획한 강의</em> 바로 수강하기');
                break;
            case 1:
                $('.wrapPlayer .selectResult').eq(i).html('이 강좌 <em>전체 강의</em> 목록보기');
                break;
        }
        $('.wrapPlayer .selectResult').eq(i).next().find('li:first-child').remove();
    });

    // tab
    $('.wrapPlayer .tabArea [class^=tabCnt]').hide().first().show(); // 초기화
    $('.wrapPlayer .tabArea .tab a').on('click', function () {
        var idx = $(this).parent().index();

        if (!(strCourseQnaUseYN == "N" && idx == 4) && !(strMenuLimitS29SubSubjectMenuUseYN == "N" && (idx == 1 || idx == 4))) {
            $('.wrapPlayer .tabArea [class^=tabCnt]').hide();
            $('.wrapPlayer .tabArea .tabCnt0' + (idx + 1)).show();
            $('.wrapPlayer .tabArea .tab li').removeClass('on');
            $(this).parent().addClass('on');
        }

        return false;
    });

    // sTab
    $('.wrapPlayer .tabCnt04 [class^=sTabCnt]').hide().first().show(); // 초기화
    $('.wrapPlayer .tabCnt04 .sTab a').on('click', function () {
        var idx = $(this).parent().index();

        $('.wrapPlayer .tabCnt04 [class^=sTabCnt]').hide();
        $('.wrapPlayer .tabCnt04 .sTabCnt0' + (idx + 1)).show();
        $('.wrapPlayer .tabCnt04 .sTab li').removeClass('on');
        $(this).parent().addClass('on');

        return false;
    });

    // layer popup open
    window.openPop = function (el) {
        $(el).show();
        return false;
    }

    // layer popup close
    window.closePop = function (el) {
        $(el).hide();
        return false;
    }

    // 서비스영역 숨기기/보이기 버튼
    $('.wrapPlayer .btnInfoOpen').off().on('click', function () {
        var currentType = $(this).attr('data-type');

        if (currentType == 'wide') { //서비스 숨기기
            $(this).attr('data-type', 'normal');
            $('.wrapPlayer .closePlayer').removeClass('wide').addClass('normal');
            self.resizeTo(748, 609); // 170628 수정
        } else if (currentType == 'normal') { //서비스 보이기
            $(this).attr('data-type', 'wide');
            $('.wrapPlayer .closePlayer').removeClass('normal').addClass('wide');
            window.resizeTo(1080, 609); // 170628 수정
        }
        return false;
    });

    // selectbox 열기 - 170717 수정
    $('.wrapPlayer .selectWrap select').css('opacity', 0);
    $('.wrapPlayer .selectWrap > a').on('click', function () {
        $(this).css('opacity', 0);
        $(this).next().css('opacity', 1);
        return false;
    });

    // selectbox 닫기  - 170717 수정
    $('.wrapPlayer .selectWrap select').on('change', function () {
        $(this).prev().text($(this).val()).css('opacity', 1);
        $(this).css('zIndex', 0);
    });

    // selectbox option 텍스트 ...처리 - 170728 수정
    $('.wrapPlayer .selectWrap select option').each(function () {
        $(this).text(fnTextLimit($(this).text(), 55));
    });

    // 넘어온 문자열의 한글,영문을 합쳐서 최대값 계산 넣어줌 - 170728 수정
    function fnTextLimit(sStr, nLimit) {
        var tmp, strlen = 0;
        var rtnStr;
        if (fnStringLength(sStr) > nLimit) {
            for (i = 0; i < sStr.length; i++) {
                tmp = escape(sStr.substr(i, 1));
                if (tmp.length == 3 || tmp.length == 1)
                    strlen++;
                else
                    strlen += 2;

                if (strlen > nLimit) {
                    rtnStr = sStr.substring(0, i);
                    break;
                }
            }
            rtnStr = rtnStr + "...";
        } else {
            rtnStr = sStr;
        }
        return (rtnStr);
    }

    // 넘어온 문자열의 한글,영문을 합쳐서 바이트 계산하여 반환 - 170728 수정
    function fnStringLength(sStr) {
        var tmp, strlen = 0;
        for (i = 0; i < sStr.length; i++) {
            tmp = escape(sStr.substr(i, 1));
            if (tmp.length == 3 || tmp.length == 1)
                strlen++;
            else
                strlen += 2;
        }
        return (strlen);
    }
});