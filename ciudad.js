/* Ciudad de RADIA: salas con trabajadores, gadgets alrededor y un HUD con hora y clima.
   Lo usan el PC (index.html) y la mini app (app.html). */
(function (w) {
  var SALAS = [
    {
      id: "dinero", name: "Dinero", para: "para cobrar", color: "#39f59a",
      flow: ["Radar busca", "Guía pone la frase", "Hecho te las da a las 20:00", "Tú las mandas", "Contesta y Cobro"],
      ids: ["radar", "guia", "hecho", "turno", "ficha", "presupuesto", "antes", "claro", "contesta", "cobro", "seguimiento"]
    },
    {
      id: "ideas", name: "Ideas", para: "cosas nuevas", color: "#ff4fd8",
      flow: ["Creador propone", "Lente revisa", "Tú aceptas", "Cursor lo hace"],
      ids: ["creador", "lente", "inversor", "director"]
    },
    {
      id: "casa", name: "Casa", para: "tu día", color: "#2ee6d6",
      flow: ["Te avisan solos", "Mañana, semana y noticias"],
      ids: ["casa", "alba", "manana", "semana", "ember", "vigia"]
    },
    {
      id: "preguntar", name: "Preguntar", para: "tus dudas", color: "#4f9dff",
      flow: ["Tú preguntas", "Te contestan"],
      ids: ["ask", "pro", "enlace"]
    },
    {
      id: "taller", name: "Taller", para: "diseños", color: "#a77bff",
      flow: ["Diseños e ideas para vender"],
      ids: ["juego", "nicho"]
    }
  ];
  var OTROS = { id: "otros", name: "Otros", para: "sueltos", color: "#ffd166", flow: ["Ayudantes sueltos"], ids: [] };
  var WX = {
    0: ["Despejado", "sun"], 1: ["Casi despejado", "sun"], 2: ["Algunas nubes", "cloud"], 3: ["Nublado", "cloud"],
    45: ["Niebla", "cloud"], 48: ["Niebla", "cloud"], 51: ["Llovizna", "rain"], 53: ["Llovizna", "rain"], 55: ["Llovizna", "rain"],
    61: ["Lluvia", "rain"], 63: ["Lluvia", "rain"], 65: ["Lluvia fuerte", "rain"], 71: ["Nieve", "snow"], 73: ["Nieve", "snow"],
    75: ["Nieve", "snow"], 80: ["Chubascos", "rain"], 81: ["Chubascos", "rain"], 82: ["Chubascos fuertes", "rain"],
    95: ["Tormenta", "rain"], 96: ["Tormenta", "rain"], 99: ["Tormenta", "rain"]
  };
  var WX_URL = "https://api.open-meteo.com/v1/forecast?latitude=40.42&longitude=-3.70&current=temperature_2m,weather_code,wind_speed_10m&timezone=Europe%2FMadrid";
  var WX_KEY = "radia-clima";

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function rgba(hex, a) {
    var h = hex.replace("#", "");
    return "rgba(" + parseInt(h.slice(0, 2), 16) + "," + parseInt(h.slice(2, 4), 16) + "," + parseInt(h.slice(4, 6), 16) + "," + a + ")";
  }
  function $(id) { return document.getElementById(id); }

  function worker(it, o) {
    return '<button type="button" class="rc-w' + (it.money ? " money" : "") + '" id="' + o.prefix + esc(it.id) + '" style="--shirt:' + esc(it.shirt || "#e2a45c") + '">' +
      '<span class="rc-scene"><span class="rc-glow"></span>' +
      '<span class="rc-p"><i class="rc-h"></i><i class="rc-t"></i><i class="rc-l"><i></i><i></i></i></span>' +
      '<span class="rc-desk"><i class="rc-screen"></i></span></span>' +
      '<b>' + esc(it.name) + '</b><em class="rc-st" data-doing="' + esc(it.role || "trabajando") + '"></em>' +
      (o.badges ? '<span class="badge" id="badge-' + esc(it.id) + '"></span>' : "") +
      '</button>';
  }
  function gadget(it, o) {
    return '<button type="button" class="rc-g" id="' + o.prefix + esc(it.id) + '">' +
      '<i class="rc-toy ' + esc(it.toy || "note") + '"></i>' +
      '<span class="rc-gt"><b>' + esc(it.name) + '</b><em id="rc-g-' + esc(it.id) + '">' + esc(it.role || "") + '</em></span>' +
      (o.badges ? '<span class="badge" id="badge-' + esc(it.id) + '"></span>' : "") +
      '</button>';
  }
  function sala(s, list, o) {
    var flow = s.flow.map(function (f) { return "<span>" + esc(f) + "</span>"; }).join('<i class="rc-arrow"></i>');
    return '<section class="rc-sala" id="rc-sala-' + s.id + '" style="--c:' + s.color + ";--c2:" + rgba(s.color, 0.35) + ";--c3:" + rgba(s.color, 0.08) + '">' +
      '<header><b>' + esc(s.name) + ' <small>' + esc(s.para || "") + '</small></b><span class="rc-count" id="rc-count-' + s.id + '"></span></header>' +
      '<p class="rc-flow">' + flow + '</p>' +
      '<div class="rc-floor">' + list.map(function (it) { return worker(it, o); }).join("") + '</div>' +
      '</section>';
  }

  function build(root, o) {
    o = o || {};
    o.prefix = o.prefix || "rc-";
    var items = (w.RadiaGuia ? w.RadiaGuia.stations() : []);
    var byId = {};
    items.forEach(function (it) { byId[it.id] = it; });
    var used = {};
    var groups = SALAS.map(function (s) {
      var list = s.ids.filter(function (id) { return byId[id] && byId[id].group === "trabajador"; }).map(function (id) { used[id] = 1; return byId[id]; });
      return { s: s, list: list };
    });
    var rest = items.filter(function (it) { return it.group === "trabajador" && !used[it.id]; });
    if (rest.length) groups.push({ s: OTROS, list: rest });
    var gads = items.filter(function (it) { return it.group === "gadget"; });
    var half = Math.ceil(gads.length / 2);

    root.classList.add("rc-box");
    root.innerHTML = '<div class="rc-city">' +
      '<div class="rc-hud">' +
        '<div class="rc-time"><b id="clock">--:--</b><span id="rc-date"></span></div>' +
        '<button type="button" class="rc-core" id="' + (o.coreId || "rc-core") + '"><span class="rc-orb"></span>' +
          '<span class="rc-core-t"><strong>' + esc(o.coreName || "CEREBRO") + '</strong><span id="' + (o.stateId || "rc-core-state") + '">' + esc(o.stateText || "En casa") + '</span></span></button>' +
        '<div class="rc-wx"><i class="rc-wx-ico cloud" id="rc-wx-ico"></i><span><b id="rc-wx-t">--°</b><span id="rc-wx-d">Madrid</span></span></div>' +
        '<div class="rc-now" id="rc-now"></div>' +
      '</div>' +
      '<aside class="rc-dock rc-dock-l">' + gads.slice(0, half).map(function (it) { return gadget(it, o); }).join("") + '</aside>' +
      (o.town ? '<div class="rc-town" id="rc-town"></div>' : '') +
      '<div class="rc-salas"' + (o.town ? ' hidden' : '') + '>' + groups.filter(function (g) { return g.list.length; }).map(function (g) { return sala(g.s, g.list, o); }).join("") + '</div>' +
      '<aside class="rc-dock rc-dock-r">' + gads.slice(half).map(function (it) { return gadget(it, o); }).join("") + '</aside></div>';

    if (o.hudExtra) root.querySelector(".rc-hud").appendChild(o.hudExtra);
    items.forEach(function (it) {
      var el = $(o.prefix + it.id);
      if (el && o.onPick) el.addEventListener("click", function () { o.onPick(it); });
    });
    var core = $(o.coreId || "rc-core");
    if (core && o.onCore) core.addEventListener("click", o.onCore);

    var pending = false;
    function recount() {
      pending = false;
      var total = 0, busy = 0;
      groups.forEach(function (g) {
        if (!g.list.length) return;
        var n = 0;
        g.list.forEach(function (it) {
          var el = $(o.prefix + it.id);
          if (el && (el.classList.contains("busy") || el.classList.contains("pbusy"))) n++;
        });
        total += g.list.length; busy += n;
        var c = $("rc-count-" + g.s.id);
        if (c) c.innerHTML = n ? '<i class="rc-dot on"></i>' + n + " trabajando" : '<i class="rc-dot"></i>quietos';
        var box = $("rc-sala-" + g.s.id);
        if (box && box.classList.contains("live") !== !!n) box.classList.toggle("live", !!n);
      });
      var now = $("rc-now");
      if (now) now.innerHTML = '<span><i class="rc-dot on"></i>' + busy + ' trabajando</span><span><i class="rc-dot"></i>' + (total - busy) + ' quietos</span><span class="rc-tip">Toca un muñeco para usarlo</span>';
    }
    function later() { if (!pending) { pending = true; (w.requestAnimationFrame || setTimeout)(recount); } }
    if (w.MutationObserver) {
      new MutationObserver(function (recs) {
        for (var i = 0; i < recs.length; i++) {
          var t = recs[i].target;
          if (t.classList && t.classList.contains("rc-w")) { later(); return; }
        }
      }).observe(root, { attributes: true, attributeFilter: ["class"], subtree: true });
    } else {
      setInterval(recount, 2000);
    }
    recount();

    function tick() {
      var d = new Date();
      var hm = d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Madrid" });
      var c = $("clock"); if (c) c.textContent = hm;
      var dd = $("rc-date"); if (dd) dd.textContent = d.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long", timeZone: "Europe/Madrid" });
      var g = $("rc-g-reloj"); if (g) g.textContent = hm;
    }
    tick();
    setInterval(tick, 10000);
    weather();
    setInterval(weather, 20 * 60000);
    var town = null;
    if (o.town && w.RadiaPueblo) {
      town = w.RadiaPueblo.mount($("rc-town"), {
        items: items, salas: SALAS, coreName: o.coreName, base: o.liveBase, feed: o.feed, offlineText: o.offlineText,
        maxHeight: o.townMaxHeight,
        isBusy: function (id) { var el = $(o.prefix + id); return !!(el && el.classList.contains("busy")); },
        mark: function (id, on) { var el = $(o.prefix + id); if (el && el.classList.contains("pbusy") !== on) el.classList.toggle("pbusy", on); },
        onPick: function (it) { if (o.onPick) o.onPick(it); }
      });
    }
    return { recount: recount, town: town };
  }

  function paintWx(v) {
    var info = WX[v.code] || ["Madrid", "cloud"];
    var t = Math.round(v.temp) + "°";
    var ico = $("rc-wx-ico"); if (ico) ico.className = "rc-wx-ico " + info[1];
    var tt = $("rc-wx-t"); if (tt) tt.textContent = t;
    var dd = $("rc-wx-d"); if (dd) dd.textContent = info[0] + " · Madrid";
    var g = $("rc-g-clima"); if (g) g.textContent = t + " " + info[0].toLowerCase();
  }
  function weather() {
    try {
      var c = JSON.parse(localStorage.getItem(WX_KEY) || "null");
      if (c && Date.now() - c.at < 15 * 60000) { paintWx(c); return; }
      if (c) paintWx(c);
    } catch (e) {}
    if (!w.fetch) return;
    fetch(WX_URL).then(function (r) { return r.json(); }).then(function (j) {
      var cur = j && j.current;
      if (!cur) return;
      var v = { temp: cur.temperature_2m, code: cur.weather_code, at: Date.now() };
      paintWx(v);
      try { localStorage.setItem(WX_KEY, JSON.stringify(v)); } catch (e) {}
    }).catch(function () {});
  }

  var css = '' +
    '.rc-box{container-type:inline-size;min-width:0}' +
    '.rc-city{position:relative;display:grid;gap:12px;grid-template-columns:minmax(0,1fr);grid-template-areas:"hud" "dl" "dr" "salas";' +
      'padding:12px;border-radius:18px;color:#eaf4ff;' +
      'background:radial-gradient(700px 300px at 20% 0%,rgba(79,157,255,.16),transparent 70%),radial-gradient(600px 300px at 90% 100%,rgba(255,79,216,.12),transparent 70%),' +
      'linear-gradient(rgba(79,157,255,.05) 1px,transparent 1px) 0 0/24px 24px,linear-gradient(90deg,rgba(79,157,255,.05) 1px,transparent 1px) 0 0/24px 24px,#070a14}' +
    '.rc-hud{grid-area:hud;display:grid;grid-template-columns:1fr auto;grid-template-areas:"time wx" "core core" "now now";gap:10px;align-items:center;padding:10px 12px;' +
      'border:1px solid rgba(79,157,255,.45);border-radius:16px;background:linear-gradient(180deg,rgba(14,22,44,.92),rgba(8,12,26,.92));box-shadow:0 0 24px rgba(79,157,255,.18),inset 0 0 20px rgba(79,157,255,.06)}' +
    '.rc-time{grid-area:time;display:flex;flex-direction:column;line-height:1}' +
    '.rc-time b{font:700 34px/1 "Segoe UI",system-ui,sans-serif;font-variant-numeric:tabular-nums;letter-spacing:.04em;color:#bfe3ff;text-shadow:0 0 14px rgba(79,157,255,.8)}' +
    '.rc-time span{margin-top:5px;font-size:12px;color:#8fa6c8;text-transform:capitalize}' +
    '.rc-core{grid-area:core;justify-self:stretch;display:flex;align-items:center;gap:10px;min-width:0;padding:6px 14px 6px 6px;cursor:pointer;color:#eaf4ff;font:inherit;' +
      'border:1px solid rgba(255,209,102,.55);border-radius:999px;background:rgba(255,209,102,.06);box-shadow:0 0 18px rgba(255,209,102,.18)}' +
    '.rc-core.on{box-shadow:0 0 0 2px rgba(255,209,102,.35),0 0 26px rgba(255,209,102,.3)}' +
    '.rc-orb{width:38px;height:38px;flex:none;border-radius:50%;background:radial-gradient(circle at 40% 38%,#fff8e1,#ffd166 40%,#7a4e10 78%);box-shadow:0 0 16px rgba(255,209,102,.7)}' +
    '.rc-core-t{display:flex;flex-direction:column;text-align:left;min-width:0}' +
    '.rc-core-t strong{font-size:12px;letter-spacing:.18em}' +
    '.rc-core-t span{font-size:12px;color:#c9b98a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
    '.rc-core.busy .rc-orb,.rc-core.remote .rc-orb{animation:rc-pulse 1s ease-in-out infinite}' +
    '.rc-core.remote{border-color:#2ee6d6;box-shadow:0 0 24px rgba(46,230,214,.45)}' +
    '.rc-core.remote .rc-orb{background:radial-gradient(circle at 40% 38%,#f0fffd,#2ee6d6 45%,#0d5a52 80%)}' +
    '@keyframes rc-pulse{50%{transform:scale(1.1);box-shadow:0 0 26px rgba(255,209,102,.95)}}' +
    '.rc-wx{grid-area:wx;display:flex;align-items:center;gap:8px;justify-self:end}' +
    '.rc-wx>span{display:flex;flex-direction:column;line-height:1.1}' +
    '.rc-wx b{font-size:24px;color:#ffe9a8;text-shadow:0 0 10px rgba(255,209,102,.6)}' +
    '.rc-wx>span>span{font-size:11px;color:#8fa6c8}' +
    '.rc-wx-ico{position:relative;width:30px;height:30px;flex:none}' +
    '.rc-wx-ico.sun{border-radius:50%;background:#ffd166;box-shadow:0 0 16px #ffd166}' +
    '.rc-wx-ico.cloud::before,.rc-wx-ico.rain::before,.rc-wx-ico.snow::before{content:"";position:absolute;left:0;right:0;top:8px;height:14px;border-radius:9px;background:#cfe0f2;box-shadow:6px -6px 0 -1px #cfe0f2}' +
    '.rc-wx-ico.rain::after{content:"";position:absolute;left:8px;top:25px;width:2px;height:5px;background:#4f9dff;box-shadow:6px 0 0 #4f9dff,12px 0 0 #4f9dff}' +
    '.rc-wx-ico.snow::after{content:"";position:absolute;left:8px;top:25px;width:3px;height:3px;border-radius:50%;background:#fff;box-shadow:6px 0 0 #fff,12px 0 0 #fff}' +
    '.rc-now{grid-area:now;display:flex;flex-wrap:wrap;gap:6px 14px;font-size:13px;color:#cfe0f2}' +
    '.rc-now span{display:inline-flex;align-items:center;gap:6px}' +
    '.rc-now .rc-tip{color:#ffe9a8}' +
    '.rc-dot{display:inline-block;width:8px;height:8px;border-radius:50%;background:#46506a;margin-right:5px;vertical-align:middle}' +
    '.rc-now .rc-dot{margin-right:0}' +
    '.rc-dot.on{background:#39f59a;box-shadow:0 0 8px #39f59a;animation:rc-blink 1.2s ease-in-out infinite}' +
    '@keyframes rc-blink{50%{opacity:.35}}' +
    '.rc-dock{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:6px}' +
    '.rc-dock-l{grid-area:dl}.rc-dock-r{grid-area:dr}' +
    '.rc-g{position:relative;display:flex;flex-direction:column;align-items:center;gap:4px;min-width:0;padding:8px 4px;cursor:pointer;font:inherit;color:#eaf4ff;text-align:center;' +
      'border:1px solid rgba(255,209,102,.3);border-radius:12px;background:rgba(20,24,40,.85)}' +
    '.rc-g:hover,.rc-g.on{border-color:#ffd166;box-shadow:0 0 14px rgba(255,209,102,.35)}' +
    '.rc-gt{display:flex;flex-direction:column;min-width:0;width:100%}' +
    '.rc-g b{font-size:12px}' +
    '.rc-g em{font-style:normal;font-size:10px;color:#8fa6c8;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}' +
    '.rc-toy{display:block;width:22px;height:22px;border-radius:6px;background:#2a3456;flex:none}' +
    '.rc-toy.clock{border-radius:50%;background:#16203a;box-shadow:inset 0 0 0 3px #2ee6d6,0 0 8px rgba(46,230,214,.6)}' +
    '.rc-toy.cloud{background:#cfe0f2;border-radius:11px;height:14px;margin:4px 0}' +
    '.rc-toy.ball{border-radius:50%;background:radial-gradient(circle at 40% 40%,#fff,#ffd166 60%)}' +
    '.rc-toy.note{background:#f4efe4;border-radius:3px 7px 7px 3px}' +
    '.rc-toy.check{background:#10261c;box-shadow:inset 0 0 0 2px #39f59a}' +
    '.rc-toy.coin{border-radius:50%;background:#ffd166;box-shadow:0 0 8px rgba(255,209,102,.6)}' +
    '.rc-toy.heart{border-radius:50%;background:#ff5d73;box-shadow:0 0 8px rgba(255,93,115,.6)}' +
    '.rc-g.busy .rc-toy{animation:rc-wob .8s ease-in-out infinite}' +
    '@keyframes rc-wob{50%{transform:translateY(-4px) rotate(-8deg)}}' +
    '.rc-town{grid-area:salas;min-width:0}' +
    '.rc-salas[hidden]{display:none!important}' +
    '.rc-salas{grid-area:salas;display:grid;grid-template-columns:minmax(0,1fr);gap:12px;min-width:0}' +
    '.rc-sala{min-width:0;padding:10px;border:1px solid var(--c2);border-radius:16px;background:linear-gradient(180deg,rgba(10,14,28,.9),rgba(6,9,20,.9));box-shadow:inset 0 0 22px var(--c3)}' +
    '.rc-sala.live{border-color:var(--c);box-shadow:0 0 22px var(--c2),inset 0 0 26px var(--c3)}' +
    '.rc-sala header{display:flex;justify-content:space-between;align-items:center;gap:8px}' +
    '.rc-sala header b{font-size:14px;letter-spacing:.2em;text-transform:uppercase;color:var(--c);text-shadow:0 0 10px var(--c2)}' +
    '.rc-sala header small{margin-left:6px;font-size:12px;font-weight:400;letter-spacing:0;text-transform:none;color:#cfe0f2;text-shadow:none}' +
    '.rc-count{font-size:12px;color:#cfe0f2;white-space:nowrap}' +
    '.rc-flow{display:flex;flex-wrap:wrap;align-items:center;gap:4px;margin:6px 0 8px;font-size:12px;color:#b8c6dd}' +
    '.rc-flow span{padding:2px 7px;border-radius:999px;background:var(--c3);border:1px solid var(--c2)}' +
    '.rc-arrow{display:inline-block;width:0;height:0;border-left:6px solid var(--c);border-top:4px solid transparent;border-bottom:4px solid transparent}' +
    '.rc-floor{display:grid;grid-template-columns:repeat(auto-fill,minmax(76px,1fr));gap:6px;padding:6px;border-radius:12px;' +
      'background:linear-gradient(var(--c3) 1px,transparent 1px) 0 0/16px 16px,linear-gradient(90deg,var(--c3) 1px,transparent 1px) 0 0/16px 16px,rgba(0,0,0,.25)}' +
    '.rc-w{position:relative;display:flex;flex-direction:column;align-items:center;min-width:0;padding:4px 3px 6px;cursor:pointer;font:inherit;color:#eaf4ff;text-align:center;' +
      'border:1px solid transparent;border-radius:12px;background:transparent;transition:border-color .2s,background .2s}' +
    '.rc-w:hover,.rc-w:focus-visible{border-color:var(--c2);background:var(--c3)}' +
    '.rc-w.on{border-color:var(--c);background:var(--c3);box-shadow:0 0 12px var(--c2)}' +
    '.rc-w b{font-size:11.5px;line-height:1.2;width:100%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
    '.rc-st{display:block;font-style:normal;font-size:10px;line-height:1.2;color:#6f7d96;width:100%;overflow-wrap:anywhere}' +
    '.rc-st::before{content:"quieto"}' +
    '.rc-w.busy .rc-st{color:var(--c);font-weight:600}' +
    '.rc-w.busy .rc-st::before{content:"trabajando: " attr(data-doing)}' +
    '.rc-scene{position:relative;display:block;width:100%;height:62px;margin-bottom:3px}' +
    '.rc-glow{position:absolute;left:50%;bottom:2px;width:46px;height:10px;margin-left:-23px;border-radius:50%;background:transparent}' +
    '.rc-w.busy .rc-glow{background:radial-gradient(closest-side,var(--c),transparent);animation:rc-blink 1.2s ease-in-out infinite}' +
    '.rc-p{position:absolute;left:50%;bottom:6px;width:24px;margin-left:-25px;filter:saturate(.5) brightness(.8)}' +
    '.rc-h{display:block;width:15px;height:15px;margin:0 auto;border-radius:3px;background:#f3d2b5;box-shadow:inset 0 3px 0 #3a2a20}' +
    '.rc-t{display:block;width:20px;height:15px;margin:1px auto 0;border-radius:3px 3px 1px 1px;background:var(--shirt)}' +
    '.rc-l{display:flex;justify-content:center;gap:2px}' +
    '.rc-l i{display:block;width:6px;height:10px;border-radius:1px;background:#2a3047}' +
    '.rc-desk{position:absolute;left:50%;bottom:6px;width:30px;height:16px;margin-left:2px;border-radius:2px;background:#1b2238;border-top:2px solid #39425e}' +
    '.rc-screen{position:absolute;left:4px;top:-19px;width:22px;height:16px;border-radius:2px;background:#11182b;border:1px solid #39425e}' +
    '.rc-w.busy .rc-p{filter:none;animation:rc-pace 1.6s ease-in-out infinite}' +
    '.rc-w.busy .rc-l i{animation:rc-step .3s ease-in-out infinite alternate}' +
    '.rc-w.busy .rc-l i:last-child{animation-delay:.15s}' +
    '.rc-w.busy .rc-screen{background:linear-gradient(var(--c) 2px,transparent 2px) 0 0/100% 4px,rgba(0,0,0,.4);border-color:var(--c);box-shadow:0 0 10px var(--c);animation:rc-scroll .8s linear infinite}' +
    '@keyframes rc-pace{0%,100%{transform:translateX(0)}50%{transform:translateX(-10px) translateY(-3px)}}' +
    '@keyframes rc-step{to{transform:scaleY(.55) translateY(2px)}}' +
    '@keyframes rc-scroll{to{background-position:0 -4px,0 0}}' +
    '.rc-w .badge,.rc-g .badge{position:absolute;top:-4px;right:-4px;min-width:18px;height:18px;padding:0 5px;border-radius:999px;background:#39f59a;color:#04140b;font-size:11px;font-weight:700;display:none;place-items:center;box-shadow:0 0 10px rgba(57,245,154,.7)}' +
    '.rc-w .badge.show,.rc-g .badge.show{display:grid}' +
    '@container (min-width:460px){.rc-hud{grid-template-columns:auto 1fr auto;grid-template-areas:"time core wx" "now now now"}.rc-core{justify-self:center}}' +
    '@container (min-width:560px){.rc-salas{grid-template-columns:repeat(2,minmax(0,1fr))}.rc-sala#rc-sala-dinero{grid-column:1/-1}}' +
    '@container (min-width:640px){' +
      '.rc-city{grid-template-columns:88px minmax(0,1fr) 88px;grid-template-areas:"hud hud hud" "dl salas dr"}' +
      '.rc-hud{grid-template-columns:auto 1fr auto auto;grid-template-areas:"time core now wx"}' +
      '.rc-now{flex-direction:column;gap:4px}' +
      '.rc-time b{font-size:44px}' +
      '.rc-dock{grid-template-columns:1fr;align-content:start}' +
      '.rc-g{padding:10px 4px}' +
    '}' +
    '@media (prefers-reduced-motion:reduce){.rc-city *{animation:none!important}}';
  var tag = document.createElement("style");
  tag.textContent = css;
  document.head.appendChild(tag);

  w.RadiaCiudad = { build: build, salas: SALAS };
})(window);
