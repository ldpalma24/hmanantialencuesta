// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCm0rLeyEVSwHGwx35EVFQxSZz82fYc-KI",
  authDomain: "encuesta-de07e.firebaseapp.com",
  projectId: "encuesta-de07e",
  storageBucket: "encuesta-de07e.appspot.com",
  messagingSenderId: "319902812159",
  appId: "1:319902812159:web:f8c2b47ec40250ed3809ca",
  measurementId: "G-RQ02SBSFPX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Formulario de manejo
const form = document.getElementById('surveyForm');

form.addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // Referencia a la base de datos
    const surveyRef = ref(database, 'surveys/' + Date.now()); // Usa un timestamp para un ID único

    // Guardar datos en Realtime Database
    set(surveyRef, data)
    .then(() => {
        console.log('Datos enviados:', data);
        alert('¡Gracias por completar la encuesta!');
    })
    .catch((error) => {
        console.error('Error al enviar los datos:', error);
        alert('Lo sentimos, ocurrió un error al enviar la encuesta. Por favor, inténtalo de nuevo más tarde.');
    });
});
