const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwhIoQmmdarSQysREZx_KhaLKW-qw9U2Fj0JTI7vfVZvy-3k5A8lVHXkxGEJNChX2d0/exec';

const codeInput = document.getElementById('rsvp-code');
const lookupBtn = document.getElementById('lookup-btn');
const codeMessage = document.getElementById('code-message');

const formSection = document.getElementById('form-section');
const guestDisplayName = document.getElementById('guest-display-name');
const maxGuestsText = document.getElementById('max-guests-text');
const guestBlocksContainer = document.getElementById('guest-blocks');
const rsvpForm = document.getElementById('rsvp-form');
const formMessage = document.getElementById('form-message');

const MENU_OPTIONS = [
  'Chicken',
  'Beef',
  'Vegetarian',
  'Vegan',
  'Child’s Meal',
  'Other'
];

let currentCode = null;
let currentMaxGuests = 0;

lookupBtn.addEventListener('click', handleLookup);
codeInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    handleLookup();
  }
});

rsvpForm.addEventListener('submit', handleSubmit);

function handleLookup() {
  clearMessage(codeMessage);
  clearMessage(formMessage);
  formSection.classList.add('hidden');
  guestBlocksContainer.innerHTML = '';

  const code = codeInput.value.trim().toUpperCase();
  if (!code) {
    showMessage(codeMessage, 'Please enter your RSVP code.', 'error');
    return;
  }

  lookupBtn.disabled = true;
  lookupBtn.textContent = 'Checking...';

  fetch(SCRIPT_URL, {
    method: 'POST',
    mode: 'cors',
    redirect: 'follow',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action: 'lookup', code })
  })
    .then(res => res.json())
    .then(data => {
      if (!data.success) {
        showMessage(codeMessage, data.message || 'Code not recognised.', 'error');
        return;
      }

      currentCode = data.code;
      currentMaxGuests = data.maxGuests || 1;

      guestDisplayName.textContent = data.displayName || 'Your party';
      maxGuestsText.textContent = currentMaxGuests;

      buildGuestBlocks(currentMaxGuests);
      formSection.classList.remove('hidden');
      showMessage(codeMessage, '', null);
    })
    .catch(err => {
      console.error(err);
      showMessage(codeMessage, 'Error contacting server.', 'error');
    })
    .finally(() => {
      lookupBtn.disabled = false;
      lookupBtn.textContent = 'Continue';
    });
}

function buildGuestBlocks(maxGuests) {
  guestBlocksContainer.innerHTML = '';

  for (let i = 1; i <= maxGuests; i++) {
    const block = document.createElement('div');
    block.className = 'guest-block';

    block.innerHTML = `
      <div class="guest-block-header">
        <div class="guest-block-title">Guest ${i}</div>
        <div class="guest-block-note">Leave blank if not used</div>
      </div>
      <div class="guest-grid">
        <div>
          <label class="field-label" for="guest-name-${i}">Name</label>
          <input type="text" id="guest-name-${i}" class="text-input" placeholder="Guest ${i} name" />
        </div>
        <div>
          <label class="field-label" for="guest-attending-${i}">Attending</label>
          <select id="guest-attending-${i}" class="select-input">
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>
        <div>
          <label class="field-label" for="guest-menu-${i}">Menu preference</label>
          <select id="guest-menu-${i}" class="select-input">
            ${MENU_OPTIONS.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
          </select>
        </div>
        <div class="guest-grid-full">
          <label class="field-label" for="guest-dietary-${i}">Dietary notes</label>
          <textarea id="guest-dietary-${i}" class="textarea-input" placeholder="Allergies, intolerances, or other notes"></textarea>
        </div>
      </div>
    `;

    guestBlocksContainer.appendChild(block);
  }
}

function handleSubmit(e) {
  e.preventDefault();
  clearMessage(formMessage);

  if (!currentCode || !currentMaxGuests) {
    showMessage(formMessage, 'Please enter your RSVP code first.', 'error');
    return;
  }

  const submitBtn = rsvpForm.querySelector('button[type="submit"]') || { disabled: false, textContent: '' };
  submitBtn.disabled = true;
  const originalText = submitBtn.textContent;
  submitBtn.textContent = 'Submitting...';

  // Gather up the dynamic values from your guest input slots
  const guests = [];
  for (let i = 1; i <= currentMaxGuests; i++) {
    const nameVal = document.getElementById(`guest-name-${i}`).value.trim();
    if (!nameVal) continue; // Skips unfilled text records seamlessly

    guests.push({
      name: nameVal,
      attending: document.getElementById(`guest-attending-${i}`).value === 'yes',
      menu: document.getElementById(`guest-menu-${i}`).value,
      dietary: document.getElementById(`guest-dietary-${i}`).value.trim()
    });
  }

  if (guests.length === 0) {
    showMessage(formMessage, 'Please enter at least one guest name.', 'error');
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
    return;
  }

  // Uses the fixed text/plain transport wrapper setup to cross Google's firewall
  fetch(SCRIPT_URL, {
    method: 'POST',
    mode: 'cors',
    redirect: 'follow',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action: 'submit', code: currentCode, guests })
  })
    .then(res => res.json())
    .then(data => {
      if (!data.success) {
        showMessage(formMessage, data.message || 'Submission error.', 'error');
        return;
      }
      showMessage(formMessage, 'Your RSVP has been successfully submitted!', 'success');
      rsvpForm.reset();
      formSection.classList.add('hidden');
    })
    .catch(err => {
      console.error(err);
      showMessage(formMessage, 'Error submitting form data.', 'error');
    })
    .finally(() => {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    });
}

// Global UI feedback display functions
function showMessage(element, text, type) {
  if (!element) return;
  element.textContent = text;
  element.className = type ? `message ${type}` : 'message';
}

function clearMessage(element) {
  if (!element) return;
  element.textContent = '';
  element.className = 'message';
}