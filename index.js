// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCXBMBMIMMHtU3CpUa_6LxP0siwAaYO1co",
  authDomain: "lubo-45538.firebaseapp.com",
  projectId: "lubo-45538",
  storageBucket: "lubo-45538.firebasestorage.app",
  messagingSenderId: "593280990400",
  appId: "1:593280990400:web:3f73beb1ab9686d830c125",
  measurementId: "G-5040DHD11R"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);