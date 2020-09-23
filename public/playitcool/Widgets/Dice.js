(() => {
	class Dice extends PIXI.Container{
		constructor(gameState) {
			super();
			this.gameState = gameState;
			this.x = 375;
			this.y = 1150;
			this.rollTrigger = new PIXI.Sprite(loadedAssets['blank_dice.png']);
			this.addChild(this.rollTrigger);
			this.rollTrigger.visible = false;
			Utils.onClick(this.rollTrigger, this.roll, this);
			this.otherPlayerData = {};
			this.remainingRolls = 0;
			this.pawnsEnabled = 0;
			this.setListeners();
		}
		enableDice(color,skipIncrement) {
			this.rollTrigger.visible = true;
			this.color = color;
			if (color === this.gameState.player) {
				if (!+skipIncrement) {
					this.remainingRolls++;
				}
				this.rollTrigger.interactive = true;
				this.y = 1150;
			} else {
				this.rollTrigger.interactive = false;
				this.y = 190;
			}
			if (this.staticInstance) {
				this.staticInstance.destroy();
				delete this.staticInstance;
			}
		}
		disableDice(color) {
			if (!this.remainingRolls) {
				this.rollTrigger.visible = false;
				this.color = null;
				if (this.staticInstance) {
					this.staticInstance.destroy();
					delete this.staticInstance;
				}
			}
		}
		roll(rollNumber,pawnIndex) {
			let rolledNumber = +rollNumber || Utils.getRandomInt(1,6);
			if (this.color === this.gameState.player) {
				Utils.postMessage('playerRoll', {color: this.color, roll: rolledNumber});
				this.remainingRolls--;
			}
			this.rollTrigger.visible = false;
			let rollInstance = new PIXI.AnimatedSprite(loadedAssets.gameSprite.animations['roll_dice']);
			rollInstance.gotoAndPlay(0);
			this.gameState.turn.moves = rolledNumber;
			this.gameState.turn.color = this.color;
			Utils.delayedExecution(() => {
				rollInstance.visible = false;
				rollInstance.destroy();
				this.staticInstance = new PIXI.Sprite(loadedAssets['dice_end' + rolledNumber + '.png']);
				this.addChild(this.staticInstance);
				if (!+rollNumber) {
					if (rolledNumber === 6) {
						this.remainingRolls++;
					}
					EventEmitter.emit('enableMoves',{color: this.color, moves: rolledNumber});
					if (!this.remainingRolls && !this.pawnEnabled) {
						Utils.delayedExecution(() => {
							Utils.postMessage('playerTurnEnd');
						}, 0.5);
					}
				} 
			}, Utils.getRandomInt(500,1000) / 1000);
			this.addChild(rollInstance);
		}
		setListeners() {
			let events = {
				'startGame': this.enableDice,
				'enableDice': this.enableDice,
				'disableDice': this.disableDice,
				'pawnEnabled': () => {
					this.pawnEnabled++;
				},
				'pawnKilled': () => {
					this.remainingRolls++;
				},
				'moveEnded': (pawn) => {
					if (this.color === this.gameState.player) {
						if (!this.remainingRolls) {
							Utils.postMessage('playerTurnEnd');
						} else {
							this.enableDice(this.color,true);
						}
					}
				},
				'disablePawns': () => {
					this.pawnEnabled = 0;
				},
				'otherPlayerRoll': (data) => {
					this.enableDice(data.color);
					this.roll(data.rollNumber,data.pawnIndex);
				},
				'otherPlayerMoveEnded': (pawn) => {

				},
				'playerRoll': (data) => {
					this.enableDice(data.color);
					this.roll(data.roll);
				},
				'nextTurn': (data) => {
					this.disableDice();
					this.enableDice(data.color);
				}
			};
			EventEmitter.addListeners(events,this);
		}
	}
	module.exports = {
		Dice: Dice
	}
})();