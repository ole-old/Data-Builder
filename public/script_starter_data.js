var selectedResourceIdsFinal = [];
var wheel = null;
$(document).ready(function() {
	$('input[name="submitButton"]').removeAttr('disabled');
	$('input[name="submitSourceCouchAddr"]').removeAttr('disabled');
	// reset select source couch server dropdown
	$("#selectCouchSource").val("");
	// reset textbox holding selected source couch server's address
	$("#txtboxCouchServerSrc").val("");
	selectedResourceIdsFinal = []; // reinitialise array on window reload/refresh
});

function startActivityIndicator(jQueryPanelId) {
    $(jQueryPanelId).spin();

}

function stopActivityIndicator(jQueryPanelId) {
	$(jQueryPanelId).spin(false);
}

var socket = io.connect();
function addMessage(msg) {
	$("#socketRespFromServer").html('<div class="message">' + msg + '</div>');
}

socket.on('statusOnStarterDataPrep', function(statusMsg) {	
	if (statusMsg.err) {
		alert("Failed to prepare data out of chosen items. Plz try again");
	} else {
		// enable button and show status of starter-data-prep task
		alert("Successfully prepared data out of chosen items. \nPlease pick all contents inside the folder 'StarterDataLocation' of " + 
			"the Startup-Data-Builder and \nplace (choosing overwrite option if prompted) them inside the " + 
			"folder 'Starter_Data' of the Startup-Installation tool");			
	}
	var activityIndicatorPanelJqueryId = "#popup-spinning";
	stopActivityIndicator(activityIndicatorPanelJqueryId);
	$('input[name="submitButton"]').removeAttr('disabled');
	$('input[name="submitSourceCouchAddr"]').removeAttr('disabled');	
	selectedResourceIdsFinal = [];
});	

socket.on('resourcesDataForSelectedPage', function(resourcesForThePage) {
	if (resourcesForThePage.err) {
		alert("Failed to fetch records for the selected page. Plz try again");
	} else {
	 	var selectFromAllResourcesPanelId = "selectResources";
		showTheseResourcesOnThisPanel(resourcesForThePage, selectFromAllResourcesPanelId);		
	}
	var activityIndicatorPanelJqueryId = "#selectResources";
	stopActivityIndicator(activityIndicatorPanelJqueryId);
});

function showTheseCoursesOnTheSelectCoursesPanel(coursesFetched) {
	$("#selectCourses").html('');
	for(var i = 0; i < coursesFetched.length; i++) { 
    	var courseInfo = coursesFetched[i];
    	var checkbox = document.createElement('input');
		checkbox.type = "checkbox";
		checkbox.name = courseInfo.id;
		checkbox.id = courseInfo.id;
		checkbox.value = courseInfo.id;
		var label = document.createElement('label');
		label.htmlFor = "cbCourses";
		label.appendChild(document.createTextNode(courseInfo.name));
		var br = document.createElement('br');
		$("#selectCourses").append(checkbox); $("#selectCourses").append(label); $("#selectCourses").append(br);
 	}
}

function showSubColletions(subCollectionsFetched) {
    var collectionsList = document.createElement('ul');
    collectionsList.name = "subCollectionsList";
    collectionsList.id = "majorCollectionsList";
    for(var i = 0; i < subCollectionsFetched.length; i++) {
        var collectionInfo = subCollectionsFetched[i];
        if (true) { // if no existing ul has id === the parent collection, create a ul with the parent collection's id

        }
        var listItem = document.createElement('li');
        listItem.name = collectionInfo.id;
        listItem.id = collectionInfo.id;
        listItem.appendChild(document.createTextNode(collectionInfo.name));
        collectionsList.appendChild(listItem);
    }
    $("#selectCollections").append(collectionsList);
}

function showTheseCollectionsOnTheSelectCollectionsPanel(majorCollectionsFetched) {    
    $("#selectCollections").html('');
    var collectionsList = document.createElement('ul');
    collectionsList.name = "majorCollectionsList";
    collectionsList.id = "majorCollectionsList";
    majorCollectionsFetched.sort(function(obj1, obj2) {
		// ascending on the values of field 'name' (of type string)
		return obj2.name < obj1.name;
	});
    for(var i = 0; i < majorCollectionsFetched.length; i++) {
        var collectionInfo = majorCollectionsFetched[i];
        var listItem = document.createElement('li');
        listItem.name = collectionInfo.id;
        listItem.id = collectionInfo.id;
        var listItemAsLink = document.createElement('a');
        listItemAsLink.textContent = collectionInfo.name;
        listItemAsLink.setAttribute('href', collectionInfo.name);
        listItem.appendChild(listItemAsLink);
        collectionsList.appendChild(listItem);
        listItemAsLink.onclick = function(e){
		   e.preventDefault();
		};
        listItem.onclick = function(){
        	// alert($(this).context.id + ": " + $(this).text());
        	var collectionId = $(this).context.id;
        	var collectionName = $(this).context.textContent;
        	socket.emit('fetchResourcesForThisCollection', collectionId, collectionName);
			var activityIndicatorPanelJqueryId = "#selectCollectionMemberResources";
        	startActivityIndicator(activityIndicatorPanelJqueryId);
        };
    }
    $("#selectCollections").append(collectionsList);
}

