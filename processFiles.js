var mongodb = require('mongodb');
var mongoClient = mongodb.MongoClient;
var url = 'mongodb://localhost:27017/traintimes';

var Promise = require('bluebird')

var xpath = require('xpath');
var domParser = require('xmldom').DOMParser;
var select = xpath.useNamespaces({"pp": "http://www.thalesgroup.com/rtti/PushPort/v12"});

var lineReader = require('line-reader');

var datafile = 'data/pPortData.log.2016-02-21-02-24'

var insertCount = 0
var processedCount = 0

mongoClient.connect(url, function (err, db) {

    if (err) {
        console.log('Unable to connect to the mongoDB server. Error:', err);
    } else {
        console.log('Connection established to', url);
        var collection = db.collection('traintimes');

        var lineCount = 0
        var eachLine = Promise.promisify(lineReader.eachLine);
        eachLine(datafile, function(line) {
            lineCount++
//            console.log(line)
            persistData(collection, line)
        }).then(function() {
                console.log('lineCount=' + lineCount + ' / insertCount=' + insertCount + ' / processedCount=' + processedCount)
                return true;
        }).then(function() {
            console.log('extra promise')
            db.close()
            return true
        }).catch(function(err) {
            console.error(err)
        });
    }
});

var persistData = function(collection, xml) {
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

//                    console.log('schedule / rid: ' + rid + ', ssd: ' + ssd + ', toc: ' + toc + ', trainId: ' + trainId + ', uid: ' + uid);

        var schedule = {rid: rid, ssd: ssd, toc: toc, trainId: trainId, uid: uid};
        insertCount++;
        console.log(insertCount + ' : ' + schedule)

        collection.insert(schedule, function(err,res) {
            if(err) {
                console.log('error: ' + err)
            }
            else {

            }
        });
    }
    processedCount++
}


