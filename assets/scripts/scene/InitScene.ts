/**
 * Created by xujiawei on 2020-07-08 17:35:11
 */

import { ClientConfig } from '../ClientConfig';
import { Device } from '../framework/common/Device';
import { CornerMng } from '../framework/common/CornerMng';
import { ErrorReportor } from '../framework/common/ErrorReportor';
import { Director } from '../framework/common/Director';
import { Tip } from '../framework/common/Tip';

import { LocalDataMng } from '../framework/data/localData/LocalDataMng';
import { Audio } from '../framework/core/Audio';
import { reportError } from '../framework/common/Reportor';
import { LoadPop } from '../pop/LoadPop';

const { ccclass, property } = cc._decorator;

@ccclass
export class InitScene extends cc.Component {
    onLoad() {
        /**
         * 更新包之后，删除热更新目录和记录
         */

        if (ClientConfig.HOT_UPDATE_OPEN && cc.sys.isNative) {
            let baseLocalVersion = cc.sys.localStorage.getItem('BASE_LOCAL_VERSION');
            // 写本地版本记录
            cc.sys.localStorage.setItem('BASE_LOCAL_VERSION', ClientConfig.BASE_LOCAL_VERSION);
            if (baseLocalVersion != '' && baseLocalVersion != ClientConfig.BASE_LOCAL_VERSION) {
                // 大版本更新，需要删除之前热更新版本内容
                let path = ((jsb.fileUtils ? jsb.fileUtils.getWritablePath() : '/') + ClientConfig.HOT_UPDATE_SUB_PATH + "/" + ClientConfig.APP_VERSION);
                jsb.fileUtils.removeDirectory(path);
                cc.log("大版本更新，path: " + path);
                // 重启
                cc.game.restart();
            } else {
                this.init();
            }
        } else {
            this.init();
        }

        // cc.game.setFrameRate(30); // 设定游戏帧率为30
        cc.debug.setDisplayStats(false); //隐藏左下方测试信息
    }

    async init() {

        // 红点系统
        CornerMng.init([]);

        // 设备信息
        Device.init();

        // 音频管理
        Audio.init();

        // 错误捕获
        ErrorReportor.init();

        //--------以下放到最后处理-------
        Director.init();

        // 显示全屏loading
        await LoadPop.showLoadPop();

        // ClientConfig加载
        try {
            await ClientConfig.loadConfig();
        } catch (err) {
            if (err && !(err instanceof Error)) {
                err = new Error(err);
            }
            Tip.show(err.message);
            reportError(err);
            return;
        } 

        cc.log('当前服务地址:', ClientConfig.SERVER_ROOT);
        // 本地配置表读取
        LocalDataMng.loadDataFromLocalFile((c, t) => {
            cc.log("load local cfg: %d/%d", c, t);
        }, () => {
            this.getGameData();
        });

    }

    getGameData() {
        // 这里处理异步数据请求, 并更新Loading进度
        new Promise((resolve, reject) => {
            const total = 5;
            let cur = 0;
            LoadPop.updateLoadingInfo(cur / total, `${cur} / ${total}`);
            let t = setInterval(() => {
                cur += 1;
                LoadPop.updateLoadingInfo(cur / total, `${cur} / ${total}`);
                if (cur >= total) {
                    clearInterval(t);
                    resolve();
                }
            }, 200);
        }).then(() => {
            // LoadPop.removeLoadPop();
            Director.loadScene("Test");
        });
    }
}