// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const{
    type,//是点赞，还是取消赞
    circleId,//当前操作的circle id
    nickName,//昵称

  } = event;
  const wxContext = cloud.getWXContext()
  const db = cloud.database()
  const _ = db.command
  console.log('event',event)
  //这是取消赞的操作
  if(type == 0){
   return db.collection('circle').doc(circleId).update({
      data:{
        loveList:_.pull({
          _openid:wxContext.OPENID,
        })
        
      }
    }).then(res =>{
      return{
        code:200,//成功码提示200，这个可以自己设置
        errMsg:'取消赞成功'
      }

    }).catch(res =>{
      return{
        code:300,//失败码提示300，这个可以自己设置
        errMsg:'取消赞失败'
      }
    })
  }else if(type == 1){
    return db.collection('circle').doc(circleId).update({
       data:{
         loveList:_.push({
          _openid:wxContext.OPENID,
          nickName:nickName
         })
         
       }
     }).then(res =>{
       return{
         code:200,//成功码提示200，这个可以自己设置
         errMsg:'点赞成功'
       }
 
     }).catch(res =>{
       return{
         code:300,//失败码提示300，这个可以自己设置
         errMsg:'点赞失败'
       }
     })
   }

  // return {
  //   event,
  //   openid: wxContext.OPENID,
  //   appid: wxContext.APPID,
  //   unionid: wxContext.UNIONID,
  // }
}