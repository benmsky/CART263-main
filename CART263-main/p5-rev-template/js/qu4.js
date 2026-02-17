"use strict";
let rect1 = {
    x: 100,
    y: 100,
    w: 50,
    h: 50,
    color: {
        r: 0,
        g: 0,
        b: 200
    },
   turntowhite: false
}



let rect2 = {
    x: 200,
    y: 200,
    w: 100,
    h: 100,
    color: {
        r: 200,
        g: 0,
        b: 0
    },
    turntowhite: false
}

let rect3 = {
    x: 300,
    y: 300,
    w: 150,
    h: 150,
    color: {
        r: 0,
        g: 200,
        b: 0
    },
    turntowhite: false
}

function setup() {
    createCanvas(600, 600);
    background(0);
}

function draw(){
    background(0);
    // if (rect1.turntowhite) 
    //     {fill(255)}
    // else
    // {fill(rect1.color.r, rect1.color.g, rect1.color.b);}
    // rect(0,0,width/3,height);
    // if (rect2.turntowhite) 
    //     {fill(255)}
    // else
    // {fill(rect2.color.r, rect2.color.g, rect2.color.b);}
    //  rect(width/3,0,width/3,height);
    // if (rect3.turntowhite) 
    //     {fill(255)}
    // else
    // {fill(rect3.color.r, rect3.color.g, rect3.color.b);}
    // rect(width/3*2,0, width/3,height);
     drawRect(0,0);
    drawRect(width/3*2,0);
    
}


function mouseMoved (){
    if (mouseX >=0 && mouseX <= width/3){
        rect1.turntowhite = true;
        rect2.turntowhite = false;
        rect3.turntowhite = false;
    }
       
    if (mouseX > width/3 && mouseX <= width/3*2){
        rect1.turntowhite = false;
        rect2.turntowhite = true;
        rect3.turntowhite = false;
    }

    if (mouseX >= width/3*2 && mouseX <= width){
        rect1.turntowhite = false
        rect2.turntowhite = false;
        rect3.turntowhite = true;
    }
}

function drawRect(x,y){
    if(mouseX>x && mouseX<x+width/3){
        fill(255)
    }
    else{
        fill(rect3.color.r, rect3.color.g, rect3.color.b);
    }
   
    rect(x,y, width/3,height);
}

