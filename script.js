'use strict'
var snake = undefined;
var idInt;
var eventStack  = [];
var inPause;

var bStart = document.getElementById('bStart');
bStart.onclick = newGame;

var bPause = document.getElementById('bPause');
bPause.onclick = pauseMoving;

//ДД создаем новую игру
function newGame() {
	snake = new Snake();
	newField();
	paintSnake();
	paintFood();
	startMoving(snake.speed);
	inPause = false;
}

//заполнием основное поле клеточками
function newField() {
	var field = document.getElementById('field');
	field.innerHTML = '<div id="pause"><p>| |</p></div>';

	for (var i = 10; i >= 1; i--) {
		for (var j = 1; j <= 10; j++) {
			var div = document.createElement('div');
			div.className = 'x' + j + ' y' + i;

			field.appendChild(div);
		}
	}
}

function pauseMoving(){
	
	var paused = document.getElementById('pause');
	if(inPause){
		startMoving(snake.speed);
		paused.style.display = 'none';
	}else{
		stopMoving();
		paused.style.display = 'block';
	}
	inPause = !inPause;
	
}
//ДД рисуем змейку по всем ее точкам
function paintSnake() {

	for (var i = 0; i < snake.positionPoints.length; i++) {
		var divWhereSnake = document.querySelector('.x' + snake.positionPoints[i].positionX + '.y' + snake.positionPoints[i].positionY);
		if (!divWhereSnake.classList.contains("thereIsSnake")) {
			divWhereSnake.classList.add("thereIsSnake");
		}
	}
}

//ДД заканчиваем игру, вы проиграли
function gameOver() {
	stopMoving();
	alert('Вы проиграли! Игра окончена');
}

//Дд еду рисуем случайным образом и даем ей какой то класс isFood
function paintFood() {

	do {
		var X = randomInteger(1, 10);
		var Y = randomInteger(1, 10);
		var divForFood = document.querySelector('.x' + X + '.y' + Y);
	} while (divForFood.classList.contains("thereIsSnake"));
	//вышли из цикла, значит в divForFood нету змеи, можно еду размещать
	divForFood.classList.add("thereIsFood");
}

function randomInteger(min, max) {
	var rand = min - 0.5 + Math.random() * (max - min + 1)
		rand = Math.round(rand);
	return rand;
}

//ДД функция конструктор змейки
function Snake() {
	this.length = 1;
	this.direction = 39; //начальное движение вправо
	this.score = 0;
	this.speed = 1000;
	this.positionPoints = [{
			positionX : 1,
			positionY : 6
		}
	];
	//ДД вводим переменные для храния предыдущих позиций змейки
	var thereFood = false;
	this.oneStep = function () {
		//ДД должны смещать позицию змеи на одну позицию в зависимости от направления
		//38 - вверх
		//40 - вниз
		//37 - влево
		//39 - вправо
		if (eventStack.length){
			this.direction = eventStack.pop();
			eventStack = [];
		}
		
		var newPositionPoint = {};
		//ДД добавляем новую точку в массив точек змейки
		if (this.direction === 39 && (this.positionPoints[this.positionPoints.length - 1].positionX + 1 <= 10)) {
			newPositionPoint.positionX = this.positionPoints[this.positionPoints.length - 1].positionX + 1;
			newPositionPoint.positionY = this.positionPoints[this.positionPoints.length - 1].positionY;
		} else if (this.direction === 38 && (this.positionPoints[this.positionPoints.length - 1].positionY + 1 <= 10)) {
			newPositionPoint.positionY = this.positionPoints[this.positionPoints.length - 1].positionY + 1;
			newPositionPoint.positionX = this.positionPoints[this.positionPoints.length - 1].positionX;
		} else if (this.direction === 37 && (this.positionPoints[this.positionPoints.length - 1].positionX - 1 >= 1)) {
			newPositionPoint.positionX = this.positionPoints[this.positionPoints.length - 1].positionX - 1;
			newPositionPoint.positionY = this.positionPoints[this.positionPoints.length - 1].positionY;
		} else if (this.direction === 40 && (this.positionPoints[this.positionPoints.length - 1].positionY - 1 >= 1)) {
			newPositionPoint.positionY = this.positionPoints[this.positionPoints.length - 1].positionY - 1;
			newPositionPoint.positionX = this.positionPoints[this.positionPoints.length - 1].positionX;
		} else {
			gameOver();
		}
		
		checkPosition(newPositionPoint);
		this.positionPoints.push(newPositionPoint);
		paintSnake();
		eatFood();
		unPaintOldSnakeCordinats();
		if (thereFood) {
			paintFood();
			upSpeed();
		} 
		refreshInfo();
	}

	this.changeDirection = function (keyCode) {
		//нельзя менять направление в противоположное
		if ((!(this.direction === 38 && keyCode === 40)) && (!(this.direction === 40 && keyCode === 38)) && (!(this.direction === 37 && keyCode === 39)) && (!(this.direction === 39 && keyCode === 37))) {
			eventStack.push(keyCode);
		}

	}
	
	//проверяет не врежется ли змейка сама в себя
	function checkPosition(newPositionPoint){
		for(var i=0;i<snake.positionPoints.length;i++){
			if(snake.positionPoints[i].positionX===newPositionPoint.positionX && snake.positionPoints[i].positionY===newPositionPoint.positionY){
				gameOver();
			}
		}
	}

	//ДД получаем первую точку в массиве и убираем ее если нет еды
	function unPaintOldSnakeCordinats() {
		var divWhereSnake = document.querySelector('.x' + snake.positionPoints[0].positionX + '.y' + snake.positionPoints[0].positionY);
		if (!thereFood) {
			divWhereSnake.classList.remove("thereIsSnake");
			snake.positionPoints.shift();
		}
	}

	//ДД едим еду
	function eatFood() {
		var divWhereSnake = document.querySelector('.x' + snake.positionPoints[snake.positionPoints.length - 1].positionX + '.y' + snake.positionPoints[snake.positionPoints.length - 1].positionY);
		if (divWhereSnake.classList.contains("thereIsFood")) {
			thereFood = true;
			snake.length += 1;
			snake.score += 100;
			divWhereSnake.classList.remove("thereIsFood");
		} else {
			thereFood = false;
		}
	}
	
	function refreshInfo(){
		var info = document.getElementById('info');
		info.innerHTML = '<p>SCORE: '+snake.score+'</p><p>SNAKE LENGTH: '+snake.length+'</p><p>SPEED: '+snake.speed+'</p>';
	}
	
	function upSpeed(){
		snake.speed -=50;
		stopMoving();
		startMoving(snake.speed);
	}
}

function stopMoving() {
	clearInterval(idInt);
	idInt = 0;
}

//ДД начинает игру и двигает змейку
function startMoving(speed) {
	if (!idInt) {
		idInt = setInterval(step, speed);
	}
}

function step() {
	snake.oneStep();
}

//ДД при загрузке окна заполняем клеточками основной Див 10*10
window.onload = newField();

//ДД проверяем нажатие кнопки
window.onkeydown = function () {
	if (snake) {
		//38 - вверх
		//40 - вниз
		//38 - вверх
		//37 - влево
		//39 - вправо
		snake.changeDirection(event.keyCode);
	}
}