// Handles the register form: sends data to the backend instead of a normal page reload
document.getElementById('registratForm').addEventListener('submit', async (event) => {
  event.preventDefault();

  const username = document.getElementById('username').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  const messageEl = document.getElementById('registerMessage');

  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });

    const data = await response.json();

    if (response.ok) {
        window.location.href = 'index.html';
    } else {
      messageEl.textContent = data.message;
    }
  } catch (error) {
    messageEl.textContent = 'Something went wrong. Please try again.';
  }
});
