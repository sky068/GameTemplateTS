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

    /**
     * 显示loading并立即屏蔽触摸
     * @param loadingName {string} loading名字，可以同时显示多个loading
     * @param delayTime {number} 延迟显示动画/文字的时间
     */
    static show(loadingName: string, delayTime: number = 1.0) {
        if (!cc.isValid(this.loadingNode)) {
            this.loadingNode = Node.createNode({
                name: 'loading',
                width: cc.visibleRect.width * 1.5,
                height: cc.visibleRect.height * 1.5,
                zIndex: ConstData.ZIndex.LOADING,
                parent: cc.Canvas.instance.node,
            });
            this.loadingComponent = this.loadingNode.addComponent('Loading');
            this.loadingComponent.init();
        }

        this.loadingComponent.show(loadingName, delayTime);
    }

    /**
     * 隐藏loading
     * @param loadingName {string}
     */
    static hide(loadingName: string) {
        if (cc.isValid(this.loadingNode)) {
            this.loadingComponent.hide(loadingName);
        }
    }

    /**
     * 删除loading 释放资源, 一般loading会反复使用，尽量不删除方便下次快速创建
     */
    static deleteLoading() {
        if (cc.isValid(this.loadingNode)) {
            let sp = this.loadingNode.getComponent(cc.Sprite);
            if (sp && sp.spriteFrame) {
                sp.spriteFrame.decRef();
            }
            this.loadingNode.destroy();
            this.loadingNode = null;
            this.loadingComponent = null;
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
            fontSize: 30,
            lineHeight: 32,
        });
        this.maskNode.active = false;
    }

    show(name: string, delay: number = 1.0) {
        // 存在当前loading
        if (this.loadingList.indexOf(name) == -1) {
            this.loadingList.push(name);
        }

        cc.Tween.stopAllByTarget(this.node);
        this.node.active = true;
        // 先有遮罩delay秒钟后才触发显示loading超时提示
        cc.tween(this.node).delay(delay).call(() => {
            this.maskNode.active = true;
        }).start();
    }

    hide(name: string) {
        // 不存在当前loading
        const index = this.loadingList.indexOf(name);
        if (index > -1) {
            this.loadingList.splice(index, 1);
        }

        if (this.loadingList.length == 0) {
            this.node.active = false;
            this.maskNode.active = false;
        }
    }
}