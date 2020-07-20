const {app,BrowserWindow,Menu,ipcMain} = require("electron")
const path = require("path")
const url = require("url")
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

ipcMain.on('image:compress',(e,d)=>{
    console.log("ReceivedEVENT=> ",d)
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