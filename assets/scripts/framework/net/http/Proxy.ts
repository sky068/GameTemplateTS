/**
 * Created by xujiawei on 2020-07-08 15:46:20
 */

import { isPlainObject } from './../../common/TypeOf';
import { request } from './Request';
import { track, reportError } from './../../common/Reportor';
import { Tip } from './../../common/Tip';
import { DataMng } from '../../data/remoteData/DataMng';

// import { getUUIDAsync } from './../utils/getAppInfo';
// import { track } from './../utils/pingback';

function _request(url, data, options: any = {}) {
    const timestamp = Date.now();  // 网络请求时间戳

    // 一些默认请求配置
    if (!options.cache) {
        options.cache = "no-cache";  // 默认每次请求都从服务端检查更新
    }

    if (!isPlainObject(options.headers)) {
        options.headers = {};
    }
    options.headers['Accept'] = 'application/json';

    // 针对同域请求的处理
    //   if (! /^(?:https?:)?\/\//.test(url)) {
    //     // 相对路径前添加 host
    //     url = window.BOOKBOOK_ENV.API_HOST + url;
    //     try {
    //       const list = await Promise.all([
    //         storage.getItem('access_token'),
    //         storage.getItem('child_id'),
    //         // getUUIDAsync()
    //       ]);
    //       if (list[0]) {
    //         options.headers.set('access_token', list[0]);
    //       }
    //       if (list[1]) {
    //         options.headers.set('child_id', list[1]);
    //       }
    //       if (list[2]) {
    //         options.headers.set('uuid', list[2]);
    //       }
    //     } catch (e) {
    //         reportError(e, '获取 access_token、child_id 或 uuid 失败');  // 上报错误
    //     }
    //   }

    return request(url, data, options).then(res => {
        const delay = Date.now() - timestamp;
        if (delay > 1000) {  // 上报时间大于 1s 的请求
            track({
                action: 'game_slow_req',
                delay,
                url,
                data
            });
        }

        // HTTP 状态码处理
        const HTTP_CODE = res.status;
        cc.log("http code:", HTTP_CODE);
        switch (true) {
            case HTTP_CODE === 401: // 未登录
                // const { userLoginData } = Stores.getInstance(); // 不能放在 function 外面，防止循环 import
                // userLoginData.logout('invalidToken');
                return Promise.reject({
                    code: 401,
                    message: '请登录',
                });
            case HTTP_CODE > 401:
                return Promise.reject({
                    code: HTTP_CODE,
                    message: `服务异常，请稍后重试 #${HTTP_CODE}`,
                });
            default:
                return res.json().then(json => {
                    if (json.code != 0) {
                        return Promise.reject({
                            code: json.code,
                            message: json.msg
                        });
                    }
                    // todo: 附带有玩家数据则通知ui更新
                    if (json.data.userData) {
                        DataMng.userData.updateData(json.data.userData);
                        cc.director.emit('update_userdata');
                    }

                    return json;
                });
        }
    }).catch(err => {
        cc.log("===proxy err: ", JSON.stringify(err));
        if (err.code !== 401) {
            reportError(err, {
                msg: `${options.method} ${url}, CODE ${err.code}, ${err.message}`,
                group: ['Proxy', `Code: ${err.code}`, `Message: ${err.message}`],
                level: err.code >= 500 ? 'error' : 'warning',
            });
        }

        const DEFAULT_MESSAGE = '系统异常，请稍后重试';
        const result = isPlainObject(err) && ('code' in err) ? err : {
            code: -1,
            message: err.message || `${DEFAULT_MESSAGE} #-1`
        };

        // Tip.show(result.message || result.msg || `${DEFAULT_MESSAGE} #-1`);
        return Promise.reject(result);
    });
}

export let proxy = {
    get: (url: string, data?: any, options: any = {}) => _request(url, data, Object.assign(options, { method: 'GET' })),
    post: (url: string, data?: any, options: any = {}) => _request(url, data, Object.assign(options, { method: 'POST' })),
    put: (url: string, data?: any, options: any = {}) => _request(url, data, Object.assign(options, { method: 'PUT' })),
    del: (url: string, data?: any, options: any = {}) => _request(url, data, Object.assign(options, { method: 'DELETE' })),
}