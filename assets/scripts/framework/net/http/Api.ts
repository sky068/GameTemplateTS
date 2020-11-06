/*
 * @Author: xujiawei 
 * @Date: 2020-07-08 16:00:17 
 * @Last Modified by: xujiawei
 * @Last Modified time: 2020-11-04 18:47:57
 */
import { ClientConfig } from '../../../ClientConfig';
import { Tip } from '../../common/Tip';
import { DataMng } from '../../data/remoteData/DataMng';
import { task } from '../../godGuide/task1';
import { proxy } from './Proxy';

interface OptionHeaders {
    target_type: string,
    target_content: string | number,
}

let customHeaders: OptionHeaders = {
    target_type: '', // iphone/id
    target_content: '',
}

// --------------正式接口-----------
function getRank(type: string, start: number = 1, end: number = 50) {
    return proxy.get(ClientConfig.SERVER_ROOT + "ranking", {type: type, start: start, end: end});
}

function getRankGlobal(start=1, end= 50) {
    return getRank('global', start, end);
}

function getRankLocal(start=1, end = 50) {
    return getRank('local', start, end);
}

// 获取皮肤配置表
function getSkinData() {
    return proxy.get(ClientConfig.SERVER_ROOT + "skin_conf", null, {headers: customHeaders});
}

// 获取用户的皮肤信息(在穿戴和已拥有)
function getUserSkin() {
    return proxy.get(ClientConfig.SERVER_ROOT + "user_skins");
}

function changeSkin(skintype: number, skinid: number) {
    return proxy.post(ClientConfig.SERVER_ROOT + "change_skin", {skintype: skintype, skinid: skinid});
}

function buySkin(skintype: number, skinid: number) {
    return proxy.post(ClientConfig.SERVER_ROOT + "buy_skin", {skintype: skintype, skinid: skinid});
}

function uploadIcon(data: string) {
    return proxy.post(ClientConfig.SERVER_ROOT + "icon", {icon: data});
}

/**
 * 获取地图上所有地块信息
 */
function getAllTiles() {
    return proxy.get(ClientConfig.SERVER_ROOT + "map");
}

/**
 * 获取没有解锁的和可以用的地块
 */
function getLockedAndUseableTiles() {
return proxy.get(ClientConfig.SERVER_ROOT + "floor", null, {headers: customHeaders});
}

/**
 * 获取用户基本信息
 */
function getUserInfo() {
    return proxy.get(ClientConfig.SERVER_ROOT + "user", null, {headers: customHeaders});
}

/**
 * 获取建筑等级配置表
 */
function getBuildingLevelConf() {
    return proxy.get(ClientConfig.SERVER_ROOT + "build_update_conf");
}

/**
 * 获取指定地块可用的建筑
 */
function getUseableBuildings(floorid) {
    return proxy.post(ClientConfig.SERVER_ROOT + "usable_build", { floorid: floorid }, {headers: customHeaders});
}

/**
 * 获取升级建筑的花费
 * @param blevel{Number} 当前等级
 */
function getUpgradNeed(bid, blevel) {
    return proxy.post(ClientConfig.SERVER_ROOT + "up_need", { buildid: bid, buildlevel: blevel });
}

/** 
 * 获取用户已经建造的建筑列表
 */
function getCompleteBuildingList() {
    return proxy.get(ClientConfig.SERVER_ROOT + "build_list", null, {headers: customHeaders});
}

/**
 * 请求建造建筑
 * @param {Object} params {btype:1, bid:1, bptype:1, bpid:1}
 */
function build(params) {
    return proxy.post(ClientConfig.SERVER_ROOT + "create_build", { floorid: params.bpid, buildid: params.bid });
}

/**
 * 升级建筑
 * @param {Number} floorid 
 */
function upgradeBuilding(floorid) {
    return proxy.post(ClientConfig.SERVER_ROOT + "update_build", { floorid: floorid });
}

/**
 * 拆除建筑
 * @param {Number} floorid 地块id
 */
function tearDown(floorid) {
    return proxy.post(ClientConfig.SERVER_ROOT + "del_build", { floorid: floorid });
}

