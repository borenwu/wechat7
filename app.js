const koa = require('koa')
const wechat = require('./wechat-lib/middleware')
const config = require('./config/config')
const { reply } = require('./wechat/reply')
const{initSchemas,connect} = require('./app/database/init')


;(async ()=>{
    await connect(config.db)
    initSchemas()

    // const {test} = require('./wechat/index')
    // await test()

    const app = new koa()
    app.use(wechat(config.wechat, reply))

    app.listen(config.port)
    console.log('listen ' + 3008)
})()
