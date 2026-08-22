// Fetches all travel posts from the backend and displays them on the homepage
async function loadPosts() {
  const container = document.getElementById('postsContainer');

  try {
    const response = await fetch('/api/posts');
    const posts = await response.json();

    if (posts.length === 0) {
      container.textContent = 'No travel posts yet.';
      return;
    }

    posts.forEach(post => {
      const postEl = document.createElement('div');
      postEl.classList.add('post');

      postEl.innerHTML = `
        <img src="uploads/${post.photo}" alt="Travel Photo" class="post-photo">
        <h3>${post.user.username}</h3>
        <p>${post.description}</p>
        <p><em>${new Date(post.travelDate).toLocaleDateString()}</em></p>
      `;

      container.appendChild(postEl);
    });
  } catch (error) {
    container.textContent = 'Could not load posts.';
  }
}

// Checks whether the visitor is logged in, and updates the nav + welcome message accordingly
async function checkLoginStatus() {
  const welcomeMessage = document.getElementById('welcomeMessage');
  const newPostLink = document.getElementById('newPostLink');
  const profileLink = document.getElementById('profileLink');
  const registerLink = document.getElementById('registerLink');
  const loginLink = document.getElementById('loginLink');
  const logoutLink = document.getElementById('logoutLink');

  try {
    const response = await fetch('/api/auth/me');

    if (response.ok) {
      const data = await response.json();
      profileLink.style.display = 'inline';
      welcomeMessage.textContent = `Welcome back, ${data.username}!`;

      newPostLink.style.display = 'inline';
      logoutLink.style.display = 'inline';
      registerLink.style.display = 'none';
      loginLink.style.display = 'none';
    }
  } catch (error) {
    // If the check itself fails (e.g. server unreachable), just leave the logged-out nav showing
  }
}

// Displays today's date in a readable format
function displayDate() {
  const dateEl = document.getElementById('todayDate');
  const today = new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  dateEl.textContent = today.toLocaleDateString('en-US', options);
}

// Asks the browser for the visitor's location, then fetches weather/place name from our backend
function loadWeather() {
  const weatherEl = document.getElementById('locationWeather');

  if (!navigator.geolocation) {
    weatherEl.textContent = 'Location not supported by your browser.';
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      try {
        const response = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
        const data = await response.json();
        weatherEl.textContent = `${data.city}, ${data.country} — ${data.temperature}°C, ${data.condition}`;
      } catch (error) {
        weatherEl.textContent = 'Could not load weather.';
      }
    },
    () => {
      weatherEl.textContent = 'Location access denied.';
    }
  );
}

// Logs the user out, then reloads the page so the nav switches back to the logged-out view
document.getElementById('logoutLink').addEventListener('click', async (event) => {
  event.preventDefault();
  await fetch('/api/auth/logout', { method: 'POST' });
  window.location.reload();
});

checkLoginStatus();
loadPosts();
displayDate();
loadWeather();

