/**
 * Module dependencies.
 */
var express = require('express'),
    routes = require('./routes'),
    user = require('./routes/user'),
    http = require('http'),
    https = require('https'),
    path = require('path'),
    fs = require('fs');

var app = express();

var db;
var cloudant;
var dbCredentials = { dbName: 'my_sample_db' };

var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var logger = require('morgan');
var errorHandler = require('errorhandler');

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.use(logger('dev'));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/style', express.static(path.join(__dirname, '/views/style')));

// development only
if ('development' === app.get('env')) {
    app.use(errorHandler());
}

// Return details for bound remote services. When running in Cloud Foundry (e.g. on Bluemix) the details are in
// an environment variable (VCAP_SERVICES). Otherwise they are stored in a file (vcap-local.json).
// To create the file, use the output of "cf env" or the app dashboard on Bluemix.
function getServices() {
	var vcapServices = process.env.VCAP_SERVICES;
	if (!vcapServices) {
		fs.readFileSync("vcap-local.json", "utf-8");
    }
    return JSON.parse(vcapServices);
}
var services = getServices();
console.log('### REMOTE SERVICES ### ' + JSON.stringify(services));

// Return the credentials required to connect to the Insights for Twitter service instance on Bluemix.
function getTwitterCreds(services) {
    for (var service in services) {
		if (service.match(/twitter/i)) {
			return services[service][0].credentials;
        }
    }
    return {};
}
var twitterCreds = getTwitterCreds();

// Return the URL (which includes the credentials) to connect to the Cloudant NoSQL DB service instance on Bluemix.
function getDBCredentialsUrl(services) {
    for (var service in services) {
        if (service.match(/cloudant/i)) {
            return services[service][0].credentials.url;
        }
    }
}

// Initialize the connection to the Cloudant DB.
function initDBConnection() {
	dbCredentials.url = getDBCredentialsUrl(process.env.VCAP_SERVICES);
    cloudant = require('cloudant')(dbCredentials.url);
    cloudant.db.create(dbCredentials.dbName, function(err, res) {
        if (err) {
            console.log('Cloudant DB ' + dbCredentials.dbName + ' already exist.');
        }
    });
    db = cloudant.use(dbCredentials.dbName);
}
initDBConnection();

app.get('/', routes.index);

app.get('/api/twearch', function(request, response) {
    var term = request.query.term;
    //var xoptions = {
    //	host: twitterCreds.username+":"+twitterCreds.password+"@"+twitterCreds.host,
    //	port: twitterCreds.port,
    //	path: "/api/v1/messages/search?q="+term
    //};
    var options = twitterCreds.url+"/api/v1/messages/search?q="+term+"&size=15";
    console.log('########### OPTIONS: '+options);
    getTweets(options, function(err, tweets) {
    	if (err) {
			console.error("Error getting tweets ", err);
			response.status(500);
			response.setHeader('Content-Type', 'text/plain');
			response.write("Error! "+err);
			response.end();
			return;
    	}
		var items = [];
		for (var i = 0; i < tweets.length; ++i) {
			console.log("####### RAW TWEET: "+JSON.stringify(tweets[i]));
			var tweet = tweets[i];
			var usr = tweet.message.actor.displayName;
			var msg = tweet.message.body;
			var img = tweet.message.actor.image;
			var cnt = tweet.cde ? tweet.cde.content : null;
			var snt = cnt ? cnt.sentiment.polarity : "NEUTRAL";
			console.log("####### PROCESSED TWEET: "+usr+" "+msg+" "+snt);
			items.push({ username:usr, image:img, text:msg, sentiment:snt});
		}
		response.status(200);
		response.setHeader('Content-Type', 'text/plain');
        response.write(JSON.stringify(items));
		response.end();
		saveTweets(term,items);
		return;
    });
});

function getTweets(options, callback) {
	console.log("############# Getting Tweets");
	https.get(options, function(response) {
		var body = '';
		response.on('data', function(chunk) {
			body += chunk;
		});
		response.on('end', function() {
			console.log("############# Got Tweets");
			var result = JSON.parse(body);
			callback(null, result.tweets);
		});
		response.on('error', callback);
	})
	.on('error', callback)
	.end();
}

app.get('/api/clearch', function(request, response) {
    var term = request.query.term;
	db = cloudant.use(dbCredentials.dbName);
	db.list(function(err, body) {
		var items = [];
		if (!err) {
			var len = body.rows.length;
			console.log('CLEARCH rowss='+len);
			var j = 0;
			var gotit = false;
			for (var i=0; i<len; i++) {
				var cdoc = body.rows[i];
				console.log('CLEARCH '+i+' of '+len+' id='+cdoc.id);
				db.get(cdoc.id, { revs_info: true }, function(err, doc) {
					j++;
					if (gotit) return;
					if (!err) {
						console.log('CLEARCH '+j+' of '+len+' term='+doc.term);
                        if (doc.term===term || j===len) {
                        	if (doc.term===term) {
								console.log('CLEARCH '+j+' of '+len+' FOUND ... items='+doc.items.length);
								items = doc.items;
								gotit = true;
                        	} else {
								console.log('CLEARCH '+j+' of '+len+' NOT FOUND');
                        	}
							response.status(200);
							response.setHeader('Content-Type', 'text/plain');
							response.write(JSON.stringify(items));
							response.end();
							return;
						}
						console.log('CLEARCH'+j+'  of '+len+' KEEP LOOKING');
					} else {
						console.log('CLEARCH'+j+'  of '+len+' ERROR='+err);
						response.status(500);
						response.end();
						return;
					}
				});
			}
		} else {
			console.log('CLEARCH LIST ERROR='+err);
			response.status(500);
			response.end();
			return;
		}
	});
});

function saveTweets(term, items) {
	var id = ''; // assign a new ID
	db.insert({
		term: term,
		items: items
	}, id, function(err, doc) {
		if (err) {
			console.log("#$#$#$#$ saveTweets error: "+err);
			//response.sendStatus(500);
		} else {
			console.log("#$#$#$#$ saveTweets success: "+doc);
			//response.sendStatus(200);
		}
        //response.end();
	});
}

http.createServer(app).listen(app.get('port'), '0.0.0.0', function() {
    console.log('Express server listening on port ' + app.get('port'));
});