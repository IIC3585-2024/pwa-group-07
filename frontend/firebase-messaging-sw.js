importScripts("https://www.gstatic.com/firebasejs/10.11.1/firebase-app-compat.js")
importScripts("https://www.gstatic.com/firebasejs/10.11.1/firebase-messaging-compat.js")

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDi_Ku4d07op7w8v4Nh8VdPEQ72g-iREC8",
  authDomain: "pwa-g7.firebaseapp.com",
  projectId: "pwa-g7",
  storageBucket: "pwa-g7.appspot.com",
  messagingSenderId: "12229005519",
  appId: "1:12229005519:web:a2e6761d10bca20e3167ba",
  measurementId: "G-JPDQW9S45S"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // Customize notification here
  const notificationTitle = payload.notification.title || payload.data.title;
  const notificationOptions = {
    body: payload.notification.body || payload.data.body,
    icon: '/images/notes-logo.jpg',
  };

  self.registration.showNotification(notificationTitle,
    notificationOptions);
});