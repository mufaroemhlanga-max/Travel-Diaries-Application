// A reusable full-screen photo viewer. Any page can call openPhotoModal(photosArray, options) to launch it.
// options.postId + options.canDelete enable a "delete this photo" button (used on My Diary, not the public homepage).

let currentPhotos = [];
let currentIndex = 0;
let currentPostId = null;
let canDelete = false;

// Build the modal once and attach it to the page (hidden until needed)
const modal = document.createElement('div');
modal.classList.add('photo-modal', 'hidden');
modal.innerHTML = `
  <button class="modal-close">&times;</button>
  <button class="modal-arrow modal-prev">&#8249;</button>
  <img class="modal-photo" src="" alt="Travel Photo">
  <button class="modal-arrow modal-next">&#8250;</button>
  <button class="modal-delete-photo hidden">🗑 Delete this photo</button>
`;
document.body.appendChild(modal);

const modalPhoto = modal.querySelector('.modal-photo');
const modalDeleteBtn = modal.querySelector('.modal-delete-photo');

function showCurrentPhoto() {
  modalPhoto.src = `uploads/${currentPhotos[currentIndex]}`;
}

function openPhotoModal(photos, options = {}) {
  currentPhotos = photos;
  currentIndex = 0;
  currentPostId = options.postId || null;
  canDelete = Boolean(options.canDelete);

  modalDeleteBtn.classList.toggle('hidden', !canDelete);

  showCurrentPhoto();
  modal.classList.remove('hidden');
}

function closePhotoModal() {
  modal.classList.add('hidden');
}

modal.querySelector('.modal-close').addEventListener('click', closePhotoModal);

// Clicking the dark backdrop (not the photo or arrows) also closes it
modal.addEventListener('click', (event) => {
  if (event.target === modal) closePhotoModal();
});

modal.querySelector('.modal-prev').addEventListener('click', () => {
  currentIndex = (currentIndex - 1 + currentPhotos.length) % currentPhotos.length;
  showCurrentPhoto();
});

modal.querySelector('.modal-next').addEventListener('click', () => {
  currentIndex = (currentIndex + 1) % currentPhotos.length;
  showCurrentPhoto();
});

modalDeleteBtn.addEventListener('click', async () => {
  if (currentPhotos.length === 1) {
    alert('A post must have at least one photo. Delete the whole post from My Diary instead.');
    return;
  }

  const confirmed = confirm('Delete this photo? This cannot be undone.');
  if (!confirmed) return;

  try {
    const response = await fetch(`/api/posts/${currentPostId}/photos/${currentIndex}`, { method: 'DELETE' });
    if (response.ok) {
      window.location.reload();
    } else {
      alert('Could not delete this photo. Please try again.');
    }
  } catch (error) {
    alert('Something went wrong. Please check your connection and try again.');
  }
});
