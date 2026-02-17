
window.onload = setup
function setup(){
    // console.log(document.getElementById("one"));
    // // get ID in html

    // console.log (document.querySelector("#one"))
    // // get any CSS type selector; you need to add . for class and # for id
    // // it returns the first one that it finds

    // console.log(document.getElementsByTagName("div"));
    // // get all elements of a certain type; returns an array-like object
    // // each element is separated by comma
    // // you can access each element by its position in the array-like object

    // let allDivs = document.getElementsByTagName("div");

    // console.log(allDivs[0]);

    // console.log(allDivs.length); // to see how many divs there are
    // // access the second div element > it starts from 0

    // console.log(document.querySelector("div"));
    // // it's only going to give you the first div

    // console.log(document.querySelectorAll("div"));
    // // gives you all the divs in a node list; node list is similar to array-like object

    // console.log(document.querySelectorAll("div p"));
    // // you can use patterns just like in CSS
    // // you can make it as complex as you wish 

    // console.log(document.getElementsByClassName("square_shape"));
    // // get all elements with a certain class name

    // console.log(document.querySelectorAll(".square_shape"));
    // // same as above but using query selector

    //console.log(document.getElementById("two").textContent);
    // // to get the text content inside an element; Ignores HTML tags inside the element
    
    // console.log(document.querySelector("#five").getAttribute("id"));
    // // chaining—getting an element and then getting one of its attributes 
    // // getting an id of the element

    // // // You can make up your own attributes in HTML and use them in JavaScript <<< ask Sabine about this

    // console.log(document.querySelector("#five").getAttribute("sabine"));
    // // highly useful to know whether something exists or not > check the value to see if the value is null or not (counter logic)

    // console.log(document.querySelector("#two").classList);
    // console.log(document.querySelector("#one").style.background);
    // // style is the in-line style

    // console.log(document.querySelectorAll("span"));
    // console.log(document.querySelectorAll("span")[0]);
    // console.log(document.querySelectorAll("span")[0].parentElement);
    // // parent element > going up the DOM tree
    // // getting the parent element of the first span element
    // // you can chain parent element
    // console.log(document.querySelectorAll("span")[0].parentElement.parentElement);
    // console.log(document.querySelectorAll("span")[0].parentElement.parentElement.parentElement);
    // // going up three levels in the DOM tree

    // console.log(document.querySelector(".wrapper_flex_box").children);
    // // children > going down the DOM tree
    // // getting all the child elements of the element with class wrapper_flex_box
    // document.querySelector(".wrapper_flex_box").children[0].innerHTML = "<h2> Hello JS </h2>";
    // // to access a single element among the children and change its inner HTML content

    // let childrenOfTwo = document.getElementById("two").children;
    // for (let i = 0; i<childrenOfTwo.length; i++){
    //     childrenOfTwo[i].innerHTML = "<h3> Hello JS </h3>";
    // }
// innerHTML > to change the HTML content inside an element
// textContent > to change only the text content inside an element; it hasn't parsed the HTML

let childrenOfTwo = document.getElementById("two").children;
for (let i = 0; i<childrenOfTwo.length; i++){
    childrenOfTwo[i].textContent = "Hello JS";
}

document.querySelector(".square_shape").classList.add("another_class");
// to add a class to an element
// you can do it by removing(.classList.remove) the class or adding (.classList.add) the class on the fly

document.querySelector("h1").setAttribute("id","new_id");
// to set an attribute to an element
// in this case, adding an id attribute to the h1 element

    console.log("running setup");

    
}

