/**
 * Car: a small rounded toy car, assembled at rest, its two headlamps lit. The pointer entering it bursts it into a workshop-manual
 * exploded view: the floor pan drops away with the seats and engine on it, which slide off it on the floor's own tween once they
 * are clear of the body; the cabin and roof lift off, the bonnet and boot lid slide off along their own axes, and the wheels slide
 * out along their axles and a little forward, each on a 700ms tween staggered out from the part the hand came in on, a dashed
 * guide along each path. The bright edge and the read-out name the part under the pointer in the exploded pose, so a point
 * always reads the same name; leaving puts it back together. The slider is the explode distance, in world units. Hit tests never
 * read the pose on screen: entering tests the rest pose, staying one hull round the rest and target poses at the slider's current
 * value, naming the target pose.
 */
const {
  Cam, circ, clamp, extremes, facing, fillet, fit, hull, lerp, open, poly, prism, proj, ringAt, rings, rrect, run, seg,
  spring, stepS, tdone, tset, tval, tween, disposer, mk, pointer, put, register, solid,
} = HL;

const S = 2.15, B = 1.4, WR = 11.5, AX = 37, EMIN = 14, EMAX = 26, STEP = 45, UNIT = 20, GROW = 6, CLEAR = 18.5;
/** A wheel's way out per unit of explode, along its axle and a little forward, so the far rear one clears the cabin. */
const AXLE = 0.75, FWD = 0.3, WB = 18;
/** Toward the viewer for Cam(45, 0.5): a face whose normal has a positive dot with it is seen. */
const V = [Math.SQRT1_2 * Math.sqrt(0.75), Math.SQRT1_2 * Math.sqrt(0.75), 0.5];
const Z = [0, 0, 0], CT = [-24, -17, -4, 17, 6];

const up = (x0, y0, x1, y1, r, z0, z1) => { const [ring, inner] = rings(x0, y0, x1, y1, r, B); return { k: "p", ring, inner, z0, z1 }; };
const inset = (t) => rrect(t[0] + B, t[1] + B, t[2] - B, t[3] - B, t[4] - B, 6);
const taper = (f, t, z0, z1) => ({ k: "t", foot: rrect(...f, 6), top: rrect(...t, 6), inner: inset(t), z0, z1 });
/** A wheel outside the body's side: its axle is y, from y0 to y0 + 8. */
const wheel = (x, y0) => ({ k: "w", x, y0, y1: y0 + 8, ring: circ(WR, 32), inner: circ(WR - 1.6, 32) });
/** The cap a wheel shows: of its two, the one whose normal (±y) faces the viewer. Outer when it is the farther from the body. */
const cap = (s) => (V[1] > 0 ? s.y1 : s.y0);
const outer = (s) => Math.abs(cap(s)) > Math.abs(s.y0 + s.y1 - cap(s));
/** A seat: a back raked rearward, a separate headrest standing over it, and a thick cushion in front. */
const seat = (y0, y1) => [taper([-24, y0, -19, y1, 2], [-27, y0, -22, y1, 2], 10, 23),
  up(-26.5, y0 + 3, -22.5, y1 - 3, 1.5, 24.5, 28.5), up(-20, y0, -5, y1, 2.5, 10, 15)];
/** The engine's top: four cylinder-head ribs across it, and the pulley on its front face. */
const head = (Q) => [28, 31, 34, 37].map((x) => poly(rrect(x, -6.5, x + 1.4, 6.5, 0.7, 2).map((q) => Q(q.u, q.v, 24)))).join("")
  + poly(circ(4, 16).map((q) => Q(44.3, q.u, 15 + q.v)));
/** A filleted quad on a face: f(s, h) gives the world point at the face's own fractions. */
const pane = (Q, f, s0, s1, h0, h1) => poly(fillet([f(s0, h0), f(s1, h0), f(s1, h1), f(s0, h1)].map((w) => Q(...w)), [1, 1, 1, 1]));
const glass = (s, h) => [lerp(14, -4, h) + 0.3, lerp(-1, 1, s) * lerp(12.5, 10.5, h), lerp(27, 41, h)];
const side = (s, h) => [lerp(lerp(-30, 10, s), lerp(-22, -6, s), h), lerp(21, 17, h) + 0.3, lerp(27, 41, h)];
const nose = (y, h) => [lerp(58, 50, h) + 0.3, y, lerp(11, 27, h)];
/** Back to front: name; `par`, the part it sits on; `dir`, its way off that part per unit of explode, plus a fixed `base`;
 *  `gate`, it has no tween: it rides its parent's and slides only once the floor has dropped it CLEAR below the body;
 *  `rail`, the ring its guides stand on. */
