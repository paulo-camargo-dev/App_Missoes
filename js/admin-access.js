const ACCESS_KEY = "admin_access_ok";
const ADMIN_EMAIL = "admin@missoes.com";

const gate = document.getElementById("adminAuthGate");
const content = document.getElementById("adminContent");
const form = document.getElementById("adminAuthForm");
const input = document.getElementById("adminPassword");
const error = document.getElementById("adminAuthError");

let scriptsLoaded = false;
let gateRemoved = false;

function injectModuleScript(src) {
    const script = document.createElement("script");
    script.type = "module";
    script.src = src;
    document.body.appendChild(script);
}

function loadAdminScripts() {
    if (scriptsLoaded) return;
    injectModuleScript("js/admin.js");
    injectModuleScript("js/adminhero.js");
    scriptsLoaded = true;
}

function removeGateWithAnimation() {
    if (!gate || gateRemoved) return;

    gate.classList.add("auth-gate-exit");
    window.setTimeout(() => {
        gate.remove();
        gateRemoved = true;
    }, 220);
}

function unlockAdmin() {
    sessionStorage.setItem(ACCESS_KEY, "1");
    if (content) content.hidden = false;
    removeGateWithAnimation();
    loadAdminScripts();
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
}

function lockAdmin() {
    sessionStorage.removeItem(ACCESS_KEY);
}

function getFirebaseAuthInstance() {
    if (!window.firebase?.auth) return null;
    try {
        return window.firebase.auth();
    } catch {
        return null;
    }
}

function waitForAuthReady(auth) {
    return new Promise((resolve) => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            unsubscribe();
            resolve(user);
        });
    });
}

async function tryRestoreSession() {
    if (sessionStorage.getItem(ACCESS_KEY) !== "1") return;

    const auth = getFirebaseAuthInstance();
    if (!auth) {
        lockAdmin();
        return;
    }

    const user = await waitForAuthReady(auth);
    if (user) {
        unlockAdmin();
        return;
    }

    lockAdmin();
}

if (form) {
    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const password = input?.value?.trim() ?? "";
        const auth = getFirebaseAuthInstance();

        if (!auth) {
            if (error) error.textContent = "Falha ao iniciar autenticacao.";
            return;
        }

        if (!password) {
            if (error) error.textContent = "Digite a senha.";
            return;
        }

        try {
            await auth.signInWithEmailAndPassword(ADMIN_EMAIL, password);
            if (error) error.textContent = "";
            if (input) input.value = "";
            unlockAdmin();
            return;
        } catch (err) {
            console.error("Erro no login admin:", err);
        }

        if (error) error.textContent = "Senha incorreta.";
        if (input) input.value = "";
    });
}

window.addEventListener("DOMContentLoaded", () => {
    void tryRestoreSession();
});

window.addEventListener("pagehide", () => {
    lockAdmin();
});
