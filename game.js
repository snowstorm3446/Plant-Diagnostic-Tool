const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');
const deathScreen = document.getElementById('deathScreen');
const scoreDisplay = document.getElementById('scoreDisplay');
const restartButton = document.getElementById('restartButton');

// Set the play area size for 9:16 aspect ratio
const playAreaWidth = 540; // 9
const playAreaHeight = 960; // 16

canvas.width = playAreaWidth;
canvas.height = playAreaHeight;

const ship = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    width: 50,
    height: 50,
    image: new Image()
};

ship.image.src = 'playership.png'; // Placeholder image URL for the ship

// Event listener to update ship position based on mouse movement
canvas.addEventListener('mousemove', function(event) {
    const rect = canvas.getBoundingClientRect();
    ship.x = event.clientX - rect.left - ship.width / 2;
    ship.y = event.clientY - rect.top - ship.height / 2;
    
    // Ensure the ship stays within the play area
    ship.x = Math.max(0, Math.min(ship.x, canvas.width - ship.width));
    ship.y = Math.max(0, Math.min(ship.y, canvas.height - ship.height));
});

// Obstacle properties
const obstacleHeight = 80;
const obstacleGap = 200;
let obstacleSpeed = 2;
let obstacles = [];
let score = 0;
let highScore = 0;
let gameRunning = true;
let obstacleInterval = 2000; // Initial obstacle creation interval
let obstacleCreationTimeout;

// Function to create obstacles
function createObstacle() {
    const gapStart = Math.random() * (canvas.width - obstacleGap);
    obstacles.push({
        x: 0,
        y: -obstacleHeight,
        width: gapStart
    });
    obstacles.push({
        x: gapStart + obstacleGap,
        y: -obstacleHeight,
        width: canvas.width - (gapStart + obstacleGap)
    });

    // Schedule the next obstacle creation
    if (gameRunning) {
        obstacleCreationTimeout = setTimeout(createObstacle, obstacleInterval);
    }
}

function drawObstacles() {
    context.fillStyle = 'red';
    obstacles.forEach(obstacle => {
        context.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacleHeight);
    });
}

function updateObstacles() {
    obstacles.forEach(obstacle => {
        obstacle.y += obstacleSpeed;
    });
    obstacles = obstacles.filter(obstacle => obstacle.y < canvas.height);
}

function checkCollision() {
    for (let obstacle of obstacles) {
        if (
            ship.x < obstacle.x + obstacle.width &&
            ship.x + ship.width > obstacle.x &&
            ship.y < obstacle.y + obstacleHeight &&
            ship.y + ship.height > obstacle.y
        ) {
            return true;
        }
    }
    return false;
}

function drawShip() {
    context.drawImage(ship.image, ship.x, ship.y, ship.width, ship.height);
}

function drawBorder() {
    const borderWidth = 20;
    context.fillStyle = 'rgba(255, 255, 255, 0.2)';
    context.fillRect(0, 0, playAreaWidth, borderWidth); // Top border
    context.fillRect(0, 0, borderWidth, playAreaHeight); // Left border
    context.fillRect(0, playAreaHeight - borderWidth, playAreaWidth, borderWidth); // Bottom border
    context.fillRect(playAreaWidth - borderWidth, 0, borderWidth, playAreaHeight); // Right border
}

function drawScores() {
    context.fillStyle = 'white';
    context.font = '24px Arial';
    context.textAlign = 'left';
    context.fillText(`Score: ${score}`, 10, 30);
    context.fillText(`High Score: ${highScore}`, 10, 60);
}

function increaseDifficulty() {
    if (gameRunning) {
        obstacleSpeed += 0.5; // Increase obstacle speed more noticeably
        obstacleInterval = Math.max(500, obstacleInterval - 100); // Decrease obstacle interval faster, minimum 500ms
        setTimeout(increaseDifficulty, 5000); // Adjust difficulty every 5 seconds
    }
}

function gameLoop() {
    if (gameRunning) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        drawBorder();
        updateObstacles();
        drawObstacles();
        drawShip();
        drawScores();
        score++;
        if (checkCollision()) {
            gameRunning = false;
            endGame();
        }
        requestAnimationFrame(gameLoop);
    }
}

function endGame() {
    clearTimeout(obstacleCreationTimeout); // Clear the obstacle creation timeout
    deathScreen.style.display = 'block';
    scoreDisplay.textContent = `Score: ${score} \nHigh Score: ${highScore}`;
    if (score > highScore) {
        highScore = score;
    }
}

function restartGame() {
    deathScreen.style.display = 'none';
    obstacles = [];
    score = 0;
    obstacleSpeed = 2;
    obstacleInterval = 2000;
    ship.x = canvas.width / 2;
    ship.y = canvas.height / 2;
    gameRunning = true;
    gameLoop();
    createObstacle(); // Start obstacle creation
    increaseDifficulty(); // Start difficulty increase
}

// Start the game loop
ship.image.onload = function() {
    gameLoop();
    createObstacle(); // Start obstacle creation
    increaseDifficulty(); // Start difficulty increase
};

restartButton.addEventListener('click', restartGame);
