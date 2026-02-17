let q7radius = 40;
let q7colour = null;
let circleequal = true

function setup (){
    createCanvas (600,600);
    background (0);
    q7colour = {
    r: random (0, 255),
    g: random (0, 255),
    b: random (0, 255)
}
}

function draw (){
    background (0);
    push();
   translate (q7radius/2, q7radius/2);
   // it doesn't cut off
   for (let i = 0; i < width; i += q7radius){
        for (let j = 0; j < height; j += q7radius){
            fill (q7colour.r, q7colour.g, q7colour.b);
            

            if (circleequal === true) {
                circle (i, j, q7radius);
            }
            else {
                rect (i-20, j-20, q7radius, q7radius);
            }
        
   }
}
   pop();
   

}


function keyPressed (){
    console.log(key)
    if (key === " "){

    q7colour.r = random (0, 255);
    q7colour.g = random (0, 255);
    q7colour.b = random (0, 255);
 
    };
   
}

function mousePressed (){
    if (circleequal === true){
        circleequal = false;

    }
    else {
        circleequal = true;
    }
}
// color changing issue (sabine)
// function mousepressed
/*  function mousePressed () {
    circleequal = !circleequal;
}  using boolean to use function*/
