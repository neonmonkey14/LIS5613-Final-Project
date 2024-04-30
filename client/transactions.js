document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const serial_number = document.getElementById('serial_number').value;
    const isbn = document.getElementById('isbn').value;
    const user_id = document.getElementById('user_id').value;
    const check_status = document.getElementById('check_status').value;
    const date_loaned = document.getElementById('date_loaned').value;
    const date_returned = document.getElementById('date_returned').value;

    fetch('http://localhost:3000/transactions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ serial_number, isbn, user_id, check_status, date_loaned, date_returned }),
    })
    .then(response => response.text())
    .then(data => alert(data))
    .catch(error => console.error('Error:', error));
});