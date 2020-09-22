(function(){
	_exports = {};

	window.require = function(path){
		return new Promise(resolve => {
			var script = document.createElement('script');
			script.src = path.replace(/.js$/, '') + '.js';
			var parent = document.head;
			
			if (document.body) {
				parent = document.body
			}
			
			script.onload = function() {
				parent.removeChild(script);
				resolve(_exports);
			};
			parent.appendChild(script);
		  });	
	}
	
	Object.defineProperty(window, 'module', { get: function() { return {set exports (args) {_exports = args}}}});
})()
