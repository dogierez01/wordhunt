// The Database (Structured for the future Campaign Lobby)
const db = [
    {
        category: 4,
        stage: 1,
        baseWord: "BEAR",
        turkish: "AYI",
        image: "🐻", // Replace with your image paths later (e.g., 'images/bear.png')
        bonusTargets: [
            { targetWord: "EAR", image: "👂" },
            { targetWord: "BEARD", image: "🧔" }
        ]
    }
];

// Game State Variables
let currentLevelData = db[0]; 
let isBonusRound = false;
let currentTargetWord = currentLevelData.baseWord;
let selectedLetters = [];
let availableTiles = [];
let totalScore = 0;
let currentMaxPoints = 20;

// Hint State Variables
let turkishUsed = false;
let listenUsed = false;

// DOM Elements
const slotsContainer = document.getElementById('target-slots');
const bankContainer = document.getElementById('letter-bank');
const keyboardContainer = document.getElementById('virtual-keyboard');
const scoreDisplay = document.getElementById('score');
const pointsBadge = document.getElementById('potential-score');
const wordImage = document.getElementById('word-image');
const turkishHintTxt = document.getElementById('turkish-hint');
const btnTurkish = document.getElementById('btn-turkish');
const btnListen = document.getElementById('btn-listen');
const phaseTitle = document.getElementById('current-phase');
const submitBtn = document.getElementById('submit-btn');
const clearBtn = document.getElementById('clear-btn');

// Initialize
function initGame() {
    // Explicitly set types to prevent accidental page reloads
    btnTurkish.type = 'button';
    btnListen.type = 'button';
    submitBtn.type = 'button';
    clearBtn.type = 'button';

    buildVirtualKeyboard();
    loadPhase1();
    setupPhysicalKeyboard();
}

function loadPhase1() {
    isBonusRound = false;
    currentTargetWord = currentLevelData.baseWord;
    currentMaxPoints = 20;
    selectedLetters = new Array(currentTargetWord.length).fill(null);
    
    // Reset Hints for the new word
    turkishUsed = false;
    listenUsed = false;
    btnTurkish.style.opacity = '1';
    btnListen.style.opacity = '1';
    btnTurkish.style.cursor = 'pointer';
    btnListen.style.cursor = 'pointer';
    
    // UI Updates
    phaseTitle.textContent = "Phase 1: Base Word";
    wordImage.textContent = currentLevelData.image; 
    turkishHintTxt.textContent = currentLevelData.turkish;
    turkishHintTxt.classList.add('hidden');
    updatePointsDisplay();

    // Show Tiles, Hide Keyboard
    bankContainer.classList.remove('hidden');
    keyboardContainer.classList.add('hidden');
    
    const scrambled = scrambleWord(currentTargetWord);
    renderSlots();
    renderTiles(scrambled);
}

// --- BUG FIXED: Bulletproof Hint System ---

btnTurkish.addEventListener('click', (e) => {
    e.preventDefault();
    if (isBonusRound) return; // Disabled during bonus round
    
    // Reveal the Turkish text
    turkishHintTxt.classList.remove('hidden');
    
    // Only apply the 3-point penalty once
    if (!turkishUsed) {
        currentMaxPoints = Math.max(0, currentMaxPoints - 3);
        updatePointsDisplay();
        turkishUsed = true;
        btnTurkish.style.opacity = '0.4'; // Visual cue that the hint is consumed
    }
});

btnListen.addEventListener('click', (e) => {
    e.preventDefault();
    if (isBonusRound) return; // Disabled during bonus round
    
    // Cancel any stuck audio to force it to play immediately
    window.speechSynthesis.cancel(); 
    
    const msg = new SpeechSynthesisUtterance(currentTargetWord);
    msg.lang = 'en-US';
    msg.rate = 0.9; // Slightly slower to help with pronunciation
    window.speechSynthesis.speak(msg);

    // Only apply the 5-point penalty once, even if they listen again
    if (!listenUsed) {
        currentMaxPoints = Math.max(0, currentMaxPoints - 5);
        updatePointsDisplay();
        listenUsed = true;
        btnListen.style.opacity = '0.4'; // Visual cue that the hint is consumed
    }
});

// --- REST OF GAME ENGINE ---

function updatePointsDisplay() {
    pointsBadge.textContent = `Max: ${currentMaxPoints} pts`;
}

function scrambleWord(word) {
    let arr = word.split('');
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return (arr.join('') === word && word.length > 1) ? scrambleWord(word) : arr;
}

// Renders the blank boxes and sets up Drop Zones
function renderSlots() {
    slotsContainer.innerHTML = '';
    for (let i = 0; i < currentTargetWord.length; i++) {
        const slot = document.createElement('div');
        slot.classList.add('slot');
        slot.dataset.index = i;
        
        if (selectedLetters[i]) {
            slot.textContent = selectedLetters[i].letter;
            slot.classList.add('filled');
        } else {
            slot.textContent = '_';
        }

        // Drag & Drop Listeners for Slots
        slot.addEventListener('dragover', (e) => {
            e.preventDefault(); 
            if(!selectedLetters[i]) slot.classList.add('drag-over');
        });
        slot.addEventListener('dragleave', () => slot.classList.remove('drag-over'));
        slot.addEventListener('drop', (e) => handleDrop(e, i));

        slotsContainer.appendChild(slot);
    }
}

// Renders draggable tiles
function renderTiles(arr) {
    bankContainer.innerHTML = '';
    availableTiles = arr.map((letter, index) => ({ id: index, letter: letter, isUsed: false }));

    availableTiles.forEach(tileData => {
        const tile = document.createElement('div');
        tile.classList.add('tile');
        tile.textContent = tileData.letter;
        tile.draggable = true;
        
        // Tap Listener
        tile.addEventListener('click', () => placeLetterInFirstEmptySlot(tileData, tile));
        
        // Drag Listeners
        tile.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', tileData.id);
            setTimeout(() => tile.classList.add('dragging'), 0);
        });
        tile.addEventListener('dragend', () => tile.classList.remove('dragging'));

        bankContainer.appendChild(tile);
    });
}

