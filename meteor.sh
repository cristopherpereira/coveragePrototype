#!/bin/bash

#Steps to deploy the app
#1. Copy the code to the server coverage folder
#2. Run the script "./meteor.sh"

# IP or URL of the server you want to deploy to
export APP_HOST=10.4.0.133

# Change the port if you want to run on an alternate port
export PORT=3000

# Set the app name
export APPNAME=coverage

# Set the mongo database name
export MongoDBName=coverage

echo Stopping forever...
forever stop Deploy/bundle/main.js
echo Deleting deploy folder...
rm -rf Deploy
mkdir Deploy
echo Deploying...
meteor bundle Deploy/$APPNAME.tar.gz --release 0.6.4.1
echo Extracting...
tar xvf Deploy/$APPNAME.tar.gz -C Deploy
echo Installing fibers...
rm -rf Deploy/bundle/server/node_modules/fibers
npm install --prefix ./Deploy/bundle/server/ fibers@1.0.0
export MONGO_URL=mongodb://localhost/$MongoDBName
export ROOT_URL=http://$APP_HOST:$PORT
echo Starting forever...
forever start Deploy/bundle/main.js
