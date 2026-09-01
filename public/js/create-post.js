// Reads the ?id= query parameter, if present, to determine whether we're editing an existing post
const params = new URLSearchParams(window.location.search);
const postId = params.get('id');

// If editing, pre-fill the form with the existing post's data
// Prevent selecting a future date in the date picker
document.getElementById('travelDate').max = new Date().toISOString().split('T')[0];

if (postId) {
  document.getElementById('formTitle').textContent = 'Edit Your Travel Memory';
  document.getElementById('photoHint').textContent = 'Leave empty to keep your current photo.';

  fetch(`/api/posts/${postId}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Post not found');
      }
      return response.json();
    })
    .then(post => {
      document.getElementById('description').value = post.description;
      document.getElementById('travelDate').value = post.travelDate.split('T')[0];
    })
    .catch(() => {
      document.getElementById('postMessage').textContent = 'Could not load this post.';
    });
}

// Handles the create/edit post form: sends data to the backend, redirects on success
document.getElementById('createPostForm').addEventListener('submit', async (event) => {
  event.preventDefault();

  const submitBtn = event.target.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Posting...';

  const photoFiles = document.getElementById('photos').files;
  const description = document.getElementById('description').value;
  const travelDate = document.getElementById('travelDate').value;

  const messageEl = document.getElementById('postMessage');

  if (!postId && photoFiles.length === 0) {
    messageEl.textContent = 'Please select at least one photo.';
    submitBtn.disabled = false;
    submitBtn.textContent = 'Post';
    return;
  }

  const formData = new FormData();
  for (const file of photoFiles) {
    formData.append('photos', file);
  }
  formData.append('description', description);
  formData.append('travelDate', travelDate);

  try {
    const url = postId ? `/api/posts/${postId}` : '/api/posts';
    const method = postId ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method: method,
      body: formData
    });

    const data = await response.json();

    if (response.ok) {
      window.location.href = 'diary.html';
    } else {
      messageEl.textContent = data.message;
      submitBtn.disabled = false;
      submitBtn.textContent = 'Post';
    }
  } catch (error) {
    messageEl.textContent = 'Something went wrong. Please try again.';
    submitBtn.disabled = false;
    submitBtn.textContent = 'Post';
  }
});
