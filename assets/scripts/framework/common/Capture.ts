/**
 * Created by xujiawei on 2020-07-03 17:09:28
 * 
 * 截屏（web/native/wechatgame平台）
 */

function uint8arrayToBase64(u8Arr) {
    let CHUNK_SIZE = 0x8000; //arbitrary number
    let index = 0;
    let length = u8Arr.length;
    let result = '';
    let slice;
    while (index < length) {
        slice = u8Arr.subarray(index, Math.min(index + CHUNK_SIZE, length));
        result += String.fromCharCode.apply(null, slice);
        index += CHUNK_SIZE;
    }
    // web image base64图片格式: "data:image/png;base64," + b64encoded;
    // return  "data:image/png;base64," + btoa(result);
    return btoa(result);
}

function base64ToUint8Array(base64String) {
    let padding = '='.repeat((4 - base64String.length % 4) % 4);
    let base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    let rawData = window.atob(base64);
    let outputArray = new Uint8Array(rawData.length);

    for (var i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

const { ccclass, property } = cc._decorator;
@ccclass
export class Capture extends cc.Component {
    @property(cc.Camera)
    camera: cc.Camera = null;

    _canvas: any = null;
    _width: number = 0;
    _height: number = 0;
    texture: cc.RenderTexture;
    captureCb: (url: any)=>void = null;

    init(): void {
        this.camera.enabled = true;
        let texture = new cc.RenderTexture();
        texture.initWithSize(200, 200, cc.gfx.RB_FMT_S8);
        this.camera.targetTexture = texture;
        this.texture = texture;
    }

    //-----------capture web-----------
    createCanvas(): cc.RenderTexture {
        let width = this.texture.width;
        let height = this.texture.height;
        if (!this._canvas) {
            this._canvas = document.createElement('canvas');

            this._canvas.width = width;
            this._canvas.height = height;
        }
        else {
            this.clearCanvas();
        }
        let ctx = this._canvas.getContext('2d');
        this.camera.render();
        let data = this.texture.readPixels();
        // write the render data
        let rowBytes = width * 4;
        for (let row = 0; row < height; row++) {
            let srow = height - 1 - row;
            let imageData = ctx.createImageData(width, 1);
            let start = srow * width * 4;
            for (let i = 0; i < rowBytes; i++) {
                imageData.data[i] = data[start + i];
            }

            ctx.putImageData(imageData, 0, row);
        }
        return this._canvas;
    }

    createImg() {
        // return the type and dataUrl
        var dataURL = this._canvas.toDataURL("image/png");
        if (this.captureCb) {
            this.captureCb(dataURL);
        }
        // mark: 不需要展示，只要数据
        return;
        
        var img = document.createElement("img");
        img.src = dataURL;
        cc.log('image-base64:', dataURL);
        return img;
    }

    showImage(img) {
        let texture = new cc.Texture2D();
        texture.initWithElement(img);

        let spriteFrame = new cc.SpriteFrame();
        spriteFrame.setTexture(texture);

        let node = new cc.Node();
        let sprite = node.addComponent(cc.Sprite);
        sprite.spriteFrame = spriteFrame;

        node.zIndex = cc.macro.MAX_ZINDEX;
        node.parent = cc.director.getScene();
        // set position
        let width = cc.winSize.width;
        let height = cc.winSize.height;
        node.x = width / 2;
        node.y = height / 2;
        node.on(cc.Node.EventType.TOUCH_START, () => {
            node.parent = null;
            node.destroy();
        });

        this.captureAction(node, width, height);
    }

    // sprite action
    captureAction(capture: cc.Node, width: number, height: number) {
        let scaleAction = cc.scaleTo(1, 0.3);
        let targetPos = cc.v2(width - width / 6, height / 4);
        let moveAction = cc.moveTo(1, targetPos);
        let spawn = cc.spawn(scaleAction, moveAction);
        capture.runAction(spawn);
        let blinkAction = cc.blink(0.1, 1);
        // scene action
        // this.node.runAction(blinkAction);
    }

    captureWeb(): void {
        this.init();
        this.createCanvas();
        let img = this.createImg();
        this.showImage(img);
    }

    clearCanvas(): void {
        let ctx = this._canvas.getContext('2d');
        ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
    }

    // -------------native capture-------------
    initImage() {
        let data = this.texture.readPixels();
        this._width = this.texture.width;
        this._height = this.texture.height;
        let picData = this.filpYImage(data, this._width, this._height);
        return picData;
    }

    showImageNative(picData) {
        let texture = new cc.Texture2D();
        texture.initWithData(picData, 32, this._width, this._height);

        let spriteFrame = new cc.SpriteFrame();
        spriteFrame.setTexture(texture);

        let node = new cc.Node();
        let sprite = node.addComponent(cc.Sprite);
        sprite.spriteFrame = spriteFrame;

        node.zIndex = cc.macro.MAX_ZINDEX;
        node.parent = cc.director.getScene();
        // set position
        let width = cc.winSize.width;
        let height = cc.winSize.height;
        node.x = width / 2;
        node.y = height / 2;
        node.on(cc.Node.EventType.TOUCH_START, () => {
            node.parent = null;
            node.destroy();
        });

        this.captureAction(node, width, height);
    }

    // This is a temporary solution
    filpYImage(data, width, height) {
        cc.log("flipY image");
        // create the data array
        let picData = new Uint8Array(width * height * 4);
        let rowBytes = width * 4;
        for (let row = 0; row < height; row++) {
            let srow = height - 1 - row;
            let start = srow * width * 4;
            let reStart = row * width * 4;
            // save the piexls data
            for (let i = 0; i < rowBytes; i++) {
                picData[reStart + i] = data[start + i];
            }
        }
        return picData;
    }

    saveFile(picData) {
        if (CC_JSB) {
            let filePath = jsb.fileUtils.getWritablePath() + 'render_to_sprite_image.png';
            let success = jsb.saveImageData(picData, this._width, this._height, filePath)
            if (success) {
                cc.log("save image data success, file: " + filePath);
            }
            else {
                cc.error("save image data failed!");
            }
        }
    }

    captureNative() {
        this.init();
        // 必须延迟一帧
        this.scheduleOnce(() => {
            let picData = this.initImage();
            this.saveFile(picData);
            this.showImageNative(picData);
            this.camera.enabled = false;
        }, 0);
    }

    //---------wechatgame capture--------
    captureWechatgame() {
        this.init();
        // create the capture
        this.scheduleOnce(() => {
            let canvas = this.createCanvas();
            this.createImg();
            this.saveFileWechatgame(canvas);
        }, 0);
    }

    saveFileWechatgame(canvas) {
        // This is one of the ways that could save the img to your local.
        if (cc.sys.platform === cc.sys.WECHAT_GAME) {
            let data = {
                x: 0,
                y: 0,
                width: canvas.width,
                height: canvas.height,
                // destination file sizes
                destWidth: canvas.width,
                destHeight: canvas.height,
                fileType: 'png',
                quality: 1
            }
            // https://developers.weixin.qq.com/minigame/dev/api/render/canvas/Canvas.toTempFilePathSync.html
            let _tempFilePath = canvas.toTempFilePathSync(data);
            cc.log(`Capture file success!${_tempFilePath}`);
            // self.label.string = '图片加载完成，等待本地预览';
            // https://developers.weixin.qq.com/minigame/dev/api/media/image/wx.previewImage.html
            wx.previewImage({
                urls: [_tempFilePath],
                success: (res) => {
                    cc.log('Preview image success.');
                }
            });
        }
    }

    capture(cb) {
        this.captureCb = cb;
        if (cc.sys.platform == cc.sys.WECHAT_GAME) {
            cc.log("capture wechatgame");
            this.captureWechatgame();
        } else if (cc.sys.isNative) {
            cc.log("capture native");
            this.captureNative();
        } else if (cc.sys.isBrowser) {
            cc.log("capture web");
            this.captureWeb();
        } else {
            cc.log("该平台暂不支持截屏");
        }
    }
}