const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz2emF4Qozg-UByShIsUQGmZhZlSiReNepKhacLGGDL0k85_BVf9nhoTSbKb1lKFyTJ/exec';

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

      buildGuestBlocks(currentMaxGuests, data.prepopulatedNames || []);
      
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

function buildGuestBlocks(maxGuests, prepopulatedNames = []) {
  guestBlocksContainer.innerHTML = '';

  for (let i = 1; i <= maxGuests; i++) {
    const block = document.createElement('div');
    block.className = 'guest-block';
    block.style.margin = '1.5rem 0';
    block.style.padding = '1.2rem';
    block.style.border = '1px solid rgba(0,0,0,0.1)';
    block.style.borderRadius = '12px';
    block.style.backgroundColor = 'rgba(255,255,255,0.5)';

    const defaultName = prepopulatedNames[i - 1] || '';

    block.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 1px dashed rgba(0,0,0,0.1);">
        <div style="font-weight: 700; color: #1a1a1a;">Guest ${i}</div>
        
        <!-- ⚠️ NEW: Inclusion toggle checkbox to select who is submitting right now -->
        <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; cursor: pointer; color: #133916; font-weight: 600;">
          <input type="checkbox" id="guest-submit-toggle-${i}" style="width: 16px; height: 16px; accent-color: #133916;" ${i === 1 ? 'checked' : ''} />
          Respond for this guest
        </label>
      </div>
      
      <div class="guest-fields-wrapper-${i}" style="transition: opacity 0.3s ease;">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
          <div>
            <label style="display: block; font-size: 0.85rem; margin-bottom: 0.3rem; color:#4a4a4a;" for="guest-name-${i}">Name</label>
            <input type="text" id="guest-name-${i}" style="width:100%; padding: 0.6rem; border: 1px solid #ccc; border-radius: 6px; background-color: #fff;" value="${defaultName}" />
          </div>
          <div>
            <label style="display: block; font-size: 0.85rem; margin-bottom: 0.3rem; color:#4a4a4a;" for="guest-attending-${i}">Attending</label>
            <select id="guest-attending-${i}" style="width:100%; padding: 0.6rem; border: 1px solid #ccc; border-radius: 6px; background-color: #fff;">
              <option value="yes">Yes, with pleasure</option>
              <option value="no">No, regrettably</option>
            </select>
          </div>
          <div>
            <label style="display: block; font-size: 0.85rem; margin-bottom: 0.3rem; color:#4a4a4a;" for="guest-menu-${i}">Menu Preference</label>
            <select id="guest-menu-${i}" style="width:100%; padding: 0.6rem; border: 1px solid #ccc; border-radius: 6px; background-color: #fff;">
              ${MENU_OPTIONS.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
            </select>
          </div>
        </div>
        <div style="margin-top: 1rem;">
          <label style="display: block; font-size: 0.85rem; margin-bottom: 0.3rem; color:#4a4a4a;" for="guest-dietary-${i}">Dietary Notes & Allergies</label>
          <textarea id="guest-dietary-${i}" style="width:100%; height: 60px; padding: 0.6rem; border: 1px solid #ccc; border-radius: 6px; background-color: #fff; resize: vertical;" placeholder="Please note any allergies or specific requirements..."></textarea>
        </div>
      </div>
    `;

    guestBlocksContainer.appendChild(block);

    // Simple visual helper: dim fields if the user unchecks "Respond for this guest"
    const toggle = block.querySelector(`#guest-submit-toggle-${i}`);
    const wrapper = block.querySelector(`.guest-fields-wrapper-${i}`);
    toggle.addEventListener('change', () => {
      wrapper.style.opacity = toggle.checked ? '1' : '0.35';
    });
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
    // ⚠️ LOOK HERE: Check if the checkbox toggle for this specific guest row is active
    const isIncluded = document.getElementById(`guest-submit-toggle-${i}`).checked;
    if (!isIncluded) continue; // Instantly skips this guest block row completely!

    const el = document.getElementById(`guest-name-${i}`);
    if (!el) continue;
    const nameVal = el.value.trim();
    if (!nameVal) continue;

    guests.push({
      name: nameVal,
      attending: document.getElementById(`guest-attending-${i}`).value === 'yes',
      menu: document.getElementById(`guest-menu-${i}`).value,
      dietary: document.getElementById(`guest-dietary-${i}`).value.trim()
    });
  }

  if (guests.length === 0) {
    showMessage(formMessage, 'Please select at least one guest checkbox to submit an RSVP.', 'error');
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
      showMessage(formMessage, 'Your RSVP has been successfully submitted!', 'success');
      rsvpForm.reset();
      formSection.style.setProperty('display', 'none', 'important');
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
  element.style.color = type === 'error' ? '#8f2c4b' : '#133916';
}

function clearMessage(element) {
  if (!element) return;
  element.textContent = '';
  element.className = 'message';
}