const PARTS = [
  { name: "wheel rl", dir: [FWD, -AXLE, 0], base: [0, -WB, 0], solids: [wheel(-AX, -32)] },
  { name: "wheel fl", dir: [FWD, -AXLE, 0], base: [0, -WB, 0], solids: [wheel(AX, -32)] },
  { name: "floor", dir: [0, 0, -0.35], base: [0, 0, -17], solids: [up(-50, -17, 50, 17, 6, 7, 10)] },
  { name: "seats", par: 2, dir: [-0.15, 1.4, 0], gate: true, solids: [...seat(-15, -3), ...seat(3, 15)] },
  { name: "engine", par: 2, dir: [0.9, 0, 0], gate: true, solids: [up(22, -12, 44, 12, 3, 10, 20), up(25, -9, 41, 9, 2.5, 20, 24)],
    marks: [["nf lo", head]] },
  { name: "body", dir: Z, solids: [taper([-58, -24, 58, 24, 12], [-55, -22, 50, 22, 10], 11, 27)],
    marks: [["nf hi", (Q) => pane(Q, nose, 2.5, 11, 0.5, 0.72) + pane(Q, nose, -11, -2.5, 0.5, 0.72)]] },
  { name: "boot", par: 5, dir: [-0.45, 0, 0.45], solids: [up(-53, -19, -37, 19, 4, 27, 27.7)] },
  { name: "cabin", par: 5, dir: [0, 0, 0.42], solids: [taper([-34, -21, 14, 21, 8], CT, 27, 41)],
    marks: [["nf lo", (Q) => pane(Q, glass, 0.08, 0.92, 0.15, 0.85) + pane(Q, side, 0, 1, 0.2, 0.8)]] },
  { name: "roof", par: 7, dir: [0, 0, 0.38], rail: inset(CT), solids: [up(-25, -17.5, -3, 17.5, 5, 41, 43)] },
  { name: "bonnet", par: 5, dir: [0.45, 0, 0.45], solids: [up(18, -19, 47, 19, 4, 27, 27.7)] },
  { name: "wheel rr", dir: [FWD, AXLE, 0], base: [0, WB, 0], solids: [wheel(-AX, 24)] },
  { name: "wheel fr", dir: [FWD, AXLE, 0], base: [0, WB, 0], solids: [wheel(AX, 24)] },
];

/** How far the floor drops at explode e: at EMIN it already takes the seats and engine below the body's foot. */
const drop = (e) => -(PARTS[2].dir[2] * e + PARTS[2].base[2]);
/** Every part's offset at explode e, each moved k(i) of its own way off the part it sits on. A gated part has no clock of its
 *  own: it slides over the last stretch of its parent's, after the floor has dropped it CLEAR, so floor and load are one move. */
