let widgets = [
	'Grid',
	'Utils',
	'Pawn',
	'Dice'
];
let Widgets = {};
EventEmitter.on('loadWidgets', () => {
	widgets.forEach((widgetName) => {
		require('Widgets/' + widgetName +'.js').then((res) => {
			Widgets[widgetName] = res[widgetName];
			if (Object.keys(Widgets).length === widgets.length) {
				EventEmitter.emit('assetsLoaded');
			}
		});
	});	
});