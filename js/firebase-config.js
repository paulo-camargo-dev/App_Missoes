// Importações
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Config do Firebase
const firebaseConfig = {
    apiKey: "SUA_KEY",
    authDomain: "SEU_AUTH",
    projectId: "SEU_PROJECT",
    storageBucket: "SEU_BUCKET",
    messagingSenderId: "SEU_SENDER",
    appId: "SEU_APP"
};

// Inicializa Firebase
firebase.initializeApp(firebaseConfig);

// Globais
const db = firebase.firestore();
const auth = firebase.auth();
