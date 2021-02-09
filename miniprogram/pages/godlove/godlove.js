// const db = wx.cloud.database();
// const _ = db.command
var that;
var db = wx.cloud.database();
const _ = db.command
var _animation; //动画实体
var _animationIindex = 0;  //动画执行次数index（当前执行多少次）
var _AnimationIntervalId = -1;//动画定时任务ID，通过setinterval来达到无限旋转，记录ID，用于结束定时任务
const _ANIMATION_TIME = 300;//动画播放一次的时长ms
const app = getApp();


Page({
  data:{
    userInfo:{},//对象{}是一个整体
    animation: '',
    list:[],//集合【】里面是一个个元素，元素可以是对象；
    showOperationPannelIndex:-1,//点赞对应信息条的索引
    currentCircleIndex:-1,//这是评论对应信息条的索引
    showCommentAdd:false,//这是显示评论输入框的判断值
    commentContent:'',//这是评论内容
    heightBottom:'',//这是评论输入框相对于手机底部的距离
    refresh:false,//刷新
    loading:false,//动画
    loadMore:false,//加载更多数据
    haveMoreData:true,//是否还有更多数据,先假设有，然布才会显示有更多数据的布局，给后面做判断
    page:0,//初始化的数码，0页开始
    pageCount:10,//每页的数量10张
    reply:'',//来装回复评论用到的评论人的昵称
    touchStartOperation:false,
    touchStartOperationPannel:false,
    
   

    
  },
  onLoad: function (e) {
    
    that = this;
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              
              that.addUser(res.userInfo);
              this.setData({
                avatarUrl: res.userInfo.avatarUrl,
                userInfo: res.userInfo,
                
              })
            }
          })
        }
      }
    })
    

    // wx.cloud.callFunction({
    //   name:'login',
    //   complete:res =>{
    //     console.log('callFunction login result',res)
    //   }
    // })



    

    //这是布局时用的假数据，现在接通后端数据后就不用了！！！！！
    // for(var i=1;i<10;i++){
    //   var circleDate = {};
    //   circleDate.nickName = "朋友-"+ i;
    //   circleDate.content = "我有一本圣经可以分享给有需要的人-"+ i;
    //   circleDate.time = "2021-1-30"+ i;

    //   var imageList = [];
    //   var loveList = [];
    //   var commentList = [];

    //   circleDate.imageList = imageList;
    //   circleDate.loveList = loveList;
    //   circleDate.commentList = commentList;

    //   for(var j=1;j<i;j++){
    //     imageList.push(j);
    //     var loveDate = {};
    //     loveDate.nickName = '点赞-' + j;

    //     loveList.push(loveDate)

    //     var commentData = {};
    //     commentData.nickName = "覃先生-" + j + ":";
    //     commentData.content = "评论内容-" + j;

    //     commentList.push(commentData);
    //   }
    //   that.data.list.push(circleDate)
    // }
    // that.setData({
    //   list:that.data.list
    // })

  },

  addUser(userInfo){
    wx.showLoading({
      title: '正在登录',
    })
    //这是想调用函数来获取到用户的OPEND ID，但是尝试失败了，这方法还得再研究一下；
    wx.cloud.callFunction({
      // 需调用的云函数名
      name:'login',
      // 传给云函数的参数
      data:userInfo,

    }).then(res =>{
      userInfo._openid=res.result.OPENID;
      if(res.result.code==200){
        userInfo._openid=res.result.OPENID;
      }
      if(res.result.code==201){
        userInfo._openid=res.result.OPENID;
      }
      wx.setStorage({
        data: JSON.stringify(userInfo),
        key: 'userInfo',
        success(res){
          console.log("global useinfo",userInfo)
          getApp().globalData.userInfo = userInfo;
          wx.hideLoading()
        }
      })
    })
    
  },







  goPublish(){
    wx.navigateTo({
      url: 'publish',
    })
  },

  // callFunction:function(){
  //   console.log("Button is click")
  //   wx.cloud.callFunction({
  //     //这是要调用一个名叫：queryData的云函数，如果没有，就要去建这个云函数
  //     name:"queryData"
  //   }).then(console.log)
  // },

  //showOperationPannel这个函数就是拿到，当前操作的这个容器，他的数据。我们的目标是拿到这个容器的索引值，他的索引值是多少，可以通过下面的函数得到
  showOperationPannel(e){
    console.log("showOperationPannel",e)
    var index = e.currentTarget.dataset.index;
    if(that.data.showOperationPannelIndex == index){
      that.setData({
        showOperationPannelIndex:-1
      })
    }else{
      that.setData({
        showOperationPannelIndex:index
      })
    }
  },



