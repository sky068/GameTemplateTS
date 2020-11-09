/**
 * Created by xujiawei on 2020-07-09 15:46:47
 */

const { ccclass, property } = cc._decorator;

import { Tip } from './../framework/common/Tip';
import { Alert } from './../framework/common/Alert';
import PopupBase from '../framework/common/PopupBase';
import { Loading } from '../framework/common/Loading';

@ccclass
export class DebugPop extends PopupBase<null> {
    @property(cc.Node)
    p1: cc.Node = null;

    @property(cc.Node)
    p2: cc.Node = null;

    pp1: any = null;
    pp2: any = null;

    init(parmas) {
        this.pp1 = this.p1.getComponent("ProgressBar");
        this.pp2 = this.p2.getComponent("ProgressCircle");
    }

    btnCb (sender, name) {
        switch (name) {
            case "d1": {
                Alert.show({
                    okText: "Ok",
                    cancleText: "Cancle",
                    okCb: ()=>{
                        Tip.show("ok");
                    },
                    cancleCb: ()=>{
                        Tip.show("cancle");
                    },
                    text: "这是单行文本样式",
                });
                break;
            }
            case "d2": {
                Alert.show({
                    okText: "Ok",
                    okCb: ()=>{
                        Tip.show("ok");
                    },
                    cancleCb: ()=>{
                        Tip.show("cancle");
                    },
                    text: "这是多行文本显示样式这是多行文本显示样式这是多行文本显示样式这是多行文本显示样式这是多行文本",
                });
                break;
            }
            case "d3": {
                Tip.show("我是tips，我是tips");
                break;
            }
            case "d4": {
                this.pp1.progress = 0;
                this.pp1.setProgressBarToPercent(1, 1, ()=>{
                    Tip.show("完成");
                });

                break;
            }
            case "d5": {
                this.pp2.progress = 0;
                this.pp2.setProgressBarToPercent(1, 1, ()=>{
                    Tip.show("完成");
                });

                break;
            }
            case "d6": {
                Loading.show('test', 1);
                this.scheduleOnce(t=>{
                    Loading.hide('test');
                }, 3);
            }
            default:
                break;
        }

        // zy.ui.tip.show(name);
    }
}