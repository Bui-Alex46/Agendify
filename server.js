const express = require('express');
const { google } = require('googleapis');
const fs = require('fs');
const session = require('express-session');
const app = express();
const cors = require('cors'); // Import cors
const bodyParser = require("body-parser");
require('dotenv').config();
const pool = require('./src/db/db');  // Import the pool object from db.js
const saltRounds = 10;
const bcrypt = require('bcrypt');
const port = 3001;
const pgSession = require('connect-pg-simple')(session);
const { requireLogin } = require('./middleware');
const { ChatOpenAI } = require("@langchain/openai");


const model = new ChatOpenAI({
  modelName: 'gpt-3.5-turbo',
  temperature: 0.7,
  openAIApiKey: process.env.OPENAI_API_KEY, // Use your OpenAI API key
});

// Google OAuth2 credentials
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = 'http://localhost:3001/oauth2callback';
const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

// Scopes for calendar read-only access
const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];



// Set up session middleware
app.use(
  session({
    store: new pgSession({
      pool: pool, // Use PostgreSQL connection pool
      tableName: 'session', // Use session table created earlier
    }),
    secret: process.env.SESSION_SECRET || 'your-secret-key', // Secure key for signing the session ID
    resave: false, // Avoid resaving sessions if unmodified
    saveUninitialized: false, // Only save sessions when something is stored
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
      secure: false, // Set to true if using HTTPS
      httpOnly: true, // Prevent client-side access to the cookie
    },
  })
);

app.use(express.json());

// Cross-origin for front-end 
app.use(cors({
  origin: 'http://localhost:3000', // Allow requests from this origin
  credentials: true
}));


app.use(bodyParser.json()); // Parses JSON payloads


// Route to start the OAuth2 flow
app.get('/auth', (req, res) => {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  res.redirect(authUrl);
});

// Get user info
app.get('/user-info', requireLogin, async (req, res) => {
  try {
    const userId = req.session.user.user_id; // Get user ID from session
    const query = 'SELECT * FROM users WHERE user_id = $1';
    const result = await pool.query(query, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json(result.rows[0]); // Send user info
  } catch (error) {
    console.error('Error fetching user info:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Route to handle Google OAuth2 callback
// Route to handle Google OAuth2 callback
app.get('/oauth2callback', requireLogin, async (req, res) => {
  console.log('Session in /oauth2callback:', req.session);
  const code = req.query.code;
  if (code) {
    try {
      const { tokens } = await oAuth2Client.getToken(code);
      oAuth2Client.setCredentials(tokens);
      const userId = req.session.user.user_id;

      // Save the token for later executions
      fs.writeFileSync('token.json', JSON.stringify(tokens));

      // Fetch events from the calendar
      const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

      // Fetchup coming 10 events
      const eventsResponse = await calendar.events.list({
        calendarId: 'primary',
        timeMin: new Date().toISOString(),
        maxResults: 10,
        singleEvents: true,
        orderBy: 'startTime',
      });

      const events = eventsResponse.data.items; // Ensure you are accessing the correct path
      console.log(events)
      // Transform the events to match the database structure
 
      // Store the Google events in the database
      await storeGoogleEvents(userId, events);

      // Redirect back to the client with the events in query parameters
      const eventsEncoded = encodeURIComponent(JSON.stringify(events));
      res.redirect(`http://localhost:3000/Homepage?events=${eventsEncoded}`);
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

// Route to fetch events for the logged-in user
app.get('/events', async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Unauthorized. Please log in.' });
  }
  const userId = req.session.user.user_id; // Retrieve user ID from session


  try {
    const query = 'SELECT * FROM events WHERE user_id = $1'; // Filter events by user ID
    const result = await pool.query(query, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No events found for this user.' });
    }

    res.json(result.rows); // Send the user's events as a JSON response
  } catch (err) {
    console.error('Error fetching events:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Sign up route
app.post('/signup', async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('Request body:', { username, password });

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }

    // Hash the password
    console.log('Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save the user to the database
    const query = `INSERT INTO users (username, password) VALUES ($1, $2) RETURNING user_id`;
    console.log('Executing query:', query, { username, hashedPassword });
    const result = await pool.query(query, [username, hashedPassword]);

    console.log('User created with ID:', result.rows[0].user_id);
    res.status(201).json({ message: 'User created successfully', userId: result.rows[0].user_id });
  } catch (error) {
    console.error('Error signing up user:', error);

    if (error.code === '23505') {
      // Duplicate username
      res.status(400).json({ error: 'Username already exists' });
    } else {
      // General server error
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
});


app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }

    // Fetch the user from the database
    const query = 'SELECT * FROM users WHERE username = $1';
    const result = await pool.query(query, [username]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const user = result.rows[0];

    // Compare the provided password with the hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    // Set user_id in the session

    req.session.user = { user_id: user.user_id, username: user.username };
    console.log('Session after setting user:', req.session);

    res.json({ message: 'Login successful', user: req.session.user  });
    
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});


const storeGoogleEvents = async (userId, googleEvents) => {
  for (let event of googleEvents) {
      const { summary, start, end, description } = event;

      // Prepare event data
      const title = summary || 'No Title';
      const startTime = start.dateTime || start.date;
      const endTime = end.dateTime || end.date;
      const notes = description || '';
      const priority = 1; // You can adjust based on your logic
      const status = false;

      try {
          // Insert event into the events table
          const result = await pool.query(
              `INSERT INTO events (user_id, title, start, "end", priority, notes, status)
               VALUES ($1, $2, $3, $4, $5, $6, $7)`,
              [userId, title, startTime, endTime, priority, notes, status]
          );
          console.log(`Event "${title}" inserted successfully`);
      } catch (err) {                               
          console.error('Error inserting event:', err);
      }
  }
};

app.put('/update-event', async (req, res) => {
  const { event_id, title, start, end, status, priority } = req.body;

  // Ensure start and end are valid dateTime strings
  const startTime = start.dateTime || start; // Use dateTime if available, fallback to direct value
  const endTime = end.dateTime || end; // Use dateTime if available, fallback to direct value

  try {
    // Update the event in the database
    const result = await pool.query(
      `UPDATE events 
       SET title = $1, start = $2, "end" = $3, priority = $4, status = $5
       WHERE event_id = $6`,
      [title, startTime, endTime, priority, status, event_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    res.json({ message: 'Event updated successfully.' });
  } catch (err) {
    console.error('Error updating event:', err);
    res.status(500).json({ error: 'Failed to update event.' });
  }
});



// app.post('/api/optimize-schedule', async (req, res) => {
//   const { tasks, weather, commute, preferences } = req.body;

//   try {
//     const response = await openai.createCompletion({
//       model: "text-davinci-003",
//       prompt: `
//         You are a scheduling assistant. Based on the following inputs:
//         - Tasks: ${tasks}
//         - Weather: ${weather}
//         - Commute: ${commute}
//         - Preferences: ${preferences}
        
//         Create an optimized daily schedule.
//       `,
//       max_tokens: 500,
//     });

//     res.status(200).json({ schedule: response.data.choices[0].text.trim() });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Failed to generate schedule.' });
//   }
// });
app.post('/generate-schedule', async (req, res) => {
  try {
    // Get user prompt from the request body
    const { prompt } = req.body;

    // Create a structured set of messages for the chat model
    const messages = [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: prompt }
    ];

    // Call the model with the messages
    const response = await model.call(messages);

    // Return the generated response
    res.json({ schedule: response.text });
  } catch (error) {
    console.error('Error generating schedule:', error);
    res.status(500).json({ error: 'An error occurred while generating the schedule.' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
