/**
 * Created by xujiawei on 2020-07-09 11:26:16
 */

import { DataMng } from "../framework/data/remoteData/DataMng";

const { ccclass, property } = cc._decorator;

const MOVE_SPEED = 200;

const PersonAni = {
    BODY_RUN: "body_run",
    BODY_STAND: "body_stand",
    BODY_SCRATCH_HEAD: "body_scratchhead",
    BODY_WALK: "body_walk",
    BODY_WAVE: "body_wave",

    FACE_IDLE: "face_idle",
    FACE_IDLE_HAPPY: "face_idle_happy",
    FACE_IDLE_SAD: "face_idle_sad",
    FACE_LAUGH: "face_laugh",
    FACE_SPEAK: "face_speak",
    FACE_SPEAK_HAPPY: "face_speak_happy",
    FACE_SPEAK_SAD: "face_speak_sad",
    FACE_SPEAK_ASK: "face_speak_ask",
};

const Gender = cc.Enum({
    BOY: 1,
    GIRL: 2,
});

@ccclass
export class Person extends cc.Component {
    @property(sp.Skeleton)
    ani: sp.Skeleton = null;

    @property({
        type: Gender
    })
    gender = Gender.BOY;

    static PersonAni = PersonAni;

    private _selectData: any = null;

    initPlayer(data:Map<string, any>) {
        this._selectData = {};
        DataMng.userData.gender = 2;
        this.gender = DataMng.userData.gender;
        
        data.forEach((v, k)=>{
            if (v['inuse'] == 1) {
                this.selectPart(v['skintype'], v['skinid']);
            }
        });

        this.mixAll();
        this.playIdel();
    }

    mixAll() {
        this.ani.setMix(PersonAni.BODY_STAND, PersonAni.BODY_RUN, 0.5);
        this.ani.setMix(PersonAni.BODY_STAND, PersonAni.BODY_WALK, 0.5);
        this.ani.setMix(PersonAni.BODY_STAND, PersonAni.BODY_WAVE, 0.5);
        this.ani.setMix(PersonAni.BODY_RUN, PersonAni.BODY_STAND, 0.5);
        this.ani.setMix(PersonAni.BODY_WALK, PersonAni.BODY_STAND, 0.5);
        this.ani.setMix(PersonAni.BODY_WAVE, PersonAni.BODY_STAND, 0.5);
    }

    playIdel() {
        this.play(0, PersonAni.BODY_STAND, true);
        this.play(1, PersonAni.FACE_IDLE, true);
    }

    /**
     * 更新部位
     * @param {Number} type 身体部位（帽子、头发、上衣等）
     * @param {Number} id 部位编号 (帽子0，帽子1。。。)
     * @brief 1:帽子，2:眼镜，3:上衣，4:裤子，5:头发，6:眉毛，7:眼睛，8:鼻子，9:胡须，10:饰品
     */
    selectPart(type: number, id: number) {
        if (type == 1) {
            this.selectCap(id);
        } else if (type == 2) {
            this.selectGlasses(id);
        } else if (type == 3) {
            this.selectCoat(id);
        } else if (type == 4) {
            this.selectTrousers(id);
        } else if (type == 5) {
            this.selectHair(id);
        } else if (type == 6) {
            this.selectEyebow(id);
        } else if (type == 7) {
            this.selectEye(id);
        } else if (type == 8) {

        } else if (type == 9) {

        } else if (type == 10) {
            this.selectPattern(id);
        } 

        // 处理女孩的裙子和裤子，裙子和裤子不能同时穿
        if (this.gender == Gender.GIRL) {
            if (this._selectData["3"] == 3 || this._selectData["3"] == 4) {
                // 选择裙子需要脱掉裤子
                this.selectTrousers(4);
            } else {
                if (this._selectData["4"] == 4) {
                    // 如果没穿裙子又没穿裤子，则默认一条裤子
                    this.selectTrousers(1);
                }
                
            }
        }
    }

