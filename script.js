const TILE_POOL = Array.from({ length: 144 }, (_, i) => (i + 1).toString());

let tilePool = [...TILE_POOL];
let handTiles = [];
let placedTiles = [];
let selectedTile = null;
let cutTile = null; // Variable to track the cut tile
let clickTimer = null;
const CLICK_DELAY = 300; // Delay for distinguishing between single and double clicks

// Mapping table from numbers to letters
const tileMap = {
    '1': 'E', '2': 'E', '3': 'E', '4': 'E', '5': 'E', '6': 'E', '7': 'E', '8': 'E', '9': 'E', '10': 'E', '11': 'E', '12': 'E', '13': 'E', '14': 'E', '15': 'E', '16': 'E', '17': 'E', '18': 'E',
    '19': 'A', '20': 'A', '21': 'A', '22': 'A', '23': 'A', '24': 'A', '25': 'A', '26': 'A', '27': 'A', '28': 'A', '29': 'A', '30': 'A', '31': 'A',
    '32': 'I', '33': 'I', '34': 'I', '35': 'I', '36': 'I', '37': 'I', '38': 'I', '39': 'I', '40': 'I', '41': 'I', '42': 'I', '43': 'I',
    '44': 'O', '45': 'O', '46': 'O', '47': 'O', '48': 'O', '49': 'O', '50': 'O', '51': 'O', '52': 'O', '53': 'O', '54': 'O',
    '55': 'T', '56': 'T', '57': 'T', '58': 'T', '59': 'T', '60': 'T', '61': 'T', '62': 'T', '63': 'T',
    '64': 'R', '65': 'R', '66': 'R', '67': 'R', '68': 'R', '69': 'R', '70': 'R', '71': 'R', '72': 'R',
    '73': 'N', '74': 'N', '75': 'N', '76': 'N', '77': 'N', '78': 'N', '79': 'N', '80': 'N',
    '81': 'D', '82': 'D', '83': 'D', '84': 'D', '85': 'D', '86': 'D',
    '87': 'S', '88': 'S', '89': 'S', '90': 'S', '91': 'S', '92': 'S',
    '93': 'U', '94': 'U', '95': 'U', '96': 'U', '97': 'U', '98': 'U',
    '99': 'L', '100': 'L', '101': 'L', '102': 'L', '103': 'L',
    '104': 'G', '105': 'G', '106': 'G', '107': 'G',
    '108': 'B', '109': 'B', '110': 'B',
    '111': 'C', '112': 'C', '113': 'C',
    '114': 'F', '115': 'F', '116': 'F',
    '117': 'H', '118': 'H', '119': 'H',
    '120': 'M', '121': 'M', '122': 'M',
    '123': 'P', '124': 'P', '125': 'P',
    '126': 'V', '127': 'V', '128': 'V',
    '129': 'W', '130': 'W', '131': 'W',
    '132': 'Y', '133': 'Y', '134': 'Y',
    '135': 'J', '136': 'J',
    '137': 'K', '138': 'K',
    '139': 'Q', '140': 'Q',
    '141': 'X', '142': 'X',
    '143': 'Z', '144': 'Z'
};

document.getElementById('split-button').addEventListener('click', startGame);
document.getElementById('dump-button').addEventListener('click', toggleDumpMode);
document.getElementById('peel-button').addEventListener('click', peelTile);
document.getElementById('restart-button').addEventListener('click', restartGame);

function startGame() {
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'block';
    tilePool = [...TILE_POOL]; // Reset tile pool
    handTiles = getInitialHandTiles();
    placedTiles = [];
    selectedTile = null;
    cutTile = null; // Reset cutTile
    clickTimer = null;
    drawTiles();
    drawBoard();
}

function getInitialHandTiles() {
    const initialHand = [];
    for (let i = 0; i < 21; i++) {
        const tile = getRandomTileFromPool();
        initialHand.push(tile);
    }
    return initialHand;
}

function getRandomTileFromPool() {
    const index = Math.floor(Math.random() * tilePool.length);
    return tilePool.splice(index, 1)[0];
}

function drawTiles() {
    const tilesContainer = document.getElementById('tiles');
    tilesContainer.innerHTML = '';
    handTiles.forEach(tileId => {
        const tile = document.createElement('div');
        tile.className = 'tile';
        tile.textContent = tileMap[tileId] || tileId; // Map number to letter
        tile.dataset.tileId = tileId;
        tile.addEventListener('click', () => selectTile(tileId));
        tilesContainer.appendChild(tile);
    });
}

function drawBoard() {
    const boardContainer = document.getElementById('board');
    boardContainer.innerHTML = '';
    for (let row = 0; row < 15; row++) {
        for (let col = 0; col < 15; col++) {
            const cell = document.createElement('div');
            cell.className = 'board-cell blank';
            cell.dataset.row = row;
            cell.dataset.col = col;
            cell.addEventListener('click', () => handleCellClick(row, col));
            boardContainer.appendChild(cell);
        }
    }
}

function selectTile(tileId) {
    selectedTile = (selectedTile === tileId) ? null : tileId;
    updateTileSelection();
}

function updateTileSelection() {
    document.querySelectorAll('.tile').forEach(tile => {
        if (tile.dataset.tileId === selectedTile) {
            tile.classList.add('moving');
        } else {
            tile.classList.remove('moving');
        }
    });
}

