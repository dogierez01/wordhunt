// The Vocabulary List (You can add as many 3 to 7 letter words here as you want)
const wordList = ["FOX", "FAT", "SPARE", "GHOST", "PLANET", "CODE", "SMART"];

// Game State Variables
let currentWord = "";
let selectedLetters = [];
let availableTiles = [];
let score = 0;

// DOM Elements
const targetSlotsContainer = document.getElementById('target-slots');
const letterBankContainer = document.getElementById('letter-bank');
const submitBtn = document.getElementById('submit-btn');
const clearBtn = document.getElementById('clear-btn');
const scoreDisplay = document.getElementById('score');

// Initialize the game
function initGame() {
    score = 0;
    updateScoreDisplay();
    loadNewWord();
}

// Load a random word from the list
function loadNewWord() {
    // Pick a random word
    const randomIndex = Math.floor(Math.random() * wordList.length);
    currentWord = wordList[randomIndex];
    
    // Reset state
    selectedLetters = [];
    availableTiles = [];
    
    // Scramble the word
    const scrambled = scrambleWord(currentWord);
    
    // Render the UI
    renderSlots();
    renderTiles(scrambled);
}

// Fisher-Yates shuffle algorithm to scramble the letters
function scrambleWord(word) {
    let arr = word.split('');
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    // Make sure it doesn't accidentally spell the word right away
    if (arr.join('') === word && word.length > 1) {
        return scrambleWord(word);
    }
    return arr;
}

// Create the empty boxes at the top
function renderSlots() {
    targetSlotsContainer.innerHTML = '';
    for (let i = 0; i < currentWord.length; i++) {
        const slot = document.createElement('div');
        slot.classList.add('slot');
        // If a letter is selected for this position, show it; otherwise leave blank
        slot.textContent = selectedLetters[i] ? selectedLetters[i].letter : '_';
        targetSlotsContainer.appendChild(slot);
    }
}

// Create the clickable letter tiles at the bottom
function renderTiles(scrambledArray) {
    letterBankContainer.innerHTML = '';
    availableTiles = scrambledArray.map((letter, index) => {
        return { id: index, letter: letter, isUsed: false };
    });

    availableTiles.forEach(tileData => {
        const tile = document.createElement('div');
        tile.classList.add('tile');
        tile.textContent = tileData.letter;
        
        tile.addEventListener('click', () => handleTileClick(tileData, tile));
        letterBankContainer.appendChild(tile);
    });
}

// Logic for when a player taps a letter
function handleTileClick(tileData, tileElement) {
    // Only allow clicking if there is room in the target slots
    if (!tileData.isUsed && selectedLetters.length < currentWord.length) {
        tileData.isUsed = true;
        tileElement.classList.add('hidden'); // Hide the tile from the bank
        selectedLetters.push(tileData); // Add to our selected array
        renderSlots(); // Update the top display
    }
}

// Logic for the Clear Button
function handleClear() {
    selectedLetters = [];
    
    // Reset all tiles to unused and visible
    availableTiles.forEach(tile => tile.isUsed = false);
    const tileElements = document.querySelectorAll('.tile');
    tileElements.forEach(tile => tile.classList.remove('hidden'));
    
    renderSlots();
}

// Logic for the Submit Button
function handleSubmit() {
    // Check if they have filled all slots
    if (selectedLetters.length !== currentWord.length) {
        alert("Fill in all the letters first!");
        return;
    }

    // Combine the selected letters to form their guess
    const guess = selectedLetters.map(t => t.letter).join('');

    if (guess === currentWord) {
        // Success!
        score += currentWord.length * 10; // Simple scoring based on length
        updateScoreDisplay();
        
        // Brief pause so they see they got it right, then load the next word
        setTimeout(() => {
            loadNewWord();
        }, 500);
    } else {
        // Failure!
        alert("Not quite right. Try again!");
        handleClear();
    }
}

function updateScoreDisplay() {
    scoreDisplay.textContent = `SCORE: ${score}`;
}

// Event Listeners for the buttons
submitBtn.addEventListener('click', handleSubmit);
clearBtn.addEventListener('click', handleClear);

// Start the game when the page loads
initGame();
