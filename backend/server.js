require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json()); // For parsing application/json

const logFilePath = path.join(__dirname, 'login-logs.json');

// Utility function to log login/logout events
const logEvent = (email, event, timestamp) => {
     let logs = fs.existsSync(logFilePath)
          ? JSON.parse(fs.readFileSync(logFilePath, 'utf-8'))
          : [];

     const userLogIndex = logs.findIndex(log => log.email === email);
     if (userLogIndex > -1) {
          const userLog = logs[userLogIndex];
          if (event === 'login') {
               // Update login time if it's a new login
               userLog.loginTime = timestamp;
          } else if (event === 'logout') {
               // Update logout time if user has logged in and hasn't logged out
               if (userLog.loginTime && !userLog.logoutTime) {
                    userLog.logoutTime = timestamp;
               }
          }
     } else {
          const newUserLog = {
               email,
               loginTime: event === 'login' ? timestamp : null,
               logoutTime: event === 'logout' ? timestamp : null
          };
          logs.push(newUserLog);
     }

     fs.writeFileSync(logFilePath, JSON.stringify(logs, null, 2));
};

// Login route
app.post('/login', (req, res) => {
     const { email, password } = req.body;

     // Mock users for demo
     const mockUsers = [
          { email: 'user1@example.com', password: 'password1' },
          { email: 'user2@example.com', password: 'password2' },
     ];

     const user = mockUsers.find(u => u.email === email && u.password === password);

     if (user) {
          const loginEvent = 'login';
          const timestamp = new Date().toISOString();
          logEvent(email, loginEvent, timestamp);

          res.json({ message: 'Login successful', email });
     } else {
          res.status(401).json({ message: 'Invalid email or password' });
     }
});

// Logout route
app.post('/logout', (req, res) => {
     const { email } = req.body;

     const logoutEvent = 'logout';
     const timestamp = new Date().toISOString();
     logEvent(email, logoutEvent, timestamp);

     res.json({ message: 'Logout successful' });
});

// Logs route to view all login/logout events
app.get('/logs', (req, res) => {
     const logs = fs.existsSync(logFilePath)
          ? JSON.parse(fs.readFileSync(logFilePath, 'utf-8'))
          : [];
     res.json(logs);
});

// Employee list with login/logout events
app.get('/employeelist', (req, res) => {
     const logs = fs.existsSync(logFilePath)
          ? JSON.parse(fs.readFileSync(logFilePath, 'utf-8'))
          : [];

     const recentLogs = logs.map(log => ({
          email: log.email,
          loginTime: log.loginTime,
          logoutTime: log.logoutTime,
     }));

     res.json(recentLogs);
});

// Root route
app.get('/', (req, res) => {
     res.send('<h2>Hello from Express.js server!!</h2>');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
     console.log(`Server is running on port ${PORT}`);
});
