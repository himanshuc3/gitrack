'use strict';

const axios = require('axios')
// Import the Dialogflow module from the Actions on Google client library.
const {
  dialogflow,
  Suggestions
} = require('actions-on-google');
const functions = require('firebase-functions');

// Create an app instance
const app = dialogflow({
  debug: true
});


/**
 * Default welcome intent
 * 
 */
app.intent('Default Welcome Intent', (conv) => {
  conv.ask(`Welcome to gitrack. What do you want to know about from github? A particular user, an organization or simply search github.`)
  conv.ask(new Suggestions('user', 'organization'))
});


app.intent('Default Welcome Intent - user', (conv) => {
  conv.ask('Please tell me the username for the user you want to know about.')
});

app.intent('Default Welcome Intent - org', (conv) => {
  conv.ask(`Please tell me the organization's name for the user you want to know about.`)
});


/**
 * Get username and ask for follow up (specific data needed from the username provided).
 * @parameter {object} conv Dialogflow converstation object
 * @parameter {string} username Username entity
 * @return conv
 */
app.intent('get by organization', (conv, {
  username
}) => {
  conv.data.organization = organization.replace(/ /g, '');
  return axios.get(`https://api.github.com/orgs/${conv.data.organization}`)
    .then((results) => {
      if (results.data.message) {
        conv.ask(`Sorry, it seems like the user with username ${conv.data.organization} is not present. Would you like to try again`);
      } else {
        conv.ask(results['data']['login'])
      }
    })
});


/**
 * Get username and ask for follow up (specific data needed from the username provided).
 * @parameter {object} conv Dialogflow converstation object
 * @parameter {string} username Username entity
 * @return conv
 */
app.intent('get by username', (conv, {
  username
}) => {
  conv.data.username = username.replace(/ /g, '');
  return axios.get(`https://api.github.com/users/${conv.data.username}`)
    .then((results) => {
      if (results.data.message) {
        conv.ask(`Sorry, it seems like the user with username ${conv.data.username} is not present. Would you like to try again`);
      } else {
        conv.ask(results['data']['login'])
      }
    })
});




// Set the DialogflowApp object to handle the HTTPS POST request.
exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);