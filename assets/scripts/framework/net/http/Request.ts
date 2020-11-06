/**
 * Created by xujiawei on 2020-07-08 15:30:13
 */

import { appFetch } from './AppFetch';
import { testFetch } from './TestFetch';
import { Device } from './../../common/Device';
import { isPlainObject } from './../../common/TypeOf';

function withTimeLimit(promise, timeLimit =10000, timeoutMsg = '网络超时，请检查网络~') {
    if (!timeLimit || typeof timeLimit !== 'number') {
        return promise;
    }

    // 创建一个超时 promise
    const timer = new Promise((resolve, reject) => {
        const timeoutFn = () => {
            reject({
                code: 408,
                message: timeoutMsg
            });
        };
        setTimeout(timeoutFn, timeLimit);
    });

    // 竞赛
    return Promise.race([
        promise,
        timer,
    ]);
}

// 数据对象转 URL 参数格式
// function objToParams(data = {}) {
//   const params = [];
//   for (const key in data) {
//     params.push(`${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`);
//   }
//   return params.join('&');
// }

// 将对象数据以参数形式添加到 URL 上
function urlAddParams(url: string, data = {}) {
    const params = [];
    for (const key in data) {
        params.push(`${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`);
    }
    return (
        params.length
            ? url + (/\?/.test(url) ? '&' : '?') + params.join('&')
            : url
    );
}

// 通用网络请求
function request(url, data, options, timeout = 10000) {
    let _policy = options._policy;
    if (_policy) {
        delete options._policy;
    }
    if (!options.method) {
        options.method = "GET";
    } 
    if (!options.mode) {
        options.mode = "cors";
    }
    let method = options.method;

    if (method === 'GET' || method === 'HEAD') {
        if (isPlainObject(data)) {
            url = urlAddParams(url, data);
        }
        if ('body' in options) {
            console.warn('A request using the GET or HEAD method cannot have a body.');
            delete options.body;
        }
    } else if (method === 'POST' || method === 'PUT' || method === 'DELETE') {
        if (!isPlainObject(options.headers)) {
            options.headers = {};
        }
        options.headers['Content-Type'] = 'application/json; charset=utf-8';
        options.body = isPlainObject(data) ? JSON.stringify(data) : '{}';
    }

    // const crossDeviceFetch = Device.isIOSApp ? appFetch(url, options, _policy) : window.fetch(url, options);
    
    // 全部使用appFetch，开发环境下使用testFetch
    cc.log("使用app代发请求:", Device.isIOSApp || Device.isAndroidApp);
    const crossDeviceFetch = (Device.isIOSApp || Device.isAndroidApp) ? appFetch(url, options, _policy) : testFetch(url, options);

    // const crossDeviceFetch = appFetch(url, options);
    // const crossDeviceFetch = testFetch(url, options);
    return withTimeLimit(crossDeviceFetch, timeout);
}

export {
    request
}