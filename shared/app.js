/* ══════════════════════════════════════════════════════════════════
   COMPUMATT — MOTOR COMPARTIDO (usado por TODAS las tarjetas de
   vendedores). No hay datos de ningún vendedor aquí — esos van en
   el archivo de cada vendedor (NOMBRE, NOMBRE_COMPLETO, ROL, TEL, WA).

   PARA ACTUALIZAR ALGO EN TODAS LAS TARJETAS A LA VEZ (tema de
   temporada, catálogo, diseño del catálogo, etc.), editá este único
   archivo y subilo — no hace falta tocar cada tarjeta de vendedor.
══════════════════════════════════════════════════════════════════ */

/* ──────────────────────────────────────────────────────────────────
   1) TEMA DE TEMPORADA — cambiá esta única palabra para activar o
   desactivar la decoración especial en TODAS las tarjetas a la vez.
   Opciones ya armadas: "halloween", "navidad", "" (sin tema)
   Para sumar una fecha nueva (ej. día del cáncer de mama), agregá
   una entrada más al objeto TEMAS de abajo con sus propios emojis.
──────────────────────────────────────────────────────────────────── */
var TEMA = "";

/* ESTILO DE MOVIMIENTO — elegí cómo se comportan las decoraciones:
   "caer"    → caen desde arriba cruzando toda la pantalla (como la lluvia)
   "brincar" → quedan en un punto fijo y saltan suavemente ahí mismo, más grandes */
var ESTILO = "brincar";

var TEMAS = {
  halloween: { emojis:["🎃","🦇","👻"], badge:"🎃" },
  navidad:   { emojis:["❄️","🎄","⭐"],  badge:"🎄 Feliz Navidad" },
  cancer_mama: { emojis:["🎗️"], badge:"🎗️ Octubre Rosa — Día del Cáncer de Mama" },
  dia_muertos: { emojis:["💀","🌷","🕯️"], badge:"💀 Día de Muertos" }
};

/* ──────────────────────────────────────────────────────────────────
   2) CONEXIÓN AL CATÁLOGO (misma hoja para todos los vendedores)
──────────────────────────────────────────────────────────────────── */
var SPREADSHEET_ID = "1h86aQIffJN-1KVLpt7DLgGd_MXxoQzMb-wDtXSmj3fk";
var SHEET_NAME      = "CSGG";
var API_KEY         = "AIzaSyArcHqRNfyFlOhetUofr8mNOwgGpZz2Kkc";

var SHEET_URL = "https://sheets.googleapis.com/v4/spreadsheets/"
  + SPREADSHEET_ID + "/values/" + encodeURIComponent(SHEET_NAME + "!A:Z")
  + "?key=" + API_KEY;

var ICONOS = {impresora:"🖨",toner:"🔴",computo:"💻",accesorios:"🔌",oficina:"📂"};
var todos = [], activeTab = "todos", cargado = false;

/* ══════════════════════════════════════════════════════════════════
   A PARTIR DE ACÁ: lógica general. No hace falta tocar nada de lo
   que sigue para actualizar el catálogo o el tema — eso ya se
   maneja arriba. Esto solo se ejecuta cuando la página carga.
══════════════════════════════════════════════════════════════════ */

