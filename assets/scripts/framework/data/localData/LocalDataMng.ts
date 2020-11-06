/**
 * Created by xujiawei on 2020-07-07 15:30:43
 */

import { UserLocalData } from './UserLocalData';
import { LocalDataBase } from './LocalDataBase';

export class LocalDataMng {
    static loadCounts: number = 0;

    // todo: 每添加新的配置表都需要在这里创建对应的对象
    static userData: UserLocalData = new UserLocalData();

    /**
     * 读取本地配置文件
     * @param progressCb(cur,total) 进度回调
     * @param completeCb{Function} 读取结束回调
     */
    static loadDataFromLocalFile(progressCb: (cur:number, total: number)=>void, completeCb:()=>void) {
        // 读取本地保存的用户数据
        this.loadSavedData();

        // 读取配置文件数据
        let keys = Object.keys(this);
        cc.log("====keys1: %s", JSON.stringify(keys));
        keys = keys.filter((k) => {
            return this.hasOwnProperty(k) && (this[k] instanceof LocalDataBase);
        });
        cc.log("====keys2: %s", JSON.stringify(keys));
        if (keys.length <= 0 && completeCb) {
            completeCb();
            return;
        }

        for (let key of keys) {
            let obj = this[key];
            let fileName = obj.fileDir;
            cc.loader.loadRes(fileName, cc.JsonAsset, (err, data) => {
                if (err) {
                    cc.error("load local data: " + fileName + ", error: " + err);
                } else {
                    if (obj.initData) {
                        obj.initData.call(obj, data.json);
                    }
                }

                this.loadCounts++;
                if (progressCb) {
                    progressCb(this.loadCounts, keys.length);
                }
                if (this.loadCounts >= keys.length) {

                    if (completeCb) {
                        completeCb();
                    }
                }
            });
        }
    }

    // 从localStorage读取数据
    static loadSavedData() {
        this.userData.loadData();
    }

    // 保存数据到localStorage
    static saveDataToLocal() {
        this.userData.saveData();
    }
}

