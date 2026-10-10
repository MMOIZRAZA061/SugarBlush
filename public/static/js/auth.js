/* Sugar Blush - client-side auth gate for the static clone.
   Credentials: admin@bakery.com / admin123
   NOTE: This is a front-end-only simulation. The real site authenticates
   server-side via Flask sessions. Do not use this for real security. */
(function () {
    'use strict';

    var ADMIN_EMAIL = 'admin@bakery.com';
    var ADMIN_PASS = 'admin123';
    var KEY = 'sugarblush_auth';

    function isAuthed() {
        try { return JSON.parse(localStorage.getItem(KEY) || '{}').ok === true; }
        catch (e) { return false; }
    }

    function login(email, pass) {
        if (email.trim().toLowerCase() === ADMIN_EMAIL && pass === ADMIN_PASS) {
            localStorage.setItem(KEY, JSON.stringify({ ok: true, email: ADMIN_EMAIL, role: 'admin' }));
            return true;
        }
        return false;
    }

    function logout() {
        localStorage.removeItem(KEY);
    }

    // ---- Guard: if this page is inside /admin and not authed, bounce to login ----
    function guard() {
        var path = location.pathname.toLowerCase();
        var needsAuth = path.indexOf('/admin/') !== -1 ||
            path.indexOf('/profile') !== -1 ||
            path.indexOf('/order_history') !== -1 ||
            path.indexOf('/cart') !== -1;
        if (needsAuth && !isAuthed()) {
            var loginUrl = path.indexOf('/admin/') !== -1 ? '../login.html' : 'login.html';
            location.replace(loginUrl);
        }
    }

    // ---- Wire up the login form if present ----
    function wireLogin() {
        var form = document.querySelector('form#loginForm') ||
            document.querySelector('form[action="/login"]') ||
            document.querySelector('form[action="login.html"]');
        if (!form) return;
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            var email = form.querySelector('input[name="email"]');
            var pass = form.querySelector('input[name="password"]');
            if (login(email.value, pass.value)) {
                var next = new URLSearchParams(location.search).get('next');
                location.href = next ? decodeURIComponent(next) : 'admin/dashboard.html';
            } else {
                var alert = document.createElement('div');
                alert.className = 'alert alert-danger';
                alert.textContent = 'Invalid email or password.';
                form.parentNode.insertBefore(alert, form);
                alert.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    // ---- Wire up logout links ----
    function wireLogout() {
        document.querySelectorAll('a[href*="logout"]').forEach(function (a) {
            a.addEventListener('click', function (e) {
                e.preventDefault();
                logout();
                location.href = a.getAttribute('data-logout-to') || 'index.html';
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        guard();
        wireLogin();
        wireLogout();
    });

    window.SugarBlushAuth = { isAuthed: isAuthed, login: login, logout: logout };
})();