    selectCap(capId: number) {
        this._selectData[String(1)] = capId;
        this.changePartialCloth(this.ani, "cap", "default", "cap_" + capId);
    }

    selectGlasses(glassesId: number) {
        this._selectData[String(2)] = glassesId;
        this.changePartialCloth(this.ani, "glasses", "default", "glasses_" + glassesId);
    }

    selectCoat(coadId: number) {
        this._selectData[String(3)] = coadId;
        // 切换上衣要同时切换左大臂、左小臂、右大臂、右小臂
        let mainAttackName: string = this.gender == Gender.BOY ? "upper_boy_T_shirt_" : "upper_girl_T_shirt_";
        // upper_boy_T_shirt_left_sleeve_1_a
        let leftBigAttackName: string = this.gender == Gender.BOY ? "upper_boy_T_shirt_left_sleeve_" : "upper_girl_T_shirt_left_sleeve_";
        // upper_boy_T_shirt_left_sleeve_1_b
        let leftSamllAttackName: string = this.gender == Gender.BOY ? "upper_boy_T_shirt_left_sleeve_" : "upper_girl_T_shirt_left_sleeve_";
        // upper_boy_T_shirt_right_sleeve_1_a
        let rightBigAttackName: string = this.gender == Gender.BOY ? "upper_boy_T_shirt_right_sleeve_" : "upper_girl_T_shirt_right_sleeve_";
        // upper_boy_T_shirt_right_sleeve_1_b
        let rightSamllAttackName: string = this.gender == Gender.BOY ? "upper_boy_T_shirt_right_sleeve_" : "upper_girl_T_shirt_right_sleeve_";
        
        this.changePartialCloth(this.ani, "upper_body_T-shirt", "default", mainAttackName + coadId);
        this.changePartialCloth(this.ani, "upper_body_left_sleeve_big", "default", leftBigAttackName + coadId + "_a");
        this.changePartialCloth(this.ani, "upper_body_left_sleeve_little", "default", leftSamllAttackName + coadId + "_b");
        this.changePartialCloth(this.ani, "upper_body_right_sleeve_big", "default", rightBigAttackName + coadId + "_a");
        this.changePartialCloth(this.ani, "upper_body_right_sleeve_little", "default", rightSamllAttackName + coadId + "_b");
    }

    selectTrousers(tid: number) {
        this._selectData[String(4)] = tid;
        // 裤子需要胯部、大腿、小腿部分同时换
        let belowAttackName: string = this.gender == Gender.BOY ? "below_boy_shorts_" : "below_girl_shorts_";
        let leftBigAttackName: string = this.gender == Gender.BOY ? "below_boy_shorts_left_" : "below_girl_shorts_left_";
        let leftSmallAttackName: string = this.gender == Gender.BOY ? "below_boy_shorts_left_" : "below_girl_shorts_left_";
        let rightBigAttackName: string = this.gender == Gender.BOY ? "below_boy_shorts_right_" : "below_girl_shorts_right_";
        let rightSmallAttackName: string = this.gender == Gender.BOY ? "below_boy_shorts_right_" : "below_girl_shorts_right_";
        
        this.changePartialCloth(this.ani, "below_body_shorts", "default", belowAttackName + tid);
        this.changePartialCloth(this.ani, "below_body_shorts_left_big", "default", leftBigAttackName + tid + "_a");
        this.changePartialCloth(this.ani, "below_body_shorts_left_little", "default", leftSmallAttackName + tid + "_b");
        this.changePartialCloth(this.ani, "below_body_shorts_right_big", "default", rightBigAttackName + tid + "_a");
        this.changePartialCloth(this.ani, "below_body_shorts_right_littel", "default", rightSmallAttackName + tid + "_b");
    }

