var mongodb = require('mongodb');
var mongoClient = mongodb.MongoClient;
var url = 'mongodb://localhost:27017/traintimes';

var xpath = require('xpath');
var domParser = require('xmldom').DOMParser;
var select = xpath.useNamespaces({"pp": "http://www.thalesgroup.com/rtti/PushPort/v12"});

var fs = require('fs');
var readline = require('readline');
var stream = require('stream');
var instream = fs.createReadStream('data/testfile')
var outstream = new stream

var insertCount = 0;
var lineCount = 0;

 function parseTS(doc) {
    var rid = select("//pp:TS/@rid", doc)[0]
    var ssd = select("//pp:TS/@ssd", doc)[0]
    var uid = select("//pp:TS/@uid", doc)[0]

    console.log('TS / rid: ' + rid.value + ', ssd: ' + ssd.value + ', uid: ' + uid.value);
}

mongoClient.connect(url, function (err, db) {
    if (err) {
        console.log('Unable to connect to the mongoDB server. Error:', err);
    } else {
        console.log('Connection established to', url);
        var collection = db.collection('traintimes');

        var rl = readline.createInterface(instream, outstream)

        rl
            .on('line', function(xml) {
                lineCount++;
                console.log('lineCount: ', lineCount);

                var doc = new domParser().parseFromString(xml);

                var schedule = select('//pp:schedule', doc);
                var TS = select('//pp:TS', doc);

                if( typeof schedule !== 'undefined' &&  schedule.length > 0 ) {
                    var node = select("//pp:schedule/@rid", doc)[0]
                    var rid = node.value;
                    node = select("//pp:schedule/@ssd", doc)[0]
                    var ssd = node.value;
                    node = select("//pp:schedule/@toc", doc)[0]
                    var toc = node.value
                    node = select("//pp:schedule/@trainId", doc)[0]
                    var trainId = node.value;
                    node = select("//pp:schedule/@uid", doc)[0]
                    var uid = node.value;

                    console.log('schedule / rid: ' + rid + ', ssd: ' + ssd + ', toc: ' + toc + ', trainId: ' + trainId + ', uid: ' + uid);

                    var schedule = {rid: rid, ssd: ssd, toc: toc, trainId: trainId, uid: uid};
                    collection.insert(schedule, function(err,res) {
                        if(err) {
                            console.log('error: ' + err)
                        }
                        else {
                            insertCount++
                            console.log('InsertCount:' + insertCount)
                        }
                    });

                }
            })
            .on('close', function() {
                console.log("Close reader");

            });
        setTimeout(checkEnd, 1000);
    }
});

var checkEnd = function() {
    if( insertCount < lineCount) {
        console.log('checkEnd().insertCount is less than lineCount: ' + insertCount + '/' + lineCount);
        setTimeout(checkEnd, 1000);
    }
    else {
        console.log('read all of the lines so terminating')
    }
}


