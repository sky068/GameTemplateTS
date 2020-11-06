/**
 * Created by xujiawei on 2020-07-03 15:43:26
 */

import PopupBase from './PopupBase';
import { PopupMng } from './PopupMng';

const { ccclass, property } = cc._decorator;
type AlertCb = ()=>void;

interface AlertOptions {
    text: string, 
    okText?:string, 
    okCb?: AlertCb, 
    cancleText?: string, 
    cancleCb?: AlertCb, 
    title?: string
}

@ccclass
export class Alert extends PopupBase<AlertOptions> {

    @property(cc.Node)
    okBtn: cc.Node = null;

    @property(cc.Node)
    cancleBtn: cc.Node = null;

    @property(cc.Label)
    contentLabel: cc.Label = null;

    @property(cc.Label)
    titleLabel: cc.Label = null;

    popName: string = ''; // 由MyDirector和PopBase设置

    okCb: any = null;
    cancleCb: any = null;

    static show(options: AlertOptions): void {
        PopupMng.show("prefabs/common/Alert", options);
    }

    init(params: AlertOptions = {
        text: "",
        okText: "",
        title: "",
        cancleText: null,
        okCb: null,
        cancleCb: null,
    }) {
        if (params.title && params.title != "") {
            this.titleLabel.node.parent.active = true;
            this.titleLabel.string = params.title;
        } else {
            this.titleLabel.node.parent.active = false;
        }
        this.contentLabel.string = params.text;
        this.okBtn.active = !!params.okText;
        this.okBtn.getComponentInChildren(cc.Label).string = params.okText ? params.okText : 'OK';
        this.cancleBtn.active = !!params.cancleText;
        this.cancleBtn.getComponentInChildren(cc.Label).string = params.cancleText ? params.cancleText : "Cancle";

        this.okCb = params.okCb;
        this.cancleCb = params.cancleCb;

        this.contentLabel._forceUpdateRenderData();
        let width = this.contentLabel.node.width;
        if (width > 500) {
            this.contentLabel.overflow = cc.Label.Overflow.SHRINK;
            this.contentLabel.enableWrapText = true;
            this.contentLabel.node.width = 500;
            this.contentLabel.node.height = 220;
            this.contentLabel.horizontalAlign = cc.Label.HorizontalAlign.LEFT;
        }
    }

    confirmCallback(): void {
        if (this.okCb) {
            this.okCb();
        }
        this.closeCallback();
    }

    cancleCallback(): void {
        if (this.cancleCb) {
            this.cancleCb();
        }
        this.closeCallback();
    }

    closeCallback(): void {
        this.hide();
    }

}