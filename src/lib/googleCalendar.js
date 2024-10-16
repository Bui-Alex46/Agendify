const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

// Define the path to your token and credentials
const TOKEN_PATH = path.join(__dirname, 'token.json');
const CREDENTIALS_PATH = path.join(__dirname, 'credentials.json');

// Scopes define the level of access required by your app. In this case, read-only access to calendar events.
const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];

/**
 * Load or request authorization to fetch Google Calendar events.
 */
function authorizeAndFetchEvents(res) {
  // Load client secrets from a local file.
  fs.readFile(CREDENTIALS_PATH, (err, content) => {
    if (err) {
      console.error('Error loading client secret file:', err);
      return res.status(500).send('Error loading client secret file');
    }
    // Authorize a client with credentials, then fetch the events.
    authorize(JSON.parse(content), fetchEvents, res);
  });
}

/**
 * Create an OAuth2 client with the given credentials, and then execute the callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback, res) {
  const { client_secret, client_id, redirect_uris } = credentials.web;
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0] // This should be 'http://localhost:3000/oauth2callback'
  );

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) {
      const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
      });
      return res.redirect(authUrl);  // Redirect user to Google Auth URL
    }
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client, res);
  });
}

/**
 * Fetch the upcoming 10 events from the user's calendar.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function fetchEvents(auth, res) {
  const calendar = google.calendar({ version: 'v3', auth });

  calendar.events.list(
    {
      calendarId: 'primary',  // Access the primary calendar of the authenticated user
      timeMin: new Date().toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime',
    },
    (err, result) => {
      if (err) {
        console.error('The API returned an error:', err);
        return res.status(500).send('Error fetching events');
      }

      const events = result.data.items;
      if (events.length) {
        res.json(events.map(event => ({
          start: event.start.dateTime || event.start.date,
          summary: event.summary,
        })));
      } else {
        res.send('No upcoming events found.');
      }
    }
  );
}

module.exports = {
  authorizeAndFetchEvents,
};
