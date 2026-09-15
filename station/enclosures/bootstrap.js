// Defer preserves the vendor-script order, then starts the module application.
import('./app.js?v=beca0f9913').catch(error=>{
  const status=document.getElementById('loading');
  status.hidden=false;status.setAttribute('role','alert');
  status.textContent='Could not start Case studio: '+error.message;
});