//点赞操作函数
  clicklove(e){
    console.log(e)
    var index = e.currentTarget.dataset.index;
    var circleDate = that.data.list[index];
    var loveList = circleDate.loveList;
    var isHaveLove = false;
//先查看判断这条信息的点赞的列表中，有没有用户的opend id，有用户的opend id说明他点过赞了；
    for(var i=0; i<loveList.length; i++){
      if(that.data.userInfo._openid == loveList[i]._openid){
        isHaveLove = true;
        loveList.splice(i,1);//loveList.splice(i,1)这句代码能把LOVELIST列表中的第I个搜索的元素开始删掉1个；起到了，如果用户点赞了，就把他的昵称删掉的作用。
        //调用云函数,这是已点赞了，调云函数里操作里的取消赞操作
        wx.cloud.callFunction({
          name:'updateCircleLove',
          data:{
            type:0,
            circleId:circleDate._id
          }
        })
        .then(res =>{
          console.log('取消赞成功',res)
        })
        .catch(err =>{
          console.log('取消赞失败',err)
        })
        circleDate.isLove = false;
        break
      }
    }

    if(!isHaveLove){
      console.log("that.data.userInfo",that.data.userInfo)
      loveList.push({
        nickName:that.data.userInfo.nickName,
        _openid:that.data.userInfo._openid
      });
      console.log("circleDate._id",circleDate._id)
      // console.log("nikename",nickName)
      // console.log("openid",_openid)
      //调用云函数,这是未点赞了，调云函数里操作里的点赞操作
      wx.cloud.callFunction({
        name:'updateCircleLove',
        data:{
          type:1,
          circleId:circleDate._id,
          nickName:that.data.userInfo.nickName,
        }
      })
      .then(res =>{
        console.log('点赞成功',res)
      })
      .catch(err =>{
        console.log('点赞失败',err)
      })
      circleDate.isLove = true;
    }

    that.setData({
      list:that.data.list,
      showOperationPannelIndex:-1
    })
  },

  //这是评论输入框对应函数
  clickComment(e){
    that.setData({
      currentCircleIndex:e.currentTarget.dataset.index,
      showCommentAdd:true,//当这个是true时，就会弹出输入框
      showOperationPannelIndex:-1,
    })

  },


  bindinput(e){
    that.setData({
      commentContent:e.detail.value
    })
  },
  //当点击输入框，输入框得到焦点闪标时，会弹出系统键盘，键盘会把输入框往上顶出键盘的一样的高度；这个代码感没有起到作用，所以注释掉
  // bindfocus(e){
  //   that.setData({
  //     heightBottom:e.detail.height
  //   })
  // },

  //这是发布评论的函数
  clickSend(e){
    var that = this;
    var circleDate = that.data.list[that.data.currentCircleIndex];//获取当前要点击评论的这条朋友圈信息
    console.log('that.data.currentCircleIndex',that.data.currentCircleIndex);
    var commentList = circleDate.commentList;//获取该条朋友圈的评论信息 发送时要将输入的评论加入到评论列表
    console.log('commentList',commentList);
    var commentData = {};//发送时要将输入框里的评论加入到评论列表
    commentData.nickName = that.data.userInfo.nickName+":";
    commentData.content = that.data.commentContent+":";
    commentData._openid = that.data.userInfo._openid+":";
    commentData.reply = that.data.reply;
    if(that.data.reply.length>0){
      commentData.nickName = that.data.userInfo.nickName;
    }
    console.log("commentdata",commentData)
    // commentList.push(commentData);//将评论输入框里的内容加入到评论列表中


    db.collection('circle').doc(circleDate._id).update({
      data:{
        commentList:_.push(commentData)
      }
    }).then(res=>{
      console.log("commnt add true:",res)
      that.refresh();
    }).catch(err=>{
      console.log("commnt add flase:",err)
    })

    that.setData({
      list:that.data.list,//更新界面内容，刷新
      showCommentAdd:false,//将输入框隐藏
      commentContent:'',//将输入框内容重设为空
      reply:'',//把这个要重制为空，要不然就都是回复某某的评论了
    })
  },

  //刷新数据
  refresh(){
    if(that.data.loading){
      return
    }
    //提示弹窗
    // wx.showLoading({
    //   title: '正在刷新。。。',
    // })
    that.setData({
      refresh:true,

    })
    that.startAnimationInterval();
    that.getList();
  },


  //获得数据库里的数据
  getList(){
    //判断是否已加载，如果没有加载要加载
    if(that.data.loading){
      return
    }else{
      that.setData({
        loading:true
      })
    }
    var currentPage = that.data.page;//定义一下当前请求的页
    //如果是刷新，要设置请求的页码为0，要不然不知道从哪一页开始显示
    if(that.data.refresh){
      currentPage = 0;
    }
    db.collection('circle')
    .orderBy('time','desc')//根据时间，来降序排列
    .skip(currentPage * that.data.pageCount)//小程序设置的分页，第几页就是要跨过多少条信息，因为每页多少条信息是设定了的
    .limit(that.data.pageCount)//每次返回10条数据
    .get()//调得数据成功的方法
    .then(res=>{
      console.log('getlist:',res)
      //判断，如果是新刷话，需要先清空一下列表
      if(that.data.refresh){
        that.setData({
          list:[]
        })
      }
      if(res.data.length>0){
        
        //返回的数据不是空的时候，才把数据加进列表中
        for(var i=0;i<res.data.length;i++){
          res.data[i].isLove = false;
          //现在以用户的_openid做为判断标准，如果已有，就是加载的数据中，点赞列表中，有了这个_openid，那就不让这个点赞了，而是“取消”
          for(var j=0;j<res.data[i].loveList.length;j++){
            if(that.data.userInfo._openid == res.data[i].loveList[j]._openid){
              //如果已经点赞，设置状态isLove true
              res.data[i].isLove = true;
              break
            }

          }
          
          res.data[i].time = that.js_data_time(res.data[i].time);//将时间传进来，并进行转换能2020-01-01 11：11：11的样式
          that.data.list.push(res.data[i])
        }
        that.setData({
          list:that.data.list
        })


        //如果返回的数量等于每页设置显示的数据条数，说明还有可能会有更多的数据
        if(res.data.length == that.data.pageCount){
          that.setData({
            haveMoreData:true
          })
        }else{
          that.setData({
            haveMoreData:false
          })
        }
        that.setData({
          refresh:false,
          loading:false,
          page:currentPage+1,
        })
      }
      that.stopAnimationInterval();
      //关闭掉那个提示加载中的弹窗
      // wx.hideLoading()


    })//接下来是失败的方法
    .catch(error=>{
      console.log('getlist error:',error)
      that.stopAnimationInterval();
      that.setData({
        refresh:false,
        loading:false,
      })
      //关闭掉那个提示加载中的弹窗
      // wx.hideLoading()

    })
  },

  js_data_time(unixtime){
    var date = new Date(unixtime);
    var y = date.getFullYear();
    var m = date.getMonth()+1;
    m = m < 10 ? ('0'+m) : m;
    var d = date.getDate();
    d = d< 10 ? ('0'+d) : d;
    var h = date.getHours();
    h = h< 10 ? ('0'+h) : h;
    var minute = date.getMinutes();
    var second = date.getSeconds();
    minute = minute < 10 ? ('0' + minute) : minute;
    second = second < 10 ? ('0' + second) : second;
    return y + '-' + m + '-' + d + ' ' + h + ':' + minute + ':' + second;//年月日时分秒
  },
  

  //这行代码有问题，要再研究一下再放出来
  
  onShow: function(){

  },

  onReady: function(){
    _animationIindex = 0;
    _AnimationIntervalId = -1;
    this.data.animation = '';

    _animation = wx.createAnimation({
      duration: _ANIMATION_TIME,
      timingFunction:'linear',//定时功能，样式很多"linear","ease","ease-in","ease-in-out","ease-out","step-start","step-end"
      delay: 0,//延时
      transformOrigin:'50% 50% 0'//旋转的终点的位置
    })

    that.refresh();
  },

  // //实现image旋转动画，每次旋转 120 *n度

  rotateAni: function(n){
    _animation.rotate(120 * (n)).step()
    this.setData({
      animation: _animation.export()
    })
  },

  // 开始旋转
  startAnimationInterval: function(){
    var that = this;
    that.rotateAni(++_animationIindex);//进行一次旋转
    _AnimationIntervalId = setInterval(function(){
      that.rotateAni(++_animationIindex);
    },_ANIMATION_TIME);//每间隔_ANIMATION_TIME进行一次旋转
  },

  // 停止旋转
  stopAnimationInterval: function(){
    if(_AnimationIntervalId>0){
      clearInterval(_AnimationIntervalId);
      _AnimationIntervalId = 0;
    }
  },
