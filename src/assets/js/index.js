const fs = window.require('fs');
const {ipcRenderer, shell} = require("electron")
const lottie = require("lottie-web")
const byteSize = require('byte-size')
const {LoadLottie, CompressQuality, totalCompress, NodeLocalStorage,totalMBSaved} = require('./assets/js/constant.js')
const SELECT = (target) => document.querySelector(`${target}`)
const imgUploadInput = SELECT("#imgUploadInput")
const warning = SELECT("#warning")
var filess = []

const showFile = (filePath) => {
    shell.showItemInFolder(filePath)
}

const openFile = (filePath) => {
    shell.openPath(filePath)

}


const CheckTotalCompress = () => {

    let tC = totalCompress()


    if (tC) {
        let totalCompressEL= SELECT("#totalCompress")
        let tCtitle=`You've Compressed Total <b>${tC} Images</b>  😍`
        totalCompressEL.title= tCtitle
        totalCompressEL.setAttribute("data-original-title",tCtitle)
        totalCompressEL.innerHTML=`<b><i class="fas fa-images"></i> ${tC>1?tC-1+"+":tC}  </b>`
          
        let shouldNeverAsk = NodeLocalStorage.getItem("NeverAsk")
        if (! shouldNeverAsk && tC>50 && !isNaN(parseInt(tC))) {

            swal("Wohoooo !!!! ", `You've Compressed  50+ Images \n Looks Like You're Having Great Experience? Please give us a star on github your appreciation will motivate us to create more softwares like this`, {
                icon: 'success',
                buttons: {
                    cancel: "Later",
                    never: "Never Ask",
                    confirm: "Rate Now"
                }
            }).then((Answer) => {
                if (Answer == "never") {
                    NodeLocalStorage.setItem("NeverAsk", true)

                } else if (Answer) {
                    NodeLocalStorage.setItem("NeverAsk", true)

                    shell.openExternal("https://github.com/SMKH-PRO/ImageShrink")
                }
            })
        }
    }
}



const CheckTotalMBsSaved = () => {

    let tS= byteSize(totalMBSaved())


    if (tS) {
        let totalMBSavedEL= SELECT("#totalMBSaved")
        let tStitle=`You saved total ${tS} disk space by shrinking ${totalCompress()} Images 😮`
        totalMBSavedEL.title= tStitle
        totalMBSavedEL.setAttribute("data-original-title",tStitle)
        totalMBSavedEL.innerHTML=`<b><i class="fas fa-save"></i> ${tS>1?tS-1+"+":tS}  </b>`

       
    }
}
CheckTotalMBsSaved()

 CheckTotalCompress()
const getFileInfo = (filePath) => fs.statSync(filePath)

