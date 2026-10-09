/**
 * Car: a small rounded coupe, assembled at rest, its two headlamps lit. The
 * pointer entering it bursts it into a workshop-manual exploded view: the floor
 * pan drops away with the seats and engine on it, the body lifts, the cabin and
 * roof lift off it, the bonnet and boot lid slide off along their own axes, and
 * the wheels slide out along their axles, each part on a 700ms tween staggered
 * out from the part the hand came in on, a dashed guide along each axis. While
 * apart, the part under the pointer takes the bright edge and its name; leaving
 * puts it back together. The slider is the explode distance, in world units.
 *
 * Hit tests never read the pose on screen: entering tests the rest footprint,
 * staying the rest footprint and every solid's target hull, picking those hulls.
 */
const {
  Cam, circ, clamp, extremes, facing, fillet, fit, hull, lerp, open, poly, prism, proj, ringAt, rings, rrect, run, seg,
  spring, stepS, tdone, tset, tval, tween, disposer, mk, pointer, put, register, solid,
} = HL;

const S = 2.3, B = 1.4, WR = 11.5, AX = 37, EMIN = 14, EMAX = 26, STEP = 45, UNIT = 20, GROW = 6;
/** Toward the viewer for Cam(45, 0.5): a face whose normal has a positive dot with it is seen. */
const V = [Math.SQRT1_2 * Math.sqrt(0.75), Math.SQRT1_2 * Math.sqrt(0.75), 0.5];

const up = (x0, y0, x1, y1, r, z0, z1) => { const [ring, inner] = rings(x0, y0, x1, y1, r, B); return { k: "p", ring, inner, z0, z1 }; };
const taper = (f, t, z0, z1) => ({ k: "t", foot: rrect(...f, 6), top: rrect(...t, 6), inner: rrect(t[0] + B, t[1] + B, t[2] - B, t[3] - B, t[4] - B, 6), z0, z1 });
/** A wheel outside the body's side: its axle is y, from y0 to y0 + 8. */
const wheel = (x, y0) => ({ k: "w", x, y0, y1: y0 + 8, ring: circ(WR, 32), inner: circ(WR - 1.6, 32) });
/** A seat: a tall back and a low cushion in front of it. */
const seat = (y0, y1) => [up(-24, y0, -19, y1, 2, 10, 24), up(-19, y0, -5, y1, 2, 10, 15)];

/** A filleted quad on a face: f(s, h) gives the world point at the face's own fractions. */
const pane = (Q, f, s0, s1, h0, h1) => poly(fillet([f(s0, h0), f(s1, h0), f(s1, h1), f(s0, h1)].map((w) => Q(...w)), [1, 1, 1, 1]));
const glass = (s, h) => [lerp(14, -4, h) + 0.3, lerp(-1, 1, s) * lerp(12.5, 10.5, h), lerp(27, 41, h)];
const side = (s, h) => [lerp(lerp(-30, 10, s), lerp(-22, -6, s), h), lerp(21, 17, h) + 0.3, lerp(27, 41, h)];
const nose = (y, h) => [lerp(58, 50, h) + 0.3, y, lerp(11, 27, h)];

/** Back to front: name, explode direction per unit of distance, the part it sits on, its solids, its marks; `sides` keeps its guides off the parts below. */
const PARTS = [
  { name: "wheel rl", dir: [0, -2.2, 0], solids: [wheel(-AX, -32)] },
  { name: "wheel fl", dir: [0, -0.9, 0], solids: [wheel(AX, -32)] },
  { name: "floor", dir: [0, 0, -0.6], solids: [up(-50, -17, 50, 17, 6, 7, 10)] },
  { name: "seats", dir: [0, 1.4, -0.55], par: 2, solids: [...seat(-15, -3), ...seat(3, 15)] },
  { name: "engine", dir: [0.8, 0, -0.55], par: 2, solids: [up(22, -12, 44, 12, 3, 10, 20), up(25, -9, 41, 9, 2.5, 20, 24)],
    marks: [["nf lo", (Q) => poly(circ(4, 16).map((q) => Q(44.3, q.u, 15 + q.v)))]] },
  { name: "body", dir: [0, 0, 0], sides: true, solids: [taper([-58, -24, 58, 24, 12], [-55, -22, 50, 22, 10], 11, 27)],
    marks: [["nf hi", (Q) => pane(Q, nose, 2.5, 11, 0.5, 0.72) + pane(Q, nose, -11, -2.5, 0.5, 0.72)]] },
  { name: "boot", dir: [-0.45, 0, 0.45], par: 5, solids: [up(-53, -19, -37, 19, 4, 27, 27.7)] },
  { name: "cabin", dir: [0, 0, 0.42], par: 5, solids: [taper([-34, -21, 14, 21, 8], [-24, -17, -4, 17, 6], 27, 41)],
    marks: [["nf lo", (Q) => pane(Q, glass, 0.08, 0.92, 0.15, 0.85) + pane(Q, side, 0, 1, 0.2, 0.8)]] },
  { name: "roof", dir: [0, 0, 0.8], par: 7, solids: [up(-25, -17.5, -3, 17.5, 5, 41, 43)] },
  { name: "bonnet", dir: [0.45, 0, 0.45], par: 5, solids: [up(18, -19, 47, 19, 4, 27, 27.7)] },
  { name: "wheel rr", dir: [0, 0.9, 0], solids: [wheel(-AX, 24)] },
  { name: "wheel fr", dir: [0, 0.9, 0], solids: [wheel(AX, 24)] },
];

