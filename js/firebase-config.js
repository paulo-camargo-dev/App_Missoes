import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyA6vv58ejDEH8cmh3833VchEd7DIct8ba0",
    authDomain: "appmissoes-21c4f.firebaseapp.com",
    projectId: "appmissoes-21c4f",
    storageBucket: "appmissoes-21c4f.firebasestorage.app",
    messagingSenderId: "97813114592",
    appId: "1:97813114592:web:5d51ae9b0bf9f01058ea85"
};

// Inicializa Firebase (método novo)
export const app = initializeApp(firebaseConfig);

// Firestore
export const db = getFirestore(app);

// Auth
export const auth = getAuth(app);

