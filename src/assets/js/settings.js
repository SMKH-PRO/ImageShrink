const {ipcRenderer, shell, remote} = window.require("electron")

const {
    SavePath,
    CompressQuality,
    NodeLocalStorage,
    defaultPath,
    defaultQuality,
    LoadLottie
} = require('./assets/js/constant.js')
const {dialog} = remote


const folderPathEL = document.getElementById("folderPath")
const qualityInputEl = document.getElementById("qualityInput")
const qualityDisplayEl =document.getElementById("qualityDisplay")
const resetBTNEL = document.getElementById("resetBTN")
const warning = document.getElementById("warning")


LoadLottie('./assets/anim/settingsLoad.json', "settAnim", false)
const isResetPossible = () => NodeLocalStorage.getItem("SavePath") !== defaultPath || NodeLocalStorage.getItem("CompressQuality") !== defaultQuality

const updateResetState = () => {
    if (isResetPossible()) {
        resetBTNEL.style.display = 'block'
        resetBTNEL.onclick = () => resetToDefault()
    } else {
        resetBTNEL.style.display = 'none'
    }
}


updateFolderLocation = () => {
    let fullPath =SavePath()
    let shortPath = fullPath.substring(0, 26) + "...." + fullPath.substring(fullPath.length - 26, fullPath.length)
    let UISafePath = fullPath.length > 55 ? shortPath : fullPath

    folderPathEL.innerHTML = UISafePath
    folderPathEL.title = "Click to open: "+fullPath
    window.onready
    $(() => {
        $('[title]').tooltip()
    })

    if (updateResetState) 
        updateResetState();
 //alert(SavePath())   
}
updateFolderLocation()

updateQuality = () => {
    let q= CompressQuality();
    qualityInputEl.value = q
    qualityDisplayEl.innerHTML= q
    if (updateResetState) 
        updateResetState();
    
}
updateQuality()

const OpenDownloadFolder = () => {


    shell.openPath(SavePath())
}


changeFolderDialog = async () => {
    let selectedDir = await dialog.showOpenDialog({properties: ['openDirectory']})
    let newPath = selectedDir ?. filePaths ?. [0]
    console.log(newPath)
    NodeLocalStorage.setItem("SavePath", newPath)
    console.log("Done")

    let isSucces = CompressQuality() == newPath
    if (isSucces) {
        updateFolderLocation()
        warning.innerHTML = `You changed default directory to: ${newPath}`

    } else {
        console.log("else", isSucces)
    }

}


const resetToDefault = () => {
    if (isResetPossible()) {
        NodeLocalStorage.removeItem("SavePath")
        NodeLocalStorage.removeItem("CompressQuality")

        updateQuality()
        updateFolderLocation()
        updateResetState()
        warning.innerHTML = `SUCCESFULLY RESET TO DEFAULT SETTINGS`
        

    } else {
        updateResetState()
    }
}
 qualityInputEl.addEventListener('change', e => {
    let newQuality = e.target.value
    qualityInputEl.value = newQuality
    NodeLocalStorage.setItem("CompressQuality", newQuality)


    let isSucces = NodeLocalStorage.getItem("CompressQuality") == newQuality

    if (isSucces) {   
        updateQuality(NodeLocalStorage.getItem("CompressQuality"))
        warning.innerHTML = `Your New Compress Quality Is ${newQuality}`
    }
})
