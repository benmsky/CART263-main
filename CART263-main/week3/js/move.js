
window.onload = function(){
    console.log("move");
    let box = document.querySelector ('#draw-box-a');
    // this refers to the document 

    box.addEventListener("mousemove",drawBoxCallBack);
    // drawBoxCallBack is a callback function

    let particle = this.document.createElement ("div");
    particle.classList.add("point");
    box.appendChild(particle);

    function drawBoxCallBack (e){
        console.log("moving");
        console.log(this);
        // this is the drawbox > something that triggered the drawbox
        // whenever I have an eventListener, the event will hold (??)
        console.log(e);
        // we have two properties: client X and Y. Now we need e because we don't have a global event mouse X and Y
        // client X and Y are our mouse X and Y
        console.log(this.getBoundingClientRect());
        // automatically render coordinates the render i click on
        // when you're creating html and css > you don't fully know the specifics of where the element will land
        let offsetX = e.clientX - this.getBoundingClientRect().x;
        let offsetY = e.clientY - this.getBoundingClientRect().y;
        // we're making our own mouse X and Y
        //this.innerHTML = `x; ${offsetX} y: ${offsetY}`;

        particle.style.left = offsetX + "px" 
        // make sure to give measurement; in this case px is used for a measurement
        particle.style.top = offsetY + "px"


        //this.innerHTML = `x: ${e.clientX} y:${e.clientY}`
        // attempting to see what the values are
        // logging into the box the coordiantes

    }
}


