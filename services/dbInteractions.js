module.exports = function (localCouchServer, sourceCouchServer) {
  var async = require('async');
  var couchDb = require('nano')(localCouchServer);
  var sourceCouchDb = require('nano')(sourceCouchServer);
  var fs = require('fs');
  var mv = require('mv');
  var rimraf = require('rimraf');

  var sourceFolder =  "C:\\Program Files (x86)\\Apache Software Foundation\\CouchDB\\var\\lib\\couchdb\\";
  var destFolder = "StarterDataLocation";

  var starterDataDbs = ['startercollectionlist', 'starterresources', 'startergroups', 'startercoursestep'];
  var existingDbs = ['collectionlist', 'resources', 'groups', 'coursestep'];

  var functions = {};

  functions.setSourceCouchServerAddress = function(newAddr) {
    sourceCouchServer = newAddr;
    sourceCouchDb = require('nano')(sourceCouchServer);
  };

  functions.deleteDbs = function(callback) {
    // console.log(starterDataDbs);
    // for (var i = starterDataDbs.length - 1; i >= 0; i--) {
    //   couchDb.db.destroy(starterDataDbs[i], function(err, resp) {
    //     if (err) {
    //       if (err.error === "not_found"){
    //         callback();
    //       } else {
    //         callback(err);
    //       }
    //     } else {
    //       console.log('deleted ' + starterDataDbs[i]);
    //       if (i === 0) {
    //         callback();
    //       }
    //     }
    //   });
    // };
    couchDb.db.destroy('startercollectionlist', function(err, resp) {
      if ( (err) && (err.error !== 'not_found') ) {
        callback(err);
      } else {
        console.log('deleted startercollectionlist');
        couchDb.db.destroy('starterresources', function(err, resp) {
          if ( (err) && (err.error !== 'not_found') ) {
            callback(err);
          } else {
            console.log('deleted starterresources');
            couchDb.db.destroy('startergroups', function(err, resp) {
              if ( (err) && (err.error !== 'not_found') ) {
                callback(err);
              } else {
                console.log('deleted startergroups');
                couchDb.db.destroy('startercoursestep', function(err, resp) {
                  if ( (err) && (err.error !== 'not_found') ) {
                    callback(err);
                  } else {
                    console.log('deleted startercoursestep');
                    callback();
                  }
                });
              }
            });
          }
        });
      }
    });
  };

  functions.createDbs = function(callback) {
    couchDb.db.create('startercollectionlist', function(err, resp) {
      if ( (err) && (err.error !== 'file_exists') ) {
        callback(err);
      } else {
        console.log('created startercollectionlist');
        couchDb.db.create('starterresources', function(err, resp) {
          if ( (err) && (err.error !== 'file_exists') ) {
            callback(err);
          } else {
            console.log('created starterresources');
            couchDb.db.create('startergroups', function(err, resp) {
              if ( (err) && (err.error !== 'file_exists') ) {
                callback(err);
              } else {
                console.log('created startergroups');
                couchDb.db.create('startercoursestep', function(err, resp) {
                  if ( (err) && (err.error !== 'file_exists') ) {
                    callback(err);
                  } else {
                    console.log('created startercoursestep');
                    callback();
                  }
                });
              }
            });
          }
        });
      }
    });
  };

  functions.prepareResourcesDataForInstaller = function(selectedCoursesAndResources, callback) {
    // fetch all resources referenced by the course-step and call prepareTagsDataForResource on each resource
    var resourcesDb = sourceCouchDb.db.use('resources');
    var starterResourcesDb = couchDb.db.use('starterresources');
    var resourceIds = selectedCoursesAndResources.resourceIds;
    couchDb.db.replicate(resourcesDb, starterResourcesDb, { doc_ids: resourceIds }, function(err, body) {
        if (!err){
          // console.log("replicated successfully");
          // console.log(body);  console.log("<----------------------------->");
          // prepare tags data for resources
          console.log("resources added to installer data for following resIds: \n" + resourceIds);
//          functions.prepareTagsDataForResource(callback);
          callback();
        } else {
          callback(err);
        }
    });
  };

  functions.prepareCollectionsDataForInstaller = function(collectionIds, callback) {
    var tagsDb = sourceCouchDb.db.use('collectionlist');
    var starterTagsDb = couchDb.db.use('startercollectionlist');
    // var referencedTagDocKeys = courseStepDoc.Tag;
    // console.log(referencedTagDocKeys);
    couchDb.db.replicate(tagsDb, starterTagsDb, { doc_ids: collectionIds }, function(err, body) {
      if (!err) {
          console.log("collections added to installer data for following collectionlistIds: \n" + collectionIds);
          callback();
      } else {
          console.log("dbInteractions.js:: prepareCollectionsDataForInstaller:: error in replicating db " + 'collectionlist');
          console.log(err);
          callback(err);
      }
    });
  };

  functions.prepareTagsDataForResource = function(callback) {
    var tagsDb = sourceCouchDb.db.use('collectionlist');
    var starterTagsDb = couchDb.db.use('startercollectionlist');
    // var referencedTagDocKeys = courseStepDoc.Tag;
    // console.log(referencedTagDocKeys);
    couchDb.db.replicate(tagsDb, starterTagsDb, { }, function(err, body) {      
        if (!err) {
          callback();
        } else {
          console.log("dbInteractions.js:: prepareTagsDataForResource:: error in replicating db " + 'collectionlist');
          console.log(err);  //console.log("<----------------------------->");
          callback(err);
        }
      });
  };

  functions.prepareResourcesDataForCourseStep = function(courseStepDoc, callback) {
    // fetch all resources referenced by the course-step and call prepareTagsDataForResource on each resource
    var resourcesDb = sourceCouchDb.db.use('resources');
    var starterResourcesDb = couchDb.db.use('starterresources');
    var referencedResourceKeys = courseStepDoc.resourceId;
    couchDb.db.replicate(resourcesDb, starterResourcesDb, { doc_ids: referencedResourceKeys }, function(err, body) {
        if (!err){
          // console.log("replicated successfully");
          // console.log(body);  console.log("<----------------------------->");
          // prepare tags data for resources
          console.log("resources for the course-step '" + courseStepDoc.title + "' added to installer data");
//          functions.prepareTagsDataForResource(callback);
          callback();
        } else {
          callback(err);
        }
    });
  };

  functions.prepareCourseStepsDataForCourse = function(courseId, dadyCallback) {
    var courseStepsDb = sourceCouchDb.db.use('coursestep');
    var starterCourseStepsDb = couchDb.db.use('startercoursestep');
    var courseStepIdsForTheCourse = [];
    courseStepsDb.view('bell', 'StepsData',{key: courseId, include_docs: true}, function(err, respBody) {
      if (err) {         
        dadyCallback(err);
      } else {
        // console.log("reached courseSteps tak...");
        async.eachSeries(respBody.rows, function (courseStepDocContainer, sonCallback) {
          // prepare resources data for each course step
          var courseStepDoc = courseStepDocContainer.doc;
          courseStepTitle = courseStepDoc.title;
          courseStepIdsForTheCourse.push(courseStepDoc._id);
          // console.log("course step id: " + courseStepDocContainer.doc._id);
          functions.prepareResourcesDataForCourseStep(courseStepDoc, sonCallback);
          // console.log("course step title: " + courseStepDocContainer.doc.title);
        }, function (err, result) {
          if (err) {
            dadyCallback(err);
          } else {
            // replicate all course-steps that point to this course
            couchDb.db.replicate(courseStepsDb, starterCourseStepsDb, {doc_ids: courseStepIdsForTheCourse }, function(err, body) {      
              if (!err) {
                console.log("course-steps for the course added to installer data");
                dadyCallback();
              } else {
                console.log("dbInteractions.js:: prepareCourseStepsDataForCourse:: error in replicating db " + 'coursestep');
                console.log(err);  //console.log("<----------------------------->");
                dadyCallback(err);
              }
            });
          }
        });
      }
    });
  };

  functions.insertCourseDocInStarterCoursesDb = function(courseDoc, callback) {
    var coursesDb = couchDb.db.use('groups');
    var starterCoursesDb = couchDb.db.use('startergroups');
    starterCoursesDb.insert(courseDoc, courseDoc._id, function(err, body) {
      if (err){
        console.log("dbInteractions.js:: prepareDataForCourses:: error in inserting doc in db " + 'startergroups');
        console.log(err);  console.log("<----------------------------->");
        callback(err);
      } else {
        // console.log("------------body-------------");
        // console.log(body); console.log("<----------------------------->");
        // callback();
        setTimeout(function () {
          callback();
        }, 5000);
      }
    });
  };

  functions.prepareDataForCourses = function(courseIds, dadyCallback) {
    var coursesDb = sourceCouchDb.db.use('groups');
    async.eachSeries(courseIds, function (courseId, sonCallback) {
      coursesDb.get(courseId, function(err, courseDoc) {
        if (err) {
          console.log("dbInteractions.js:: prepareStarterData:: error in fetching course with id: " + courseId);
          console.log(err);        
        } else { // fetch/prepare course-steps data for/referenced by this course
          async.waterfall([
            function(grandSonCallback) {
              console.log("course title: " + courseDoc.CourseTitle);
              functions.prepareCourseStepsDataForCourse(courseId, grandSonCallback);
            },
            function(grandSonCallback) {
              // make the changes required, like erasing member data etc from the course doc
              while(courseDoc.members.length > 0) {
                  courseDoc.members.pop();
              }
              courseDoc.courseLeader = ""; courseDoc.memberLimit = ""; courseDoc.startDate = "";
              courseDoc.endDate = ""; courseDoc.startTime = ""; courseDoc.endTime = ""; courseDoc.location = "";
              delete courseDoc._rev;
              // console.log("courseId: " + courseDoc._id);
              // console.log(courseDoc);
              // now save it in startergroups db which is for the installer
              functions.insertCourseDocInStarterCoursesDb(courseDoc, grandSonCallback);
            }
          ], function (err, result) {
            if (err) {
              sonCallback(err);
            } else {
              console.log("course titled '" + courseDoc.CourseTitle + "' added to installer data");
              sonCallback();
            }
          });          
        }
      });
    }, function (err) {
        if (err) {
          dadyCallback(err);
        } else {
          dadyCallback();
        }
    });
  };

  functions.moveStarterDataFilesToDesiredLocation = function(outercallback) {    
    var i = 0;      
    async.eachSeries(starterDataDbs, function (courseStepDocContainer, callback) {  
      var sourceFilePath = sourceFolder + starterDataDbs[i] + ".couch";
      var destFilePath =  destFolder + "/" + existingDbs[i] + ".couch";
      mv(sourceFilePath, destFilePath, {mkdirp: true}, function(err) {
        // done. it tried fs.rename first, and then falls back to piping the source file to the dest file and 
        // then unlinking the source file.
        if (err) {
          // console.log("dbInteractions.js:: moveStarterDataFilesToDesiredLocation:: error in moving db files");
          // console.log(err);  console.log("<----------------------------->");
          callback(err);
        } else {
          i++;
          callback();
        }
      });
    }, function (err, result) {
      if (err) {
        outercallback(err);
      } else {
        console.log("starter data files moved to specified folder");
        outercallback();
      } 
    });
  };

  functions.deleteDestinationFolder = function(callback) {
    rimraf(destFolder, function(err) { // remove dest folder now
      if (err) { 
        callback(err);
      } else {
        callback();
      }
    });
  };

  functions.prepareCoursesDataForInstaller = function(selectedCoursesAndResources, dadyCallback) {
    async.waterfall([
      function(callback) {
        // iterate over courseIds of selected courses and prepare data for each course
        var courseIds = selectedCoursesAndResources.courseIds;
        // console.log(courseIds);
        functions.prepareDataForCourses(courseIds, callback);        
      }
    ], function (err, result) {
      if (err) {
        dadyCallback(err);
      } else {
        // move all db files holding starter/installer data to an appropriate location
        // functions.moveStarterDataFilesToDesiredLocation(dadyCallback);
        dadyCallback();
      }
    });    
  };

  functions.fetchCourseDocWithName = function(courseTitle, callback) {
    var coursesDb = sourceCouchDb.db.use('groups');
    coursesDb.view('bell', 'sortedByTitle', {include_docs: true, key: courseTitle}, function(err, allDocsInfo) {
        if (err) {
            console.log("dbInteractions.js:: error executing view 'courseSearch' of db: " + 'groups'); console.log(err);
            callback(err);
        } else {
            var arrCourses = [];
            var courseIdAndTitle;
            allDocsInfo.rows.forEach( function(courseDocContainer) {
                if (courseDocContainer.doc.hasOwnProperty('views') === false) { // if the fetched doc is not a design doc
                    courseIdAndTitle = {id: courseDocContainer.doc._id, name: courseDocContainer.doc.CourseTitle};
                    arrCourses.push(courseIdAndTitle);
                }
            });
            console.log("fetched courses with name(=" + courseTitle + "): " + arrCourses.length + " docs");
            callback(null, arrCourses);
        }
    });
  };

  functions.fetchAllCourseDocs = function(callback) {
    var coursesDb = sourceCouchDb.db.use('groups');
    coursesDb.view('bell', 'sortedByTitle', {include_docs: true}, function(err, allDocsInfo) {
      if (err) {
         console.log("error fetching docs of db: " + 'groups'); console.log(err);
         callback(err);
      } else {
        var arrCourses = []; 
        var courseIdAndTitle;
        allDocsInfo.rows.forEach( function(courseDocContainer) {
          // console.log(courseDocContainer);
          // console.log(courseDocContainer.key + "\t" + courseDocContainer.value + "\t" + courseDocContainer.doc.CourseTitle);       
          if (courseDocContainer.doc.hasOwnProperty('views') === false) { // if the fetched doc is not a design doc
            courseIdAndTitle = {id: courseDocContainer.doc._id, name: courseDocContainer.doc.CourseTitle};
            arrCourses.push(courseIdAndTitle);
          }          
        });
        console.log("fetched courses count: " + arrCourses.length);
        callback(null, arrCourses);
      }
    });
  };

  functions.getResourcesCountFromSourceCouch = function (callback) {
    var resourcesDb = sourceCouchDb.db.use('resources');
    resourcesDb.view('bell', 'count', {}, function(err, respBody) {
      if (err) {
        callback(err);
      } else {
        var response = respBody.rows[0];
        console.log("Resources count: ");
        console.log(response.value);
        callback(null, response.value);       
      }
    });
  };

  functions.fetchResourceDocsWithoutAttachmentsForSelectedPage = function(pageNumber, callback) {
    var resourcesDb = sourceCouchDb.db.use('resources');
    var limit = 15;
    var recordsToSkip = (pageNumber-1)*limit; // page#1 should skip (1-1)*20 records
    resourcesDb.view('bell', 'sortresources',{include_docs: true, limit: limit, skip: recordsToSkip}, function(err, allDocsInfo) {
      if (err) {
         console.log("error fetching docs of db: " + 'resources'); console.log(err);
         callback(err);
      } else {
        var arrResources = [];
        var resourceIdAndTitle;
        allDocsInfo.rows.forEach( function(resourceDocContainer) {
          // console.log(courseDocContainer);
          // console.log(courseDocContainer.key + "\t" + courseDocContainer.value + "\t" + courseDocContainer.doc.CourseTitle);
          if (resourceDocContainer.doc.hasOwnProperty('views') === false) { // if the fetched doc is not a design doc
            resourceIdAndTitle = {id: resourceDocContainer.doc._id, name: resourceDocContainer.doc.title};
            arrResources.push(resourceIdAndTitle);
          }          
        });
        console.log("fetched resources count: " + arrResources.length)
        callback(null, arrResources);
      }
    });
  };

  functions.fetchCollectionsForSelectedPage = function(pageNumber, callback) {
      var collectionListDb = sourceCouchDb.db.use('collectionlist');
      var arrCollections = [];
      var collectionListDoc, collectionIdAndName;
      var arrSubCollections = [];
      var subCollectionDoc, subCollectionIdAndName;
      var limit = 15;
      var recordsToSkip = (pageNumber-1)*limit; // page#1 should skip (1-1)*20 records
      // fetch all major-collections too
      collectionListDb.view('bell', 'majorcatagory',{include_docs: true}, function(err, respBody) {
          if (err) {
              callback(err);
          } else {
            for(var i = 0; i < respBody.rows.length; i++) {
                collectionListDoc = (respBody.rows[i]).doc;
                collectionIdAndName = {id: collectionListDoc._id, name: collectionListDoc.CollectionName};
                arrCollections.push(collectionIdAndName);
            }
            // fetch all subcollections too. these do not show on the UI, haven't been integrated properly at the frontend yet (6/Nov/2014)
            collectionListDb.view('bell', 'subcategory',{include_docs: true}, function(err, resp) {
              for(var i = 0; i < resp.rows.length; i++) {
                subCollectionDoc = (resp.rows[i]).doc;
                subCollectionIdAndName = {id: subCollectionDoc._id, name: subCollectionDoc.CollectionName};
                arrSubCollections.push(subCollectionIdAndName);
              }              
            });
            console.log("fetched major-collections count: " + respBody.rows.length);
            var collectionsFetched = {majorCollectionIdsAndNames: arrCollections, subCollectionIdsAndNames: arrSubCollections};
            callback(null, collectionsFetched);
          }
      });
  };

  functions.fetchWelcomeVideoResource = function(callback) {
      var resourcesDb = sourceCouchDb.db.use('resources');
      resourcesDb.view('bell', 'welcomeVideo', {include_docs: true}, function(err, resp) {
          if (err && err.reason !== 'missing_named_view') {
              console.log("dbInteractions.js:: fetchWelcomeVideoResource:: error fetching docs of db: " + 'resources'); console.log(err);
              callback(err);
          } else if (err && err.reason === 'missing_named_view') {
              // return empty resources array
              var arrResources = [];
              callback(null, arrResources);
          } else {
              var arrResources = [];
              var resourceIdAndTitle;
              console.log("fetched welcome video resource: (" + resp.rows.length + " doc)");
              resp.rows.forEach( function(resourceDocContainer) {
                  resourceIdAndTitle = {id: resourceDocContainer.doc._id, name: resourceDocContainer.doc.title};
                  arrResources.push(resourceIdAndTitle);
              });
              callback(null, arrResources);
          }
      });
  };

  functions.fetchResourcesPointingToThisCollection = function(collectionId, collectionName, callback) {
    var resourcesDb = sourceCouchDb.db.use('resources');
    var resourcesViewkeys = [collectionId];
    resourcesDb.view('bell', 'listCollection',{keys: resourcesViewkeys, include_docs: true}, function(err, resp) {
      if (err) {
         console.log("dbInteractions.js:: fetchResourcesPointingToThisCollection:: error fetching docs of db: " + 'resources'); console.log(err);
         callback(err);
      } else {
        var arrResources = [];
        var resourceIdAndTitle;
        console.log("fetched resources count for collection: " + collectionName + " (" + collectionId + "): " + resp.rows.length);
        resp.rows.forEach( function(resourceDocContainer) {
          resourceIdAndTitle = {id: resourceDocContainer.doc._id, name: resourceDocContainer.doc.title};
          arrResources.push(resourceIdAndTitle);
        });        
        callback(null, arrResources);
      }
    });
  };

  // this method has not been used yet. it was just copied from another file to check if things were working  or not in the beginning
  functions.writeToFile = function(fileNamePostfix, data, successMsg, callback) {
    var filename = "./" + "design_docs" + "/" + "design_doc_" + fileNamePostfix + ".txt";
    fs.open(filename, 'a', 0666, function(err, fd){
        fs.write(fd, data, null, undefined, function (err, written) {
            if(!err){
              console.log(successMsg);
              callback();
            } else {
              console.log("error writing about the resource in " + fileName + " file");
              callback(err);
            }
        });
    });
  };
  return functions;
}