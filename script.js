import {normalizeCart} from './shop-core.mjs';
document.getElementById('year').textContent = new Date().getFullYear();
const form = document.getElementById('contact-form');
form?.addEventListener('submit', event => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const data = Object.fromEntries(new FormData(form));
  const body = `Name: ${data.name.trim()}\nEmail: ${data.email.trim()}\n\n${data.message.trim()}`;
  window.location.href = `mailto:info@parametric.space?subject=${encodeURIComponent('Parametric Space enquiry')}&body=${encodeURIComponent(body)}`;
  document.getElementById('form-status').textContent = 'Review the draft in your email app and press Send. If it did not open, email info@parametric.space directly.';
});

try {
 const cart = normalizeCart(JSON.parse(localStorage.getItem('parametric-space-cart-v1') || '[]'),window.PARAMETRIC_SHOP?.projects || []);
 document.querySelectorAll('[data-cart-count]').forEach(el => el.textContent = cart.reduce((n,item) => n + item.quantity,0));
} catch {}
