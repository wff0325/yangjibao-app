const api = require('../../utils/api.js')

Page({
  data: {
    tabIndex: 0,
    positions: [],
    favorites: [],
    totalValue: '0.00',
    totalPnl: '0.00',
    totalPnlPct: '0.00'
  },

  onShow() {
    this.loadData()
  },

  async loadData() {
    wx.showLoading({ title: '加载中' })
    try {
      const [pnlRes, favRes] = await Promise.all([
        api.getPositionsPnL(),
        api.getFavorites()
      ])
      
      if (pnlRes.success) {
        let totalCost = 0, totalValue = 0
        pnlRes.data.forEach(p => {
          const cost = p.buy_price * p.quantity
          const currentPrice = p.quantity > 0 ? p.current_value / p.quantity : 0
          // 盈亏颜色：赚了红(up)，亏了绿(down)
          p.priceChange = currentPrice >= p.buy_price ? 'up' : 'down'
          p.valueChange = p.current_value >= cost ? 'up' : 'down'
          totalCost += cost
          totalValue += p.current_value
        })
        const pnl = totalValue - totalCost
        const pnlPct = totalCost > 0 ? (pnl / totalCost * 100) : 0
        
        this.setData({
          positions: pnlRes.data,
          totalValue: totalValue.toFixed(2),
          totalPnl: pnl.toFixed(2),
          totalPnlPct: pnlPct.toFixed(2)
        })
      }
      
      if (favRes.success) {
        this.setData({ favorites: favRes.data || [] })
      }
    } catch (e) {
      console.error(e)
    }
    wx.hideLoading()
  },

  switchTab(e) {
    this.setData({ tabIndex: e.currentTarget.dataset.index })
  },

  goDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/detail/detail?id=${id}` })
  },

  goSearch() {
    wx.navigateTo({ url: '/pages/positions/positions' })
  },

  addFromFav(e) {
    const { code, name, type } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/add/add?code=${code}&name=${name}&type=${type}` })
  },

  async delFav(e) {
    const code = e.currentTarget.dataset.code
    wx.showModal({
      title: '确认删除',
      content: '确定从自选列表移除？',
      success: async (res) => {
        if (res.confirm) {
          const result = await api.removeFavorite(code)
          if (result.success) {
            wx.showToast({ title: '已删除' })
            this.loadData()
          }
        }
      }
    })
  },

  async delPos(e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '确认删除',
      content: '确定删除该持仓？',
      success: async (res) => {
        if (res.confirm) {
          const result = await api.removePosition(id)
          if (result.success) {
            wx.showToast({ title: '已删除' })
            this.loadData()
          }
        }
      }
    })
  }
})
