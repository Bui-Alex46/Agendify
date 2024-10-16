const express = require('express');
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const app = express();
require('dotenv').config();
const port = 3001; // Make sure your redirect URI in the Google console matches this port

// Google OAuth2 credentials
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = 'http://localhost:3001/oauth2callback';
const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

// Scopes define the level of access required by your app. In this case, read-only access to calendar events.
const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];

// Route to start the OAuth2 flow
app.get('/auth', (req, res) => {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  res.redirect(authUrl); // Redirect the user to the Google OAuth2 authorization page
});

// Route to handle Google OAuth2 callback
app.get('/oauth2callback', async (req, res) => {
  const code = req.query.code;
  if (code) {
    try {
      const { tokens } = await oAuth2Client.getToken(code);
      oAuth2Client.setCredentials(tokens);

      // Save the token to disk for later executions
      fs.writeFileSync('token.json', JSON.stringify(tokens));

      // Fetch events from the calendar
      const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

      // Fetch upcoming 10 events
      calendar.events.list({
        calendarId: 'primary',
        timeMin: new Date().toISOString(),
        maxResults: 10,
        singleEvents: true,
        orderBy: 'startTime',
      }, (err, result) => {
        if (err) return res.status(500).send('Error fetching events: ' + err);

        const events = result.data.items;
        if (events.length) {
          let eventList = 'Upcoming 10 events:<br>';
          events.forEach((event) => {
            const start = event.start.dateTime || event.start.date;
            eventList += `${start} - ${event.summary}<br>`;
          });
          res.send(eventList);
        } else {
          res.send('No upcoming events found.');
        }
      });
    } catch (err) {
      res.status(500).send('Error retrieving access token: ' + err);
    }
  } else {
    res.status(400).send('No code provided.');
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