function showTheseResourcesOnThisPanel(resourcesFetched, panelName) {
	var jQueryPanelId = "#" + panelName;
	$(jQueryPanelId).html('');
	for(var i = 0; i < resourcesFetched.length; i++) { 
    	var resourceInfo = resourcesFetched[i];
    	var checkbox = document.createElement('input');
		checkbox.type = "checkbox";
		checkbox.name = resourceInfo.id;
		checkbox.id = resourceInfo.id;
		checkbox.value = resourceInfo.id;
		if(selectedResourceIdsFinal.indexOf(resourceInfo.id) > -1) { // resource already checked by user
			checkbox.checked = true;
		}
		var label = document.createElement('label');
		label.id = "label" + resourceInfo.id;
		label.name = "label" + resourceInfo.id;
		label.htmlFor = "cbResources";
		label.appendChild(document.createTextNode(resourceInfo.name));
		var br = document.createElement('br');
		checkbox.onclick = function() {
			if($(this).is(':checked')) { // the click resulted in checking/ticking the checkbox
				// add id of this resource to the selectedResourceIdsFinal array
				var resourceId = $(this).val();
				$("#selectResources").find("#" + resourceId).prop('checked', true);
				$("#collectionMemberResourcesPanel").find("#" + resourceId).prop('checked', true);
				selectedResourceIdsFinal.push(resourceId);
			} else { // the click resulted in unchecking the checkbox
				// remove id of this resource from the selectedResourceIdsFinal array
				var resourceId = $(this).val();
				$("#collectionMemberResourcesPanel").find("#" + resourceId).prop('checked', false);
				$("#selectResources").find("#" + resourceId).prop('checked', false);
				var position = selectedResourceIdsFinal.indexOf(resourceId);
				if (position > -1) {
					selectedResourceIdsFinal.splice(position, 1);
				}
			}			
		}
		$(jQueryPanelId).append(checkbox); $(jQueryPanelId).append(label); $(jQueryPanelId).append(br);
 	}
}

socket.on('dataFromChosenBeLLCouch', function(data) {
	$('input[name="submitButton"]').removeAttr('disabled');
	$('input[name="submitSourceCouchAddr"]').removeAttr('disabled');
	var activityIndicatorPanelJqueryId = "#popup-spinning";
	stopActivityIndicator(activityIndicatorPanelJqueryId);
	if(data.err !== null) {
		alert("Failed to access data from the BeLL you identified. Plz recheck the address and try again");
	} else {
		// remove submit button so that it does not get added twice
		$("#submitButton").remove();
		$("#selectCoursesHead").text("All Courses");	
		$("#selectResourcesHead").text("All Resources");	
		$("#selectCollectionsHead").text("All Collections");
		$("#selectCollectionMemberResourcesHead").text("Contents Of Chosen Collection");	
		// append courses to courses panel/div #selectCourses
		showTheseCoursesOnTheSelectCoursesPanel(data.arrCourses);
	 	// append resources to resources panel/div #selectCourses
	 	var selectFromAllResourcesPanelId = "selectResources";
	 	showTheseResourcesOnThisPanel(data.arrResources, selectFromAllResourcesPanelId);
        // append collections to collections panel/div #selectCollections
        showTheseCollectionsOnTheSelectCollectionsPanel(data.arrMajorCollections);
        // showSubColletions(data.arrSubCollections);
	 	// if allResourcesCount > resourcesFetched.length, then add another div for pagination
        var paginationThresholdCount = 15;
	 	if (data.resourcesCount > data.arrResources.length) {
	 		// alert("heeyyy");
	 		var itemsPerPage = data.arrResources.length;
	 		var pagesCount = Math.ceil(data.resourcesCount/itemsPerPage);
	 		console.log("ceil pages: " + (data.resourcesCount/itemsPerPage));
	 		$("#paginator").paginate({
	 			count: pagesCount, start: 1, display: 7, border: true, border_color: '#fff',
				text_color: '#fff', background_color: 'black', border_hover_color: '#ccc',
				text_hover_color: '#000', background_hover_color: '#fff',  images: false, mouse: 'press',
				onChange: function (page) {
					socket.emit('fetchResourcesForIthPage', page);	
					var activityIndicatorPanelJqueryId = "#selectResources";
			    	startActivityIndicator(activityIndicatorPanelJqueryId);
				}
			});
	 	}
	 	// append the form submit equivalent button (not exactly a form submit button but just a button to act like that)
	 	var button = document.createElement("input");
	    button.type = "button";
	    button.value = "Prepare Starter Data"; 
	    button.name = "submitButton"; 
	    button.id = "submitButton";  
	    button.onclick = function() { // Note this is a function
	        prepareStarterData(this);
	    };
	    $("#submitPanel").append("<br>"); 
	    $("#submitPanel").append(button); 
	}
});	

