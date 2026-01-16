document.addEventListener('DOMContentLoaded', () => {
  const slides = document.querySelectorAll('.slide');
  const nextButton = document.getElementById('next');
  const prevButton = document.getElementById('prev');
  const slideCounter = document.getElementById('slide-counter');
  let currentSlide = 0;

  function showSlide(index) {
    // Remove active class from all slides
    slides.forEach(slide => {
      slide.classList.remove('active');
    });

    // Add active class to the current slide
    slides[index].classList.add('active');

    // Update counter
    if (slideCounter) {
      slideCounter.textContent = `${index + 1} / ${slides.length}`;
    }

    // Update button states
    if (prevButton) {
      prevButton.disabled = index === 0;
    }
    if (nextButton) {
      nextButton.disabled = index === slides.length - 1;
    }
    currentSlide = index;
  }

  function next() {
    if (currentSlide < slides.length - 1) {
      showSlide(currentSlide + 1);
    }
  }

  function prev() {
    if (currentSlide > 0) {
      showSlide(currentSlide - 1);
    }
  }

  // Event Listeners for buttons
  if (nextButton) {
    nextButton.addEventListener('click', next);
  }
  if (prevButton) {
    prevButton.addEventListener('click', prev);
  }

  // Event Listener for keyboard
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault(); // Prevent default browser action
      next();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault(); // Prevent default browser action
      prev();
    }
  });

  // Show the first slide initially
  showSlide(0);
});
