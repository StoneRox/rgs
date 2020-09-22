let EventEmitter = {
	_events: {},
	on: function(eventName, func, scope) {
		this._events[eventName] = (this._events[eventName] || []);
		this._events[eventName].push({func,scope});
	},
	addListeners: function(events,scope) {
		Object.keys(events).forEach(eventName => {
			this.on(eventName,events[eventName],scope);
		});
	},
	off: function(eventName, func, scope) {
		this._events[eventName] = (this._events[eventName] || []).filter(a => a.func !== func && a.scope !== scope);
	},
	offAll: function(eventName) {
		delete this._events[eventName];
	},
	emit: function(eventName,data) {
		(this._events[eventName] || []).forEach(listener => {
			listener.func.bind(listener.scope)(data,() => {
				this.off(eventName,listener.func,listener.scope);
			});
		});
	}
}