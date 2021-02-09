// 云函数入口文件
const cloud = require('wx-server-sdk')
//这行是SDK的初始化，必需要有的
cloud.init()
let db = cloud.database();
data:{
  headline:'';
  then:'';
  jingje:'';
  content:''
}
// 云函数入口函数
exports.main = async (event, context) => {
  return await db.collection('wuda').get(





  )

  // const wxContext = cloud.getWXContext()

  // return {
  //   event,
  //   openid: wxContext.OPENID,
  //   appid: wxContext.APPID,
  //   unionid: wxContext.UNIONID,
  // }
}