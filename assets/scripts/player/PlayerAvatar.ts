/**
 * Created by xujiawei on 2020-07-08 20:27:52
 */

const { ccclass, property } = cc._decorator;

import { loadImage } from './../framework/common/ImageLoader';
import { reportError } from '../framework/common/Reportor';
import { Sprite } from '../framework/core/Sprite';

@ccclass
export class PlayerAvatar extends cc.Component {
    @property(cc.Sprite)
    icon: cc.Sprite = null;

    private iconSpfDefault: cc.SpriteFrame = null;

    onLoad() {
        this.iconSpfDefault = this.icon.spriteFrame;
    }

    updateUI(url: string = '') {
        // 先切换成默认头像
        this.icon.spriteFrame = this.iconSpfDefault;

        if (!url) {
            return;
        }
        
        loadImage(url, (err: Error, tex: cc.Texture2D) => {
            if (err) {
                const msg = `加载头像失败-> url: ${url}, err: ${err}`;
                cc.log(msg);
                reportError(msg);
                return;
            }

            this.icon.spriteFrame = new cc.SpriteFrame(tex);
        });
    }
}
