// Handles the login form: sends data to the backend, redirects to homepage on success
document.getElementById('loginForm').addEventListener('submit', async (event) => {
  event.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  const messageEl = document.getElementById('loginMessage');

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok) {
      window.location.href = 'home.html';
    } else {
      messageEl.textContent = data.message;
    }
  } catch (error) {
    messageEl.textContent = 'Something went wrong. Please try again.';
  }
});
