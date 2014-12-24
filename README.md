## Prerequisites
Node.js must be installed on the system before running Data-Builder

## How to use Builder Data for BELL Installer
1.  Open/run the file "launch-app.bat". It will start the app server and open the following page in firefox browser: **http://localhost:3000/prepare-starter-data**
2.  Choose/specify a BeLL server by selecting one of the options from the **Options** dropdown or by typing in the address of the server yourself. Then click the button named **View**
3.  After a short wait, symbolised by a spinner below the options dropdown, the page will be populated with courses, resources, and collections data from the identified BeLL server
4.  You can select  those courses and resources that you wish to include (as starter data) in the BeLL installer by checking their respective checkboxes. Click on a collection name from the **All Collections** panel to see its component resources displayed in the panel titled **Contents Of Chosen Collection** or **Contents Of Collection: xyz**. Select resources from any and as many collections as you wish to. Finally, when you are done selecting your data set, click the button at the bottom, labeled **Prepare Starter Data**, of the page
5.	The service will prepare data and place it inside the Bell-Installer directory in Data-Builder. Installer is now ready to install App with chosen data!

## Notes for QA
After completing data building operation, any subsequent installs of BeLL app using the 'Bell-Installer-for-Windows' tool inside the data-builder should have the chosen courses and resources in them (the installed apps).