/**
 * debug接口，修改玩家信息
 * @param {Number} coins 
 * @param {Number} diamonds 
 */
function debugUpdateUserInfo(coins = 10000, diamonds = 1000) {
    return proxy.post(ClientConfig.SERVER_ROOT + "user", { coins: coins, diamonds: diamonds });
}

function debug() {
    debugUpdateUserInfo(9999,999).then(res=>{
        if (res.code == 0) {
            return getUserInfo();
        }
    }).then(res=>{
        if (res.code == 0) {
            DataMng.userData.updateData(res.data);
            cc.director.emit('update_userdata');
        }
    }).catch(err=>{
        cc.log(err);
    });
}

/**
 * 进入我的地图
 * 需要把所需资源全部请求过来
 * 1.用户基本信息
 * 2.未解锁地块和可用地块
 * 3.用户的建筑列表
 * 4.获取建筑等级配置表
 * 5.获取皮肤配置表
 * @param progressCb{Function} (cur, total)
 */
function getMyFarmData(progressCb?:(cur, total)=>void) {
    customHeaders.target_type = '';
    customHeaders.target_content = '';
    let successCount = 0;
    let failCount = 0;
    let tasks = [getUserInfo(), getLockedAndUseableTiles(), getCompleteBuildingList(), getBuildingLevelConf(), getSkinData(), getUserSkin()];
    return Promise.all(
        tasks.map(func => {
            return func.then(res => {
                successCount++;
                if (progressCb) {
                    progressCb(successCount, tasks.length);
                }
                return Promise.resolve(res);
            }).catch(err => {
                failCount++;
                return Promise.reject(err);
            });
        })
    ).then(res => {
        return Promise.resolve({
            userInfo: res[0].data,
            tilesInfo: res[1].data,
            buildings: res[2].data,
            buildingLevelCfg: res[3].data,
            skinData: res[4].data,
            userSkin: res[5].data,
        });
    }, err => {
        return Promise.reject(err);
    });
}

/**
 * 进入他人地图
 * 需要把所需资源全部请求过来
 * 1.用户基本信息
 * 2.未解锁地块和可用地块
 * 3.用户的建筑列表
 * @
 * @param progressCb{Function} (cur, total)
 */
function getTravelInfo(targetType: string, targetContent: string | number, progressCb?:(cur, total)=>void) {
    customHeaders.target_type = targetType;
    customHeaders.target_content = targetContent;
    let successCount = 0;
    let failCount = 0;
    let tasks = [getUserInfo(), getLockedAndUseableTiles(), getCompleteBuildingList(), getUserSkin()];
    return Promise.all(
        tasks.map(func => {
            return func.then(res => {
                successCount++;
                if (progressCb) {
                    progressCb(successCount, tasks.length);
                }
                return Promise.resolve(res);
            }).catch(err => {
                failCount++;
                return Promise.reject(err);
            });
        })
    ).then(res => {
        return Promise.resolve({
            userInfo: res[0].data,
            tilesInfo: res[1].data,
            buildings: res[2].data,
            userSkin: res[3].data,
        });
    }, err => {
        customHeaders.target_type = '';
        customHeaders.target_content = '';
        return Promise.reject(err);
    });
}


export let Api = {
    getRankGlobal: getRankGlobal,
    getRankLocal: getRankLocal,
    getTravelInfo: getTravelInfo,
    build: build,
    tearDown: tearDown,
    upgradeBuilding: upgradeBuilding,
    getMyFarmData: getMyFarmData,
    getLockedAndUseableTiles: getLockedAndUseableTiles,
    getUpgradNeed: getUpgradNeed,
    getUseableBuildings: getUseableBuildings,
    getBuildingLevelConf: getBuildingLevelConf,
    getUserSkin: getUserSkin,
    changeSkin: changeSkin,
    buySkin: buySkin,
    uploadIcon: uploadIcon,

    debugUpdateUserInfo: debugUpdateUserInfo,
    debug: debug,
    customHeaders: customHeaders,
}
