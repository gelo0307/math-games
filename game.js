document.addEventListener("DOMContentLoaded", () => {
    const board = document.getElementById("game-board");
    const pointsDisplay = document.getElementById("points");
    const tokensDisplay = document.getElementById("tokens");
    const timerDisplay = document.getElementById("time");
    const notice = document.getElementById("game-notice");

    let grid = [];
    let unclickableSquares = [];
    let points = 0;
    let tokens = 0;
    let time;
    let gameOver = false;
    let previousMatches = [];
    let gridSize = 3; // Default grid size for Easy and Medium
    let timerDuration = 120; // Default timer for Easy (2 minutes)
    let timerInterval; // Global variable to hold the timer interval

    // Sound effects
    const correctSound = new Audio("correct.wav");
    const wrongSound = new Audio("wrong.wav");
    const congratulationsSound = new Audio("congratulations.mp3");


    // Initialize Grid
    function initializeGrid() {
        grid = Array.from({ length: gridSize }, () => Array(gridSize).fill(0));
        unclickableSquares = Array.from({ length: gridSize }, () => Array(gridSize).fill(false));
    
        let maxNumber = gridSize * gridSize;
        let numbers = Array.from({ length: maxNumber }, (_, i) => i + 1);
        numbers = numbers.sort(() => Math.random() - 0.5);
        let index = 0;
    
        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                grid[row][col] = numbers[index++];
            }
        }
    }

    // Render Grid
    function renderGrid() {
        board.innerHTML = "";
        board.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`; // Dynamic grid layout

        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                const cell = document.createElement("div");
                cell.textContent = grid[row][col];
                cell.classList.add("cell");

                if (unclickableSquares[row][col]) {
                    cell.classList.add("unclickable");
                } else if (!gameOver) {
                    cell.addEventListener("click", () => handleCellClick(row, col));
                }

                if (previousMatches.some(([r, c]) => r === row && c === col)) {
                    cell.classList.add("blink-red");
                }
                board.appendChild(cell);
            }
        }
        updateScoreDisplay();
    }

    

    // Handle Cell Click
    function handleCellClick(row, col) {
        if (unclickableSquares[row][col] || gameOver) return;

        let maxNumber = gridSize * gridSize;

        // If the box is already aligned, play the wrong sound
        if (unclickableSquares[row][col]) {
            wrongSound.play(); // Play wrong sound
            return;
        }
    
        grid[row][col] = Math.max(1, grid[row][col] - 1);
    
        if (row > 0 && !unclickableSquares[row - 1][col]) grid[row - 1][col] = Math.min(maxNumber, grid[row - 1][col] + 1);
        if (row < gridSize - 1 && !unclickableSquares[row + 1][col]) grid[row + 1][col] = Math.min(maxNumber, grid[row + 1][col] + 1);
        if (col > 0 && !unclickableSquares[row][col - 1]) grid[row][col - 1] = Math.min(maxNumber, grid[row][col - 1] + 1);
        if (col < gridSize - 1 && !unclickableSquares[row][col + 1]) grid[row][col + 1] = Math.min(maxNumber, grid[row][col + 1] + 1);
    
        checkMatches();
        renderGrid();
    
        if (!checkForValidMoves()) {
            gameOver = true;
            showGameOverNotice("No valid moves left! Game Over!");
        }
    }

    function checkMatches() {
        const matches = [];
        const matchedCells = new Set(); // Track cells that are already matched
    
        // Horizontal Matches
        for (let i = 0; i < gridSize; i++) {
            if (grid[i].every(val => val === grid[i][0])) {
                grid[i].forEach((_, c) => {
                    if (!matchedCells.has(`${i},${c}`)) {
                        matches.push([i, c]);
                        matchedCells.add(`${i},${c}`);
                    }
                });
            }
        }
    
        // Vertical Matches
        for (let i = 0; i < gridSize; i++) {
            if (grid.every(row => row[i] === grid[0][i])) {
                grid.forEach((_, r) => {
                    if (!matchedCells.has(`${r},${i}`)) {
                        matches.push([r, i]);
                        matchedCells.add(`${r},${i}`);
                    }
                });
            }
        }
    
        // Diagonal Matches (Top-left to Bottom-right)
        if (grid.every((_, i) => grid[i][i] === grid[0][0])) {
            grid.forEach((_, i) => {
                if (!matchedCells.has(`${i},${i}`)) {
                    matches.push([i, i]);
                    matchedCells.add(`${i},${i}`);
                }
            });
        }
    
        // Diagonal Matches (Top-right to Bottom-left)
        if (grid.every((_, i) => grid[i][gridSize - 1 - i] === grid[0][gridSize - 1])) {
            grid.forEach((_, i) => {
                if (!matchedCells.has(`${i},${gridSize - 1 - i}`)) {
                    matches.push([i, gridSize - 1 - i]);
                    matchedCells.add(`${i},${gridSize - 1 - i}`);
                }
            });
        }
    
        // Filter out previously matched cells to avoid double counting
        let newMatches = matches.filter(([r, c]) =>
            !previousMatches.some(([pr, pc]) => pr === r && pc === c)
        );
    
        if (newMatches.length > 0) {
            // Adjust scoring based on grid size
            if (gridSize === 3) {
                points += 3;    // 3 points for each match in 3x3 grid
                tokens += 4;    // 4 tokens for each match in 3x3 grid
            } else if (gridSize === 4) {
                points += 4;    // 4 points for each match in 4x4 grid
                tokens += 5;    // 5 tokens for each match in 4x4 grid
            }
    
            previousMatches.push(...newMatches);
    
            // Play the correct sound when a match is made
            correctSound.play();
        }
    
        // Mark matched cells as unclickable
        newMatches.forEach(([r, c]) => {
            unclickableSquares[r][c] = true;
        });
    
        updateScoreDisplay(); // Update the score display after scoring
    }
    
    
    function showGameOverNotice(message) {
        console.log("Game over triggered"); // Add this for debugging
        
        const modal = document.getElementById("game-over-modal");
        const finalPoints = document.getElementById("final-points");
        const finalTokens = document.getElementById("final-tokens");
        
        // Set the text for the final score in the modal
        finalPoints.textContent = `Points: ${points}`;
        finalTokens.textContent = `Tokens: ${tokens}`;
        
        modal.style.display = "block"; // Show the modal
        
        // Play the congratulations sound
        congratulationsSound.play();
    }
    
    // Close the modal when the "x" is clicked
    document.getElementById("close-modal").addEventListener("click", function () {
        document.getElementById("game-over-modal").style.display = "none";
    });
    
    // Close the modal if clicked outside of the content area
    window.addEventListener("click", function (event) {
        const modal = document.getElementById("game-over-modal");
        if (event.target === modal) {
            modal.style.display = "none";
        }
    });
    


    function updateScoreDisplay() {
        // Update the score and tokens display in real-time
        pointsDisplay.textContent = `Points: ${points}`;
        tokensDisplay.textContent = `Tokens: ${tokens}`;
    }

    // Check for Valid Moves
    function checkForValidMoves() {
        return grid.some((row, r) => row.some((_, c) => !unclickableSquares[r][c]));
    }


    function showGameOverNotice(message) {
        console.log("Game over triggered"); // Add this for debugging
        
        const modal = document.getElementById("game-over-modal");
        const finalPoints = document.getElementById("final-points");
        const finalTokens = document.getElementById("final-tokens");
        
        // Set the text for the final score in the modal
        finalPoints.textContent = `Points: ${points}`;
        finalTokens.textContent = `Tokens: ${tokens}`;
        
        modal.style.display = "block"; // Show the modal
        
        // Play the congratulations sound
        congratulationsSound.play();
        
        // Set a timer to stop the sound after 8 seconds
        setTimeout(() => {
            congratulationsSound.pause();
            congratulationsSound.currentTime = 0; // Reset to the start for the next game
        }, 8000); // 8000 milliseconds = 8 seconds
    }
    
    // Close the modal when the "x" is clicked
    document.getElementById("close-modal").addEventListener("click", function () {
        const modal = document.getElementById("game-over-modal");
        modal.style.display = "none";
        
        // Stop the congratulations sound
        congratulationsSound.pause();
        congratulationsSound.currentTime = 0; // Reset to the start for the next game
    });
    
    // Close the modal if clicked outside of the content area
    window.addEventListener("click", function (event) {
        const modal = document.getElementById("game-over-modal");
        if (event.target === modal) {
            modal.style.display = "none";
            
            // Stop the congratulations sound
            congratulationsSound.pause();
            congratulationsSound.currentTime = 0; // Reset to the start for the next game
        }
    });
    
// Close Modal and Stop Sound
function closeModal() {
    const modal = document.getElementById("score-modal");
    if (modal) {
        modal.remove(); // Remove the modal from the DOM
    }

    // Stop the congratulations sound
    congratulationsSound.pause();
    congratulationsSound.currentTime = 0; // Reset to the start for the next game
}

    

    function startGame() {
        points = 0;
        tokens = 0;
        gameOver = false;
        previousMatches = [];
    
        initializeGrid();
        renderGrid();
        startTimer();
    
        // Hide modal if visible from the last game
        const modal = document.getElementById("game-over-modal");
        modal.style.display = "none";
        notice.style.display = "none";
    }
    


    // Start Timer
    function startTimer() {
        // Clear any existing timer intervals to prevent multiple intervals
        if (timerInterval) {
            clearInterval(timerInterval);
        }

        time = timerDuration;
        timerDisplay.textContent = time;

        // Set up the new timer interval
        timerInterval = setInterval(() => {
            if (gameOver) {
                clearInterval(timerInterval); // Stop the timer if the game is over
                return;
            }
            
            time--;
            timerDisplay.textContent = time;

            if (time <= 0 || !checkForValidMoves()) {
                clearInterval(timerInterval);
                gameOver = true;
                showGameOverNotice(time <= 0 ? "Time's up! Game Over!" : "No valid moves left! Game Over!");
            }
        }, 1000); // This will make the timer count down correctly one second at a time
    }

    // Set Difficulty
    function setDifficulty(difficulty) {
        if (difficulty === 'easy') {
            gridSize = 3;
            timerDuration = 120; // 2 minutes for Easy
        } else if (difficulty === 'medium') {
            gridSize = 3;
            timerDuration = 90;  // 1.5 minutes for Medium
        } else if (difficulty === 'hard') {
            gridSize = 4;
            timerDuration = 120; // 2 minutes for Hard
        }
        startGame();
    }

    // Set grid size based on screen width (optional)
function adjustGridSizeForScreen() {
    if (window.innerWidth <= 480) {
        gridSize = 3; // Use smaller grid on small screens
    }
    renderGrid();
}




// Call this function on initial load and whenever the window resizes
window.addEventListener("load", adjustGridSizeForScreen);
window.addEventListener("resize", adjustGridSizeForScreen);


    // Event Listeners
    document.getElementById("easy-btn").addEventListener("click", () => setDifficulty('easy'));
    document.getElementById("medium-btn").addEventListener("click", () => setDifficulty('medium'));
    document.getElementById("hard-btn").addEventListener("click", () => setDifficulty('hard'));
    document.getElementById("reset-btn").addEventListener("click", startGame);

    // Start Time Button functionality
    document.getElementById("start-time-btn").addEventListener("click", () => {
        startTimer(); // Start the timer when clicked
    });

    document.getElementById("close-modal").addEventListener("click", function () {
        const modal = document.getElementById("game-over-modal");
        modal.style.display = "none";
        
        // Stop the congratulations sound
        congratulationsSound.pause();
        congratulationsSound.currentTime = 0; // Reset to the start for the next game
    });
    
    // Close the modal if clicked outside of the content area
    window.addEventListener("click", function (event) {
        const modal = document.getElementById("game-over-modal");
        if (event.target === modal) {
            modal.style.display = "none";
            
            // Stop the congratulations sound
            congratulationsSound.pause();
            congratulationsSound.currentTime = 0; // Reset to the start for the next game
        }
    });
    


    document.addEventListener("DOMContentLoaded", () => {
        // Game Mechanics modal elements
        const gameMechanicsModal = document.getElementById("game-mechanics-modal");
        const gameMechanicsBtn = document.getElementById("game-mechanics-btn");
        const closeBtn = document.querySelector(".close-btn");
    
        // Open modal when button is clicked
        gameMechanicsBtn.addEventListener("click", () => {
            gameMechanicsModal.style.display = "flex";
        });
    
        // Close modal when "X" is clicked
        closeBtn.addEventListener("click", () => {
            gameMechanicsModal.style.display = "none";
        });
    
        // Close modal if clicked outside the modal content
        window.addEventListener("click", (event) => {
            if (event.target === gameMechanicsModal) {
                gameMechanicsModal.style.display = "none";
            }
        });
    });

    startGame(); // Start with the default difficulty
});