document.addEventListener("DOMContentLoaded", function(){

  /* --- Rellenar los datos del vendedor en el HTML --- */
  document.title = (typeof NOMBRE_COMPLETO !== "undefined" ? NOMBRE_COMPLETO : "Compumatt") + " · Compumatt";
  var elName = document.getElementById("vendorName");
  if(elName) elName.textContent = NOMBRE_COMPLETO;
  var elRole = document.getElementById("vendorRole");
  if(elRole) elRole.textContent = ROL;
  var elPhone = document.getElementById("vendorPhone");
  if(elPhone) elPhone.textContent = TEL;

  var pedidoBtn = document.getElementById("pedidoEspecialBtn");
  if(pedidoBtn){
    var msgPedido = encodeURIComponent("Hola " + NOMBRE + ", quiero hacer un pedido especial de un producto que no tienen en tienda. ¿Me ayudas?");
    pedidoBtn.href = "https://wa.me/" + WA + "?text=" + msgPedido;
  }

  /* --- Botón "Enviar mensaje" con saludo según la hora --- */
  var sendMessageBtn = document.getElementById('sendMessageBtn');
  if(sendMessageBtn){
    sendMessageBtn.addEventListener('click', function(){
      var hour = new Date().getHours();
      var greeting;
      if(hour >= 5 && hour < 12){ greeting = 'Buenos días ' + NOMBRE; }
      else if(hour >= 12 && hour < 19){ greeting = 'Buenas tardes ' + NOMBRE; }
      else { greeting = 'Buenas noches ' + NOMBRE; }
      var waUrl = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(greeting);
      window.open(waUrl, '_blank');
    });
  }

  /* --- Modal "Guardar mi contacto" --- */
  var overlay = document.getElementById('saveOverlay');
  var openBtn = document.getElementById('openSaveModal');
  var cancelBtn = document.getElementById('cancelSave');
  var confirmBtn = document.getElementById('confirmSave');

  if(openBtn) openBtn.addEventListener('click', function(){ overlay.classList.add('show'); });
  if(cancelBtn) cancelBtn.addEventListener('click', function(){ overlay.classList.remove('show'); });
  if(overlay) overlay.addEventListener('click', function(e){
    if(e.target === overlay){ overlay.classList.remove('show'); }
  });

  function downloadMyVCard(){
    var partes = NOMBRE_COMPLETO.split(" ");
    var primerNombre = partes[0] || NOMBRE_COMPLETO;
    var apellidos = partes.slice(1).join(" ");
    var vcard = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      'N:' + apellidos + ';' + primerNombre + ';;;',
      'FN:' + NOMBRE_COMPLETO,
      'ORG:Compumatt de Nicaragua S.A.',
      'TITLE:' + ROL,
      'TEL;TYPE=WORK,VOICE:+' + WA,
      'NOTE:Pedido especial o catálogo? Escríbeme por WhatsApp.',
      'END:VCARD'
    ].join('\n');
    var blob = new Blob([vcard], {type:'text/vcard'});
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = NOMBRE_COMPLETO.replace(/ /g,'_') + '_Compumatt.vcf';
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
  }

  if(confirmBtn){
    confirmBtn.addEventListener('click', function(){
      var visitorName = document.getElementById('visitorName').value.trim();
      var visitorPhone = document.getElementById('visitorPhone').value.trim();
      downloadMyVCard();
      if(visitorPhone){
        var msg = 'Hola ' + NOMBRE + ', guardé tu contacto desde tu tarjeta digital.' + (visitorName ? ' Soy ' + visitorName + '.' : '');
        var waUrl = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(msg);
        window.open(waUrl, '_blank');
      }
      overlay.classList.remove('show');
    });
  }

  /* --- Tema de temporada --- */
  initTema();

  /* --- Catálogo: abrir / cerrar --- */
  var openCatalog = document.getElementById("openCatalog");
  var catOverlay = document.getElementById("catOverlay");
  var catClose = document.getElementById("catClose");
  var catSearch = document.getElementById("catSearch");
  var detOverlay = document.getElementById("detOverlay");

  if(openCatalog) openCatalog.onclick = function(){
    catOverlay.classList.add("show");
    catSearch.value = "";
    activeTab = "todos";
    if(!cargado) cargar(); else { tabs(); grid(); }
    var sp = document.querySelector(".seasonParticles");
    if(sp) sp.style.display = "none";
  };
  if(catClose) catClose.onclick = function(){
    catOverlay.classList.remove("show");
    var sp = document.querySelector(".seasonParticles");
    if(sp) sp.style.display = "";
  };
  if(catOverlay) catOverlay.onclick = function(e){
    if(e.target===this){
      this.classList.remove("show");
      var sp = document.querySelector(".seasonParticles");
      if(sp) sp.style.display = "";
    }
  };
  if(detOverlay) detOverlay.onclick = function(e){
    if(e.target===this) this.classList.remove("show");
  };
  if(catSearch) catSearch.oninput = grid;

});

function initTema(){
  if(!TEMA || !TEMAS[TEMA]) return;
  var cfg = TEMAS[TEMA];
  document.body.classList.add("tema-" + TEMA);

  var wrap = document.createElement("div");
  wrap.className = "seasonParticles estilo-" + (ESTILO==="brincar" ? "brincar" : "caer");

  for(var i=0;i<18;i++){
    var s = document.createElement("span");
    s.textContent = cfg.emojis[i % cfg.emojis.length];

    if(ESTILO === "brincar"){
      s.style.left = (5 + Math.random()*90) + "vw";
      s.style.top  = (8 + Math.random()*78) + "vh";
      s.style.fontSize = (30 + Math.random()*20) + "px";
      s.style.animationDuration = (1.4 + Math.random()*1.4) + "s";
      s.style.animationDelay = (Math.random()*2) + "s";
    } else {
      s.style.left = (Math.random()*100) + "vw";
      s.style.fontSize = (16 + Math.random()*14) + "px";
      s.style.animationDuration = (7 + Math.random()*8) + "s";
      s.style.animationDelay = (Math.random()*8) + "s";
    }
    wrap.appendChild(s);
  }
  document.body.appendChild(wrap);

  var eyebrow = document.querySelector(".eyebrow");
  if(eyebrow){
    var badge = document.createElement("div");
    badge.className = "seasonBadge";
    badge.textContent = cfg.badge;
    eyebrow.insertAdjacentElement("afterend", badge);
  }

  var catTitle = document.getElementById("catTitle");
  if(catTitle){
    catTitle.textContent = "📦 Catálogo Compumatt " + cfg.emojis[0];
  }
}

