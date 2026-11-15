/* Service worker FamilyQuest : affiche les notifications (y compris les notifications push
   reçues quand l'app est fermée) et ouvre l'application au toucher. */
self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });

/* Notification push envoyée par le relais Cloudflare.
   Sur iPhone, chaque push DOIT afficher une notification, sinon iOS coupe l'abonnement :
   on affiche donc toujours, sans condition. Le même "tag" qu'une notification locale
   remplace celle-ci au lieu de l'afficher en double. */
self.addEventListener('push', function (e) {
  var d = {};
  try { d = e.data ? e.data.json() : {}; } catch (x) { d = { body: e.data ? e.data.text() : '' }; }
  var o = { body: d.body || '', icon: 'icon-192.png', badge: 'icon-192.png' };
  if (d.tag) o.tag = d.tag;
  e.waitUntil(self.registration.showNotification(d.title || 'FamilyQuest', o));
});

self.addEventListener('notificationclick', function (e) {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (list) {
      for (var i = 0; i < list.length; i++) {
        if ('focus' in list[i]) return list[i].focus();
      }
      return self.clients.openWindow('./');
    })
  );
});
