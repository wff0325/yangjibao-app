const API_BASE = 'https://fff.431234.xyz'

function get(url, params = {}) {
  let fullUrl = url
  if (Object.keys(params).length > 0) {
    const query = '?' + Object.entries(params).map(([k, v]) => k + '=' + encodeURIComponent(v)).join('&')
    fullUrl = url + query
  }
  console.log('GET:', API_BASE + fullUrl)
  
  return new Promise((resolve, reject) => {
    wx.request({
      url: API_BASE + fullUrl,
      method: 'GET',
      header: { 'Content-Type': 'application/json' },
      timeout: 15000,
      success: res => resolve(res.data),
      fail: err => {
        console.log('Error:', err)
        reject(err)
      }
    })
  })
}

function post(url, data = {}) {
  console.log('POST:', API_BASE + url, data)
  return new Promise((resolve, reject) => {
    wx.request({
      url: API_BASE + url,
      data,
      method: 'POST',
      header: { 'Content-Type': 'application/json' },
      timeout: 15000,
      success: res => resolve(res.data),
      fail: reject
    })
  })
}

module.exports = {
  API_BASE,
  getPositions: () => get('/api/positions'),
  getPositionsPnL: () => get('/api/positions/pnl'),
  getPriceHistory: (code, date, type) => get('/api/price/history', { code, date, type }),
  addPosition: (code, name, type, buy_date, buy_price, quantity) => 
    post('/api/positions/add', { code, name, type, buy_date, buy_price, quantity }),
  removePosition: (id) => post('/api/positions/remove', { id }),
  search: (keyword, type) => get('/api/search', { kw: keyword, type }),
  getData: (code, type, name) => post('/api/get_data', { code, type, name }),
  getFavorites: () => get('/api/favorites'),
  addFavorite: (code, name, type) => post('/api/favorites/add', { code, name, type }),
  removeFavorite: (code) => post('/api/favorites/remove', { code })
}
