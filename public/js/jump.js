//canvas and context

let highScore = localStorage.getItem(`highscore`);
let score = localStorage.getItem(`score`);
if(highScore == null)
{
    highScore = 0;
}
var c = document.querySelector(`#jump`);
var ctx = c.getContext(`2d`);
var states = [];
var o = [];

var timer, currentState;
var scoreBoard;

var player = new Box().setProps({x: c.width/2, w:64 , h:64,  force:1, fill:`#ffff00`, score: 0, highscore: highScore});
var ground = new Box().setProps({fill:`#00ff00`, h:64, w:c.width, y:c.height });
var plat = [
    new Box().setProps({fill:`#883333`, h:64, w:200, y:-c.height/2, vy:5 }),
    new Box().setProps({fill:`#883333`, h:64, w:200, y:-c.height, vy:5}),
]
init();

//Main Game Loop
function main()
{
    //erases the canvas
    ctx.clearRect(0,0,c.width,c.height);
    states[currentState]();
}

function init()
{   
    //pad 1 and 2
    o[0] = player
    o[1] = ground
    o[2] = plat[0]
    o[3] = plat[1]
    scoreBoard = document.querySelectorAll(`#score div p`);
    currentState = `game`;
    //timer to make the game run at 60fps
    clearTimeout(timer);
    timer = setInterval(main, 1000/60);
}

states[`death`] = function()
{
    clearTimeout(timer);
    
    const playerName = prompt('Game Over! Enter your name for the leaderboard:');
    
    if (playerName) {
        submitScore(playerName, player.score).then(() => {
            loadLeaderboard();
            showLeaderboard();
        });
    } else {
        window.location = `index.html`;
        states[`game`]();
    }
}
states[`pause`] = function(){
    o.forEach(function (i){
        i.draw()
    })
    scoreBoard[0].innerHTML = `Score: ${player.score}`;
    scoreBoard[1].innerHTML = `High Score: ${player.highscore}`;
    if(keys[`Escape`])
    {
        currentState =`game`
    }
   
}
states[`game`] = function()
{
    if(keys[`Escape`])
    {
        currentState = `pause`;
        return;
    }

    if(keys[`ArrowLeft`])
    {
        player.vx += -1
    }
    if(keys[`ArrowRight`])
    {
        player.vx += 1
    }

    //friction
    player.vx *= .87
    //gravity
    player.vy += 1;
    player.move();

    if(player.y > c.height +player.h)
    {
        currentState = `death`
    }
    plat.forEach((i)=>{
        i.move()
        if(i.y > c.height + i.h)
        {
            i.y = -i.h
            i.x = rand(0, c.width)
        }
        
        if(i.collidePoint(player.bottom()) && player.vy > 1){
            if(player.score > player.highscore)
            {
                player.highscore = player.score;
                localStorage.setItem(`highscore`, player.highscore);
            }
            localStorage.setItem(`score`, player.score);
            scoreBoard[0].innerHTML = `Score: ${player.score}`;
            scoreBoard[1].innerHTML = `High Score: ${player.highscore}`;
        }

        while(i.collidePoint(player.bottom()) && player.vy > 1)
        {
            console.log(0)
            player.y--;
            player.vy = -30;
            ground.x = 10000;
            player.score += 1;
        }
    })

    while(ground.collidePoint(player.bottom()))
    {
        console.log(0)
        player.y--;
        player.vy = -30;
    }
    while(player.x < 0 + player.w/2)
    {
        player.x++;
        player.vx = 30;
    }
   while(player.x > c.width - player.w/2)
    {
        player.x--;
        player.vx = -25;
    }
    

    //draw the objects (Uses the array forEach function where i is the object stored in the o Array)
    o.forEach(function (i){
        i.draw()
    })
    scoreBoard[0].innerHTML = `Score: ${player.score}`;
    scoreBoard[1].innerHTML = `High Score: ${player.highscore}`;
}

function rand(low, high)
{
    return Math.random() * (high - low) + low;
}

// Fetch and display leaderboard
async function loadLeaderboard() {
    try {
        const response = await fetch('/highscores');
        const scores = await response.json();
        
        const leaderboardList = document.getElementById('highscores-list');
        leaderboardList.innerHTML = '';
        
        scores.forEach((score, index) => {
            const li = document.createElement('li');
            li.textContent = `${score.player} - ${score.score}`;
            leaderboardList.appendChild(li);
        });
    } catch (error) {
        console.error('Error loading leaderboard:', error);
    }
}

// Submit score to server
async function submitScore(playerName, score) {
    try {
        const response = await fetch('/highscores', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ player: playerName, score: score })
        });
        
        const result = await response.json();
        console.log('Score submitted:', result);
        return result;
    } catch (error) {
        console.error('Error submitting score:', error);
    }
}

// Show leaderboard screen
function showLeaderboard() {
    document.getElementById('game').style.display = 'none';
    document.getElementById('leaderboard').style.display = 'block';
}

// Reset game and play again
function playAgain() {
    // Reset player
    player.score = 0;
    player.highscore = localStorage.getItem(`highscore`) || 0;
    player.x = c.width/2;
    player.y = 0;
    player.vx = 0;
    player.vy = 0;
    
    // Reset platforms
    plat[0].y = -c.height/2;
    plat[1].y = -c.height;
    
    // Reset UI
    document.getElementById('game').style.display = 'block';
    document.getElementById('leaderboard').style.display = 'none';
    
    // Restart game
    init();
}