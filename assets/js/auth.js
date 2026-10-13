/* invoice-gen.net — log in / sign up page */
(function () {
  "use strict";
  const IG = window.IG;
  const $ = (s) => document.querySelector(s);
  let mode = "login";

  function nextUrl() {
    const n = new URLSearchParams(window.location.search).get("next") || "/dashboard/";
    return n.startsWith("/") && !n.startsWith("//") ? n : "/dashboard/";
  }

  function msg(text, kind) {
    const box = $("#authMsg");
    box.textContent = text;
    if (kind === "soon") {
      box.innerHTML = "Accounts open very soon. You can already make, download and print invoices for free, no account needed. <a href=\"/#create\">Open the invoice generator</a>";
      kind = "info";
    }
    box.className = "form-msg " + (kind || "err");
    box.hidden = !text;
  }

  /* plain-language errors for what Supabase returns */
  function friendly(m) {
    m = String(m || "");
    if (/invalid login/i.test(m)) return "That email and password don't match. Try again, or use Forgot password.";
    if (/already registered|already been registered/i.test(m)) return "That email already has an account. Log in instead.";
    if (/email not confirmed/i.test(m)) return "Please confirm your email first. Open the link we sent you (check spam too), then log in.";
    if (/(\d+) seconds/i.test(m) || /rate limit|too many/i.test(m)) {
      const s = /(\d+) seconds/i.exec(m);
      return "Too many tries in a short time. Please wait " + (s ? s[1] + " seconds" : "a minute") + " and try again.";
    }
    if (/expired|invalid.*link|otp/i.test(m)) return "That link has expired or was already used. Ask for a new one below.";
    if (/password.*(short|least|weak)/i.test(m)) return "Use a password of at least 8 characters.";
    if (/failed to fetch|network|load failed/i.test(m)) return "Can't reach the server. Check your internet connection and try again.";
    return m || "Something went wrong. Try again.";
  }
  function busy(btn, on, text) {
    if (!btn) return;
    if (on) { btn.dataset.label = btn.innerHTML; btn.disabled = true; btn.classList.add("is-busy"); btn.innerHTML = '<span class="spin" aria-hidden="true"></span>' + text; }
    else if (btn.dataset.label != null) { btn.disabled = false; btn.classList.remove("is-busy"); btn.innerHTML = btn.dataset.label; delete btn.dataset.label; }
  }
  async function ready() {
    await IG.loadCloud();
    if (!IG.cloudReady) { msg("x", "soon"); return false; }
    return true;
  }

  function setMode(m) {
    mode = m;
    document.querySelectorAll("[data-mode]").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.mode === m)));
    $("#authTitle").textContent = m === "login" ? "Welcome back" : "Create your free account";
    $("#authSub").textContent = m === "login" ? "Log in to see your invoices, clients and payments." : "Save every invoice, track payments and email clients.";
    $("#authSubmit").textContent = m === "login" ? "Log in" : "Create account";
    $("#password").setAttribute("autocomplete", m === "login" ? "current-password" : "new-password");
    $("#forgot").hidden = m !== "login";
    const t = $("#authTerms"); if (t) t.hidden = m === "login";
    $("#password").setAttribute("placeholder", m === "login" ? "Your password" : "At least 8 characters");
    meter();
    msg("");
  }

  document.addEventListener("click", (e) => {
    const eye = e.target.closest("#pwEye"); if (!eye) return;
    const pw = $("#password"), show = pw.type === "password";
    pw.type = show ? "text" : "password";
    eye.setAttribute("aria-pressed", String(show));
    eye.setAttribute("aria-label", show ? "Hide password" : "Show password");
    pw.focus();
  });

  /* password strength, shown only while creating an account */
  function meter() {
    const box = $("#pwMeter"); if (!box) return;
    const pw = $("#password").value;
    box.hidden = mode !== "signup" || !pw;
    let n = 0;
    if (pw.length >= 8) n++;
    if (pw.length >= 12) n++;
    if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) n++;
    if (/\d/.test(pw)) n++;
    if (/[^A-Za-z0-9]/.test(pw)) n++;
    const lvl = pw.length < 8 ? 0 : n <= 2 ? 1 : n <= 3 ? 2 : 3;
    box.dataset.lvl = lvl;
    $("#pwHint").textContent = ["Use 8 or more characters", "Okay. Longer is safer", "Good password", "Strong password"][lvl];
  }
  function caps(e) {
    const c = $("#pwCaps"); if (c && e.getModifierState) c.hidden = !e.getModifierState("CapsLock");
  }

  async function submit(e) {
    e.preventDefault();
    const email = $("#email").value.trim();
    const password = $("#password").value;
    if (!IG.validEmail(email)) return msg("Enter a valid email address.");
    if (password.length < 8) return msg("Use a password of at least 8 characters.");
    const btn = $("#authSubmit");
    busy(btn, true, mode === "login" ? "Logging in…" : "Creating your account…");
    msg("");
    try {
      if (!(await ready())) return;
      if (mode === "login") {
        const { error } = await IG.cloud.auth.signInWithPassword({ email, password });
        if (error) throw error;
        window.location.href = nextUrl();
      } else {
        const { data, error } = await IG.cloud.auth.signUp({
          email, password,
          options: { emailRedirectTo: window.location.origin + "/login/?next=" + encodeURIComponent(nextUrl()) }
        });
        if (error) throw error;
        if (data.session) window.location.href = nextUrl();
        else if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0)
          msg("That email already has an account. Log in, or press Continue with Google if you signed up with Google.");
        else msg("Check your inbox (and the spam folder) and click the link we sent to " + email + " to finish creating your account. It can take a minute to arrive.", "ok");
      }
    } catch (err) {
      msg(friendly(err.message));
    } finally {
      busy(btn, false);
    }
  }

  async function magicLink(e) {
    if (e) e.preventDefault();
    const email = $("#email").value.trim();
    if (!IG.validEmail(email)) return msg("Enter your email address first, then press Email me a login link.");
    const a = $("#magic"); if (a.dataset.sending) return; a.dataset.sending = "1";
    try {
      if (!(await ready())) return;
      const { error } = await IG.cloud.auth.signInWithOtp({
        email, options: { emailRedirectTo: window.location.origin + "/login/?next=" + encodeURIComponent(nextUrl()) }
      });
      if (error) return msg(friendly(error.message));
      msg("Login link sent to " + email + ". Open it on this device; it works once and expires in an hour. Check spam if you can't see it.", "ok");
    } finally { delete a.dataset.sending; }
  }

  async function forgot(e) {
    e.preventDefault();
    const email = $("#email").value.trim();
    if (!IG.validEmail(email)) return msg("Enter your email address first, then press Forgot password.");
    if (!(await ready())) return;
    const { error } = await IG.cloud.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + "/login/?reset=1" });
    if (error) return msg(friendly(error.message));
    msg("Password reset link sent to " + email + ". Check spam if you can't see it.", "ok");
  }

  // The Google button is in the page from the start. It is only hidden if config.js
  // turns it off, or if Supabase says Google sign-in is switched off.
  function setGoogle(on) { $("#googleBtn").hidden = !on; $("#googleDivider").hidden = !on; }
  async function checkGoogle() {
    const cfg = window.IG_CONFIG || {};
    if (cfg.GOOGLE_LOGIN === false || !cfg.SUPABASE_URL || !cfg.SUPABASE_ANON_KEY) return setGoogle(false);
    try {
      const r = await fetch(cfg.SUPABASE_URL.replace(/\/$/, "") + "/auth/v1/settings", { headers: { apikey: cfg.SUPABASE_ANON_KEY } });
      if (!r.ok) return;
      const s = await r.json();
      if (s && s.external && s.external.google === false) setGoogle(false);
    } catch (e) { /* keep it showing */ }
  }

  async function google() {
    const btn = $("#googleBtn");
    busy(btn, true, "Opening Google…");
    if (!(await ready())) return busy(btn, false);
    setTimeout(() => busy(btn, false), 8000);
    const { error } = await IG.cloud.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin + "/login/?next=" + encodeURIComponent(nextUrl()) }
    });
    if (error) { busy(btn, false); msg("Google login didn't start: " + friendly(error.message)); }
  }

  async function setNewPassword(e) {
    e.preventDefault();
    const pw = $("#newPassword").value;
    if (pw.length < 8) return msg("Use a password of at least 8 characters.");
    const { error } = await IG.cloud.auth.updateUser({ password: pw });
    if (error) return msg(friendly(error.message));
    msg("Password changed. Taking you to your invoices…", "ok");
    setTimeout(() => (window.location.href = "/dashboard/"), 1200);
  }

  /* links from emails come back with an error in the address when they have expired */
  function linkError() {
    const h = new URLSearchParams((window.location.hash || "").replace(/^#/, "")), q = new URLSearchParams(window.location.search);
    const d = h.get("error_description") || q.get("error_description");
    if (!d) return;
    msg(friendly(d.replace(/\+/g, " ")));
    history.replaceState(null, "", window.location.pathname + (q.get("next") ? "?next=" + encodeURIComponent(q.get("next")) : ""));
  }

  function init() {
    // the form works from the first click: each action waits for the sign-in library if it is still loading
    document.querySelectorAll("[data-mode]").forEach((b) => b.addEventListener("click", () => setMode(b.dataset.mode)));
    if (new URLSearchParams(window.location.search).get("signup") === "1") setMode("signup");
    $("#authForm").addEventListener("submit", submit);
    $("#magic").addEventListener("click", magicLink);
    $("#forgot").addEventListener("click", forgot);
    $("#googleBtn").addEventListener("click", google);
    $("#password").addEventListener("input", meter);
    $("#password").addEventListener("keyup", caps);
    $("#password").addEventListener("blur", () => { const c = $("#pwCaps"); if (c) c.hidden = true; });
    $("#resetForm").addEventListener("submit", setNewPassword);
    linkError();
    checkGoogle();
    IG.loadCloud().then(async () => {
      if (!IG.cloudReady) return;
      IG.cloud.auth.onAuthStateChange((event) => {
        if (event === "PASSWORD_RECOVERY") {
          $("#authForm").hidden = true;
          $("#resetForm").hidden = false;
          $("#authTitle").textContent = "Choose a new password";
        }
      });
      const params = new URLSearchParams(window.location.search);
      const { data } = await IG.cloud.auth.getSession();
      if (data && data.session && !params.get("reset")) window.location.replace(nextUrl());
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
