const {Storage} = require('@google-cloud/storage')
const path = require('path')
require('dotenv').config()

//path for the json file
const keyPath = path.join(__dirname, 'omega-ether-464909-e7-ade2562df3eb.json')

//initialize the storage

const storage = new Storage({
    keyFilename:keyPath
})

const bucketName = process.env.BUCKET_NAME
const bucket  = storage.bucket(bucketName)

module.exports = {
    storage,
    bucket,
    bucketName
}

