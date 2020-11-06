/**
 * Created by xujiawei on 2020-07-07 16:59:40
 */

/**
 * 获取带协议、主机名、端口号的完整 URL
 * @param {string} url 原 URL，可以是以下格式：
 * @return {string} 带协议、主机名的 URL
 * @example
 *   // 原始 url：http://localhost:3000/library/preview?id=62#top
 *   '/'                                    => 'http://localhost:3000/'
 *   '/path/abc.html?a=1'                   => 'http://localhost:3000/path/abc.html?a=1'
 *   '//domain.com/path/abc.html?a=1'       => 'http://domain.com/path/abc.html?a=1'
 *   'https://domain.com/path/abc.html?a=1' => 'https://domain.com/path/abc.html?a=1'
 *   'abc.html?a=1'                         => 'http://localhost:3000/learning/abc.html?a=1'
 *   '?a=1'                                 => 'http://localhost:3000/learning/preview?a=1'
 *   '#a=1'                                 => 'http://localhost:3000/learning/preview?id=62#a=1'
 */

const location = window.location;

export function getFullUrl(url) {
  if (!url) {
    return '';
  }
  switch (true) {
    case /^\/(?!\/)/.test(url):
      // 注意，location.origin 兼容性不好，这里不要用
      return location.protocol + '//' + location.host + url;

    case /^[a-z]+:\/\//.test(url):
      return url;

    case /^\/\//.test(url):
      return location.protocol + url;

    case /^\?/.test(url):
      return location.href.replace(/[?#].*$/, '') + url;

    case /^#/.test(url):
      return location.href.replace(/#.*$/, '') + url;
  
    default:
      return location.href.replace(/\/[^/]*$/, '/' + url);
  }
}
