import { enc, HmacSHA256 } from 'crypto-js'
import { utc } from 'moment'

import { get, post } from '../utils/fetch'
import { warn, error } from '../utils/console'

const API_HUOBI = 'api.huobi.pro'

type MethodType = 'GET' | 'POST'

function origin_sign_sha(
  access_secret: string,
  method: MethodType,
  baseurl: string,
  path: string,
  data: any,
) {
  let pars = []
  let keys = Object.keys(data)

  keys.forEach(key => {
    pars.push(`${key}=${encodeURIComponent(data[key])}`)
  })

  let p = pars.sort().join('&')
  let meta = [method, baseurl, path, p].join('\n')
  let hash = HmacSHA256(meta, access_secret)
  let Signature = encodeURIComponent(enc.Base64.stringify(hash))
  p += `&Signature=${Signature}`
  return p
}

function origin_get_body(access_key: string) {
  return {
    AccessKeyId: access_key,
    SignatureMethod: 'HmacSHA256',
    SignatureVersion: 2,
    Timestamp: utc().format('YYYY-MM-DDTHH:mm:ss'),
  }
}

function call_api(
  method: MethodType,
  path: string,
  payload: string,
  body: any,
) {
  let url = `https://${API_HUOBI}${path}?${payload}`

  if (method === 'GET') {
    return get(url)
  } else if (method === 'POST') {
    return post(url, body)
  }
}

const getHuoBiApis = (access_key: string, access_secret: string) => {
  let accountId = 0
  const generateRequest = async (
    method: MethodType,
    path: string,
    params?: any,
  ) => {
    const body = Object.assign({}, origin_get_body(access_key), params)
    const payload = origin_sign_sha(
      access_secret,
      method,
      API_HUOBI,
      path,
      body,
    )
    const res = await call_api(method, path, payload, body)
    if (res.status === 'ok') {
      return res
    } else {
      warn(
        `请求失败:\nmethod: ${method}\npath: ${path}\nparams: ${JSON.stringify(
          params,
          null,
          2,
        )}\nresponse: ${JSON.stringify(res, null, 2)}`,
      )
      return null
    }
  }

  const onReady = generateRequest('GET', '/v1/account/accounts')
    .then(({ data }) => {
      // 币币交易对的 account
      accountId = data.filter((t: any) => t.type === 'spot')[0].id
    })
    .catch(err => {
      error(`初始化火币账户信息失败:${err.message}\n进程退出...`)
      process.exit(-1)
    })

  const sendGetRequest = (path: string | Function, params?: any) =>
    onReady.then(() =>
      generateRequest(
        'GET',
        typeof path === 'function' ? path() : path,
        params,
      ),
    )

  const sendPostRequest = (path: string, params?: any) =>
    onReady.then(() =>
      generateRequest(
        'POST',
        path,
        typeof params === 'function' ? params() : params,
      ),
    )

  return {
    get_balance: async () => {
      const { data } = await sendGetRequest(
        () => `/v1/account/accounts/${accountId}/balance`,
      )
      const { list } = data
      const tradeBalances = list.filter(
        (t: { balance: number; type: 'trade' | 'frozen'; currency: string }) =>
          t.balance > 0 && t.type === 'trade',
      )
      return tradeBalances
    },
    get_depth: (symbol: string, type: string = 'step1') =>
      sendGetRequest('/market/depth', { symbol, type }),
    get_open_orders: (symbol: string, states = 'submitted,partial-filled') =>
      sendGetRequest('/v1/order/orders', { symbol, states }),
    get_order: (order_id: number) =>
      sendGetRequest(`/v1/order/orders/${order_id}`),
    buy_limit: (symbol: string, amount: number, price: number) =>
      sendPostRequest('/v1/order/orders/place', () => ({
        symbol,
        amount,
        price,
        'account-id': accountId,
        type: 'buy-limit',
        source: 'api',
      })),
    sell_limit: (symbol: string, amount: number, price: number) =>
      sendPostRequest('/v1/order/orders/place', () => ({
        symbol,
        amount,
        price,
        'account-id': accountId,
        type: 'sell-limit',
        source: 'api',
      })),
    buy_market: (symbol: string, amount: number) =>
      sendPostRequest('/v1/order/orders/place', () => ({
        symbol,
        amount,
        'account-id': accountId,
        type: 'buy-market',
        source: 'api',
      })),
    sell_market: (symbol: string, amount: number) =>
      sendPostRequest('/v1/order/orders/place', () => ({
        symbol,
        amount,
        'account-id': accountId,
        type: 'sell-market',
        source: 'api',
      })),
  }
}

export default getHuoBiApis
