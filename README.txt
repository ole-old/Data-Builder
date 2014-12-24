With this app, starter data for a BeLL installer can be built. For a step by step user guide, read on.
------------------------------------------------------------------------------------------------------
Prereqs
-------
Node.js must be installed on the system before running Data-Builder

How to use Installer/Starter Data Builder App
---------------------------------------------
a)	Open/run the file "launch-app.bat". It will start the app server and open the following page in firefox browser:
    http://localhost:3000/prepare-starter-data
b)	Choose/specify a BeLL server by selecting one of the options from the "Options" dropdown or by typing in the
    address of the server yourself. Then click the button named "View".
c)	After a short wait, symbolised by a spinner below the options dropdown, the page will be populated with courses,
    resources, and collections data from the identified BeLL server.
d)	You can select  those courses and resources that you wish to include (as starter data) in the BeLL installer by
    checking their respective checkboxes. Click on a collection name from the "All Collections" panel to see its
    component resources displayed in the panel titled "Contents Of Chosen Collection" or "Contents Of Collection: xyz".
    Select resources from any and as many collections as you wish to. Finally, when you are done selecting your data
    set, click the button at the bottom, labeled "Prepare Starter Data", of the page.
5.	The service will prepare data and place it inside the Bell-Installer directory in Data-Builder. Installer is now ready to install App with chosen data!

Notes for QA
------------
After completing an iteration of data-builder operation, any subsequent installs of BeLL app using the 
'Bell-Installer-for-Windows' tool inside it should have the chosen courses and resources in them (the installed apps).