//页面上拉触底事件的处理函数
  onReachBottom: function(){
    console.log("onReachBottom")
    //判断，如果已加载了，就没事，如果没有加载，就要加载更多
    if(that.data.loading){
      return
    }else{
      that.setData({
        loadMore:true
      })
      //做一个延时加载,3000是延时豪秒
      setTimeout(() => {
        that.getList();
      },3000)

    }

  },

  //这是做点击信息里的评论，可以回复该条评论
  clickCommentItem(e){
    //点击评论列表条目

    //1.获取评论所属的的这条发布信息的index,e.currentTarget.dataset.index这就是鼠标或手旨点到的信息条，可以用这个获取到它的索引
    var circleIndex = e.currentTarget.dataset.index;

    //2.获取该条评论在评论列表中的索引
    var commentIndex = e.currentTarget.dataset.commentindex;

    var circleDate = that.data.list[circleIndex];
    var commentList = circleDate.commentList;
    var commentData = commentList[commentIndex];
    var nickName = commentData.nickName;
    //上面一系列操作，都是为了得到这条评论信息的评论用户的昵称nickName
    that.setData({
      currentCircleIndex:e.currentTarget.dataset.index,
      showCommentAdd:true,//当这个是true时，就会弹出输入框
      showOperationPannelIndex:-1,
      reply:nickName,
    })
  },

  bindTouchStart(e){
    //当触摸屏幕的其他地方时，除了输入框，就会把输入框隐藏掉,这个主要看把indTouchStart定义在哪个模块容器，定在哪个容器，你一点到那个容器就会触发该函数；
    that.setData({
      showCommentAdd:false,//当这个是true时，就会弹出输入框

    })
    if(that.data.touchStartOperation || that.data.touchStartOperationPannel){

    }else{
      that.setData({
        showOperationPannelIndex:-1,
  
      })

    }
  },

  bindTouchStartOperationPannel(e){
    //触摸点赞或评论按扭开始
    that.setData({
      touchStartOperationPannel:true
    })
  },
  bindTouchStartOperation(e){
    //触摸操作按扭开始
    that.setData({
      touchStartOperation:true
    })
  },
  bindTouchEndOperationPannel(e){
    //触摸点赞或评论按扭按扭结束
    that.setData({
      touchStartOperationPannel:false
    })
  },
  bindTouchEndOperation(e){
    //触摸操作按扭结束
    that.setData({
      touchStartOperation:false
    })
  },





})

