// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyA7kY_xl-B1r6pfRlUCVcI8OcLe7rOh11g",
    authDomain: "digitalcodestore-tuquangnam.firebaseapp.com",
    projectId: "digitalcodestore-tuquangnam",
    storageBucket: "digitalcodestore-tuquangnam.firebasestorage.app",
    messagingSenderId: "226534281162",
    appId: "1:226534281162:web:9e734c1b07378efb280933",
    measurementId: "G-9V4G42XSZS"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();