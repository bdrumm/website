document.getElementById('year').textContent = new Date().getFullYear();
const form = document.getElementById('contact-form');
const endpoint = window.PARAMETRIC_CONTACT_ENDPOINT;
if (form && endpoint && new URL(endpoint).protocol === 'https:') {
  const fieldset=form.querySelector('fieldset');
  const button=form.querySelector('button');
  const status=document.getElementById('form-status');
  fieldset.disabled=false;button.disabled=false;button.type='submit';button.textContent='Send message →';
  status.textContent='We’ll use your details to respond to your enquiry.';
  let submissionId=crypto.randomUUID();
  form.addEventListener('submit',async event=>{
    event.preventDefault();if(!form.reportValidity())return;
    const data=Object.fromEntries(new FormData(form));data.submissionId=submissionId;
    button.disabled=true;button.textContent='Sending…';status.textContent='Sending your message…';
    try {
      const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data),signal:AbortSignal.timeout(15000)});
      const result=await response.json();
      if(!response.ok || result.ok!==true)throw new Error(result.error || 'Unable to send. Please try again.');
      status.textContent='Thank you. Your message has been sent.';form.reset();submissionId=crypto.randomUUID();
    }catch(error){status.textContent=error.name==='TimeoutError'?'Sending timed out. Please try again or email info@parametric.space.':(error.message || 'Unable to send. Please try again.');}
    finally{button.disabled=false;button.textContent='Send message →';}
  });
}
