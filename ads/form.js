const leadEndpoint = 'https://script.google.com/macros/s/AKfycbzH91w4_HfCm_gmJBgCPZX9lueV-CBq-_mhGwlIFj9FntlyM_gpYE77R9Iaxcceu2G7AQ/exec';
const form = document.getElementById('intro-form');
const statusLine = document.getElementById('form-status');
const submit = form.querySelector('button');
if (leadEndpoint) {
  submit.disabled = false;
  statusLine.textContent = '';
}
let requestId;
form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!leadEndpoint || submit.disabled) return;
  submit.disabled = true;
  statusLine.textContent = 'Sending your introduction…';
  try {
    requestId ||= crypto.randomUUID();
    const payload = new URLSearchParams(new FormData(form));
    payload.set('requestId', requestId);
    payload.set('consent', 'yes');
    const response = await fetch(leadEndpoint, {
      method: 'POST',
      body: payload,
      credentials: 'omit',
      signal: AbortSignal.timeout(45000),
    });
    const result = await response.json();
    if (!response.ok || result.ok !== true) throw new Error('Submission not confirmed');
    try {
      sessionStorage.setItem('bio-introduction-received', 'yes');
    } finally {
      location.assign('/ads/thank-you/');
    }
  } catch (error) {
    console.warn('Introduction submission could not be confirmed:', error.name, error.message);
    statusLine.textContent = 'We couldn’t confirm your introduction. Try again or contact Sanjit on WhatsApp.';
    submit.disabled = false;
  }
});
