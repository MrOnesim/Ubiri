import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';

export const setupPushNotifications = async (userId) => {
  if (Capacitor.getPlatform() === 'web') {
    console.log('Push notifications non supportées sur le web en mode simulation.');
    return;
  }

  // Demander la permission
  let permStatus = await PushNotifications.checkPermissions();

  if (permStatus.receive === 'prompt') {
    permStatus = await PushNotifications.requestPermissions();
  }

  if (permStatus.receive !== 'granted') {
    throw new Error('Permission de notification refusée');
  }

  // Enregistrer pour les notifications
  await PushNotifications.register();

  // Écouter le token d'enregistrement (à envoyer au serveur Node.js)
  PushNotifications.addListener('registration', (token) => {
    console.log('Push registration success, token: ' + token.value);
    // Ici, on enverrait le token à notre serveur Node.js : 
    // fetch('http://localhost:5000/api/users/push-token', { method: 'POST', body: JSON.stringify({ token: token.value, userId }) });
  });

  // Écouter les erreurs
  PushNotifications.addListener('registrationError', (error) => {
    console.error('Error on registration: ' + JSON.stringify(error));
  });

  // Écouter la réception d'une notification (quand l'app est ouverte)
  PushNotifications.addListener('pushNotificationReceived', (notification) => {
    console.log('Push received: ' + JSON.stringify(notification));
  });

  // Écouter le clic sur une notification
  PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
    console.log('Push action performed: ' + JSON.stringify(action));
  });
};
