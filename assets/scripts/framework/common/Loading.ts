/**
 * Created by xujiawei on 2020-07-07 18:33:16
 * 加载遮罩，用于异步请求时隔离用户操作并超时提示
 */

import { Node } from './../core/Node';
import { Label } from './../core/Label';
import { ConstData } from './../data/ConstData';
import { Sprite } from './../core/Sprite';

const { ccclass } = cc._decorator;

@ccclass
export class Loading extends cc.Component {
    static loadingNode: cc.Node = null;
    static loadingComponent: any = null;

    static show(loadingName: string, delayTime: number = 1.0) {
        if (!cc.isValid(this.loadingNode)) {
            this.loadingNode = Node.createNode({
                name: 'loading',
                width: ConstData.DesignSize.width * 2,
                height: ConstData.DesignSize.width * 2,
                zIndex: ConstData.ZIndex.LOADING,
                parent: cc.Canvas.instance.node,
            });
            this.loadingComponent = this.loadingNode.addComponent('Loading');
            this.loadingComponent.init();
        }

        this.loadingComponent.show(loadingName, delayTime);
    }

    static hide(loadingName: string) {
        if (cc.isValid(this.loadingNode)) {
            this.loadingComponent.hide(loadingName);
        }
    }

    loadingList = [];
    maskNode: cc.Node = null;

    init() {
        // 控制触摸
        this.node.width = ConstData.DesignSize.width * 2;
        this.node.height = ConstData.DesignSize.height * 2;
        this.node.addComponent(cc.BlockInputEvents);

        // 黑色遮罩
        this.maskNode = Sprite.createNode({
            name: 'maskNode',
            url: 'textures/common/mask',
            parent: this.node,
            sizeMode: cc.Sprite.SizeMode.CUSTOM,
            size: cc.size(cc.visibleRect.width * 1.5, cc.visibleRect.height * 1.5),
        });

        // todo: loading动画
        Label.createNode({
            string: "拼命加载中...",
            parent: this.maskNode,
            systemFont: true,
            fontSize: 36,
            lineHeight: 38,
        });
        this.maskNode.active = false;
    }

    show(name: string, delay:number = 1.0) {
        // 存在当前loading
        if (this.loadingList.indexOf(name) == -1) {
            this.loadingList.push(name);
        }

        this.node.active = true;

        this.node.stopAllActions();

        let delaySeq = cc.sequence(
            cc.delayTime(delay), // 先有遮罩一秒钟后才触发显示loading超时提示,
            cc.callFunc(function () {
                this.delaySeq = null;
                this.maskNode.active = true;
            }.bind(this))
        );

        this.node.runAction(delaySeq);
    }

    hide(name: string) {
        // 存在当前loading
        const index = this.loadingList.indexOf(name);
        if (index > -1) {
            this.loadingList.splice(index, 1);
        }

        if (this.loadingList.length == 0) {
            this.node.active = false;
            this.maskNode.active = false;
        }
    }

    clean() {
        this.node.active = false;
        this.loadingList = [];
    }
}