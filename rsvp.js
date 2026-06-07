const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzvbla9fRb6D-wCxQ6AuaoY2ikKweqJp02uuJkrrYXOprgYFPimb0RjVdFNJ3G4KjPq/exec'
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
    headers: { 'Content-Type': 'application/json' },
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

  const guests = [];

  for (let i = 1; i <= currentMaxGuests; i++) {
    const nameEl = document.getElementById(`guest-name-${i}`);
    const attendingEl = document.getElementById(`guest-attending-${i}`);
    const menuEl = document.getElementById(`guest-menu-${i}`);
    const dietaryEl = document.getElementById(`guest-dietary-${i}`);

    const name = nameEl.value.trim();
    if (!name) continue; // skip unused

    const attending = attendingEl.value === 'yes';

    guests.push({
      name,
      attending,
      menu: menuEl.value,
      dietary: dietaryEl.value.trim()
    });
  }

  if (!guests.length) {
    showMessage(formMessage, 'Please enter at least one guest name.', 'error');
    return;
  }

  const submitBtn = rsvpForm.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Submitting...';

  fetch(SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'submit',
      code: currentCode,
      guests
    })
  })
    .then(res => res.json())
    .then(data => {
      if (!data.success) {
        showMessage(formMessage, data.message || 'There was a problem submitting your RSVP.', 'error');
        return;
      }

      showMessage(formMessage, 'Thank you! Your RSVP has been recorded.', 'success');
      rsvpForm.reset();
      formSection.classList.add('hidden');
    })
    .catch(err => {
      console.error(err);
      showMessage(formMessage, 'Error contacting server.', 'error');
    })
    .finally(() => {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit RSVP';
    });
}

function showMessage(el, text, type) {
  el.textContent = text || '';
  el.classList.remove('error', 'success');
  if (type) el.classList.add(type);
}

function clearMessage(el) {
  el.textContent = '';
  el.classList.remove('error', 'success');
}

