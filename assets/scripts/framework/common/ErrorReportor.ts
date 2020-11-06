/**
 * Created by xujiawei on 2020-07-07 16:23:57
 */

import { Device } from './Device';
import { gameHttp } from './../net/http/GameHttp';

const { ccclass, property } = cc._decorator;
const HTTP_ROOT = '';

@ccclass
export class ErrorReportor {
    static init() {
        if (cc.sys.isNative) {
            cc.log("===Error.js原生环境");
            let __handler;
            if (window["__errorHandler"]) {
                __handler = window["__errorHandler"];
            }
            window.__errorHandler = function (file, line, error) {
                cc.log("file", file);
                cc.log("line", line);
                cc.log("error", error);
                let errorText = `[file:${file}]\n[line:${line}]\n[error:${error}]`;
                this.saveLogOnWeb(errorText);

                if (__handler) {
                    __handler(arguments);
                }
            }
        } else if (cc.sys.isBrowser) {
            cc.log("===Error.js 浏览器环境");
            let __handler;
            if (window.onerror) {
                __handler = window.onerror;
            }
            window.onerror = function(msg, url, line) {
                cc.log("========web onerror start=======")
                cc.log("msg:", msg);
                cc.log("url:", url);
                cc.log("line:", line);
                cc.log("=========web onerror end=======");
                let errorText = `[file:${url}]\n[line:${line}]\n[error:${msg}]`;
                ErrorReportor.saveLogOnWeb(errorText);

                if (__handler) {
                    __handler(arguments);
                }
            }
        }
    }

    static saveLogOnWeb(msg) {
        return;
        let stack = new Error().stack;

        // if (cc.sys.os === cc.sys.OS_OSX) {
        //     return;
        //  }

        // 渠道号
        let channelId = '';
        // 系统类型
        let osType = Device.osName;
        let osVersion = Device.osVersion;
        // 设备型号
        let deviceType = cc.sys.browserType;
        let deviceVersion = cc.sys.browserVersion;
        if (cc.sys.isNative) {
            deviceType = Device.model;
            deviceVersion = Device.osVersion;
        }
        // MAC地址
        let mac = Device.mac;
        // IP
        let userIP = Device.ipAddress;

        // 用户信息
        let uid = '';
        let nickname = '';

        let errorMsg = `error msg = ${channelId} | ${osType} | ${osVersion} | ${deviceType}(${deviceVersion}) | ${mac} | ${userIP} | UID:${uid},NAME:${nickname} | \n----------------------------------------\n${msg}\n${stack}\n----------------------------------------`;
        cc.log('===>>开始上报异常errorMsg', errorMsg);

        // 发送到服务器, 这里不用proxy发送，不然发送异常时会反复触发发送
        // gameHttp.httpPost(HTTP_ROOT + "v1/reporterror", {error: errorMsg}, (resp)=>{
        //     if (resp.isOk()) {
        //         cc.log("===>>上报异常成功。");
        //     } else {
        //         cc.log("===>>上报异常失败: ", resp.getError() || resp.getBody());
        //     }
        // }, 100000);
    }
}