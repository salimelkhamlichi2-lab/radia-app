/* Resumen de desarrollo. Lo leen el cerebro del PC y la mini app. */
(function (w) {
  var ITEMS = [
    {
      cuando: "1 de octubre, por la tarde",
      titulo: "Esta noche, en 3 pasos",
      texto: "1. Abre las ofertas de Telegram. 2. Aceptar guarda. Rechazar quita. 3. Copia la frase y mándasela tú al cliente. A las 20:00 te llegan hasta 3. Si quieres verlas antes, escribe hecho. RADIA no se las envía: no tiene tu cuenta."
    },
    {
      cuando: "1 de octubre, por la tarde",
      titulo: "Por la tarde no llueven ofertas",
      texto: "Turno ya no manda una cada media hora. Radar, cuando busca solo, guarda los clientes y no te escribe. A las 20:00 Hecho cierra el día y te deja hasta 3, con la frase lista para copiar. Aceptar guarda. Rechazar quita. Tú la envías: RADIA no tiene tu Instagram ni tu foro. Si quieres una ahora, escribe turno. Si quieres ver las frases sin mandarlas, escribe hecho."
    },
    {
      cuando: "1 de octubre, por la tarde",
      titulo: "Creador, Guía, Ficha, Turno, Hecho y Casa",
      texto: "Creador propone una idea cada hora, de 9 a 20, solo si no hay otra esperando. Lente la mira. Si vale, te llega por Telegram con Aceptar y Rechazar. Aceptar la pone en cola para Cursor. No la construye sola. Guía es la frase de las ofertas. Ficha enseña un cliente. Turno manda una oferta cada media hora en ese horario. Hecho cierra el día a las 20:00. Casa, a las 8:30, junta avisos, lista y gastos. Ciérrala y ábrela otra vez con Abrir RADIA para ver a la gente nueva y los tutoriales."
    },
    {
      cuando: "1 de octubre, de madrugada",
      titulo: "Ofertas con Aceptar y Rechazar",
      texto: "Escribe ofertas. Te llegan por Telegram, de tres en tres. El mensaje al cliente dice que se puede hacer con lo que ya tiene y pregunta si le vale. Aceptar la guarda. Rechazar la quita. No se publica sola en Instagram ni en el foro, porque RADIA no tiene esas cuentas."
    },
    {
      cuando: "1 de octubre, de madrugada",
      titulo: "Para cuando despiertes",
      texto: "Esta noche entraron siete trabajadores y se arregló la mini app: el dibujo ya no tapa el nombre del botón. Ciérrala y ábrela otra vez con Abrir RADIA para verlo."
    },
    {
      cuando: "Hecho esta noche",
      titulo: "Los botones ya se leen",
      texto: "La persona y el gadget estaban sueltos encima del botón y tapaban el nombre. Ahora cada uno está en su caja, encima del nombre, y el nombre se puede pulsar."
    },
    {
      cuando: "Hecho esta noche",
      titulo: "Claro",
      texto: "Pegas el mensaje largo y te lo devuelve corto y humano. No lo envía. En el móvil es un trabajador. En Telegram: claro y el texto."
    },
    {
      cuando: "Hecho esta noche",
      titulo: "Contesta",
      texto: "Cuando alguien te responde, pegas lo que escribió. Te dice en español qué pide y te deja la respuesta para copiar, en su idioma. También: lead 2 respondio y el texto."
    },
    {
      cuando: "Hecho esta noche",
      titulo: "Cobro",
      texto: "lead 2 cerrado 250 anota el dinero y te escribe el mensaje para cobrar. Una vez puedes decir cómo te pagan: cobro pago Bizum."
    },
    {
      cuando: "Hecho esta noche",
      titulo: "Antes",
      texto: "Antes de poner un precio, te da tres preguntas para el cliente. Escribe antes y el problema. Luego usas Presupuesto."
    },
    {
      cuando: "Hecho esta noche",
      titulo: "Mañana",
      texto: "A las 8, si el ordenador está encendido, un solo texto: clientes sin contestar, avisos de hoy y si Cursor terminó algo. Alba sigue mandando las noticias aparte. Puedes probarlo ya con manana."
    },
    {
      cuando: "Hecho esta noche",
      titulo: "Semana",
      texto: "El domingo a las 21:00 resume la semana y dice qué hacer el lunes. Puedes probarlo ya con semana."
    },
    {
      cuando: "Hecho esta noche",
      titulo: "Vigía",
      texto: "Si el cerebro se apaga y el ordenador sigue encendido, te escribe una vez por Telegram. Si apagas el PC, no puede avisar. Se enciende solo al entrar en Windows."
    },
    {
      cuando: "Hecho",
      titulo: "Lente",
      texto: "Revisa una idea antes de crearla. Escribes analiza y el texto. Dice si sigues, si cambias o si paras. No construye nada. La última queda guardada en este PC."
    },
    {
      cuando: "Hecho",
      titulo: "Oficina, tutoriales y núcleo",
      texto: "La mini app y el PC enseñan los mismos trabajadores y los mismos gadgets. Los trabajadores son personas: si trabajan, caminan y luego vuelven a su mesa. Los gadgets (clima, notas, lista) no son personas. Hay un núcleo: si mandas algo desde el móvil, en el PC pone En remoto. La primera vez sale un tutorial. Tutoriales lo vuelve a abrir. No volver a mostrar lo quita."
    },
    {
      cuando: "Hecho esta noche",
      titulo: "Este apartado",
      texto: "Se llama Cambios. En el ordenador es una pestaña. En el móvil está debajo de los gadgets. En Telegram escribes diario."
    },
    {
      cuando: "Sigue igual",
      titulo: "Entrenar agentes horas con Grok",
      texto: "Un par de horas de Grok en automático no deja un empleado más listo dentro de RADIA. Deja texto y código. Las salas que ya tienes (Radar, Presupuesto, Lente, Cursor) ya trabajan cuando tú las llamas, o solas a su hora (Alba a las 8, Seguimiento a las 9, Radar varias veces al día)."
    }
  ];

  function esc(s) {
    return String(s || "").replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function fill(id) {
    var box = document.getElementById(id);
    if (!box) return;
    box.innerHTML = ITEMS.map(function (it) {
      return '<article class="cambio"><p class="cuando">' + esc(it.cuando) + '</p><h3>' + esc(it.titulo) + '</h3><p>' + esc(it.texto) + '</p></article>';
    }).join("");
  }

  var css = document.createElement("style");
  css.textContent = ".cambio{background:rgba(255,255,255,.03);border:1px solid #3b4136;border-radius:14px;padding:12px 14px;margin:0 0 10px}.cambio .cuando{margin:0 0 4px;color:#e2a45c;font-size:12px;letter-spacing:.08em;text-transform:uppercase}.cambio h3{margin:0 0 6px;font-size:16px}.cambio p{margin:0;line-height:1.45;color:#ddd6ca}";
  document.head.appendChild(css);

  w.RADIA_CAMBIOS = ITEMS;
  w.RadiaCambios = { fill: fill };
})(window);
