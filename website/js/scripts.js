// scripts.js
// This file contains the client‑side functionality for the personal
// website including mobile navigation toggling and a simple lightbox
// for viewing gallery images. Written in vanilla JS to avoid
// dependencies.

document.addEventListener('DOMContentLoaded', () => {
  // Mobile navigation toggle
  const hamburger = document.querySelector('.hamburger');
  const navList   = document.querySelector('.navbar ul');
  if (hamburger && navList) {
    hamburger.addEventListener('click', () => {
      navList.classList.toggle('show');
      // Animate hamburger into an 'X'
      hamburger.classList.toggle('active');
    });
  }

  // Lightbox functionality for gallery images
  const lightbox = document.getElementById('lightbox');
  const lightboxImage = lightbox ? lightbox.querySelector('img') : null;
  const galleryImages = document.querySelectorAll('.gallery-grid img');
  if (lightbox && lightboxImage && galleryImages.length > 0) {
    galleryImages.forEach(img => {
      img.addEventListener('click', () => {
        lightboxImage.src = img.src;
        lightbox.style.display = 'flex';
      });
    });
    lightbox.addEventListener('click', () => {
      lightbox.style.display = 'none';
    });
  }
});