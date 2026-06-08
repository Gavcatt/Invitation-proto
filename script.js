const params = new URLSearchParams(window.location.search);
const rawGuest = params.get("guest") || "Friend";
const guestName = rawGuest.replace(/\+/g, " ").trim() || "Friend";
const guestNameElement = document.getElementById("guestName");
const openButton = document.getElementById("openButton");
const envelope = document.getElementById("envelope");
const rsvpForm = document.getElementById("rsvpForm");
const successMessage = document.getElementById("successMessage");

if (guestNameElement) {
  guestNameElement.textContent = guestName;
}

function openEnvelope() {
  if (envelope) {
    envelope.classList.add("open");
  }
  document.body.classList.add("invitation-open");
}

function handleRsvpSubmit(event) {
  event.preventDefault();
  if (!rsvpForm) return;

  const formData = new FormData(rsvpForm);
  const submission = {
    submittedAt: new Date().toISOString(),
    fullName: formData.get("fullName") || "",
    email: formData.get("email") || "",
    attending: formData.get("attending") || "",
    guests: formData.get("guests") || "",
    dietary: formData.get("dietary") || "",
    message: formData.get("message") || "",
  };

  const stored = JSON.parse(localStorage.getItem("wedding-rsvps") || "[]");
  stored.push(submission);
  localStorage.setItem("wedding-rsvps", JSON.stringify(stored));

  if (successMessage) {
    successMessage.hidden = false;
  }

  rsvpForm.reset();
}

if (openButton) {
  openButton.addEventListener("click", openEnvelope);
}

if (rsvpForm) {
  rsvpForm.addEventListener("submit", handleRsvpSubmit);
}
/* -------------------------------------------------------
   LIVE WEDDING COUNTDOWN TIMER ENGINE
------------------------------------------------------- */
function initWeddingCountdown() {
  // Target Time Setup: 28 February 2027 at 12:30 PM (Greenwich Mean Time)
  const targetDate = new Date('February 28, 2027 12:30:00').getTime();

  function updateTimer() {
    const now = new Date().getTime();
    const distance = targetDate - now;

    // Capture layout DOM tracking objects
    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minsEl = document.getElementById('minutes');
    const secsEl = document.getElementById('seconds');

    // Safe protection check if timer is running out of frame
    if (!daysEl || !hoursEl || !minsEl || !secsEl) return;

    // If the target timestamp has been reached
    if (distance < 0) {
      clearInterval(timerInterval);
      document.getElementById('countdownShell').innerHTML = "<div class='countdown-title' style='color:#133916; font-size:1rem;'>The Wedding Day Has Arrived!</div>";
      return;
    }

    // Precise time math conversions
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    // Dynamic UI feedback loop injection
    daysEl.textContent = days;
    hoursEl.textContent = hours.toString().padStart(2, '0');
    minsEl.textContent = minutes.toString().padStart(2, '0');
    secsEl.textContent = seconds.toString().padStart(2, '0');
  }

  // Update timer instantly on load, then evaluate loop ticks every 1 second
  updateTimer();
  const timerInterval = setInterval(updateTimer, 1000);
}

// Inits execution naturally when the document builds
document.addEventListener('DOMContentLoaded', initWeddingCountdown);

