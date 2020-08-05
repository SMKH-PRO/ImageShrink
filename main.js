const path = require("path")
const os = require("os")
const url = require("url")
const slash = require("slash")
const {CompressQuality,SavePath,ImageShrink}= require("./constant")
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

ipcMain.on('image:compress',(e,filesPath)=>{
    console.log("event recievedx")
    console.log("ReceivedEVENT=> ",filesPath)
 
   console.log("SavePath=>> ",SavePath)
   console.log("quality=> ",CompressQuality)

   win.webContents.send("Compress:Started",true)
    ImageShrink(filesPath).then(r=>{win.webContents.send("Compress:Completed",r)})
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