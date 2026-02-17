"use strict";

let counter = 0;
let qu5Sq = {
    x: 50,
    y: 50,
    w: 50,
    h: 50,
    color: 
    { 
        r: 255,
        g: 100,
        b: 0
    }
}
let qu5Sq_2 = {
    x: 150,
    y: 50,
    w: 50,
    h: 50,
    color: 
    { 
        r: 255,
        g: 100,
        b: 0
    }
}


function setup() {
    createCanvas(600, 600);
    background(0);
}

function draw (){
    background (0);
   let circleRadius = 60;
    let circleAlpha = 255;
    displaySquare(qu5Sq.x, qu5Sq.y, qu5Sq.w, qu5Sq.h, qu5Sq.color.r, qu5Sq.color.g, qu5Sq.color.b);
     //displaySquare(qu5Sq_2.x, qu5Sq_2.y, qu5Sq_2.w, qu5Sq_2.h, qu5Sq_2.color.r, qu5Sq_2.color.g, qu5Sq_2.color.b);
    // displaySquare();
   // displaySquare();
    mouseHover();

    let tempCounter = 1;
    while (tempCounter <= counter){
         push ();
        console.log(counter);
        circleRadius += 10;
        circleAlpha -= 20;

        tempCounter ++;
    fill (255,255,255,circleAlpha + (counter * 10));
     translate (width / 2, height / 2);
    circle(0,0,circleRadius);
    ellipseMode (CENTER);
   
    // move the origin to the center of the canvas
    pop ();
    }


}

function displaySquare(x, y, w, h, r, g, b){
    // display square values suspended in parameters
    fill (r, g, b);
    rect (x, y, w, h);
}
// function displaySquare(){
//     // display square values suspended in parameters
//     fill (qu5Sq.color.r, qu5Sq.color.g, qu5Sq.color.b);
//     rect (qu5Sq.x, qu5Sq.y, qu5Sq.w, qu5Sq.h);
// }
function q5Hovering ()
{
    return (mouseX > qu5Sq.x && mouseX < qu5Sq.x + qu5Sq.w && mouseY > qu5Sq.y && mouseY < qu5Sq.y + qu5Sq.h)
}
// if what you're returning is a boolean, you can just return the expression itself

function mouseHover () {
    if (q5Hovering())
    {qu5Sq.color.g += 20 ;}
    else {
        qu5Sq.color.g = 100;
    }
}

function mousePressed() {
    if ((q5Hovering()) && (counter <= 10)) counter++;
   
    console.log (counter);
}
// ask sabine about this not working

