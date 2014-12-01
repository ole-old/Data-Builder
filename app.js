var express = require('express');
var app = express();
var fs = require('fs');
var bodyParser = require('body-parser');
var waterfall = require('async-waterfall');
var async = require('async');
var socket = require('socket.io');
var socketEmitter;

var sourceCouchServer = 'http://127.0.0.1:5984';//'http://openbell.ole.org:5984';
var localCouchServer = 'http://127.0.0.1:5984';
var dao = require('./services/dbInteractions')(localCouchServer, sourceCouchServer);

// configuring express to use html as the view engine, its default view engine is jade (courtesy saurabh sharma: 
// http://www.makebetterthings.com/node-js/how-to-use-html-with-express-node-js. btw, what is ejs??
app.engine('html', require('ejs').renderFile); 
app.set('view engine', 'html');

app.use(bodyParser.urlencoded({ extended: false })); // omitting the "{ extended: false }" parameter here results in the 
// warning "body-parser deprecated undefined extended: provide extended option" on executing the 'node app.js' command
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public')); // _dirname = name/path of current directory. this command
// configures express to look for static content like images linked in html pages, js files, etc. in public folder.


app.get('/replication-form', function(req, res){
	var databases = require('./public/databases.js');
	
	var form_help_data = {};
	form_help_data.dbs = databases;
	form_help_data.title = "Replication Form";
  	res.render('simple_finished', {help: form_help_data}); // _dirname = name/path of current directory
});
// app.post('/replication-action', replicator.install_BellApp)
app.get('/prepare-starter-data', function(req, res) {
	var jsonForSelectingDataFromUI = null;//{arrCourses: null, arrResouces: null, heading: null};
	res.render('starter_data', {jsonForSelectingDataFromUI: jsonForSelectingDataFromUI});	
});

// app.get('/replication-erase', function(req, res){
// 	var replicator = require('./replicator')(couchSource, couchTarget, databases);
// 	replicator.deleteDatabases(res);
// });

var server = app.listen(3000, function() {
    console.log('Listening on port %d', server.address().port);
});
var io = socket.listen(server);

