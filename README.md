# Translation Checker

This is a small application that loops through a provided XML document 
and returns translations that are similar to each other.

Lauching the application will open a simple web page that takes in two properties, an 
XML document.  And a path to the translation information within the XML file.  An xml file has
been provided at the root of the project and is called `langage.xml`. The path to the translation
information is `root.translate`

## Installation

1. Install Node.js 5.0 or higher.  This can be done by going to https://nodejs.org/en/
2. Once Node is installed run the command `npm install`
3. One the installation is complete run the command `npm start` to start a web server 
on port `3000`
4. In a browser navigate to http://localhost:3000 to view the application

## Testing

Unit tests have been included to test the server logic.  To run tests run the command `npm test`

## If I only had the time!

This application was built quite quickly and there's a number of things that would be 
nice to add.  These include:

- Adding unit tests to the front end
- Breaking up the front end application logic into a seperate module
- Better styling for the UI
- More validation of inputs on both the front end and back end
- Use and Express router to handle API routes
- Use environment variables to handle accepted file types and level of similarity to check on