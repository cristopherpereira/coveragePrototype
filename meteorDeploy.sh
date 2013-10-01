#!/bin/bash

#Steps to deploy the app
#1. Copy the code to the server ~/meteor/coverage/Code folder
#2. Run the script "~/meteor/coverage/Code/meteorDeploy.sh"

# IP or URL of the server you want to deploy to
export APP_HOST=10.4.0.133

# Change the port if you want to run on an alternate port
export PORT=3000

# Set the app name
export APPNAME=coverage

# Set the mongo database name
export MongoDBName=coverage

cd ~/meteor/$APPNAME/

echo Deleting deploy folder...

rm -rf ~/meteor/$APPNAME/Deploy
mkdir ~/meteor/$APPNAME/Deploy

echo Deploying...

cd ~/meteor/$APPNAME/Code
meteor bundle ~/meteor/$APPNAME/Deploy/$APPNAME.tar.gz --release 0.6.4.1
cd ~/meteor/$APPNAME/

echo Extracting...

tar xvf ~/meteor/$APPNAME/Deploy/$APPNAME.tar.gz -C ~/meteor/$APPNAME/Deploy

echo Installing fibers...

rm -rf ~/meteor/$APPNAME/Deploy/bundle/server/node_modules/fibers
npm install --prefix ./Deploy/bundle/server/ fibers@1.0.0
export MONGO_URL=mongodb://localhost/$MongoDBName
export ROOT_URL=http://$APP_HOST:$PORT

if [[ $(forever list) =~ "coverage" ]]; then
        echo Restarting forever...
		forever restart ~/meteor/$APPNAME/Deploy/bundle/main.js
else
        echo Starting forever...
		forever start ~/meteor/$APPNAME/Deploy/bundle/main.js
fi

