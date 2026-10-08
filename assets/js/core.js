/* invoice-gen.net — shared helpers: Supabase client, session, toasts, header */
(function () {
  "use strict";
  const cfg = window.IG_CONFIG || {};
  const IG = (window.IG = window.IG || {});

  IG.cloudReady = !!(cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY && window.supabase && window.supabase.createClient);
  IG.cloud = IG.cloudReady
    ? window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
      })
    : null;

  IG.getUser = async function () {
    if (!IG.cloud) return null;
    try {
      const { data } = await IG.cloud.auth.getSession();
      return (data && data.session && data.session.user) || null;
    } catch (e) {
      return null;
    }
  };

  IG.signOut = async function () {
    if (IG.cloud) await IG.cloud.auth.signOut();
    window.location.href = "/";
  };

  /* small safe storage wrapper */
  IG.store = {
    get(key, fallback) {
      try {
        const v = window.localStorage.getItem(key);
        return v === null ? fallback : JSON.parse(v);
      } catch (e) {
        return fallback;
      }
    },
    set(key, value) {
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
      } catch (e) { /* storage full or blocked: ignore */ }
    },
    remove(key) {
      try { window.localStorage.removeItem(key); } catch (e) { /* ignore */ }
    }
  };

  IG.esc = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  };

  IG.toast = function (msg, kind) {
    let zone = document.querySelector(".toast-zone");
    if (!zone) {
      zone = document.createElement("div");
      zone.className = "toast-zone";
      zone.setAttribute("role", "status");
      zone.setAttribute("aria-live", "polite");
      document.body.appendChild(zone);
    }
    const t = document.createElement("div");
    t.className = "toast" + (kind ? " " + kind : "");
    t.textContent = msg;
    zone.appendChild(t);
    setTimeout(() => t.remove(), kind === "err" ? 6500 : 3800);
  };

  /* header: mobile menu + logged-in state */
  IG.initHeader = async function () {
    const toggle = document.querySelector(".nav-toggle");
    const nav = document.querySelector(".nav");
    if (toggle && nav) {
      toggle.addEventListener("click", () => {
        const open = nav.classList.toggle("open");
        toggle.setAttribute("aria-expanded", String(open));
      });
    }
    const user = await IG.getUser();
    document.querySelectorAll('[data-auth="in"]').forEach((el) => (el.hidden = !user));
    document.querySelectorAll('[data-auth="out"]').forEach((el) => (el.hidden = !!user));
    document.querySelectorAll("[data-signout]").forEach((el) =>
      el.addEventListener("click", (e) => {
        e.preventDefault();
        IG.signOut();
      })
    );
    const y = document.querySelector("[data-year]");
    if (y) y.textContent = new Date().getFullYear();
    return user;
  };

  document.addEventListener("DOMContentLoaded", () => {
    IG.headerReady = IG.initHeader();
  });
})();
