import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import {
    getMessaging,
    getToken,
    onMessage,
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-messaging.js";

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
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

function requestPermission() {
  console.log('Requesting permission...');
  Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
          console.log('Notification permission granted.');
      } else {
          console.log('Unable to get permission to notify.');
      }
  });
}
requestPermission();

let firebaseServiceWorker;
if ('serviceWorker' in navigator) {
    try {
        firebaseServiceWorker = await navigator.serviceWorker.register('./firebase-messaging-sw.js')
        console.log('Service worker registered.', firebaseServiceWorker);
    } catch (err) {
        console.error('Unable to register service worker.', err);
    }
}
getToken(messaging, {
    serviceWorkerRegistration: firebaseServiceWorker,
    vapidKey: 
        "BO4ruaq8L9n0N2HksdkvZ9jSO9OGFOUl6xQeVsrCpez8Ud_ZLyy-WMUWnU5GAVKSicwXOqkCafZkLP_gmPBT4b8"
})
  .then((currentToken) => {
    if (currentToken) {
        console.log("current token for client: ", currentToken);
    } else {
        // Show permission request UI
        console.log(
            "No registration token available. Request permission to generate one."
        );
    }
  })
  .catch((err) => {
      console.log("An error occurred while retrieving token. ", err);
  });

onMessage(messaging, (payload) => {
    console.log('Message received. ', payload);
    const notificationBody = payload.notification.body;

    // TODO: replace this with a toast in the UI
    alert(notificationBody)
});