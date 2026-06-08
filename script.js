/* -------------------------------------------------------
   GUEST NAME FROM URL PARAM
------------------------------------------------------- */
const params = new URLSearchParams(window.location.search);
const rawGuest = params.get("guest") || "Friend";
const guestName = rawGuest.replace(/\+/g, " ").trim() || "Friend";
const guestNameElement = document.getElementById("guestName");

if (guestNameElement) {
  guestNameElement.textContent = guestName;
}

/* -------------------------------------------------------
   ENVELOPE OPEN
------------------------------------------------------- */
function openEnvelope() {
  const envelope = document.getElementById("envelope");
  if (envelope) envelope.classList.add("open");
  document.body.classList.add("invitation-open");
}

// Called by the onclick on the envelope shell in HTML
function openInvitationFromEnvelope() {
  if (document.body.classList.contains("invitation-open")) return;
  openEnvelope();
  const hint = document.getElementById("tapHint");
  if (hint) hint.style.display = "none";
  const shell = document.getElementById("envelopeShell");
  if (shell) shell.onclick = null;
}

/* -------------------------------------------------------
   COUNTDOWN TIMER
------------------------------------------------------- */
function initWeddingCountdown() {
  const targetDate = new Date("February 28, 2027 12:30:00").getTime();

  const daysEl    = document.getElementById("days");
  const hoursEl   = document.getElementById("hours");
  const minsEl    = document.getElementById("minutes");
  const secsEl    = document.getElementById("seconds");

  function updateTimer() {
    if (!daysEl || !hoursEl || !minsEl || !secsEl) return;

    const distance = targetDate - Date.now();

    if (distance < 0) {
      clearInterval(timerInterval);
      const shell = document.getElementById("countdownShell");
      if (shell) shell.innerHTML = "<div class='countdown-title' style='color:#133916; font-size:1rem; padding:1rem 0;'>The Wedding Day Has Arrived! ♡</div>";
      return;
    }

    daysEl.textContent  = Math.floor(distance / (1000 * 60 * 60 * 24));
    hoursEl.textContent = Math.floor((distance / (1000 * 60 * 60)) % 24).toString().padStart(2, "0");
    minsEl.textContent  = Math.floor((distance / (1000 * 60)) % 60).toString().padStart(2, "0");
    secsEl.textContent  = Math.floor((distance / 1000) % 60).toString().padStart(2, "0");
  }

  updateTimer();
  const timerInterval = setInterval(updateTimer, 1000);
}

document.addEventListener("DOMContentLoaded", initWeddingCountdown);