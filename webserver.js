/**
* A toy web server built with Node.js
* but without Express.js,
* mostly for educational purposes.
*
* Current features include serving of 
* static files (such as *.html and *.jpg)
* and a directory "index" if a directory is chosen.
*
* IMPORTANT: Be sure to fill in the 
* values for 'webRoot'
* and 'port' in config.js
* before running.  
*
* Possible future features:
* 1. execution of old-fashioned "CGI's". 
* 2. virtual hosts
* 3. ...
*/

// Filesystem ops...
var fs = require("fs");

// HTTP ops...
var http = require("http");

// Handy path manipulation methods, such as normalize()
var path = require("path");

// function that translates file extension to proper Content-type
var extTranslator = require('./extTranslator.js');

// miscellaneous "static" methods...
var jutils = require('./jutils.js');

// configuration parameters such as webRoot and port...
var config = require('./config');


console.log(getTimeStamp() + ": " + "config.port = \"" + config.port + "\"...");
console.log(getTimeStamp() + ": " + "config.webRoot = \"" + config.webRoot + "\"...");

console.log(getTimeStamp() + ": " + "Listening for HTTP on port " + config.port  + "...");

// Accept a single user connection, pointed to by "theUser"...
// Use the "Server Sent Events" (SSE) interface...
// Or, to be even more sophisticated, use Web Sockets...
http.createServer(
	function( request, response ) {

		try {	

        	console.log(getTimeStamp() + ": " + "HTTP_REQUEST: From " + request.connection.remoteAddress + ' to URL ' + request.url);

        	//var targetPath = path.normalize(__dirname + request.url);
        	var targetPath = path.normalize(config.webRoot + request.url);

        	console.log(getTimeStamp() + ": " + "HTTP_REQUEST: targetPath = '" + targetPath + "'");

            var extension = path.extname(targetPath).substr(1);

        	console.log(getTimeStamp() + ": " + "HTTP_REQUEST: extension = '" + extension + "'");

			response.setHeader( "Cache-Control", "no-cache, must-revalidate" );

			// Set expiration to date in the past...
			response.setHeader( "Expires", "Mon, 26 Jul 1997 05:00:00 GMT" ); 

        	fs.exists(targetPath, function (exists) {

				if (exists) {

					if( fs.lstatSync(targetPath).isFile() ){

	        			console.log(getTimeStamp() + ": " + "HTTP_REQUEST: Serving up static file page '" + targetPath + "'...");

						// If corresponding file found, serve up a static page from the fileystem...
						response.statusCode = 200;

						var sContentType = extTranslator(extension);

						console.log(getTimeStamp() + ": " + "HTTP_REQUEST: Content-type: " + sContentType + "...");
						response.setHeader('Content-type', extTranslator(extension));

						//stream file content to client
						fs.createReadStream(targetPath).pipe(response);
					}
					else if( fs.lstatSync(targetPath).isDirectory() ){

	        			console.log(getTimeStamp() + ": " + "HTTP_REQUEST: Looks like a directory...outputting directory listing...");

						// Later we can add a config setting to allow or disallow
						// directory indexes for security purposes...
						//response.statusCode = 404;
						//response.end('404 Directory Indexes Not Supported');

						// Output a directory index...
						response.writeHead(200, { "Content-Type": "text/html" } );	
						response.write("<!DOCTYPE HTML>\n");
						response.write(
						"<html>\n" +
						" <head>\n" +
						"  <title>Index of " + request.url + "</title>\n" +
						" </head>\n" +
						" <body>\n" +
						"  <h1>Index of " + request.url + "</h1>\n" +
						"  <ul>\n" 
						);

						var dirEntries = fs.readdirSync( targetPath );

						dirEntries.forEach( function(dirEntry, idx){

							//var sPath = request.url;
							//
							// If there's no "/" at the end of the url, append one...
							//if( sPath.lastIndexOf("/") != sPath.length-1 ){
							//	sPath += "/";
							//}
							//
							//sPath += dirEntry;

	        				console.log(getTimeStamp() + ": " + "HTTP_REQUEST: " + idx + ": dirEntry = '" + dirEntry + "'...\n");

							//var sLocalPath = path.normalize( targetPath + dirEntry );
							var sLocalPath = path.normalize( targetPath + "/" + dirEntry );
	        				console.log(getTimeStamp() + ": " + "HTTP_REQUEST: " + idx + ": sLocalPath = '" + sLocalPath + "'...\n");

							// Suffix of "/" on directory listing visually indicates a directory...
							var sSuffix = "";
							if( fs.lstatSync(sLocalPath).isDirectory() ){
								sSuffix = "/";
							}

							var sUrlPath = path.normalize( request.url + "/" + dirEntry );

							// In case we're on Windows, use front-slashes for the index URL's, thank you very much...
							sUrlPath = sUrlPath.replace(/\\/g, "\/");

	        				console.log(getTimeStamp() + ": " + "HTTP_REQUEST: " + idx + ": sUrlPath = '" + sUrlPath + "'...\n");

							response.write(
							"   <li><a href=\"" + sUrlPath + "\">" + dirEntry + sSuffix + "</a></li>\n"
							);
						});

						response.write(
						"  <ul>\n" +
						" </body>\n"
						);

						response.end();
					}
					else { 
	        			console.log(getTimeStamp() + ": " + "HTTP_REQUEST: Not a file nor a directory...");

						response.statusCode = 404;
						response.end('404 File Type Not Supported');
					}

				} else {

        			console.log(getTimeStamp() + ": " + "HTTP_REQUEST: '" + targetPath + "' does not exist, sending Code 404 Not Found...");

					response.statusCode = 404;
					response.end('404 Not Found');
				}
			});

    } catch (e) {
        console.log(getTimeStamp() + ": " + 'D\'oh!  ERROR: ' + e.message);
        res.statusCode = 500;
        res.end('500 Server error occurred');
    }

}).listen( config.port );		

function getTimeStamp(){
	return jutils.dateTimeCompact();
}
