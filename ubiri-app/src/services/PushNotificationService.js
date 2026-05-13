import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';

export const setupPushNotifications = async (userId) => {
  if (Capacitor.getPlatform() === 'web') {
    console.log('Push notifications non supportées sur le web en mode simulation.');
    return;
  }

  try {
    // 1. Nettoyage des anciens écouteurs pour éviter les doublons lors des re-connexions
    await PushNotifications.removeAllListeners();

    // 2. Ajout des écouteurs AVANT l'enregistrement pour éviter les race conditions
    
    // Token d'enregistrement (à envoyer au serveur)
    await PushNotifications.addListener('registration', async (token) => {
      console.log('Push registration success, token: ' + token.value);
      
      // Envoi du token au serveur Node.js pour association avec l'utilisateur
      try {
        // Note: L'URL devrait idéalement être configurée via une variable d'environnement
        await fetch('http://localhost:5000/api/users/push-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: token.value, userId })
        });
        console.log('Token push synchronisé avec succès pour l\'utilisateur:', userId);
      } catch (err) {
        console.error('Échec de la synchronisation du token sur le serveur:', err);
      }
    });

    // Erreurs d'enregistrement
    await PushNotifications.addListener('registrationError', (error) => {
      console.error('Error on registration: ' + JSON.stringify(error));
    });

    // Réception d'une notification (App au premier plan)
    await PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('Push received: ' + JSON.stringify(notification));
    });

    // Action sur une notification (Clic)
    await PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
      console.log('Push action performed: ' + JSON.stringify(action));
    });

    // 3. Gestion des permissions
    let permStatus = await PushNotifications.checkPermissions();

    if (permStatus.receive === 'prompt') {
      permStatus = await PushNotifications.requestPermissions();
    }

    if (permStatus.receive !== 'granted') {
      console.warn('Permission de notification refusée par l\'utilisateur');
      return;
    }

    // 4. Enregistrement final
    await PushNotifications.register();

  } catch (error) {
    console.error('Erreur lors de la configuration des notifications push:', error);
  }
};
