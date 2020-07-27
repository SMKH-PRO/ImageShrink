const path = require("path")
const os = require("os")

const defaultPath=path.join(os.homedir(),"ImageShrink")
const userDefinedPath = localStorage.getItem("SavePath")
exports.SavePath=userDefinedPath?userDefinedPath:defaultPath

const defaultQuality= 50
const userDefinedQuality = localStorage.getItem("CompressQuality")
exports.CompressQuality= userDefinedQuality?userDefinedQuality:defaultQuality





