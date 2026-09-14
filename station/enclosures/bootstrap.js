// Defer preserves the vendor-script order, then starts the module application.
import('./app.js?v=3c3ca372c826').catch(error=>{
  const status=document.getElementById('loading');
  status.hidden=false;status.setAttribute('role','alert');
  status.textContent='Could not start Case studio: '+error.message;
});
