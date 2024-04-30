// Import necessary modules
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const cors = require('cors'); 
const app = express();
const port = 3000;

// Import security modules
const sanitizeHtml = require('sanitize-html'); // Sanitize user input
const csrf = require('csurf'); // Handle CSRF protection
const cookieParser = require('cookie-parser'); // Import cookie-parser

// Use CORS middleware to allow cross-origin requests
app.use(cors());
app.use(express.static('books'));
app.use(express.static('borrowers'));
app.use(express.static('transactions'));

// Use body-parser and express middleware to parse JSON bodies
app.use(express.json()); // Middleware to parse JSON requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Create CSURF protection
const csrfProtection = csrf({ cookie: true });
app.use(cookieParser()); // Use cookie-parser middleware
app.use(bodyParser.urlencoded({ extended: false })); // Use body-parser to parse request bodies

// MySQL connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Rlc=914682',
    database: 'libms'
});

// Automatically connect to the database
connection.connect(error => {
    if (error) throw error;
    console.log("Successfully connected to the database.");
});

// Route for adding a new book
app.post('/add-books', (req, res) => {
    const { isbn, title, author, year_published } = req.body;
    const sql = 'INSERT INTO books (isbn, title, author, year_published) VALUES (?, ?, ?, ?)';
    connection.query(sql, [isbn, title, author, year_published], (error, results) => {
        if (error) {
            console.error('Error inserting into the database', error);
            return res.status(500).send('An error occurred while adding a book.')
        }
        res.send('Book added successfully!');
    });
});

// Search Query for books
app.get('/search-books', (req, res) => {
    const searchQuery = req.query.searchQuery;
    const sql = 'SELECT * FROM books WHERE isbn LIKE ? OR title LIKE ? OR author LIKE ? OR year_published LIKE ?';
    connection.query(sql, [`%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`], (err, results) => {
        if (err) {
            console.error('Error fetching books.', err);
            return res.status(500).send('An error occurred while fetching the books.');
        } 
        if (results.length === 0) {
            return res.status(404).send('No books found matching the criteria.');
        }
        res.json(results);
    });
});

// Route for adding a new borrower
app.post('/add-borrowers', (req, res) => {
    const { user_id, username, email, phone_number } = req.body;
    const sql = 'INSERT INTO borrowers (user_id, username, email, phone_number) VALUES (?, ?, ?, ?)';
    connection.query(sql, [user_id, username, email, phone_number], (error, results) => {
        if (error) {
            console.error('Error inserting into the database', error);
            return res.status(500).send('An error occurred while adding a borrower.')
        }
        res.send('Borrower added successfully!');
    });
});

// Search Query for borrowers
app.get('/search-borrowers', (req, res) => {
    const searchQuery = req.query.searchQuery;
    const sql = 'SELECT * FROM borrowers WHERE user_id LIKE ? OR username LIKE ? OR email LIKE ? OR phone_number LIKE ?';
    connection.query(sql, [`%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`], (err, results) => {
        if (err) {
            console.error('Error fetching borrowers.', err);
            return res.status(500).send('An error occurred while fetching the borrowers.');
        } 
        if (results.length === 0) {
            return res.status(404).send('No borrowers found matching the criteria.');
        }
        res.json(results);
    });
});

// Route for adding a new transaction
app.post('/add-transactions', (req, res) => {
    const { serial_number, isbn, user_id, check_status, date_loaned, date_retrned } = req.body;
    const sql = 'INSERT INTO transactions (serial_number, isbn, user_id, check_status, date_loaned, date_retrned) VALUES (?, ?, ?, ?, ?, ?)';
    connection.query(sql, [serial_number, isbn, user_id, check_status, date_loaned, date_retrned], (error, results) => {
        if (error) {
            console.error('Error inserting into the database', error);
            return res.status(500).send('An error occurred while adding a transaction.')
        }
        res.send('Transaction added successfully!');
    });
});

