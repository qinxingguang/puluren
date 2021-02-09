const app = getApp()  //获取小程序实例(必要)
Page({

  data: {
    avatarUrl: './user-unlogin.png',
    userInfo: {},

  },

  onLoad: function() {
    if (!wx.cloud) {
      wx.redirectTo({
        url: '../chooseLib/chooseLib',
      })
      return
    }

    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              this.setData({
                avatarUrl: res.userInfo.avatarUrl,
                userInfo: res.userInfo
              })
            }
          })
        }
      }
    })
  },

  onGetUserInfo: function(e) {
    if (!this.data.logged && e.detail.userInfo) {
      this.setData({
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo
      })
    }
  },




  onGetWXACode() {
    this.setData({
      wxacodeSrc: '',
      wxacodeResult: '',
      showClearWXACodeCache: false,
    })

    // 此处为演示，将使用 localStorage 缓存，正常开发中文件 ID 应存在数据库中
    const fileID = wx.getStorageSync('wxacodeCloudID')

    if (fileID) {

      // 有云文件 ID 缓存，直接使用该 ID
      // 如需清除缓存，选择菜单栏中的 “工具 -> 清除缓存 -> 清除数据缓存”，或在 Storage 面板中删掉相应的 key
     console.log(fileID);
      this.setData({
        wxacodeSrc: fileID,
        wxacodeResult: `从本地缓存中取得了小程序码的云文件 ID`,
        showClearWXACodeCache: true,
      })
      console.log(`从本地缓存中取得了小程序码的云文件 ID：${fileID}`)
    } else {
      wx.cloud.callFunction({
        name: 'openapi',
        data: {
          action: 'getWXACode',
        },
        success: res => {
          console.warn('[云函数] [openapi] wxacode.get 调用成功：', res)
          wx.showToast({
            title: '调用成功',
          })
          this.setData({
            wxacodeSrc: res.result,
            wxacodeResult: `云函数获取二维码成功`,
            showClearWXACodeCache: true,
          })
          wx.setStorageSync('wxacodeCloudID', res.result)
        },
        fail: err => {
          wx.showToast({
            icon: 'none',
            title: '调用失败',
          })
          console.error('[云函数] [openapi] wxacode.get 调用失败：', err)
        }
      })
    }
  },

  clearWXACodeCache() {
    wx.removeStorageSync('wxacodeCloudID')

    this.setData({
      wxacodeSrc: '',
      wxacodeResult: '',
      showClearWXACodeCache: false,
    })

    wx.showToast({
      title: '清除成功',
    })
  },
}) 