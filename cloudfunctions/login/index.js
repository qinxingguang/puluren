// 云函数模板
// 部署：在 cloud-functions/login 文件夹右击选择 “上传并部署”

const cloud = require('wx-server-sdk')

// 初始化 cloud
cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
})
// const db = cloud.databases()



/**
 * 这个示例将经自动鉴权过的小程序用户 openid 返回给小程序端
 * 
 * event 参数包含小程序端调用传入的 data
 * 
 */
exports.main = async (event, context) => {
  console.log(event)
  console.log(context)

  // 可执行其他自定义逻辑
  // console.log 的内容可以在云开发云函数调用日志查看

  // 获取 WX Context (微信调用上下文)，包括 OPENID、APPID、及 UNIONID（需满足 UNIONID 获取条件）等信息
  // const wxContext = cloud.getWXContext()

  // return {
  //   event,
  //   openid: wxContext.OPENID,
  //   appid: wxContext.APPID,
  //   unionid: wxContext.UNIONID,
  //   env: wxContext.ENV,
  // }

  let { OPENID,APPID,UNIONID } = cloud.getWXContext()
  return{
    OPENID,
    APPID,
    UNIONID,
    NICKNAME,
  }




  // const{
  //   nickName,
  //   avatarUrl,
  //   gender,
  // } = event;


  // //查询用户是否存在，如果存在就返回查询的这个OPEND ID ，如果不存在，就把他加进我们的数据库的USER 列表中，以后调用
  // return db.collection('user').where({
  //   _openid:wxContext.OPENID
  // }).get().then(res =>{
  //   console.log("user have _openid",res)
  //   if(res.data.length >0){
  //     //如果用户的存在个数大于0，说明用户存在，将用户信息返回；
  //     return{
  //       code:200,
  //       errMsg:'用户已经存在',
  //       userInfo:res.data[0]
  //     }
  //   }else{
  //     //用户如果不存在，将用户添加进数据库的USER列表
  //     return db.collection('user').add({
  //       data:{
  //         _openid:wxContext.OPENID,
  //         nickName:nickName,
  //         avatarUrl:avatarUrl,
  //         gender:gender,
  //         time:new Date()
  //       }
  //     }).then(res =>{
  //       console.log("user no _openid",res)
  //       return{
  //         code:201,
  //         errMsg:'用户注册成功',
  //         _openid:wxContext.OPENID
  //       }
  //     })
  //   }
  // })


  
}

