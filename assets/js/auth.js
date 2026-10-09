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

  function setMode(m) {
    mode = m;
    document.querySelectorAll("[data-mode]").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.mode === m)));
    $("#authTitle").textContent = m === "login" ? "Welcome back" : "Create your free account";
    $("#authSub").textContent = m === "login" ? "Log in to see your invoices, clients and payments." : "Save every invoice, track payments and email clients. Free, no card needed.";
    $("#authSubmit").textContent = m === "login" ? "Log in" : "Create account";
    $("#password").setAttribute("autocomplete", m === "login" ? "current-password" : "new-password");
    $("#forgot").hidden = m !== "login";
    msg("");
  }

  async function submit(e) {
    e.preventDefault();
    const email = $("#email").value.trim();
    const password = $("#password").value;
    if (!IG.validEmail(email)) return msg("Enter a valid email address.");
    if (password.length < 8) return msg("Use a password of at least 8 characters.");
    const btn = $("#authSubmit");
    btn.disabled = true;
    try {
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
        else msg("Check your inbox and click the link we sent to " + email + " to finish creating your account.", "ok");
      }
    } catch (err) {
      const m = err.message || "";
      if (/invalid login/i.test(m)) msg("That email and password don't match. Try again or reset your password.");
      else if (/already registered/i.test(m)) msg("That email already has an account. Log in instead.");
      else msg(m || "Something went wrong. Try again.");
    } finally {
      btn.disabled = false;
    }
  }

  async function magicLink() {
    const email = $("#email").value.trim();
    if (!IG.validEmail(email)) return msg("Enter your email address first, then press Email me a login link.");
    const { error } = await IG.cloud.auth.signInWithOtp({
      email, options: { emailRedirectTo: window.location.origin + "/login/?next=" + encodeURIComponent(nextUrl()) }
    });
    if (error) return msg(error.message);
    msg("Login link sent to " + email + ". Open it on this device.", "ok");
  }

  async function forgot(e) {
    e.preventDefault();
    const email = $("#email").value.trim();
    if (!IG.validEmail(email)) return msg("Enter your email address first, then press Forgot password.");
    const { error } = await IG.cloud.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + "/login/?reset=1" });
    if (error) return msg(error.message);
    msg("Password reset link sent to " + email + ".", "ok");
  }

  async function google() {
    const { error } = await IG.cloud.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin + "/login/?next=" + encodeURIComponent(nextUrl()) }
    });
    if (error) msg("Google login isn't set up yet: " + error.message);
  }

  async function setNewPassword(e) {
    e.preventDefault();
    const pw = $("#newPassword").value;
    if (pw.length < 8) return msg("Use a password of at least 8 characters.");
    const { error } = await IG.cloud.auth.updateUser({ password: pw });
    if (error) return msg(error.message);
    msg("Password changed. Taking you to your invoices…", "ok");
    setTimeout(() => (window.location.href = "/dashboard/"), 1200);
  }

  document.addEventListener("DOMContentLoaded", async () => {
    if (!(window.IG_CONFIG || {}).GOOGLE_LOGIN) { $("#googleBtn").hidden = true; const dv = document.querySelector(".auth-card .divider"); if (dv) dv.hidden = true; }
    document.querySelectorAll("[data-mode]").forEach((b) => b.addEventListener("click", () => setMode(b.dataset.mode)));
    if (new URLSearchParams(window.location.search).get("signup") === "1") setMode("signup");
    if (!IG.cloudReady) {
      // Accounts are off until Supabase keys are added in assets/js/config.js.
      if (window.console) console.info("invoice-gen: add Supabase keys in assets/js/config.js to switch on accounts.");
      const soon = (e) => { if (e) e.preventDefault(); msg("x", "soon"); };
      $("#authForm").addEventListener("submit", soon);
      ["#magic", "#forgot", "#googleBtn"].forEach((s) => $(s).addEventListener("click", soon));
      return;
    }
    $("#authForm").addEventListener("submit", submit);
    $("#magic").addEventListener("click", magicLink);
    $("#forgot").addEventListener("click", forgot);
    $("#googleBtn").addEventListener("click", google);
    $("#resetForm").addEventListener("submit", setNewPassword);

    IG.cloud.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        $("#authForm").hidden = true;
        $("#resetForm").hidden = false;
        $("#authTitle").textContent = "Choose a new password";
      }
    });

    const params = new URLSearchParams(window.location.search);
    const user = await IG.getUser();
    if (user && !params.get("reset")) window.location.replace(nextUrl());
  });
})();
