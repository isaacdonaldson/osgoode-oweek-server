run:
	nodemon src/app.js

deploy:
	claudia update 

test:
	curl 'https://gxxcfutxmoc5.execute-api.ca-central-1.amazonaws.com/latest/'
