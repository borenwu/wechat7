const koa = require('koa')
const sha1 = require('sha1')
const config = {
    wechat: {
        appID: 'wxfd4b525e05ef73ad',
        appSecret: '1e775bd0bc582e85ed2df3b9b9d09945',
        token: 'taleswu'
    }
}

const app = new koa()

//  加载认证中间件
// ctx是koa应用上下文
// next是串联中间件的钩子函数
app.use(async (ctx, next) => {
    const { signature, timestamp, nonce, echostr } = ctx.query
    const token = config.wechat.token
    let str = [token, timestamp, nonce].sort().join('')
    const sha = sha1(str)

    if (sha === signature) {
        ctx.body = echostr
    } else {
        ctx.body = 'wrong'
    }
})

app.listen(3000)
console.log('listen ' + 3000)