function cargar(){
  var g = document.getElementById("catGrid");
  g.innerHTML = '<div class="cat-loading"><div class="cat-spinner"></div><p>Cargando catálogo...</p></div>';
  fetch(SHEET_URL)
    .then(function(r){ return r.json(); })
    .then(function(data){
      if(!data.values){ throw new Error("sin datos"); }
      todos = parsear(data.values);
      actualizarBannerOfertas();
      cargado = true;
      tabs(); grid();
    })
    .catch(function(){
      g.innerHTML = '<div class="cat-error">❌ No se pudo cargar el catálogo.<br>Verifica la API Key, el nombre de la hoja y los permisos de acceso.</div>';
    });
}

function parsear(filasCrudas){
  var filas = (filasCrudas||[]).filter(function(f){ return f && (f.length>1 || f[0]!==""); });
  if(filas.length < 2) return [];

  var enc = filas[0].map(function(h){return (h||"").trim().toLowerCase();});
  function col(n){ return enc.indexOf(n); }

  var iCat=col("categoria"), iNom=col("nombre"), iDesc=col("descripcion"),
      iPre=col("precio"), iImg=col("imagen_url"), iBdg=col("badge"),
      iAct=col("activo"), iIco=col("icono");

  var lista=[];
  for(var i=1;i<filas.length;i++){
    var c=filas[i];
    var cat = iCat>=0?(c[iCat]||"").trim():"";
    var nom = iNom>=0?(c[iNom]||"").trim():"";
    if(!cat && !nom) continue;
    var act = iAct>=0?(c[iAct]||"").trim().toUpperCase():"SI";
    if(act==="NO") continue;
    lista.push({
      cat  : cat.toLowerCase()||"otros",
      nom  : nom,
      desc : iDesc>=0?(c[iDesc]||"").trim():"",
      pre  : iPre>=0?(c[iPre]||"").trim():"",
      img  : iImg>=0?(c[iImg]||"").trim():"",
      bdg  : iBdg>=0?(c[iBdg]||"").trim().toLowerCase():"",
      ico  : iIco>=0?(c[iIco]||"📦").trim():"📦",
    });
  }
  return lista;
}

function tabs(){
  var cats=["todos"];
  todos.forEach(function(p){if(cats.indexOf(p.cat)<0)cats.push(p.cat);});
  if(todos.some(function(p){return p.bdg === "oferta";})) cats.push("ofertas");
  var el=document.getElementById("catTabs");
  el.innerHTML="";
  cats.forEach(function(c){
    var b=document.createElement("button");
    b.className="cat-tab"+(c===activeTab?" active":"");
    b.textContent=(c==="todos"?"🗂 Todos":(c==="ofertas"?"🔥 Ofertas":(ICONOS[c]||"📦")+" "+c.charAt(0).toUpperCase()+c.slice(1)));
    b.onclick=function(){
      activeTab=c;
      document.querySelectorAll(".cat-tab").forEach(function(x){x.classList.remove("active");});
      b.classList.add("active");
      grid();
    };
    el.appendChild(b);
  });
}

function grid(){
  var q=document.getElementById("catSearch").value.toLowerCase().trim();
  var lista=todos.filter(function(p){
    var perteneceATab = activeTab === "ofertas"
      ? p.bdg === "oferta"
      : (activeTab === "todos" || p.cat === activeTab);
    return perteneceATab
        &&(!q||p.nom.toLowerCase().includes(q)||p.desc.toLowerCase().includes(q));
  });
  var el=document.getElementById("catGrid");
  el.innerHTML="";
  if(!lista.length){el.innerHTML='<div class="cat-empty">😕 Sin resultados.</div>';return;}

  var bLbl={nuevo:"✨ Nuevo",oferta:"🔥 Oferta",agotado:"❌ Agotado"};
  lista.forEach(function(p){
    var d=document.createElement("div");
    d.className="prod-card";
    var imgH=p.img
      ?'<img src="'+p.img+'" alt="'+p.nom+'" loading="lazy" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'">'
       +'<div class="prod-ph" style="display:none">'+p.ico+'</div>'
      :'<div class="prod-ph">'+p.ico+'</div>';
    var bdgH=p.bdg&&bLbl[p.bdg]?'<div class="prod-bdg-w"><span class="prod-bdg '+p.bdg+'">'+bLbl[p.bdg]+'</span></div>':"";
    var waMsg=encodeURIComponent("Hola "+NOMBRE+" 👋, vi el catálogo de Compumatt y me interesa:\n\n▪ *"+p.nom+"*\n▪ Precio: "+p.pre+"\n\n¿Está disponible?");
    var actH=p.bdg==="agotado"
      ?'<span class="prod-agotado">Sin stock</span>'
      :'<a class="prod-wa" href="https://wa.me/'+WA+'?text='+waMsg+'" target="_blank" onclick="event.stopPropagation()">💬</a>';
    d.innerHTML=
      '<div class="prod-img-w">'+imgH+bdgH+'</div>'
      +'<div class="prod-body">'
        +'<p class="prod-name">'+p.nom+'</p>'
        +'<div class="prod-footer"><span class="prod-price">'+p.pre+'</span>'+actH+'</div>'
      +'</div>';
    d.onclick=function(){detalle(p);};
    el.appendChild(d);
  });
}