const setImgBase64 = (imgEl, file) => {

    const ReadAbleFile = fs.readFileSync(file.path).toString('base64')
    let src = "data:image/png;base64," + ReadAbleFile

    imgEl.setAttribute("src", src)
    // El.src=src

    // //console.log(`FIXED IMAGE # ${imgEl} `,ReadAbleFile)

}
const renderImages = () => {

    const files = filess && Array.from(filess);
    const defaultImg = SELECT("#defaultImg");
    const addImgBtn = SELECT("#addImgBtn");
    let displayImages = SELECT("#displayImages");

    imgUploadInput.value = ""
    let numOfFiles = files.length

    if (numOfFiles) {
        SELECT("#compressContainer").style.visibility = "visible"
        imgUploadInput.disabled = true;


        if (numOfFiles > 49) {
            warning.innerHTML = `<b style="font-weight:bold; color:red;">WARNING:</b><br/> 
                               <span style="padding:10px;text-align:left">
                               Your processor/computer may not be able to process ${numOfFiles} Images at once, We recommend selecting less than 50 Images at once for better performance.
                                </span>
                                `;
        }
        addImgBtn.innerHTML = `LOADING.....`
        if (defaultImg && numOfFiles > 0) 
            defaultImg.style.display = "none";
        


        setTimeout(() => {

            if (files && numOfFiles > 0) {
                displayImages.innerHTML = ""
                files ?. forEach((file, i) => {
                    let divEl = document.createElement("div")
                    let imgEl = document.createElement("img")
                    imgEl.src = file.path

                    imgEl.id = `PNG_${i}_${
                        btoa(file.name)
                    }`
                    divEl.className = "displayedImg"

                    imgEl.setAttribute("onclick", `document.getElementById('ImageView').src=this.src;document.getElementById('ImageView').title='Name:<br>${
                        file.name
                    },<br/>Path:<br/> ${
                        file.path
                    }'; $("[title]").tooltip();`)

                    const a = document.createElement("a")
                    a.appendChild(imgEl)

                    a.setAttribute("href", `#ViewImage`)
                    a.className = "perfundo__link"

                    const delBtn = document.createElement("button")
                    delBtn.setAttribute("class", "btn-floating btn-sm btn-danger delBTN")
                    delBtn.innerHTML = `<i class="fas fa-trash"></i>`
                    delBtn.title = `Remove This Image From Selection.`
                    delBtn.onclick = () => {
                        filess.splice(i, 1)
                        // console.log("DELETED=> ",i)
                        $(".tooltip").remove() // Sometimes tooltip stays even after image is deleted and it get stuck there.
                        renderImages()

                    }
                     divEl.appendChild(a)
                    divEl.appendChild(delBtn)

                    divEl.className = "displayedImg perfundo"


                    displayImages.appendChild(divEl)


                    if (i == files.length - 1) {
                        warning.innerHTML = "";
                        updateNumOfImages();
                    }
                    imgEl.onerror = () => setImgBase64(imgEl, file) // converting to base64 only on error, this make performance better and help us avoid freezes. (before this i was converting all images to base64 wither errored or not that was making computer freez)
                })
                addImgBtn.innerHTML = "+ Add MORE"
                imgUploadInput.disabled = false
                findDuplicate()
                $("[title]").tooltip();

            }

        }, 0);
    } else { // reset
        SELECT("#compressContainer").style.visibility = "hidden"
        imgUploadInput.disabled = false;
        addImgBtn.innerHTML = `ADD IMAGES`
        defaultImg.style.display = "block";
        displayImages.innerHTML = ""
        warning.innerHTML = "";
    }
}

const hasDuplicate = () => {
    let FileNames = [... filess.map(f => f.name)]
    let duplicateFiles = filess.filter((file, i) => FileNames.indexOf(file.name) !== i)

    return {FileNames, duplicateFiles, FilesLength: duplicateFiles.length}
}
const findDuplicate = (forceAlert = false) => {
    if (filess && filess.length) {
        let {FileNames} = hasDuplicate()
        let {duplicateFiles} = hasDuplicate()
        if (duplicateFiles.length) { // alert(``)

            let countFiles = duplicateFiles.length
            let fileStr = countFiles > 1 ? "files" : "file"
            // console.log("result from removeDup=> ", filess, " \n dupfilename=> ", FileNames, " \n dupfiles=> ", duplicateFiles)

            let shouldNotAsk = localStorage.getItem("NeverAsk")
            let msg = `You've selected ${
                countFiles > 1 ? countFiles : "a"
            } duplicate ${fileStr}`
            let duplInner = `<span style='color:red'> 
                               <b>WARNING</b>
                               <p style="margin:0px;line-height:1">  ${msg} .  <button onClick="findDuplicate(true)" type="button"  class="btn btn-danger btn-rounded  btn-sm">REMOVE DUPLICATE</button></p>
                              </span>`
            if (! shouldNotAsk || forceAlert) {
                swal("DUPLICATE FILES DETECTED", `${msg},\nThis warning indicates that you've selected multiple files with same name,\n\nWould you like to un-select duplicate ${fileStr} having same name? `, {
                    icon: 'warning',
                    dangerMode: true,
                    buttons: {
                        cancel: true,
                        ...forceAlert ? {} : {
                            never: "Never Ask"
                        },
                        confirm: "Yes !"
                    }
                }).then((Yes) => {
                    if (Yes == "never") {
                        localStorage.setItem("NeverAsk", true)
                        warning.innerHTML = duplInner

                    } else if (Yes) {
                        removeDuplicates()

                    }
                })
            } else {
                warning.innerHTML = duplInner

            }
        }

    }
}


