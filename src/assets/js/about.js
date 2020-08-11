
 const {shell, remote,app} = window.require("electron")

 const openKashan = () => shell.openExternal("https://KashanHaider.com")
 const openGithubRepo = () => shell.openExternal("https://github.com/SMKH-PRO/ImageShrink")

 let version=  remote?.app?. getVersion()
// alert(version)
 document.getElementById("version").innerHTML =  `Version ${version }` 


 fetch("https://api.github.com/repos/SMKH-PRO/ImageShrink/stargazers")
 .then(d=>d.json())
 .then(stars=>{
        let starsEL= document.getElementById("githubStarCount")
        starsEL.innerHTML=stars?.length
        
        let names= Array.isArray(stars)&& stars.map(d=>d.login).filter(d=>d).toLocaleString()

        document.getElementById("githubButtonParent").title=`Thank You ❤️ <br/> ${names?.split(",").join("<br/>")}`
        $(() => {
            $('[title]').tooltip()
        }) 
    })
    


 $(() => {
    $('[title]').tooltip()
})