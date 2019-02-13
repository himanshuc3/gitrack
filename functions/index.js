'use strict';

const axios = require('axios')
// Import the Dialogflow module from the Actions on Google client library.
const {
  dialogflow,
} = require('actions-on-google');
const functions = require('firebase-functions');

// Instantiate the Dialogflow client.
const app = dialogflow({
  debug: true
});


/**
 * Default welcome intent
 * 
 */
app.intent('Default Welcome Intent', (conv) => {
  return axios.get('https://api.github.com/users/himanshuc3/followers')
    .then((result) => {
      conv.ask(result.data[0]['login'])
    })
});


// Set the DialogflowApp object to handle the HTTPS POST request.
exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);