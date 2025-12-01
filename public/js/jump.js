//canvas and context

let highScore = localStorage.getItem(`highscore`);
let score = localStorage.getItem(`score`);

var c = document.querySelector(`#jump`);
var ctx = c.getContext(`2d`);
var states = [];
var o = [];

var timer, currentState;
var scoreBoard;

var player = new Box().setProps({ x: c.width / 2, w: 64, h: 64, force: 1, fill: `#ffff00` });
var ground = new Box().setProps({ fill: `#00ff00`, h: 64, w: c.width, y: c.height });
var plat = [
    new Box().setProps({ fill: `#883333`, h: 64, w: 200, y: -c.height / 2, vy: 5 }),
    new Box().setProps({ fill: `#883333`, h: 64, w: 200, y: -c.height, vy: 5 }),
]

// init(); // Don't auto-start

//Main Game Loop
function main() {
    //erases the canvas
    ctx.clearRect(0, 0, c.width, c.height);
    states[currentState]();
}

window.startGame = function () {
    init();
}

function init() {
    console.log("Initializing game...");
    // Apply Options
    const boxColorInput = document.getElementById('box-color');
    const bgSelect = document.getElementById('bg-select');
    // establish initial platform positions
    plat[0].y = -c.height / 2;
    plat[1].y = -c.height;
    ground.y = c.height;

    if (boxColorInput) {
        player.fill = boxColorInput.value;
    }

    if (bgSelect) {
        if (bgSelect.value === 'rainy') {
            document.body.classList.add('rainy-forest');
        } else {
            document.body.classList.remove('rainy-forest');
        }
    }

    //pad 1 and 2
    o[0] = player
    o[1] = ground
    o[2] = plat[0]
    o[3] = plat[1]

    // Reset player position and velocity
    player.x = c.width / 2;
    player.y = 0;
    player.vx = 0;
    player.vy = 0;
    player.score = 0;
    player.highscore = localStorage.getItem(`highscore`);

    scoreBoard = document.querySelectorAll(`#score div p`);
    currentState = `game`;
    //timer to make the game run at 60fps
    clearInterval(timer);
    timer = setInterval(main, 1000 / 60);

}

window.stopGame = function () {
    console.log("Stopping game loop...");
    clearInterval(timer);
    timer = null;
}

states[`death`] = function()
{
    clearTimeout(timer);
    
    const playerName = prompt('Game Over! Enter your name for the leaderboard:');
    
    if (playerName != null && playerName.trim() !== '') {
        submitScore(playerName, player.score).then(() => {
            loadLeaderboard();
            showLeaderboard();
        });
    } else {
        window.location = `index.html`;
        currentState = `menu`;
    }
}

states[`pause`] = function () {
    o.forEach(function (i) {
        i.draw()
    })
    scoreBoard[0].innerHTML = `Score: ${player.score}`;
    scoreBoard[1].innerHTML = `High Score: ${player.highscore}`;
    if(keys[`Escape`])
    {
        currentState =`game`;
    }

}
states[`game`] = function()
{
    if(keys[`Escape`])
    {
        currentState = `pause`;
        return;
    }

    if (keys[`ArrowLeft`]) {
        player.vx += -1
    }
    if (keys[`ArrowRight`]) {
        player.vx += 1
    }
    if (keys[`a`]) {
        player.vx += -1
    }
    if (keys[`d`]) {
        player.vx += 1
    }


    //friction
    player.vx *= .87
    //gravity
    player.vy += 1;
    player.move();

    if (player.y > c.height + player.h) {
        currentState = `death`
    }
    plat.forEach((i) => {
        i.move()
        if (i.y > c.height + i.h) {
            i.y = -i.h
            i.x = rand(0, c.width)
        }
// scoring on collide is off by 1 for high score counter
        if(i.collidePoint(player.bottom()) && player.vy > 1){
            
        }

        while (i.collidePoint(player.bottom()) && player.vy > 1) {
            player.y--;
            player.vy = -30;
            ground.x = 10000;
            player.score += 1;
            if(player.score > player.highscore)
            {
                player.highscore = player.score;
                localStorage.setItem(`highscore`, player.highscore);
            }

            localStorage.setItem(`score`, player.score);
            scoreBoard[0].innerHTML = `Score: ${player.score}`;
            scoreBoard[1].innerHTML = `High Score: ${player.highscore}`;
        }
    })

    while (ground.collidePoint(player.bottom())) {
        player.y--;
        player.vy = -30;
    }
    while (player.x < 0 + player.w / 2) {
        player.x++;
        player.vx = 30;
    }
    while (player.x > c.width - player.w / 2) {
        player.x--;
        player.vx = -25;
    }


    //draw the objects (Uses the array forEach function where i is the object stored in the o Array)
    o.forEach(function (i) {
        i.draw()
    })
    scoreBoard[0].innerHTML = `Score: ${player.score}`;
    scoreBoard[1].innerHTML = `High Score: ${player.highscore}`;
}

function rand(low, high) {
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

    // Show leaderboard screen
async function loadLeaderboardInMenu(){
const leaderboardList  = document.getElementById('highscore-list'); //defined at top for scope
    try {
        const response = await fetch('/highscores');
        const scores = await response.json();
        leaderboardList.innerHTML = '';
        
        // Check if scores is an array

        if (Array.isArray(scores) && scores.length > 0) {
            leaderboardList.innerHTML = '';
            scores.forEach((score, index) => {
                const li = document.createElement('li');
                li.textContent = `${index++}.${score.player} - ${score.score}`;
                leaderboardList.appendChild(li);
            });
        } else {
            // Empty array, no scores yet
                const li = document.createElement('li');
                li.textContent = `${index + 1}. ${score.player} - ${score.score}`;
                leaderboardList.appendChild(li);
        }
 
} catch (error) {
    console.error('Error Loading Leaderboard:', error);
   // local storage if server is not running
    leaderboardList.innerHTML = '';
    const highScore = localStorage.getItem('highscore');
    const li = document.createElement('li');
    li.textContent = `Your High Score: ${highScore}`;
    leaderboardList.appendChild(li);
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
    player.highscore = localStorage.getItem(`highscore`); // Update highscore from localStorage, this should show only for the player
    console.log(player.highscore);
    player.x = c.width/2;
    player.y = 0;
    player.vx = 0;
    player.vy = 0;
    
    // Reset platforms
    plat[0].y = -c.height/2;
    plat[1].y = -c.height;
    ground.y = c.height;
    ground.x = c.width/2;
    
    // Reset UI
    document.getElementById('game').style.display = 'block';
    document.getElementById('leaderboard').style.display = 'none';
    
    // Restart game
    init();
}
