/* invoice-gen.net — motion: header, scroll reveals, accordions, hero product demo, phone action bar.
   Everything here is an enhancement: the page reads fine if this file never runs. */
(function () {
  "use strict";
  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  function header() {
    const h = $(".site-header");
    if (!h) return;
    let ticking = false;
    const set = () => { h.classList.toggle("scrolled", window.scrollY > 8); ticking = false; };
    window.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(set); } }, { passive: true });
    set();
    $$(".nav a").forEach((a) => a.addEventListener("click", () => {
      const nav = $(".nav"), t = $(".nav-toggle");
      if (nav && nav.classList.contains("open")) { nav.classList.remove("open"); if (t) t.setAttribute("aria-expanded", "false"); }
    }));
  }

  function reveals() {
    const els = $$(".reveal");
    const showAll = () => els.forEach((e) => e.classList.add("is-in"));
    if (reduce || !("IntersectionObserver" in window)) return showAll();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.06 });
    let firstScreen = 0;
    els.forEach((e) => {
      if (e.getBoundingClientRect().top < window.innerHeight) {
        e.style.transitionDelay = Math.min(firstScreen++, 6) * 70 + "ms";
        requestAnimationFrame(() => e.classList.add("is-in"));
      } else {
        // stagger siblings in grids
        const sibs = e.parentElement ? $$(":scope > .reveal", e.parentElement) : [];
        const idx = sibs.indexOf(e);
        if (idx > 0) e.style.transitionDelay = Math.min(idx, 5) * 80 + "ms";
        io.observe(e);
      }
    });
    setTimeout(showAll, 4500);
  }

  function accordions() {
    $$("details.qa").forEach((d) => {
      const s = $("summary", d), body = $(".qa-body", d);
      if (!s || !body) return;
      s.addEventListener("click", (e) => {
        if (reduce || !body.animate) return;
        e.preventDefault();
        if (d.open) {
          const a = body.animate([{ height: body.offsetHeight + "px", opacity: 1 }, { height: "0px", opacity: 0 }], { duration: 260, easing: "cubic-bezier(.2,.75,.2,1)" });
          a.onfinish = () => { d.open = false; };
        } else {
          d.open = true;
          body.animate([{ height: "0px", opacity: 0 }, { height: body.offsetHeight + "px", opacity: 1 }], { duration: 340, easing: "cubic-bezier(.2,.75,.2,1)" });
        }
      });
    });
  }

  /* hero: the product mock fills itself in, then the PDF is "downloaded" and sent */
  function heroDemo() {
    const mock = $("#heroMock");
    if (!mock || reduce) { if (mock) mock.classList.add("played"); return; }
    const ins = $$("[data-mtype]", mock);
    const rows = $$("[data-mrow]", mock);
    const total = $("#mockTotal");
    const btn = $("#mockBtn");
    const fmt = (n) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    ins.forEach((el) => (el.textContent = ""));
    rows.forEach((r) => r.classList.add("pending"));
    total.textContent = fmt(0);
    mock.classList.add("playing");

    async function type(el, text) {
      el.classList.add("typing");
      for (let i = 1; i <= text.length; i++) { el.textContent = text.slice(0, i); await wait(28 + Math.random() * 30); }
      el.classList.remove("typing");
    }
    function count(from, to, ms) {
      return new Promise((done) => {
        const t0 = performance.now();
        const step = (t) => {
          const p = Math.min(1, (t - t0) / ms), e = 1 - Math.pow(1 - p, 3);
          total.textContent = fmt(from + (to - from) * e);
          if (p < 1) requestAnimationFrame(step); else done();
        };
        requestAnimationFrame(step);
      });
    }
    async function play() {
      await wait(700);
      let sum = 0;
      for (let r = 0; r < rows.length; r++) {
        await type(ins[r * 2], ins[r * 2].dataset.mtype);
        await type(ins[r * 2 + 1], ins[r * 2 + 1].dataset.mtype);
        rows[r].classList.remove("pending");
        const v = Number(ins[r * 2 + 1].dataset.mtype);
        await count(sum, sum + v, 420);
        sum += v;
        await wait(150);
      }
      await wait(400);
      btn.classList.add("press");
      await wait(420);
      btn.classList.remove("press");
      mock.classList.add("sent");
      await wait(1400);
      mock.classList.add("paid");
    }
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((en) => { if (en[0].isIntersecting) { io.disconnect(); play(); } }, { threshold: 0.3 });
      io.observe(mock);
    } else play();
  }

  function mobileBar() {
    const bar = $(".mobile-bar"), area = $("#create");
    if (!bar || !area) return;
    if (!("IntersectionObserver" in window)) return bar.classList.add("show");
    new IntersectionObserver((en) => bar.classList.toggle("show", en[0].isIntersecting), { threshold: 0.02 }).observe(area);
  }

  function start() { header(); reveals(); accordions(); heroDemo(); mobileBar(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
