window.addEventListener('load',init);
function init() {
	let loggedIn = false;
	let gameJoined = false;
	var socket = io();
	socket.on('message', function(msg){
		console.log(msg);
	});
	login.addEventListener('click', () => {
		if (username.value) {
			socket.emit('login', username.value);
		}
	});
	createGame.addEventListener('click', () => {
		if (loggedIn && !gameJoined) {
			socket.emit('createGame');
		}
	});
	socket.on('login', function(openGames){
		if (openGames) {
			usernamePicker.style.display = 'none';
			user.innerText = username.value;
			openGames.forEach((game) => {
				onGameCreated(game);
			});
			loggedIn = true;
			content.classList.add('logged');
		} else {
			userError.innerText = 'This username is already taken';
			setTimeout(() => {
				userError.innerText = '';
			}, 1000);
		}
		username.value = '';
	});
	socket.on('gameCreated', onGameCreated);
	socket.on('openGame', function (data) {
		if (data.success === true) {
			lobby.classList.add('hide');
			document.body.classList.add('game-started');
			showGameFrame(data.players);
		}
	});
	socket.on('startGame', function (data) {
		postMessageToGame('startGame',data.startingColor);
	});
	socket.on('gameClosed', function (gameid) {
		let gameListItem = document.getElementById('game' + gameid);
		if (gameListItem) {
			games.removeChild(gameListItem);
		}
	});
	socket.on('playerJoined', function (playerData) {
		postMessageToGame('playerJoined',playerData);
	});
	socket.on('playerLeft', function (playerName) {
		console.log(playerName);
	});
	socket.on('playerRoll', function (data) {
		postMessageToGame('playerRoll',data);
	});
	socket.on('nextTurn', function (data) {
		postMessageToGame('nextTurn',data);
	});
	socket.on('playerMove', function (data) {
		postMessageToGame('playerMove',data);
	});
	function onGameCreated(game) {
		let listItem = document.createElement('li');
		listItem.id = 'game' + game.id;
		let joinGameButton = document.createElement('span');
		listItem.appendChild(joinGameButton);
		joinGameButton.innerText = JSON.stringify(game.players.map(p => p.username)).replace(/"/g,'');
		listItem.addEventListener('click', () => {
			socket.emit('joinGame',game.id);
		});
		games.appendChild(listItem);
	}
	function postMessageToGame(messageName,message) {
		gameFrame.contentWindow.postMessage({name: messageName, message: message});
	}
	function showGameFrame(players) {
		gameFrame.src = '/static/playitcool';
		document.getElementById('game').classList.add('block');
		let gameLoaded = false;
		let loadingScreenFinished = false;
		loadingScreen.classList.add('active');
		setTimeout(() => {
			loadingCircles.classList.add('active');
			setTimeout(() => {
				loadingScreenFinished = true;
				if (gameLoaded) {
					loadingScreen.classList.remove('active');
				}
			}, 3500);
		}, 100);
		gameFrame.addEventListener('load', () => {
			postMessageToGame('openGame',{players: players, currentPlayer: user.innerText});
			gameLoaded = true;
			if (loadingScreenFinished) {
				loadingScreen.classList.remove('active');
			}
		});
	}
	window.addEventListener('message', (message) => {
		socket.emit(message.data.name,message.data.message);
	});
}