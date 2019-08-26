#!/usr/bin/env node

'use strict';

/*
 * Turndown CLI
 */

const fs = require('fs');
const path = require('path');

const glob = require('glob');
const program = require('commander');
const TurndownService = require('../')

program
    .version(require('../package.json').version)
    .usage('<files...>')
    .description(
        'Convert HTML into Markdown with JavaScript.\n\n' +
        'Every file provided (wildcards supported) will be convertes to a .md file'
    )
    .parse(process.argv);

var turndownService = new TurndownService()

let inputs = program.args;
if(!inputs.length) {
    program.help();
}

inputs.forEach(function (input) {
    glob(input, {absolute: true}, function (err, files) {
        if (err) {
            throw err;
        } else {
            files.forEach(function (inFile) {
                fs.readFile(inFile, 'utf8', function read(err, data) {
                    let outFile = inFile.replace(new RegExp(".html$"), "") + ".md";
                    if (err) {
                        throw err;
                    }
                    fs.writeFile(outFile, turndownService.turndown(data), 'utf8', (err, md) => {
                        if(err) {
                            throw err;
                        }
                        console.log(`converted ${inFile} to ${outFile}`);
                    });
                });
            });
        }
    });
});
