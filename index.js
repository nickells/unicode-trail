console.log('hi')

const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
canvas.style.cursor = "none";

const grid_size = 32;
const font_size = 32;
const particle_duration = 500;
const explosion_size = 10;
const trail_width = 300;
const trail_delay = 150


const size = () => {
  let width = window.innerWidth;
  let height = window.innerHeight;

  canvas.width = width
  //  * 2;
  canvas.height = height
  //  * 2;
  
  // canvas.style.width = width;
  // canvas.style.height = height;
  // canvas.getContext('2d').scale(2,2)


  context.textBaseline = "middle";
  context.textAlign = "center";
}

size()

window.addEventListener("resize", () => {
  size()
});

const glyph = "↖";
const trailGlyph = "･✻◦✷✧○❋";

let trail = [];

let glyphCanvases = []

const renderSeed = () => {
  const glyphs = [...trailGlyph]
  glyphs.forEach((glyph, idx) => {
    const newCanvas = document.createElement('canvas')
    newCanvas.width = grid_size
    newCanvas.height = grid_size
    const newContext = newCanvas.getContext('2d')
    // document.body.appendChild(newCanvas)
    newContext.fillStyle = "black"
    newContext.font = `${font_size}px Monaco`;
    newContext.textAlign = 'center'
    newContext.textBaseline = 'middle'  
    newContext.fillText(glyph, grid_size / 2, grid_size / 2)
    glyphCanvases.push(newCanvas)
  })
}

renderSeed()

const toGrid = (x, y) =>{
  return [
    Math.round(x / grid_size) * grid_size,
    Math.round(y / grid_size) * grid_size,
  ]
}

canvas.addEventListener("mousedown", (e) => {
  const [originX, originY] = [e.offsetX, e.offsetY]

  // get x and y for an explosion
  for (let i = 0; i < explosion_size / 2; i++) {
    const randomX = Math.floor((Math.random() * trail_width) - trail_width / 2);
    const randomY = Math.floor((Math.random() * trail_width) - trail_width / 2);
    trail.unshift({
      originX,
      originY, 
      deltaX: randomX,
      deltaY: randomY,
      start: performance.now(),
      char: trailGlyph[Math.floor(Math.random() * trailGlyph.length)]
    });
  }
 })

canvas.addEventListener("mousemove", (e) => {
  const [originX, originY] = [e.offsetX, e.offsetY]

  // if no last cursor, "mock" it with this cursor's values
  const lastCursor = trail[0] || {
    originX,
    originY
  }
  
  // debouncer
  const [movementX, movementY] = toGrid(originX - lastCursor.originX, originY - lastCursor.originY)
  if (trail[0] && movementX === 0 && movementY === 0) return

  // calculate eventual spread location
  for (let i = 0; i < 1; i++) {
    const randomX = Math.floor((Math.random() * trail_width) - trail_width / 2);
    const randomY = Math.floor((Math.random() * trail_width) - trail_width / 2);

    trail.unshift({
      originX,
      originY, 
      deltaX: randomX,
      deltaY: randomY,
      start: performance.now(),
      char: Math.floor(Math.random() * trailGlyph.length)
    });
  }
  
});


const render = () => {


  context.clearRect(0, grid_size, canvas.width, canvas.height);
  context.clearRect(100, 0, canvas.width, grid_size)


  const [cursor, ...tail] = trail;

  tail.forEach((item, index) => {
    const life = performance.now() - item.start;
    
    // don't render yet if under delay time
    if (life < trail_delay) return
    
    const adjustedLifespan = life - trail_delay
    
    // don't render if it's over the duration
    if (adjustedLifespan > particle_duration) {

      trail.pop()
      return
    }
    
    const lifeRatio = adjustedLifespan / particle_duration

    // calculate decreasing text size as function of life
    const textSize = font_size - lifeRatio * font_size;
    
     // calculate spread position as function of life
    const [spreadX, spreadY] = [
      item.deltaX * lifeRatio,
      item.deltaY * lifeRatio]
    
    // add spread to origin
    const [resultX, resultY] = toGrid(item.originX + spreadX, item.originY + spreadY)
    
    // render
    context.font = `${textSize}px Monaco`;
    const char = item.char

    context.drawImage(
      glyphCanvases[char], // img
      resultX - (grid_size / 2), // x 
      resultY - (grid_size / 2)), // y
      textSize * 2, // x height
      textSize  // y height
  });

  if (cursor) {
    context.font = `${font_size}px Monaco`;
    const [resultX, resultY] = toGrid(cursor.originX, cursor.originY)
    context.fillText(glyph, resultX, resultY);
  }

  requestAnimationFrame(render);
  

};

render();
