const photos = Array.from(document.querySelectorAll('#photo-stage img'));
const photoCount = document.getElementById('photo-count');
let photoIndex = 0;

function movePhoto(offset) {
  photos[photoIndex].hidden = true;
  photoIndex = (photoIndex + offset + photos.length) % photos.length;
  photos[photoIndex].hidden = false;
  photoCount.textContent = `${photoIndex + 1} / ${photos.length}`;
}

document.getElementById('previous-photo').addEventListener('click', () => movePhoto(-1));
document.getElementById('next-photo').addEventListener('click', () => movePhoto(1));

const stage = document.getElementById('photo-stage');
let touchStart;
stage.addEventListener('pointerdown', event => {
  if (event.pointerType !== 'mouse') {
    touchStart = { x: event.clientX, y: event.clientY };
    stage.setPointerCapture(event.pointerId);
  }
});
stage.addEventListener('pointercancel', () => { touchStart = undefined; });
stage.addEventListener('pointerup', event => {
  if (!touchStart) return;
  const dx = event.clientX - touchStart.x;
  const dy = event.clientY - touchStart.y;
  touchStart = undefined;
  if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) movePhoto(dx < 0 ? 1 : -1);
});

const endpoint = 'https://script.google.com/macros/s/AKfycbzH91w4_HfCm_gmJBgCPZX9lueV-CBq-_mhGwlIFj9FntlyM_gpYE77R9Iaxcceu2G7AQ/exec';
const form = document.getElementById('date-introduction');
const status = document.getElementById('form-status');
const submit = form.querySelector('button');
const receipt = document.getElementById('receipt');
let requestId;

submit.disabled = false;
status.textContent = '';
form.addEventListener('submit', async event => {
  event.preventDefault();
  if (submit.disabled) return;
  submit.disabled = true;
  status.textContent = 'Sending your introduction…';

  try {
    requestId ||= crypto.randomUUID();
    const body = new URLSearchParams(new FormData(form));
    body.set('source', 'date-me');
    body.set('consent', 'yes');
    body.set('requestId', requestId);
    const response = await fetch(endpoint, {
      method: 'POST',
      body,
      credentials: 'omit',
      signal: AbortSignal.timeout(45000),
    });
    const result = await response.json();
    if (!response.ok || result.ok !== true || result.route !== 'date-me') {
      throw new Error('Date Me submission not confirmed');
    }
    form.hidden = true;
    receipt.hidden = false;
    receipt.focus();
  } catch {
    status.textContent = 'Your introduction couldn’t be confirmed. Please try again or say hello on WhatsApp.';
    submit.disabled = false;
  }
});
