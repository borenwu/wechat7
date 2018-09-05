const request = require('request-promise')
const base = 'https://api.weixin.qq.com/cgi-bin/'
const fs = require('fs')


const api = {
    accessToken: base + 'token?grant_type=client_credential',
    temporary:{
        upload:base + 'media/upload?'
    },
    permanent:{
        uploadNews: base + 'material/add_news?',
        uploadNewsPic: base + 'material/uploadimg?',
        upload: base + 'material/add_material?',

    }
}

module.exports = class Wechat {
    constructor(ops) {
        this.ops = Object.assign({}, ops)
        this.appID = ops.appID
        this.appSecret = ops.appSecret
        this.getAccessToken = ops.getAccessToken
        this.saveAccessToken = ops.saveAccessToken

        this.fetchAccessToken()
    }

    async request(options) {
        options = Object.assign({}, options, {json: true})

        try {
            const res = await request(options)

            return res
        } catch (err) {
            console.log(err)
        }
    }

    // 1. 首先检查数据库里的 token 是否过期
    // 2. 过期则刷新
    // 3. token 入库
    async fetchAccessToken() {
        let data = await this.getAccessToken()

        if (!this.isValidToken(data)) {
            data = await this.updateAccessToken()
        }

        await this.saveAccessToken(data)

        return data
    }

    async updateAccessToken() {
        const url = `${api.accessToken}&appid=${this.appID}&secret=${this.appSecret}`
        const data = await this.request({url})

        const now = new Date().getTime()
        const expiresIn = now + (data.expires_in - 20) * 1000
        data.expires_in = expiresIn

        return data
    }

    isValidToken(data) {
        if (!data || !data.expires_in) {
            return false
        }

        const expiresIn = data.expires_in
        const now = new Date().getTime()

        if (now < expiresIn) {
            return true
        } else {
            return false
        }
    }

    uploadMaterial(token,type,material,permanet = false){
        console.log('permanet: '+ permanet)
        console.log(permanet)
        let form = {}
        let url = api.temporary.upload

        // 永久素材
        if(permanet){
            url = api.permanent.upload

            form = Object.assign(form,permanet)
        }

        if(type === 'pic'){
            url = api.permanent.uploadNewsPic
        }

        if(type === 'news'){
            url = api.permanent.uploadNews
            form = material
        }else{
            form.media = fs.createReadStream(material)
        }


        let uploadUrl = `${url}access_token=${token}`

        if(!permanet){
            uploadUrl += `&type=${type}`
        }else {
            if(type !== 'news'){
                form.access_token = token
            }
        }
        console.log(uploadUrl)
        const options = {
            method:'POST',
            url:uploadUrl,
            json:true,
            formData:form,
        }

        if(type ==='news'){
            options.body = form
        }else{
            options.formData = form
        }

        return options
    }

    async handle(operation,...args){
        const tokenData = await this.fetchAccessToken()
        const options = this[operation](tokenData.access_token,...args)
        const data = this.request(options)

        return data
    }
}