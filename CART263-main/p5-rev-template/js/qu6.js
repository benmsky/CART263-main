function setup () {
    createCanvas (600,600);
    background (0);
}

function draw (){
    background (0); 
    push();
    fill (255);
    textSize (32);
    textAlign (CENTER);
    text ("test", width/2, height/2);
    pop();
    // ask sabine why there's two tests
    
    push ();
    fill (255);
    translate(25, 25)
    textSize (16);
    textAlign (LEFT, TOP);
    for (let i = 0 ; i < 10; i ++)
        {
            let x = 20 * i;
            // because we're incrementing 20 by every time
            text (i, x, 0);
            // the text in here is just whatever the value of i is
        }
    for (let i = 15; i >= 0 ; i --)
    {
        let y = 30 * i;
        text (i, 0, y);
    
    }
    pop ();
}