const removeDuplicates = (showAlert = true) => {

    let {FileNames} = hasDuplicate()
    let {duplicateFiles} = hasDuplicate()
    let duplicateFileNames = duplicateFiles.map(f => f.name)
    let uniqueFiles = filess.filter((file) => ! duplicateFileNames.includes(file.name))
    filess = [
        ... uniqueFiles,
        ...duplicateFiles
    ]

    // console.log("result from removeDup=> ", filess, " \n filename=> ", FileNames, " \n dupfiles=> ", duplicateFiles, "\n unique fil=> ", uniqueFiles)
    renderImages()
    if (showAlert) {
        swal("DONE", "Removed Duplicate Files ", {icon: 'success'}).then(() => {
            renderImages()
            setTimeout(() => {
                let hasDuplicateFiles = hasDuplicate().FilesLength
                if (hasDuplicate) { // Re-check if any duplicate files left after the current removal process.
                    removeDuplicates(false) // Re-run the function to remove remaining. false will make sure that this alert does not show and the loop does not continue.
                }renderImages()

            }, 10);

        })
    }
}


const updateNumOfImages = () => {
    warning.innerHTML = `
                <span style="text-align:left; color:green">
                        Selected ${
        filess.length
    } Image(s)
                 </span>
                 `;
}


LoadLottie()

const setLoadingText = (txt) => SELECT("#loadingMSG").innerHTML = txt;

const setLoading = (isLoading = true, isProcessing = false) => {
    const parentDiv = SELECT("#loadingDiv")
    SELECT("#loading").innerHTML = ""

    if (isLoading) {
        const animPath = isProcessing ? "./assets/anim/processing.json" : "./assets/anim/compressing.json"
        const txt = isProcessing ? "<b>Almost Done, Processing....</b>" : `
     <b style="color:red">COMPRESSING IMAGE(s)</b>
     <p style="font-size:15px">This may take a few minutes depending on number of images you've selected & also your computer's speed and capability.</p>
    `
        setLoadingText(txt)
        LoadLottie(animPath)
        parentDiv.style.display = "block"
    } else {
        parentDiv.style.display = "none"

    }
}

const compressNow = () => {
    let paths = filess.map(f => f.path)
    setLoading()
    ipcRenderer.send('image:compress', paths)
    // ipcRenderer.send("image",filess ) Cant pass arrray or object due to some errors.
}

const openSettings = () => {
    ipcRenderer.send('openSettings')
}

