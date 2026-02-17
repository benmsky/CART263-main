window.onload = setup;
function setup(){
    console.log("events!")
    // let introBoolean = "inactive"
    // let s1Boolean = "inactive"


    // to make introSection clickable 
    // should access specific variable

    // let introSection = document.getElementById("intro");
    // introSection.addEventListener("click", mouseIntroHandler);

    let allSections = document.querySelectorAll (".mouseclickactivesection");
    // . > because it's a class
    for (let element of allSections){
        element.addEventListener("click", changeOpacityOfSection)
        // change opacity of section is the callback
    }

    function changeOpacityOfSection(e) {
        console.log (this);
        if(this.getAttribute("custom-bool") === "inactive"){
        let classToAdd =`${this.id}-section-active`
        let classToAddP =`${this.id}-section-active`
        // built based on whom i clicking on i can access the correct class name
        this.classList.add(classToAdd)
        document.querySelector(`#${this.id} p`).classList.add(classToAddP)

        this.setAttribute ("custom-bool", "active")
        console.log (this);

        }
        else {
            let classToAdd = `${this.id}-section-active`
            let classToAddP = `${this.id}-section-active`
            this.classList.remove (classToAdd);
            document.querySelector(`#${this.id} p`).
            classList.remove (classToAddP)

            this.setAttribute("custom-bool", "inactive")
            console.log(this)
        }
    }

    function mouseIntroHandler (e){
        // e is an argument to the function. when the function is called, it's passed as a function (???)
        // argument - the actual value passed into a function
        console.log ("hello");
        // by clicking on the intro, console.log will show intro > I just made my div clickable
        // in p5 you had to do collision detection > in js anytime adding to an eventListener to an element, the bounding box is predefined (it is a known entity) > no need to do a collision detection
        // could add eventListener to almost all html elements
        console.log (e)
        // e has a property associated to it
        // when you define your own custom function, it is a special type of function
        // when i click it attaches all the information as an argument (?)
        // browser is now a callback > the browser tasks all the information about the task
        console.log (this)
        // this instance > div that i clicked on 
        // property that is assigned automatically by browser when certain things happen
        // depending on what is happening, you'll be able to change (?)
        // referring to who had the eventListener attached to it
        
        this.style.background = `rgba(214,110,239,0.5)`;
        // this > introSection / `rgbalpha` > standard css way of listing the colour
        // it only runs once
        
        console.log(document.querySelector(`#${this.id}`));
        
        // "#"+this.id+"p"
        // // concatenate (chain things)
        // // "#" + "this.id" + "p"

        // console.log ("#"+this.id+"p")
        // // intro,p
        // // this.id > id of introSectior
        // // querySelector needs to be string
        // // therefore when you do ("# this.id p")>> it just says this.id p

        // `#${this.id}p`
        // // > we are accessing the inside of the pTag
        // // take variables into a string
        // // to get the value of the variable
        // // # > ID ${} > that tells the browser that this is the variable and I want the value
        // // we don't want to hardcode anything

       // document.querySelector(`#${this.id}p`.style.background = `rgba(214,110,239,0.5)` )
        
        // this.style.setProperty("opacity", ".5")
        // // opacity is a css element

        // document.querySelector(`#${this.id}`.style.setProperty("opacity",".35"))
        // // wouldn't work because the child element's opacity is higher 

        document.querySelector(`#${this.id}p`).classList.add("intro-section-p-active");
        // adding a class > instead of adding manually class, you can dynamically edit class
        // it would be simple to remove the class






    }
}
    // whole array of different events are listed on mozilla

    // the function is going to run when I click
    // you could pass a function as an argument





