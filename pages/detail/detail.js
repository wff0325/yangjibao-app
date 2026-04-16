const api = require('../../utils/api.js')

Page({
  data: {
    id: 0,
    detail: {},
    quantity: '0',
    totalCost: '0.00',
    currentPrice: '0.00',
    currentValue: '0.00',
    pnl: '0.00',
    pnlPct: '0.00',
    todayChg: '0.00',
    positionPct: '0.00',
    holdDays: 0
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ id: options.id })
      this.loadDetail()
    }
  },

  async loadDetail() {
    wx.showLoading({ title: '加载中' })
    try {
      const res = await api.getPositionsPnL()
      if (res.success) {
        const pos = res.data.find(p => p.id == this.data.id)
        if (pos) {
          const detailRes = await api.getData(pos.code, pos.type, pos.name)
          const fundDetail = detailRes.detail || {}
          
          const cost = pos.buy_price * pos.quantity
          const cv = pos.current_value || 0
          const cp = pos.current_price || 0
          const p = cv - cost
          const pp = cost > 0 ? (p / cost * 100) : 0
          
          const buyDate = new Date(pos.buy_date)
          const today = new Date()
          const holdDays = Math.floor((today - buyDate) / (1000 * 60 * 60 * 24))
          
          const allRes = await api.getPositionsPnL()
          const totalValue = (allRes.data || []).reduce((sum, item) => sum + (item.current_value || 0), 0)
          const positionPct = totalValue > 0 ? (cv / totalValue * 100) : 0
          
          this.setData({
            detail: { ...pos, ...fundDetail },
            quantity: pos.quantity,
            totalCost: cost.toFixed(2),
            currentPrice: cp.toFixed(4),
            currentValue: cv.toFixed(2),
            pnl: p.toFixed(2),
            pnlPct: pp.toFixed(2),
            todayChg: fundDetail.nav_chg || '0',
            positionPct: positionPct.toFixed(2),
            holdDays: holdDays,
            priceChange: cp >= pos.buy_price ? 'up' : 'down',
            valueChange: cv >= cost ? 'up' : 'down'
          })
        }
      }
    } catch (e) {
      console.error(e)
    }
    wx.hideLoading()
  },

  onEdit() {
    const { id, detail, quantity } = this.data
    wx.navigateTo({
      url: `/pages/add/add?id=${id}&code=${detail.code}&name=${detail.name}&type=${detail.type}&buy_date=${detail.buy_date}&buy_price=${detail.buy_price}&quantity=${quantity}`
    })
  },

  onDelete() {
    wx.showModal({
      title: '确认删除',
      content: '确定删除该持仓记录？',
      success: async (res) => {
        if (res.confirm) {
          const result = await api.removePosition(this.data.id)
          if (result.success) {
            wx.showToast({ title: '已删除' })
            setTimeout(() => wx.navigateBack(), 1500)
          }
        }
      }
    })
  }
})
