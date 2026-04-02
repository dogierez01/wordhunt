// THE DATABASE: Organized by word length
const wordsDB = {
    3: [
        { word: "FOX", scrambled: ["O", "X", "F"], tr: "Tilki", hintPic: "🦊" },
        { word: "FAT", scrambled: ["T", "A", "F"], tr: "Şişman", hintPic: "🍔" }
        // You can add up to 8 more here
    ],
    4: [
        { word: "BIRD", scrambled: ["D", "I", "R", "B"], tr: "Kuş", hintPic: "🐦" }
        // 9 more spots available
    ],
    5: [
        { word: "SPARE", scrambled: ["R", "E", "P", "A", "S"], tr: "Esirgemek / Yedek", hintPic: "🚗" }
        // 9 more spots available
    ],
    6: [
        // 10 spots available
    ],
    7: [
        // 10 spots available
    ]
};

let totalScore = 0;
let currentMaxScore = 20;
let activeWord = null;

// DOM Elements
const lobbyScreen = document.getElementById("lobby-screen");
const gameScreen = document.getElementById("game-screen");
const lobbyGrid = document.getElementById("lobby-grid");
const targetSlotsContainer = document.getElementById("target-slots");
const scrambledLettersContainer = document.getElementById("scrambled-letters");
const messageArea = document.getElementById("message-area");
const lobbyTotalScoreEl = document.getElementById("lobby-total-score");
const gameTotalScoreEl = document.getElementById("game-total-score");

// 1. GENERATE THE LOBBY
function buildLobby() {
    lobbyGrid.innerHTML = "";
    
    // Loop through lengths 3 to 7
    for (let length = 3; length <= 7; length++) {
        const categoryDiv = document.createElement("div");
        categoryDiv.classList.add("lobby-category");
        categoryDiv.innerHTML = `<h3>${length} Letter Words</h3>`;
        
        const spotGrid = document.createElement("div");
        spotGrid.classList.add("spot-grid");

        // Create exactly 10 spots for each category
        for (let i = 0; i < 10; i++) {
            const btn = document.createElement("button");
            btn.classList.add("spot-btn");
            btn.textContent = i + 1;

            // Check if we actually have data for this spot
            if (wordsDB[length] && wordsDB[length][i]) {
                btn.addEventListener("click", () => startGame(wordsDB[length][i]));
            } else {
                btn.classList.add("empty");
                btn.addEventListener("click", () => alert("Word coming soon! You haven't added data for this spot yet."));
            }
            
            spotGrid.appendChild(btn);
        }
        
        categoryDiv.appendChild(spotGrid);
        lobbyGrid.appendChild(categoryDiv);
    }
}

// 2. START THE GAME
function startGame(wordData) {
    activeWord = wordData;
    currentMaxScore = 20;
    messageArea.textContent = "";
    
    lobbyScreen.style.display = "none";
    gameScreen.style.display = "block";

    // Build empty slots
    targetSlotsContainer.innerHTML = "";
    for (let i = 0; i < activeWord.word.length; i++) {
        const slot = document.createElement("div");
        slot.classList.add("slot");
        slot.addEventListener("click", () => returnLetterFromSlot(slot));
        targetSlotsContainer.appendChild(slot);
    }

    // Build scrambled tiles
    scrambledLettersContainer.innerHTML = "";
    activeWord.scrambled.forEach((letter, index) => {
        const tile = document.createElement("button");
        tile.classList.add("letter-tile");
        tile.textContent = letter;
        tile.dataset.id = index;
        tile.addEventListener("click", () => moveLetterToSlot(tile));
        scrambledLettersContainer.appendChild(tile);
    });
}

// 3. BACK TO LOBBY
document.getElementById("btn-back").addEventListener("click", () => {
    gameScreen.style.display = "none";
    lobbyScreen.style.display = "block";
});

// 4. GAMEPLAY MECHANICS (Same as before)
function moveLetterToSlot(tile) {
    const slots = Array.from(targetSlotsContainer.children);
    const emptySlot = slots.find(slot => slot.textContent === "");

    if (emptySlot) {
        emptySlot.textContent = tile.textContent;
        emptySlot.dataset.tileId = tile.dataset.id;
        tile.disabled = true;
    }
}

function returnLetterFromSlot(slot) {
    if (slot.textContent !== "") {
        const tileId = slot.dataset.tileId;
        const originalTile = scrambledLettersContainer.querySelector(`[data-id='${tileId}']`);
        originalTile.disabled = false;
        slot.textContent = "";
        delete slot.dataset.tileId;
    }
}

// Keyboard Support
document.addEventListener("keydown", (e) => {
    if (gameScreen.style.display === "none") return; // Only work when game is active

    const key = e.key.toUpperCase();
    const availableTiles = Array.from(scrambledLettersContainer.children).filter(t => !t.disabled);
    
    if (/[A-Z]/.test(key) && key.length === 1) {
        const tileToMove = availableTiles.find(t => t.textContent === key);
        if (tileToMove) moveLetterToSlot(tileToMove);
    }
    
    if (e.key === "Backspace") {
        const slots = Array.from(targetSlotsContainer.children);
        for (let i = slots.length - 1; i >= 0; i--) {
            if (slots[i].textContent !== "") {
                returnLetterFromSlot(slots[i]);
                break;
            }
        }
    }
    
    if (e.key === "Enter") checkWord();
});

document.getElementById("btn-clear").addEventListener("click", () => {
    const slots = Array.from(targetSlotsContainer.children);
    slots.forEach(slot => returnLetterFromSlot(slot));
});

function updateScoreDisplays() {
    lobbyTotalScoreEl.textContent = totalScore;
    gameTotalScoreEl.textContent = totalScore;
}

function checkWord() {
    const slots = Array.from(targetSlotsContainer.children);
    const assembledWord = slots.map(slot => slot.textContent).join("");

    if (assembledWord.length < activeWord.word.length) {
        messageArea.style.color = "#e67e22";
        messageArea.textContent = "Fill all boxes first!";
        return;
    }

    if (assembledWord === activeWord.word) {
        totalScore += currentMaxScore;
        updateScoreDisplays();
        messageArea.style.color = "#2ecc71";
        messageArea.textContent = `Correct! +${currentMaxScore} Points. Returning to Lobby...`;
        
        setTimeout(() => {
            document.getElementById("btn-back").click(); // Trigger back to lobby
        }, 2000);
    } else {
        messageArea.style.color = "#e74c3c";
        messageArea.textContent = "Incorrect, try again.";
        setTimeout(() => { messageArea.textContent = ""; }, 1500);
    }
}

document.getElementById("btn-submit").addEventListener("click", checkWord);

// 5. HINTS
document.getElementById("btn-pic").addEventListener("click", () => {
    messageArea.style.color = "#3498db";
    messageArea.textContent = activeWord.hintPic;
    if (currentMaxScore > 18) currentMaxScore = 18;
});

document.getElementById("btn-tr").addEventListener("click", () => {
    messageArea.style.color = "#3498db";
    messageArea.textContent = `TR: ${activeWord.tr}`;
    if (currentMaxScore > 16) currentMaxScore = 16;
});

document.getElementById("btn-audio").addEventListener("click", () => {
    messageArea.style.color = "#3498db";
    messageArea.textContent = "🔊 Playing Audio...";
    
    const utterance = new SpeechSynthesisUtterance(activeWord.word);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);

    if (currentMaxScore > 14) currentMaxScore = 14;
});

// Initialize on page load
buildLobby();
updateScoreDisplays();
