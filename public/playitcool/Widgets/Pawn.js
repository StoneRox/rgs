(() => {
	class Pawn extends PIXI.Sprite{
		constructor(texture,config,gameState,id) {
			super(texture);
			this.anchor.x = config.anchor.x;
			this.anchor.y = config.anchor.y;
			this.scale.set(config.scale);
			this.tint = config.colorValue || 0;
			this.step = config.step;
			this.color = config.color;
			this.config = config;
			this.setListeners();
			this.tileSize = config.tileSize;
			this.id = id;
			this.gameState = gameState;
			config.grid.addChild(this);
			this.startTile = config.grid.colorStartTile[this.color];
			let offsetX = 0;
			let offsetY = this.tileSize / 1.5;
			offsetX = (id % 2 * 2) * this.tileSize + this.tileSize * 2.6;
			if (this.color === 'blue') {
				offsetX -= (2 * id % 2) * this.tileSize + this.tileSize * 2.2;
				offsetY -= 5 * this.tileSize;
			} else if (this.color === 'yellow') {
				offsetX -= (2 * id % 2) * this.tileSize + this.tileSize * 7.2;
				offsetY -= 2.8 * this.tileSize;
			} else if (this.color === 'green') {
				offsetX -= (2 * id % 2) * this.tileSize + this.tileSize * 5;
				offsetY += 2.2 * this.tileSize;
			}
			if (id >= 2) {
				offsetY += 2 * this.tileSize;
			}
			this.x = this.startTile.x + offsetX;
			this.y = this.startTile.y + offsetY;
			this.zIndex = 100;
			let halfTileSize = (this.tileSize / 2) * (1/0.6);
			this.hitArea = new PIXI.Polygon(-41, 0, 0, 33, 41, 0, 30, -83, 0, -108, -30, -83);
			Utils.onClick(this,() => {
				if (gameState.player === this.color) {
					Utils.postMessage('playerMove', {color: this.color, id: this.id});
				}
				EventEmitter.emit('disablePawns');
				this.parent.addChild(this);
				if (this.currentTile) {
					this.movePawn(gameState.turn.moves);
				} else {
					this.currentTile = this.startTile;
					this.x = this.startTile.x;
					this.y = this.startTile.y;
					this.currentTile.pawns.push(this);
					this.currentTile.arrangeTilePawns();
					EventEmitter.emit('moveEnded',this);
				}
			});
			this.interactive = false;
		}
		movePawn(moves) {
			if (moves && this.currentTile) {
				let tween = Utils.Tween();
				let jumpTween = Utils.Tween();
				let tile = this.currentTile;
				this.stopped = false;
				this.scale.set(this.config.scale);
				let index = this.currentTile.pawns.indexOf(this);
				if (index >= 0) {
					this.currentTile.pawns.splice(index,1);
				}
				let next = this.currentTile[this.color + 'Next'] || this.currentTile.next;
				for(let i = 0; i < moves; i++) {
					let jumpPoint = {
						x:  this.currentTile.x,	
						y:  this.currentTile.y - this.tileSize / 2,
						duration: .100
					};
					let nextTile = this.currentTile[this.color + 'Next'] || this.currentTile.next;
					if (nextTile) {
						if (this.currentTile.x < nextTile.x) {
							jumpPoint.x += this.tileSize / 2;
						}
						if (this.currentTile.x > nextTile.x) {
							jumpPoint.x -= this.tileSize / 2;
						}
						if (this.currentTile.y > nextTile.y) {
							jumpPoint.y -= this.tileSize;
						}
						jumpTween.add(() => {
							this.zIndex = this.y + 100;
							next = next[this.color + 'Next'] || next.next;
						});
						jumpTween.to(this.scale, {y: this.scale.y * 0.8, duration: .050});
						jumpTween.to(this.scale, {y: this.scale.y, duration: .050});
						tween.to(this, jumpPoint);
						tween.to(this, {duration: .100,x: nextTile.x,y: nextTile.y});
						this.currentTile = nextTile;
					}
				}
				this.currentTile.pawns.push(this);
				tween.add(() => {
					EventEmitter.emit('pawnStopped', this);
					this.checkEndStep();
					EventEmitter.emit('moveEnded',this);
				});
				tile.arrangeTilePawns();
			}
		}
		checkEndStep() {
			// if (this.gameState.player === this.gameState.turn.color && this.gameState.turn.moves === 6) {
			// 	// EventEmitter.emit('enableDice', this.gameState.player);
			// } else {
			// 	EventEmitter.emit('disableDice');
			// }
			this.stopped = true;
			if (!this.currentTile.protected) {
				let tilePawns = {};
				this.currentTile.pawns.forEach(tilePawn => {
					if (tilePawn.color !== this.color) {
						tilePawns[tilePawn.color] = tilePawns[tilePawn.color] || [];
						tilePawns[tilePawn.color].push(tilePawn);
					}
				});
				let returnedPawns = [];
				Object.keys(tilePawns).forEach(color => {
					if (tilePawns[color].length === 1) {
						tilePawns[color].forEach((tilePawn, i) => {
							let tween = Utils.Tween();
							returnedPawns.push(tilePawn);
							tween.to(tilePawn, {duration: .100, delay: .100 * i,x:  tilePawn.startTile.x,y:  tilePawn.startTile.y});
							tween.add(() => {
								tilePawn.zIndex = tilePawn.y + 100;
							})
							tilePawn.currentTile = tilePawn.startTile;
						});
					}
				});
				if (returnedPawns.length) {
					EventEmitter.emit('pawnKilled');
				}
				this.currentTile.pawns = this.currentTile.pawns.filter(pawn => !returnedPawns.includes(pawn));
			}
			this.currentTile.arrangeTilePawns();
			this.zIndex = this.y + 100;
		}
		enablePawn(data) {
			if (data.color === this.color) {
				if (
					(this.currentTile || data.moves === 6) &&
					(
						!this.currentTile ||
						!this.currentTile.color ||
						(
							this.currentTile[this.color + 'Next'] &&
							this.currentTile[this.color + 'Next'].index + data.moves - 1 < 6
						)
					) && this.gameState.player === this.color
				) {
					if (this.gameState.player === this.color) {
						this.interactive = true;
						this.idle = Utils.Tween();
						this.idle.to(this, {alpha: 0.5, duration: 0.5});
						this.idle.to(this, {alpha: 1, duration: 0.5});
						this.idle.repeat(-1);
						EventEmitter.emit('pawnEnabled',this);
					} else {
						return true;
					}
				}
			}
		}
		setListeners() {
			let events = {
				'enablePawns': this.enablePawn,
				'disablePawns': (color) => {
					this.interactive = false;
					if (this.idle) {
						this.idle.kill();
						this.alpha = 1;
					}
				},
				'movePawn': (data) => {
					if (this.id === data.id && this.color === data.color) {
						this.movePawn(data.moves);
					}
				},
				'enableMoves': (data) => {
					this.gameState.turn.color = data.color;
					this.gameState.turn.moves = data.moves;
					this.enablePawn(data);
				},
				'playerMove': (data) => {
					if (data.color === this.color && data.id === this.id) {
						this.emit('click');
					}
				}
			};
			EventEmitter.addListeners(events,this); 
		}		
	}
	module.exports = {
		Pawn: Pawn
	}
})();