/**
 * Created by xujiawei on 2020-07-07 16:40:34
 */

import { ClientConfig } from './../../ClientConfig';
import { Device } from './Device';
import * as Sentry from '@sentry/browser';
import { callApp } from './../platform/AppBridge';
import { isError, isErrorEvent, isDOMError, isDOMException, isArray, isObjectLike, isPlainObject, isString } from './TypeOf';


function initSentry() {
    // 使用sentry browser版本自动捕获异常进行上报
    const DSN = 'https://baidu.com/';
    if (cc.sys.isBrowser) {
        cc.log("web环境，使用sentry捕获异常")
        Sentry.init({
            dsn: DSN
        });
    }
}

const MSG_PREFIX = '® ';
function reportError(e: any, options?: any) {
    if (cc.sys.isBrowser) {
        const { msg = '', level = 'warning', group } = (
            isPlainObject(options)
                ? options
                : isString(options)
                    ? { msg: options }
                    : {}
        );

        // 输出msg 到Sentry的面包屑
        msg && console.warn(MSG_PREFIX + msg);

        // 打印堆栈信息
        try {
            const stack = e && e.stack;
            stack && console.log(stack);
        } catch (e) {
        }

        Sentry.withScope(scope => {
            // Levels: fatal, error, warning, info, debug. Default is error.
            // https://docs.sentry.io/platforms/javascript/#level
            scope.setLevel(level);

            // Group errors into issues.
            // https://docs.sentry.io/platforms/javascript/#setting-the-fingerprint
            const defaultGroupLabel = '{{ default }}';
            scope.setFingerprint([...(
                isArray(group)
                    ? group
                    : isObjectLike(e)
                        ? [(e.message || e.msg || '') + msg || defaultGroupLabel]
                        : [e.toString() + msg || defaultGroupLabel]
            ), `Level: ${level}`]);

            const defaultMessage = msg || `${MSG_PREFIX}未知异常`;
            let exception;
            switch (true) {
                case isError(e):
                case isErrorEvent(e) && e.error:
                case isDOMError(e):
                case isDOMException(e):
                    exception = e;
                    break;

                case isString(e) && e:
                    if (level === 'info') {
                        Sentry.captureMessage(MSG_PREFIX + e);
                        return;
                    }
                    exception = new Error(e);
                    break;

                case isPlainObject(e):
                    console.warn(JSON.stringify(e));
                    exception = new Error(e.message || e.msg || defaultMessage);
                    break;

                default:
                    console.warn(e);
                    exception = new Error(e.toString() || defaultMessage);
            }

            try {
                exception.name = MSG_PREFIX + exception.name;
            } catch (e) {
            }

            Sentry.captureException(exception);
        });
    }

}

/**************ping back*************/
const ua = window.navigator.userAgent || '';
const ptype = Device.isApp ? (Device.isIOS ? 'i' : 'a') + (Device.isTablet ? 'Pad' : 'Phone') : 'web';
const reporter = 'game';
const uuid = '';

let baseParams = null;
let startTimeStamp = Date.now();
function _getBaseParams() {
    if (baseParams) {
        return baseParams;
    }
    baseParams = {
        uuid,
        ua,
        scr: cc.view.getVisibleSize(),
        ptype,
        reporter,
        channel: ClientConfig.CHANNEL,  // ClientConfig.js
        game_ver: ClientConfig.APP_VERSION  // ClientConfig.js
    }
    return baseParams;
}

let queue = [];
function _pushQueue(params) {
    const t = Date.now();
    const baseParams = _getBaseParams();
    // cocos 不支持...扩展运算符😡
    // const {action, ...content} = params;
    let action = params.action;
    let content = params;
    delete content.action;

    const data = Object.assign({
        action,
        t,
        dur: t - startTimeStamp,
        content
    }, baseParams);

    if (Device.isIOSApp || Device.isAndroidApp) {
        callApp({
            action: 'pingback',
            data: {

                list: [data]
            },
        });
    } else {
        cc.log("非app环境，pingback暂不处理");
        // queue.push(data);
    }
}

/**
 * 
 * action: game_slow_req, game_toast
 * 
 */
function track(params) {
    _pushQueue(params);
}

export {
    track,
    reportError,
    initSentry
}