io.sockets.on('connection', function (socketInst) {
	socketEmitter = socketInst;

	socketInst.on('testing', function (data) {  
		waterfall([
			function(callback){
				dao.deleteDestinationFolder(callback);
			},
			function(callback){
				dao.moveStarterDataFilesToDesiredLocation(callback);
			}
		], function (err, result) {
			if (err) {
				console.log("app.js:: socketInst.on('testing')");
				console.log(err);
			} else {
				console.log("files shifted.. plz confirm!");
			}
		});
	}); 

	socketInst.on('fetchResourcesForThisCollection', function(collectionId, collectionName) {
		waterfall([
			function(callback){
				dao.fetchResourcesPointingToThisCollection(collectionId, collectionName, callback);
			}
		], function (err, result) {
			var dataForChosenCollection = {err: null, data: null, collectionName: collectionName};
			if (err) {
				// emit error
				var dataForChosenCollection = {err: err};
				socketInst.emit('resourcesDataForChosenCollection', dataForChosenCollection);
			} else {
				// emit resources data for this page = pageNumber
				dataForChosenCollection.data = result;
                dataForChosenCollection.selectedCollection = {id: collectionId, name: collectionName};
				socketInst.emit('resourcesDataForChosenCollection', dataForChosenCollection);
			}
		});
	});

	socketInst.on('fetchResourcesForIthPage', function(pageNumber) {
		waterfall([
			function(callback){
				dao.fetchResourceDocsWithoutAttachmentsForSelectedPage(pageNumber, callback);
			}
		], function (err, result) {
			var dataForSelPage = {err: null, data: null};
			if (err) {
				// emit error
				dataForSelPage.err = err;
				socketInst.emit('resourcesDataForSelectedPage', dataForSelPage);
			} else {
				// emit resources data for this page = pageNumber
				dataForSelPage.data = result;
				socketInst.emit('resourcesDataForSelectedPage', dataForSelPage.data);
			}
		});
	});

	socketInst.on('fetchDataFromIdentifiedBeLLCouchServer', function(serverData) {
		var dataFromBeLL = {arrCourses: null, arrResouces: null, arrMajorCollections: null, arrSubCollections: null,
                            heading: null, resourcesCount: null, preSelectedResources: null, preSelectedResourcesCount: 0,
                            preSelectedCollection: null, err: null};
		// set source couchdb address according to user's choice before fetching data
		dao.setSourceCouchServerAddress(serverData.sourceCouchAddr); 
		// fetch all courses and resources data and then pass them to the view "starter_data.html"	
		async.waterfall([
			function(callback){
				dao.fetchAllCourseDocs(callback);
			},
			function(result, callback){
                dataFromBeLL.arrCourses = result;
				var pageNumber = 1;
				dao.fetchResourceDocsWithoutAttachmentsForSelectedPage(pageNumber, callback);
			},
            function(result, callback) {
                dataFromBeLL.arrResources = result;
                var pageNumber = 1;
                dao.fetchCollectionsForSelectedPage(pageNumber, callback);
            },
			function(result, callback) {
                dataFromBeLL.arrMajorCollections = result.majorCollectionIdsAndNames;
                dataFromBeLL.arrSubCollections = result.subCollectionIdsAndNames;
				dao.getResourcesCountFromSourceCouch(callback);
			},
            function(result, callback) {
                dataFromBeLL.preSelectedResources = []; // so that it can never be null
                dataFromBeLL.resourcesCount = result;
                var collectionName = "*BeLL User Guide*";
                var collectionId; // its value is 'undefined' after declaration
                if (dataFromBeLL.arrMajorCollections !== null && dataFromBeLL.arrMajorCollections.length > 0) {
                    var size = dataFromBeLL.arrMajorCollections.length;
                    for (var i = 0; i < size; i++) {
                        if (dataFromBeLL.arrMajorCollections[i].name === collectionName) {
                            // pick the index and fetch ids of all resources in this collection
                            collectionId = dataFromBeLL.arrMajorCollections[i].id;
                            dataFromBeLL.preSelectedCollection = {id: collectionId, name: collectionName};
                            break;
                        }
                    }
                    if (collectionId) { // if its not undefined, fetch the constituent resources of collection
                        dao.fetchResourcesPointingToThisCollection(collectionId, collectionName, callback);
                    } else {
                        console.log("source system has no collection with name: " + collectionName);
                        callback();
                    }
                } else {
                    console.log("source system has no collections in it");
                    callback();
                }
            },
            function(result, callback) {
                dataFromBeLL.preSelectedResources = result;
                dataFromBeLL.preSelectedResourcesCount = result.length;
                // get the welcome video resource now and add that to preSelectedResources
                dao.fetchWelcomeVideoResource(callback);
            }
		], function (err, result) {
			if (err) {
				console.log("app.js:: error in final callback of fetching all courses");
				dataFromBeLL.err = err;
				socketInst.emit('dataFromChosenBeLLCouch', dataFromBeLL);
			} else {
				// result[0] has the output from first function in the series block, result[1] has output from second func in the block
                if (result !== null && result.length > 0) {
                    var welcomeVideoResource = result[0];
                    dataFromBeLL.preSelectedResources.push(welcomeVideoResource); // last item in preSelectedResources array is welcome video
                } else {
                    console.log("welcome video resource does not exist on source");
                }
				dataFromBeLL.heading = 'Installer Data Selection Form';
				socketInst.emit('dataFromChosenBeLLCouch', dataFromBeLL);
			}
		});
	});

	socketInst.on('includeCoursesInStarterData', function (selectedCoursesAndResources) {  
		waterfall([
			function(callback) {
				// delete output folder at start just to prevent any preexisting data/files in it to interfere with next output
				dao.deleteDestinationFolder(callback);
			},
			function(callback) {
				// delete output dbs from couchdb at start in case any dbs with names similar to those of dbs in output already exist
				dao.deleteDbs(callback);
			},
			function(callback) {
				// create dbs to prepare data
				dao.createDbs(callback);
			},
            function(callback){
                dao.prepareCollectionsDataForInstaller(selectedCoursesAndResources.collectionIds, callback);
            },
			function(callback){
				dao.prepareResourcesDataForInstaller(selectedCoursesAndResources, callback);
			},
			function(callback){
				dao.prepareCoursesDataForInstaller(selectedCoursesAndResources, callback);
			},
			function(callback) {
				dao.moveStarterDataFilesToDesiredLocation(callback);
			}
		], function (err, result) {
			if (err) {
				console.log("app.js:: socketInst.on('includeCoursesInStarterData')");
				console.log(err);
				var status = {err: err};
			  	socketInst.emit('statusOnStarterDataPrep', status);
			} else {
				var status = {msg: "<h2>Success in preparing starter data for selected courses...!!!</h2>"};
			  	socketInst.emit('statusOnStarterDataPrep', status);
			}
		});
	}); 
    socketInst.on('emitkarbhai', function (data) {      
    	var couchSource = data.sourceserver;
		var couchTarget = data.targetserver;
		var replmode=data.replmode;
		var includeresources=data.includeresources;
		var databases = require('./public/databases.js');
		var replicateResourcesFully = false;

		if (includeresources == 'on') { // then resources db should be fully replicated
			replicateResourcesFully = true;
		}
		var replicator = require('./replicator')(couchSource, couchTarget, databases, replicateResourcesFully);
		if (replmode === "fromscratch") {
			waterfall([
				function(callback){
					replicator.deleteDatabases(callback);
				},
				function(callback){
					replicator.install_BellApp(socketInst,callback);
				}
			], function (err, result) {
			  if (!err) {
			  	console.log("From-Scratch-Replication is complete now.");
			  	console.log(err);
			  	socketInst.emit('message',"<h2>Replication was successful!!!</h2>");
			  } else {
			  	console.log("From-Scratch-Replication aborted with error.");
			  	console.log(err);
			  	socketInst.emit('message',"<h2>Replication failed. Please try again </h2>");
			  }
			});
		} else if (replmode === "incremental") {
			waterfall([
				function(callback){
					replicator.install_BellApp(socketInst,callback);
				}
			], function (err, result) {
			  if (!err) {
			  	console.log("Incremental-Replication is complete now.");
			  	console.log(err);
			  	socketInst.emit('message', "<h2>Replication was successful!!!</h2>");
			  } else {
			  	console.log("Incremental-Replication aborted with error.");
			  	console.log(err);
			  	socketInst.emit('message', "<h2>Replication failed. Please try again.</h2>");
			  }
			});
		}
    });
});