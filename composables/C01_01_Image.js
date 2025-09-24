class C01_01_Image {
    constructor(mcThis) {
        this.mcThis = mcThis;
        this.comp;
        this.bPlayed = false;
    }

    play(frame) {
        this.mcThis.gotoAndStop(frame);
        this.module = this.mcThis.getChildAt(0);
        this.btnComp = this.module.mcComplete;

        if (!this.bPlayed) {
            this.setModule();
        } else {
            this.btnComp.gotoAndStop(1);
        }
    }

    setModule() {
        console.log("setImage");

        const checkImage = (strPath) => {
            // strPath 풀페스

            console.log(strPath);
            let newPath = `${strPath}?${new Date().getTime()}`;
            console.log(`${newPath}`);

            let bitmap = new createjs.Bitmap(newPath);
            console.log(bitmap);
            console.log(bitmap.image.url);
            //1초뒤 이미지 등장
            // setTimeout(() => {
            //     // const minScale = Math.min(
            //     //     this.module.mcCanvasArea.nominalBounds.height / bitmap.image.naturalHeight,
            //     //     this.module.mcCanvasArea.nominalBounds.width / bitmap.image.naturalWidth
            //     // );
            //     // const marginX = (this.module.mcCanvasArea.nominalBounds.width - bitmap.image.naturalWidth * minScale) / 2;
            //     // const marginY = (this.module.mcCanvasArea.nominalBounds.height - bitmap.image.naturalHeight * minScale) / 2;

            //     // bitmap.scale = minScale;
            //     bitmap.x = this.module.mcCanvasArea.x - this.module.mcCanvasArea.nominalBounds.width / 2; // + marginX;
            //     bitmap.y = this.module.mcCanvasArea.y - this.module.mcCanvasArea.nominalBounds.height / 2; //+ 10;

            //     const globalCutPt = this.module.mcCanvasArea.localToLocal(
            //         this.module.mcCanvasArea.nominalBounds.x,
            //         this.module.mcCanvasArea.nominalBounds.y,
            //         this.mcThis
            //     );

            //     let mask = new createjs.Shape(
            //         new createjs.Graphics()
            //             .beginFill("#fff")
            //             .drawRoundRectComplex(globalCutPt.x, globalCutPt.y, bitmap.image.naturalWidth, bitmap.image.naturalHeight, 65, 65, 0, 0)
            //     );
            //     bitmap.mask = mask;

            //     this.module.mcCanvasArea.removeAllChildren();
            //     this.module.mcCanvasArea.addChild(bitmap);
            // }, 1000);

            // ori
            // //1초뒤 이미지 등장
            setTimeout(() => {
                // const minScale = Math.min(
                //     this.module.mcCanvasArea.nominalBounds.height / bitmap.image.naturalHeight,
                //     this.module.mcCanvasArea.nominalBounds.width / bitmap.image.naturalWidth
                // );
                // const marginX = (this.module.mcCanvasArea.nominalBounds.width - bitmap.image.naturalWidth * minScale) / 2;
                // const marginY = (this.module.mcCanvasArea.nominalBounds.height - bitmap.image.naturalHeight * minScale) / 2;

                // bitmap.scale = 1.05;
                // bitmap.x = this.module.mcCanvasArea.x - this.module.mcCanvasArea.nominalBounds.width / 2 + marginX;
                // bitmap.y = this.module.mcCanvasArea.y - this.module.mcCanvasArea.nominalBounds.height / 2 + 30;
                bitmap.x = this.module.mcCanvasArea.x - this.module.mcCanvasArea.nominalBounds.width / 2;
                bitmap.y = this.module.mcCanvasArea.y - this.module.mcCanvasArea.nominalBounds.height / 2;

                // const globalCutPt = this.module.mcCanvasArea.localToLocal(
                //     this.module.mcCanvasArea.nominalBounds.x,
                //     this.module.mcCanvasArea.nominalBounds.y,
                //     this.mcThis
                // );

                // console.log(bitmap.image.naturalWidth * minScale, bitmap.image.naturalHeight * minScale);

                // let mask = new createjs.Shape(
                //     new createjs.Graphics()
                //         .beginFill("#fff")
                //         .drawRoundRectComplex(
                //             globalCutPt.x / minScale,
                //             globalCutPt.y,
                //             bitmap.image.naturalWidth * minScale,
                //             bitmap.image.naturalHeight * minScale,
                //             65,
                //             65,
                //             0,
                //             0
                //         )
                // );
                // bitmap.mask = mask;

                this.module.mcCanvasArea.removeAllChildren();
                this.module.mcCanvasArea.addChild(bitmap);
            }, 1000);
        };

        externalManager.imgCheck(checkImage);

        //이미지 등장 후 3초 뒤 확인버튼 등장
        this.btnComp.gotoAndStop(0);
        this.btnComp.getChildAt(0).gotoAndStop(0);
        Util.setTimeout(() => {
            console.log("comp");
            this.btnComp.getChildAt(0).gotoAndPlay(1);
            Util.addFuncAtFrame(this.btnComp.getChildAt(0), this.btnComp.getChildAt(0).totalFrames, () => {
                this.btnComp.getChildAt(0).stop();
                this.btnComp.mouseEnabled = true;
                this.btnComp.gotoAndStop(1);
            });
            this.btnComp.addEventListener("click", () => {
                this.bPlayed = true;
                this.comp();
            });
        }, 3000);
    }

    complete(fn) {
        this.comp = fn;
    }
}
