'use strict';

const axios = require('axios')
const _ = require('lodash')
// Import the Dialogflow module from the Actions on Google client library.
const {
  dialogflow,
  Suggestions,
} = require('actions-on-google');
const functions = require('firebase-functions');

const FALLBACK_SPEECH = ['Sorry, what was that?',
  "Sorry, could you say that again?",
  "I missed what you said. What was that? ",
  "Sorry, I didn't get that. Can you rephrase?",
  "I didn't get that. Can you repeat?",
  "I missed that, say that again?"
]

// Create an app instance
const app = dialogflow({
  debug: true
});

console.log('start')

/**
 * Default welcome intent
 * 
 */
app.intent('Default Welcome Intent', (conv) => {
  conv.ask(`Welcome to gitrack. What do you want to know about from github? A particular user, an organization or simply search github.`)
  // only shown for if surface capability
  conv.ask(new Suggestions('user', 'organization'))
});


app.intent('user', (conv) => {
  conv.ask('Please tell me the username for the user you want to know about.')
});

app.intent('Default Welcome Intent - org', (conv) => {
  conv.ask(`Please tell me the organization's name for the user you want to know about.`)
});

app.intent('actions_intent_NO_INPUT', (conv) => {
  // Use the number of reprompts to vary response
  const repromptCount = parseInt(conv.arguments.get('REPROMPT_COUNT'));
  if (repromptCount === 0) {
    conv.ask('Please answer.');
  } else if (repromptCount === 1) {
    conv.ask(`Time's ticking.`);
  } else if (conv.arguments.get('IS_FINAL_REPROMPT')) {
    conv.close(`Sorry we're having trouble. Let's ` +
      `try this again later. Goodbye.`);
  }
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
app.intent('fetch by username', (conv, {
  username
}) => {

  return axios.get(`https://api.github.com/users/${username}`)
    .then((results) => {
      // Username does not exist
      if (results.data.message) {
        conv.ask(`Sorry, it seems like the user with username ${username} does not exist. Would you like to try again`);
      } else {
        conv.data.user = results.data
        conv.ask('Would you like to know a summary of the user or something specific?')
      }
    })
});

app.intent('fallback_intent', conv => {
  conv.ask(_.sample(FALLBACK_SPEECH))
})




// Set the DialogflowApp object to handle the HTTPS POST request.
exports.assistant = functions.https.onRequest(app);