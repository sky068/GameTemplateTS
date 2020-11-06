/**
 * Created by xujiawei on 2020-07-09 15:57:45
 */

const { ccclass, property } = cc._decorator;

import { Audio } from './../framework/core/Audio';
import PopupBase from '../framework/common/PopupBase';

@ccclass
export class SettingPop extends PopupBase<null> {
    @property(cc.Node)
    vibNode: cc.Node = null;

    @property(cc.Node)
    soundsNode: cc.Node = null;

    @property(cc.Node)
    soundsVolume: cc.Node = null;

    @property(cc.Label)
    versionLabel: cc.Label = null;

    updateDisplay(params) {
        this.soundsNode.getComponent("SwitchControl").setIsOn(Audio.getBGMEnabled(), false);
        this.soundsVolume.getComponent(cc.Slider).progress = Audio.getBGMVomue();
        this.versionLabel.string = "v1.0.0";
    }

    onVibCall () {
        // if (zy.localData.userData.vibOn) {
        //     this.vibNode.getComponent(cc.Animation).play("setBtnOn", 0);
        //     PlatformUtils.vibratorShort();
        // } else {
        //     this.vibNode.getComponent(cc.Animation).play("setBtnOff", 0);
        // }
    }

    onSoundsCall (sc) {
        Audio.playEffect(Audio.Effect.CommonClick);
        Audio.setBGMEnabled(sc.isOn);
        Audio.setEffectsEnabled(sc.isOn);
    }

    sliderCallback (slider) {
        Audio.setBGMVolume(slider.progress);
        Audio.setEffectsVolume(slider.progress);
    }

}