const api = require('../../utils/api.js')

Page({
  data: {
    code: '',
    name: '',
    type: 'fund',
    currentPrice: '',
    buyDate: '',
    buyPrice: '',
    quantity: '',
    totalCost: '0.00'
  },

  onLoad(options) {
    const today = new Date().toISOString().split('T')[0]
    const code = options.code || ''
    const currentPrice = options.currentPrice || ''
    
    this.setData({
      code: code,
      name: options.name || '',
      type: 'fund',
      currentPrice: currentPrice,
      buyPrice: currentPrice,
      quantity: options.quantity || '',
      buyDate: today
    }, () => {
      if (code && !options.buyPrice) {
        this.fetchHistoricalPrice(today)
      }
    })
    this.calcCost()
  },

  onDateChange(e) {
    const date = e.detail.value
    this.setData({ buyDate: date, buyPrice: '...' })
    this.fetchHistoricalPrice(date)
  },

  async fetchHistoricalPrice(date) {
    const { code } = this.data
    if (!code) return
    const type = 'fund'
    wx.showLoading({ title: '获取价格...', mask: true })
    try {
      const res = await api.getPriceHistory(code, date, type)
      if (res.success && res.price) {
        this.setData({ buyPrice: res.price.toString() })
        this.calcCost()
      } else {
        wx.showToast({ title: '未找到当日价格', icon: 'none' })
      }
    } catch (e) {
      wx.showToast({ title: '获取价格失败', icon: 'none' })
    } finally {
      wx.hideLoading()
    }
  },

  onQuantityInput(e) {
    this.setData({ quantity: e.detail.value })
    this.calcCost()
  },

  calcCost() {
    const { buyPrice, quantity } = this.data
    const price = parseFloat(buyPrice) || 0
    const qty = parseFloat(quantity) || 0
    this.setData({ totalCost: (price * qty).toFixed(2) })
  },

  async onSubmit() {
    const { code, name, type, buyDate, buyPrice, quantity } = this.data
    if (!code || !buyDate || !buyPrice || !quantity) {
      wx.showToast({ title: '请填写完整', icon: 'none' })
      return
    }
    wx.showLoading({ title: '添加中' })
    try {
      const res = await api.addPosition(code, name, type, buyDate, parseFloat(buyPrice), parseFloat(quantity))
      if (res.success) {
        wx.showToast({ title: '添加成功' })
        setTimeout(() => wx.navigateBack(), 1500)
      } else {
        wx.showToast({ title: res.message, icon: 'none' })
      }
    } catch (e) {
      wx.showToast({ title: '添加失败', icon: 'none' })
    }
    wx.hideLoading()
  }
})
