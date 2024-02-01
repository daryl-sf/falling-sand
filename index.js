// Define constants for canvas dimensions and cell size
const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 600;
const CELL_SIZE = 5;
const EMPTY = 0;
const CHANCE_OF_DROP = 0.05;
const CHANCE_OF_LEFT = 0.35;
const CHANCE_OF_RIGHT = 0.35;

const FPS = 45; // Desired frames per second

// Initialize the grid with empty cells
let grid = createGrid();

// Get canvas context
let canvas;
let ctx;

let hue = 0;
let isAnimating = true;
let pouring = false;

function createGrid() {
  return Array.from({ length: CANVAS_HEIGHT / CELL_SIZE }, () => Array(CANVAS_WIDTH / CELL_SIZE).fill(EMPTY));
}

// Function to update the grid based on particle movement
function updateGrid() {
  let moved = false;
  for (let y = grid.length - 2; y >= 0; y--) {
    for (let x = 0; x < grid[0].length; x++) {
      const STATE = grid[y][x];
      if (STATE > EMPTY) { // if cell is sand
        // If the cell below is empty and not the last row
        if (y !== grid.length - 1 && grid[y + 1][x] === EMPTY) {
          // Move sand particle down one cell
          grid[y + 1][x] = STATE;
          grid[y][x] = EMPTY;
          moved = true;
        } else if(y !== grid.length - 1 && (grid[y + 1][x + 1] === EMPTY || grid[y + 1][x - 1] === EMPTY)) {
          // if the cell below is sand and cells to side are empty
          const randomDirection = Math.random();
          if (randomDirection <= CHANCE_OF_LEFT) {
            // fall left
            if (x > 0 && grid[y + 1][x - 1] === EMPTY) {
              grid[y + 1][x - 1] = STATE;
              grid[y][x] = EMPTY;
              moved = true;
            } else {
              grid[y][x] = STATE;
            }
          } else if (randomDirection > CHANCE_OF_RIGHT) {
            // fall right
            if (x < grid[0].length - 1 && grid[y + 1][x + 1] === EMPTY) {
              grid[y + 1][x + 1] = STATE;
              grid[y][x] = EMPTY;
              moved = true;
            } else {
              grid[y][x] = STATE;
            }
          } else {
            grid[y][x] = STATE;
          }
          
        } else if (y === grid.length - 1) {
          // If the sand particle has reached the bottom, leave it there
          grid[y][x] = STATE;
        }
      }   
    }
  }
  if (!moved) {
    isAnimating = false;
  }
}

// Function to render the grid
function renderGrid() {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[0].length; x++) {
      const STATE = grid[y][x];
      if (STATE > EMPTY) {
        ctx.fillStyle = `hsl(${STATE}, 100%, 50%)`;
        ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      }
    }
  }
}

// Main animation loop
let lastFrameTime = 0;
function animate(currentTime) {
  isAnimating = true;
  const deltaTime = currentTime - lastFrameTime;
  if (!lastFrameTime || deltaTime > 1000 / FPS) {
    lastFrameTime = currentTime;
    updateGrid();
    renderGrid();
  }
  
  if (isAnimating) {
    requestAnimationFrame(animate);
  }
}

function dropSand(x, y) {
  // Pour sand into multiple adjacent cells around the clicked cell
  const radius = 4; // Adjust the radius as needed
  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      const newX = x + dx;
      const newY = y + dy;
      if (newX >= 0 && newX < CANVAS_WIDTH && newY >= 0 && newY < CANVAS_HEIGHT && grid[newY][newX] === EMPTY) {
        // Check if a grain should fall
        if (Math.random() <= CHANCE_OF_DROP) {
          grid[newY][newX] = hue;
        }
      }
    }
  }
  hue = (hue + 1) % 360;
  if (!isAnimating) {
    animate();
  }
}

// Main simulation loop
function simulateFallingSand() {
  canvas = document.getElementById('falling-sand');
  canvas.height = CANVAS_HEIGHT;
  canvas.width = CANVAS_WIDTH;
  ctx = canvas.getContext('2d');
  
  // set up controls
  canvas.addEventListener('mousedown', function(e) {
    if (e.shiftKey) {
      grid = createGrid();
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    } else {
      pouring = true;
    }
  })
  canvas.addEventListener('mouseup', function() {
    pouring = false;
  })
  canvas.addEventListener('mousemove', function(e) {
    if (!pouring) return;
    const x = Math.floor(e.offsetX / CELL_SIZE);
    const y = Math.floor(e.offsetY / CELL_SIZE);
    dropSand(x, y);
  });

  animate();
}

document.addEventListener('DOMContentLoaded', () => {
  // Start the simulation
  simulateFallingSand();
});
