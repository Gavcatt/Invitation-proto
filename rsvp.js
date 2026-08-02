const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbybUUHfF1dsXjMOCckDWSExHKbrQAzFajNgaLyQ80dvRpb5B5tFLr0KfsPelXnV9CO6/exec';

const codeInput = document.getElementById('rsvp-code');
const lookupBtn = document.getElementById('lookup-btn');
const codeMessage = document.getElementById('code-message');

const formSection = document.getElementById('form-section');
const guestDisplayName = document.getElementById('guest-display-name');
const maxGuestsText = document.getElementById('max-guests-text');
const guestBlocksContainer = document.getElementById('guest-blocks');
const rsvpForm = document.getElementById('rsvp-form');
const formMessage = document.getElementById('form-message');

const ROOM_REQUIRED_OPTIONS = [
  { value: 'no', label: 'No' },
  { value: 'yes', label: 'Yes' }
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
  
  formSection.style.setProperty('display', 'none', 'important');
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
    .then(res => {
      if (!res.ok) throw new Error('Network response failure');
      return res.json();
    })
    .then(data => {
      if (!data.success) {
        showMessage(codeMessage, data.message || 'Code not recognised.', 'error');
        return;
      }

      currentCode = data.code;
      currentMaxGuests = data.maxGuests || 1;

      guestDisplayName.textContent = data.displayName || 'Your party';
      maxGuestsText.textContent = currentMaxGuests;

      buildGuestBlocks(currentMaxGuests, data.prepopulatedNames || [], data.originalIndexes || []);
      
      formSection.style.setProperty('display', 'block', 'important');
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

function buildGuestBlocks(maxGuests, prepopulatedNames = [], originalIndexes = []) {
  guestBlocksContainer.innerHTML = '';

  for (let i = 1; i <= maxGuests; i++) {
    const block = document.createElement('div');
    block.className = 'guest-block';

    const defaultName = prepopulatedNames[i - 1] || '';
    const trueSeatIndex = originalIndexes[i - 1] || i;

    block.innerHTML = `
      <div class="guest-block-header">
        Guest ${trueSeatIndex}
      </div>
      
      <div class="guest-grid">
        <div>
          <label class="field-label" for="guest-name-${i}">Name</label>
          <input type="hidden" id="guest-seat-marker-${i}" value="${trueSeatIndex}" />
          <input type="text" id="guest-name-${i}" class="text-input" placeholder="Full Name" value="${defaultName}" />
        </div>
        <div>
          <label class="field-label" for="guest-attending-${i}">Attending</label>
          <select id="guest-attending-${i}" class="select-input">
            <option value="">-- Select --</option>
            <option value="yes">Yes, with pleasure</option>
            <option value="no">No, regrettably</option>
          </select>
        </div>
        <div>
          <label class="field-label" for="guest-room-${i}">Room required</label>
          <select id="guest-room-${i}" class="select-input">
            ${ROOM_REQUIRED_OPTIONS.map(opt => `<option value="${opt.value}">${opt.label}</option>`).join('')}
          </select>
        </div>
        <div>
          <label class="field-label" for="guest-room-count-${i}">How many rooms?</label>
          <select id="guest-room-count-${i}" class="select-input">
            <option value="0">0</option>
            <option value="1">1</option>
            <option value="2">2</option>
          </select>
        </div>
      </div>
      <div style="margin-top: 1.2rem;">
        <label class="field-label" for="guest-dietary-${i}">Dietary Notes & Allergies</label>
        <textarea id="guest-dietary-${i}" class="textarea-input" placeholder="Please note any allergies or specific dietary requirements..."></textarea>
      </div>
    `;

    const roomSelect = block.querySelector(`#guest-room-${i}`);
    const roomCountSelect = block.querySelector(`#guest-room-count-${i}`);

    function syncRoomCountState() {
      const needsRoom = roomSelect?.value === 'yes';
      if (roomCountSelect) {
        roomCountSelect.disabled = !needsRoom;
        if (!needsRoom && roomCountSelect.value !== '0') {
          roomCountSelect.value = '0';
        }
      }
    }

    roomSelect?.addEventListener('change', syncRoomCountState);
    syncRoomCountState();

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

  const guests = [];
  for (let i = 1; i <= currentMaxGuests; i++) {
    const attendingEl = document.getElementById(`guest-attending-${i}`);
    if (!attendingEl) continue;

    const attendingValue = attendingEl.value;
    if (attendingValue === "") {
      continue; 
    }

    const nameEl = document.getElementById(`guest-name-${i}`);
    const nameVal = nameEl ? nameEl.value.trim() : '';
    if (!nameVal) continue;

    const seatMarkerEl = document.getElementById(`guest-seat-marker-${i}`);
    const absoluteSeatIndex = seatMarkerEl ? Number(seatMarkerEl.value) : i;

    const roomSelectEl = document.getElementById(`guest-room-${i}`);
    const roomCountEl = document.getElementById(`guest-room-count-${i}`);
    const needsRoom = roomSelectEl ? roomSelectEl.value === 'yes' : false;
    const roomCountValue = needsRoom ? Math.min(Number(roomCountEl?.value || 0), 2) : 0;

    guests.push({
      originalIndex: absoluteSeatIndex, 
      name: nameVal,
      attending: attendingValue === 'yes',
      roomRequired: needsRoom,
      roomCount: roomCountValue,
      dietary: document.getElementById(`guest-dietary-${i}`).value.trim()
    });
  }

  if (guests.length === 0) {
    showMessage(formMessage, 'Please select the "Attending" status for at least one guest before submitting.', 'error');
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
    return;
  }

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

      const wantsRoom = guests.some(guest => guest.roomRequired && guest.roomCount > 0);
      if (wantsRoom) {
        window.location.href = `room-booking.html?code=${encodeURIComponent(currentCode)}`;
        return;
      }

      document.querySelector('.rsvp-header').style.setProperty('display', 'none', 'important');
      formSection.style.setProperty('display', 'none', 'important');
      rsvpForm.reset();
      const successSection = document.getElementById('success-section');
      successSection.style.setProperty('display', 'block', 'important');
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

function showMessage(element, text, type) {
  if (!element) return;
  element.textContent = text;
  element.className = type ? `message ${type}` : 'message';
  
  if (type === 'error') {
    element.style.setProperty('color', '#8f2c4b', 'important');
  } else if (type === 'success') {
    element.style.setProperty('color', '#133916', 'important');
  }
}

function clearMessage(element) {
  if (!element) return;
  element.textContent = '';
  element.className = 'message';
}