    selectHair(hairId: number) {
        this._selectData[String(5)] = hairId;
        let attachName: string = this.gender == Gender.BOY ? "boy_hair_" : "girl_hair_";
        this.changePartialCloth(this.ani, "hair", "default", attachName + hairId);
    }

    selectEyebow(eyebrowId: number) {
        this._selectData[String(6)] = eyebrowId;
        let attachName: string = this.gender == Gender.BOY ? "boy_eyebrow_" : "girl_eyebrow_";
        this.changePartialCloth(this.ani, "eyebrow", "default", attachName + eyebrowId);
        this.changePartialCloth(this.ani, "eyebrow_sad", "default", attachName + eyebrowId + "_sad");
    }

    selectEye(eyeId: number) {
        this._selectData[String(7)] = eyeId;
        let eyes = {
            "1": "a",
            "2": "b",
            "3": "c",
            "4": "d"
        };
        let attachName: string = this.gender == Gender.BOY ? "boy_eye_" : "girl_eye_";
        this.changePartialCloth(this.ani, "eye", "default", attachName + eyes[eyeId]);
        this.changePartialCloth(this.ani, "eye_ask", "default", attachName + eyes[eyeId] + "_ask");
        this.changePartialCloth(this.ani, "eye_blink_1", "default", attachName + eyes[eyeId] + "_blink_1");
        this.changePartialCloth(this.ani, "eye_blink_2", "default", attachName + eyes[eyeId] + "_blink_2");
        this.changePartialCloth(this.ani, "eye_blink_3", "default", attachName + eyes[eyeId] + "_blink_3");
        this.changePartialCloth(this.ani, "eye_sad", "default", attachName + eyes[eyeId] + "_sad");
    }

    selectNose(noseId: number) {
        this._selectData[String(8)] = noseId;

    }

    selectPattern(patternId: number) {
        this._selectData[String(10)] = patternId;
        this.changePartialCloth(this.ani, "pattern", "default", "pattern_" + patternId);
    }

    // 局部换装
    changePartialCloth(skeleton = this.ani, slotName: string, targetSkinName:string, targetAttaName:string) {
        // console.log('change cloth:', slotName, targetSkinName, targetAttaName);
        const slot = skeleton.findSlot(slotName);
        const skeletonData = skeleton.skeletonData.getRuntimeData();
        const skin = skeletonData.findSkin(targetSkinName);
        const slotIndex = skeletonData.findSlotIndex(slotName);
        const atta = skin.getAttachment(slotIndex, targetAttaName);
        if (!slot || !atta) {
            cc.error(slot && atta, "slots: " + slotName + ", attach: " + targetAttaName + " not exists!");
            return;
        }
        slot.setAttachment(atta);
    }

    play(trackIndex: number, aniName: string, loop?: boolean) {
        this.ani.setAnimation(trackIndex, aniName, loop);
    }

    add(trackIndex: number, aniName: string, loop?: boolean, delay?: number) {
       this.ani.addAnimation(trackIndex, aniName, loop, delay = 0); 
    }

    runTo(pos: cc.Vec2, cb = null) {
        this.moveTo(pos, cb, MOVE_SPEED * 3, PersonAni.BODY_RUN);
    }

    moveTo(pos: cc.Vec2, cb = null, speed = MOVE_SPEED, ani = PersonAni.BODY_WALK) {
        this.play(0, ani, true);
        this.play(1, PersonAni.FACE_IDLE, true);

        let cur = this.node.getPosition();
        if (pos.x < cur.x) {
            // 向左走
            this.ani.node.scaleX = 1;
        } else {
            this.ani.node.scaleX = -1;
        }

        let distance = pos.sub(cur).mag();
        let t = distance / speed;
        this.node.stopAllActions();
        this.node.runAction(cc.sequence(cc.moveTo(t, pos), cc.callFunc(()=>{
            this.stop();
            if (cb) {
                cb();
            }
        }, this)));
    }

    stop() {
        this.playIdel();
    }

}