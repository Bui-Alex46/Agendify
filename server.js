const express = require('express');
const { google } = require('googleapis');
const fs = require('fs');
const session = require('express-session');
const app = express();
const cors = require('cors'); // Import cors
require('dotenv').config();
const pool = require('./src/db/db');  // Import the pool object from db.js

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

      const userId = 1;  // Replace with actual logic to get the user ID

      // Store the Google events in the database
      await storeGoogleEvents(userId, events);

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
    console.log(req.session.events)
    res.json(req.session.events);
  } else {
    res.status(404).send('No events found. Please log in.');
  }
});

// Example route that fetches data from the events table
app.get('/events', async (req, res) => {
  try {
      const result = await pool.query('SELECT * FROM events');
      res.json(result.rows);  // Send the fetched events as JSON response
  } catch (err) {
      console.error('Error fetching events:', err);
      res.status(500).json({ error: 'Failed to fetch events' });
  }
});


const storeGoogleEvents = async (userId, googleEvents) => {
  for (let event of googleEvents) {
      const { summary, start, end, description } = event;

      // Prepare event data
      const title = summary || 'No Title';
      const deadline = start.dateTime || end.dateTime;
      const notes = description || '';
      const priority = 1; // You can adjust based on your logic
      const status = false || true; // Default status is 'pending'

      try {
          // Insert event into the events table
          const result = await pool.query(
              `INSERT INTO events (user_id, title, deadline, priority, notes, status)
               VALUES ($1, $2, $3, $4, $5, $6)`,
              [userId, title, deadline, priority, notes, status]
          );
          console.log(`Event "${title}" inserted successfully`);
      } catch (err) {
          console.error('Error inserting event:', err);
      }
  }
};

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
