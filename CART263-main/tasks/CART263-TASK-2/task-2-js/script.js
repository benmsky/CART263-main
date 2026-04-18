window.onload = setup;

/** function setup */
function setup(){
console.log("we are a go!")
/*** ALL ANWSERS TO BE ADDED IN THE ALLOCATED SPACE */
/*** START PART ONE ACCESS */ 
/* 1: all paragraph elements */
//console.log (document.getElementsByTagName("p"));
/***OUTPUT: 
 *
0
<p id="1">…</p>
1
<p id="2" class="img-descript">…</p>
2
<p id="3" class="img-descript">…</p>
3
<p id="4" class="img-descript">…</p>
4
<p id="5" class="img-descript">…</p>
5
<p id="6" class="img-descript">…</p>
6
<p id="7" class="img-descript">…</p>
7
<p id="8" class="img-descript">…</p>
8
<p id="9" class="img-descript">…</p>

 */


/*************************************** */
/* 2: only the first paragraph element */
// console.log (document.getElementsByTagName("p")[0]);
/***OUTPUT: 
 * <p id="1">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Alias perspiciatis blanditiis, et
                laborum praesentium earum. Enim facere, quia commodi voluptate, quis asperiores, pariatur ducimus
                officiis non
                quasi officia sit veniam!
            </p> 

 */


/*************************************** */
/* 3: all elements with the class inner-container */
// console.log(document.getElementsByClassName("inner-container"));
/***OUTPUT: 

0
<div class="inner-container">…</div>
1
<div class="inner-container">…</div>
2
<div class="inner-container">…</div>
3
<div class="inner-container">…</div>
4
<div class="inner-container">…</div>
5
<div class="inner-container">…</div>
6
<div class="inner-container">…</div>
7
<div class="inner-container">…</div>

HTMLCollection Prototype


 */


/*************************************** */
// ask sabine tomorrow (solved)
/* 4: the last image element inside the element that has the class img-container */
// console.log(document.getElementsByClassName("img-container")[7]);
/***OUTPUT: 
<div class="img-container"> 
<img class="img-image" src="task-2-images/seventeen.png">
</div>

 */


/*************************************** */


/* 5A
/* 5B
/* 5C // ask sabine (solved)*/ 
// console.log(document.getElementsByTagName("h2"));
// Alternative answer (console.log(document.querySelectorAll("h2"))
// console.log(document.getElementsByTagName("h2").length);
// console.log(document.getElementsByTagName("h2")[0].textContent);
/***OUTPUT: 
/* 5A: <h2> The header of this fancy page</h2>
/* 5B: 1
/* 5C: The header of this fancy page



/*************************************** */
/* 6: the element with id name parent */
// console.log(document.getElementById("parent"));
/***OUTPUT: 
<section id="parent">
<div class="inner-container">…</div>
<div class="inner-container">…</div>
<div class="inner-container">…</div>
<div class="inner-container">…</div>
<div class="inner-container">…</div>
<div class="inner-container">…</div>
<div class="inner-container">…</div>
<div class="inner-container">…</div>
</section>

 */

/*************************************** */
/*** END PART ONE ACCESS */ 


/*************************************** */
/*** START PART TWO MODIFY */ 
/*************************************** */
//come back to this topic 
// document.getElementsByTagName("p")[0].textContent = "Leah, Jan 22, 2026"; 
/*************************************** */

/* 2: Select all elements in the HTML that have the class name content-container
 and change the background color ... of first and second ...*/
//document.getElementsByClassName("content-container")[0].style.background = "lightpink";
// document.getElementsByClassName("content-container")[1].style.background = "lightyellow";

/* we cannot do document.querySelectorAll("content-container").style.background = cannot be done because we cannot change the style of the entire array
we can however do document.querySelector("content-container").style.background = because this only selects a single query



/*************************************** */
/* 3: Change the src element of the first image element on the page to be ...*/
// ask sabine (solved)
// //document.getElementsByTagName("img")[0].src = "task-2-images/seven.png";
// need to add task-2-images for a right path


/*************************************** */
/* 4: Select the third paragraph element on the page and 
replace the content (within the paragraph) to be an h2 element which contains the text `TEST 123` */
// document.getElementsByTagName("p")[2].innerHTML = "<h2> TEST 123 </h2>";
// Sabine's example document.querySelectorAll("p")[2].innerHTML = "<h2> TEST 123 </h2>"
// if you want the array you need to querySelectorAll 

/*************************************** */
/* 5: Select the fourth paragraph element on the page and 
add to the existing content an h2 element containing the text `TEST 123` */
// document.getElementsByTagName("p")[3].innerHTML += "<h2> TEST 123 </h2>";


/*************************************** */
/* 6: Select the fifth paragraph element on the page and add to the existing content 
an img element that holds `one.png`, and add the class newStyle to said paragraph element. */

// let fifth_p = document.getElementsByTagName("p")[4]
// fifth_p.classList.add("newStyle")
// fifth_p.innerHTML += `<img src="task-2-images/one.png">`
// add in an image tag element and use a property src to say which image. `(we are using backtakes to use double quotes inside)< we need these things to make an actual element
// img src = > image tag
// ask Sabine (solved)

/* Sabine's solution: document.querySelectorAll("p")[4].innerHTML += "<img src ='task-2-images/one.png' class = newStyle>" or `<img src = "task-2-images/one.png" class = newStyle>` 


/*************************************** */
/* 7: Add the following array variable: 
1)let colors = ['red','blue','green','orange'];, 
2)then access all elements with class name inner-container and save to a variable called `innerContainers`. 
3)Next, iterate over the colors array, and for each color: 
4)assign the element from innerContainers variable with the same index 
(i.e. colors[0] should be allocated to the first innerContainers element, colors[1] to the second, etc ...)*/

// let colors = ['red','blue','green','orange'];
// let innerContainers = document.getElementsByClassName("inner-container") 

// for(let i=0; i<innerContainers.length; i++){
//     innerContainers[i].style.background=colors[i]
//     //where am I using the colours
//     // you're accessing the elements and you're using the colour backgrounds as the elements
//     // style.color = text style.background = background of the container
// }
// ask Sabine (solved)

/*************************************** */
/*** END PART TWO MODIFY */ 


/*************************************** */
/*** START PART THREE CREATE */ 
/*************************************** */
/* 1: NEW PARAGRAPHS */
/* 1A: Access all paragraph elements, and store the result in a variable called: allPTagsThree */
// let allPTagsThree = document.querySelectorAll ("p")
// we can also use document getElementsByTagName
/* 1B: Create a function:function customCreateElement(parent){ //body } */
// function customCreateElement (parent) {
//     /* 1C:  In the body of customCreateElement create a new parargraph element*/
//     let newParagraph = document.createElement("p")
//     /* 1D:  Set the text of this element to be : `using create Element`*/
//     newParagraph.innerHTML = "using create Elememt"
//     /* 1E:  Set the background of this paragraph element to be green */
//     newParagraph.style.backgroundColor = "green"
//     /* 1F:  Set the color of the text in this paragraph element to be white */
//     newParagraph.style.color = "white"
//     /* 1G: Append this new element to the parent variable within the function. */
//     parent.appendChild(newParagraph)
//     // parent is already defined in the parameters 

//     // the function is never been called
// }

// for (let i=0; i<allPTagsThree.length; i++){
//     customCreateElement(allPTagsThree[i])
//     // the parent is allPTagThree > parent is in the parameter and we're inserting the ptag inside of the parent paragraph
// }

/* 1H: Iterate through the allPTagsThree array and call customCreateElement(), 
passing the current allPTagsThree element as the parent with each iteration.*/
/***CODE */

/* Sabine's answer
let allPTagsThree = document.querySelectorAll("p");
function customCreateElement (parent){
// body
    let newElement = document.createElement ("p")
    newElement.textContent ="using create Element"
    newElement.style.backgroundColor = "green"
    newElement.style.color = "white";
    parent.appendChild(newElement)

    // parent is ptag and we're appending new element into the ptag
    
    }

/***EXPLANATION::
 * 
 * 
 */

/*************************************** */
/* 2: GRID OF BOXES */
/* 2A: Create another new function: function customNewBoxCreate(parent){ //body }*/
// function customNewBoxCreate (parent){

//     let testDiv = document.createElement("div")
//     testDiv.classList.add("testDiv")
//     // add is a function   
//     parent.appendChild(testDiv)
//     return testDiv
// }

// for (i=0; i<10; i++){
//     for (j=0; j<10; j++){
//         let returnDiv = customNewBoxCreate(document.getElementById("new-grid")) 
//         // assigning the test div variable to be the box
//         // box is inside of the new grid (doing this 100 times 10*10)
//         returnDiv.style.left = i * 40+"px"
//         // to specify pixels
//         returnDiv.style.top = j * 40+"px"
//         if(j%2===0){
//             returnDiv.style.background = "white"
//             returnDiv.textContent = "even"
//             returnDiv.style.color = "blue"
//         } 
//         else {
//             returnDiv.style.background = "purple"
//             returnDiv.textContent = "odd"
//             returnDiv.style.color = "black"

//         }
        
       
//     }
// }
/* 2B: In the body of customNewBoxCreate create a new div element, that has the class testDiv. 
/* 2C:Then append this new element to the parent variable within the function. 
/* 2D:Finally, return</code> this new element */
/* 2E:Create a nested for loop (for rows and columns) to iterate through 10 columns and 10 rows (just like the JS Review :)). 
    Call the customNewBoxCreate function, in order to generate a new div -> representing each cell in the grid. 
    Ensure that the parent element for each of these new divs is the element whose id is named `new-grid`*/
/* 2F: You will see at this point that the x,y position of the resulting divs makes no sense... 
    Fix this by doing the following: every time you call customNewBoxCreate() - save the current returned element 
    in a variable i.e. returnedDiv. 
    Set the style (left and top) to the of this element to 
    the necessary x and y position (use the counter variables in the for nested for loop to 
    calculate the new positions.
/* 2G: BONUS I: Make every div in the resulting grid in an even numbered row have white background 
    and otherwise let it have a background of purple.</li>
/* 2H: BONUS II: For every div in an even numbered row make it contain the text `EVEN`, 
    otherwise lat it have the content `ODD`.*/

/***CODE */


/***EXPLANATION::
 * 
 * 
 */

/*************************************** */
// /* 3: GRID OF BOXES II */
// for (i=0; i<10; i++){
//     for (j=0; j<10; j++){
//         let returnDiv = customNewBoxCreate(document.getElementById("new-grid-three")) 
//         returnDiv.style.left = i * 40+"px"
//         returnDiv.style.top = j * 40+"px"

//         if(i%3==0){
//             returnDiv.style.background = "red"
//             returnDiv.textContent = "0"
//         }
//         else if(i%3===1){
//             returnDiv.style.background = "orange"
//             returnDiv.textContent = "1"
//         }
//         else{
//             returnDiv.style.background ="yellow"
//             returnDiv.textContent = "2"
//         }
//     }
// }
/* 3A: Create ANOTHER nested for loop - in order to generate a new grid ... 
    USE the same customNewBoxCreate function..., the only difference is that the parent element 
    for each of these new divs is the element whose id is `new-grid-three`. */
/* 3B: Then: write the code to check when a column is a multiple of 3 (no remainder), 
    when it is a column where the remainder is 1 or when the remainder is 2 ... 
    HINT:: look up the % operator.. */
/* 3C: Then for each of the above cases: give the new divs in the first case a background of red, 
        then the second a background of orange and the third yellow. */
/*  3D: Finally, let each div contain the text content representing the associated remainder 
    when dividing by three. */

/***CODE */


/***EXPLANATION::
 * Sabine I'm a little confused because the colours are different from the example colors, but I followed your in-text code instruction! I hope that's okay : )
 * Thank you so much for your help!
 * 
 */

/*************************************** */
/*** END PART THREE CREATE */ 
/*************************************** */
    




}