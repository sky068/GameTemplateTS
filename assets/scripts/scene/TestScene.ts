/*
 * @Author: xujiawei 
 * @Date: 2020-11-06 15:38:04 
 * @Last Modified by: xujiawei
 * @Last Modified time: 2021-01-25 12:01:15
 */

import { popupMng, PopupCacheMode } from '../framework/common/PopupMng';

const { ccclass, property } = cc._decorator;
import { Audio } from './../framework/core/Audio';

import { TestPop, TestPopOptions } from './../pop/TestPop';

@ccclass
export class TestScene extends cc.Component {
    @property(cc.Label)
    infoLabel: cc.Label = null;

    start() {
        Audio.playBGM(Audio.BGM.MAIN);
        cc.debug.setDisplayStats(true);
    }
    
    debugCall () {
        popupMng.show('prefabs/pop/DebugPop');
    }

    settingCall () {
        popupMng.show("prefabs/pop/SettingPop");
    }

    showPopCall() {
        let cb = ()=>{
            cc.log('this is TestScene, i know TestPop hide');
        }
        let options: TestPopOptions = {data:[1,2,3], title: 'hello', cb: cb};
        popupMng.show(TestPop.path, options, PopupCacheMode.Once);
        popupMng.show(TestPop.path, options, PopupCacheMode.Once);
    }
}