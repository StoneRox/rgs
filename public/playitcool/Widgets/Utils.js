let Utils = {
	centerPivot: function(obj) {
		let bounds = obj.getLocalBounds();
		obj.pivot.set(bounds.width / 2 + bounds.x, bounds.height / 2 + bounds.y);
		obj.x += obj.pivot.x;
		obj.y += obj.pivot.y;
	},
	delayedExecution: function(func, delay, params, scope) {
		gsap.delayedCall(delay, func.bind(scope), params);
	},
	getRandomInt: function(min,max) {
		return Math.ceil(Math.random() * (max - min + 1)) - 1 + min;
	},
	onClick: function(obj, func, scope) {
		obj.interactive = true;
		obj.interactiveChildren = true;
		obj.buttonMode = true;
		obj.on('touchstart', func, scope);
		obj.on('click', func, scope);
	},
	Tween: function() {
		return gsap.timeline();
	},
	randomizeArray: function (arr) {
		let copyArr = arr.slice();
		let result = [];
		while(copyArr.length) {
			let randomIndex = Math.floor(Math.random() * copyArr.length);
			result.push(copyArr.splice(randomIndex,1)[0]);
		}
		return result;
	},
	postMessage: function(name,data) {
		window.parent.postMessage({name: name, message: data});
	}
};

module.exports = {
	Utils: Utils
}