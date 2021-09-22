console.log('hi')

const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
canvas.style.cursor = "none";

const grid_size = 18;
const font_size = 18;
const particle_duration = 800;
const trail_length = 51;
const trail_width = 300;
const trail_delay = 100

let width = window.innerWidth;
let height = window.innerHeight;

canvas.width = width;
canvas.height = height;

window.addEventListener("resize", () => {
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;
  context.textBaseline = "middle";
  context.textAlign = "center";
});

const glyph = "↖";
const trailGlyph = "･✻◦✷✧○❋";

let trail = [];

context.textBaseline = "middle";
context.textAlign = "center";
context.fillStyle = "black"

const toGrid = (x, y) =>{
  return [
    Math.round(x / grid_size) * grid_size,
    Math.round(y / grid_size) * grid_size,
  ]
}

canvas.addEventListener("mousedown", (e) => {
  const [originX, originY] = [e.offsetX, e.offsetY]

  // get x and y for an explosion
  for (let i = 0; i < trail_length / 2; i++) {
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
      char: trailGlyph[Math.floor(Math.random() * trailGlyph.length)]
    });
  }
  
});


const render = () => {
  context.clearRect(0, 0, width, height);
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
    
    // calculate decreasing text size as function of life
    const textSize = font_size - (adjustedLifespan / particle_duration) * font_size;
    
     // calculate spread position as function of life
    const [spreadX, spreadY] = [
      item.deltaX * (adjustedLifespan / particle_duration),
      item.deltaY * (adjustedLifespan / particle_duration)]
    
    // add spread to origin
    const [resultX, resultY] = toGrid(item.originX + spreadX, item.originY + spreadY)
    
    // render
    context.font = `${textSize}px Monaco`;
    context.fillText(item.char, resultX, resultY);
  });

  if (cursor) {
    context.font = `${font_size}px Monaco`;
    const [resultX, resultY] = toGrid(cursor.originX, cursor.originY)
    context.fillText(glyph, resultX, resultY);
  }

  requestAnimationFrame(render);
  

};

render();
