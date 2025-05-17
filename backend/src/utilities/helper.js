const fs = require("fs")
const randomStringGenerator = (len) =>{
    const char = "1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
    const legth = char.length
    let random = ""
    for (let i = 0; i <len ; i++){
        const posn =Math.ceil( Math.random() * (legth-1))
        random += char[posn]
    }
    return random
}

const deleteFile = (path)=>{
    if(fs.existsSync(path)){
        fs.unlinkSync(path)
    }
}
module.exports ={
    randomStringGenerator,
    deleteFile,
}