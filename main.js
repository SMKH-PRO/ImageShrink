const path = require("path")
const os = require("os")
const url = require("url")
const slash = require("slash")
const {CompressQuality,SavePath}= require("./constant")
const {app,BrowserWindow,Menu,ipcMain} = require("electron")

let win;

const createWindow=()=>{
    win =new BrowserWindow({width:1000,height:700,  webPreferences: {
        nodeIntegration: true
    }})
    win.loadURL(url.format({
        pathname:path.join(__dirname,"./src/index.html"),
        protocol:'file',
        slashes:true
    }))
    win.on("closed",()=>{
        win=null;
    })
    win.webContents.openDevTools()
}
app.on('ready',createWindow)

ipcMain.on('image',(e,filePath)=>{
    console.log("ReceivedEVENT=> ",filePath)
 
   console.log("SavePath=>> ",SavePath)
   console.log("quality=> ",CompressQuality)
} )
app.on('window-all-closed',()=>{
    if(process.platform !== 'darwin'){
        app.quit()
    }
})

app.on("activate",()=>{
    if(win==null){
        createWindow()
    }
})