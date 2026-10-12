/* invoice-gen.net — shared helpers: Supabase client, session, toasts, header */
(function () {
  "use strict";
  const cfg = window.IG_CONFIG || {};
  const IG = (window.IG = window.IG || {});

  // Accounts are loaded only when needed, so first visits stay light and fast.
  const SUPABASE_JS = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.js";
  IG.cfgReady = !!(cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY);
  IG.cloudReady = false;
  IG.cloud = null;
  IG.hasSession = function () { return document.documentElement.classList.contains("has-session"); };
  IG.loadCloud = function () {
    if (IG._cloudP) return IG._cloudP;
    IG._cloudP = new Promise((resolve) => {
      if (!IG.cfgReady) return resolve(null);
      const make = () => {
        try {
          IG.cloud = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY, {
            auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
          });
          IG.cloudReady = true;
        } catch (e) { IG.cloud = null; }
        resolve(IG.cloud);
      };
      if (window.supabase && window.supabase.createClient) return make();
      const s = document.createElement("script");
      s.src = SUPABASE_JS; s.async = true;
      s.onload = make; s.onerror = () => resolve(null);
      document.head.appendChild(s);
    });
    return IG._cloudP;
  };

  /* drafts live for this tab only (cleared when the tab is closed) */
  IG.draft = {
    get() { try { const v = sessionStorage.getItem("ig_draft"); return v ? JSON.parse(v) : null; } catch (e) { return null; } },
    set(v) { try { sessionStorage.setItem("ig_draft", JSON.stringify(v)); } catch (e) { /* ignore */ } },
    remove() { try { sessionStorage.removeItem("ig_draft"); } catch (e) { /* ignore */ } }
  };
  try { localStorage.removeItem("ig_draft"); } catch (e) { /* old permanent drafts */ }

  IG.getUser = async function () {
    if (!IG.cloud) {
      if (!IG.hasSession()) return null;
      await IG.loadCloud();
      if (!IG.cloud) return null;
    }
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
      const scrim = document.createElement("div");
      scrim.className = "nav-scrim";
      document.body.appendChild(scrim);
      const set = (open) => {
        nav.classList.toggle("open", open);
        toggle.setAttribute("aria-expanded", String(open));
        document.documentElement.classList.toggle("nav-open", open);
      };
      toggle.addEventListener("click", () => set(!nav.classList.contains("open")));
      scrim.addEventListener("click", () => set(false));
      document.addEventListener("keydown", (e) => { if (e.key === "Escape" && nav.classList.contains("open")) set(false); });
      nav.addEventListener("click", (e) => { if (e.target.closest("a")) set(false); });
    }
    const user = await IG.getUser();
    document.documentElement.classList.toggle("has-session", !!user);
    document.querySelectorAll('[data-auth="in"]').forEach((el) => (el.hidden = !user));
    document.querySelectorAll('[data-auth="out"]').forEach((el) => (el.hidden = !!user));
    const av = document.getElementById("navAvatar");
    if (av && user && user.email) { av.textContent = user.email.charAt(0).toUpperCase(); av.parentElement.title = user.email; }
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
