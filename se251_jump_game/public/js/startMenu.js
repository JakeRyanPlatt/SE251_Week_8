window.addEventListener("load", () =>{

    const startBtn = document.getElementById("start-btn");
    const optionsBtn = document.getElementById("options-btn");
    const scoreBtn = document.getElementById("score-btn");

    const startMenu = document.getElementById("menu");
    const gameSection = document.getElementById("game");

    const optionsPanel = document.getElementById("options-panel");
    const scorePanel = document.getElementById("score-panel");

    const backButtons = document.querySelectorAll(".back-btn")

    //Start Game
    startBtn.addEventListener("click", () =>{
        
        startMenu.classList.add("hidden");
        gameSection.classList.remove("hidden");
        startGame();
    });

    //Options
    optionsBtn.addEventListener("click", () =>{
        
        optionsPanel.classList.remove("hidden");
        scorePanel.classList.add("hidden");
    });

    //Scoreboard
    scoreBtn.addEventListener("click", () =>{
        
        scorePanel.classList.remove("hidden");
        optionsPanel.classList.add("hidden");
    });

    //Back Buttons
    backButtons.addEventListener("click", (e) =>{
        button.addEventListener("click", () =>{
            optionsPanel.classList.add("hidden");
            scorePanel.classList.add("hidden");
        });
    
    });

});

//Game Wrapper
function startGame(){
    if(typeof init === "function"){
        init();
    } else{
        console.error("Not found int jump.js");
    }
}