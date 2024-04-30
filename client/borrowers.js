document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const user_id = document.getElementById('user_id').value;
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const phone_number = document.getElementById('phone_number').value;

    fetch('http://localhost:3000/borrowers', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id, username, email, phone_number }),
    })
    .then(response => response.text())
    .then(data => alert(data))
    .catch(error => console.error('Error:', error));
});