const form = document.getElementById('bookingForm');
const lookupBtn = document.getElementById('lookupBtn');
const addressResult = document.getElementById('addressResult');
const slotsDiv = document.getElementById('slots');
const privacyLink = document.getElementById('privacyLink');
const privacy = document.getElementById('privacy');
const closePrivacy = document.getElementById('closePrivacy');
let selectedSlot = null;

lookupBtn.addEventListener('click', async () => {
  const postcode = document.getElementById('postcode').value.trim().toUpperCase().replace(/\s+/g, ' ');
  if (!postcode) return;
  addressResult.textContent = 'Looking up...';
  try {
    const res = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(postcode)}`);
    const data = await res.json();
    if (data.status === 200) {
      const r = data.result;
      addressResult.innerHTML = `<strong>${r.postcode}</strong><br>${r.admin_district}, ${r.region}<br>Lat: ${r.latitude}, Lng: ${r.longitude}`;
      document.getElementById('step2').style.display = 'block';
      generateSlots();
    } else {
      addressResult.textContent = 'Postcode not found. Please check and try again.';
    }
  } catch (e) {
    addressResult.textContent = 'Error looking up postcode. Please try again.';
  }
});

function generateSlots() {
  slotsDiv.innerHTML = '';
  const today = new Date();
  for (let d = 1; d <= 7; d++) {
    const date = new Date(today);
    date.setDate(today.getDate() + d);
    const dateStr = date.toISOString().split('T')[0];
    const dayName = date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
    ['09:00-12:00', '13:00-16:00'].forEach(time => {
      const slot = document.createElement('div');
      slot.className = 'slot';
      slot.textContent = `${dayName} ${time}`;
      slot.dataset.slot = `${dateStr} ${time}`;
      slot.addEventListener('click', () => {
        document.querySelectorAll('.slot').forEach(s => s.classList.remove('selected'));
        slot.classList.add('selected');
        selectedSlot = slot.dataset.slot;
        document.getElementById('step3').style.display = 'block';
        document.getElementById('submitBtn').style.display = 'block';
      });
      slotsDiv.appendChild(slot);
    });
  }
}

privacyLink.addEventListener('click', (e) => {
  e.preventDefault();
  privacy.style.display = 'block';
});
closePrivacy.addEventListener('click', () => {
  privacy.style.display = 'none';
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!selectedSlot) {
    alert('Please select a time slot.');
    return;
  }
  const data = {
    postcode: document.getElementById('postcode').value,
    house: document.getElementById('houseNumber').value,
    slot: selectedSlot,
    name: document.getElementById('name').value,
    email: document.getElementById('email').value,
    phone: document.getElementById('phone').value
  };
  // In a real app this would POST to a backend. Here we simulate.
  localStorage.setItem('lastBooking', JSON.stringify(data));
  document.getElementById('confirmation').style.display = 'block';
  document.getElementById('confirmation').innerHTML = `
    <h2>Booking confirmed</h2>
    <p>Thank you ${data.name}. Your fire door installation is booked for ${data.slot} at ${data.house}, ${data.postcode}.</p>
    <p>We will contact you shortly to confirm details. A confirmation has been saved locally.</p>
  `;
  form.style.display = 'none';
});