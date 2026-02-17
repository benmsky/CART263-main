window.onload = function () {

  // let aniRef = null;
  // //add a new particle
  // let p2 = document.createElement("div");
  // p2.id = "particle_two";
  // document.getElementById("parent").appendChild(p2);
  // p2.style.left = '500px'
  // p2.style.top = '100px';
  // let theta =0;
  // aniRef = window.requestAnimationFrame(modifyParticle);

  
  // function modifyParticle() {
  // let p2 = document.getElementById("particle_two");
  // //map -1 to 1 to between 5 100
  // let mappedNum = mapNumRange(Math.sin(theta),-1,1,5,100)
  // p2.style.width = (mappedNum)+"px";
  // p2.style.height = (mappedNum)+"px";
  // p2.style.borderRadius = (mappedNum)+"px";
  // theta+=0.05;
  // aniRef = window.requestAnimationFrame(modifyParticle);


  // }

  // let stopped = false;
  // window.addEventListener("keydown", function(e){
  //   if(e.code ==='Space'){
  //     console.log("space");
  //     if(stopped ===true){
  //       stopped =false;
  //       aniRef = window.requestAnimationFrame(modifyParticle);
  
  
  //     }
  //     else{
  //       this.cancelAnimationFrame(aniRef);
  //       stopped = true;

  //     }
  

  //   }
    
    // if(e.code ==='Space'){
    //   console.log("space");
    //   this.cancelAnimationFrame(aniRef)

    // }
  //})

  //same as map in p5
  const mapNumRange = (num, inMin, inMax, outMin, outMax) =>
    ((num - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;




//   window.requestAnimationFrame(animate);

//   let speedX = 2;
//   let speedY =3;

//   function animate() {
//   let p = document.getElementById("particle");


//   p.style.left = parseInt(p.style.left) + speedX+ "px";
//   p.style.top = parseInt(p.style.top) + speedY + "px";
//   window.requestAnimationFrame(animate);
//    checkBounds(document.getElementById("parent"), p);


// }


function checkBounds(parent, p) {
  let bounds = parent.getBoundingClientRect();

  if (parseInt(p.style.left) > bounds.right) {
    speedX*=-1;
  

  } else if (parseInt(p.style.left) < bounds.left) {
    speedX*=-1;

  }

  if (parseInt(p.style.top) > bounds.bottom) {
    speedY*=-1;

  } else if (parseInt(p.style.top) < bounds.top) {
    speedY*=-1;
 
  }
}

//with keys

  let gridArray = [];

  for (let i = 0; i < 24; i++) {
    //for each x - make a column of changing y's
    let gridCol = [];
    for (let j = 0; j < 24; j++) {
      //create a grid cell with a div
      let parent = document.getElementById("parent");
      let d = document.createElement("div");
      d.classList.add("grid-cell");
      parent.appendChild(d);

      d.style.left = (i + 1) * 25 + "px";
      d.style.top = (j + 1) * 25 + "px";
      gridCol[j] = d;
    }
    //put each grid row into the grid array
    gridArray[i] = gridCol;
  }
  console.log(gridArray);
  let shades = [
    "#7fb3d5", //grey blue first
    "#76d7c4",
    "#f7dc6f",
    "#eb984e",
    "#cb4335",
    "#8e44ad",
    "#2e4053",
    "#e5e7e9",
  ];

    let num=1;
  window.addEventListener("keydown" ,function(e){
    if(e.code ==="Space"){
      animate_cells_mod_rows();

    }
  })

  //the divisor
  //let num=2;

  //   for (let i = 0; i < 24; i++) {
  //     for (let j = 0; j < 24; j++) {
  //       //check the j--> y value for color choice (all same ys will have the same color (a row))
  //       let d = gridArray[i][j];
  //       if (j % num === 0) {
  //         d.style.background = shades[0];
  //       } else if (j % num === 1) {
  //         d.style.background = shades[1];
  //       }
  //     }
  //   }

  // for (let i = 0; i < 24; i++) {
  //   for (let j = 0; j < 24; j++) {
  //     //check the i -> x value for color choice (all same xs will have the same color (a column))
  //     let d = gridArray[i][j];
  //     if (i % num === 0) {
  //       d.style.background = shades[0];
  //     } else if (i % num === 1) {
  //       d.style.background = shades[1];
  //     }
  //   }
  // }
  //the divisor
  //let num=1;

  //setInterval(animate_cells_mod_rows,200);
  //setInterval(animate_cells_mod_cols,500);

  function animate_cells_mod_rows() {
    for (let i = 0; i < 24; i++) {
      for (let j = 0; j < 24; j++) {
        let d = gridArray[i][j];
        if (j % num === 0) {
          d.style.background = shades[0];
        } else if (j % num === 1) {
          d.style.background = shades[1];
        } else if (j % num === 2) {
          d.style.background = shades[2];
        } else if (j % num === 3) {
          d.style.background = shades[3];
        } else if (j % num === 4) {
          d.style.background = shades[4];
        } else if (j % num === 5) {
          d.style.background = shades[5];
        } else if (j % num === 6) {
          d.style.background = shades[6];
        } else if (j % num === 7) {
          d.style.background = shades[7];
        }
      }
    }

    num += 1;
    console.log(num);
    if (num === 9) {
      num = 1;
    }
  }

  function animate_cells_mod_cols() {
    for (let i = 0; i < 24; i++) {
      for (let j = 0; j < 24; j++) {
        //check the i--> x value for color choice (all same xs will have the same color (a column))
        let d = gridArray[i][j];
        if (i % num === 0) {
          d.style.background = shades[0];
        } else if (i % num === 1) {
          d.style.background = shades[1];
        } else if (i % num === 2) {
          d.style.background = shades[2];
        } else if (i % num === 3) {
          d.style.background = shades[3];
        } else if (i % num === 4) {
          d.style.background = shades[4];
        } else if (i % num === 5) {
          d.style.background = shades[5];
        } else if (i % num === 6) {
          d.style.background = shades[6];
        } else if (i % num === 7) {
          d.style.background = shades[7];
        }
      }
    }
    num += 1;
    if (num === 9) {
      num = 1;
    }
  }
  //let speed =100;
  // window.setInterval(addText, 1000);
  //   function addText() {

  //   console.log("adding");
  //   console.log(speed);
  //   let sp = document.createElement("span");
  //   sp.textContent = " adding Text ";
  //   sp.classList.add("appearInText");
  //   document.getElementById("parent").appendChild(sp);

  // }

  //The easiest way is to set a timeout instead of an interval at the end of each execution,
  // and pass a variable as the second parameter. T
  // hat way, each time a new timeout is set the value of that variable is used, like so:
//   let speed = 1000;
//   window.setTimeout(addTextDynamic, speed);

//   function addTextDynamic() {
//     console.log("adding");
//     console.log(speed);
//     let sp = document.createElement("span");
//     sp.textContent = " adding Text ";
//     sp.classList.add("appearInText");
//     document.getElementById("parent").appendChild(sp);
//     if (speed > 20) speed -= 20;
//     setTimeout(addTextDynamic, speed);
//   }
// };


// let ref = window.setInterval(addOtherText, 500);
// let counter =0;
//   function addOtherText() {
//       let sp = document.createElement("span");
//       sp.textContent = " ***-*** ";
//       sp.classList.add("appearInStarText");
//       document.getElementById("parent").appendChild(sp);
//       counter++;
//       if(counter ===10){
//         clearInterval(ref);
//       }
//     }
//   }


// let randomChanceToRun = setTimeout(oneTimeText, 500);

// let num = Math.random();
// if ( num < 0.5) { // 50% chance
//   defusedText();
//   clearTimeout(randomChanceToRun);
// }
// console.log(num);


//   function oneTimeText() {
//     let sp = document.createElement("span");
//     sp.textContent = " TIME OUT ";
//     sp.classList.add("timeOutText");
//     document.getElementById("parent").appendChild(sp);
//   }


//   function defusedText() {
//     let sp = document.createElement("span");
//     sp.textContent = "DEFUSED";
//     sp.classList.add("timeOutText");
//     document.getElementById("parent").appendChild(sp);
//   }
// };



}

//   function addTextDynamic() {

//   console.log("adding");
//   console.log(speed);
//   let sp = document.createElement("span");
//   sp.textContent = " adding Text ";
//   sp.classList.add("appearInText");
//   document.getElementById("parent").appendChild(sp);
//   if(speed>100)speed -=100;
// }

//1 setInterval -> interleave...
// window.setInterval(addText, 1000);


// //3 setTimeOut
// window.setTimeout(oneTimeText, 2000);

//4 requestAnimationFrame()

//window.requestAnimationFrame(animate);

// window.requestAnimationFrame(animate_cells);

// //let theta =0;
// function animate_cells() {
//   let ts = document.querySelectorAll(".grid-cell");
//   //theta+=0.01;
//   for (let t of ts) {
//     let att = parseFloat(t.getAttribute("theta"));
//     att += parseFloat(t.getAttribute("speed"));
//     console.log(t.getAttribute("speed"));
//     t.style.width = Math.sin(att) * 42 + "px";
//     t.style.height = Math.sin(att) * 42 + "px";
//     t.setAttribute("theta", att);

//     // t.style["transform-origin"] ="40px 40px";
//   }
//   window.requestAnimationFrame(animate_cells);
// }

//window.requestAnimationFrame(animate);

// function animate() {
//   let p = document.getElementById("particle");
//   let rl = randomRange(-10, 10);
//   let rt = randomRange(-10, 10);
//   p.style.left = parseInt(p.style.left) + rl + "px";
//   p.style.top = parseInt(p.style.top) + rt + "px";
//   window.requestAnimationFrame(animate);
//   checkBounds(document.getElementById("parent"), p);
// }

// function checkBounds(parent, p) {
//   let bounds = parent.getBoundingClientRect();
//   // console.log(bounds.right)
//   // console.log(p.style.left)
//   if (parseInt(p.style.left) > bounds.right) {
//     // console.log("right");
//     p.style.left = `${bounds.right}px`;
//   } else if (parseInt(p.style.left) < bounds.left) {
//     // console.log("right");
//     p.style.left = `${bounds.left}px`;
//   }
//   if (parseInt(p.style.top) > bounds.bottom) {
//     // console.log("right");
//     p.style.top = `${bounds.bottom}px`;
//   } else if (parseInt(p.style.top) < bounds.top) {
//     p.style.top = `${bounds.top}px`;
//   }
// }

//   function addText() {
//     console.log("adding");
//     let sp = document.createElement("span");
//     sp.textContent = " adding Text ";
//     sp.classList.add("appearInText");
//     document.getElementById("parent").appendChild(sp);
//   }




/*
Math.random() generates a random decimal between 0 (inclusive) and 1 (exclusive).
Multiply the result by (max – min + 1) to scale it to the desired range, 
then add min to shift it to the correct starting value.
Use Math.floor() to round down to the nearest integer, 
ensuring the result is within the specified range.
*/

// function randomRange(min, max) {
//   return Math.floor(Math.random() * (max - min + 1)) + min;
// }
