/**
 * Created by xujiawei on 2020-07-22 10:48:10
 */

const { ccclass, property } = cc._decorator;

import { PlayerAvatar } from './PlayerAvatar';

@ccclass
export class FriendPanel extends cc.Component {
    @property(PlayerAvatar)
    avatar: PlayerAvatar = null;

    @property(cc.Label) 
    nickLabel: cc.Label = null;

    @property(cc.Sprite)
    levelIcon: cc.Sprite = null;

    updateUI(data: {nickname:string, icon: string}) {
        this.nickLabel.string = data.nickname;
        this.avatar.updateUI(data.icon);
    }
}