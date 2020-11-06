/**
 * Created by xujiawei on 2020-07-08 18:14:34
 */

import { Audio } from './framework/core/Audio';

const EFFECT_ZINDEX: number = 500; // 不能高于提示框的层级 ConstData.ZIndex.LOADING

export class EffectMng {
    static _upgradeEff: sp.Skeleton = null;
    static _buildEff: sp.Skeleton = null;

    // todo: 暂不复用，复用需要检查回掉函数重复问题
    static showBuildingUpgradeEff(parent: cc.Node, pos = cc.v2(0, 0), cb:()=>void = null) {
        // 暂不复用
        if (this._upgradeEff && cc.isValid(this._upgradeEff, true)) {
            this._upgradeEff.setToSetupPose();
            this._upgradeEff.setAnimation(0, "animation", false);
        } else {
            cc.loader.loadRes('spine/building/glisten/glisten', sp.SkeletonData, (err, spData) => {
                if (err) {
                    cc.error(err);
                    return;
                }
                cc.log('播放升级特效');
                Audio.playEffect(Audio.Effect.BuildSuc);
                let node = new cc.Node("upgradeEff");
                node.parent = parent;
                node.zIndex = EFFECT_ZINDEX;
                node.position = cc.v3(pos);
                let skeleton = node.addComponent(sp.Skeleton);
                skeleton.setAnimationCacheMode(sp.Skeleton.AnimationCacheMode.SHARED_CACHE);
                skeleton.defaultSkin = "default";
                skeleton.premultipliedAlpha = true;
                skeleton.skeletonData = spData;
                skeleton.setAnimation(0, "animation", false);
                skeleton.setCompleteListener((event) => {
                    cc.log('移除升级特效');
                    node.destroy();
                    if (cb) {
                        cb();
                    }
                });
            });
        }
    }

    // 显示建筑建造烟雾特效
    static showBuildingEff(parent: cc.Node, pos:cc.Vec2=cc.v2(0,0), cb:()=>void=null) {
        // todo: 暂不复用，复用需要检查回掉函数重复问题
        if (this._buildEff && cc.isValid(this._buildEff, true)) {
            this._buildEff.setToSetupPose();
            this._buildEff.setAnimation(0, "animation", false);
        } else {
            cc.loader.loadRes('spine/building/build/build', sp.SkeletonData, (err, spData) => {
                if (err) {
                    cc.error(err);
                    return;
                }
                cc.log('播放建造特效');
                Audio.playEffect(Audio.Effect.Hammer);
                let node = new cc.Node("buildEff");
                node.parent = parent;
                node.zIndex = EFFECT_ZINDEX;
                node.position = cc.v3(pos);
                let skeleton = node.addComponent(sp.Skeleton);
                skeleton.setAnimationCacheMode(sp.Skeleton.AnimationCacheMode.SHARED_CACHE);
                skeleton.defaultSkin = "default";
                skeleton.premultipliedAlpha = true;
                skeleton.skeletonData = spData;
                skeleton.setAnimation(0, "animation", false);
                skeleton.setCompleteListener((event) => {
                    cc.log('移除建造特效');
                    node.destroy();
                    if (cb) {
                        cb();
                    }
                });
            });
        }
    }

    hideBuildingEff(parent: cc.Node) {

    }
}