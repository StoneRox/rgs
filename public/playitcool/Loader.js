let Loader = PIXI.Loader.shared;
let assets = [
	{id: 'gameSprite', src: 'assets/gameSprite.json'},
	{id: 'start_button', src: 'assets/start_button.png'}
];
let loadedAssets = {};
assets.forEach(asset => {
	Loader.add(asset.id, asset.src);
});
Loader.load((Loader, resources) => {
	assets.forEach(asset => {
		loadedAssets[asset.id] = resources[asset.id].texture || resources[asset.id].spritesheet;
		if (resources[asset.id].spritesheet) {
			let textures = resources[asset.id].spritesheet.textures;
			Object.keys(textures).forEach((id) => {
				loadedAssets[id] = textures[id];
			});
		}
	});
});
Loader.onComplete.add(() => {
	EventEmitter.emit('loadWidgets');
});