function placeLetterInFirstEmptySlot(tileData, tileElement) {
    if (tileData.isUsed) return;
    const emptyIndex = selectedLetters.findIndex(val => val === null);
    if (emptyIndex !== -1) {
        tileData.isUsed = true;
        tileElement.classList.add('hidden');
        selectedLetters[emptyIndex] = tileData;
        renderSlots();
    }
}

function handleDrop(e, slotIndex) {
    e.preventDefault();
    document.querySelectorAll('.slot').forEach(s => s.classList.remove('drag-over'));
    
    // Check if slot is already full
    if (selectedLetters[slotIndex] !== null) return;

    const tileId = parseInt(e.dataTransfer.getData('text/plain'));
    const tileData = availableTiles.find(t => t.id === tileId);
    const tileElements = document.querySelectorAll('.tile');
    
    if (tileData && !tileData.isUsed) {
        tileData.isUsed = true;
        tileElements[tileId].classList.add('hidden');
        selectedLetters[slotIndex] = tileData;
        renderSlots();
    }
}

// Keyboard Integration (Physical & Virtual)
function handleKeyPress(key) {
    const upperKey = key.toUpperCase();
    
    if (upperKey === 'BACKSPACE' || upperKey === 'DELETE') {
        clearBtn.click();
    } else if (upperKey === 'ENTER') {
        submitBtn.click();
    } else if (/^[A-Z]$/.test(upperKey)) {
        if (!isBonusRound) {
            // Phase 1: Check if letter is available in bank
            const availableTileIndex = availableTiles.findIndex(t => t.letter === upperKey && !t.isUsed);
            if (availableTileIndex !== -1) {
                const tileElements = document.querySelectorAll('.tile');
                placeLetterInFirstEmptySlot(availableTiles[availableTileIndex], tileElements[availableTileIndex]);
            }
        } else {
            // Phase 2: Type freely
             const emptyIndex = selectedLetters.findIndex(val => val === null);
             if (emptyIndex !== -1) {
                 selectedLetters[emptyIndex] = { letter: upperKey }; // Mock tile data
                 renderSlots();
             }
        }
    }
}

function setupPhysicalKeyboard() {
    document.addEventListener('keydown', (e) => handleKeyPress(e.key));
}

function buildVirtualKeyboard() {
    const layout = [ "QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM", "⌫" ];
    keyboardContainer.innerHTML = '';
    
    layout.forEach(row => {
        const rowDiv = document.createElement('div');
        rowDiv.classList.add('keyboard-row');
        
        if (row === "⌫") {
             const keyBtn = document.createElement('div');
             keyBtn.classList.add('key', 'key-wide');
             keyBtn.textContent = "Backspace";
             keyBtn.addEventListener('click', () => handleKeyPress("Backspace"));
             rowDiv.appendChild(keyBtn);
        } else {
            row.split('').forEach(char => {
                const keyBtn = document.createElement('div');
                keyBtn.classList.add('key');
                keyBtn.textContent = char;
                keyBtn.addEventListener('click', () => handleKeyPress(char));
                rowDiv.appendChild(keyBtn);
            });
        }
        keyboardContainer.appendChild(rowDiv);
    });
}

// Action Buttons
clearBtn.addEventListener('click', () => {
    selectedLetters.fill(null);
    if (!isBonusRound) {
        availableTiles.forEach(t => t.isUsed = false);
        document.querySelectorAll('.tile').forEach(t => t.classList.remove('hidden'));
    }
    renderSlots();
});

submitBtn.addEventListener('click', () => {
    const guess = selectedLetters.map(t => t ? t.letter : '').join('');
    
    if (guess.length !== currentTargetWord.length) return alert("Fill all slots!");

    if (guess === currentTargetWord) {
        if (!isBonusRound) {
            // Apply Multiplier (Length based)
            let multiplier = 1.0 + ((currentTargetWord.length - 3) * 0.1);
            totalScore += Math.floor(currentMaxPoints * multiplier);
            scoreDisplay.textContent = `SCORE: ${totalScore}`;
            
            // Move to Bonus Round (Phase 2)
            setTimeout(() => {
                alert("Base Word Cleared! Entering Bonus Round!");
                loadBonusPhase(0); // Load first bonus target
            }, 500);
        } else {
            alert("Bonus Target Cleared!");
            // Temporary alert until we code the next level transition
        }
    } else {
        alert("Not quite right. Try again!");
        clearBtn.click();
    }
});

function loadBonusPhase(bonusIndex) {
    isBonusRound = true;
    const targetData = currentLevelData.bonusTargets[bonusIndex];
    currentTargetWord = targetData.targetWord;
    
    // Hide the hint buttons visually during the bonus round
    btnTurkish.style.opacity = '0.2';
    btnListen.style.opacity = '0.2';
    btnTurkish.style.cursor = 'default';
    btnListen.style.cursor = 'default';
    turkishHintTxt.classList.add('hidden');
    
    phaseTitle.textContent = "Phase 2: Bonus Round!";
    wordImage.textContent = targetData.image; 
    pointsBadge.textContent = "Bonus: 10 pts";
    
    selectedLetters = new Array(currentTargetWord.length).fill(null);
    
    // Hide Drag Tiles, Show Virtual Keyboard
    bankContainer.classList.add('hidden');
    keyboardContainer.classList.remove('hidden');
    
    renderSlots();
}

// Start
initGame();