/** A solid's world points: both of its rings, where they stand. */
function pts(s) {
  if (s.k === "w") return s.ring.flatMap((q) => [[s.x + q.u, s.y0, WR + q.v], [s.x + q.u, s.y1, WR + q.v]]);
  if (s.k === "t") return s.foot.map((q) => [q.u, q.v, s.z0]).concat(s.top.map((q) => [q.u, q.v, s.z1]));
  return s.ring.flatMap((q) => [[q.u, q.v, s.z0], [q.u, q.v, s.z1]]);
}

/** Its silhouette and one crease under projector Q: a prism; a hull of foot and top (rule 09's taper); or a wheel, a cylinder whose axis is the axle. */
function shape(Q, front, s) {
  if (s.k === "p") return prism(Q, front, s.ring, s.inner, s.z0, s.z1);
  if (s.k === "t") return { sil: poly(hull(ringAt(Q, s.foot, s.z0).concat(ringAt(Q, s.top, s.z1)))), crease: open(ringAt(Q, run(s.inner, front), s.z1)) };
  const at = (q, y) => Q(s.x + q.u, y, WR + q.v), seen = (q) => q.nu * V[0] + q.nv * V[2] > 0, face = s.y0 > 0 ? s.y1 : s.y0;
  return { sil: poly(hull(s.ring.map((q) => at(q, s.y0)).concat(s.ring.map((q) => at(q, s.y1))))), crease: open(run(s.inner, seen).map((q) => at(q, face))) };
}

