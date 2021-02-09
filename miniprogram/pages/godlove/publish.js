// pages/godlove/publish.js
var that;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: null,
    content:'',
    textLength:0,
    images:[],
    maxCount:9,
    images_upload_success:[],//图片上传成功后的云端图片地址数组
    images_upload_success_size:0,//图片上传成功的数量
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;
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

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  bindinput(e){
    console.log(e)
    that.setData({
      content:e.detail.value,
      textLength:e.detail.value.length,

    })
  },
  chooseImage(){
    wx.chooseImage({
      count: that.data.maxCount,//这里可以设置，能选择多少张图片
      sizeType: ['compressed'],//['original', 'compressed']可以指定是原图还是压缩图，默认二者都有,这里我选择了压缩
      sourceType: ['album', 'camera'],//从相册选择
      success (res) {
        console.log("选择图片成功", res)
        that.setData({
          images:res.tempFilePaths
        })
        // tempFilePath可以作为img标签的src属性显示图片
        // const tempFilePaths = res.tempFilePaths
      }
    })
  },
  previewImage(e){
    wx.previewImage({
      current: that.data.images[e.currentTarget.dataset.index], // 当前显示图片的http链接
      urls: that.data.images // 需要预览的图片http链接列表
    })
  },

  // DeleteImg(e) {
  //   wx.showModal({
  //     title: '要删除这张照片吗？',
  //     content: '',
  //     cancelText: '取消',
  //     confirmText: '确定',
  //     success: res => {
  //       console.log("res", res)
  //       if (res.confirm) {
  //         this.data.imgList.splice(e.currentTarget.dataset.index, 1);
  //         this.setData({
  //           imgList: this.data.imgList
  //         })
  //       }
  //     }
  //   })
  // }

  uploadImage(index){
   var data_time =  new Date();
    wx.cloud.uploadFile({
      cloudPath: 'circle_'+data_time.getTime()  + "_" + Math.floor(Math.random()*1000) + ".jpg",
      filePath: that.data.images[index], // 文件路径
      success: res => {
        // get resource ID
        console.log(res.fileID)
        that.data.images_upload_success[index] = res.fileID
        that.data.images_upload_success_size = that.data.images_upload_success_size+1;
        //如果图片上传的数量等于已选中图片的数量，说明图片上传成功了；
        if(that.data.images_upload_success_size == that.data.images.length){
          console.log("success:",that.data.images_upload_success)
          //上传图片成功，也调用信息添加函数
          that.circleAdd();
        }else{
          that.uploadImage(index+1);
        }
      },
      fail: err => {
        that.setData({
          images_upload_success:[],
          images_upload_success_size:0
        })
        //关闭提示
        wx.hideLoading()
        wx.showToast({
          icon: 'none',
          title:'图片上传失败，请重试'
        })
        // handle error
      }
    })

  },

  clickSend(){
    //如果文字填写内容为空，并且没有填加图片，给用户提示
    if(that.data.content.trim().length==0 && that.data.images.length==0){
      wx.showToast({
        icon: 'none',
        title:'请发点内容吧',
      })
      return
    }
    //加一个上传的提示
    wx.showLoading({
      title: '发表中...',
    })
    console.log("that.data.images",that.data.images)
    //如果已经有了图片，就上传图片
    if(that.data.images.length>0){
      that.setData({
        //上传图片长度（数量）与已选中图片长度（数量）一样
       images_upload_success:that.data.images
      })
      that.uploadImage(0)
    }else{
      that.circleAdd();
    }
  },
  circleAdd: function(){
    //将发布的文字信息，添加进云端数据库
    const db = wx.cloud.database()
    var data =  new Date();
    db.collection('circle').add({
      data:{
        content:that.data.content,//信息内容
        images:that.data.images_upload_success,//信息中加的图片的路径
        time:new Date(),//信息的时间
        loveList:[],//信息的点赞列表
        commentList:[],//信息的评论列表
        userInfo:that.data.userInfo,//信息的发布用户
        // title:"猛男猛男"
      }
    }).then(res=>{
      //添加成功打印
      console.log("add circle success:",res)
      wx.showToast({
        icon: 'none',
        title: '发表成功',
      })
      //关闭提示
      wx.hideLoading()
      //第一步获取页面袋
      let pages = getCurrentPages();
      //第二步获取该页的上一级页面,减2就能回到上一页
      let before = pages[pages.length - 2 ];
      //第三步，上一次是列表页，要刷新才能看到发布的内容，所以先把上一页刷新
      before.refresh()
      //第四步，把这一页就是当前页关掉
      wx.navigateBack({
        delta: 1,
      })
    }).catch(error=>{
      //添加失败打印
      console.log("add circle error:",error)
      wx.showToast({
        icon: 'none',
        title: '发表失败',
      })
      //关闭提示
      wx.hideLoading()
    })
  },




})

