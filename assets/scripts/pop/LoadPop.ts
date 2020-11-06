/*
 * @Author: xujiawei 
 * @Date: 2020-11-06 15:43:52 
 * @Last Modified by: xujiawei
 * @Last Modified time: 2020-11-06 16:25:19
 * 
 * 全屏loading界面，用来加载数据并显示进度
 */

const { ccclass, property } = cc._decorator;

import { ConstData } from './../framework/data/ConstData';
import { ProgressBar } from './../framework/core/ProgressBar';
import { reportError } from '../framework/common/Reportor';
import { Tip } from '../framework/common/Tip';

@ccclass
export class LoadPop extends cc.Component {
    @property(cc.Node)
    aniNode: cc.Node = null;

    @property(ProgressBar)
    progressBar: ProgressBar = null;

    @property(cc.Label)
    desLabel: cc.Label = null;

    static loadPop: cc.Node = null;

    // todo: 调用show后立即移除有可能不生效，因为show是异步的
    static removeLoadPop() {
        if (this.loadPop) {
            cc.Canvas.instance.scheduleOnce(res=>{
                this.loadPop.destroy();
                this.loadPop = null;
            }, 0.0);
        }
    }

    static async showLoadPop(showProgress: boolean = true, showDes: boolean = true) {
        if (this.loadPop) {
            return;
        }

        let loadPromise = new Promise((resolve, reject) => {
            cc.loader.loadRes("prefabs/pop/LoadPop", (err, pf) => {
                if (err) {
                    Tip.show(err.message);
                    reportError(err);
                    reject(err);
                    return;
                }
                this.loadPop = cc.instantiate(pf);
                this.loadPop.zIndex = ConstData.ZIndex.LOADING;
                this.loadPop.parent = cc.Canvas.instance.node;
                this.loadPop.getComponent("LoadPop").init(showProgress, showDes);
                resolve();
            });
        });

        return loadPromise;
    }

    init(showProgress: boolean, showDes: boolean) {
        this.progressBar.node.active = showProgress;
        this.desLabel.node.active = showDes;
    }

    static updateLoadingInfo(p: number, des: string) {
        if (this.loadPop) {
            let loadPop: LoadPop = this.loadPop.getComponent("LoadPop");
            loadPop.progressBar.progress = p;
            loadPop.desLabel.string = des;
        }
    }
}