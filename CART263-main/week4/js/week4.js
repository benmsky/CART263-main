window.onload = setup;


function setup() {
  console.log("in week 4 ;)")
  
  document.querySelector("#boxA").addEventListener("click",runTimeOut);

// ask sabine for add text recur function
  function runTimeOut(){
    window.setTimeout(addTimeoutText,2000);
  }
}
