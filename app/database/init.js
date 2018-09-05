const mongoose = require('mongoose')
const {resolve} = require('path')
const glob = require('glob')

mongoose.Promise = global.Promise

exports.initSchemas = () =>{
    glob.sync(resolve(__dirname,'./schema','**/*.js'))
        .forEach(require)
}

exports.connect = (db) =>{
    return new Promise((resolve) =>{
        mongoose.connect(db)
        mongoose.connection.on('dosconnect',() =>{
            console.log('disconnect')
        })
        mongoose.connection.on('error', err =>{
            console.log(err)
        })
        mongoose.connection.on('open',() =>{
            resolve()
            console.log('connected')
        })
    })
}