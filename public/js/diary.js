// Fetches the logged-in user's own posts and displays them with Edit/Delete controls
async function loadMyPosts() {
  const container = document.getElementById('myPostsContainer');

  try {
    const response = await fetch('/api/posts/mine');

    if (response.status === 401) {
      window.location.href = 'login.html';
      return;
    }

    const posts = await response.json();

    if (posts.length === 0) {
      container.textContent = "You haven't posted anything yet.";
      return;
    }

    posts.forEach(post => {
      const postEl = document.createElement('div');
      postEl.classList.add('post');

      postEl.innerHTML = `
        <img src="uploads/${post.photo}" alt="Travel Photo" class="post-photo">
        <p>${post.description}</p>
        <p><em>${new Date(post.travelDate).toLocaleDateString()}</em></p>
        <div class="post-actions">
          <a href="create-post.html?id=${post._id}">Edit</a>
          <button class="deleteBtn" data-id="${post._id}">Delete</button>
        </div>
      `;

      container.appendChild(postEl);
    });

    // Attach a click handler to every delete button just created
    document.querySelectorAll('.deleteBtn').forEach(button => {
      button.addEventListener('click', async () => {
        const confirmed = confirm('Delete this post? This cannot be undone.');
        if (!confirmed) return;

        const postId = button.dataset.id;
        try {
          const response = await fetch(`/api/posts/${postId}`, { method: 'DELETE' });
          if (response.ok) {
            window.location.reload();
          } else {
            alert('Could not delete this post. Please try again.');
          }
        } catch (error) {
          alert('Something went wrong. Please check your connection and try again.');
        }
      });
    });
  } catch (error) {
    container.textContent = 'Could not load your posts.';
  }
}

loadMyPosts();

