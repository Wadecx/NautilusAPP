# Nautilus — l'application compagnon du festival

Application installable sur téléphone (iOS, Android et PWA web) pour le festival Nautilus :

- **Programme** sur trois jours, filtrable par catégorie, avec « Mon parcours » (favoris enregistrés sur l'appareil).
- **Plan du campus** façon cartographie du XIXe siècle (SVG, zoom au pincement, repères numérotés).
- **Travaux des élèves** : fiches projets, recherche par titre, élève, filière ou technique.
- **Le Timonier**, l'agent du festival : on lui pose des questions en français (« quoi ce soir ? », « où manger ? », « des projets de photographie ? ») et il répond avec des liens vers le programme, les projets et le plan.
- **Hors connexion** : toutes les données sont embarquées, les polices aussi ; sur le web, un service worker met toutes les pages en cache dès la première visite.

## Lancer le projet

```bash
npm install
npx expo start          # puis i (iOS), a (Android) ou w (web)
npx expo export -p web  # PWA statique dans dist/
```

Avant de livrer : `npx tsc --noEmit` et `npx expo lint`.

## Organisation

| Dossier | Contenu |
| --- | --- |
| `src/app/` | Écrans (Expo Router) : onglets `(tabs)/`, fiches `evenement/[id]` et `projet/[id]` |
| `src/data/festival.ts` | **Toutes les données** : lieux, programme, projets. C'est ici qu'on remplace les contenus d'exemple. |
| `src/agent/` | Le Timonier : `outils.ts` (recherches sur les données) et `timonier.ts` (compréhension des questions) |
| `src/components/` | Composants « papier ancien » : cartouches, filets, plan, lignes de programme |
| `public/` | Manifeste PWA, icônes et service worker (`sw.js`) |

Après une mise à jour du programme, incrémentez `VERSION` dans `public/sw.js` pour que les téléphones rechargent le cache.

## Le Timonier et la semaine d'hybridation

Le Timonier fonctionne aujourd'hui **sans réseau ni modèle de langage** : `timonier.ts` repère dans la question le jour, l'heure, la catégorie, le lieu ou le sujet, puis appelle les outils de `outils.ts`. Quand il ne sait pas (toilettes, parking…), il le dit et renvoie vers l'accueil plutôt que d'inventer.

Les outils sont déjà décrits au format « tool use » (`definitionsOutils`). Pistes pour la semaine d'hybridation :

1. Ajouter un petit serveur (route API Expo Router ou fonction serverless) qui transmet la question à un LLM avec `definitionsOutils`, exécute les outils demandés et renvoie une `Reponse`.
2. Dans l'app, appeler ce serveur quand le réseau est disponible et garder le routeur local en secours hors connexion.
3. Ne jamais placer de clé d'API dans l'application : elle serait lisible par tout le monde.
# NautilusAPP
