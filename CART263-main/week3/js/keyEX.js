// skipping mousedrag
window.onload = function(){
    console.log("keys");

    let speedX =5
    let boxA = this.document.querySelector("#boxA")

    window.addEventListener("keydown",
        function(e){

            if(e.key==="ArrowRight"){
               let currentPos = parseInt(boxA.style.left);
                //boxA.style.left > integer so we need to add parseInt
                //integer > x decimal
                // we can add string to the number and update it
                // parseInt takes the string as a parameter and returns number
                boxA.style.left = currentPos + speedX + "px"
            }
            if(e.key==="ArrowLeft"){
               let currentPos = parseInt(boxA.style.left);
                //boxA.style.left > integer so we need to add parseInt
                //integer > x decimal
                // we can add string to the number and update it
                // parseInt takes the string as a parameter and returns number
                boxA.style.left = currentPos - speedX + "px"
                

            }

        //body of callback function (unnamed)
        // only works when pressing the keydown
        //console.log(e)
        //console.log(e.key)
        //console.log(e.code)

    })
    //function(e)

    
}

// usually you'll only be able to assign key events to the elements that allow you to input things

