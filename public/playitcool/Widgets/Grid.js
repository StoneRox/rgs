(() => {
	class Grid extends PIXI.Container{
		constructor(tileSize) {
			super();
			this.sortableChildren = true;
			this.tileSize = tileSize;
			let grid = [];
			this.tiles = grid;
			this.colorTiles = {};
			this.colorStartTile = {};
			let initialPosition = {x: 375 - tileSize * 1.5, y: 20};
			for(let i = 0; i < 52; i++) {
				let tile = this.makeTile(tileSize,tileSize);
				tile.tileSize = tileSize;
				tile.arrangeTilePawns = this.arrangeTilePawns.bind(tile);
				this.addChild(tile);
				grid.push(tile);
				if (grid[i-1]) {
					grid[i-1].next = tile;
					tile.previous = grid[i-1];
					tile.index = i;
				}
				if (i === 51) {
					tile.next = grid[0];
				}
				if (i < 3) {
					tile.x = initialPosition.x + tileSize * i;
					tile.y = initialPosition.y;
				} else if (i >= 3 && i < 8) {
					tile.x = grid[2].x;
					tile.y = grid[i-1].y + tileSize;
				} else if (i >= 8 && i < 14) {
					tile.x = grid[i-1].x + tileSize;
					tile.y = grid[7].y + tileSize;
				} else if (i >= 14 && i < 16) {
					tile.x = grid[13].x;
					tile.y = grid[i-1].y + tileSize;
				} else if (i >= 16 && i < 21) {
					tile.x = grid[i-1].x - tileSize;
					tile.y = grid[15].y;
				} else if (i >= 21 && i < 27) {
					tile.x = grid[20].x - tileSize;
					tile.y = grid[i-1].y + tileSize;
				} else if (i >= 27 && i < 29) {
					tile.x = grid[i-1].x - tileSize;
					tile.y = grid[26].y;
				} else if (i >= 29 && i < 34) {
					tile.x = grid[28].x;
					tile.y = grid[i-1].y - tileSize;
				} else if (i >= 34 && i < 40) {
					tile.x = grid[i-1].x - tileSize;
					tile.y = grid[33].y - tileSize;
				} else if (i >= 40 && i < 42) {
					tile.x = grid[39].x;
					tile.y = grid[i-1].y - tileSize;
				} else if (i >= 42 && i < 47) {
					tile.x = grid[i-1].x + tileSize;
					tile.y = grid[41].y;
				} else if (i >= 47 && i < 52) {
					tile.x = grid[46].x + tileSize;
					tile.y = grid[i-1].y - tileSize;
				}
				if (i === 1 || i === 14 || i === 27 || i === 40) {
					let colorValue;
					let colorTiles = [];
					let color;
					let nextX = 0;
					let nextY = 0;
					if (i === 1) {
						color = 'red';
						nextY = tileSize;
						colorValue = 0xff0000;
					} else if (i === 14) {
						color = 'green';
						nextX = -tileSize;
						colorValue = 0x00b100;
					} else if (i === 27) {
						color = 'yellow';
						nextY = -tileSize;
						colorValue = 0xfbfb00;
					} else if (i === 40) {
						color = 'blue';
						nextX = tileSize;
						colorValue = 0x0008fb;
					}
					this.colorTiles[color] = colorTiles;
					for(let j = 0; j < 6; j++) {
						let colorTile = this.makeTile(tileSize,tileSize, colorValue);
						colorTile.tileSize = tileSize;
						colorTile.arrangeTilePawns = this.arrangeTilePawns.bind(colorTile);
						this.addChild(colorTile);
						colorTile.color = color;
						colorTile.index = j;
						colorTile.previous = (colorTiles[j-1] || tile);
						colorTiles.push(colorTile);
						colorTile.previous[color + 'Next'] = colorTile;
						colorTile.x = colorTile.previous.x + nextX;
						colorTile.y = colorTile.previous.y + nextY;
					}
				}
				if (i === 3) {
					this.colorStartTile.red = tile;
					tile.protected = true;
					tile.tint = 0xff0000;
				} else if (i === 16) {
					this.colorStartTile.green = tile;
					tile.protected = true;
					tile.tint = 0x00b100;
				} else if (i === 29) {
					this.colorStartTile.yellow = tile;
					tile.protected = true;
					tile.tint = 0xfbfb00;
				} else if (i === 42) {
					this.colorStartTile.blue = tile;
					tile.protected = true;
					tile.tint = 0x0008fb;
				}

				if (i === 11 || i === 24 || i === 37 || i === 50) {
					tile.tint = 0xaaaaaa;
					tile.protected = true;
				}
			}
			Utils.centerPivot(this);
			this.x = 375;
			this.y = 667;
			let gridCenter = new PIXI.Graphics();
			let gridCenterLength = Math.floor(1.5*tileSize);
			gridCenter
				.beginFill(0xff0000)
				.lineStyle(1,0x555555)
				.moveTo(0,0)
				.lineTo(gridCenterLength * 2, 0)
				.lineTo(gridCenterLength, gridCenterLength)
				.beginFill(0x00b100)
				.lineTo(gridCenterLength * 2, gridCenterLength * 2)
				.lineTo(gridCenterLength * 2, 0)
				.moveTo(gridCenterLength * 2, gridCenterLength * 2)
				.beginFill(0xfbfb00)
				.lineTo(0, gridCenterLength * 2)
				.lineTo(gridCenterLength, gridCenterLength)
				.moveTo(0, gridCenterLength * 2)
				.beginFill(0x0008fb)
				.lineTo(0, 0)
				.lineTo(gridCenterLength, gridCenterLength)
			Utils.centerPivot(gridCenter);
			gridCenter.x = 7.5 * tileSize - 10;
			gridCenter.y = 7.5 * tileSize - 5;
			let pawnHolder = new PIXI.Graphics();
			pawnHolder
				.beginFill(0x0008fb)
				.lineStyle(1,0x555555)
				.drawRect(0,0,6 * tileSize,6 * tileSize)
				.beginFill(0xff0000)
				.moveTo(9 * tileSize + 2, 0)
				.drawRect(9 * tileSize + 2, 0,6 * tileSize,6 * tileSize)
				.beginFill(0x00b100)
				.drawRect(9 * tileSize+2, 9 * tileSize+2,6 * tileSize,6 * tileSize)
				.beginFill(0xfbfb00)
				.drawRect(0,9 * tileSize+2,6 * tileSize,6 * tileSize)
				.lineStyle(4,0x555555)
				.beginFill(0xffffff)
				.drawCircle(1.93 * tileSize,2.1 * tileSize,26)
				.drawCircle(3.93 * tileSize,2.1 * tileSize,26)
				.drawCircle(3.93 * tileSize,4.1 * tileSize,26)
				.drawCircle(1.93 * tileSize,4.1 * tileSize,26)
				.drawCircle(11.13 * tileSize,2.1 * tileSize,26)
				.drawCircle(13.13 * tileSize,2.1 * tileSize,26)
				.drawCircle(11.13 * tileSize,4.1 * tileSize,26)
				.drawCircle(13.13 * tileSize,4.1 * tileSize,26)
				.drawCircle(11.13 * tileSize,11.3 * tileSize,26)
				.drawCircle(13.13 * tileSize,11.3 * tileSize,26)
				.drawCircle(11.13 * tileSize,13.3 * tileSize,26)
				.drawCircle(13.13 * tileSize,13.3 * tileSize,26)
				.drawCircle(1.93 * tileSize,11.3 * tileSize,26)
				.drawCircle(3.93 * tileSize,11.3 * tileSize,26)
				.drawCircle(3.93 * tileSize,13.3 * tileSize,26)
				.drawCircle(1.93 * tileSize,13.3 * tileSize,26)
			pawnHolder.x = -10;
			pawnHolder.y = -6;
			this.addChild(gridCenter,pawnHolder);
			window.test = gridCenter;
		}
		getTileByIndex(index) {
			return this.tiles.find(tile => tile.index === index);
		}
		makeTile(width,height,color) {
			let tile = new PIXI.Graphics();
			tile.pawns = [];
			let offset = {x: -width/2, y: -height / 2};
			tile
				.beginFill(color || 0xffffff)
				.lineStyle(4,0x555555)
				.moveTo(offset.x,offset.y)
				.lineTo(width + offset.x,offset.y)
				.lineTo(width + offset.x,offset.y + height)
				.lineTo(offset.x,offset.y + height)
				.lineTo(offset.x,offset.y - 2);
			return tile;
		}
		arrangeTilePawns() {
			let tilePawnsCount = this.pawns.length;
			if (tilePawnsCount > 1) {
				let topPawnsCount = Math.ceil(tilePawnsCount / 2);
				let topPawns = this.pawns.slice(0,topPawnsCount);
				let bottomPawns = this.pawns.slice(topPawnsCount);
				let scale = this.pawns[0].config.scale / (tilePawnsCount - 0.5);
				let paddingTopX = (this.tileSize - 10) / (topPawns.length);
				let paddingBottomX = (this.tileSize - 10) / (bottomPawns.length);
				let paddingY = (this.tileSize - 10);
				topPawns.forEach((topPawn,i) => {
					topPawn.x = this.x - this.tileSize/2 + 15 + (paddingTopX * (i));
					topPawn.y = this.y - this.tileSize/2 + 15;
					topPawn.scale.set(scale);
				});
				bottomPawns.forEach((bottomPawn,i) => {
					bottomPawn.x = this.x + this.tileSize/2 - 15 - paddingBottomX * i;
					bottomPawn.y = this.y - this.tileSize/2 + 5 + paddingY;
					bottomPawn.scale.set(scale);
				});
			} else if (tilePawnsCount === 1) {
				this.pawns[0].scale.set(this.pawns[0].config.scale);
				this.pawns[0].x = this.x;
				this.pawns[0].y = this.y;
			}
		}
	}
	module.exports = {
		Grid: Grid
	}
})();