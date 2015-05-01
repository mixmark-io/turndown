// For browser, export only select globals
if ( typeof window !== "undefined" ) {
	extend( window, QUnit.constructor.prototype );
	window.QUnit = QUnit;
}

// For CommonJS environments, export everything
if ( typeof module !== "undefined" && module.exports ) {
	module.exports = QUnit;
}
