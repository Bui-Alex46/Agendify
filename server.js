const express = require('express');
const { google } = require('googleapis');
const fs = require('fs');
const session = require('express-session');
const app = express();
const cors = require('cors'); // Import cors
require('dotenv').config();

const port = 3001;

// Google OAuth2 credentials
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = 'http://localhost:3001/oauth2callback';
const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

// Scopes for calendar read-only access
const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];

// Set up session middleware
app.use(cors({
  origin: 'http://localhost:3000', // Allow requests from this origin
  credentials: true
}));

// Route to start the OAuth2 flow
app.get('/auth', (req, res) => {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  res.redirect(authUrl);
});

// Route to handle Google OAuth2 callback
// Route to handle Google OAuth2 callback
app.get('/oauth2callback', async (req, res) => {
  const code = req.query.code;
  if (code) {
    try {
      const { tokens } = await oAuth2Client.getToken(code);
      oAuth2Client.setCredentials(tokens);

      // Save the token for later executions
      fs.writeFileSync('token.json', JSON.stringify(tokens));

      // Fetch events from the calendar
      const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

      // Fetch upcoming 10 events
      const eventsResponse = await calendar.events.list({
        calendarId: 'primary',
        timeMin: new Date().toISOString(),
        maxResults: 10,
        singleEvents: true,
        orderBy: 'startTime',
      });

      const events = eventsResponse.data.items; // Ensure you are accessing the correct path

      // Redirect back to the client with the events in query parameters
      const eventsEncoded = encodeURIComponent(JSON.stringify(events));
      res.redirect(`http://localhost:3000/?events=${eventsEncoded}`);
    } catch (err) {
      console.error('Error retrieving access token or fetching events:', err);
      res.status(500).send('Error retrieving access token or fetching events: ' + err);
    }
  } else {
    res.status(400).send('No code provided.');
  }
});



// Endpoint to retrieve events from the session
app.get('/get-events', (req, res) => {
  if (req.session.events) {
    res.json(req.session.events);
  } else {
    res.status(404).send('No events found. Please log in.');
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
