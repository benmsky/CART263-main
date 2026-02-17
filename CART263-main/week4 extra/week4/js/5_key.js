window.onload = function () {
  console.log("keys");
  let speedX = 5;

  window.addEventListener("keydown", function (event) {
    console.log("keydown");
    console.log(event);

    //text content

    document.querySelector("#textContainer").textContent += event.key;
    // document.querySelector("#textContainer").textContent+="*";
    document.querySelector("#textContainer").textContent += event.code;
    // document.querySelector("#textContainer").textContent+="*";

    //     //2: change color when space is down
    //     if(event.code ==="Space"){
    //         document.getElementById("boxA").style.background = "orange";

    //     }

    //    //console.log (event);
    //     //console.log(event.key)
    //     //WORKS JUST LIKE IMAGINED :)
    if (event.key === "ArrowRight") {
      // document.getElementById("boxA").style.left =parseInt(document.getElementById("boxA").style.left)+1+"px"
      document.getElementById("boxA").style.left =
        parseInt(document.getElementById("boxA").style.left) + speedX + "px";
    } else if (event.key === "ArrowLeft") {
      // document.getElementById("boxA").style.left =parseInt(document.getElementById("boxA").style.left)+1+"px"
      document.getElementById("boxA").style.left =
        parseInt(document.getElementById("boxA").style.left) - speedX + "px";
    } else if (event.code === "Space") {
      let bool = document.getElementById("boxB").getAttribute("custom-bool");
      if (bool === "off") {
        document.getElementById("boxB").style.background = "orange";
        document.getElementById("boxB").setAttribute("custom-bool", "on");
      } else {
        document.getElementById("boxB").style.background = "rgb(112, 184, 226)";
        document.getElementById("boxB").setAttribute("custom-bool", "off");
      }
    }
    else if (event.key === "Shift") {
        document.getElementById("boxA").style.background ="rgb(226, 112, 177)";
    }
  });
  //need to add
  window.addEventListener("keyup", function(event){
      console.log("keyup")
       //2: change color when space is down
       if(event.key ==="Shift"){
          document.getElementById("boxA").style.background = "rgb(112, 184, 226)";

      }
      else{
        console.log(`key up not shift:`)
        console.log(event)
      }

  })
};
