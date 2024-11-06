// firebase-messaging-sw.js

importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js');

// Inicializar Firebase en el Service Worker
firebase.initializeApp({
  apiKey: "AIzaSyBRopajK9bEflimlxQCq2h6nJe9t0vcRcY",
  authDomain: "messagecloud-8f0ff.firebaseapp.com",
  projectId: "messagecloud-8f0ff",
  storageBucket: "messagecloud-8f0ff.appspot.com",
  messagingSenderId: "716480432186",
  appId: "1:716480432186:web:860c66139cd56864c34d03",
  measurementId: "G-QE5NMK42P7"
});

// Inicializar Firebase Messaging
const messaging = firebase.messaging();

// Manejar mensajes en segundo plano
messaging.onBackgroundMessage((payload) => {
  console.log('Mensaje recibido en segundo plano:', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon,
    data: payload.notification.click_action
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Manejar clics en notificaciones
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      if (clients.openWindow && event.notification.data) {
        return clients.openWindow(event.notification.data);
      }
    })
  );
});
