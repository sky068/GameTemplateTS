/**
 * Created by xujiawei on 2020-07-08 15:42:37
 */

import { callApp } from './../../platform/AppBridge';
import { reportError } from './../../common/Reportor';
import { Device } from './../../common/Device';

let data = {};

function _reportStorageError(e, key) {
    const { msg, message } = e || {};
    const errorMsg = (msg || message || 'storage 操作失败') + ', key=' + key;
    reportError(errorMsg);
}

// 约定value必须是字符串
export function setItem(key: string, value: any) {
    value = value.toString();
    return new Promise(function (resolve, reject) {
        if (Device.isApp) {
            callApp({
                action: 'setStorage',
                data: {
                    key,
                    value,
                },
                success: () => {
                    data[key] = value;
                    resolve(true);
                },
                fail: e => {
                    _reportStorageError(e, key);
                    resolve(false);
                },
            });
        } else {
            data[key] = value;
            window.localStorage.setItem(key, value);
            resolve(true);
        }
    })
}

//fromCache：读取的有些内容可能是app来改变的，所以每次都要从app读取
export function getItem(key: string, fromCache = true) {
    return new Promise(function (resolve, reject) {
        let hasOwn = {}.hasOwnProperty;
        if (fromCache && hasOwn.call(data, key)) {
            resolve(data[key]);
            return;
        }
        if (Device.isApp) {
            callApp({
                action: 'getStorage',
                data: {
                    key,
                },
                success: result => {
                    const { value = '' } = result;
                    if (value !== '') {
                        data[key] = value;
                    }
                    resolve(value);
                },
                fail: () => {
                    resolve('');
                },
            });
        } else {
            // 统一转成空字符串
            let result = window.localStorage.getItem(key) || '';
            if (result !== '') {
                data[key] = result;
            }
            resolve(result);
        }
    });
}

export function removeItem(key: string) {
    return new Promise(function (resolve, reject) {
        delete data[key];
        if (Device.isApp) {
            callApp({
                action: 'removeStorage',
                data: {
                    key,
                },
                success: () => {
                    resolve(true);
                },
                fail: e => {
                    _reportStorageError(e, key);
                    resolve(false);
                },
            });
        } else {
            window.localStorage.removeItem(key);
            resolve(true);
        }
    })
}

export function clear() {
    return new Promise(function (resolve, reject) {
        data = {};
        if (Device.isApp) {
            callApp({
                action: 'clearStorage',
                success: () => {
                    resolve(true);
                },
                fail: e => {
                    _reportStorageError(e, '*');
                    resolve(false);
                },
            });
        } else {
            window.localStorage.clear();
            resolve(true);
        }
    })

}