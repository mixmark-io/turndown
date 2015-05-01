/*jshint node:true */
module.exports = function( Release ) {

var shell = require( "shelljs" ),
	gruntCmd = process.platform === "win32" ? "grunt.cmd" : "grunt";

Release.define({
	npmPublish: true,
	issueTracker: "github",
	changelogShell: function() {
		return "# Changelog for QUnit v" + Release.newVersion + "\n";
	},

	generateArtifacts: function( done ) {
		if ( Release.exec( gruntCmd ).code !== 0 ) {
			Release.abort("Grunt command failed");
		}
		shell.mkdir( "-p", "qunit" );
		shell.cp( "-r", "dist/*", "qunit/" );
		shell.mkdir( "-p", "dist/cdn" );
		shell.cp( "dist/qunit.js", "dist/cdn/qunit-" + Release.newVersion + ".js" );
		shell.cp( "dist/qunit.css", "dist/cdn/qunit-" + Release.newVersion + ".css" );
		done([ "qunit/qunit.js", "qunit/qunit.css" ]);
	},
});

};