/** Even-odd point in polygon. */
function inside(pt, pg) {
  let c = false;
  for (let i = 0, j = pg.length - 1; i < pg.length; j = i++) if ((pg[i][1] > pt[1]) !== (pg[j][1] > pt[1]) && pt[0] < ((pg[j][0] - pg[i][0]) * (pt[1] - pg[i][1])) / (pg[j][1] - pg[i][1]) + pg[i][0]) c = !c;
  return c;
}

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  const world = PARTS.map((p) => p.solids.flatMap(pts));
  const C = Cam(45, 0.5, S);
  fit(C, PARTS.flatMap((p, i) => world[i].flatMap((q) => [q, q.map((v, k) => v + p.dir[k] * EMAX)])), 200, 166);
  const P = proj(C), front = facing(C), O = P(0, 0, 0), Z = [0, 0, 0];
  const by = (o) => (x, y, z) => P(x + o[0], y + o[1], z + o[2]);
  const shift = (d, e) => { const s = P(d[0] * e, d[1] * e, d[2] * e); return [s[0] - O[0], s[1] - O[1]]; };

  // back to front; each part's dashed guide goes in just before it, so its own plate hides the guide's end
  const g = mk("g", {}, svg);
  const parts = PARTS.map((p, i) => {
    const guide = mk("path", { class: "nf dash" }, g), el = mk("g", {}, g);
    const so = p.solids.map(() => solid(el));
    const hubs = p.solids.filter((s) => s.k === "w").map((s) => ["nf lo", (Q) => poly(circ(3.6, 16).map((q) => Q(s.x + q.u, s.y0 > 0 ? s.y1 : s.y0, WR + q.v)))]);
    const marks = (p.marks || []).concat(hubs), mEl = marks.map(([cls]) => mk("path", { class: cls }, el));
    const hls = p.solids.map((s) => hull(pts(s).map((q) => P(...q))));
    const c = world[i].reduce((a, q) => a.map((v, k) => v + q[k] / world[i].length), [0, 0, 0]);
    return { ...p, par: p.par ?? -1, guide, so, marks, mEl, hls, c, tw: tween(0), drawn: "", gdrawn: "" };
  });
  const lamps = parts[5].mEl[0];

  const E = spring(clamp(value, EMIN, EMAX), { eps: 0.05 });
  // a part rides the part it sits on, and moves off it along its own axis: nothing passes through its parent mid-stagger
  const offs = (now) => parts.reduce((o, pt, i) => {
    const pd = pt.par < 0 ? Z : parts[pt.par].dir, po = pt.par < 0 ? Z : o[pt.par], k = E.x * tval(pt.tw, now);
    o[i] = pt.dir.map((d, j) => po[j] + (d - pd[j]) * k);
    return o;
  }, []);
  function guide(pt, o, po) {
    const s0 = pt.solids[0];
    if (s0.k === "w") { // along the axle, from where the wheel's inner face sat to where it is
      const yi = s0.y0 > 0 ? s0.y0 : s0.y1;
      return Math.hypot(o[0], o[1]) > 1 ? seg(P(s0.x, yi, WR), P(s0.x + o[0], yi + o[1], WR)) : "";
    }
    if (!pt.dir.some(Boolean)) return "";
    return extremes(P, s0.ring || s0.foot).slice(0, pt.sides ? 2 : 3).map((q) => seg(P(q.u + po[0], q.v, s0.z0 + po[2]), P(q.u + o[0], q.v, s0.z0 + o[2]))).join("");
  }
  /** Redraws only what moved: a part's paths when its offset changed, its guide when it or its parent's did. */
  function frame(now) {
    let m = false;
    const o = offs(now);
    parts.forEach((pt, i) => {
      if (!tdone(pt.tw, now)) m = true;
      const po = pt.par < 0 ? Z : o[pt.par], k = o[i].map((v) => v.toFixed(2)).join(), gk = k + "|" + po.map((v) => v.toFixed(2)).join();
      if (k !== pt.drawn) {
        pt.drawn = k;
        const Q = by(o[i]);
        pt.solids.forEach((s, n) => put(pt.so[n], shape(Q, front, s)));
        pt.mEl.forEach((el, n) => el.setAttribute("d", pt.marks[n][1](Q)));
      }
      if (gk !== pt.gdrawn) { pt.gdrawn = gk; pt.guide.setAttribute("d", guide(pt, o[i], po)); }
    });
    return m;
  }
  const loop = register(stage, (dt, now) => { const m = stepS(E, dt); return frame(now) || m; });
  bag.add(loop.unregister);
  frame(performance.now());

  // footprints, static per state: the rest pose's; and, while apart, it with every solid's target hull grown a little
  const restFoot = hull(parts.flatMap((pt) => pt.hls.flat()));
  const moved = (h, d, e) => { const s = shift(d, e); return h.map((p) => [p[0] + s[0], p[1] + s[1]]); };
  const grow = (h) => { const c = h.reduce((a, p) => [a[0] + p[0] / h.length, a[1] + p[1] / h.length], [0, 0]); return h.map((p) => { const d = Math.hypot(p[0] - c[0], p[1] - c[1]) || 1; return [p[0] + ((p[0] - c[0]) * GROW) / d, p[1] + ((p[1] - c[1]) * GROW) / d]; }); };
  let exHulls = [], isOpen = false, cur = -1, lit = "", lastP = null;
  const foot = () => { exHulls = parts.flatMap((pt) => pt.hls.map((h) => grow(moved(h, pt.dir, E.t)))); };
  foot();
  const held = (p) => inside(p, restFoot) || exHulls.some((h) => inside(p, h));
  /** The topmost part one of whose solids, at explode e, holds the point; else -1. */
  function pick(p, e) {
    for (let i = parts.length - 1; i >= 0; i--) if (parts[i].hls.some((h) => inside(p, moved(h, parts[i].dir, e)))) return i;
    return -1;
  }
  /** Where a stagger starts: the part under the point, else the one whose centre is nearest. */
  function origin(p, e) {
    const a = pick(p, e);
    if (a >= 0) return a;
    let best = 0, bd = Infinity;
    parts.forEach((pt, i) => { const c = P(...pt.c), s = shift(pt.dir, e), d = Math.hypot(c[0] + s[0] - p[0], c[1] + s[1] - p[1]); if (d < bd) { bd = d; best = i; } });
    return best;
  }
  /** One bright place: the chosen part's silhouettes, or the headlamps when nothing is chosen. */
  function light(a) {
    const k = a + (isOpen ? "o" : "");
    if (k === lit) return;
    lit = k;
    cur = a;
    parts.forEach((pt, i) => pt.so.forEach((s) => s.sil.classList.toggle("hi", i === a)));
    lamps.classList.toggle("hi", a < 0);
    lamps.classList.toggle("lo", a >= 0);
    read.textContent = a >= 0 ? parts[a].name : isOpen ? "apart" : "rest";
  }
  /** Apart or together, each part's tween staggered by its distance from part a. */
  function burst(on, a) {
    isOpen = on;
    const now = performance.now(), c = parts[a].c;
    parts.forEach((pt) => tset(pt.tw, on ? 1 : 0, now, Math.round(Math.hypot(pt.c[0] - c[0], pt.c[1] - c[1], pt.c[2] - c[2]) / UNIT) * STEP));
    loop.wake();
  }
  function move(p) {
    lastP = p;
    if (!isOpen) { if (!inside(p, restFoot)) return; burst(true, origin(p, 0)); }
    else if (!held(p)) { burst(false, cur >= 0 ? cur : origin(p, E.t)); return light(-1); }
    light(pick(p, E.t));
  }
  bag.add(pointer(stage, { move, leave: () => { if (isOpen) burst(false, cur >= 0 ? cur : lastP ? origin(lastP, E.t) : 5); lastP = null; light(-1); } }));
  light(-1);
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { E.t = clamp(v, EMIN, EMAX); foot(); if (lastP && isOpen) move(lastP); loop.wake(); },
    destroy: bag.dispose,
  };
}

hairline({
  name: "car",
  means: "A small coupe that bursts into its exploded view under the pointer, part by part out from the hand, and goes back together when it leaves.",
  rules: [1, 2, 6, 9],
  range: [14, 22, 26],
  tour: [[267, 168], [177, 80], [128, 208], null],
  mount,
});
