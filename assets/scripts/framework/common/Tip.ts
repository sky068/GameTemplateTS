/**
 * Created by xujiawei on 2020-07-07 18:44:31
 */


import { track } from "./Reportor";
import { ConstData } from "../data/ConstData";

const { ccclass, property } = cc._decorator;
const DELAY_LONG = 2.0;
const DELAY_MID = 1.5;
const DELAY_SHORT = 1.0;

@ccclass
export class Tip extends cc.Component {
    @property(cc.Label)
    tipLabel: cc.Label = null;

    @property(cc.Node)
    tipBg: cc.Node = null;

    static tipNode: cc.Node = null;

    originalWidth: number = 0;
    originalHeight: number = 0;

    // 显示tip
    static show(text: string) {
        cc.loader.loadRes('prefabs/common/Tip', cc.Prefab, function (err, prefab: cc.Prefab) {
            if (!err) {
                if (cc.isValid(this.tipNode)) {
                    this.tipNode.destroy();
                }
                this.tipNode = cc.instantiate(prefab);
                this.tipNode.x = this.tipNode.y = 0;
                this.tipNode.zIndex = ConstData.ZIndex.TIP;
                this.tipNode.parent = cc.Canvas.instance.node;
                this.tipNode.getComponent('Tip').init(text);

                track({
                    action: 'game_toast',
                    type: 'error',
                    content: text
                });
            }
        }.bind(this))
    }

    onLoad() {
        // 原始大小
        this.originalWidth = this.tipBg.width;
        this.originalHeight = this.tipBg.height;

        this.tipBg.opacity = 0;
        this.tipLabel.string = '';
    }

    init(text: string) {
        this.tipLabel.string = text;

        // mark: label赋值后不会立即刷新宽度, 
        // mark: 改用layout实现了不再需要手动修改背景图宽度
        this.tipLabel._forceUpdateRenderData();
        // if (this.tipLabel.node.width > this.originalWidth) {
        //     this.tipBg.width = this.tipLabel.node.width + 10;
        // }
       
        if (this.tipLabel.node.width > cc.visibleRect.width - 60) {
            this.tipLabel.overflow = cc.Label.Overflow.SHRINK;
            this.tipLabel.node.width = cc.visibleRect.width - 60;
        } else {
            this.tipLabel.overflow = cc.Label.Overflow.NONE;
        }

        let seq = cc.sequence(
            cc.spawn(cc.moveBy(0.25, cc.v2(0, 100)), cc.fadeIn(0.25)),
            cc.delayTime(DELAY_LONG),
            cc.spawn(cc.moveBy(0.25, cc.v2(0, 100)), cc.fadeOut(0.25)),
            cc.callFunc(function () {
                this.node.destroy();
            }.bind(this)),
        );
        this.tipBg.y = -100;
        this.tipBg.runAction(seq);
    }
}