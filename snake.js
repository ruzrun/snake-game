const backgroundMusic = new Audio("audio/game.mp3");
backgroundMusic.loop = true;
backgroundMusic.volume = 0.25;

const collectSound = new Audio("audio/collect.mp3");
collectSound.volume = 0.7;

const gameOverSound = new Audio("audio/gameover.mp3");
gameOverSound.volume = 0.7;

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const gridSize = 20;
const tileCount = 20;

canvas.width = gridSize * tileCount;
canvas.height = gridSize * tileCount;

let snake = [];
let food = {};
let direction = "RIGHT";
let nextDirection = "RIGHT";
let score = 0;
let gameRunning = false;
let gameLoop;

let highScore = localStorage.getItem("loveSnakeHighScore") || 0;
document.getElementById("highScore").textContent = highScore;

//to low thwe sound in fade
function lowerMusicVolume() {
    if (backgroundMusic.volume <= 0.125) {
        return;
    }

    const fade = setInterval(() => {
        if (backgroundMusic.volume > 0.125) {
            backgroundMusic.volume -= 0.01;
        } else {
            backgroundMusic.volume = 0.125;
            clearInterval(fade);
        }
    }, 50);
}

function startGame() {
    snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
    ];

    direction = "RIGHT";
    nextDirection = "RIGHT";
    score = 0;
    food = createFood();
    gameRunning = true;

    //function to lower the bg sound 
    lowerMusicVolume();

    document.getElementById("score").textContent = score;
    document.getElementById("gameMessage").textContent = "Collect the hearts 💕";

    clearInterval(gameLoop);
    gameLoop = setInterval(gameUpdate, 150);

    drawGame();
}

function gameUpdate() {
    if (!gameRunning) return;

    direction = nextDirection;

    const head = {
        x: snake[0].x,
        y: snake[0].y
    };

    if (direction === "UP") head.y--;
    if (direction === "DOWN") head.y++;
    if (direction === "LEFT") head.x--;
    if (direction === "RIGHT") head.x++;

    if (
        head.x < 0 ||
        head.x >= tileCount ||
        head.y < 0 ||
        head.y >= tileCount
    ) {
        gameOver();
        return;
    }

    for (let i = 0; i < snake.length; i++) {
        if (
            head.x === snake[i].x &&
            head.y === snake[i].y
        ) {
            gameOver();
            return;
        }
    }

    snake.unshift(head);

    if (
        head.x === food.x &&
        head.y === food.y
    ) {
        score++;
        //collectsound
        collectSound.currentTime = 0;
        collectSound.play();

        document.getElementById("score").textContent = score;

        if (score > highScore) {
            highScore = score;
            localStorage.setItem("loveSnakeHighScore", highScore);
            document.getElementById("highScore").textContent = highScore;
        }

        food = createFood();
        updateMessage();
    } else {
        snake.pop();
    }

    drawGame();
}

function createFood() {
    let newFood;

    do {
        newFood = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };
    } while (
        snake.some(
            part =>
                part.x === newFood.x &&
                part.y === newFood.y
        )
    );

    return newFood;
}

function drawGame() {
    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    drawGrid();
    drawFood();

    snake.forEach((part, index) => {
        if (index === 0) {
            drawSnakeHead(part);
        } else {
            drawSnakeBody(part);
        }
    });
}

function drawGrid() {
    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
    ctx.lineWidth = 1;

    for (let i = 0; i <= tileCount; i++) {
        ctx.beginPath();
        ctx.moveTo(i * gridSize, 0);
        ctx.lineTo(i * gridSize, canvas.height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i * gridSize);
        ctx.lineTo(canvas.width, i * gridSize);
        ctx.stroke();
    }
}

function drawSnakeHead(part) {
    const x = part.x * gridSize;
    const y = part.y * gridSize;

    ctx.fillStyle = "#fa93c7";

    ctx.beginPath();
    ctx.arc(
        x + gridSize / 2,
        y + gridSize / 2,
        gridSize / 2 - 2,
        0,
        Math.PI * 2
    );
    ctx.fill();

    ctx.fillStyle = "white";

    ctx.beginPath();
    ctx.arc(x + 7, y + 7, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(x + 13, y + 7, 2, 0, Math.PI * 2);
    ctx.fill();
}

function drawSnakeBody(part) {
    const x = part.x * gridSize;
    const y = part.y * gridSize;

    ctx.fillStyle = "rgba(250, 147, 199, 0.75)";

    ctx.beginPath();
    ctx.arc(
        x + gridSize / 2,
        y + gridSize / 2,
        gridSize / 2 - 3,
        0,
        Math.PI * 2
    );
    ctx.fill();
}

function drawFood() {
    const x = food.x * gridSize + gridSize / 2;
    const y = food.y * gridSize + gridSize / 2;

    ctx.font = "18px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillText("💕", x, y);
}

function gameOver() {
    gameRunning = false;
    clearInterval(gameLoop);

    gameOverSound.currentTime = 0;
    gameOverSound.play();

    document.getElementById("gameMessage").textContent =
        `Game Over 💔 Final Score: ${score}`;

    drawGame();

    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.font = "bold 28px Georgia";

    ctx.fillText(
        "Game Over 💔",
        canvas.width / 2,
        canvas.height / 2 - 10
    );

    ctx.font = "18px Georgia";

    ctx.fillText(
        `Score: ${score}`,
        canvas.width / 2,
        canvas.height / 2 + 25
    );
}

function updateMessage() {
    const messages = [
        "You found a heart 💕",
        "Keep going, love 🥰",
        "You are doing great 💗",
        "Another heart for you 💌",
        "Don't stop now ⭐"
    ];

    const randomMessage =
        messages[Math.floor(Math.random() * messages.length)];

    document.getElementById("gameMessage").textContent =
        randomMessage;
}

function changeDirection(newDirection) {
    if (!gameRunning) return;

    if (
        newDirection === "UP" &&
        direction !== "DOWN"
    ) {
        nextDirection = "UP";
    }

    if (
        newDirection === "DOWN" &&
        direction !== "UP"
    ) {
        nextDirection = "DOWN";
    }

    if (
        newDirection === "LEFT" &&
        direction !== "RIGHT"
    ) {
        nextDirection = "LEFT";
    }

    if (
        newDirection === "RIGHT" &&
        direction !== "LEFT"
    ) {
        nextDirection = "RIGHT";
    }
}

document.addEventListener("keydown", function(event) {
    if (event.key === "ArrowUp") {
        changeDirection("UP");
    }

    if (event.key === "ArrowDown") {
        changeDirection("DOWN");
    }

    if (event.key === "ArrowLeft") {
        changeDirection("LEFT");
    }

    if (event.key === "ArrowRight") {
        changeDirection("RIGHT");
    }
});

document.getElementById("upButton").addEventListener(
    "click",
    function() {
        changeDirection("UP");
    }
);

document.getElementById("downButton").addEventListener(
    "click",
    function() {
        changeDirection("DOWN");
    }
);

document.getElementById("leftButton").addEventListener(
    "click",
    function() {
        changeDirection("LEFT");
    }
);

document.getElementById("rightButton").addEventListener(
    "click",
    function() {
        changeDirection("RIGHT");
    }
);

document.getElementById("startButton").addEventListener(
    "click",
    startGame
);

document.getElementById("backButton").addEventListener(
    "click",
    function() {
        window.location.href = "../../";
    }
);

function drawInitialScreen() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.15)";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    ctx.textAlign = "center";
    ctx.font = "20px Georgia";

    ctx.fillText(
        "Press Start 💕",
        canvas.width / 2,
        canvas.height / 2
    );
}

drawInitialScreen();
