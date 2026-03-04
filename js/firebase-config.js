// Importações
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Configuração do seu projeto
const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "appmissoes-21c4f.firebaseapp.com",
  projectId: "appmissoes-21c4f",
  storageBucket: "appmissoes-21c4f.appspot.com",
  messagingSenderId: "97813114592",
  appId: "1:97813114592:web:5d51ae9b0bf9f01058ea85"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar Firestore
export const db = getFirestore(app);