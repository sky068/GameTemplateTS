/**
 * Created by xujiawei on 2020-07-08 20:26:58
 */

const { ccclass, property } = cc._decorator;

import { PlayerAvatar } from './PlayerAvatar';
import { DataMng } from '../framework/data/remoteData/DataMng';
import { Api } from '../framework/net/http/Api';

@ccclass
export class PlayerPanel extends cc.Component {
    @property(PlayerAvatar)
    avatar: PlayerAvatar = null;

    @property(cc.Label) 
    nickLabel: cc.Label = null;

    @property(cc.Sprite)
    levelIcon: cc.Sprite = null;

    start() {
        let savedIconData = cc.sys.localStorage.getItem("user_icon_base64");
        if (savedIconData) {
            cc.log('有头像数据没有上传成功，开始上传.');
            Api.uploadIcon(savedIconData).then(res=>{
                if (res.code == 0) {
                    cc.log('头像上传成功');
                    // 上传成功，清空保存到数据
                    cc.sys.localStorage.removeItem("user_icon_base64");
                } else {
                    cc.log(res.msg);
                }
            }).catch(err=>{
                cc.log(err);
            });
        } else {
            cc.log('没有待上传待头像数据.');
        }
    }

    onEnable() {
        this.updateUI();
        cc.director.on("update_userdata", this.updateUI, this);
    }

    onDisable() {
        cc.director.off("update_userdata", this.updateUI, this);
    }

    updateUI(data?: any) {
        cc.log('update player panel: ' + JSON.stringify(DataMng.userData));
        this.nickLabel.string = DataMng.userData.nickname || "小宝宝";
        // this.shineLabel.string = String(DataMng.userData.shine);
        let url = DataMng.userData.icon || "";
        this.avatar.updateUI(url);
    }

}