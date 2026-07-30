(function(){
  var KEY = 'peaces-theme';
  function isDark(){ return localStorage.getItem(KEY) === 'dark'; }
  function swapLogos(dark){
    document.querySelectorAll('img[src*="peaces-mark-"]').forEach(function(img){
      img.src = img.src.replace(dark ? 'peaces-mark-black.png' : 'peaces-mark-white.png', dark ? 'peaces-mark-white.png' : 'peaces-mark-black.png');
    });
  }
  function apply(){
    if (isDark()) document.documentElement.setAttribute('data-theme', 'dark');
    else document.documentElement.removeAttribute('data-theme');
    swapLogos(isDark());
  }
  apply();
  function syncLabel(){
    var btn = document.querySelector('[data-theme-toggle]');
    if (btn) btn.textContent = isDark() ? 'Light mode' : 'Dark mode';
  }
  document.addEventListener('DOMContentLoaded', function(){ syncLabel(); swapLogos(isDark()); });
  document.addEventListener('click', function(e){
    var btn = e.target.closest('[data-theme-toggle]');
    if (!btn) return;
    localStorage.setItem(KEY, isDark() ? 'light' : 'dark');
    apply();
    syncLabel();
  });
})();
