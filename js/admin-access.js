const ACCESS_KEY = "admin_access_ok";

// EMAIL DO ADMIN (precisa existir no Firebase Authentication)
const ADMIN_EMAIL = "p.camargo1508@gmail.com";

// CONFIG DO FIREBASE (mantida igual)
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


// =============================
// CARREGAR SCRIPTS DO ADMIN
// =============================
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


// =============================
// ANIMAÇÃO DO GATE
// =============================
function removeGateWithAnimation() {
    if (!gate || gateRemoved) return;

    gate.classList.add("auth-gate-exit");

    setTimeout(() => {
        gate.remove();
        gateRemoved = true;
    }, 200);
}


// =============================
// LIBERAR ADMIN
// =============================
function unlockAdmin() {

    sessionStorage.setItem(ACCESS_KEY, "1");

    if (content) {
        content.hidden = false;
    }

    removeGateWithAnimation();
    loadAdminScripts();

    window.scrollTo({
        top: 0,
        behavior: "auto"
    });
}


// =============================
// BLOQUEAR ADMIN
// =============================
function lockAdmin() {
    sessionStorage.removeItem(ACCESS_KEY);
}


// =============================
// INICIAR FIREBASE
// =============================
function initFirebase() {

    if (!window.firebase?.initializeApp) return false;

    if (window.firebase.apps.length === 0) {

        try {
            window.firebase.initializeApp(FIREBASE_CONFIG);
        } catch (err) {
            console.error("Erro ao iniciar Firebase:", err);
            return false;
        }

    }

    return true;
}


// =============================
// OBTER AUTH
// =============================
function getAuth() {

    if (!window.firebase?.auth) return null;

    try {
        return window.firebase.auth();
    } catch {
        return null;
    }

}


// =============================
// LIMPAR FORM
// =============================
function clearForm() {

    if (input) input.value = "";

    if (error) error.textContent = "";

}


// =============================
// VERIFICAR SESSÃO
// =============================
async function tryRestoreSession() {

    const auth = getAuth();

    if (!auth) {
        lockAdmin();
        return;
    }

    auth.onAuthStateChanged((user) => {

        if (user) {
            unlockAdmin();
        } else {
            lockAdmin();
        }

    });

}


// =============================
// LOGIN ADMIN
// =============================
if (form) {

    form.addEventListener("submit", async (e) => {

        e.preventDefault();

        const password = input?.value?.trim();

        if (!password) {

            error.textContent = "Digite a senha.";
            return;

        }

        initFirebase();

        const auth = getAuth();

        if (!auth) {

            error.textContent = "Erro ao iniciar autenticação.";
            return;

        }

        try {

            await auth.setPersistence(
                window.firebase.auth.Auth.Persistence.NONE
            );

            await auth.signInWithEmailAndPassword(
                ADMIN_EMAIL,
                password
            );

            clearForm();

            unlockAdmin();

        } catch (err) {

            console.error("Erro login:", err);

            error.textContent = "Senha incorreta.";

            clearForm();

        }

    });

}


// =============================
// EVENTOS
// =============================
window.addEventListener("DOMContentLoaded", () => {

    initFirebase();

    tryRestoreSession();

});


window.addEventListener("pagehide", () => {

    const auth = getAuth();

    if (auth?.currentUser) {
        auth.signOut().catch(() => {});
    }

    lockAdmin();

    clearForm();

});