function handleCellClick(row, col) {
    const cell = document.querySelector(`.board-cell[data-row="${row}"][data-col="${col}"]`);
    if (cell) {
        if (clickTimer === null) {
            clickTimer = setTimeout(() => {
                clickTimer = null;
                handleSingleClick(cell);
            }, CLICK_DELAY);
        } else {
            clearTimeout(clickTimer);
            clickTimer = null;
            handleDoubleClick(cell);
        }
    }
}

function handleSingleClick(cell) {
    if (cutTile) {
        // Handle pasting the cut tile
        if (cell.classList.contains('tiled')) {
            // Move existing tile back to hand
            handTiles.push(cell.textContent);
        }
        cell.textContent = tileMap[cutTile] || cutTile; // Map number to letter
        cell.classList.add('tiled');
        cutTile = null; // Clear the cut tile after pasting
        drawTiles(); // Update the hand tiles display
        document.querySelectorAll('.board-cell').forEach(c => c.classList.remove('highlight'));
    } else if (selectedTile) {
        if (cell.classList.contains('tiled')) {
            // Move existing tile back to hand and place new tile
            const previousTile = cell.textContent;
            handTiles.push(previousTile);
            cell.textContent = tileMap[selectedTile] || selectedTile; // Map number to letter
            cell.classList.add('tiled');
            handTiles = handTiles.filter(tile => tile !== selectedTile); // Remove the tile from hand
            selectedTile = null;
            drawTiles(); // Update the hand tiles display
        } else if (cell.classList.contains('blank')) {
            // Place new tile on grid
            cell.textContent = tileMap[selectedTile] || selectedTile; // Map number to letter
            cell.classList.add('tiled');
            handTiles = handTiles.filter(tile => tile !== selectedTile); // Remove the tile from hand
            selectedTile = null;
            drawTiles(); // Update the hand tiles display
        }
        // Highlight the selected cell
        document.querySelectorAll('.board-cell').forEach(c => c.classList.remove('highlight'));
        cell.classList.add('highlight');
    } else if (cell.classList.contains('tiled')) {
        // Handle selecting a tile for cutting
        if (!cutTile) {
            cell.classList.add('selected');
            cutTile = cell.textContent;
            cell.textContent = '';
            cell.classList.remove('tiled');
        }
    }
}

function handleDoubleClick(cell) {
    if (cell.classList.contains('tiled')) {
        // Return the tile to hand and clear cell
        handTiles.push(cell.textContent);
        cell.textContent = '';
        cell.classList.remove('tiled');
        drawTiles(); // Update the hand tiles display
    }
    cell.classList.remove('selected');
}

function toggleDumpMode() {
    if (selectedTile && handTiles.includes(selectedTile)) {
        // Remove selected tile from hand and add to pool
        tilePool.push(selectedTile);
        handTiles = handTiles.filter(tile => tile !== selectedTile);
        
        // Add three new tiles to the hand
        for (let i = 0; i < 3; i++) {
            if (tilePool.length > 0) {
                const newTile = getRandomTileFromPool();
                handTiles.push(newTile);
            }
        }
        
        // Redraw the tiles to reflect changes
        drawTiles(); 
        selectedTile = null; // Clear selected tile
    }
}

function peelTile() {
    if (tilePool.length > 0 && handTiles.length < 21) {
        const tile = getRandomTileFromPool();
        handTiles.push(tile);
        drawTiles();
    }
}

function restartGame() {
    document.getElementById('start-screen').style.display = 'block';
    document.getElementById('game-screen').style.display = 'none';
    startGame(); // Reinitialize the game
}

function moveTiles(dx, dy) {
    const cells = document.querySelectorAll('.board-cell.tiled');
    const boardCells = Array.from(document.querySelectorAll('.board-cell'));
    const rows = 15;
    const cols = 15;

    // Determine the order of iteration based on the direction
    const sortedCells = Array.from(cells);
    if (dx === 1) {
        // Sort cells in descending order for right movement
        sortedCells.sort((a, b) => parseInt(b.dataset.col) - parseInt(a.dataset.col));
    } else if (dx === -1) {
        // Sort cells in ascending order for left movement
        sortedCells.sort((a, b) => parseInt(a.dataset.col) - parseInt(b.dataset.col));
    } else if (dy === 1) {
        // Sort cells in descending order for down movement
        sortedCells.sort((a, b) => parseInt(b.dataset.row) - parseInt(a.dataset.row));
    } else if (dy === -1) {
        // Sort cells in ascending order for up movement
        sortedCells.sort((a, b) => parseInt(a.dataset.row) - parseInt(b.dataset.row));
    }

    sortedCells.forEach(cell => {
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        const newRow = row + dy;
        const newCol = col + dx;

        if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
            const newCell = boardCells.find(c => parseInt(c.dataset.row) === newRow && parseInt(c.dataset.col) === newCol);

            if (newCell && !newCell.classList.contains('tiled')) {
                newCell.textContent = cell.textContent;
                newCell.classList.add('tiled');
                newCell.classList.remove('blank');
                cell.textContent = '';
                cell.classList.remove('tiled');
                cell.classList.add('blank');
            }
        }
    });
}

// Add event listeners for the arrow buttons
document.getElementById('up-button').addEventListener('click', () => moveTiles(0, -1));
document.getElementById('left-button').addEventListener('click', () => moveTiles(-1, 0));
document.getElementById('right-button').addEventListener('click', () => moveTiles(1, 0));
document.getElementById('down-button').addEventListener('click', () => moveTiles(0, 1));
