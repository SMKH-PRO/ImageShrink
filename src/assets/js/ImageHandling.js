const fs = window.require('fs');
const {ipcRenderer,shell} = require("electron")
const lottie = require("lottie-web")
const byteSize = require('byte-size')

const SELECT = (target) => document.querySelector(`${target}`)
const imgUploadInput = SELECT("#imgUploadInput")
const warning = SELECT("#warning")
var filess = []

const showFile=(filePath)=>{
    shell.showItemInFolder(filePath)
}

const openFile=(filePath)=>{
    shell.openPath(filePath)
    
}
const getFileInfo=(filePath)=>fs.statSync(filePath)

const setImgBase64 = (imgEl, file) => {

    const ReadAbleFile = fs.readFileSync(file.path).toString('base64')
    let src = "data:image/png;base64," + ReadAbleFile

    imgEl.setAttribute("src", src)
    // El.src=src

    // console.log(`FIXED IMAGE # ${imgEl} `,ReadAbleFile)

}
const renderImages = () => {
    const files = filess && Array.from(filess);
    const defaultImg = SELECT("#defaultImg");
    const addImgBtn = SELECT("#addImgBtn");
    let displayImages = SELECT("#displayImages");

    imgUploadInput.value=""
    let numOfFiles = files.length

    if (numOfFiles ) {
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
        defaultImg.style.display="none";
    


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

                imgEl.setAttribute("onclick", `document.getElementById('ImageView').src=this.src`)


                const a = document.createElement("a")
                a.appendChild(imgEl)

                a.setAttribute("href", `#ViewImage`)
                a.className = "perfundo__link"


                divEl.appendChild(a)

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
        }

    }, 0);
} else {//reset
    SELECT("#compressContainer").style.visibility = "hidden"
    imgUploadInput.disabled = false;
    addImgBtn.innerHTML = `ADD IMAGES`
    defaultImg.style.display="block";
    displayImages.innerHTML=""
    warning.innerHTML = "";
}
}

const hasDuplicate=()=>{
    let FileNames = [... filess.map(f => f.name)]
    let duplicateFiles = filess.filter((file, i) => FileNames.indexOf(file.name) !== i)

    return {FileNames,duplicateFiles,FilesLength:duplicateFiles.length}
}
const findDuplicate = (forceAlert = false) => {
    if (filess && filess.length) {
        let {FileNames} = hasDuplicate()
        let {duplicateFiles} = hasDuplicate()
        if (duplicateFiles.length) { // alert(``)

            let countFiles = duplicateFiles.length
            let fileStr = countFiles > 1 ? "files" : "file"
            console.log("result from removeDup=> ", filess, " \n dupfilename=> ", FileNames, " \n dupfiles=> ", duplicateFiles)

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
                        warning.innerHTML=duplInner

                    } else if (Yes) {
                        removeDuplicates()

                    }
                })
            } else {
                warning.innerHTML=duplInner
                
            }
        }

    }
}


