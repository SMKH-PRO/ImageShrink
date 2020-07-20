const fs = window.require('fs');
const SELECT = (target) => document.querySelector(`${target}`)
let filess = []

const imgUploadInput = SELECT("#imgUploadInput")
const warning = SELECT("#warning")

const setImgBase64 = (imgEl, file) => {

  const ReadAbleFile = fs.readFileSync(file.path).toString('base64')
  let src = "data:image/png;base64," + ReadAbleFile

  imgEl.setAttribute("src", src)
  // El.src=src  

  // console.log(`FIXED IMAGE # ${imgEl} `,ReadAbleFile)

}
const renderImages = () => {
  const files = filess && Array.from(filess)
  const defaultImg = SELECT("#defaultImg")
  const addImgBtn = SELECT("#addImgBtn")
  imgUploadInput.disabled = true;

  let numOfFiles = files.length

  if (numOfFiles < 1) {
    SELECT("#compressContainer").style.visibility = "hidden"
  } else {
    SELECT("#compressContainer").style.visibility = "visible"
  }
  if (numOfFiles > 49) {
    warning.innerHTML = `<b style="font-weight:bold; color:red;">WARNING:</b><br/> 
                               <span style="padding:10px;text-align:left">
                               Your processor/computer may not be able to process ${numOfFiles} Images at once, We recommend selecting less than 50 Images at once for better performance.
                                </span>
                                `;
  }
  addImgBtn.innerHTML = `LOADING.....`
  if (defaultImg && numOfFiles > 0) defaultImg.remove();


  setTimeout(() => {

    if (files && numOfFiles > 0) {
      let displayImages = SELECT("#displayImages")
      displayImages.innerHTML = ""
      files?.forEach((file, i) => {
        let divEl = document.createElement("div")
        let imgEl = document.createElement("img")
        imgEl.src = file.path

        imgEl.id = `PNG_${i}_${btoa(file.name)}`
        divEl.className = "displayedImg"

        imgEl.setAttribute("onclick", `document.getElementById('ImageView').src=this.src`)


        const a = document.createElement("a")
        a.appendChild(imgEl)

        a.setAttribute("href", `#ViewImage`)
        a.className = "perfundo__link"


        divEl.appendChild(a)

        divEl.className = "displayedImg perfundo"

        displayImages.appendChild(divEl)


        if (i == files.length - 1) { warning.innerHTML = ""; updateNumOfImages(); }
        imgEl.onerror = () => setImgBase64(imgEl, file) //converting to base64 only on error, this make performance better and help us avoid freezes. (before this i was converting all images to base64 wither errored or not that was making computer freez)
      })
      addImgBtn.innerHTML = "+ Add MORE"
      imgUploadInput.disabled = false
      findDuplicate()
    }

  }, 0);
}


const findDuplicate = () => {
  if (filess && filess.length) {
    let dupilcateFileNames = [...filess.map(f => f.name)]
    let duplicateFiles = filess.filter((file, i) => dupilcateFileNames.indexOf(file.name) !== i)
    if (duplicateFiles.length) {
     // alert(``)

     let countFiles= duplicateFiles.length
     let fileStr= countFiles>1?"files":"file"
      swal("DUPLICATE FILES DETECTED", `You've selected ${countFiles>1?countFiles:"a"} duplicate ${fileStr} , Would you like to un-select duplicate ${fileStr} having same name?`, {
        icon: 'warning',
        dangerMode: true,
        buttons: {
          cancel: true,
           
          never:"Never Ask",
          confirm: "Yes !",
        },
      }).then((Yes) => {
        if (Yes=="never") {
            
        } 
        else if(Yes){
          removeDuplicates()    

        }
      })
    }

  }
}


const removeDuplicates=()=>{
  let dupilcateFileNames = [...filess.map(f => f.name)]
  let duplicateFiles = filess.filter((file, i) => dupilcateFileNames.indexOf(file.name) !== i)
  let uniqueFiles= filess.filter((file)=>!dupilcateFileNames.includes(file.name))
   filess= [...uniqueFiles,...duplicateFiles]
   renderImages()
  swal("DONE","Removed Duplicate Files ",{icon:'success'})


  
}


const updateNumOfImages = () => {
  warning.innerHTML = `
                <span style="text-align:left; color:green">
                        Selected ${filess.length} Image(s)
                 </span>
                 `;
}









imgUploadInput.addEventListener("change", (e) => {
  let SelectedFiles = e.target.files

  if (SelectedFiles && SelectedFiles.length) {
    filess = [...filess, ...SelectedFiles]
    renderImages()
  }
})
// SELECT("#imgUploadInput").addEventListener("drop",(e)=>console.log("DROP=> ",e))