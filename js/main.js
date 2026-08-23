/* =========================================================================
   BOOT
   ========================================================================= */
(async function boot(){
  try{
    await initDb();
  }catch(e){
    document.getElementById('loadingScreen').innerHTML = `<div style="color:var(--red);max-width:400px;text-align:center;">Failed to load the SQL engine. Check your connection and reload.<br><span class="mono" style="font-size:11px;color:var(--muted)">${escapeHtml(e.message||e)}</span></div>`;
    return;
  }
  document.getElementById('loadingScreen').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');
  render();
})();
