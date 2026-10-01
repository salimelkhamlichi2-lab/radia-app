/* Resumen de desarrollo. Lo leen el cerebro del PC y la mini app. */
(function (w) {
  var ITEMS = [
    {
      cuando: "1 de octubre, de madrugada",
      titulo: "Para cuando despiertes",
      texto: "No he dejado una inteligencia artificial entrenando durante horas. Entrenar un modelo aquí no te crea un trabajador nuevo: gasta el cupo del día y, al cerrar el chat, se para. Lo que sí queda hecho, sin que pulses nada, es este apartado y el comando diario."
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
      cuando: "Cuando digas que sí",
      titulo: "Claro",
      texto: "Útil de verdad. Reescribe el mensaje que vas a mandar a un cliente para que suene corto y humano. No lo he creado: cada uso llama a la IA y quería tu sí."
    },
    {
      cuando: "Cuando digas que sí",
      titulo: "Mañana",
      texto: "A las 8, además de las noticias, un solo texto con tus clientes sin contestar, los avisos del día y si Cursor terminó algo. No lo he creado para no despertarte con un mensaje nuevo sin pedirlo."
    },
    {
      cuando: "Cuando digas que sí",
      titulo: "Vigía",
      texto: "Te avisa por Telegram si el cerebro del PC se apaga. Útil si dejas el ordenador encendido. No lo he creado: hay que probar que no avise de más."
    },
    {
      cuando: "No merece la pena ahora",
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