// Search Query for transactions
app.get('/search-transactions', (req, res) => {
    const searchQuery = req.query.searchQuery;
    const sql = 'SELECT * FROM transactions WHERE serial_number LIKE ? OR isbn LIKE ? OR user_id LIKE ? OR check_status LIKE ? OR date_loaned LIKE ? OR date_returned LIKE ?';
    connection.query(sql, [`%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`], (err, results) => {
        if (err) {
            console.error('Error fetching transactions.', err);
            return res.status(500).send('An error occurred while fetching the transactions.');
        } 
        if (results.length === 0) {
            return res.status(404).send('No transactions found matching the criteria.');
        }
        res.json(results);
    });
});

// Serve a page that is vulnerable to XSS
app.get('/', csrfProtection, (req, res) => { // Added csrfProtection middleware
    const userContent = req.query.userContent || 'Hello, world!';
    const cleanContent = sanitizeHtml(userContent, {
        allowedTags: [],
        allowedAttributes: {}
    });
    res.send(`<h1>Unsafe User Content</h1><div>${userContent}</div>
            <form action="/change-email" method="POST">
              <input type="hidden" name="_csrf" value="${req.csrfToken()}"> <!-- Add the CSRF token here -->
              <input type="text" name="newEmail" placeholder="Enter new email">
              <button type="submit">Change Email</button>
            </form>`);
});

// Endpoint vulnerable to CSRF
app.post('/change-email', (req, res) => {  // Added csrfProtection middleware to the route
  const newEmail = req.body.newEmail;
  res.send(`Email changed to: ${newEmail}`);
});

// Books route
app.post('/books', (req, res) => {
    console.log('Books route hit'); // Logs when the route is accessed.
    const { isbn, title, author, year_published } = req.body;
    // Secure SQL query using parameterized statements
    const query = `SELECT * FROM books WHERE isbn = ? AND title = ? AND author = ? AND year_published = ?`; // Placeholders, ?s, tells MySQL I will be using a parameter here. 
    connection.query(query, [isbn, title, author, year_published], (error, results) => { // Adding variables, username and passwords, to determine the parameter values
        if (error) {
            console.error('Error executing query:', error); // Log the error internally and respond with a generic message
            return res.status(500).send('Server error'); // Failing securely by returning a generic error message and a 500 status code to avoid leaking senstive information
        }
        results.length > 0 ? res.send('Login succeeded') : res.send('Login failed');
    });
});

// Borrowers route
app.post('/borrowers', (req, res) => {
    console.log('Borrowers route hit'); // Logs when the route is accessed.
    const { user_id, username, email, phone_number } = req.body;
    // Secure SQL query using parameterized statements
    const query = `SELECT * FROM borrowers WHERE user_id = ? AND username = ? AND email = ? AND phone_number = ?`; // Placeholders, ?s, tells MySQL I will be using a parameter here. 
    connection.query(query, [user_id, username, email, phone_number], (error, results) => { // Adding variables, username and passwords, to determine the parameter values
        if (error) {
            console.error('Error executing query:', error); // Log the error internally and respond with a generic message
            return res.status(500).send('Server error'); // Failing securely by returning a generic error message and a 500 status code to avoid leaking senstive information
        }
        results.length > 0 ? res.send('Login succeeded') : res.send('Login failed');
    });
});

// Transactions route
app.post('/transactions', (req, res) => {
    console.log('Transactions route hit'); // Logs when the route is accessed.
    const { serial_number, isbn, user_id, check_status, date_loaned, date_retrned } = req.body;
    // Secure SQL query using parameterized statements
    const query = `SELECT * FROM transactions WHERE serial_number = ? AND isbn = ? AND user_id = ? AND check_status = ? AND date_loaned = ? AND date_returned = ?`; // Placeholders, ?s, tells MySQL I will be using a parameter here. 
    connection.query(query, [serial_number, isbn, user_id, check_status, date_loaned, date_retrned], (error, results) => { // Adding variables, username and passwords, to determine the parameter values
        if (error) {
            console.error('Error executing query:', error); // Log the error internally and respond with a generic message
            return res.status(500).send('Server error'); // Failing securely by returning a generic error message and a 500 status code to avoid leaking senstive information
        }
        results.length > 0 ? res.send('Login succeeded') : res.send('Login failed');
    });
});


// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});