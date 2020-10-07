+============================================+
+             Quick help/guide               +
+============================================+

Set up:
Make sure you are in the app folder (i.e. The folder containing this readme).
Run "npm install". This will install all the libraries needed.

To run:
Run "npm start". The start script is recognized in package.json.
*Note that you will see nodemon. This is just so that when you modify any 
 files and save, the server automatically restarts so you don't need to keep
 stopping and starting the server again to see your change.

*You may see "Port 8080 is already in use" followed by app crashed. I don't
 know why it does that. But just press save to get it running again.

Orientation:

controllers/
Here is where the controllers are. Controllers can be thought of processing classes
where you process your requests.

controllers/dbControllers.js
This is where the magic happens. You can process the requests here and ask the
DB instance to do the querying.

models/
Here is where the models are. Models are just like object classes.

database/
Don't need me to explain right?

database/database.js
This is where I instantiate our db. If all goes well, we may not need to touch
that anymore.

node_modules/
All the libraries generated from npm install. Just don't touch.

public/
This contain the html support files like js and css and images.

views/
The template of each page. Can be dynamically rendered.

views/components/
Contain all the smaller parts of a page. #modularization

.env
This is the file to store your environment variables. Currently there's the
login configuration for the database. You may need to modify some fields
according to how your postgre is.

router.js
This is the router for the applications requests. For every path, there should
be a handler. If you intend to add more pages, this is the place to connect up
the page to the app.

app.js
Like main(). The starting point when running. Also don't need touch.

**package.json and package-lock.json also don't touch.