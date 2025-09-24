class Drawing {
    constructor(m_mcThis, nPictureFrame, subject) {
        this.nThicknessIdx = 1;
        this.nBrushType = 0;
        this.mcThis = m_mcThis;
        this.nPictureFrame = nPictureFrame;
        this.bDraw = false;
        this.subject = subject;

        audioManager.stopBGM();
        audioManager.playBGM("../sounds/b03/bgm1.mp3", 0.1);
    }

    play() {
        pageBase.setEnableStageTouch(true);
        this.mcThis.mcGuide.gotoAndStop(0);
        this.mcThis.mcGuide.getChildAt(0).gotoAndStop(0);

        this.mcThis.mcPicture.gotoAndStop(this.nPictureFrame);

        this.draw = new Draw(this.mcThis.mcCanvasArea);
        this.draw.drawable(false);

        Util.setClipCompleteCallback(this.mcThis.mcCha, () => {
            this.setPen();
            this.setPalette();
            this.setBtn();

            this.mcThis.mcGuide.getChildAt(0).gotoAndPlay(1);
            Util.addFuncAtFrame(this.mcThis.mcGuide.getChildAt(0), this.mcThis.mcGuide.getChildAt(0).totalFrames, () => {
                this.mcThis.mcGuide.getChildAt(0).stop();
                this.drawModuleInit();
                this.draw.drawable(true);
                this.controllerEnable(true);

                this.affordance("start");
            });
        });
    }

    controllerEnable(b) {
        this.arrBrushBar.forEach((bar) => (bar.mouseEnabled = b));
        this.arrBrush.forEach((brush) => (brush.mouseEnabled = b));
        this.mcErase.mouseEnabled = b;
        this.mcPalette.mouseEnabled = b;
        this.mcRe.mouseEnabled = b;
        this.mcSave.mouseEnabled = b;
    }

    drawModuleInit() {
        this.draw.setThickness(30);
        this.draw.setBrushType(1);
        this.draw.setAlpha(1);

        const shape = this.arrColor[0].getChildAt(0).getChildAt(0);
        this.draw.setColor(shape.graphics._fill.style);

        this.draw.onMouseDown(() => {
            this.affordance("stop");
            this.bDraw = true;
            this.arrBrushBar.forEach((bar) => (bar.visible = false));
            this.currnetPalette = null;
            this.currentPen = null;
            this.mcColorSet.visible = false;
            this.controllerEnable(true);
        });

        this.draw.onMouseUp(() => {
            // this.affordence("start");
            this.mcRe.gotoAndStop(1);
            this.mcSave.gotoAndStop(2);
        });
    }

    affordance(type) {
        if (type === "stop") {
            if (this.nAfforId) Util.clearTimeout(this.nAfforId);
            this.mcThis.mcGuide.gotoAndStop(1);
            this.mcThis.mcGuide.getChildAt(0).gotoAndStop(0);
        }

        if (type === "start") {
            this.affordance("stop");
            this.mcThis.mcGuide.gotoAndStop(1);
            this.mcThis.mcGuide.getChildAt(0).gotoAndStop(0);

            this.nAfforId = Util.setTimeout(() => {
                this.mcThis.mcGuide.getChildAt(0).gotoAndPlay(0);
                Util.addFuncAtFrame(this.mcThis.mcGuide.getChildAt(0), this.mcThis.mcGuide.getChildAt(0).totalFrames, () => {
                    this.affordance("start");
                });
            }, 10000);
        }
    }

    setPen() {
        let m_lib = pageBase.getMenuLib();
        this.currentPen = null;

        this.arrBrushBar = [];
        this.arrBrush = [];
        this.mcThis.mcPenSet.gotoAndStop(0);

        Util.setClipCompleteCallback(this.mcThis.mcPenSet.getChildAt(0), () => {
            this.mcThis.mcPenSet.gotoAndStop(1);
            const brushSet = this.mcThis.mcPenSet.getChildAt(0);

            const onClick = (e) => {
                const target = e.currentTarget;
                if (this.bDraw) this.affordance("stop");
                else this.affordance("start");
                audioManager.effect("../sounds/effClick.mp3");
                this.arrBrush.forEach((b) => b.gotoAndStop(0));
                target.gotoAndStop(1);

                this.mcColorSet.visible = false;
                this.currnetPalette = null;
                this.nBrushType = target.idx;
                this.arrBrushBar.forEach((bar) => (bar.visible = false));
                this.arrBrushBar[target.idx].visible = true;

                if (this.currentPen == target) {
                    this.arrBrushBar[target.idx].visible = false;
                    this.currentPen = null;
                } else this.currentPen = target;
                const arrThick = this.arrBrushBar[target.idx].arrThick;

                arrThick.forEach((t) => t.gotoAndStop(0));
                arrThick[this.nThicknessIdx].gotoAndStop(1);

                if (this.nBrushType == 0) {
                    this.draw.setBrushType(1);
                    this.draw.setAlpha(1);
                }

                if (this.nBrushType == 1) {
                    this.draw.setBrushType(2);
                    const mcAirbrush = new m_lib["mcAirbrush"]();
                    const brush = mcAirbrush.getChildAt(0);
                    this.draw.setBrush(brush, brush.scale, brush.scale);
                    this.draw.setBrushinterval(20);
                }

                if (this.nBrushType == 2) {
                    this.draw.setBrushType(2);
                    const mcCrayon = new m_lib["mcCrayon"]();
                    const brush = mcCrayon.getChildAt(0);
                    this.draw.setBrush(brush, brush.scale, brush.scale);
                    this.draw.setBrushinterval(20);
                }

                if (this.nBrushType == 3) {
                    this.draw.setBrushType(1);
                    this.draw.setAlpha(0.4);
                }

                if (this.nThicknessIdx == 0) {
                    if (this.draw.mode === "BRUSH") {
                        this.draw.setBrushScale(0.5);
                        this.draw.setBrushinterval(20 * 0.5);
                    } else this.draw.setThickness(12);
                }
                if (this.nThicknessIdx == 1) {
                    if (this.draw.mode === "BRUSH") {
                        this.draw.setBrushScale(1);
                        this.draw.setBrushinterval(20 * 1);
                    } else this.draw.setThickness(30);
                }
                if (this.nThicknessIdx == 2) {
                    if (this.draw.mode === "BRUSH") {
                        this.draw.setBrushScale(1.2);
                        this.draw.setBrushinterval(20 * 1.2);
                    } else this.draw.setThickness(40);
                }
            };
            const onThickClick = (e) => {
                if (this.bDraw) this.affordance("stop");
                else this.affordance("start");
                audioManager.effect("../sounds/effClick.mp3");
                const target = e.currentTarget;
                const mcBar = target.parent;

                this.nThicknessIdx = target.idx;
                mcBar.arrThick.forEach((t) => t.gotoAndStop(0));

                this.controllerEnable(false);
                Util.setTimeout(() => {
                    mcBar.visible = false;
                    this.currentPen = null;
                    this.controllerEnable(true);
                }, 100);

                target.gotoAndStop(1);

                if (this.nThicknessIdx == 0) {
                    if (this.draw.mode === "BRUSH") {
                        this.draw.setBrushScale(0.5);
                        this.draw.setBrushinterval(20 * 0.5);
                    } else this.draw.setThickness(12);
                }
                if (this.nThicknessIdx == 1) {
                    if (this.draw.mode === "BRUSH") {
                        this.draw.setBrushScale(1);
                        this.draw.setBrushinterval(20 * 1);
                    } else this.draw.setThickness(30);
                }
                if (this.nThicknessIdx == 2) {
                    if (this.draw.mode === "BRUSH") {
                        this.draw.setBrushScale(1.2);
                        this.draw.setBrushinterval(20 * 1.2);
                    } else this.draw.setThickness(40);
                }
            };

            for (let i = 0; i < 99; i++) {
                if (!brushSet["mcPen" + i]) break;

                this.arrBrushBar.push(brushSet["mcBar" + i]);
                this.arrBrush.push(brushSet["mcPen" + i]);
                brushSet["mcBar" + i].visible = false;
                brushSet["mcBar" + i].arrThick = [];
                brushSet["mcBar" + i].mcThick1.gotoAndStop(1);

                for (let j = 0; j < 99; j++) {
                    if (!brushSet["mcBar" + i]["mcThick" + j]) break;
                    brushSet["mcBar" + i]["mcThick" + j].idx = j;
                    brushSet["mcBar" + i].arrThick.push(brushSet["mcBar" + i]["mcThick" + j]);
                    brushSet["mcBar" + i]["mcThick" + j].addEventListener("click", onThickClick);
                }

                // 이벤트 통과방지
                brushSet["mcBar" + i].mcBoard.addEventListener("click", () => {});

                brushSet["mcPen" + i].addEventListener("click", onClick);
                brushSet["mcPen" + i].idx = i;
            }

            this.arrBrush[0].gotoAndStop(1);
            this.arrBrushBar[0].visible = true;
            this.currentPen = this.arrBrush[0];

            this.arrBrushBar.forEach((bar) => (bar.mouseEnabled = false));
            this.arrBrush.forEach((brush) => (brush.mouseEnabled = false));
        });
    }

    setPalette() {
        this.mcThis.mcPaletteSet.gotoAndStop(0);
        this.arrColor = [];
        Util.setClipCompleteCallback(this.mcThis.mcPaletteSet.getChildAt(0), () => {
            this.mcThis.mcPaletteSet.gotoAndStop(1);

            const { mcErase, mcColorSet, mcPalette } = this.mcThis.mcPaletteSet.getChildAt(0);
            this.mcColorSet = mcColorSet;
            this.mcErase = mcErase;
            this.mcPalette = mcPalette;

            const onColorClick = (e) => {
                if (this.bDraw) this.affordance("stop");
                else this.affordance("start");
                audioManager.effect("../sounds/effClick.mp3");
                const target = e.currentTarget;
                const shape = target.getChildAt(0).getChildAt(0);

                this.draw.setColor(shape.graphics._fill.style);
                if (target.name === "mcColor8") {
                    this.draw.setColor("#FFFFFF");
                }
                this.arrColor.forEach((c) => c.gotoAndStop(0));
                this.currnetPalette = null;
                target.gotoAndStop(1);

                if (this.nThicknessIdx == 0) {
                    if (this.draw.mode === "BRUSH") {
                        this.draw.setBrushScale(0.5);
                        this.draw.setBrushinterval(20 * 0.5);
                    } else this.draw.setThickness(12);
                }
                if (this.nThicknessIdx == 1) {
                    if (this.draw.mode === "BRUSH") {
                        this.draw.setBrushScale(1);
                        this.draw.setBrushinterval(20 * 1);
                    } else this.draw.setThickness(30);
                }
                if (this.nThicknessIdx == 2) {
                    if (this.draw.mode === "BRUSH") {
                        this.draw.setBrushScale(1.2);
                        this.draw.setBrushinterval(20 * 1.2);
                    } else this.draw.setThickness(40);
                }

                this.controllerEnable(false);
                Util.setTimeout(() => {
                    mcColorSet.visible = false;
                    this.controllerEnable(true);
                }, 100);
            };

            for (let i = 0; i < 99; i++) {
                if (!mcColorSet["mcColor" + i]) break;
                this.arrColor.push(mcColorSet["mcColor" + i]);
                mcColorSet["mcColor" + i].addEventListener("click", onColorClick);
            }

            mcErase.addEventListener("click", () => {
                this.draw.undo();
                if (this.draw.m_arrLine.length == 0) {
                    this.mcRe.gotoAndStop(0);
                    this.mcSave.gotoAndStop(0);
                    this.mcSave.mouseEnabled = false;
                    this.mcRe.mouseEnabled = false;
                    return;
                }
                audioManager.effect("../sounds/effClick.mp3");
                if (this.bDraw) this.affordance("stop");
                else this.affordance("start");

                this.mcColorSet.visible = false;
                this.currnetPalette = null;
                this.arrBrushBar.forEach((bar) => (bar.visible = false));
                this.currentPen = null;
            });

            mcPalette.addEventListener("click", (e) => {
                audioManager.effect("../sounds/effClick.mp3");
                if (this.bDraw) this.affordance("stop");
                else this.affordance("start");
                const target = e.currentTarget;

                this.arrBrushBar.forEach((bar) => (bar.visible = false));
                this.currentPen = null;
                mcColorSet.visible = true;

                if (this.currnetPalette == target) {
                    this.mcColorSet.visible = false;
                    this.currnetPalette = null;
                } else this.currnetPalette = target;
            });

            mcColorSet.visible = false;
            this.arrColor[0].gotoAndStop(1);

            // 이벤트레이어 막는다.
            mcColorSet.mcBoard.addEventListener("click", () => {});
            this.mcErase.mouseEnabled = false;
            this.mcPalette.mouseEnabled = false;
        });
    }

    setBtn() {
        const { mcRe, mcSave } = this.mcThis.mcBtnSet0;
        this.mcRe = mcRe;
        this.mcSave = mcSave;

        mcRe.addEventListener("click", () => {
            audioManager.effect("../sounds/effClick.mp3");
            this.bDraw = false;
            this.draw.clear();

            this.mcRe.gotoAndStop(0);
            this.mcSave.gotoAndStop(0);
            this.mcSave.mouseEnabled = false;
            this.mcRe.mouseEnabled = false;

            this.mcColorSet.visible = false;
            this.currnetPalette = null;
            this.arrBrushBar.forEach((bar) => (bar.visible = false));
            this.currentPen = null;
        });

        mcSave.addEventListener("click", () => {
            this.mcColorSet.visible = false;
            this.currnetPalette = null;
            this.arrBrushBar.forEach((bar) => (bar.visible = false));
            this.currentPen = null;

            this.subject.mouseEnabled(false);
            this.affordance("stop");
            audioManager.effect("../sounds/effClick.mp3");
            this.mcSave.gotoAndStop(1);
            this.mcThis.parent.mcPopSave.visible = true;
            this.draw.drawable(false);
            this.controllerEnable(false);
            Util.setClipCompleteCallback(this.mcThis.parent.mcPopSave, () => {
                this.mcThis.parent.mcPopSave.stop();

                const { mcClose0, mcClose1 } = this.mcThis.parent.mcPopSave;

                if (!mcClose0.hasEventListener("click")) {
                    mcClose0.addEventListener("click", () => {
                        audioManager.effect("../sounds/effClick.mp3");
                        this.mcThis.parent.mcPopSave.visible = false;

                        // 서버 저장
                        Util.setTimeout(() => {
                            this.savePortfolio(() => {
                                this.draw.drawable(true);
                                this.controllerEnable(true);
                                this.subject.mouseEnabled(true);
                                pageBase.completeStep();
                            });
                        }, 300);
                    });

                    mcClose1.addEventListener("click", () => {
                        audioManager.effect("../sounds/effClick.mp3");
                        this.draw.drawable(true);
                        this.controllerEnable(true);
                        this.subject.mouseEnabled(true);
                        this.mcThis.parent.mcPopSave.visible = false;
                    });
                }
            });
        });

        this.mcRe.mouseEnabled = false;
        this.mcSave.mouseEnabled = false;
    }

    savePortfolio(fn) {
        externalManager.captureToGallery("OEJ110102_b03.jpg", () => {
            console.log("저장");

            fn();
        });

        let bmpUrl;

        this.mcThis.mcCanvasArea.addChildAt(this.mcThis.mcPicture, 0);
        let cacheX = this.mcThis.mcCanvasArea.x - this.mcThis.mcCanvasArea.nominalBounds.width / 2;
        let cacheY = this.mcThis.mcCanvasArea.y - this.mcThis.mcCanvasArea.nominalBounds.height / 2;
        this.mcThis.mcCanvasArea.cache(cacheX, cacheY, this.mcThis.mcCanvasArea.nominalBounds.width, this.mcThis.mcCanvasArea.nominalBounds.height);
        bmpUrl = this.mcThis.mcCanvasArea.bitmapCache.getCacheDataURL();

        console.log(bmpUrl);

        let strImgName = `OEJ110102_b03_${new Date().getTime()}.jpg`;
        externalManager.onImageSaved((strPath) => {
            console.log("로컬이미지 저장완료", strPath);
            externalManager.upLoadImg(strPath, () => {
                this.mcThis.mcCanvasArea.uncache();
                console.log("저장");
            });
        });
        externalManager.saveBase64ImgToPng(strImgName, bmpUrl.split(",")[1]);

        //base64;;;

        // const mcCanvasArea = this.mcThis.mcCutCanvasArea;
        // const globalCutPt = mcCanvasArea.localToLocal(mcCanvasArea.nominalBounds.x, mcCanvasArea.nominalBounds.y, this.mcThis);
        // console.log(globalCutPt);
        // console.log(cjsManager.getElement("contents", "canvas"));

        // const canvasEl = cjsManager.getElement("contents", "canvas");
        // const image = canvasEl.toDataURL("image/jpeg");

        // const img = document.createElement("img");
        // img.id = "img";
        // img.src = image;

        // const cropImageCanvas = document.createElement("canvas");
        // const ctx = cropImageCanvas.getContext("2d");
        // cropImageCanvas.width = mcCanvasArea.nominalBounds.width;
        // cropImageCanvas.height = mcCanvasArea.nominalBounds.height;

        // img.addEventListener("load", (e) => {
        //     ctx.drawImage(
        //         img,
        //         globalCutPt.x,
        //         globalCutPt.y,
        //         mcCanvasArea.nominalBounds.width,
        //         mcCanvasArea.nominalBounds.height,
        //         0,
        //         0,
        //         mcCanvasArea.nominalBounds.width,
        //         mcCanvasArea.nominalBounds.height
        //     );

        //     const imageUrl = cropImageCanvas.toDataURL("image/jpeg");

        //     console.log(imageUrl);

        //     externalManager.onImageSaved(saveImage);
        //     const strImgPath = `OEJ110102_b03_${new Date().getTime()}.jpg`;
        //     const dataURL = imageUrl.split(",")[1];
        //     externalManager.saveBase64ImgToPng(strImgPath, dataURL);
        // });

        // function saveImage(strPath) {
        //     console.log(strPath);
        //     externalManager.upLoadImg(strPath, () => {
        //         console.log("저장 2");
        //     });

        //     //callback 학습완료.
        // }
    }
}
