/*
 * @Author: xujiawei 
 * @Date: 2020-08-31 15:14:03 
 * @Last Modified by: xujiawei
 * @Last Modified time: 2020-08-31 17:00:13
 */

import { reportError } from './../../common/Reportor';
import { DataBase } from './DataBase';
import { Tip } from './../../common/Tip';

type SkinItemData = {
    "skintype": 1,
    "skinid": 0,
    "gender": 0,
    "desc": "无帽子",
    "icon": "empty.png",
    "price_coins": 0,
    "price_diamonds": 0
};

export class SkinData extends DataBase {
    dataMap:Map<string, SkinItemData> = new Map<string, SkinItemData>();
    private typeData: {string?: SkinItemData[]} = {};

    updateData(data: any) {
        if (typeof(data) != 'object') {
            data = JSON.parse(data);
        }

        // 把数组转成skintype_skinid形式的map，方便快速提取数据
        for (let d of data) {
            const key = String(d.skintype) + "_" + String(d.skinid);
            this.dataMap.set(key, d);
            
            // 把数据按照skintype分类，每一类都放到数组里
            if (!this.typeData[String(d.skintype)]) {
                this.typeData[String(d.skintype)] = [];
            }
            this.typeData[String(d.skintype)].push(d);
        }
    }

    /**
     * 获取皮肤配置信息
     * @returns {
            "skintype": 1,
            "skinid": 0,
            "gender": 0,
            "desc": "无帽子",
            "icon": "empty.png",
            "price_coins": 0,
            "price_diamonds": 0
        }
     * @param skintype 
     * @param skinid 
     */
    getSkinItemInfo(skintype: number, skinid: number) {
        const key = String(skintype) + "_" + String(skinid);
        if (this.dataMap.has(key)) {
            return this.dataMap.get(key);
        }
        const msg = `没有该类型的皮肤--skintype:${skintype}, skinid:${skinid}`;
        cc.log('没有该类型的皮肤')
        return null;
    }

    // 获取指定类型的皮肤item集合
    getSkinItems(skintype: number): SkinItemData[] {
        let rets = this.typeData[String(skintype)];
        if (!rets) {
            cc.log(`没有次类型的皮肤item: ${skintype}`);
        }

        return rets;
    }
}