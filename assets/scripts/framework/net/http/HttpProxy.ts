/**
 * Created by xujiawei on 2020-07-08 15:52:15
 */

import { gameHttp } from './GameHttp';
import { hex_hmac_md5 } from './../../encrypt/Md5';

let LOGINRETRY = 5;  // 登陆重连次数

let port = [8010,8011,8012,8015,8016,8017][Math.round(Math.random() * 5)];
let urlroot = "http://xxxxx.com:" + port + "/zy_game?m="; // 外网 8010,8011,8012,8015,8016,8017

let encryptKey = "zygame";

export class  HttpProxy{
    /**
     * 登陆游戏
     * @param onSuc
     * @param onFailed
     */
    static login(onSuc, onFailed){
        cc.log("===urlroot:" + urlroot);

        let data = {
        };
        let url = urlroot + "user_join_game";
        let failCb = ()=>{
            if (onFailed) {
                onFailed();
            }
            if (LOGINRETRY > 0) {
                LOGINRETRY -= 1;
                setTimeout(()=>{
                    this.login(onSuc, onFailed);
                }, 5000);
            }
        };

        this.serverRequest(url, data, onSuc, failCb);
    }

    /**
     * 更新玩家基础信息
     * @param id{Number} 0金币,1钻石,2vip等级,3登录天数,4普通通关层数,5次元能量,6次元关
     * @param value
     * @param onSuc
     * @param onFailed
     */
    static updateBase(id, value, onSuc, onFailed) {
        let data = {
            baseinfoid: id,
            value: value,
        };

        let url = urlroot + "base_info_change";
        this.serverRequest(url, data, onSuc, onFailed);
    }

    /**
     * 升级更新
     * @param onSuc
     * @param onFailed
     * @param bid {integer} 建筑id
     * @param bpid {integer} 建筑位置id
     *
     **/
    static upgradeBuilding(bid, bpid, level, onSuc, onFailed) {
        let data = {
            bid: bid,
            bpid: bpid,
            level: level,
        };
        let url = urlroot + "building_info";
        this.serverRequest(url, data, onSuc, onFailed);
    }

    /**
     * 建筑建筑
     * @param {integer}} bid 
     * @param {integer} bpid 
     * @param {function} onSuc 
     * @param {function} onFail 
     */
    static buildBuilding(bid, bpid, onSuc, onFail) {
        let data = {
            bid: bid,
            bpid: bpid,
        };
        let url = urlroot + "build_building";
        this.serverRequest(url, data, onSuc, onFail);
    }

    static etServerTime(onSuc, onFailed) {
        let data = {
        };
        let url = urlroot + "request_unixtime";
        this.serverRequest(url, data, onSuc, onFailed);
    }

    /**
     *
     * @param url
     * @param data
     * @param onSuc
     * @param onFailed
     */
    static serverRequest(url, data, onSuc, onFailed){
        cc.log("===>serverRequest: " + typeof data + " | " + JSON.stringify(data));
        data = typeof data == "string" ? data : JSON.stringify(data);
        // 加密校验传输
        let encryptStr = hex_hmac_md5(encryptKey, data);
        let uid = '';
        uid = uid == undefined ? "" : uid;
        cc.log("uid=" + uid);
        let newData: any = {
            data: JSON.parse(data),
            encrypt: encryptStr,
            roleid: uid,
            token: ""
        };

        newData = JSON.stringify(newData);

        gameHttp.httpPost(url, newData, (rep)=>{
            cc.log("===>response:" + rep.getBody());
            if (rep.isOk()){
                cc.log("===>requrest: " + url + " 成功。");
                if (onSuc){
                    onSuc(JSON.parse(rep.getBody()));
                }
            } else {
                cc.log("===>requrest: " + url + " 失败。");
                if (onFailed){
                    onFailed(rep.getError() || rep.getBody());
                }
            }
        });
    }
}