socket.on('resourcesDataForChosenCollection', function(collectionData) {
	if(collectionData.err !== null && collectionData.err !== undefined) {
		alert("Failed to fetch resources-data for the chosen collection. Plz try again");
	} else {		
		var activityIndicatorPanelJqueryId = "#selectCollectionMemberResources";
    	stopActivityIndicator(activityIndicatorPanelJqueryId);
		$("#selectCollectionMemberResourcesHead").text("Contents Of Collection: " + collectionData.collectionName);	
		// display the select-all checkbox if the data fetched for chosen collection has atleast one record in it
		if(collectionData.data.length > 0) {
			var checkbox = document.createElement('input');
			checkbox.type = "checkbox";
			checkbox.name = "checkAllContentsOfCollection";
			checkbox.id = "checkAllContentsOfCollection";
			checkbox.value = "checkAllContentsOfCollection";
			var label = document.createElement('label');
			label.htmlFor = "checkAllContentsOfCollection";
			label.style.fontWeight = 'bold';
			label.appendChild(document.createTextNode("Select all"));
			var br = document.createElement('br');
			checkbox.onclick = function() {
				if($(this).is(':checked')) { // the click resulted in checking/ticking the checkbox
					// check all contents of this collection and also push their ids into the array selectedResourceIdsFinal
					var resourceId;
					for (var i = collectionData.data.length - 1; i >= 0; i--) {
						resourceId = collectionData.data[i].id;
						// $("#" + resourceId).prop('checked', true);
						if(selectedResourceIdsFinal.indexOf(resourceId) == -1) {// if resource is already NOT in the 'selectedResourceIdsFinal' array 
							// then put it in
							selectedResourceIdsFinal.push(resourceId);
						}	
						$("#selectResources").find("#" + resourceId).prop('checked', true);
						$("#collectionMemberResourcesPanel").find("#" + resourceId).prop('checked', true);											
					};
				} else { // the click resulted in unchecking this checkbox
					// alert("UNchecked: " + $(this).val());
					// remove id of this resource from the selectedResourceIdsFinal array
					var position, resourceId;
					for (var i = collectionData.data.length - 1; i >= 0; i--) {
						resourceId = collectionData.data[i].id;
						$("#" + resourceId).prop('checked', false);
						// uncheck this resource in the 'all resources panel' if it is among those currently opened in that panel
						$("#selectResources").find("#" + resourceId).prop('checked', false);
						$("#collectionMemberResourcesPanel").find("#" + resourceId).prop('checked', false);
						position = selectedResourceIdsFinal.indexOf(resourceId);
						if (position > -1) {
							selectedResourceIdsFinal.splice(position, 1);
						}
					};
				}
			}
			$("#contentsOfCollection").html(''); $("#contentsOfCollection").append(checkbox); $("#contentsOfCollection").append(label);
			$("#contentsOfCollection").append(br);
		}
		var panelToShowFetchedResourcesOn = "selectCollectionMemberResources";
		showTheseResourcesOnThisPanel(collectionData.data, panelToShowFetchedResourcesOn);
	}
});	

function prepareStarterData(event) {
	// turn on spinner
	var activityIndicatorPanelJqueryId = "#popup-spinning";
	startActivityIndicator(activityIndicatorPanelJqueryId);
	// make the button disabled and reset the status of starter data prep task and preferably show a spinner too
	$('input[name="submitButton"]').attr('disabled','disabled');
	$('input[name="submitSourceCouchAddr"]').attr('disabled','disabled');
	$("#socketRespFromServer").html('');
	var ids = [], resourceIds = [];
	$('#selectCourses input:checked').each(function() {
	    ids.push($(this).val());
	});
	// $('#selectResources input:checked').each(function() {
	//     resourceIds.push($(this).val());
	// });
	if ( (ids.length === 0) && (selectedResourceIdsFinal.length === 0) ) {
		alert("You did not choose any items");
	} else {		
		var selectedCoursesAndResources = {courseIds: ids, resourceIds: selectedResourceIdsFinal};
		socket.emit('includeCoursesInStarterData', selectedCoursesAndResources);
	}
}

function testing(event) {
	var data;
	socket.emit('testing', data);
}

function viewDataFromSelBeLL(event) { // button's id = name = submitSourceCouchAddr
	var bellCouchServerData = {sourceCouchAddr: $("#txtboxCouchServerSrc").val()};
	socket.emit('fetchDataFromIdentifiedBeLLCouchServer', bellCouchServerData);
	$('input[name="submitButton"]').attr('disabled','disabled');
	$('input[name="submitSourceCouchAddr"]').attr('disabled','disabled');
	var activityIndicatorPanelJqueryId = "#popup-spinning";
	startActivityIndicator(activityIndicatorPanelJqueryId);
}

$('#selectCouchSource').on('change', function() {
	var selectedOptionVal = $(this).val();
  $("#txtboxCouchServerSrc").val(selectedOptionVal);
});