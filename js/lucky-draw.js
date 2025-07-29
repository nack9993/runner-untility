// Lucky Draw functionality

// Lucky Draw variables
let participantNames = [];
let winnerHistory = [];
let isDrawing = false;

function initializeLuckyDraw() {
  // Add event listeners for lucky draw
  document.getElementById('addNameBtn').addEventListener('click', addSingleName);
  document.getElementById('addBulkNamesBtn').addEventListener('click', addBulkNames);
  document.getElementById('nameInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      addSingleName();
    }
  });
  document.getElementById('clearAllBtn').addEventListener('click', clearAllNames);
  document.getElementById('shuffleBtn').addEventListener('click', shuffleNames);
  document.getElementById('startDrawBtn').addEventListener('click', startLuckyDraw);
  document.getElementById('drawAgainBtn').addEventListener('click', drawAgain);
  document.getElementById('clearHistoryBtn').addEventListener('click', clearHistory);
}

function addSingleName() {
  const nameInput = document.getElementById('nameInput');
  const name = nameInput.value.trim();
  
  if (name && !participantNames.includes(name)) {
    participantNames.push(name);
    nameInput.value = '';
    updateNamesList();
    updateDrawButton();
  } else if (participantNames.includes(name)) {
    alert('This name is already in the list!');
  }
}

function addBulkNames() {
  const bulkInput = document.getElementById('bulkNameInput');
  const names = bulkInput.value.split('\n')
    .map(name => name.trim())
    .filter(name => name && !participantNames.includes(name));
  
  participantNames.push(...names);
  bulkInput.value = '';
  updateNamesList();
  updateDrawButton();
}

function updateNamesList() {
  const namesList = document.getElementById('namesList');
  const nameCount = document.getElementById('nameCount');
  
  nameCount.textContent = participantNames.length;
  
  if (participantNames.length === 0) {
    namesList.innerHTML = '<p class="empty-message">No names added yet. Add some names to start the lucky draw!</p>';
    return;
  }

  namesList.innerHTML = participantNames.map((name, index) => `
    <div class="name-item">
      <span class="name-text">${name}</span>
      <button class="delete-name-btn" onclick="removeName(${index})">✕</button>
    </div>
  `).join('');
}

function removeName(index) {
  participantNames.splice(index, 1);
  updateNamesList();
  updateDrawButton();
}

function clearAllNames() {
  if (participantNames.length > 0 && confirm('Are you sure you want to clear all names?')) {
    participantNames = [];
    updateNamesList();
    updateDrawButton();
  }
}

function shuffleNames() {
  for (let i = participantNames.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [participantNames[i], participantNames[j]] = [participantNames[j], participantNames[i]];
  }
  updateNamesList();
}

function updateDrawButton() {
  const startBtn = document.getElementById('startDrawBtn');
  startBtn.disabled = participantNames.length === 0 || isDrawing;
}

function startLuckyDraw() {
  if (participantNames.length === 0 || isDrawing) return;
  
  isDrawing = true;
  updateDrawButton();
  
  // Hide winner display
  document.getElementById('winnerDisplay').style.display = 'none';
  
  // Start wheel animation
  animateWheel();
}

function animateWheel() {
  const wheelContent = document.getElementById('wheelContent');
  const wheelContainer = document.getElementById('drawWheel');
  
  // Add spinning animation
  wheelContainer.classList.add('spinning');
  
  let animationFrame = 0;
  const maxFrames = 60; // 3 seconds at 20fps
  const interval = setInterval(() => {
    // Cycle through random names during animation
    const randomName = participantNames[Math.floor(Math.random() * participantNames.length)];
    wheelContent.innerHTML = `<div class="wheel-text spinning-text">${randomName}</div>`;
    
    animationFrame++;
    
    if (animationFrame >= maxFrames) {
      clearInterval(interval);
      selectWinner();
    }
  }, 50);
}

function selectWinner() {
  const wheelContainer = document.getElementById('drawWheel');
  const winnerDisplay = document.getElementById('winnerDisplay');
  const winnerName = document.getElementById('winnerName');
  
  // Stop spinning animation
  wheelContainer.classList.remove('spinning');
  
  // Select random winner
  const winnerIndex = Math.floor(Math.random() * participantNames.length);
  const winner = participantNames[winnerIndex];
  
  // Show winner with celebration animation
  winnerName.textContent = winner;
  winnerDisplay.style.display = 'block';
  winnerDisplay.classList.add('winner-celebration');
  
  // Add to history
  winnerHistory.unshift({
    name: winner,
    timestamp: new Date().toLocaleString()
  });
  updateWinnerHistory();
  
  // Remove winner if option is checked
  if (document.getElementById('removeWinnerOption').checked) {
    participantNames.splice(winnerIndex, 1);
    updateNamesList();
  }
  
  isDrawing = false;
  updateDrawButton();
  
  // Remove celebration animation after delay
  setTimeout(() => {
    winnerDisplay.classList.remove('winner-celebration');
  }, 2000);
}

function drawAgain() {
  document.getElementById('winnerDisplay').style.display = 'none';
  const wheelContent = document.getElementById('wheelContent');
  wheelContent.innerHTML = '<div class="wheel-text">Click "Start Lucky Draw" to begin</div>';
}

function updateWinnerHistory() {
  const historyContainer = document.getElementById('winnerHistory');
  
  if (winnerHistory.length === 0) {
    historyContainer.innerHTML = '<p class="empty-message">No winners yet!</p>';
    return;
  }

  historyContainer.innerHTML = winnerHistory.map((winner, index) => `
    <div class="winner-item">
      <div class="winner-info">
        <strong>${winner.name}</strong>
        <small>${winner.timestamp}</small>
      </div>
      <button class="delete-winner-btn" onclick="removeWinner(${index})">✕</button>
    </div>
  `).join('');
}

function removeWinner(index) {
  winnerHistory.splice(index, 1);
  updateWinnerHistory();
}

function clearHistory() {
  if (winnerHistory.length > 0 && confirm('Are you sure you want to clear the winner history?')) {
    winnerHistory = [];
    updateWinnerHistory();
  }
} 