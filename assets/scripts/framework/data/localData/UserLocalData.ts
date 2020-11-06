/**
 * Created by xujiawei on 2020-07-08 11:54:46
 * 玩家本地存储的数据
 */

import { ConstData } from './../ConstData';

export class UserLocalData {
    vibOn: boolean = true;
    musicOn: boolean = true;
    guide: number = 0;

    saveData() {
        let obj = {};
        for (let key of Object.keys(this)) {
            obj[key] = this[key];
        }
        let data = JSON.stringify(obj);
        cc.sys.localStorage.setItem(ConstData.StaticKey.PlayerDataKey + ConstData.StaticKey.SaveDataVersion, data);
    }

    loadData() {
        let data = cc.sys.localStorage.getItem(ConstData.StaticKey.PlayerDataKey + ConstData.StaticKey.SaveDataVersion);
        if (data) {
            data = JSON.parse(data);
            for (let key of Object.keys(data)) {
                if (this.hasOwnProperty(key)) {
                    this[key] = data[key];
                }
            }
        }
    }
}