
var readline = require('readline');
var fs = require('fs');

const lineReader = readline.createInterface({
    input: fs.createReadStream('data/pPortData.log.2016-02-08-02-48')
});

var insertCount = 0;

var lineCount = 0;


lineReader
    .on('line', (line) => {
        lineCount++;
        console.log('lineCount: ' + lineCount);
    })
    .on('close', function() {
        console.log('file closed', lineCount);
    });



