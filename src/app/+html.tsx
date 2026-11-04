import { ScrollViewStyleReset, useServerDocumentContext } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

import { evenements, projets } from '@/data/festival';

// Toutes les pages de l'app, mises en cache par le service worker dès la première visite.
const PAGES = [
  '/',
  '/programme',
  '/plan',
  '/travaux',
  '/timonier',
  ...evenements.map((e) => `/evenement/${e.id}`),
  ...projets.map((p) => `/projet/${p.id}`),
  '/manifest.json',
  '/logo192.png',
  '/logo512.png',
];

// Uniquement en production : en développement, un cache agressif masquerait vos modifications.
const registerServiceWorker = `
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('/sw.js').then(function () {
      return navigator.serviceWorker.ready;
    }).then(function (registration) {
      var loaded = performance.getEntriesByType('resource').map(function (e) { return e.name; })
        .filter(function (url) { return url.indexOf(location.origin) === 0; });
      registration.active.postMessage({ type: 'CACHE_URLS', urls: ${JSON.stringify(PAGES)}.concat(loaded) });
    }).catch(function (error) { console.warn('Service worker indisponible', error); });
  });
}`;

// Ce fichier ne s'exécute que lors du rendu statique web (Node.js), pas dans le navigateur.
export default function Root({ children }: PropsWithChildren) {
  const { headNodes, bodyNodes, htmlAttributes, bodyAttributes } = useServerDocumentContext();

  return (
    <html lang="fr" {...htmlAttributes}>
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#F2E8D0" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#17130E" media="(prefers-color-scheme: dark)" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="Nautilus" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/logo192.png" />
        <ScrollViewStyleReset />
        {process.env.NODE_ENV === 'production' ? (
          <script dangerouslySetInnerHTML={{ __html: registerServiceWorker }} />
        ) : null}
        {headNodes}
      </head>
      <body {...bodyAttributes}>
        {children}
        {bodyNodes}
      </body>
    </html>
  );
}
