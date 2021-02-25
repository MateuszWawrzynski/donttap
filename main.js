
let mode_ = -1;
const MODE_READY = -1;
const MODE_GAME = 0;
const MODE_REPLAY = 1;
const MODE_GAMEOVER = 2;

let frame = 0;

let count = 0;
let accuracy = 0;

const grid = 4;
let res;

let tiles = [];
class Tile {
	constructor(x, y) {
		this.x = x;
		this.y = y + (height/6);
		this.state = false;
	}

	show(){
		push()
		stroke(51, 100);
		fill(this.state ? 0 : 255, 100)
		rect(this.x, this.y, res-1, res-1)
		pop()
	}
}


function setup() {
	let h = window.innerHeight - 5;
	let w = h * (3/4);
	console.log("Resolution:", w, h)
	
	frameRate(60)
	createCanvas(w, h)
	res = width/grid;

	setTimeout(resetGame, 2000);
}

function draw() {
	if(mode_ == MODE_READY){
		push()
		background(0, 4);
		fill(255)
		textAlign(CENTER)
		textSize(32)
		text("GET READY...", width/2, height/3)
		textSize(18)
		text("SHOOT AS MANY TARGETS AS YOU CAN\nIN SHORTEST TIME", width/2, height/2.5)
		pop()
	}
	else if(mode_ == MODE_GAME){
		push();
		fill(0, 0, 255);
		rect(0, 0, width, height/6)
		textSize(width/32)
		fill(255)
		text(`${count} targets in ${Math.floor(frame/60)} seconds (${(count / Math.floor(frame/60) || 0).toFixed(2)} t/s)`, width/4, height/6/3)
		text(`Accuracy: ${Math.round(((accuracy / count) / (res/2)) * 100) || 0}%`, width/4, height/6/2)
		pop()
		
		for(let t of tiles){
			t.show();
		}

		push()
		fill(0, 0, 255);
		rect(0, height/6+res*4, width, height-height/6+res*4)
		pop()

		saveHistory();
		frame++;
	}
	else if(mode_ == MODE_REPLAY){
		let f = frame % history.length;
		if(f == history.length-1) {
			noLoop();
			setTimeout(() => { loop(); }, 2000);
		}
		loadHistory(f);
		frame++;
	}
	else if(mode_ == MODE_GAMEOVER){
		push()
		background(255, 0, 0, 32);
		textAlign(CENTER)
		textSize(32)
		text("GAME OVER", width/2, height/2)
		pop()
	}
}

let lastclick;
function mousePressed(){
	if(mode_ == MODE_GAME) {	
		lastclick = createVector(mouseX, mouseY)
		for(let t of tiles){
			let x = t.x;
			let y = t.y;

			if(mouseX >= x && mouseX <= x+res && mouseY >= y && mouseY <= y+res){
				if(t.state){
					push()
					fill(0, 255, 0)
					rect(t.x, t.y, res, res)
					pop()

					accuracy += dist(mouseX, mouseY, t.x+res/2, t.y+res/2)
					
					count++;
					generateTiles(1)
					t.state = false;
				}
				else {
					// missed
					push()
					fill(255, 0, 0)
					rect(t.x, t.y, res, res)
					pop()

					mode_ = MODE_GAMEOVER;
					setTimeout(() => { mode_=MODE_REPLAY; frame=0; }, 500);

					console.log(`${count} targets in ${Math.floor(frame/60)} seconds (${(count / Math.floor(frame/60)).toFixed(2)})`)
					console.log(`Accuracy: ${Math.round(((accuracy / count) / (res/2)) * 100)}%.`)
				}
			}
		}
	}
	else if(mode_ == MODE_REPLAY) {
		if(mouseX >= 0 && mouseX <= width && mouseY >= height/6+res*4 && mouseY <= height-height/6+res*4){
			background(255)
			
			mode_ = MODE_READY;
			setTimeout(resetGame, 2000);
		}
	}
}

function resetGame(){
	tiles = []
	history = []
	frame = 0;
	mode_ = MODE_GAME;
	count = 0;
	accuracy = 0;
	lastclick = null;
	
	for(let a = 0; a < grid; a++){
		for(let b = 0; b < grid; b++){
			tiles.push(new Tile(res * a, res * b))
		}
	}

	generateTiles(4);
}


function generateTiles(i){
	for(let a = 0; a < i; a++){
		let t = random(tiles);
		if(t.state == true){
			a--;
		}
		t.state = true;
	}
}

let history = [];
function saveHistory(){
	history.push({
		tiles: tiles.filter(i => i.state),
		prevpos: createVector(pmouseX, pmouseY),
		pos: createVector(mouseX, mouseY),
		lastclick: lastclick || createVector(-5, -5),
		count,
		accuracy
	})
}

function loadHistory(f){
	push();
	fill(0, 0, 255);
	rect(0, 0, width, height/6)
	textSize(width/32)
	fill(255)
	text(`${history[f].count} targets in ${Math.floor(f/60)} seconds (${(history[f].count / Math.floor(f/60) || 0).toFixed(2)} t/s)`, width/4, height/6/3)
	text(`Accuracy: ${Math.round(((history[f].accuracy / history[f].count) / (res/2)) * 100) || 0}%`, width/4, height/6/2)
	fill(255,0,0)
	text("REPLAY...", 5, height/6-5)
	pop()

	push()
	fill(0, 0, frameCount*10 % 255);
	rect(0, height/6+res*4, width, height-height/6+res*4)
	textAlign(CENTER)
	textSize(height/32)
	fill(255,0,0)
	text("PLAY AGAIN", width/2, (height-25));
	pop()

	push()
	fill(255, 100);
	stroke(0)
	for(let a = 0; a < grid; a++){
		for(let b = 0; b < grid; b++){
			rect(a*res, b*res + (height/6), res-1, res-1)
		}
	}
	pop()
	
	push()
	stroke(255);
	fill(0, 128)
	for(let t of history[f].tiles){
		rect(t.x, t.y, res-1, res-1)
	}
	pop()
	
	push()
	fill(0, 255, 0)
	noStroke();
	ellipse(history[f].pos.x, history[f].pos.y, 16, 16)
	stroke(0, 255, 0)
	strokeWeight(16)
	line(history[f].prevpos.x, history[f].prevpos.y, history[f].pos.x, history[f].pos.y)
	pop()
	
	push()
	stroke(0, 128, 0)
	fill(0, 255, 0)
	history[f].lastclick && ellipse(history[f].lastclick.x, history[f].lastclick.y, 8, 8)
	pop()

	push()
	stroke(255, 0, 0)
	strokeWeight(10)
	line(0, height, map(f, 0, history.length, 0, width), height)
	pop()

	if(f == history.length-1){
		push()
		stroke(255, 0, 0);
		strokeWeight(4);
		line(history[f].pos.x-8, history[f].pos.y-8, history[f].pos.x+8, history[f].pos.y+8);
		line(history[f].pos.x-8, history[f].pos.y+8, history[f].pos.x+8, history[f].pos.y-8);
		pop()
	}
}
