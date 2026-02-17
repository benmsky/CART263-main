"use strict";

let x = 30;

function setup() {
    createCanvas(400, 400);
    background(0);
}

function draw (){
    push();
    fill(255, 0, 0);
    ellipse(x, x, 50, 50);
    fill (0, 255, 0);
    ellipse (x+50, x+50, 70, 70);
    fill (0, 0, 255);
    ellipse (x+115, x+115, 90, 90);
    pop ();
}

