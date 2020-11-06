/**
 * Created by xujiawei on 2020-07-08 15:05:05
 */

import { reportError } from './../../common/Reportor';
import { DataBase } from './DataBase';
import { Tip } from './../../common/Tip';

export class BuildingLevelData extends DataBase {
    dataJson: any = null;

    updateData(data: any) {
        if (typeof(data) != 'object') {
            data = JSON.parse(data);
        }
        this.dataJson = data;
    }

    /**
     * 
     * @param {Number} bid 
     * @returns {Array}
     */
    getBuildingDatasById(bid: number) {
        let data = this.dataJson[String(bid)];
        if (!data) {
            let msg = `建筑<id:${bid}>等级配置信息不存在`;
            Tip.show(msg);
            reportError(new Error(msg));
        }
        return data;
    }

    getBuildingMaxLevel(bid: number) {
        let data = this.getBuildingDatasById(bid);
        if (!data) {
            return -1;
        }
        return data.length;
    }

    getBuildingData(bid: number, blevel: number = 1): {buildid: number, coins: number, diamond: number, level: number, shine: number} {
        let data = this.getBuildingDatasById(bid);
        if (!data) {
            Tip.show(`获取建筑信息失败bid:${bid}, blevel:${blevel}`);
            return null;
        }
        if (blevel > data.length) {
            let msg = `建筑<id:${bid}, level:${blevel}>超过最大等级`;
            Tip.show(msg);
            reportError(new Error(msg));
            return null;
        }
        data.sort((a,b)=>{
            return a.level - b.level;
        });
        return data[blevel-1];
    }
}