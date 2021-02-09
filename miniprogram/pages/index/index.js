//index.js
const db = wx.cloud.database();
const _ = db.command
const app = getApp()
var that;

Page({
  data: {
    btns:["五大确据","八大生活","过新生活","传扬基督","依靠神的资源","作基督的门徒","长成基督"],
    cons: ["wuda", "bada", "guo_xin_sheng_huo", "chuan_yang_ji_du", "yi_kao_shen_de_zi_yuan", "zuo_ji_du_de_men_tu", "zhang_cheng_ji_du_de_yang_shi"],
    active:0,//控制当前显示盒子 
    dict1:'',
    first:0
  },

  onLoad: function (options) {
    that = this;
    this.query(this.data.cons[0])

  },
  toggle:function(e){
    this.query(this.data.cons[e.currentTarget.dataset.index])
    console.log(e.currentTarget.dataset.index)
 
    this.setData({
      //设置active的值为用户点击按钮的索引值
      active:e.currentTarget.dataset.index,
 
    })
  },
  query:function(res){
    console.log('res',res)
    db.collection(res)
    .get({
      success: res => {
        this.setData({
          //data[1]是数据集中的第二条数据
          // headline: JSON.stringify(res.data[0].headline, null, 1),
          // jingje: JSON.stringify(res.data[0].jingje, null, 2),
          // content: JSON.stringify(res.data[0].content, null, 2),
          dict1:res.data
        })
        console.log('[数据库] [查询记录] 成功: ', res)
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '查询记录失败'
        })
        console.error('[数据库] [查询记录] 失败：', err)
      }
    })
  },

})
