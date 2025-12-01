//array of keys
var keys = [];

//keydown code
document.addEventListener(`keydown`, (e)=>{
    keys[e.key]=true;
    console.log(e.key)
})


//keyup code
document.addEventListener(`keyup`, (e)=>{
    keys[e.key]=false;
})

document.addEventListener(`keydown`, (a)=>{
    keys[a.key]=true;
    console.log(a.key)
})


//keyup code
document.addEventListener(`keyup`, (d)=>{
    keys[d.key]=false;
})
