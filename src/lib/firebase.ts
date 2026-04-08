// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDjMEOjAEWvNLX0UQEgdiuMXEHiEKZFnAA",
  authDomain: "invento-3b3c3.firebaseapp.com",
  projectId: "invento-3b3c3",
  storageBucket: "invento-3b3c3.firebasestorage.app",
  messagingSenderId: "254575165027",
  appId: "1:254575165027:web:a016de33295f4843320256",
  measurementId: "G-QJG44DT427"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
