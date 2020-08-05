const path = require("path")
const slash = require("slash")
const os = require("os")
const imagemin = require('imagemin');
const imageminJpegtran = require('imagemin-jpegtran');
const imageminPngquant = require('imagemin-pngquant');
const lottie = require("lottie-web")
const {LocalStorage} = require('node-localstorage');
let localStorage = new LocalStorage('./userSettings');

const defaultPath = path.join(os.homedir(), "Pictures","ImageShrink")
const userDefinedPath = localStorage.getItem("SavePath")
exports.SavePath = userDefinedPath && typeof userDefinedPath == "string" ? userDefinedPath : defaultPath

const defaultQuality = 50
const userDefinedQuality = localStorage.getItem("CompressQuality")
exports.CompressQuality = userDefinedQuality && !isNaN(userDefinedPath) ? userDefinedQuality : defaultQuality


exports.ImageShrink =  (filesPath) => {
    let CQ = this.CompressQuality
    let pngCQ = CQ / 100
    let SP = this.SavePath
    return new Promise((res,rej)=>{
         
        if(Array.isArray(filesPath)&&filesPath.length){
            let paths= filesPath.map(p=>slash(p))
 imagemin(paths, {
            destination: SP,
            plugins: [
                imageminJpegtran(
                    {quality: CQ}
                ),
                imageminPngquant(
                    {
                        quality: [pngCQ, pngCQ]
                    }
                )
            ]
        }).then(c=>res(c)).catch(rej)
    }
    else{
        rej({code:'Invalid_Props',message:"Unknown Error Occurred, Hint: Props must be an array of file paths."})
    }
})
    

     
}