const offsets = (e, k) => PARTS.reduce((o, p, i) => {
  const po = p.par == null ? Z : o[p.par], b = p.base || Z, c = CLEAR / drop(e);
  const f = p.gate ? clamp((k(p.par) - c) / (1 - c), 0, 1) : k(i);
  o[i] = p.dir.map((d, j) => po[j] + (d * e + b[j]) * f);
  return o;
}, []);
/** A solid's world points: both of its rings, where they stand. */
function pts(s) {
  if (s.k === "w") return s.ring.flatMap((q) => [[s.x + q.u, s.y0, WR + q.v], [s.x + q.u, s.y1, WR + q.v]]);
  if (s.k === "t") return s.foot.map((q) => [q.u, q.v, s.z0]).concat(s.top.map((q) => [q.u, q.v, s.z1]));
  return s.ring.flatMap((q) => [[q.u, q.v, s.z0], [q.u, q.v, s.z1]]);
}
/** Its silhouette and one crease under projector Q: a prism; a hull of foot and top (rule 09's taper); or a wheel on its axle. */
function shape(Q, front, s) {
  if (s.k === "p") return prism(Q, front, s.ring, s.inner, s.z0, s.z1);
  const sil = poly(hull(pts(s).map((w) => Q(...w))));
  if (s.k === "t") return { sil, crease: open(ringAt(Q, run(s.inner, front), s.z1)) };
  const seen = (q) => q.nu * V[0] + q.nv * V[2] > 0;
  return { sil, crease: open(run(s.inner, seen).map((q) => Q(s.x + q.u, cap(s), WR + q.v))) };
}
/** Whether a point is inside a convex polygon (every hull here is one): on the same side of all its edges. */
function inside(p, pg) {
  const s = pg.map((a, i) => { const b = pg[(i + 1) % pg.length]; return Math.sign((b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0])); });
  return s.every((v) => v >= 0) || s.every((v) => v <= 0);
}

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  const C = Cam(45, 0.5, S), far = offsets(EMAX, () => 1);
  fit(C, PARTS.flatMap((p, i) => p.solids.flatMap(pts).flatMap((q) => [q, q.map((v, k) => v + far[i][k])])), 200, 166);
  const P = proj(C), front = facing(C), O = P(0, 0, 0);
  const by = (o) => (x, y, z) => P(x + o[0], y + o[1], z + o[2]);

  // back to front; each part's dashed guide goes in just before it, so its own plate hides the guide's end
  const g = mk("g", {}, svg);
  const parts = PARTS.map((p) => {
    const guide = mk("path", { class: "nf dash" }, g), el = mk("g", {}, g), so = p.solids.map(() => solid(el));
    // a hub only on a cap the viewer sees from outside: a far wheel shows its inner cap, so no hub through the solid
    const hubs = p.solids.filter((s) => s.k === "w" && outer(s))
      .map((s) => ["nf lo", (Q) => poly(circ(3.6, 16).map((q) => Q(s.x + q.u, cap(s), WR + q.v)))]);
    const marks = (p.marks || []).concat(hubs), mEl = marks.map(([cls]) => mk("path", { class: cls }, el));
    const w = p.solids.flatMap(pts), c = w.reduce((a, q) => a.map((v, k) => v + q[k] / w.length), [0, 0, 0]);
    return { ...p, guide, so, marks, mEl, hls: p.solids.map((s) => hull(pts(s).map((q) => P(...q)))), c, tw: tween(0), drawn: "", gdrawn: "" };
  });
  const lamps = parts[5].mEl[0];
  const E = spring(clamp(value, EMIN, EMAX), { eps: 0.05 });
  /** A dashed guide along the part's path off its parent, from where it sat on it to where it is, x, y and z. */
  function guide(pt, o, po) {
    const s0 = pt.solids[0], at = (u, v, z, w) => P(u + w[0], v + w[1], z + w[2]);
    if (Math.hypot(o[0] - po[0], o[1] - po[1], o[2] - po[2]) < 1) return "";
    if (s0.k === "w") { const yi = Math.abs(s0.y0) < Math.abs(s0.y1) ? s0.y0 : s0.y1; return seg(at(s0.x, yi, WR, po), at(s0.x, yi, WR, o)); }
    return extremes(P, pt.rail || s0.ring || s0.foot).map((q) => seg(at(q.u, q.v, s0.z0, po), at(q.u, q.v, s0.z0, o))).join("");
  }
  /** Redraws only what moved: a part's paths when its offset changed, its guide when it or its parent's did. */
  function frame(t) {
    let m = false;
    const o = offsets(E.x, (i) => tval(parts[i].tw, t)); // the pose now: each part moved by its own tween
    parts.forEach((pt, i) => {
      if (!tdone(pt.tw, t)) m = true;
      const po = pt.par == null ? Z : o[pt.par], k = o[i].map((v) => v.toFixed(2)).join(), gk = k + "|" + po.map((v) => v.toFixed(2)).join();
      if (k !== pt.drawn) {
        const Q = by(o[i]); pt.drawn = k;
        pt.solids.forEach((s, n) => put(pt.so[n], shape(Q, front, s)));
        pt.mEl.forEach((el, n) => el.setAttribute("d", pt.marks[n][1](Q)));
      }
      if (gk !== pt.gdrawn) { pt.gdrawn = gk; pt.guide.setAttribute("d", guide(pt, o[i], po)); }
    });
    return m;
  }
  const loop = register(stage, (dt, t) => { const m = stepS(E, dt); return frame(t) || m; });
  bag.add(loop.unregister);
  frame(performance.now());
  // hit areas, static per slider value: the rest hulls; the target hulls at E.t; one grown hull round both to stay open in
  const moved = (h, w) => { const s = P(...w); return h.map((p) => [p[0] + s[0] - O[0], p[1] + s[1] - O[1]]); };
  const grow = (h) => { const c = h.reduce((a, p) => [a[0] + p[0] / h.length, a[1] + p[1] / h.length], [0, 0]);
    return h.map((p) => { const d = Math.hypot(p[0] - c[0], p[1] - c[1]) / GROW || 1; return [p[0] + (p[0] - c[0]) / d, p[1] + (p[1] - c[1]) / d]; }); };
  const restH = parts.map((pt) => pt.hls), restFoot = hull(restH.flat(2));
  let tgtO = [], tgtH = [], zone = [], isOpen = false, cur = -1, lit = "", lastP = null;
  const foot = () => { tgtO = offsets(E.t, () => 1); tgtH = parts.map((pt, i) => pt.hls.map((h) => moved(h, tgtO[i])));
    zone = hull(grow(hull(restFoot.concat(tgtH.flat(2))))); };
  foot();
  /** The topmost part one of whose hulls holds the point; else -1. */
  const pick = (p, hs) => { for (let i = hs.length - 1; i >= 0; i--) if (hs[i].some((h) => inside(p, h))) return i; return -1; };
  /** The part whose centre, moved by o, is nearest the point. */
  const near = (p, o) => parts.reduce((b, pt, i) => { const c = P(...pt.c.map((v, k) => v + o[i][k])), d = Math.hypot(c[0] - p[0], c[1] - p[1]);
    return d < b[1] ? [i, d] : b; }, [5, Infinity])[0];
  /** One bright place: the chosen part's silhouettes, or the headlamps when nothing is chosen. */
  function light(a) {
    const txt = a >= 0 ? parts[a].name : isOpen ? "apart" : "rest";
    if (a + txt === lit) return;
    lit = a + txt; cur = a;
    parts.forEach((pt, i) => pt.so.forEach((s) => s.sil.classList.toggle("hi", i === a)));
    lamps.classList.toggle("hi", a < 0); lamps.classList.toggle("lo", a >= 0);
    read.textContent = txt;
  }
  /** Apart or together, staggered by distance from part a; a gated part rides its parent's tween, so it needs none. */
  function burst(on, a) {
    isOpen = on;
    const t = performance.now(), c = parts[a].c;
    parts.forEach((pt) => pt.gate || tset(pt.tw, on ? 1 : 0, t, Math.round(Math.hypot(...pt.c.map((v, k) => v - c[k])) / UNIT) * STEP));
    loop.wake();
  }
  // the stagger starts from the part the hand came in on at rest; the name is always the target pose's, which never moves
  function move(p) {
    lastP = p;
    if (!isOpen) {
      if (!inside(p, restFoot)) return;
      const a = pick(p, restH);
      burst(true, a >= 0 ? a : near(p, parts.map(() => Z)));
    } else if (!inside(p, zone)) { burst(false, cur >= 0 ? cur : near(p, tgtO)); return light(-1); }
    light(pick(p, tgtH));
  }
  const leave = () => { if (isOpen) burst(false, cur >= 0 ? cur : lastP ? near(lastP, tgtO) : 5); lastP = null; light(-1); };
  bag.add(pointer(stage, { move, leave }));
  light(-1);
  bag.add(() => svg.replaceChildren());
  return {
    set: (v) => { E.t = clamp(v, EMIN, EMAX); foot(); if (lastP && isOpen) move(lastP); else light(cur); loop.wake(); },
    destroy: bag.dispose,
  };
}

hairline({
  name: "car",
  means: "A small toy car that bursts into its exploded view under the pointer, part by part out from the hand, and goes back together when it leaves.",
  rules: [1, 2, 6, 9],
  range: [14, 22, 26],
  tour: [[234, 167], [167, 74], [110, 216], null],
  mount,
});
