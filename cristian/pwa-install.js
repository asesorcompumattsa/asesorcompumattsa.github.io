(function(){
  var button=document.getElementById("installAppBtn");
  if(!button) return;
  var deferredPrompt=null;
  if("serviceWorker" in navigator){
    window.addEventListener("load",function(){navigator.serviceWorker.register("/cristian/service-worker.js",{scope:"/cristian/"}).catch(function(){});});
  }
  window.addEventListener("beforeinstallprompt",function(event){
    event.preventDefault();
    deferredPrompt=event;
    button.textContent="📲 Instalar C Compumatt";
  });
  button.addEventListener("click",async function(){
    if(deferredPrompt){
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      deferredPrompt=null;
      return;
    }
    var ios=/iphone|ipad|ipod/i.test(navigator.userAgent);
    alert(ios ? "Para instalar: toca Compartir y luego selecciona «Agregar a pantalla de inicio»." : "Abre el menú del navegador y selecciona «Instalar aplicación» o «Agregar a pantalla de inicio».");
  });
  window.addEventListener("appinstalled",function(){button.textContent="✓ C Compumatt instalada";button.disabled=true;});
})();