const removeDuplicates = (showAlert=true) => {
    
    let {FileNames} = hasDuplicate()
    let {duplicateFiles} = hasDuplicate()
    let duplicateFileNames = duplicateFiles.map(f => f.name)
    let uniqueFiles = filess.filter((file) => ! duplicateFileNames.includes(file.name))
    filess = [
        ... uniqueFiles,
        ... duplicateFiles
    ]

    console.log("result from removeDup=> ", filess, " \n filename=> ", FileNames, " \n dupfiles=> ", duplicateFiles, "\n unique fil=> ", uniqueFiles)
    renderImages()
    if(showAlert){
    swal("DONE", "Removed Duplicate Files ", {icon: 'success'}).then(() =>{ 
        renderImages()
        setTimeout(() => {
             let hasDuplicateFiles = hasDuplicate().FilesLength
             if(hasDuplicate){//Re-check if any duplicate files left after the current removal process. 
                 removeDuplicates(false) //Re-run the function to remove remaining. false will make sure that this alert does not show and the loop does not continue.
             }
             renderImages()

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






const LoadLottie=(path="./assets/anim/compressing.json",id="loading",loop=true,autoplay=true)=>{
  let container = SELECT(`#${id}`)
  container.innerHTML=""//First Clear The Contianer
    lottie.loadAnimation({
        container, // the dom element that will contain the animation
        renderer: 'svg',
        loop,
        autoplay,
        path // the path to the animation json
      });
    }
    LoadLottie()

const setLoadingText=(txt)=>SELECT("#loadingMSG").innerHTML=txt;

const setLoading=(isLoading=true,isProcessing=false)=>{
    const parentDiv= SELECT("#loadingDiv") 
    SELECT("#loading").innerHTML=""

    if(isLoading){
    const animPath=isProcessing?"./assets/anim/processing.json":"./assets/anim/compressing.json"
    const txt= isProcessing?"<b>Almost Done, Processing....</b>":`
     <b style="color:red">COMPRESSING IMAGE(s)</b>
     <p style="font-size:15px">This may take a few minutes depending on number of images you've selected & also your computer's speed and capability.</p>
    `
    setLoadingText(txt)
    LoadLottie(animPath)   
    parentDiv.style.display="block"
    }
    else{
        parentDiv.style.display="none"

    }
}

const compressNow = () => {
  let paths= filess.map(f=>f.path)
   setLoading()
   ipcRenderer.send('image:compress',paths )
 //   ipcRenderer.send("image",filess ) Cant pass arrray or object due to some errors.
}


ipcRenderer.on("Compress:Completed",async (e,d)=>{
    let SuccessList= SELECT("#successList")
    SuccessList.innerHTML=""
    setLoading(true,true)
    console.log("DATA RECEIVED ON IMG HANDILIGN=>> ",d)

    let filesWithInfo =await Promise.all(d.map(async(d,i)=>{

                        let beforeShrink = await getFileInfo(d?.sourcePath)
                        let afterShrink = await getFileInfo(d?.destinationPath)

                        return {...d,beforeShrink,afterShrink}
                        }))

                        console.log("FilesWithINfo",filesWithInfo)

 filesWithInfo.forEach(f=>{

    let destinationPath= f?.destinationPath
    let sourcePath= f?.sourcePath




    let name = destinationPath.substring(destinationPath.lastIndexOf('/')+1)  
    
    let sizeAfterShrink= f.afterShrink.size
    let sizeBeforeShrink= f.beforeShrink.size
    let sizeShrinked =sizeBeforeShrink-sizeAfterShrink

    let sizeAfterShrinkPretty = byteSize(sizeAfterShrink)
    let sizeBeforeShrinkPretty = byteSize(sizeBeforeShrink)
    let sizeShrinkedPretty = byteSize(sizeShrinked)

    let percentReduced  =Math.round((sizeShrinked/sizeBeforeShrink)*100)
    
    console.log("BeforeShrink",f.beforeShrink.size," sourcePath=> ",f.sourcePath)
  

       SuccessList.innerHTML+= ` <li class="list-group-item">
                                           <div style="display:flex;">
                                               <div class="avatar-container p-${percentReduced}">
                                                  <img data-tip="${destinationPath}" title="${destinationPath}" src="${destinationPath}"  alt="" class="avatar">
                                                  <div class="info js-active"><div class="info-inner">-${percentReduced}%</div></div>
                                               </div>                      
                                               <div>  
                                                   <p  title="${name}" class="mb-0"><b>${name.length>35?"...."+name.substring(name.length-32,name.length):name}</b> </p>
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
                                                    

                                               </div>
                                               
                                          </div>
                                          <div style="display:flex; justify-content:flex-end">
                                            <div >
                                                <span  onClick="openFile('${sourcePath}')" title="Open Original Image" class="btn-floating btn-sm btn-default"><i class="fas fa-file-image"></i></span>
                                                <span onClick="openFile('${destinationPath}')"  title="Open Shrinked Image" class="btn-floating btn-primary"><i class="fas fa-image"></i></span>
                                                <span onClick="showFile('${destinationPath}')" title="Show File Folder" class="btn-floating  btn-secondary"><i class="fas fa-folder"></i></span>


                                                <div class="fixed-action-btn">
                                                <a class="btn-floating btn-lg red">
                                                  <i class="fas fa-pencil-alt"></i>
                                                </a>
                                              
                                                <ul class="list-unstyled">
                                                  <li><a class="btn-floating red"><i class="fas fa-star"></i></a></li>
                                                  <li><a class="btn-floating yellow darken-1"><i class="fas fa-user"></i></a></li>
                                                  <li><a class="btn-floating green"><i class="fas fa-envelope"></i></a></li>
                                                  <li><a class="btn-floating blue"><i class="fas fa-shopping-cart"></i></a></li>
                                                </ul>
                                              </div>

                                              
                                             </div>
                                          </div>
                                   </li>

                                   `
   })




    setTimeout(() => {
        setLoading(false)
        filess=[]
        renderImages()
        $('#SuccessModal').modal()
        // Tooltips Initialization
    $("[title]").tooltip();

   
    }, 100); 
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


