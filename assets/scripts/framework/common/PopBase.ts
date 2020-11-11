/**
 * Created by xujiawei on 2020-07-07 14:35:42
 * @deprecated !!!已经弃用，请使用PopupBase配合PopUpMng使用
 */

import { Button } from './../core/Button';
import { ConstData } from './../data/ConstData';

const { ccclass, property } = cc._decorator;

// 所有需要director管理的pop窗口的组件都要继承自PopCompoennt
export abstract class PopComponent extends cc.Component {
    popName: string = '';
    clean(): void {};
    abstract init(params?: any);
}

@ccclass
export class PopBase extends cc.Component {
    @property
    maskOpacity: number = 100;  // 遮罩不透明度

    @property
    touchClose:boolean = true;  // 触摸关闭

    popName: string = null;

    componentName: string = null;

    component: PopComponent = null;

    onLaunchedCallback: any = null;

    onClosedCallback: any = null;

    initBase(params: any, popName: string) {
        if (CC_EDITOR) {
            return;
        }

        // 将代码传入的popName作为本模块的名字(prefab路径)
        this.popName = popName;

        // 逻辑组件名字
        const popNameSpArr = this.popName.split('/');
        if (popNameSpArr.length > 0) {
            this.componentName = popNameSpArr[popNameSpArr.length - 1];
            this.component = this.node.getComponent(this.componentName);
        }

        // 开启、关闭回调
        this.onLaunchedCallback = params.onLaunchedCallback;
        this.onClosedCallback = params.onClosedCallback;

        // 添加遮罩
        Button.createNode({
            name: 'maskBtn',
            zIndex: ConstData.ZIndex.POP_MASK,
            parent: this.node,
            url: 'textures/common/mask',
            touchAction: false,
            commonClickAudio: false,
            opacity: this.maskOpacity,
            width: ConstData.DesignSize.width * 5,
            height: ConstData.DesignSize.height * 5,
            eventHandler: {
                target: this.node,
                component: this.componentName,
                customEventData: this.componentName,
                handler: this.touchClose ? 'closeCallback' : null, // 操作
            }
        });

        if (this.onLaunchedCallback) {
            this.onLaunchedCallback();
        }

        // 初始化pop popName传给控制脚本
        this.component.popName = this.popName;

        if (this.component.init) {
            this.component.init(params);
        }
    }

    cleanBase() {
        // 释放
        if (this.component && this.component.clean) {
            this.component.clean();
        }

        if (cc.isValid(this.node)) {
            this.node.destroy();
        }

        if (this.onClosedCallback) {
            this.onClosedCallback();
        }
    }
}