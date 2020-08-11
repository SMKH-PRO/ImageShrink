const path = require("path")
const os = require("os")
const url = require("url")
const slash = require("slash")
const {CompressQuality, SavePath, ImageShrink} = require("./src/assets/js/constant")
const {app, BrowserWindow, Menu, ipcMain} = require("electron")

process.env.NODE_ENV = "dev"

const isMac = process.platform == 'darwin'
const isDev = process.env.NODE_ENV == "production"


let win;
let settingsWindow;

const createSettingsWindow = () => {

    if (!settingsWindow) {// If not already opened
              settingsWindow = new BrowserWindow({
                  width: 700,
                  height: 500,
                  webPreferences: {
                      nodeIntegration: true
                  }
                  
              })
              settingsWindow.loadURL(url.format({
                  pathname: path.join(__dirname, "./src/setting.html"),
                  protocol: 'file',
                  slashes: true,
                  resizable: !isDev
              }))
              settingsWindow.on("closed", () => {
                settingsWindow = null;
              })
              //settingsWindow.webContents.openDevTools()

    } 
    else {
        //Handle Behaviour When Opening again from the menu.
        console.log("Dont Open another instance of about window.")

        settingsWindow.restore()

    }
}

const createWindow = () => {
    win = new BrowserWindow({
        width: 1000,
        height: 700,
        webPreferences: {
            nodeIntegration: true
        }
    })
    win.loadURL(url.format({
        pathname: path.join(__dirname, "./src/index.html"),
        protocol: 'file',
        slashes: true
    }))
    win.on("closed", () => {
        win = null;
    })
    const mainMenu = Menu.buildFromTemplate(menu)
    Menu.setApplicationMenu(mainMenu)

    // win.webContents.openDevTools()
}
app.on('ready', createWindow)
ipcMain.on('openSettings', ()=>createSettingsWindow())
ipcMain.on('image:compress', (e, filesPath) => {
    // console.log("event recievedx")
    // console.log("ReceivedEVENT=> ",filesPath)

    // console.log("SavePath=>> ",SavePath)
    // console.log("quality=> ",CompressQuality)

    win.webContents.send("Compress:Started", true)
    ImageShrink(filesPath)
      .then(r => win.webContents.send("Compress:Completed", r))
      .catch(e=>win.webContents.send("Compress:Error", e))
})
app.on('window-all-closed', () => {
    if (! isMac) {
        app.quit()
    }
})

app.on("activate", () => {
    if (win == null) {
        createWindow()
    }
})


const menu = [
    ... isMac ? [
        {
            role: 'appMenu'
        }
    ] : [], {
        label: 'File',
        submenu: [
            {
                label: 'Settings',
                click: createSettingsWindow
            }, {
                role: 'close'
            }


        ]
    },

    // ... isDev ? [
        {
            label: "Developer",
            submenu: [
                {
                    role: 'reload'
                },
                {
                    role: 'forcereload'
                },
                {
                    role: 'reload'
                },
                {
                    type: 'separator'
                }, {
                    role: 'toggledevtools'
                },


            ]
        }
    // ] : []
]
