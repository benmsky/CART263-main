"use strict";


function setup() {
    createCanvas(400, 400);
    background(0);
    drawEllipse(40, 40, 60, 60, 200, 0, 0);
    drawEllipse(90, 90, 60, 60,0, 200, 0);
    drawEllipse(145, 145, 60, 60, 0, 0, 200);
}

function drawEllipse(x,y,w,h,r,g,b){
    // reference to the previous code in qu1.js
    push();
    noStroke ();
    fill(r, g, b);
    ellipse(x, y, w, h);
    pop ();
}