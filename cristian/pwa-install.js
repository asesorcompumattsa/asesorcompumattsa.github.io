(function(){
  var installButton=document.getElementById("installAppBtn");
  var shareButton=document.getElementById("shareAppBtn");
  var deferredPrompt=null;
  var appUrl=window.location.origin+window.location.pathname;
  var appTitle="Catálogo Compumatt";
  if("serviceWorker" in navigator){
    window.addEventListener("load",function(){
      var folder=window.location.pathname.split("/").filter(Boolean)[0] || "cristian";
      navigator.serviceWorker.register("/"+folder+"/service-worker.js",{scope:"/"+folder+"/"}).catch(function(){});
    });
  }
  window.addEventListener("beforeinstallprompt",function(event){
    event.preventDefault(); deferredPrompt=event;
    if(installButton) installButton.textContent="📲 Instalar Catálogo Compumatt";
  });
  if(installButton) installButton.addEventListener("click",async function(){
    if(deferredPrompt){
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      deferredPrompt=null;
      return;
    }
    var ios=/iphone|ipad|ipod/i.test(navigator.userAgent);
    alert(ios ? "Para instalar: toca Compartir y luego selecciona «Agregar a pantalla de inicio»." : "Abre el menú del navegador y selecciona «Instalar aplicación» o «Agregar a pantalla de inicio». ");
  });
  window.addEventListener("appinstalled",function(){
    if(installButton){installButton.textContent="✓ Catálogo Compumatt instalado";installButton.disabled=true;}
  });
  if(shareButton) shareButton.addEventListener("click",async function(){
    if(typeof medir==="function") medir("compartir_app");
    var shareData={title:appTitle,text:"Mira el Catálogo Compumatt: eventos, promociones y productos.",url:appUrl};
    if(navigator.share){
      try{await navigator.share(shareData);}catch(error){}
    }else if(navigator.clipboard){
      try{await navigator.clipboard.writeText(appUrl);alert("Enlace de la app copiado. Ya puedes pegarlo en WhatsApp o donde quieras compartirlo.");}
      catch(error){window.prompt("Copia este enlace para compartir la app:",appUrl);}
    }else window.prompt("Copia este enlace para compartir la app:",appUrl);
  });
})();
