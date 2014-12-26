With this app, starter data for a BeLL installer can be built. For a step by step user guide, read on.
------------------------------------------------------------------------------------------------------

Prereqs
-------
Node.js and CouchDB must be installed on the system before running Data-Builder
To download the Data Builder completely, use the following git command: 
    git clone --recursive -b <branchname(options: dev, master)> https://github.com/open-learning-exchange/Data-Builder.git


How to use Installer/Starter Data Builder App
---------------------------------------------
1)	Open/run the file "launch-app.bat". It will start the app server and open the following page in firefox browser:
    http://localhost:3000/prepare-starter-data
2)	Choose/specify a BeLL server by selecting one of the options from the "Options" dropdown or by typing in the
    address of the server yourself. Then click the button named "View".
3)	After a short wait, symbolised by a spinner below the options dropdown, the page will be populated with courses,
    resources, and collections data from the identified BeLL server.
4)	You can select  those courses and resources that you wish to include (as starter data) in the BeLL installer by
    checking their respective checkboxes. Click on a collection name from the "All Collections" panel to see its
    component resources displayed in the panel titled "Contents Of Chosen Collection" or "Contents Of Collection: xyz".
    Select resources from any and as many collections as you wish to. Finally, when you are done selecting your data
    set, click the button at the bottom, labeled "Prepare Starter Data", of the page. A spinner will appear on the
    "Prepare Starter Data" button and will stay there, spinning, until the selected resources and courses have been
    fetched from the specified couchdb server and turned into starter data.
5.	Finally, a dialog will appear telling you whether the data preparation went through with success or failed. The 
    success message on dialog implies the service has prepared the data and has also placed packaged it into the 
    'Bell-Installer-for-Windows', the startup installation tool present inside the Data-Builder. The startup installation
    can now be used for doing a BeLL windows install with starter data.
6.  To go on to do a BeLL installation after a success message in step 5 above, copy the 'Bell-Installer-for-Windows' 
    directory inside the Data Builder root folder and transfer it to any target windows machine. After the transfer, open 
    the Bell-Installer-for-Windows folder at the target machine and run the file named 'install.bat' (BeLL installation 
    guide can be be found in the readme for the following repo: 
    https://github.com/open-learning-exchange/Bell-Installer-for-Windows).


Notes for QA
------------
After completing data building operation, any subsequent installs of BeLL app using the 'Bell-Installer-for-Windows' tool 
inside the data-builder should have the chosen courses and resources in them (the installed apps).
