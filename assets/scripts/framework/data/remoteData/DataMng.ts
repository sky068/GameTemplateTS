/**
 * Created by xujiawei on 2020-07-08 14:58:53
 * 
 * 管理所有远程加载的数据
 */

import { UserData } from './UserData';
import { BuildingLevelData } from './BuildingLevelData';
import { SkinData } from './SkinData';

export class DataMng {
    static userData = new UserData();
    static buildingLevelData = new BuildingLevelData();
    static skinData = new SkinData();
}