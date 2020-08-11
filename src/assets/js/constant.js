const {app, remote, shell} = require("electron")
const path = require("path")
const slash = require("slash")
const os = require("os")
const imagemin = require('imagemin');
const imageminJpegtran = require('imagemin-jpegtran');
const imageminPngquant = require('imagemin-pngquant');
const lottie = require("lottie-web")
const {LocalStorage} = require('node-localstorage');

const userDataPath = (app ?. getPath('userData')) ? app ?. getPath('userData') : remote ?. app ?. getPath('userData') // app does not work directly on local JS files so we using remote for local files. App will be used directly when constants are imported from nodejs and indirectly via remote when imported from a local JS file.
let defaultPath = userDataPath && path.join(userDataPath, "Settings")
const localStorage = new LocalStorage(defaultPath);
exports.NodeLocalStorage = localStorage

exports.totalCompress = () => {
    let totalCompress = localStorage.getItem("totalCompress")
    return totalCompress ? totalCompress : 0
} // number of total images compressed.
exports.totalMBSaved = () => {
    let totalMBSaved = localStorage.getItem("totalMBSaved")
    return totalMBSaved ? totalMBSaved : 0
} // nu
exports.defaultPath = path.join(os.homedir(), "Pictures", "ImageShrink")
const userDefinedPath = () => localStorage.getItem("SavePath")
exports.SavePath = () => userDefinedPath() && typeof userDefinedPath() == "string" ? userDefinedPath() : this.defaultPath
exports.defaultQuality = 50
const userDefinedQuality = () => localStorage.getItem("CompressQuality")
exports.CompressQuality = () => userDefinedQuality() && !isNaN(userDefinedPath()) ? userDefinedQuality() : this.defaultQuality

exports.ImageShrink = async (filesPath) => {
    let CQ = this.CompressQuality()
    let pngCQ = CQ / 100
    let SP = this.SavePath()
    return new Promise((res, rej) => {

        if (Array.isArray(filesPath) && filesPath.length) {
            let paths = filesPath.map(p => slash(p))
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
            }).then(c => res(c)).catch(rej)
        } else {
            rej({code: 'Invalid_Props', message: "Unknown Error Occurred, Hint: Props must be an array of file paths."})
        }
    })


}


exports.LoadLottie = (path = "./assets/anim/compressing.json", id = "loading", loop = true, autoplay = true) => {
    let container = document.getElementById(`${id}`)
    container.innerHTML = "" // First Clear The Contianer
    lottie.loadAnimation({
        container, // the dom element that will contain the animation
        renderer: 'svg',
        loop,
        autoplay,
        path,
        // the path to the animation json
        // rendererSettings: {
        //     preserveAspectRatio: 'xMidYMid meet'
        // }
    });
}