ipcRenderer.on("Compress:Completed", async (e, d) => {
    let totalCompressedUntilNow= totalCompress()
     let totalCompressNow = parseInt(totalCompressedUntilNow)+parseInt(d.length)
   
    let SuccessList = SELECT("#successList")
    SuccessList.innerHTML = ""
    setLoading(true, true)
    // console.log("DATA RECEIVED ON IMG HANDILIGN=>> ",d)

    let filesWithInfo = await Promise.all(d.map(async (d, i) => {

        let beforeShrink = await getFileInfo(d ?. sourcePath)
        let afterShrink = await getFileInfo(d ?. destinationPath)

        return {
            ...d,
            beforeShrink,
            afterShrink
        }
    }))

    // console.log("FilesWithINfo",filesWithInfo)

    filesWithInfo.forEach(f => {

        let destinationPath = f ?. destinationPath
        let sourcePath = f ?. sourcePath


        let name = destinationPath.substring(destinationPath.lastIndexOf('/') + 1)

        let sizeAfterShrink = f.afterShrink.size
        let sizeBeforeShrink = f.beforeShrink.size
        let sizeShrinked = sizeBeforeShrink - sizeAfterShrink

        let sizeAfterShrinkPretty = byteSize(sizeAfterShrink)
        let sizeBeforeShrinkPretty = byteSize(sizeBeforeShrink)
        let sizeShrinkedPretty = byteSize(sizeShrinked)

        let percentReduced = Math.round((sizeShrinked / sizeBeforeShrink) * 100)

        // console.log("BeforeShrink",f.beforeShrink.size," sourcePath=> ",f.sourcePath)


        SuccessList.innerHTML += ` <li class="list-group-item">
                                           <div style="display:flex;">
                                               <div class="avatar-container p-${percentReduced}">
                                                  <img data-tip="${destinationPath}" title="${destinationPath}" src="${destinationPath}"  alt="" class="avatar">
                                                  <div class="info js-active"><div class="info-inner">-${percentReduced}%</div></div>
                                               </div>                      
                                               <div>  
                                                   <p  title="${name}" class="mb-0"><b>${
            name.length > 35 ? name.substring(0, 10) + "...." + name.substring(name.length - 16, name.length) : name
        }</b> </p>
                                                   <br>
                                                   <p data-html="true" title="Original Size: ${sizeBeforeShrinkPretty} ,<br/>After Shrink: ${sizeAfterShrinkPretty}">
                                                        <b>Size:</b> 
                                                        <span style="color:red;text-decoration-line:line-through">${sizeBeforeShrinkPretty}</span>
                                                        ${sizeAfterShrinkPretty}
                                                    </p>
                                               
                                                    <p data-html="true" title="Reduced ${percentReduced}% .">
                                                       <b>Shrinked:</b> 
                                                        <span style="color:green">${sizeShrinkedPretty}</span>
                                                    </p>
                                                    ${
            percentReduced < 1 ? `<p  style="color:red" title="This image was already compressed so it cannot be optimized more.">Please do not compress images that are already optimized.</p>` : ''
        }

                                               </div>
                                               
                                          </div>
                                          <div style="display:flex; justify-content:flex-end">
                                            <div >
                                                <span  onClick="openFile('${sourcePath}')" title="Open Original Image" class="btn-floating btn-sm btn-default"><i class="fas fa-file-image"></i></span>
                                                <span onClick="openFile('${destinationPath}')"  title="Open Shrinked Image" class="btn-floating btn-primary"><i class="fas fa-image"></i></span>
                                                <span onClick="showFile('${destinationPath}')" title="Show File Folder" class="btn-floating  btn-secondary"><i class="fas fa-folder"></i></span>


                                                

                                              
                                             </div>
                                          </div>
                                   </li>

                                   `
    })
  
    setTimeout(() => {

        SELECT("#SucessInfo").innerHTML = `Shrinked ${
            filesWithInfo.length
        } Images with <b  onclick="openSettings()" style="cursor:pointer" title="click to change settings">Compress Quality: <b title="Compress Quality Can Be Chaneged Anytime From Settings, Click to Change."> ${
            CompressQuality()
        } </b> </b>`
        setLoading(false)
        filess = []
        renderImages()
        $('#SuccessModal').modal()
        // Tooltips Initialization
        $("[title]").tooltip();
        if(!isNaN(parseInt(totalCompressNow))){
            NodeLocalStorage.setItem("totalCompress",totalCompressNow)
            }
            CheckTotalCompress()
            CountMBSaved(filesWithInfo)

    }, 100);
})

CountMBSaved=(ArrFiles)=>{

  let numbers=  ArrFiles.map(f=>parseFloat(f.afterShrink.size)).filter(d=>d&&!isNaN(d))
   let sumOfNumbers= numbers.reduce((a,c)=>parseFloat(a+c))

   if(sumOfNumbers){
     let totalMBs= parseFloat( totalMBSaved())
     NodeLocalStorage.setItem("totalMBSaved",totalMBs+sumOfNumbers)
   }

   CheckTotalMBsSaved()

}


ipcRenderer.on("Compress:Error", (e, d) => {
    setLoading(false)
    warning.innerHTML = `<b style="color:red">Err: ${
        (d ?. message) ? d ?. message : "An unknown error occurred !"
    }</b>`

})

CompressBtn.addEventListener("click", compressNow)

imgUploadInput.addEventListener("change", (e) => {
    let SelectedFiles = e.target.files

    if (SelectedFiles && SelectedFiles.length) {
        filess = [
            ... filess,
            ... SelectedFiles
        ]
        renderImages()
    }
})
// SELECT("#imgUploadInput").addEventListener("drop",(e)=>console.log("DROP=> ",e))
$("[title]").tooltip();
