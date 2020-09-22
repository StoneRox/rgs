let express = require('express');
let app = express();
app.use('/static', express.static('public'));
let http = require('http').createServer(app);
let io = require('socket.io')(http);
let port = 82;
let gameId = 1;
let games = [];
let startedGames = [];
let users = {};
let passwords = [];
let events = {
	'login': (data) => {
		let socket = data.socket;
		let username = data.msg;
		let loginSuccess = false;
		if (!users[username]) {
			users[username] = socket;
			socket.username = username;
			loginSuccess = true;
		}
		socket.emit('login', loginSuccess ? getOpenGames() : false);
	},
	'createGame': (data) => {
		let game = createGame(data.socket);
		messageAllFreePlayers('gameCreated',getSafeGame(game.id));
		data.socket.emit('openGame',{
			success: true,
			players: [{username: data.socket.username, color: data.socket.color}]
		});
	},
	'joinGame': (data) => {
		let game = getGame(data.msg);
		let joinResult = {success: false};
		if (game && game.players.length < 4) {
			let playerColor = game.freeColors.splice(0,1)[0];
			data.socket.color = playerColor;
			game.players.forEach(player => {
				player.emit('playerJoined',{player: data.socket.username, color: playerColor});
			});
			game.players.push(data.socket);
			joinResult = {
				success: true,
				players: getSafeGame(game.id).players
			};
			data.socket.game = game;
		}
		data.socket.emit('openGame',joinResult);
	},
	'startGame': (data) => {
		let game = data.socket.game;
		if (game) {
			let startingPlayerColor = randomizeArray(game.players)[0].color;
			game.colorTurn = startingPlayerColor;
			game.players.forEach(player => {
				player.emit('startGame',{startingColor: startingPlayerColor});
			});
		}
	},
	'playerRoll': (data) => {
		let game = data.socket.game;
		if (game) {
			let color = data.msg.color;
			let roll = data.msg.roll;
			game.players.forEach(player => {
				if (player.color !== color) {
					player.emit('playerRoll',{color: color, roll: roll});
				}
			});
		}
	},
	'playerTurnEnd': (data) => {
		let game = data.socket.game;
		let colors = ['blue','red','green','yellow'].filter((color) => game.players.find(p => p.color === color));
		let colorTurnIndex = colors.indexOf(data.socket.game.colorTurn);
		let nextColorTurn = colors[clamp(colorTurnIndex+1,0,colors.length-1)];
		data.socket.game.colorTurn = nextColorTurn;
		game.players.forEach(player => {
			player.emit('nextTurn',{color: nextColorTurn});
		});
	},
	'playerMove': (data) => {
		let game = data.socket.game;
		game.players.forEach(player => {
			if (player.color !== game.colorTurn) {
				player.emit('playerMove', data.msg);
			}
		});
	}
}
app.get('/', function(req,res) {
	res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
	socket.on('disconnect', () => {
		if (socket.game) {
			let game = socket.game;
			if (game) {
				let playerIndex = game.players.indexOf(socket);
				if (playerIndex >= 0) {
					game.players.splice(playerIndex,1);
				}
				if(game.players.length === 1) {
					let openGamesIndex = games.indexOf(game);
					let startedGamesIndex = startedGames.indexOf(game);
					if (openGamesIndex >= 0) {
						games.splice(openGamesIndex,1);
					}
					if (startedGamesIndex >= 0) {
						startedGames.splice(openGamesIndex,1);
					}
					messageAllFreePlayers('gameClosed',game.id);
				} else {
					game.players.forEach(player => {
						if (player !== socket) {
							player.emit('playerLeft', socket.username);
						}
					});
				}
			}
		}
		delete users[socket.username];
	});
	Object.keys(events).forEach(eventName => {
		socket.on(eventName, (msg) => {
			events[eventName]({socket: socket, msg: msg});
		});
	});
});

http.listen(port, () => {
	console.log('listening on *:' + port);
});
function createGame(creator) {
	let gameColors = randomizeArray(['red','blue','green','yellow']);
	creator.color = gameColors.splice(0,1)[0];
	let game = {
		id: gameId++,
		players: [creator],
		freeColors: gameColors
	};
	creator.game = game;
	games.push(game);
	return game;
}
function getOpenGames() {
	return games
		.filter(game => game.players.length < 4)
		.map(game => {
			return {
				id: game.id,
				players: game.players.map(p => ({username: p.username, color: p.color}))
			};
		});
}
function getGame(id) {
	return games.find(g => g.id === id);
}
function getSafeGame(id) {
	let game = games.find(g => g.id === id);
	return {
		id: game.id,
		players: game.players.map(p => ({username: p.username, color: p.color})),
		moves: game.moves
	}
}
function hash(str) {
	let h;
	for(let i = 0; i < str.length; i++) {
		h = Math.imul(31,h) + str.charCodeAt(i)  | 0;
	}
	return h;
}
function messageAllFreePlayers(eventName,msg) {
	Object.values(users).forEach(user => {
		if (!user.game) {
			user.emit(eventName,msg);
		}
	});
}
function randomizeArray (arr) {
	let copyArr = arr.slice();
	let result = [];
	while(copyArr.length) {
		let randomIndex = Math.floor(Math.random() * copyArr.length);
		result.push(copyArr.splice(randomIndex,1)[0]);
	}
	return result;
}
function clamp (number,min,max) {
	var factor = min < 0 && max < 0 ? -1 : 1;
	var zeroFix = 0;
	var result = number * factor;
	if (factor < 0) {
		min = Math.abs(min);
		max = Math.abs(max);		
	}
	[min,max] = [Math.min(min,max),Math.max(min,max)];
	if (max === 0 && number !== 0) {
		max += 5;
		min += 5;
		number += 5;
		zeroFix = 5;
	}
	if (number > max) {
		result = clamp(number % (max + (min === 0 ? 1 : 0)) + min,min,max);
	}
	if (number < min) {
		result = clamp(number % (max + (min === 0 ? 1 : 0)) + max + (min === 0 ? 1 : 0), min,max);
	}
	return result - zeroFix;
}