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

