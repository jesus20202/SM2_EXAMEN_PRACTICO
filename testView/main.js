// Tu clave VAPID pública (reemplaza 'TU_VAPID_KEY' con tu clave real)
const vapidKey = 'BIrX_nIPgzq-PjAVpAsUG9dvpBSrkOHXglfuapScaUv4eWq3sBIkMWKICMHmctpswuKDrE4TcRPrD9Zls4T0x8M';

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBRopajK9bEflimlxQCq2h6nJe9t0vcRcY",
  authDomain: "messagecloud-8f0ff.firebaseapp.com",
  projectId: "messagecloud-8f0ff",
  storageBucket: "messagecloud-8f0ff.appspot.com",
  messagingSenderId: "716480432186",
  appId: "1:716480432186:web:860c66139cd56864c34d03",
  measurementId: "G-QE5NMK42P7"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Inicializar Firebase Messaging
const messaging = firebase.messaging();

// Variable para almacenar el registro del Service Worker
let swRegistration = null;

// Registrar el Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('firebase-messaging-sw.js')
    .then((registration) => {
      console.log('Service Worker registrado con scope:', registration.scope);
      swRegistration = registration;
      // No es necesario usar messaging.useServiceWorker()
    })
    .catch((err) => {
      console.error('Error al registrar el Service Worker:', err);
    });
} else {
  console.error('Service Worker no es compatible con este navegador.');
}

// Manejar mensajes en primer plano
messaging.onMessage((payload) => {
  console.log('Mensaje recibido en primer plano:', payload);
  displayNotification(payload.notification);
});

// Mostrar notificaciones en primer plano
function displayNotification(notification) {
  if (Notification.permission === 'granted') {
    navigator.serviceWorker.getRegistration().then(registration => {
      if (registration) {
        registration.showNotification(notification.title, {
          body: notification.body,
          icon: notification.icon,
          data: notification.click_action
        });
      }
    });
  }
}

// Evento para el botón de solicitar permiso de notificaciones
document.getElementById('requestPermissionBtn').addEventListener('click', () => {
  requestNotificationPermission();
});

// Solicitar permiso de notificaciones y obtener el token
function requestNotificationPermission() {
  if (!swRegistration) {
    console.error('El Service Worker no está registrado.');
    return;
  }

  Notification.requestPermission()
    .then((permission) => {
      if (permission === 'granted') {
        console.log('Permiso de notificación concedido.');
        getTokenAndStore();
      } else {
        console.warn('Permiso de notificación denegado.');
        alert('Debes permitir las notificaciones para continuar.');
      }
    })
    .catch((err) => {
      console.error('Error al solicitar permiso de notificación:', err);
    });
}

// Obtener el token y almacenarlo en un campo oculto
function getTokenAndStore() {
  messaging.getToken({ vapidKey: vapidKey, serviceWorkerRegistration: swRegistration })
    .then((currentToken) => {
      if (currentToken) {
        console.log('Token FCM obtenido:', currentToken);
        // Almacenar el token en el campo oculto
        document.getElementById('deviceToken').value = currentToken;
        alert('Token obtenido correctamente. Ahora puedes registrarte.');
      } else {
        console.warn('No se pudo obtener el token FCM.');
      }
    })
    .catch((err) => {
      console.error('Error al obtener el token FCM:', err);
    });
}




document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("tokenMessage");
  const welcomeModal = document.getElementById("welcomeModal");
  const chatContainer = document.getElementById("chatContainer");

  if (!token) {
    // Mostrar modal si no hay token guardado
    welcomeModal.style.display = "flex";
  } else {
    // Mostrar chat si el token ya está guardado
    welcomeModal.style.display = "none";
    chatContainer.style.display = "flex";
    connectSocket(token); // Conectar con el servidor de Socket.IO usando el token
    loadContacts(); // Cargar contactos después de conectarse
  }
});

async function registerUser() {
  const externalId = document.getElementById("externalId").value;
  const name = document.getElementById("name").value;
  const deviceToken = document.getElementById("deviceToken").value;

  if (externalId && name && deviceToken) {
    // Enviar solicitud de registro al servidor
    const requestBody = {
      token: deviceToken,
      externalUserId: externalId,
      userName: name
    };

    try {
      const response = await fetch('http://localhost:3000/api/v1/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      const result = await response.json();

      if (response.ok && result.status === "success") {
        // Si la solicitud fue exitosa, guardar el tokenMessage en el almacenamiento local
        localStorage.setItem("tokenMessage", result.tokenMessage);
        localStorage.setItem("userId", result.data.user._id);

        // Ocultar el modal y mostrar el chat
        document.getElementById("welcomeModal").style.display = "none";
        document.getElementById("chatContainer").style.display = "flex";

        // Conectar con el servidor de Socket.IO
        connectSocket(result.tokenMessage);
        loadContacts(); // Cargar contactos después de registrarse
      } else {
        alert(`Error al registrarse: ${result.message}`);
      }
    } catch (error) {
      console.error("Error al conectarse al servidor:", error);
      alert("Error al conectarse al servidor. Intente nuevamente.");
    }
  } else {
    alert("Por favor, completa todos los campos y permite las notificaciones para obtener el token.");
  }
}