function detalle(p){
  var waMsg=encodeURIComponent("Hola "+NOMBRE+" 👋, vi el catálogo de Compumatt y me interesa:\n\n▪ *"+p.nom+"*\n▪ Precio: "+p.pre+"\n\n¿Está disponible?");
  var imgH=p.img
    ?'<div class="det-img"><img src="'+p.img+'" alt="'+p.nom+'" onerror="this.style.display=\'none\'"></div>'
    :'<div class="det-img"><div class="det-img-ph">'+p.ico+'</div></div>';
  var actH=p.bdg==="agotado"
    ?'<button class="det-back" onclick="document.getElementById(\'detOverlay\').classList.remove(\'show\')">← Volver</button>'
     +'<span style="font-size:13px;font-weight:800;color:#dc2626">❌ Sin stock</span>'
    :'<button class="det-back" onclick="document.getElementById(\'detOverlay\').classList.remove(\'show\')">← Volver</button>'
     +'<a class="det-pedir" href="https://wa.me/'+WA+'?text='+waMsg+'" target="_blank">💬 Pedir por WhatsApp</a>';
  document.getElementById("detBox").innerHTML=
    imgH+'<div class="det-body"><h3>'+p.nom+'</h3><p>'+p.desc+'</p><p class="det-price">'+p.pre+'</p><div class="det-actions">'+actH+'</div></div>';
  document.getElementById("detOverlay").classList.add("show");
}


/* Inyecta la mascota desde el motor compartido para todos los vendedores. */
function initMascotaBienvenida() {
  var mascotSrc = "/shared/mascota_final.png";
  var bubble = '<span class="mascot-bubble">¡Bienvenido!</span>';

  var header = document.querySelector(".header");
  if (header && !header.querySelector(".card-mascot-welcome")) {
    var cardMascot = document.createElement("div");
    cardMascot.className = "card-mascot-welcome";
    cardMascot.setAttribute("aria-label", "Mascota de Compumatt: ¡Bienvenido!");
    cardMascot.innerHTML = bubble + '<img src="' + mascotSrc + '" alt="Mascota Compumatt">';
    header.appendChild(cardMascot);
  }

  var drawer = document.querySelector(".cat-drawer");
  if (drawer && !drawer.querySelector(".cat-mascot-welcome")) {
    var catalogMascot = document.createElement("div");
    catalogMascot.className = "cat-mascot-welcome";
    catalogMascot.setAttribute("aria-label", "Mascota de Compumatt: ¡Bienvenido!");
    catalogMascot.innerHTML = bubble + '<img src="' + mascotSrc + '" alt="">';
    var catHead = drawer.querySelector(".cat-head");
    drawer.insertBefore(catalogMascot, catHead || drawer.firstChild);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initMascotaBienvenida);
} else {
  initMascotaBienvenida();
}


/* Ofertas dinámicas: se activa solo si Google Sheets tiene badge = oferta. */
function actualizarBannerOfertas(){
  var banner=document.getElementById("offersBanner");
  if(!banner) return;
  banner.hidden=!todos.some(function(p){return p.bdg === "oferta";});
}
function abrirOfertas(){
  var banner=document.getElementById("offersBanner");
  var overlay=document.getElementById("catOverlay");
  var search=document.getElementById("catSearch");
  if(!banner||!overlay||banner.hidden) return;
  overlay.classList.add("show");
  if(search) search.value="";
  activeTab="ofertas";
  if(!cargado) cargar(); else { tabs(); grid(); }
}
document.addEventListener("DOMContentLoaded",function(){
  var banner=document.getElementById("offersBanner");
  if(!banner) return;
  banner.addEventListener("click",abrirOfertas);
  banner.addEventListener("keydown",function(e){
    if(e.key==="Enter"||e.key===" "){e.preventDefault();abrirOfertas();}
  });
});
