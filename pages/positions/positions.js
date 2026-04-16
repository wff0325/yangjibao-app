const api = require('../../utils/api.js')

const HOT_LISTS = {
  fund: [
    { code: '161039', name: '招商产业' },
    { code: '000001', name: '平安成长' },
    { code: '001671', name: '蚂蚁基金' },
    { code: '001552', name: '新能源车' }
  ],
  stock: [
    { code: '600519', name: '贵州茅台' },
    { code: '000858', name: '五粮液' },
    { code: '601318', name: '中国平安' },
    { code: '600036', name: '招商银行' }
  ],
  hk: [
    { code: '00700', name: '腾讯控股' },
    { code: '09988', name: '阿里巴巴' },
    { code: '00939', name: '建设银行' },
    { code: '02318', name: '中国平安' }
  ],
  us: [
    { code: 'AAPL', name: '苹果' },
    { code: 'MSFT', name: '微软' },
    { code: 'GOOGL', name: '谷歌' },
    { code: 'TSLA', name: '特斯拉' }
  ]
}

Page({
  data: {
    keyword: '',
    typeIndex: 0,
    typeValues: ['fund', 'stock', 'hk', 'us'],
    typeNames: ['基金', 'A股', '港股', '美股'],
    result: null,
    isFav: false,
    hotList: HOT_LISTS.fund,
    typeText: '基金'
  },

  switchType(e) {
    const index = parseInt(e.currentTarget.dataset.index)
    const type = this.data.typeValues[index]
    this.setData({
      typeIndex: index,
      hotList: HOT_LISTS[type],
      typeText: this.data.typeNames[index],
      result: null,
      keyword: ''
    })
  },

  onInput(e) {
    this.setData({ keyword: e.detail.value })
  },

  onSearch() {
    const kw = this.data.keyword.trim()
    if (!kw) {
      wx.showToast({ title: '请输入搜索内容', icon: 'none' })
      return
    }
    
    wx.showLoading({ title: '搜索中' })
    this.doSearch()
  },

  async doSearch() {
    try {
      const { typeValues, typeIndex, keyword } = this.data
      const searchType = typeValues[typeIndex]
      
      const res = await api.search(keyword, searchType)
      
      if (res.success && res.data && res.data.length > 0) {
        const item = res.data[0]
        const detailRes = await api.getData(item.code, searchType, item.name)
        
        const favRes = await api.getFavorites()
        const isFav = (favRes.data || []).some(f => f.code === item.code && f.type === searchType)
        
        this.setData({ 
          result: { code: item.code, detail: detailRes.detail },
          isFav
        })
      } else {
        this.setData({ result: null })
        wx.showToast({ title: '未找到', icon: 'none' })
      }
    } catch (e) {
      console.error(e)
      wx.showToast({ title: '搜索失败', icon: 'none' })
    }
    wx.hideLoading()
  },

  searchHot(e) {
    const kw = e.currentTarget.dataset.kw
    this.setData({ keyword: kw }, () => this.doSearch())
  },

  async onToggleFav() {
    const { result, isFav, typeIndex, typeValues } = this.data
    if (!result) return
    
    try {
      const type = typeValues[typeIndex]
      if (isFav) {
        await api.removeFavorite(result.code)
      } else {
        await api.addFavorite(result.code, result.detail.name, type)
      }
      this.setData({ isFav: !isFav })
      wx.showToast({ title: isFav ? '已取消' : '已添加' })
    } catch (e) {
      wx.showToast({ title: '操作失败', icon: 'none' })
    }
  },

  goAdd() {
    const { result, typeIndex, typeValues, keyword } = this.data
    if (!result) return
    
    const type = typeValues[typeIndex]
    const code = result.code || keyword
    wx.navigateTo({
      url: `/pages/add/add?code=${code}&name=${result.detail.name}&type=${type}&currentPrice=${result.detail.nav}`
    })
  }
})
