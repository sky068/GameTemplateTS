/**
 * Created by xujiawei on 2020-07-07 16:58:02
 */

import { getFullUrl } from './GetFullUrl';
import { Device } from './../../common/Device';
import { callApp } from './../../platform/AppBridge';

/**
 * 使用客户端代发 fetch 请求
 * 输入输出与 window.fetch 相同
 */
function appFetch(url, options, policy = 0) {
  const { method, headers, body } = options;

  // Get request headers
  // const headers = {};
  // options.headers.forEach((value, name) => {
  //   headers[name] = value;
  // });

  const requestData = {
    url: getFullUrl(url),
    method,
    headers,
    policy,
  };

  return new Promise((resolve, reject) => {
    // // Abort
    // if (request.signal && request.signal.aborted) {
    //   return reject({
    //     code: 2,
    //     message: 'appFetch request aborted, AbortError',
    //   });
    // }

    // Request body
    if (method === 'POST' || method === 'PUT' || method === 'DELETE') {
      requestData.body = JSON.parse(body);
    }

    callApp({
      action: 'request',
      data: requestData,
      success: res => {
        console.log('requestApp', requestData, 'appResponse', res);
        const { status, statusText = 'OK', headers = {}, body } = res;
        if (Object.prototype.toString.call(body) === '[object Object]') {
          resolve({
            status,
            statusText,
            ok: status >= 200 && status < 300,
            headers,
            json: () => Promise.resolve(body),
            text: () => Promise.resolve(JSON.stringify(body)),
          });
        } else {
          resolve(new Response(body || '', {
            status,
            statusText,
            headers,
          }));
        }
      },
      fail: err => {
        console.log('requestApp', requestData, 'appResponse', err);
        reject({
          code: err.code || -1,
          message: `网络异常，${err.msg} #${err.code}`,
        });
      },
    });
  });
}

// iOS 客户端中由客户端代发网络请求，第三方代码也用我们的 fetch
if (Device.isIOSApp && typeof window.originalFetch !== 'function') {
  window.originalFetch = window.fetch;
  window.fetch = appFetch;
}

export {
    appFetch
}
