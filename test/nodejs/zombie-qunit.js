var zombie = require("zombie");
var express = require("express");
var _ = require("underscore")._;

var qunitResults;

exports.setUp = function(callback) {
    var server = express.createServer();
    server.configure(function() {
        server.use(express.errorHandler());
        server.use("/", express.static(__dirname + "/../../"));
        server.use("/", express.directory(__dirname + "/../../"));
    });
    server.listen(3000, function() {
        var location = "http://localhost:3000/test/test-runner.html";
        var browser = new zombie.Browser({
            debug: false,
            userAgent: 'Zombie'
        });
        browser.visit(location, function(err, browser, status) {
            // Start QUnit
            browser.fire('load', browser.window);

            // If you have long tests, tweak the wait time here
            browser.wait(4000, function(err, browser) {
                qunitResults = browser.queryAll('#qunit-tests > li');
                server.close();
                callback();
            });
        });
    });
};

exports['test to-markdown with a headless browser'] = function(test) {
    _.each(qunitResults, function(listItem) {
        var group = listItem.childNodes.item(0);
        var groupName = group.childNodes.item(0).textContent;
        if (!listItem.childNodes.item(2)) {
            return;
        }
        var group = listItem.childNodes.item(0);
        var testGroup = group.childNodes.item(0).textContent + ': ' + group.childNodes.item(2).textContent;
        _.each(listItem.childNodes.item(2).childNodes, function(individualTest) {
            var testMessage = individualTest.textContent;
            var testState = individualTest._attributes._nodes['class']._nodeValue;
            test.equal(testState, 'pass', testGroup + ': ' + testMessage);
        });
    });
    test.done();
};
