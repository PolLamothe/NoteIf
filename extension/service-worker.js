self.addEventListener('notificationclick', event => {
    event.notification.close();
  
    // Ajoutez ici la logique que vous souhaitez exécuter lorsque la notification est cliquée
    // Par exemple, rediriger vers une page spécifique
    clients.openWindow('https://notes.iut-nantes.univ-nantes.fr/');
  });
  
  self.addEventListener('push', event => {
    const options = {
      icon: './img/icon_128.png',
      body : 'Vous avez une nouvelle note'
    };
    event.waitUntil(
      self.registration.showNotification('Note If {}', options)
    );
  });