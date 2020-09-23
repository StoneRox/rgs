(()=>{
	EventEmitter.on('assetsLoaded', init);
	let gameState = {
		player: '',
		turn: {
			color: '',
			moves: 0
		}
	};
	let tileSize = 48;
	let gameInitialized = false;
	let initialPlayerData;
	function resize(app) {
		let scaleX = app.view.offsetHeight / 1334;
		app.stage.scale.x = scaleX;
		app.stage.x = (750 * (1-scaleX)) / 2;
	}
	function init() {
		const app = new PIXI.Application({width: 750, height: 1334, backgroundColor: 0x1099bb});
		document.body.appendChild(app.view);
		window.addEventListener('resize', () => {resize(app);});
		resize(app);
		const stage = new PIXI.Container();
		gameState.stage = stage;
		window.app = app;
		window.stage = stage;
		app.stage.addChild(stage);
		let Grid = new Widgets.Grid(tileSize);
		let Dice = new Widgets.Dice(gameState);
		stage.addChild(Grid,Dice);
		let pawns = [
			{color: 'red', colorValue: 0xff4040},
			{color: 'green', colorValue: 0x00b100},
			{color: 'yellow', colorValue: 0xfbfb00},
			{color: 'blue', colorValue: 0x0008fb}
		];
		pawns.forEach(pawnConfig => {
			for(let i = 0; i < 4; i++) {
				let sharedConfig = {grid: Grid, tileSize: tileSize, scale: 0.6, anchor: {x: 0.5, y: 0.75}, step: 0};
				sharedConfig.color = pawnConfig.color;
				sharedConfig.colorValue = pawnConfig.colorValue;
				let pawn = new Widgets.Pawn(
					loadedAssets['pawn.png'].clone(),
					sharedConfig,
					gameState,
					i
				);
			}
		});
		let players = {
			blue: new PIXI.Text('blue'),
			red: new PIXI.Text('red'),
			green: new PIXI.Text('green'),
			yellow: new PIXI.Text('yellow'),
		};
		stage.addChild(players['blue'],players['red'],players['green'],players['yellow']);
		players['blue'].position.set(20,260);
		players['red'].position.set(460,260);
		players['green'].position.set(460,1040);
		players['yellow'].position.set(20,1040);
		EventEmitter.on('openGame', setPlayerNames);
		EventEmitter.on('playerJoined', (data) => {
			players[data.color].text = data.player;
		});
		if (!gameInitialized) {
			gameInitialized = true;
			setPlayerNames(initialPlayerData);
		}
		function setPlayerNames(data) {
			if (data.players.length === 1) {
				let startButton = new PIXI.Sprite(loadedAssets['start_button']);
				stage.addChild(startButton);
				Utils.centerPivot(startButton);
				startButton.x = 375;
				startButton.y = 667;
				Utils.onClick(startButton, () => {
					Utils.postMessage('startGame');
					startButton.visible = false;
				});
			}
			data.players.forEach((playerData) => {
				players[playerData.color].text = playerData.username;
				if (playerData.username === data.currentPlayer) {
					gameState.player = playerData.color;
				}
			});
		}
	}
	window.addEventListener('message', (message) => {
		if (gameInitialized) {
			EventEmitter.emit(message.data.name,message.data.message);
		} else {
			initialPlayerData = message.data.message;
		}
	});
})();