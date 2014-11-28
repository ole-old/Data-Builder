## How to use Builder Data for BELL Installer
1.  Open/run the file "launch-app.bat". It will start the app server and open the following page in firefox browser: **http://localhost:3000/prepare-starter-data**
2.  Choose/specify a BeLL server by selecting one of the options from the **Options** dropdown or by typing in the address of the server yourself. Then click the button named **View**
3.  After a short wait, symbolised by a spinner below the options dropdown, the page will be populated with courses, resources, and collections data from the identified BeLL server
4.  You can select  those courses and resources that you wish to include (as starter data) in the BeLL installer by checking their respective checkboxes. Click on a collection name from the **All Collections** panel to see its component resources displayed in the panel titled **Contents Of Chosen Collection** or **Contents Of Collection: xyz**. Select resources from any and as many collections as you wish to. Finally, when you are done selecting your data set, click the button at the bottom, labeled **Prepare Starter Data**, of the page
5.	The service will prepare data and place it in a specific folder, labeled **StarterDataLocation**, inside the main directory of this (Data-Builder) tool. All contents from **StarterDataLocation** folder are to be copied by the user to the folder named **Starter_Data** inside the Startup-Installation tool. This information will appear on the screen as a prompt if the process completes successfully. However, if the process encounters any errors, you will still receive a prompt but this one carrying an error message instead.
6.  Carry out the copying task described in the previous step after clicking ok on the prompt.

## Notes for QA
When the BeLL installer, also called Startup-Installation tool, derived after having copied files into it in step (f)
above, is run on any windows machine, the resulting BeLL app should have the courses and resources that were chosen
through this Data-Builder tool.
