"use strict";
let rect1 = {
    x: 100,
    y: 100,
    w: 50,
    h: 50,
    color: {
        r: 0,
        g: 0,
        b: 255
    }

}

let rect2 = {
    x: 200,
    y: 200,
    w: 100,
    h: 100,
    color: {
        r: 255,
        g: 0,
        b: 0
    }

}

let rect3 = {
    x: 300,
    y: 300,
    w: 150,
    h: 150,
    color: {
        r: 0,
        g: 255,
        b: 0
    }
}

const width = 600;
const height = 600;

function setup() {
    createCanvas(width, height);
    
}
 
function draw(){
    push();
    background(0);
    fill(rect1.color.r, rect1.color.g, rect1.color.b);
    rect (rect1.x, rect1.y, rect1.w, rect1.h);
    fill(rect2.color.r, rect2.color.g, rect2.color.b);
    rect (rect2.x, rect2.y, rect2.w, rect2.h);
    fill(rect3.color.r, rect3.color.g, rect3.color.b);
    rect (rect3.x, rect3.y, rect3.w, rect3.h);
    pop();

    if (rect3.y >= height)  rect3.y = 0;
    rect3.y += 5;
}

function mousePressed (){
    rect1.x += random(-10,10);
    rect1.y += random(-10,10);
}

function keyPressed (){
    if (keyIsPressed === true && key === " ")
    {
        rect2.x += random(-10,10);
        rect2.y += random(-10,10);
    }
}

function mouseMoved (){
   rect3.color.r = random(0,255);
   rect3.color.g = random(0,255);
   rect3.color.b = random(0,255);
}