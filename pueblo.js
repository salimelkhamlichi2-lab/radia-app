/* Pueblo de RADIA: mapa pixel con neón. Cada sala es un edificio con mesas.
   Los agentes caminan de verdad: van a su mesa cuando hay trabajo real (radia-pueblo.json),
   llevan el paquete al siguiente cuando le pasan el trabajo, y descansan o duermen si no hay nada. */
(function (w) {
  var T = 16;
  var LAYOUTS = {
    alto: {
      cols: 30, rows: 38,
      rooms: { dinero: [1, 1, 15, 10, "b"], ideas: [17, 1, 12, 10, "b"], preguntar: [1, 14, 9, 8, "t"], taller: [20, 14, 9, 8, "t"], casa: [1, 26, 12, 9, "t"], otros: [14, 32, 6, 5, "t"] },
      plaza: [11, 14, 8, 8], cafe: [21, 26, 8, 10], houses: [[14, 25, 5, 4], [14, 29, 5, 3]],
      roads: [[0, 11, 30, 2], [0, 23, 30, 2], [10, 13, 1, 10], [19, 13, 1, 10]]
    },
    ancho: {
      cols: 50, rows: 30,
      rooms: { dinero: [1, 1, 17, 10, "b"], ideas: [32, 1, 17, 10, "b"], preguntar: [1, 14, 10, 8, "t"], taller: [13, 14, 10, 8, "t"], casa: [25, 14, 12, 8, "t"], otros: [1, 24, 8, 5, "t"] },
      plaza: [20, 1, 10, 10], cafe: [39, 14, 10, 8], houses: [[12, 24, 5, 4], [19, 24, 5, 4], [26, 24, 5, 4], [33, 24, 5, 4]],
      roads: [[0, 11, 50, 2], [0, 22, 50, 2], [18, 0, 1, 11], [30, 0, 1, 11], [11, 13, 1, 9], [23, 13, 1, 9], [37, 13, 1, 9]]
    }
  };
  var ROOM_OF = {
    escritorio: "notas", pulse: "pulse", estado: "pulse", director: "director", radar: "radar", lente: "lente", creador: "creador",
    guia: "guia", hecho: "hecho", ficha: "ficha", turno: "turno", casa: "casa", juego: "juego", inversor: "inversor", nicho: "nicho",
    presupuesto: "presupuesto", claro: "claro", contesta: "contesta", cobro: "cobro", antes: "antes", seguimiento: "seguimiento",
    manana: "manana", semana: "semana", vigia: "vigia", ember: "ember", enlace: "enlace", ask: "ask", pro: "pro", alba: "alba"
  };
  var HAIR = ["#2b1d14", "#5a3a22", "#d9b26a", "#1d1d2b", "#8a3b2b", "#c7c7d6", "#3b2b4b"];
  var SKIN = ["#f3d2b5", "#e0b08a", "#c68a5e", "#8d5a3b", "#f5dcc8"];

  function hash(s) { var h = 7; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; }
  function madridHour() {
    var s = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Europe/Madrid" });
    var p = s.split(":");
    return (+p[0]) + (+p[1]) / 60;
  }
  function hhmm(iso) {
    try { return new Date(iso).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Madrid" }); } catch (e) { return ""; }
  }
  function dayOf(d) {
    try { return d.toLocaleDateString("sv-SE", { timeZone: "Europe/Madrid" }); } catch (e) { return ""; }
  }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; });
  }

  /* ---------- montón binario para A* ---------- */
  function Heap() { this.a = []; }
  Heap.prototype.push = function (n) {
    var a = this.a; a.push(n); var i = a.length - 1;
    while (i > 0) { var p = (i - 1) >> 1; if (a[p].f <= a[i].f) break; var t = a[p]; a[p] = a[i]; a[i] = t; i = p; }
  };
  Heap.prototype.pop = function () {
    var a = this.a, top = a[0], last = a.pop();
    if (a.length) {
      a[0] = last; var i = 0;
      for (;;) {
        var l = i * 2 + 1, r = l + 1, m = i;
        if (l < a.length && a[l].f < a[m].f) m = l;
        if (r < a.length && a[r].f < a[m].f) m = r;
        if (m === i) break;
        var t = a[m]; a[m] = a[i]; a[i] = t; i = m;
      }
    }
    return top;
  };

  function mount(box, o) {
    o = o || {};
    var salas = o.salas || [];
    var items = (o.items || []).filter(function (it) { return it.group === "trabajador"; });
    var byId = {};
    items.forEach(function (it) { byId[it.id] = it; });
    var salaOf = {};
    salas.forEach(function (s) { s.ids.forEach(function (id) { if (byId[id]) salaOf[id] = s; }); });
    var otros = { id: "otros", name: "Otros", para: "sueltos", color: "#ffd166", flow: ["Ayudantes sueltos"], ids: [] };
    items.forEach(function (it) { if (!salaOf[it.id]) { salaOf[it.id] = otros; otros.ids.push(it.id); } });
    var salaById = {};
    salas.concat([otros]).forEach(function (s) { salaById[s.id] = s; });

    box.classList.add("pt-box");
    box.innerHTML =
      '<div class="pt-bar"><span class="pt-live" id="pt-live"><i></i><b>Conectando…</b></span><span class="pt-legend"><i class="on"></i>trabaja <i></i>descansa <i class="zz"></i>duerme</span><button type="button" class="pt-zoom" id="pt-zoom">Acercar</button></div>' +
      '<div class="pt-wrap"><canvas class="pt-cv"></canvas><div class="pt-tip" id="pt-tip"></div></div>' +
      '<div class="pt-feed"><b>Lo último que han hecho de verdad</b><ol id="pt-feed"><li class="pt-empty">Todavía nada hoy.</li></ol></div>';
    var cv = box.querySelector("canvas");
    var ctx = cv.getContext("2d");
    var tip = box.querySelector("#pt-tip");
    var L, grid, cost, bg, desks, scale = 1, dpr = 1, cssW = 0, cssH = 0;
    var agents = [];
    var feed = { busy: {}, agents: {}, events: [] };
    var seenEv = {};
    var firstFeed = true;
    var selected = null;
    var rain = [];
    var raining = false;
    var tipTimer = 0;
    var zoomed = false;

    /* ---------- mapa ---------- */
    function build() {
      var wide = box.clientWidth >= 620;
      L = LAYOUTS[wide ? "ancho" : "alto"];
      var C = L.cols, R = L.rows;
      grid = []; cost = [];
      for (var y = 0; y < R; y++) { grid.push([]); cost.push([]); for (var x = 0; x < C; x++) { grid[y].push("g"); cost[y].push(3); } }
      function fill(r, ch, c) { for (var y = r[1]; y < r[1] + r[3]; y++) for (var x = r[0]; x < r[0] + r[2]; x++) if (grid[y] && grid[y][x] !== undefined) { grid[y][x] = ch; cost[y][x] = c; } }
      L.roads.forEach(function (r) { fill(r, "r", 1); });
      fill(L.plaza, "p", 1);
      var c = L.cafe;
      fill(c, "p", 2);
      fill([c[0] + 1, c[1] + Math.floor(c[3] / 2), c[2] - 2, Math.ceil(c[3] / 2) - 1], "w", Infinity);
      L.houses.forEach(function (h) { fill(h, "h", Infinity); grid[h[1] + h[3] - 1][h[0] + (h[2] >> 1)] = "hd"; cost[h[1] + h[3] - 1][h[0] + (h[2] >> 1)] = 1; });
      for (var x2 = 0; x2 < C; x2++) { grid[0][x2] = grid[0][x2] === "r" ? "r" : "t"; grid[R - 1][x2] = grid[R - 1][x2] === "r" ? "r" : "t"; }
      for (var y2 = 0; y2 < R; y2++) { if (grid[y2][0] !== "r") grid[y2][0] = "t"; if (grid[y2][C - 1] !== "r") grid[y2][C - 1] = "t"; }
      for (var yy = 0; yy < R; yy++) for (var xx = 0; xx < C; xx++) if (grid[yy][xx] === "t") cost[yy][xx] = Infinity;
      desks = {};
      Object.keys(L.rooms).forEach(function (sid) {
        var r = L.rooms[sid];
        if (!salaById[sid] || (sid === "otros" && !otros.ids.length)) { fill([r[0], r[1], r[2], r[3]], "g", 3); return; }
        fill(r, "f", 2);
        for (var x = r[0]; x < r[0] + r[2]; x++) { grid[r[1]][x] = "x"; grid[r[1] + r[3] - 1][x] = "x"; cost[r[1]][x] = cost[r[1] + r[3] - 1][x] = Infinity; }
        for (var y = r[1]; y < r[1] + r[3]; y++) { grid[y][r[0]] = "x"; grid[y][r[0] + r[2] - 1] = "x"; cost[y][r[0]] = cost[y][r[0] + r[2] - 1] = Infinity; }
        var dx = r[0] + (r[2] >> 1), dy = r[4] === "b" ? r[1] + r[3] - 1 : r[1];
        grid[dy][dx] = "d"; cost[dy][dx] = 1; grid[dy][dx - 1] = "d"; cost[dy][dx - 1] = 1;
        r.door = [dx, dy];
        var spots = [];
        var top = r[1] + 1, bottom = r[1] + r[3] - 2;
        var startY = r[4] === "t" ? top + 1 : top;
        for (var ry = startY; ry + 1 <= bottom - (r[4] === "b" ? 1 : 0); ry += 3) {
          for (var rx = r[0] + 2; rx < r[0] + r[2] - 2; rx += 2) spots.push([rx, ry]);
        }
        desks[sid] = { list: spots, used: 0, room: r };
        spots.forEach(function (s) { grid[s[1]][s[0]] = "k"; cost[s[1]][s[0]] = Infinity; });
      });
      paintStatic();
    }
    function inRoom(sid) {
      var r = L.rooms[sid]; if (!r) return null;
      for (var n = 0; n < 30; n++) {
        var x = r[0] + 1 + Math.floor(Math.random() * (r[2] - 2)), y = r[1] + 1 + Math.floor(Math.random() * (r[3] - 2));
        if (cost[y][x] < Infinity) return [x, y];
      }
      return r.door;
    }
    function outdoor(kind) {
      var a = kind === "cafe" ? L.cafe : L.plaza;
      for (var n = 0; n < 40; n++) {
        var x = a[0] + Math.floor(Math.random() * a[2]), y = a[1] + Math.floor(Math.random() * a[3]);
        if (cost[y] && cost[y][x] < Infinity) return [x, y];
      }
      return [a[0], a[1]];
    }
    function nearestHouse(x, y) {
      var best = null, bd = 1e9;
      L.houses.forEach(function (h) { var d = Math.abs(h[0] - x) + Math.abs(h[1] - y); if (d < bd) { bd = d; best = h; } });
      return best ? [best[0] + (best[2] >> 1), best[1] + best[3] - 1] : [1, 1];
    }

    function path(sx, sy, tx, ty) {
      var C = L.cols, R = L.rows;
      if (sx === tx && sy === ty) return [];
      var key = function (x, y) { return y * C + x; };
      var g = {}, from = {}, open = new Heap(), closed = {};
      g[key(sx, sy)] = 0;
      open.push({ x: sx, y: sy, f: 0 });
      var D = [[1, 0], [-1, 0], [0, 1], [0, -1]];
      var steps = 0;
      while (open.a.length && steps++ < 4000) {
        var n = open.pop(), k = key(n.x, n.y);
        if (closed[k]) continue;
        closed[k] = 1;
        if (n.x === tx && n.y === ty) {
          var out = [], cur = k;
          while (cur !== key(sx, sy)) { out.push([cur % C, Math.floor(cur / C)]); cur = from[cur]; }
          return out.reverse();
        }
        for (var i = 0; i < 4; i++) {
          var nx = n.x + D[i][0], ny = n.y + D[i][1];
          if (nx < 0 || ny < 0 || nx >= C || ny >= R) continue;
          var c = (nx === tx && ny === ty) ? 1 : cost[ny][nx];
          if (c === Infinity) continue;
          var nk = key(nx, ny), ng = g[k] + c;
          if (g[nk] === undefined || ng < g[nk]) {
            g[nk] = ng; from[nk] = k;
            open.push({ x: nx, y: ny, f: ng + Math.abs(tx - nx) + Math.abs(ty - ny) });
          }
        }
      }
      return [];
    }

    /* ---------- dibujo estático ---------- */
    function paintStatic() {
      var C = L.cols, R = L.rows;
      bg = document.createElement("canvas");
      bg.width = C * T; bg.height = R * T;
      var b = bg.getContext("2d");
      for (var y = 0; y < R; y++) for (var x = 0; x < C; x++) {
        var ch = grid[y][x], px = x * T, py = y * T, hv = hash(x + "," + y);
        if (ch === "g" || ch === "t") {
          b.fillStyle = hv % 5 ? "#173b2a" : "#1b4431"; b.fillRect(px, py, T, T);
          if (hv % 7 === 0) { b.fillStyle = "#2a5c3f"; b.fillRect(px + (hv % 11), py + (hv % 13), 2, 2); }
          if (hv % 23 === 0) { b.fillStyle = "#ff7ab8"; b.fillRect(px + 6, py + 7, 2, 2); }
        } else if (ch === "r") {
          b.fillStyle = "#1e2236"; b.fillRect(px, py, T, T);
          b.fillStyle = "#262b45"; b.fillRect(px, py, T, 1);
          if ((x + y) % 3 === 0) { b.fillStyle = "rgba(79,157,255,.55)"; b.fillRect(px + 5, py + 7, 6, 2); }
        } else if (ch === "p") {
          b.fillStyle = (x + y) % 2 ? "#2b2f4a" : "#30355a"; b.fillRect(px, py, T, T);
          b.fillStyle = "rgba(255,209,102,.08)"; b.fillRect(px, py, T, 1);
        } else if (ch === "w") {
          b.fillStyle = "#123a6b"; b.fillRect(px, py, T, T);
          b.fillStyle = "#1c5aa0"; b.fillRect(px + (hv % 8), py + 4 + (hv % 6), 5, 1);
        } else if (ch === "f" || ch === "k" || ch === "d") {
          b.fillStyle = (x + y) % 2 ? "#141a30" : "#171e38"; b.fillRect(px, py, T, T);
        } else if (ch === "x") {
          b.fillStyle = "#0b0f1f"; b.fillRect(px, py, T, T);
        }
        if (ch === "t") {
          b.fillStyle = "#0f2a1c"; b.fillRect(px + 2, py + 2, 12, 12);
          b.fillStyle = "#2f7a4b"; b.fillRect(px + 3, py + 1, 10, 9);
          b.fillStyle = "#3f9a5f"; b.fillRect(px + 5, py + 2, 4, 3);
          b.fillStyle = "#4a2f1f"; b.fillRect(px + 7, py + 10, 2, 4);
        }
      }
      Object.keys(L.rooms).forEach(function (sid) {
        var r = L.rooms[sid], s = salaById[sid];
        if (!s || !desks[sid]) return;
        b.save();
        b.strokeStyle = s.color; b.lineWidth = 2; b.shadowColor = s.color; b.shadowBlur = 8;
        b.strokeRect(r[0] * T + 3, r[1] * T + 3, r[2] * T - 6, r[3] * T - 6);
        b.restore();
        b.fillStyle = s.color; b.globalAlpha = 0.06; b.fillRect((r[0] + 1) * T, (r[1] + 1) * T, (r[2] - 2) * T, (r[3] - 2) * T); b.globalAlpha = 1;
        desks[sid].list.forEach(function (d) {
          var px = d[0] * T, py = d[1] * T;
          b.fillStyle = "#39425e"; b.fillRect(px + 1, py + 7, 14, 7);
          b.fillStyle = "#222a44"; b.fillRect(px + 1, py + 13, 14, 2);
          b.fillStyle = "#0a0e1c"; b.fillRect(px + 4, py + 1, 8, 6);
          b.fillStyle = "#39425e"; b.fillRect(px + 7, py + 7, 2, 1);
        });
        b.fillStyle = "#26304f";
        var lx = r[0] + r[2] - 3, ly = r[1] + (r[4] === "b" ? 1 : r[3] - 3);
        if (cost[ly] && cost[ly][lx] < Infinity) { b.fillRect(lx * T + 2, ly * T + 6, 12, 6); b.fillStyle = s.color; b.globalAlpha = .5; b.fillRect(lx * T + 2, ly * T + 5, 12, 2); b.globalAlpha = 1; }
      });
      var pz = L.plaza, cx = (pz[0] + pz[2] / 2) * T, cy = (pz[1] + pz[3] / 2) * T;
      b.fillStyle = "#1a1f38"; b.beginPath(); b.arc(cx, cy, T * 1.7, 0, 7); b.fill();
      b.strokeStyle = "rgba(255,209,102,.6)"; b.lineWidth = 2; b.beginPath(); b.arc(cx, cy, T * 1.7, 0, 7); b.stroke();
      L.houses.forEach(function (h) {
        var px = h[0] * T, py = h[1] * T, wpx = h[2] * T, hpx = h[3] * T;
        b.fillStyle = "#3a2a3f"; b.fillRect(px, py + 6, wpx, hpx - 6);
        b.fillStyle = "#7a2f4a"; b.fillRect(px - 2, py, wpx + 4, 9);
        b.fillStyle = "#9a3f5f"; b.fillRect(px - 2, py, wpx + 4, 2);
        b.fillStyle = "#1a1220"; b.fillRect(px + (h[2] >> 1) * T + 3, py + hpx - 10, 10, 10);
      });
      var cf = L.cafe;
      b.fillStyle = "#4a2f1f"; b.fillRect((cf[0] + 1) * T, (cf[1] + 1) * T, T * 3, 6);
      b.fillStyle = "#ff4fd8"; b.globalAlpha = .7; b.fillRect((cf[0] + 1) * T, (cf[1] + 1) * T - 2, T * 3, 2); b.globalAlpha = 1;
      for (var bx = cf[0] + 1; bx < cf[0] + cf[2] - 1; bx += 3) { b.fillStyle = "#5a3b28"; b.fillRect(bx * T + 2, (cf[1] + Math.floor(cf[3] / 2) - 1) * T + 9, 12, 4); }
    }

    /* ---------- agentes ---------- */
    function makeAgents() {
      Object.keys(desks).forEach(function (k) { desks[k].used = 0; });
      agents = items.map(function (it) {
        var s = salaOf[it.id], d = desks[s.id];
        var seat = null;
        if (d && d.used < d.list.length) { var dk = d.list[d.used++]; seat = [dk[0], dk[1] + 1]; }
        var start = seat || inRoom(s.id) || [1, 1];
        var hv = hash(it.id);
        return {
          it: it, sala: s, seat: seat, desk: seat ? [seat[0], seat[1] - 1] : null,
          x: start[0] * T + 8, y: start[1] * T + 12, tx: start[0], ty: start[1], route: [],
          dir: 0, frame: 0, wait: 1 + Math.random() * 6, mode: "idle", carry: null, then: null,
          hair: HAIR[hv % HAIR.length], skin: SKIN[(hv >> 3) % SKIN.length], hidden: false, pop: null
        };
      });
    }
    function tileOf(a) { return [Math.floor(a.x / T), Math.floor((a.y - 4) / T)]; }
    function go(a, t) {
      var c = tileOf(a);
      a.route = path(c[0], c[1], t[0], t[1]);
      a.goal = t;
    }
    function wantMode(a, hour) {
      var id = a.it.id;
      if (feed.busy[id] || o.isBusy && o.isBusy(id)) return "work";
      if (a.carry) return "carry";
      var ev = feed.agents[id];
      if (ev && ev.last && Date.now() - Date.parse(ev.last) < 90000) return "work";
      if ((hour < 8 || hour >= 23) && id !== "vigia") return "sleep";
      return "idle";
    }
    function think(a, hour) {
      var m = wantMode(a, hour);
      if (m !== a.mode) {
        a.mode = m; a.wait = 0; a.route = [];
        if (m !== "sleep") a.hidden = false;
        if (o.mark) o.mark(a.it.id, m === "work" || m === "carry");
      }
      if (a.route.length || a.wait > 0) return;
      if (m === "work") {
        if (a.seat) { if (!near(a, a.seat)) go(a, a.seat); }
        else if (!a.goal) go(a, inRoom(a.sala.id));
      } else if (m === "sleep") {
        var c = tileOf(a), hd = nearestHouse(c[0], c[1]);
        if (near(a, hd)) a.hidden = true; else go(a, hd);
      } else if (m === "carry") {
        var tgt = a.carry.to === "tu" ? centerPlaza() : spotOf(a.carry.to);
        if (near(a, tgt, 1)) {
          a.pop = { text: "entregado", t: 2.2 };
          a.carry = null; a.wait = 1.5;
        } else go(a, tgt);
      } else {
        var r = Math.random();
        if (id24(a) && r < 0.12) go(a, outdoor("cafe"));
        else if (r < 0.22) go(a, outdoor("plaza"));
        else if (r < 0.5 && a.seat) go(a, a.seat);
        else go(a, inRoom(a.sala.id));
        a.wait = 3 + Math.random() * 9;
      }
    }
    function id24(a) { return a.it.id.length % 2 === 0 || Math.random() < .5; }
    function near(a, t, tol) { var c = tileOf(a); return Math.abs(c[0] - t[0]) + Math.abs(c[1] - t[1]) <= (tol || 0); }
    function centerPlaza() { var p = L.plaza; return [p[0] + (p[2] >> 1), p[1] + (p[3] >> 1) + 2]; }
    function spotOf(id) {
      var b = agents.filter(function (x) { return x.it.id === id; })[0];
      if (!b) return centerPlaza();
      if (b.seat) return b.seat;
      return tileOf(b);
    }
    function step(a, dt) {
      if (a.pop) { a.pop.t -= dt; if (a.pop.t <= 0) a.pop = null; }
      if (!a.route.length) {
        if (a.wait > 0) a.wait -= dt;
        a.frame = 0;
        return;
      }
      var n = a.route[0], tx = n[0] * T + 8, ty = n[1] * T + 12;
      var dx = tx - a.x, dy = ty - a.y, d = Math.sqrt(dx * dx + dy * dy);
      var sp = (a.mode === "carry" ? 46 : a.mode === "work" ? 40 : 24) * dt;
      if (d <= sp) { a.x = tx; a.y = ty; a.route.shift(); if (!a.route.length) { a.goal = null; if (a.mode === "idle") a.wait = 3 + Math.random() * 8; } }
      else { a.x += dx / d * sp; a.y += dy / d * sp; }
      a.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 3 : 2) : (dy > 0 ? 0 : 1);
      a.frame += dt * 8;
    }

    function drawAgent(a, t) {
      if (a.hidden) return;
      var x = Math.round(a.x), y = Math.round(a.y);
      var walking = a.route.length > 0;
      var leg = walking ? (Math.floor(a.frame) % 2) : 0;
      var working = a.mode === "work" && !walking && a.seat && near(a, a.seat);
      var bob = working ? (Math.floor(t * 6) % 2) : 0;
      ctx.fillStyle = "rgba(0,0,0,.35)"; ctx.fillRect(x - 4, y - 1, 8, 2);
      if (a.mode === "work" || a.mode === "carry") {
        ctx.fillStyle = a.sala.color; ctx.globalAlpha = .35 + .25 * Math.sin(t * 5); ctx.fillRect(x - 6, y - 2, 12, 3); ctx.globalAlpha = 1;
      }
      ctx.fillStyle = "#23283f";
      ctx.fillRect(x - 3, y - 4 - (leg ? 1 : 0), 2, 4 + (leg ? 1 : 0));
      ctx.fillRect(x + 1, y - 4 - (leg ? 0 : 1), 2, 4 + (leg ? 0 : 1));
      ctx.fillStyle = a.it.shirt || "#e2a45c"; ctx.fillRect(x - 4, y - 10 + bob, 8, 6);
      ctx.fillStyle = a.skin; ctx.fillRect(x - 5, y - 9 + bob, 1, 4); ctx.fillRect(x + 4, y - 9 + bob, 1, 4);
      ctx.fillRect(x - 3, y - 16 + bob, 6, 6);
      ctx.fillStyle = a.hair; ctx.fillRect(x - 3, y - 17 + bob, 6, 2);
      if (a.dir === 1) ctx.fillRect(x - 3, y - 15 + bob, 6, 4);
      else if (a.dir === 0) { ctx.fillStyle = "#14121c"; ctx.fillRect(x - 2, y - 13 + bob, 1, 1); ctx.fillRect(x + 1, y - 13 + bob, 1, 1); }
      else { ctx.fillStyle = "#14121c"; ctx.fillRect(a.dir === 3 ? x + 1 : x - 2, y - 13 + bob, 1, 1); }
      if (a.carry) {
        ctx.fillStyle = a.sala.color; ctx.shadowColor = a.sala.color; ctx.shadowBlur = 8;
        ctx.fillRect(x - 3, y - 23 - (Math.floor(t * 4) % 2), 6, 5); ctx.shadowBlur = 0;
      }
      if (a.mode === "sleep" && !walking) { ctx.fillStyle = "#c9d6ff"; ctx.fillRect(x + 4, y - 20, 2, 2); }
    }
    function drawScreens(t) {
      agents.forEach(function (a) {
        if (!a.desk) return;
        var on = a.mode === "work" && near(a, a.seat) && !a.route.length;
        var px = a.desk[0] * T, py = a.desk[1] * T;
        if (on) {
          ctx.fillStyle = a.sala.color; ctx.shadowColor = a.sala.color; ctx.shadowBlur = 10;
          ctx.fillRect(px + 4, py + 1, 8, 6); ctx.shadowBlur = 0;
          ctx.fillStyle = "#0a0e1c";
          for (var i = 0; i < 3; i++) ctx.fillRect(px + 5, py + 2 + ((i * 2 + Math.floor(t * 8)) % 5), 4 + (i % 2) * 2, 1);
        } else if (!a.hidden) {
          ctx.fillStyle = "rgba(79,157,255,.12)"; ctx.fillRect(px + 4, py + 1, 8, 6);
        }
      });
    }
    function drawCore(t) {
      var pz = L.plaza, cx = (pz[0] + pz[2] / 2) * T, cy = (pz[1] + pz[3] / 2) * T;
      var busy = agents.some(function (a) { return a.mode === "work"; });
      var r = 9 + Math.sin(t * (busy ? 6 : 2)) * 1.5;
      ctx.save();
      ctx.shadowColor = "#ffd166"; ctx.shadowBlur = busy ? 26 : 14;
      ctx.fillStyle = "#ffd166"; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.fill();
      ctx.fillStyle = "#fff6d8"; ctx.beginPath(); ctx.arc(cx - 2, cy - 2, r * .45, 0, 7); ctx.fill();
      ctx.restore();
    }
    function night(hour) {
      if (hour >= 8 && hour < 20) return 0;
      if (hour >= 20 && hour < 22) return (hour - 20) / 2 * 0.5;
      if (hour >= 7 && hour < 8) return (8 - hour) * 0.5;
      return 0.5;
    }
    function drawLights(dark, t) {
      if (dark <= 0) return;
      ctx.save();
      ctx.fillStyle = "rgba(6,10,40," + dark + ")";
      ctx.fillRect(0, 0, L.cols * T, L.rows * T);
      ctx.globalCompositeOperation = "lighter";
      L.houses.forEach(function (h) {
        var anyone = agents.some(function (a) { return a.hidden; });
        ctx.fillStyle = anyone ? "rgba(255,200,110,.55)" : "rgba(255,200,110,.2)";
        ctx.fillRect(h[0] * T + 6, (h[1] + 1) * T + 2, 6, 5);
        ctx.fillRect((h[0] + h[2]) * T - 12, (h[1] + 1) * T + 2, 6, 5);
      });
      L.roads.forEach(function (r) {
        for (var i = 2; i < Math.max(r[2], r[3]); i += 6) {
          var lx = (r[2] > r[3] ? r[0] + i : r[0]) * T + 8, ly = (r[2] > r[3] ? r[1] : r[1] + i) * T + 4;
          var g = ctx.createRadialGradient(lx, ly, 0, lx, ly, 26);
          g.addColorStop(0, "rgba(120,200,255," + (0.28 * dark * 2) + ")"); g.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = g; ctx.fillRect(lx - 26, ly - 26, 52, 52);
        }
      });
      ctx.restore();
    }
    function drawRain(dt) {
      if (!raining) return;
      var W = L.cols * T, H = L.rows * T;
      while (rain.length < 90) rain.push({ x: Math.random() * W, y: Math.random() * H, v: 160 + Math.random() * 90 });
      ctx.fillStyle = "rgba(160,200,255,.55)";
      rain.forEach(function (d) { d.y += d.v * dt; d.x -= d.v * dt * .15; if (d.y > H) { d.y = -6; d.x = Math.random() * W; } ctx.fillRect(d.x, d.y, 1, 4); });
    }

    /* ---------- textos nítidos ---------- */
    function label(text, x, y, color, bgc, size) {
      ctx.font = "600 " + size + "px 'Segoe UI', system-ui, sans-serif";
      var wd = ctx.measureText(text).width;
      if (bgc) { ctx.fillStyle = bgc; ctx.fillRect(x - wd / 2 - 4, y - size, wd + 8, size + 5); }
      ctx.fillStyle = color; ctx.fillText(text, x - wd / 2, y);
    }
    function drawTexts() {
      var k = scale * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.textBaseline = "alphabetic";
      Object.keys(L.rooms).forEach(function (sid) {
        var r = L.rooms[sid], s = salaById[sid];
        if (!s || !desks[sid]) return;
        var x = (r[0] + r[2] / 2) * T * scale, y = ((r[1] + r[3]) * T + 3) * scale + 6;
        ctx.save(); ctx.shadowColor = s.color; ctx.shadowBlur = 10;
        label(s.name.toUpperCase() + (s.para ? " · " + s.para : ""), x, y, s.color, "rgba(5,7,15,.85)", Math.max(10, Math.min(13, 11 * scale)));
        ctx.restore();
      });
      var pz = L.plaza;
      label(o.coreName || "CEREBRO", (pz[0] + pz[2] / 2) * T * scale, ((pz[1] + pz[3] / 2) * T + 26) * scale, "#ffd166", "rgba(5,7,15,.7)", Math.max(10, 10 * scale));
      label("CAFÉ", (L.cafe[0] + 2.5) * T * scale, ((L.cafe[1] + 1) * T - 3) * scale, "#ff4fd8", null, Math.max(9, 9 * scale));
      var showAll = scale >= 1.15;
      agents.forEach(function (a) {
        if (a.hidden) return;
        var x = a.x * scale, y = (a.y + 7) * scale;
        var busy = a.mode === "work" || a.mode === "carry";
        if (showAll || busy || a === selected) label(a.it.name, x, y, busy ? a.sala.color : "#dfe8ff", "rgba(5,7,15,.6)", Math.max(9, Math.min(11, 8.5 * scale)));
      });
      agents.forEach(function (a) {
        if (a.hidden) return;
        var txt = "";
        if (a.pop) txt = a.pop.text;
        else if (a === selected) txt = a.mode === "work" ? doing(a) : a.mode === "sleep" ? "Durmiendo" : restOf(a);
        else if (a.mode === "work") txt = doing(a);
        if (!txt) return;
        bubble(txt.length > 34 ? txt.slice(0, 33) + "…" : txt, a.x * scale, (a.y - 22) * scale, a.sala.color);
      });
      ctx.setTransform(k, 0, 0, k, 0, 0);
    }
    function bubble(text, x, y, color) {
      var size = Math.max(10, Math.min(12, 9 * scale));
      ctx.font = "600 " + size + "px 'Segoe UI', system-ui, sans-serif";
      var wd = ctx.measureText(text).width;
      var bx = Math.max(4, Math.min(cssW - wd - 14, x - wd / 2 - 6));
      ctx.fillStyle = "rgba(8,12,28,.92)"; ctx.fillRect(bx, y - size - 6, wd + 12, size + 9);
      ctx.strokeStyle = color; ctx.lineWidth = 1; ctx.strokeRect(bx + .5, y - size - 5.5, wd + 11, size + 8);
      ctx.fillStyle = "#eaf4ff"; ctx.fillText(text, bx + 6, y);
    }
    function doing(a) {
      var b = feed.busy[a.it.id];
      if (b && b.what) return b.what + "…";
      var e = feed.agents[a.it.id];
      if (e && e.what && e.last && Date.now() - Date.parse(e.last) < 90000) return e.what;
      return (a.it.role || "Trabajando") + "…";
    }
    function statusOf(a) {
      var id = a.it.id;
      var mine = feed.events.filter(function (ev) { return (ROOM_OF[ev.who] || ev.who) === id; });
      var e = feed.agents[id] || {};
      var now;
      if (a.mode === "work") now = "Trabajando: " + doing(a);
      else if (a.mode === "carry") now = "Lleva su trabajo a " + (a.carry && a.carry.to === "tu" ? "ti" : ((byId[a.carry && a.carry.to] || {}).name || "otro"));
      else if (a.mode === "sleep") now = "Durmiendo hasta las 8:00";
      else if (e.rest) now = "Descansa: " + e.rest;
      else if (e.what) now = "Descansa. Lo último: " + e.what;
      else now = "Descansa: solo trabaja cuando tú se lo pides.";
      if (!mine.length && e.what && e.last) mine = [{ at: e.last, what: e.what }];
      var today = dayOf(new Date());
      var hoy = (e.day === today && e.hoy) || mine.filter(function (ev) { return dayOf(new Date(ev.at)) === today; }).length;
      return {
        now: now, busy: a.mode === "work" || a.mode === "carry", hoy: hoy,
        done: mine.slice(-3).reverse().map(function (ev) { return { at: hhmm(ev.at), what: ev.what || "Hecho" }; })
      };
    }
    function status(id) {
      var a = agents.filter(function (x) { return x.it.id === id; })[0];
      return a ? statusOf(a) : null;
    }
    function restOf(a) {
      var e = feed.agents[a.it.id];
      if (e && e.rest) return e.rest;
      if (e && e.what) return "Último: " + e.what;
      return "Descansa. " + (a.it.role || "");
    }

    /* ---------- bucle ---------- */
    var last = 0, acc = 0, hourCache = madridHour(), hourAt = 0;
    function frame(ts) {
      if (document.hidden) { last = ts; requestAnimationFrame(frame); return; }
      var dt = Math.min(0.1, (ts - last) / 1000 || 0.016);
      last = ts;
      acc += dt;
      if (acc < 1 / 30) { requestAnimationFrame(frame); return; }
      dt = acc; acc = 0;
      if (ts - hourAt > 30000) { hourCache = madridHour(); hourAt = ts; try { var wx = JSON.parse(localStorage.getItem("radia-clima") || "null"); raining = !!(wx && [51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99].indexOf(wx.code) >= 0); } catch (e) {} }
      var t = ts / 1000;
      agents.forEach(function (a) { think(a, hourCache); step(a, dt); });
      var k = scale * dpr;
      ctx.setTransform(k, 0, 0, k, 0, 0);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(bg, 0, 0);
      drawCore(t);
      drawScreens(t);
      agents.slice().sort(function (p, q) { return p.y - q.y; }).forEach(function (a) { drawAgent(a, t); });
      drawLights(night(hourCache), t);
      drawRain(dt);
      drawTexts();
      requestAnimationFrame(frame);
    }

    function resize() {
      var prev = L;
      var wide = box.clientWidth >= 620;
      if (!prev || (prev === LAYOUTS.ancho) !== wide) { build(); makeAgents(); }
      var wrap = cv.parentNode;
      cssW = wrap.clientWidth;
      scale = cssW / (L.cols * T);
      var maxH = o.maxHeight ? o.maxHeight() : 0;
      if (maxH && L.rows * T * scale > maxH) scale = maxH / (L.rows * T);
      if (zoomed) scale = Math.max(scale * 1.8, 1.3);
      wrap.classList.toggle("zoom", zoomed);
      cssW = L.cols * T * scale; cssH = L.rows * T * scale;
      dpr = Math.min(2, w.devicePixelRatio || 1);
      cv.style.width = cssW + "px"; cv.style.height = cssH + "px";
      cv.width = Math.round(cssW * dpr); cv.height = Math.round(cssH * dpr);
    }

    /* ---------- toques ---------- */
    cv.addEventListener("click", function (e) {
      var rc = cv.getBoundingClientRect();
      var lx = (e.clientX - rc.left) / scale, ly = (e.clientY - rc.top) / scale;
      var best = null, bd = 14;
      agents.forEach(function (a) {
        if (a.hidden) return;
        var d = Math.abs(a.x - lx) + Math.abs(a.y - 8 - ly);
        if (d < bd) { bd = d; best = a; }
      });
      if (best) { selected = best; if (o.onPick) o.onPick(best.it, statusOf(best)); return; }
      var tx = Math.floor(lx / T), ty = Math.floor(ly / T);
      var hit = null;
      Object.keys(L.rooms).forEach(function (sid) { var r = L.rooms[sid]; if (desks[sid] && tx >= r[0] && tx < r[0] + r[2] && ty >= r[1] && ty < r[1] + r[3]) hit = salaById[sid]; });
      selected = null;
      if (hit) showTip(hit);
    });
    function showTip(s) {
      var names = s.ids.filter(function (id) { return byId[id]; }).map(function (id) { return byId[id].name; }).join(", ");
      tip.innerHTML = '<b style="color:' + s.color + '">' + esc(s.name.toUpperCase()) + (s.para ? " · " + esc(s.para) : "") + '</b>' +
        '<span>' + s.flow.map(esc).join(" → ") + '</span><em>' + esc(names) + '</em>';
      tip.classList.add("on");
      clearTimeout(tipTimer);
      tipTimer = setTimeout(function () { tip.classList.remove("on"); }, 6000);
    }

    /* ---------- datos en directo ---------- */
    var base = o.base || "";
    var liveOk = false;
    function setLive(ok, why) {
      liveOk = ok;
      var el = box.querySelector("#pt-live");
      el.className = "pt-live" + (ok ? " ok" : "");
      el.querySelector("b").textContent = ok ? "En directo" : (why || "Sin directo");
    }
    function applyFeed(p) {
      feed.busy = p.busy || {};
      feed.agents = p.agents || {};
      var evs = Array.isArray(p.events) ? p.events : [];
      feed.events = evs;
      evs.forEach(function (ev) {
        var k = ev.at + ev.who;
        if (seenEv[k]) return;
        seenEv[k] = 1;
        if (firstFeed) return;
        var who = ROOM_OF[ev.who] || ev.who;
        var a = agents.filter(function (x) { return x.it.id === who; })[0];
        if (!a) return;
        a.pop = { text: ev.what || "Hecho", t: 6 };
        if (ev.to) { a.carry = { to: ROOM_OF[ev.to] || ev.to }; a.mode = "carry"; a.route = []; a.wait = 0; }
      });
      firstFeed = false;
      paintFeed();
    }
    function paintFeed() {
      var ol = box.querySelector("#pt-feed");
      var evs = feed.events.slice(-7).reverse();
      if (!evs.length) { ol.innerHTML = '<li class="pt-empty">Todavía nada hoy.</li>'; return; }
      ol.innerHTML = evs.map(function (ev) {
        var who = byId[ROOM_OF[ev.who] || ev.who];
        var s = who ? salaOf[who.id] : null;
        var to = ev.to ? (ev.to === "tu" ? "Tú" : (byId[ROOM_OF[ev.to] || ev.to] || { name: ev.to }).name) : "";
        return '<li><time>' + hhmm(ev.at) + '</time><b style="color:' + (s ? s.color : "#ffd166") + '">' + esc(who ? who.name : ev.who) + '</b> ' + esc(ev.what || "") + (to ? ' <i>→ ' + esc(to) + '</i>' : "") + '</li>';
      }).join("");
    }
    function poll() {
      if (!w.fetch || (o.base === null)) { setLive(false, o.offlineText || "Sin directo"); return; }
      fetch(base + "/pueblo.json", { cache: "no-store" }).then(function (r) { if (!r.ok) throw 0; return r.json(); })
        .then(function (p) { setLive(true); applyFeed(p); })
        .catch(function () { setLive(false, o.offlineText || "Sin directo"); });
    }

    build(); makeAgents(); resize();
    w.addEventListener("resize", resize);
    box.querySelector("#pt-zoom").addEventListener("click", function () {
      zoomed = !zoomed;
      this.textContent = zoomed ? "Alejar" : "Acercar";
      resize();
      var wrap = cv.parentNode, f = selected || agents.filter(function (a) { return a.mode === "work"; })[0];
      var fx = f ? f.x : (L.plaza[0] + L.plaza[2] / 2) * T, fy = f ? f.y : (L.plaza[1] + L.plaza[3] / 2) * T;
      wrap.scrollLeft = fx * scale - wrap.clientWidth / 2;
      wrap.scrollTop = fy * scale - wrap.clientHeight / 2;
    });
    if (o.feed) applyFeed(o.feed);
    poll();
    setInterval(poll, o.every || 4000);
    requestAnimationFrame(frame);
    return { resize: resize, status: status, live: function () { return liveOk; } };
  }

  var css = '' +
    '.pt-box{display:flex;flex-direction:column;gap:8px;min-width:0}' +
    '.pt-bar{display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;font-size:12px;color:#b8c6dd}' +
    '.pt-live{display:inline-flex;align-items:center;gap:6px;padding:3px 10px;border-radius:999px;border:1px solid #2c3a60;background:rgba(10,14,28,.9)}' +
    '.pt-live i{width:8px;height:8px;border-radius:50%;background:#6f7d96}' +
    '.pt-live.ok{border-color:rgba(57,245,154,.5)}.pt-live.ok i{background:#39f59a;box-shadow:0 0 8px #39f59a;animation:rc-blink 1.2s infinite}' +
    '.pt-legend{display:inline-flex;align-items:center;gap:5px}' +
    '.pt-legend i{display:inline-block;width:8px;height:8px;border-radius:50%;background:#6f7d96;margin-left:6px}' +
    '.pt-legend i.on{background:#39f59a;box-shadow:0 0 6px #39f59a}.pt-legend i.zz{background:#4f5fa8}' +
    '.pt-wrap{position:relative;display:flex;justify-content:center;border-radius:14px;overflow:hidden;border:1px solid rgba(79,157,255,.4);box-shadow:0 0 24px rgba(79,157,255,.15);background:#070a14}' +
    '.pt-wrap.zoom{display:block;overflow:auto;max-height:78vh;-webkit-overflow-scrolling:touch}' +
    '.pt-zoom{font:inherit;font-size:12px;color:#eaf4ff;background:rgba(79,157,255,.15);border:1px solid rgba(79,157,255,.5);border-radius:999px;padding:4px 12px;cursor:pointer}' +
    '.pt-cv{display:block;image-rendering:pixelated;cursor:pointer;touch-action:manipulation}' +
    '.pt-tip{position:absolute;left:8px;right:8px;bottom:8px;display:none;flex-direction:column;gap:3px;padding:8px 10px;border-radius:10px;background:rgba(6,9,20,.94);border:1px solid #2c3a60;font-size:13px;color:#eaf4ff}' +
    '.pt-tip.on{display:flex}.pt-tip em{font-style:normal;color:#8fa6c8;font-size:12px}' +
    '.pt-feed{padding:8px 10px;border-radius:12px;border:1px solid #1c2742;background:rgba(10,14,28,.85);font-size:13px;color:#cfe0f2}' +
    '.pt-feed>b{display:block;margin-bottom:4px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#4f9dff}' +
    '.pt-feed ol{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:3px}' +
    '.pt-feed li{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
    '.pt-feed time{color:#6f7d96;margin-right:6px;font-variant-numeric:tabular-nums}' +
    '.pt-feed i{font-style:normal;color:#ffd166}.pt-feed .pt-empty{color:#6f7d96}' +
    '.pt-now{margin:0 0 10px;padding:10px 12px;border-radius:12px;border:1px solid #2c3a60;background:rgba(10,14,28,.9);color:#eaf4ff;font-size:14px;line-height:1.4}' +
    '.pt-now.on{border-color:rgba(57,245,154,.6);box-shadow:0 0 14px rgba(57,245,154,.18)}' +
    '.pt-now>b{display:flex;gap:8px;align-items:flex-start;font-weight:600}' +
    '.pt-now>b i{flex:none;width:9px;height:9px;margin-top:6px;border-radius:50%;background:#6f7d96}.pt-now.on>b i{background:#39f59a;box-shadow:0 0 8px #39f59a}' +
    '.pt-now em{display:block;margin-top:6px;font-style:normal;font-size:12px;color:#8fa6c8}' +
    '.pt-now ol{list-style:none;margin:4px 0 0;padding:0;font-size:13px;color:#cfe0f2}' +
    '.pt-now time{color:#6f7d96;margin-right:6px;font-variant-numeric:tabular-nums}';
  var tag = document.createElement("style");
  tag.textContent = css;
  document.head.appendChild(tag);

  function nowHtml(st) {
    if (!st) return "";
    var list = st.done.length
      ? '<em>' + (st.hoy ? 'Hoy ha hecho ' + st.hoy + (st.hoy === 1 ? " cosa" : " cosas") : 'Hoy aún nada') + '. Lo último:</em><ol>' + st.done.map(function (d) { return '<li><time>' + esc(d.at) + '</time>' + esc(d.what) + '</li>'; }).join("") + '</ol>'
      : '<em>Hoy todavía no ha hecho nada.</em>';
    return '<div class="pt-now' + (st.busy ? " on" : "") + '"><b><i></i><span>' + esc(st.now) + '</span></b>' + list + '</div>';
  }

  w.RadiaPueblo = { mount: mount, nowHtml: nowHtml };
})(window);
