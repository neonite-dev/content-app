var subtitle_url = "https://hbedu1.starplayer.net/scms/cc.php";

function initScriptUI(I) {
    var z = false;
    var G = false;
    var w;
    $(".starplayer_script_ui a").click(function (M) {
        M.preventDefault()
    });
    $(".starplayer_script_ui").each(function () {
        this.onselectstart = function () {
            return false
        };
        this.unselectable = "on";
        jQuery(this).css("user-select", "none");
        jQuery(this).css("-o-user-select", "none");
        jQuery(this).css("-moz-user-select", "none");
        jQuery(this).css("-khtml-user-select", "none");
        jQuery(this).css("-webkit-user-select", "none")
    });
    $(".btn_play").click(q);
    $(".btn_pause").click(function () {
        I.pause()
    });
    $(".btn_backward").click(function () {
        v("back")
    });
    $(".btn_forward").click(function () {
        v("front")
    });
    $(".btn_rate_minus").click(function () {
        u()
    });
    $(".btn_rate_plus").click(function () {
        n()
    });
    $(".btn_rate").click(function () {
        l()
    });
    $(".btn_repeat").click(function () {
        b()
    });
    $(".btn_fullscreen").click(function () {
        m()
    });
    $(".btn_mute").click(function () {
        J()
    });
    $(".btn_resolution").click(function () {
        c()
    });
    $(".btn_speed06").click(function () {
        e(0.6)
    });
    $(".btn_speed08").click(function () {
        e(0.8)
    });
    $(".btn_speed10").click(function () {
        e(1)
    });
    $(".btn_speed12").click(function () {
        e(1.2)
    });
    $(".btn_speed14").click(function () {
        e(1.4)
    });
    $(".btn_speed16").click(function () {
        e(1.6)
    });
    $(".btn_speed18").click(function () {
        e(1.8)
    });
    $(".btn_speed20").click(function () {
        e(2)
    });
    $(".btn_sd").click(function () {        
        F("sd")
    });
    $(".btn_hd").click(function () {        
        F("hd")
    });
    $(".btn_super").click(function () {
        F("super")
    });
    $(".volumebar").hover(function () {
        $(".btn_volume").show()
    }, function () {
        $(".btn_volume").hide()
    });
    $(".seekbar_l").hover(function () {
        $(".btn_seek").show()
    }, function () {
        $(".btn_seek").hide()
    });
    $("#video-container").click(function () {
        s()
    });

    function s() {
        if ($(".rate_popup").css("display") == "block") {
            $(".rate_popup").hide()
        }
        if ($(".resolution_popup").css("display") == "block") {
            $(".resolution_popup").hide()
        }
    }

    function v(M) {
        if (M == "back") {
            I.backward(parseInt(getStep()))
        } else {
            if (M == "front") {
                I.forward(parseInt(getStep()))
            }
        }
    }

    function F(M) {        
        switch (M) {
            case "sd":
                I.onCustom(200);
                $(".btn_resolution").addClass("sd");
                $(".btn_resolution").removeClass("hd");
                $(".btn_common2").removeClass("active");
                $(".btn_sd").addClass("active");                
                break;
            case "hd":
                I.onCustom(201);
                $(".btn_resolution").addClass("hd");
                $(".btn_resolution").removeClass("sd");
                $(".btn_common2").removeClass("active");
                $(".btn_hd").addClass("active");
                break
            case "super":
                I.onCustom(203);
                $(".btn_resolution").addClass("super");
                $(".btn_resolution").removeClass("sd");
                $(".btn_common2").removeClass("active");
                $(".btn_super").addClass("active");
                break
        }
    }

    function c() {
        var M = $(".resolution_popup").css("display");
        if ($(".rate_popup").css("display")) {
            $(".rate_popup").hide()
        }      

        if (M != "none") {
            $(".resolution_popup").hide()
        } else {
            $(".resolution_popup").show()
        }
    }

    function l() {
        var M = $(".rate_popup").css("display");
        if ($(".resolution_popup").css("display")) {
            $(".resolution_popup").hide()
        }
        if (M != "none") {
            $(".rate_popup").hide();
            $(".btn_rate").removeClass("active")
        } else {
            $(".rate_popup").show();
            $(".btn_rate").addClass("active")
        }
    }

    function u() {
        var M = (I.getRate() - 0.2) < 0.6 ? 0.6 : (I.getRate() - 0.2);
        I.setRate(M.toFixed(1))
    }

    function n() {
        var M = I.getRate() + 0.2;
        I.setRate(M.toFixed(1))
    }

    function k(M) {
        return M.originalEvent.changedTouches ? M.originalEvent.changedTouches[0].pageX : M.pageX
    }
    $(".seekbar_l").bind("mousedown touchstart", function (P) {
        var Q = $(this);

        function N(S) {
            var R = k(S) - Q.offset().left;
            var T = (R / Q.width()) * I.getDuration();
            if (T < 0) {
                T = 0
            }
            if (T > I.getDuration()) {
                T = I.getDuration()
            }
            return T
        }

        function O(R) {
            var S = N(R);
            L(S);
            R.preventDefault()
        }

        function M(R) {
            z = false;
            var S = I.getCurrentPosition();
            I.setCurrentPosition(N(R));
            $(document).unbind("mousemove touchmove", O);
            Q.unbind("mousemove touchmove", O);
            $(document).unbind("mouseup touchend", M)
        }
        z = true;
        L(N(P));
        $(document).bind("mousemove touchmove", O);
        Q.bind("mousemove touchmove", O);
        $(document).bind("mouseup touchend", M);
        P.preventDefault()
    });
    $(".btn_repeatA").bind("mousedown touchstart", function (P) {
        var Q = $(this).parent();

        function N(T) {
            var S = k(T) - Q.offset().left - 7;
            var U = (S / Q.width()) * I.getDuration();
            if (U < 0) {
                U = 0
            } else {
                if (U > I.getRepeatEndTime()) {
                    U = I.getRepeatEndTime()
                }
            }
            return U
        }

        function R(U) {
            var S = (U / I.getDuration()) * 100 + "%";
            var T = ((I.getRepeatEndTime() - U) / I.getDuration() * 100) + "%";
            $(".btn_repeatA").css("left", S);
            $(".repeatbar").css("left", S).css("width", T);
            $("#text_currentTime").text(A(U))
        }

        function O(S) {
            R(N(S));
            S.preventDefault()
        }

        function M(S) {
            G = false;
            I.setRepeatStartTime(N(S));
            $(document).unbind("mousemove touchmove", O);
            Q.unbind("mousemove touchmove", O);
            $(document).unbind("mouseup touchend", M)
        }
        G = true;
        R(N(P));
        $(document).bind("mousemove touchmove", O);
        Q.bind("mousemove touchmove", O);
        $(document).bind("mouseup touchend", M);
        P.preventDefault();
        P.stopPropagation()
    });
    $(".btn_repeatB").bind("mousedown touchstart", function (P) {
        var Q = $(this).parent();

        function N(T) {
            var S = k(T) - Q.offset().left - 7;
            var U = (S / Q.width()) * I.getDuration();
            if (U < I.getRepeatStartTime()) {
                U = I.getRepeatStartTime()
            } else {
                if (U > I.getDuration()) {
                    U = I.getDuration()
                }
            }
            return U
        }

        function R(T) {
            var U = (T / I.getDuration()) * 100 + "%";
            var S = ((T - I.getRepeatStartTime()) / I.getDuration() * 100) + "%";
            $(".btn_repeatB").css("left", U);
            $(".repeatbar").css("width", S);
            $("#text_currentTime").text(A(T))
        }

        function O(S) {
            R(N(S));
            S.preventDefault()
        }

        function M(S) {
            G = false;
            I.setRepeatEndTime(N(S));
            $(document).unbind("mousemove touchmove", O);
            Q.unbind("mousemove touchmove", O);
            $(document).unbind("mouseup touchend", M)
        }
        G = true;
        R(N(P));
        $(document).bind("mousemove touchmove", O);
        Q.bind("mousemove touchmove", O);
        $(document).bind("mouseup touchend", M);
        P.preventDefault();
        P.stopPropagation()
    });
    $(".volumebar").bind("mousedown touchstart", function (P) {
        var Q = $(this);

        function O(T) {
            var R = k(T) - Q.offset().left;
            var S = R / Q.width();
            if (S < 0) {
                S = 0
            } else {
                if (S > 1) {
                    S = 1
                }
            }
            return S
        }

        function N(S) {
            var R = O(S);
            I.setVolume(R);
            S.preventDefault()
        }

        function M(R) {
            I.setVolume(O(R));
            $(document).unbind("mousemove touchmove", N);
            Q.unbind("mousemove touchmove", N);
            $(document).unbind("mouseup touchend", M)
        }
        I.setVolume(O(P));
        $(document).bind("mousemove touchmove", N);
        Q.bind("mousemove touchmove", N);
        $(document).bind("mouseup touchend", M);
        P.preventDefault()
    });
    I.bindEvent("open_state_change", t);
    I.bindEvent("play_state_change", h);
    I.bindEvent("rate_change", B);
    I.bindEvent("repeat_change", o);
    I.bindEvent("volume_change", D);
    I.bindEvent("repeat_range_change", y);
    I.bindEvent("fullscreen_change", d);
    I.bindEvent("position_change", r);
    var H;
    var j;

    function g(N) {
        var M = "";
        HTMLParser(N, {
            start: function (O, Q, P) { },
            end: function (O) { },
            chars: function (O) {
                M += O.replace("&nbsp;", " ")
            },
            comment: function (O) { }
        });
        return M
    }

    function p(N) {
        if (typeof j == "undefined") {
            return
        }
        var O = parseInt(N / 100, 10) * 100;
        var M = j.get(O);
        if (typeof M != "undefined") {
            //return g(M)
        }
        else{
             M = j.get(H.getTimeline(O));
            //return g(M);
        }
        return g(M);
    }

    function x(M) {
        j = H.getLanguage(M)
    }

    function i(N) {        
        H = new Smi();
        var M = subtitle_url + "?smi=";
        M += encodeURIComponent(N);
        $.ajax({
            url: M,
            dataType: "jsonp",
            success: function (R) {
                var Q = decodeURIComponent(R);
                if (H.parse(Q) == false) {
                    return
                }
                var P = H.getLangCount();
                if (P < 1) {
                    return
                }
                var O = H.getLangNames();
                x(O)
            },
            error: function (O) { }
        })
    }

    function r(M) {
        $("#subtitle").text("")
    }

    function d(M) {
        if (M) {
            $(".btn_fullscreen").addClass("active")
        } else {
            $(".btn_fullscreen").removeClass("active")
        }
        s()
    }

    function t(N) {
        switch (N) {
            case OpenState.OPENING:
                break;
            case OpenState.OPENED:
                f(I.getDuration());
                var M = I.getSubtitleUrl();
                if (M) {
                    i(M)
                }
                w = setInterval(K);
                break;
            case OpenState.CLOSED:
                break
        }
        C(a(N))
    }

    function h(M) {
        switch (M) {
            case PlayState.PLAYING:
                $(".btn_play").removeClass("btn_play").addClass("btn_pause");
                break;
            case PlayState.PAUSED:
                $(".btn_pause").removeClass("btn_pause").addClass("btn_play");
                break;
            case PlayState.STOPPED:
                $(".btn_pause").removeClass("btn_pause").addClass("btn_play");
                break;
            case PlayState.BUFFERING_STARTED:
                break
        }
        C(E(M))
    }

    function C(M) {
        $(".control_text_status").text(M)
    }

    function B(O) {
        $(".btn_common").removeClass("active");
        var M = Math.ceil(parseInt(O * 10));
        M /= 10;
        var N;
        switch (M) {
            case 0.6:
                N = $(".btn_speed06");
                $(".btn_rate").css("background", "url('./img/milkt.png') no-repeat -30px -140px");
                break;
            case 0.8:
                N = $(".btn_speed08");
                $(".btn_rate").css("background", "url('./img/milkt.png') no-repeat -30px -150px");
                break;
            case 1:
                N = $(".btn_speed10");
                $(".btn_rate").css("background", "url('./img/milkt.png') no-repeat -240px -150px");
                break;
            case 1.2:
                N = $(".btn_speed12");
                $(".btn_rate").css("background", "url('./img/milkt.png') no-repeat -30px -160px");
                break;
            case 1.4:
                N = $(".btn_speed14");
                $(".btn_rate").css("background", "url('./img/milkt.png') no-repeat -240px -160px");
                break;
            case 1.6:
                N = $(".btn_speed16");
                $(".btn_rate").css("background", "url('./img/milkt.png') no-repeat -240px -170px");
                break;
            case 1.8:
                N = $(".btn_speed18");
                $(".btn_rate").css("background", "url('./img/milkt.png') no-repeat -240px -180px");
                break;
            case 2:
                N = $(".btn_speed20");
                $(".btn_rate").css("background", "url('./img/milkt.png') no-repeat -240px -190px");
                break
        }
        N.addClass("active")
    }

    function o(M) {
        if (M) {
            $(".btn_repeat").addClass("active");
            $(".btn_repeatA").css("left", "0%").show();
            $(".btn_repeatB").css("left", "100%").show()
        } else {
            $(".btn_repeat").removeClass("active");
            $(".btn_repeatA").hide();
            $(".btn_repeatB").hide()
        }
    }

    function D(N, M) {
        if (M) {
            $(".btn_mute").addClass("active")
        } else {
            $(".btn_mute").removeClass("active")
        }
        $(".btn_volume").css("left", N * 100 + "%");
        $(".current_volumebar").css("width", N * 100 + "%")
    }

    function y(Q, N) {
        if (I.getRepeat()) {
            $(".btn_repeat").addClass("active");
            var M = (Q / I.getDuration() * 100) + "%";
            var P = (N / I.getDuration() * 100) + "%";
            var O = ((N - Q) / I.getDuration() * 100) + "%";
            $(".btn_repeatA").css("left", M).show();
            $(".btn_repeatB").css("left", P).show();
            $(".repeatbar").css("left", M).css("width", O).show()
        } else {
            $("btn_repeat").removeClass("active");
            $(".btn_repeatA").hide();
            $(".btn_repeatB").hide();
            $(".repeatbar").hide()
        }
    }

    function K() {
        var M = I.getCurrentPosition();
        if (!z) {
            L(M)
        }
        if (typeof j != "undefined") {
            var N = p(M * 1000);
            if (N != "") {
                $("#subtitle").text(N)
            }
        }
    }

    function L(N) {
        var M = I.getDuration();
        var O = (M > 0 ? (N / M) * 100 : 0) + "%";
        $(".btn_seek").css("left", O);
        $(".currentbar").css("width", O);
        if (!G) {
            $("#text_currentTime").text(A(N))
        }
    }

    function f(M) {
        $("#text_duration").text(A(M))
    }

    function q() {
        if (I.getPlayState() == PlayState.PLAYING) {
            I.pause()
        } else {
            I.play()
        }
    }

    function b() {
        var M = I.getRepeat();
        I.setRepeat(!M)
    }

    function m() {
        if (I.getPlayState() == PlayState.PLAYING || I.getPlayState() == PlayState.PAUSED) {
            var M = I.getFullscreen();
            I.setFullscreen(!M)
        } else {
            I.setFullscreen(false)
        }
    }

    function J() {
        var M = I.getMute();
        I.setMute(!M)
    }

    function e(M) {
        I.setRate(M)
    }

    function A(Q) {
        if (!Q) {
            Q = 0
        }
        var O = parseInt(Q) % 60;
        var M = parseInt(Q / 60) % 60;
        var N = parseInt(Q / 60 / 60);

        function P(R) {
            if (R < 10) {
                return "0" + R
            } else {
                return R
            }
        }
        return [P(N), P(M), P(O)].join(":")
    }

    function a(M) {
        switch (M) {
            case OpenState.CLOSED:
                return "닫힘";
            case OpenState.OPENING:
                return "여는 중";
            case OpenState.OPENED:
                return "열림";
            case OpenState.CLOSING:
                return "닫는 중"
        }
    }

    function E(M) {
        switch (M) {
            case PlayState.STOPPED:
                return "정지";
            case PlayState.PLAYING:
                return "재생중";
            case PlayState.PAUSED:
                return "일시정지";
            case PlayState.BUFFERING_STARTED:
                return "버퍼링";
            case PlayState.COMPLETE:
                return "재생완료"
        }
    }
};