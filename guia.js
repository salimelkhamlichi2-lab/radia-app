/* Catálogo compartido: trabajadores (personas) y gadgets (utilidades).
   Los tutoriales se guardan en este navegador. Uno nuevo, que no esté visto, sale solo. */
(function (w) {
  var ITEMS = [
    {
      id: "intro-pc", page: "pc", group: "meta", name: "Tu oficina",
      que: "Esto es el cerebro de RADIA en tu ordenador. Arriba están los trabajadores: personas que hacen un trabajo. Abajo están los gadgets: cosas de cada día, como el clima o las notas. No son personas.",
      como: "Pulsa una mesa para ver qué hace. Cuando alguien trabaja, su personaje se mueve. Al terminar, vuelve a su sitio. El botón Tutoriales abre estas explicaciones cuando quieras.",
      ejemplo: "Pulsa Radar y luego Buscar ahora."
    },
    {
      id: "intro-mini", page: "mini", group: "meta", name: "La mini app",
      que: "Esto es RADIA en el móvil. Los trabajadores son personas. Los gadgets son utilidades del día, como el tiempo o la lista. Están separados.",
      como: "Pulsa a alguien, lee para qué sirve y pulsa el botón. Si hace falta un texto, escríbelo y mándalo. Se lo lleva Telegram. Tutoriales guarda estas fichas.",
      ejemplo: "Pulsa Clima. No tienes que escribir nada."
    },
    {
      id: "radar", group: "trabajador", name: "Radar", role: "Busca clientes", money: true, shirt: "#6fbf73",
      que: "Radar busca gente que pide ayuda y te manda la oferta por Telegram. Tú solo pulsas Aceptar o Rechazar.",
      como: "Revisar ofertas te manda hasta 3. El mensaje dice: esto se puede hacer con lo que ya tienes, te lo añado, ¿te vale? Aceptar la guarda. No se publica sola en Instagram ni en el foro.",
      ejemplo: "ofertas",
      cmds: ["radar", "leads", "ofertas"],
      actions: [
        { label: "Revisar ofertas", cmd: "ofertas" },
        { label: "Buscar clientes", cmd: "radar" },
        { label: "Ver mis clientes", cmd: "leads" }
      ]
    },
    {
      id: "presupuesto", group: "trabajador", name: "Presupuesto", role: "Escribe la oferta", money: true, shirt: "#d7a441",
      que: "Presupuesto escribe una oferta con precio, plazo y cómo se paga, lista para copiar.",
      como: "Cuéntale el problema del cliente con tus palabras. No hace falta que suene formal.",
      ejemplo: "presupuesto avisar pedidos de Instagram",
      cmds: ["presupuesto "],
      actions: [{ label: "Escribir oferta", ask: "Problema del cliente", prefix: "presupuesto ", placeholder: "avisar pedidos de Instagram" }]
    },
    {
      id: "nicho", group: "trabajador", name: "Nicho", role: "Ideas para Etsy", money: true, shirt: "#d98b6a",
      que: "Nicho inventa frases para camisetas y tazas. Sin marcas ni famosos.",
      como: "Escribe un tema, por ejemplo enfermeras. Ver guardadas enseña las que ya hizo. Esto va después de la agencia: tarda semanas en vender.",
      ejemplo: "nicho enfermeras",
      cmds: ["nicho ", "nichos"],
      actions: [
        { label: "Crear ideas", ask: "Tema", prefix: "nicho ", placeholder: "enfermeras" },
        { label: "Ver guardadas", cmd: "nichos" }
      ]
    },
    {
      id: "director", group: "trabajador", name: "Cursor", role: "Cambia RADIA", shirt: "#7aa2e3",
      que: "Cursor es quien cambia RADIA. Le escribes una frase y él hace el cambio.",
      como: "Escribe el cambio como se lo dirías a una persona. Ejemplo: pon el menú más corto. Cuando trabaje, su personaje se mueve. Al acabar, vuelve a su mesa y te avisa.",
      ejemplo: "pon el menú más corto",
      cmds: ["cursor", "director"],
      actions: [
        { label: "Pedir un cambio", ask: "Qué quieres cambiar", prefix: "", placeholder: "pon el menú más corto" },
        { label: "Ver encargos", cmd: "cursor" }
      ]
    },
    {
      id: "ask", group: "trabajador", name: "Ask", role: "Pregunta rápida", shirt: "#5ec8d8",
      que: "Ask responde dudas cortas con el modelo barato.",
      como: "Escribe la pregunta. Para algo importante (precios, un plan), usa Pro.",
      ejemplo: "pregunta qué es un webhook en dos frases",
      cmds: ["pregunta "],
      actions: [{ label: "Preguntar", ask: "Tu pregunta", prefix: "pregunta ", placeholder: "qué es un webhook" }]
    },
    {
      id: "pro", group: "trabajador", name: "Pro", role: "Piensa a fondo", money: true, shirt: "#e2a45c",
      que: "Pro es el modelo más listo. Sirve para decidir, no para charlar. Cada uso cuesta unos céntimos.",
      como: "Úsalo para una oferta, un plan o un problema de un cliente. No lo uses para saludar.",
      ejemplo: "pro cómo cobro un flujo de n8n",
      cmds: ["pro "],
      actions: [{ label: "Preguntar a fondo", ask: "Qué tienes que decidir", prefix: "pro ", placeholder: "cómo cobro un flujo de n8n" }]
    },
    {
      id: "lente", group: "trabajador", name: "Lente", role: "Revisa antes", shirt: "#c9b6f2",
      que: "Lente mira una idea antes de crearla. Dice qué está bien, qué está mal y cómo corregirlo. No la construye.",
      como: "Pega las armas, el personaje, la oferta o el texto. Según las palabras, elige el revisor. analiza ultimo repite la última.",
      ejemplo: "analiza estas armas: espada, aura, rayo",
      cmds: ["analiza "],
      actions: [
        { label: "Revisar", ask: "Qué quieres revisar", prefix: "analiza ", placeholder: "estas armas: espada, aura, rayo" },
        { label: "Ver la última", cmd: "analiza ultimo" }
      ]
    },
    {
      id: "ember", group: "trabajador", name: "Ember", role: "Noticias", shirt: "#e07b4a",
      que: "Ember trae un resumen corto de lo que pasa hoy: tecnología, mundo y economía.",
      como: "Pulsa Noticias. No tienes que escribir nada.",
      ejemplo: "noticias",
      cmds: ["noticias"],
      actions: [{ label: "Ver noticias", cmd: "noticias" }]
    },
    {
      id: "enlace", group: "trabajador", name: "Enlace", role: "Resume páginas", shirt: "#8fd0c6",
      que: "Enlace lee una página y te la deja en pocas líneas.",
      como: "Pega una dirección que empiece por https://.",
      ejemplo: "https://community.n8n.io/latest",
      cmds: ["https:// "],
      actions: [{ label: "Resumir página", ask: "Dirección de la página", prefix: "", placeholder: "https://..." }]
    },
    {
      id: "alba", group: "trabajador", name: "Alba", role: "A las 8:00", shirt: "#f2d38a",
      que: "Alba es Ember, pero sola. A las 8:00 (hora de Madrid) manda el resumen de noticias a Telegram.",
      como: "No pulses nada. Si el ordenador está encendido a esa hora, ella trabaja y luego vuelve a su sitio.",
      ejemplo: "Sola, a las 8:00.",
      cmds: [],
      actions: []
    },
    {
      id: "seguimiento", group: "trabajador", name: "Seguimiento", role: "A las 9:00", shirt: "#9db87a",
      que: "A las 9:00 te recuerda a quién escribiste hace 3 días y no ha contestado, con un mensaje corto para reenviar.",
      como: "No pulses nada para la pasada de la mañana. Cuando alguien conteste, en Ingresos marca el lead: lead 1 respondio o lead 1 cerrado 250.",
      ejemplo: "Sola, a las 9:00.",
      cmds: [],
      actions: []
    },
    {
      id: "claro", group: "trabajador", name: "Claro", role: "Suena humano", money: true, shirt: "#f2c14e",
      que: "Claro reescribe el mensaje que vas a mandar a un cliente para que suene corto y a persona.",
      como: "Pega el mensaje largo. Te devuelve otro listo para copiar. No lo envía.",
      ejemplo: "claro Hola, te ofrezco automatizar los pedidos por 250 euros",
      cmds: ["claro "],
      actions: [{ label: "Reescribir", ask: "El mensaje", prefix: "claro ", placeholder: "Hola, te ofrezco automatizar los pedidos por 250 euros" }]
    },
    {
      id: "contesta", group: "trabajador", name: "Contesta", role: "Si te responden", money: true, shirt: "#7ec8e3",
      que: "Contesta te explica en español qué te piden y te deja la respuesta corta, en el idioma de esa persona.",
      como: "Pega lo que te escribieron. Si está en la lista: lead 2 respondio y el texto.",
      ejemplo: "contesta how much would this cost?",
      cmds: ["contesta "],
      actions: [{ label: "Responder", ask: "Lo que te escribió", prefix: "contesta ", placeholder: "how much would this cost?" }]
    },
    {
      id: "cobro", group: "trabajador", name: "Cobro", role: "Pedir el pago", money: true, shirt: "#8fd18a",
      que: "Cobro anota que el trabajo está cerrado y te escribe el mensaje para pedir el dinero.",
      como: "Escribe el número del cliente y los euros. Una vez, dile cómo te pagan: cobro pago Bizum.",
      ejemplo: "lead 2 cerrado 250",
      cmds: ["cobro"],
      actions: [
        { label: "Cerrar y cobrar", ask: "Número y euros", prefix: "lead ", placeholder: "2 cerrado 250" },
        { label: "Cómo me pagan", ask: "Bizum, transferencia...", prefix: "cobro pago ", placeholder: "Bizum" }
      ]
    },
    {
      id: "antes", group: "trabajador", name: "Antes", role: "Antes del precio", money: true, shirt: "#e7a0b0",
      que: "Antes te da tres preguntas para el cliente, para no poner un precio a ciegas.",
      como: "Cuéntale el problema. Cuando te contesten, usa Presupuesto.",
      ejemplo: "antes avisar los pedidos de Instagram",
      cmds: ["antes "],
      actions: [{ label: "Tres preguntas", ask: "Problema del cliente", prefix: "antes ", placeholder: "avisar los pedidos de Instagram" }]
    },
    {
      id: "manana", group: "trabajador", name: "Mañana", role: "A las 8:00", shirt: "#c4b5fd",
      que: "A las 8, un solo texto: clientes sin contestar, avisos de hoy y si Cursor terminó algo. Las noticias las sigue mandando Alba.",
      como: "No pulses nada si el ordenador está encendido a esa hora. Si quieres verlo ahora, pulsa Ver el parte.",
      ejemplo: "manana",
      cmds: ["manana"],
      actions: [{ label: "Ver el parte", cmd: "manana" }]
    },
    {
      id: "semana", group: "trabajador", name: "Semana", role: "Domingo 21:00", shirt: "#f0a06a",
      que: "El domingo a las 21:00 resume la semana: clientes, mensajes, respuestas, euros y qué hacer el lunes.",
      como: "No pulses nada. Si quieres ver la semana ahora, pulsa Ver la semana.",
      ejemplo: "semana",
      cmds: ["semana"],
      actions: [{ label: "Ver la semana", cmd: "semana" }]
    },
    {
      id: "vigia", group: "trabajador", name: "Vigía", role: "Si se apaga", shirt: "#e07b6a",
      que: "Vigía te avisa por Telegram si el cerebro se apaga y el ordenador sigue encendido. Si apagas el PC, no puede escribir.",
      como: "Se enciende solo al entrar en Windows. Pulsa Estado para ver la última mirada.",
      ejemplo: "vigia",
      cmds: ["vigia"],
      actions: [{ label: "Estado", cmd: "vigia" }]
    },
    {
      id: "creador", group: "trabajador", name: "Creador", role: "Ideas nuevas", shirt: "#e85d8c",
      que: "Creador es el director creativo. Cada hora, de 9 a 20, propone una idea nueva si no hay otra esperando. Lente la mira antes. Si no vale, no te molesta.",
      como: "Si vale, te llega por Telegram. Aceptar la pone en cola para Cursor. Rechazar la tira. No la construye hasta que pulses Aceptar. Si el ordenador está apagado, esa hora no pasa.",
      ejemplo: "creador",
      cmds: ["creador"],
      actions: [{ label: "Pedir una idea", cmd: "creador" }]
    },
    {
      id: "guia", group: "trabajador", name: "Guía", role: "La frase", shirt: "#7dcea0",
      que: "Guía guarda la frase que sale en las ofertas. La de ahora dice que se puede hacer con lo que ya tienes, que se lo añades, y si le vale.",
      como: "Pulsa Ver la frase. Para cambiarla, escribe la nueva. La siguiente oferta ya la usa. No es el tutorial.",
      ejemplo: "guia Esto se puede hacer con lo que ya tienes. Te lo añado yo. ¿Te vale?",
      cmds: ["guia"],
      actions: [
        { label: "Ver la frase", cmd: "guia" },
        { label: "Cambiarla", ask: "La frase nueva", prefix: "guia ", placeholder: "Esto se puede hacer con lo que ya tienes. Te lo añado yo. ¿Te vale?" }
      ]
    },
    {
      id: "ficha", group: "trabajador", name: "Ficha", role: "Un cliente", shirt: "#5dade2",
      que: "Ficha enseña un cliente: qué pidió, la oferta, el estado y el dinero.",
      como: "Ver fichas enseña las más nuevas. ficha 1 abre la primera de esa lista.",
      ejemplo: "ficha 1",
      cmds: ["ficha"],
      actions: [
        { label: "Ver fichas", cmd: "ficha" },
        { label: "Abrir la 1", cmd: "ficha 1" }
      ]
    },
    {
      id: "turno", group: "trabajador", name: "Turno", role: "Cada media hora", shirt: "#f5b041",
      que: "Turno manda una sola oferta nueva por Telegram, cada media hora de 9 a 20. Tú pulsas Aceptar o Rechazar.",
      como: "No pulses nada si el ordenador está encendido. Si quieres una ahora, pulsa Mandar una.",
      ejemplo: "turno",
      cmds: ["turno"],
      actions: [{ label: "Mandar una", cmd: "turno" }]
    },
    {
      id: "hecho", group: "trabajador", name: "Hecho", role: "A las 20:00", shirt: "#af7ac5",
      que: "Hecho, a las 20:00, cierra el día: ofertas aceptadas, rechazadas, euros y lo que queda.",
      como: "Se manda solo si el ordenador está encendido. Ver el cierre lo enseña ahora. Tachas una tarea de la lista con hecho y la frase, no con este botón.",
      ejemplo: "hecho",
      cmds: ["hecho"],
      actions: [{ label: "Ver el cierre", cmd: "hecho" }]
    },
    {
      id: "casa", group: "trabajador", name: "Casa", role: "A las 8:30", shirt: "#48c9b0",
      que: "Casa, a las 8:30, junta los avisos de hoy, la lista abierta y los gastos de hoy. No llama a la inteligencia artificial.",
      como: "Se manda sola. Ver la casa lo enseña ahora. Los avisos, la lista y los gastos se siguen anotando como siempre.",
      ejemplo: "casa",
      cmds: ["casa"],
      actions: [{ label: "Ver la casa", cmd: "casa" }]
    },
    {
      id: "reloj", group: "gadget", name: "Reloj", role: "Avisos", toy: "clock",
      que: "El reloj guarda avisos en este ordenador. Suenan aquí y en Telegram.",
      como: "Escribe la hora y qué tienes que hacer. Ver avisos los lista. cancelar aviso 1 borra el número 1.",
      ejemplo: "avisame a las 19:30 llamar a mamá",
      cmds: ["avisame ", "avisos"],
      actions: [
        { label: "Ver avisos", cmd: "avisos" },
        { label: "Nuevo aviso", ask: "Hora y qué hacer", prefix: "avisame ", placeholder: "a las 19:30 llamar a mamá" }
      ]
    },
    {
      id: "clima", group: "gadget", name: "Clima", role: "Tiempo en Madrid", toy: "cloud",
      que: "El clima dice la temperatura y el cielo en Madrid ahora.",
      como: "Pulsa Clima. No pide clave ni texto.",
      ejemplo: "clima",
      cmds: ["clima"],
      actions: [{ label: "Ver el tiempo", cmd: "clima" }]
    },
    {
      id: "partidos", group: "gadget", name: "Partidos", role: "Selecciones", toy: "ball",
      que: "Partidos dice si hoy hay un partido importante de selección. Mira el calendario de verdad.",
      como: "Pulsa Partidos. No se inventa el resultado.",
      ejemplo: "partidos",
      cmds: ["partidos"],
      actions: [{ label: "Ver partidos de hoy", cmd: "partidos" }]
    },
    {
      id: "notas", group: "gadget", name: "Notas", role: "Cuaderno", toy: "note",
      que: "Notas guarda una frase en este ordenador.",
      como: "Escribe la frase para guardarla. Ver notas las enseña.",
      ejemplo: "nota comprar café",
      cmds: ["notas", "nota "],
      actions: [
        { label: "Ver notas", cmd: "notas" },
        { label: "Nueva nota", ask: "Qué guardar", prefix: "nota ", placeholder: "comprar café" }
      ]
    },
    {
      id: "lista", group: "gadget", name: "Lista", role: "Pendientes", toy: "check",
      que: "La lista es de tareas o de la compra. Queda en este ordenador.",
      como: "Añades con una frase. Tachas escribiendo la misma frase en Hecho.",
      ejemplo: "lista llamar al banco",
      cmds: ["lista", "lista ", "hecho "],
      actions: [
        { label: "Ver lista", cmd: "lista" },
        { label: "Añadir", ask: "Qué añadir", prefix: "lista ", placeholder: "llamar al banco" },
        { label: "Tachar", ask: "Qué tachar", prefix: "hecho ", placeholder: "llamar al banco" }
      ]
    },
    {
      id: "gastos", group: "gadget", name: "Gastos", role: "Hoy", toy: "coin",
      que: "Gastos anota lo que has gastado hoy y suma el día.",
      como: "Primero el importe y luego qué era. Ver gastos enseña el total de hoy.",
      ejemplo: "gasto 4.50 café",
      cmds: ["gastos", "gasto "],
      actions: [
        { label: "Ver gastos de hoy", cmd: "gastos" },
        { label: "Anotar gasto", ask: "Importe y qué", prefix: "gasto ", placeholder: "4.50 café" }
      ]
    },
    {
      id: "diario", group: "gadget", name: "Diario", role: "Cambios", toy: "note",
      que: "Diario es el resumen de lo que se ha construido en RADIA. No llama a la inteligencia artificial.",
      como: "Escribe diario. En el ordenador también está la pestaña Cambios. En el móvil, el mismo texto está debajo de los gadgets.",
      ejemplo: "diario",
      cmds: ["diario"],
      actions: [{ label: "Ver el resumen", cmd: "diario" }]
    },
    {
      id: "pulse", group: "gadget", name: "Estado", role: "¿Sigue despierto?", toy: "heart",
      que: "Estado es la foto de RADIA ahora: avisos, clientes y gasto de inteligencia artificial. Ping solo comprueba que el cerebro responde.",
      como: "Pulsa Estado si quieres la foto. Ping si solo quieres saber si está encendido.",
      ejemplo: "estado",
      cmds: ["estado", "ping"],
      actions: [
        { label: "Ver estado", cmd: "estado" },
        { label: "Ping", cmd: "ping" }
      ]
    }
  ];

  var page = "pc";
  var storeKey = "radia-guia-pc";
  var box = null;
  var queue = [];
  var touring = false;

  function seen() {
    try { return JSON.parse(localStorage.getItem(storeKey) || "[]"); } catch (e) { return []; }
  }
  function saveSeen(list) {
    try { localStorage.setItem(storeKey, JSON.stringify(list)); } catch (e) {}
  }
  function mark(ids) {
    var cur = seen();
    ids.forEach(function (id) { if (cur.indexOf(id) < 0) cur.push(id); });
    saveSeen(cur);
  }
  function visible() {
    return ITEMS.filter(function (it) { return !it.page || it.page === page; });
  }
  function stations() {
    return visible().filter(function (it) { return it.group === "trabajador" || it.group === "gadget"; });
  }
  function get(id) {
    for (var i = 0; i < ITEMS.length; i++) if (ITEMS[i].id === id) return ITEMS[i];
    return null;
  }
  function unseen() {
    var got = seen();
    return visible().filter(function (it) { return got.indexOf(it.id) < 0; });
  }
  function esc(s) {
    return String(s || "").replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function ensure() {
    if (box) return;
    box = document.createElement("div");
    box.id = "radia-guia";
    box.innerHTML = '<div class="rg-card" role="dialog" aria-modal="true">' +
      '<p class="rg-kicker" id="rg-kicker"></p><h2 id="rg-title"></h2>' +
      '<p id="rg-que"></p><p id="rg-como"></p><p class="rg-ej" id="rg-ej"></p>' +
      '<div class="rg-row" id="rg-row"></div></div>';
    document.body.appendChild(box);
  }
  function paint(it, mode) {
    ensure();
    var kicker = it.group === "gadget" ? "Gadget" : (it.group === "trabajador" ? "Trabajador" : "Empieza aquí");
    document.getElementById("rg-kicker").textContent = kicker;
    document.getElementById("rg-title").textContent = it.name;
    document.getElementById("rg-que").textContent = it.que;
    document.getElementById("rg-como").textContent = it.como;
    document.getElementById("rg-ej").textContent = it.ejemplo ? ("Ejemplo: " + it.ejemplo) : "";
    var row = document.getElementById("rg-row");
    row.innerHTML = "";
    if (mode === "tour") {
      var next = document.createElement("button");
      next.type = "button";
      next.className = "rg-btn";
      next.textContent = queue.length > 1 ? "Siguiente" : "Entendido";
      next.addEventListener("click", function () {
        mark([it.id]);
        queue = unseen();
        if (queue.length) paint(queue[0], "tour");
        else close();
      });
      var hide = document.createElement("button");
      hide.type = "button";
      hide.className = "rg-btn ghost";
      hide.textContent = "No volver a mostrar";
      hide.addEventListener("click", function () {
        mark(unseen().map(function (x) { return x.id; }));
        close();
      });
      row.appendChild(next);
      row.appendChild(hide);
    } else {
      var closeBtn = document.createElement("button");
      closeBtn.type = "button";
      closeBtn.className = "rg-btn";
      closeBtn.textContent = "Cerrar";
      closeBtn.addEventListener("click", close);
      row.appendChild(closeBtn);
    }
    box.className = "on";
  }
  function close() {
    if (box) box.className = "";
    touring = false;
    queue = [];
  }
  function open(id) {
    var it = get(id);
    if (!it) return;
    touring = false;
    paint(it, "read");
  }
  function auto() {
    if (touring) return;
    queue = unseen();
    if (!queue.length) return;
    touring = true;
    paint(queue[0], "tour");
  }
  function list() {
    ensure();
    document.getElementById("rg-kicker").textContent = "Tutoriales";
    document.getElementById("rg-title").textContent = "Cómo se usa cada cosa";
    document.getElementById("rg-que").textContent = "Pulsa una ficha. Los trabajadores son personas. Los gadgets son utilidades del día.";
    document.getElementById("rg-como").textContent = "";
    document.getElementById("rg-ej").textContent = "";
    var row = document.getElementById("rg-row");
    row.innerHTML = "";
    stations().forEach(function (it) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "rg-btn ghost";
      b.textContent = (it.group === "gadget" ? "Gadget · " : "") + it.name;
      b.addEventListener("click", function () { open(it.id); });
      row.appendChild(b);
    });
    var c = document.createElement("button");
    c.type = "button";
    c.className = "rg-btn";
    c.textContent = "Cerrar";
    c.addEventListener("click", close);
    row.appendChild(c);
    box.className = "on";
  }

  var css = document.createElement("style");
  css.textContent = '' +
    '#radia-guia{position:fixed;inset:0;z-index:120;background:rgba(8,9,7,.72);display:none;align-items:flex-end;justify-content:center;padding:16px}' +
    '#radia-guia.on{display:flex}' +
    '#radia-guia .rg-card{background:#1c201a;color:#f3efe6;border:1px solid #3b4136;border-radius:18px;padding:18px 18px 14px;width:min(560px,100%);max-height:min(86vh,760px);overflow:auto;box-shadow:0 18px 50px rgba(0,0,0,.45)}' +
    '#radia-guia .rg-kicker{margin:0 0 4px;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#e2a45c}' +
    '#radia-guia h2{margin:0 0 8px;font-family:Georgia,serif;font-weight:normal;font-size:26px}' +
    '#radia-guia p{margin:0 0 8px;line-height:1.45;font-size:15px;color:#ddd6ca}' +
    '#radia-guia .rg-ej{color:#ffcf8a}' +
    '#radia-guia .rg-row{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}' +
    '#radia-guia .rg-btn{font:inherit;color:#f3efe6;background:#e2a45c;border:0;border-radius:999px;padding:10px 14px;cursor:pointer}' +
    '#radia-guia .rg-btn.ghost{background:transparent;border:1px solid #3b4136;color:#f3efe6}' +
    '@media(min-width:720px){#radia-guia{align-items:center}}';
  document.head.appendChild(css);

  w.RADIA_GUIA = ITEMS;
  w.RadiaGuia = {
    init: function (opts) {
      opts = opts || {};
      page = opts.page || "pc";
      storeKey = opts.store || (page === "mini" ? "radia-guia-mini" : "radia-guia-pc");
    },
    stations: stations,
    get: get,
    open: open,
    auto: auto,
    list: list
  };
})(window);
