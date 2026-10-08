/* invoice-gen.net — motion: header, scroll reveals, accordions, hero demo, phone action bar.
   Everything here is an enhancement: the page reads fine if this file never runs. */
(function () {
  "use strict";
  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));

  /* header shadow once the page scrolls */
  function header() {
    const h = $(".site-header");
    if (!h) return;
    let ticking = false;
    const set = () => { h.classList.toggle("scrolled", window.scrollY > 8); ticking = false; };
    window.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(set); } }, { passive: true });
    set();
    // close the phone menu after choosing a link
    $$(".nav a").forEach((a) => a.addEventListener("click", () => {
      const nav = $(".nav"), t = $(".nav-toggle");
      if (nav && nav.classList.contains("open")) { nav.classList.remove("open"); if (t) t.setAttribute("aria-expanded", "false"); }
    }));
  }

  /* fade sections in as they arrive; never leaves content hidden */
  function reveals() {
    const els = $$(".reveal");
    const showAll = () => els.forEach((e) => e.classList.add("in"));
    if (reduce || !("IntersectionObserver" in window)) return showAll();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    els.forEach((e, i) => {
      const r = e.getBoundingClientRect();
      if (r.top < window.innerHeight) { e.style.transitionDelay = Math.min(i, 3) * 90 + "ms"; requestAnimationFrame(() => e.classList.add("in")); }
      else io.observe(e);
    });
    setTimeout(showAll, 4000); // failsafe
  }

  /* smooth open/close for the FAQ */
  function accordions() {
    $$("details.qa").forEach((d) => {
      const s = $("summary", d), body = $(".qa-body", d);
      if (!s || !body) return;
      s.addEventListener("click", (e) => {
        if (reduce || !body.animate) return;
        e.preventDefault();
        if (d.open) {
          const h = body.offsetHeight;
          const a = body.animate([{ height: h + "px", opacity: 1 }, { height: "0px", opacity: 0 }], { duration: 280, easing: "cubic-bezier(.2,.75,.2,1)" });
          d.classList.add("closing");
          a.onfinish = () => { d.open = false; d.classList.remove("closing"); };
        } else {
          d.open = true;
          const h = body.offsetHeight;
          body.animate([{ height: "0px", opacity: 0 }, { height: h + "px", opacity: 1 }], { duration: 360, easing: "cubic-bezier(.2,.75,.2,1)" });
        }
      });
    });
  }

  /* hero: the example invoice types itself, then gets stamped */
  function demo() {
    const root = $("#demo");
    if (!root || reduce) return;
    const typed = $$("[data-type]", root);
    const rows = $$("[data-row]", root);
    const amounts = $$("[data-amt]", root);
    const total = $("[data-count]", root);
    const stamp = $(".demo-stamp", root);
    const texts = typed.map((el) => el.textContent);
    const fmt = (n) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    const caret = document.createElement("span");
    caret.className = "caret";

    typed.forEach((el) => (el.textContent = ""));
    rows.forEach((r) => r.classList.add("pending"));
    amounts.forEach((a) => (a.textContent = ""));
    if (total) total.textContent = fmt(0);
    if (stamp) stamp.classList.add("pending");

    async function type(el, text, speed) {
      el.appendChild(caret);
      for (let i = 1; i <= text.length; i++) {
        el.textContent = text.slice(0, i);
        el.appendChild(caret);
        await wait(speed + Math.random() * 30);
      }
    }
    function count(el, to, ms) {
      return new Promise((done) => {
        const t0 = performance.now();
        const step = (t) => {
          const p = Math.min(1, (t - t0) / ms);
          const e = 1 - Math.pow(1 - p, 3);
          el.textContent = fmt(Math.round(to * e * 100) / 100);
          if (p < 1) requestAnimationFrame(step); else done();
        };
        requestAnimationFrame(step);
      });
    }
    let running = false;
    async function play() {
      if (running) return;
      running = true;
      await wait(500);
      let ti = 0, sum = 0;
      // header fields: invoice number, from name/place, client name/place
      for (; ti < 5; ti++) await type(typed[ti], texts[ti], 34);
      for (let r = 0; r < rows.length; r++) {
        rows[r].classList.remove("pending");
        await wait(160);
        await type(typed[ti], texts[ti], 26); ti++;
        const a = amounts[r], v = Number(a.dataset.amt);
        await count(a, v, 380);
        sum += v;
        if (total) total.textContent = fmt(sum);
      }
      caret.remove();
      if (total) await count(total, Number(total.dataset.count), 300);
      await wait(350);
      if (stamp) { stamp.classList.remove("pending"); stamp.classList.add("thunk"); }
    }
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((en) => { if (en[0].isIntersecting) { io.disconnect(); play(); } }, { threshold: 0.35 });
      io.observe(root);
    } else play();
  }

  /* phone: show the Download/Send bar only while the invoice is on screen */
  function mobileBar() {
    const bar = $(".mobile-bar"), desk = $("#create");
    if (!bar || !desk) return;
    if (!("IntersectionObserver" in window)) return bar.classList.add("show");
    new IntersectionObserver((en) => bar.classList.toggle("show", en[0].isIntersecting), { threshold: 0.02 }).observe(desk);
  }

  function start() { header(); reveals(); accordions(); demo(); mobileBar(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
