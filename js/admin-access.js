const ACCESS_KEY = "admin_access_ok";
const ADMIN_EMAIL = "admin@missoes.com";
const FIREBASE_CONFIG = {
    apiKey: "AIzaSyC9jZSgV-rA8V0IblMc6o5JKSaMQnmoyJ0",
    authDomain: "app-missao-login.firebaseapp.com",
    projectId: "app-missao-login",
    storageBucket: "app-missao-login.firebasestorage.app",
    messagingSenderId: "816155644292",
    appId: "1:816155644292:web:b26d68352c4860dc448dd1"
};

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

function initFirebaseCompat() {
    if (!window.firebase?.initializeApp || !window.firebase?.apps) return false;
    if (window.firebase.apps.length > 0) return true;

    try {
        window.firebase.initializeApp(FIREBASE_CONFIG);
        return true;
    } catch (err) {
        console.error("Erro ao inicializar Firebase compat:", err);
        return false;
    }
}

function getFirebaseAuthInstance() {
    if (!window.firebase?.auth) return null;
    try {
        return window.firebase.auth();
    } catch {
        return null;
    }
}

function clearLoginForm() {
    if (input) input.value = "";
    if (error) error.textContent = "";
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
        initFirebaseCompat();
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
            // Nao persiste login entre paginas/refresh: sempre exigira novo login.
            await auth.setPersistence(window.firebase.auth.Auth.Persistence.NONE);
            await auth.signInWithEmailAndPassword(ADMIN_EMAIL, password);
            if (error) error.textContent = "";
            clearLoginForm();
            unlockAdmin();
            return;
        } catch (err) {
            console.error("Erro no login admin:", err);
        }

        if (error) error.textContent = "Senha incorreta.";
        clearLoginForm();
    });
}

window.addEventListener("DOMContentLoaded", () => {
    initFirebaseCompat();
    void tryRestoreSession();
});

window.addEventListener("pagehide", () => {
    const auth = getFirebaseAuthInstance();
    if (auth?.currentUser) {
        auth.signOut().catch(() => {});
    }
    lockAdmin();
    clearLoginForm();
});


