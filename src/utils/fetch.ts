import fetch from 'node-fetch'
import * as http from 'http'
import * as https from 'https'

const DEFAULT_HEADERS = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
}

const matchReg = /([?&][^#?&=]*=?[^#?&]*)+/gi
const anchorReg = /#[^?]*/gi
const httpTimeout = 4000

function getParams(url: string) {
  const anchorMatches = url.match(anchorReg)
  const temp = url
  const matches = temp.match(matchReg)
  const matchStr = matches ? matches[0] : undefined
  const params = {}
  const action = temp.substr(
    0,
    temp.length -
      (matchStr ? matchStr.length : 0) -
      (anchorMatches ? anchorMatches[0].length : 0),
  )

  if (matchStr) {
    // 拆出参数数组
    const arr = matchStr.substr(1).split(/[?=&]/g)
    let i = 0
    while (i < arr.length) {
      params[arr[i]] = i + 1 < arr.length ? arr[i + 1] : undefined
      i += 2
    }
  }

  return {
    action,
    params,
    hash: anchorMatches,
  }
}

function concatUrl(url: string, params?: any, needEncode: boolean = true) {
  // 参数不为对象 或 参数为空对象 返回原字符串
  if (!(params instanceof Object) || Object.keys(params).length === 0) {
    return url
  }

  const { params: newParams, hash: anchorMatches, action } = getParams(url)

  // 如果同名参数有了值则覆盖
  Object.assign(newParams, params)
  const temp = Object.keys(newParams).reduce((p, n) => {
    let result = p
    if (typeof newParams[n] !== 'undefined') {
      if (newParams[n] instanceof Array) {
        const arr = newParams[n]
        arr.forEach(v => {
          result += `${n}=${v}&`
        })
      } else {
        result += `${n}=${newParams[n]}&`
      }
    }
    return result
  }, `${action}?`)

  const ret =
    temp.substr(0, temp.length - 1) + (anchorMatches ? anchorMatches[0] : '')
  if (needEncode) {
    return encodeURI(ret)
  }
  return ret
}

/**
 * 发送get请求
 * @param {string} url 完整url地址
 * @param {object} header 自定义 header
 * @returns {Promise.<T>}
 */
export function get(url: string, params?: any, header?: any) {
  return fetch(concatUrl(url, params), {
    method: 'GET',
    headers: Object.assign({}, DEFAULT_HEADERS, header),
    timeout: httpTimeout,
    agent: function(_parsedURL) {
      if (_parsedURL.protocol === 'http:') {
        return new http.Agent({
          keepAlive: true,
        })
      } else {
        return new https.Agent({
          keepAlive: true,
          rejectUnauthorized: false,
        })
      }
    },
  }).then(res => res.json())
}

/**
 * 发送post请求
 * @param {string} url 完整url地址
 * @param {object} params 参数
 * @param {object} header 自定义 header
 * @returns {Promise.<T>} ?
 */
export function post(url: string, params?: any, header?: any) {
  return fetch(url, {
    method: 'POST',
    headers: Object.assign({}, DEFAULT_HEADERS, header),
    body: JSON.stringify(params),
    timeout: httpTimeout,
    agent: function(_parsedURL) {
      if (_parsedURL.protocol === 'http:') {
        return new http.Agent({
          keepAlive: true,
        })
      } else {
        return new https.Agent({
          keepAlive: true,
          rejectUnauthorized: false,
        })
      }
    },
  }).then(res => res.json())
}
