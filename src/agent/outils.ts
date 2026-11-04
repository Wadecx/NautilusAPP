/**
 * Les « outils » du Timonier : des fonctions pures qui interrogent les données embarquées.
 *
 * Chaque outil est décrit par un nom, une description et un schéma JSON de ses paramètres,
 * au format attendu par les API de « tool use » des grands modèles de langage.
 * Aujourd'hui, c'est le routeur local (`timonier.ts`) qui les appelle, sans réseau.
 * Pendant la semaine d'hybridation, on peut confier ce choix à un LLM côté serveur :
 * il recevra `definitionsOutils` et appellera ces mêmes fonctions.
 */

import {
  categories,
  compareEvenements,
  debutDate,
  evenements,
  festival,
  finDate,
  lieux,
  projets,
  type Categorie,
  type Evenement,
  type JourDate,
  type Lieu,
  type Projet,
} from '@/data/festival';

/** Minuscules, sans accents ni ponctuation : « Où est l'Amphi ? » → « ou est l amphi » */
export function normaliser(texte: string) {
  return texte
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9:&\s]/g, ' ')
    .replace(/\bintelligences? artificielles?\b/g, 'ia')
    .replace(/\s+/g, ' ')
    .trim();
}

const MOTS_VIDES = new Set(
  (
    'les des une est que qui quoi quel quelle quels quelles pour sur dans avec ces cet cette mon mes ' +
    'ton tes son ses nous vous ils elles peut peux faire voir aller trouve trouver lieu lieux heure ' +
    'festival programme quand comment ici bien tout tous toute toutes pas plus moins aussi alors donc ' +
    'chez par entre vers avoir etre sont sera ont eux elle lui leur leurs moi toi suis cherche veux ' +
    'voudrais aimerais dire montre montrer savoir connaitre parle parler propose proposes passe'
  ).split(' ')
);

export function motsCles(texte: string) {
  return normaliser(texte)
    .split(' ')
    .filter((m) => (m.length >= 3 || m === 'ia') && !MOTS_VIDES.has(m));
}

/** Nombre de mots-clés de la question présents dans le texte (préfixe de 5 lettres : « photos » ≈ « photographie »). */
function score(mots: string[], ...champs: (string | undefined)[]) {
  const texte = normaliser(champs.filter(Boolean).join(' '));
  const vocabulaire = texte.split(' ');
  return mots.reduce((total, mot) => {
    if (mot.length < 4) return vocabulaire.includes(mot) ? total + 1 : total;
    if (texte.includes(mot)) return total + (mot.length >= 5 ? 2 : 1);
    const racine = mot.slice(0, 5);
    return mot.length >= 5 && vocabulaire.some((v) => v.startsWith(racine)) ? total + 1 : total;
  }, 0);
}

// —— Outils ——————————————————————————————————————————————————————

export type FiltreEvenements = {
  jours?: JourDate[];
  categories?: Categorie[];
  lieuId?: string;
  /** Minutes depuis minuit : ne garder que les évènements qui débutent dans cet intervalle. */
  debutEntre?: [number, number];
  /** Minutes depuis minuit : ne garder que les évènements en cours à cette heure-là. */
  enCoursA?: number;
};

const minutes = (h: string) => {
  const [hh, mm] = h.split(':').map(Number);
  return hh * 60 + mm;
};

export function chercherEvenements(filtre: FiltreEvenements): Evenement[] {
  return evenements
    .filter((e) => !filtre.jours?.length || filtre.jours.includes(e.jour))
    .filter((e) => !filtre.categories?.length || filtre.categories.includes(e.categorie))
    .filter((e) => !filtre.lieuId || e.lieuId === filtre.lieuId)
    .filter((e) => {
      if (!filtre.debutEntre) return true;
      const d = minutes(e.debut);
      return d >= filtre.debutEntre[0] && d < filtre.debutEntre[1];
    })
    .filter((e) => filtre.enCoursA === undefined || (minutes(e.debut) <= filtre.enCoursA && filtre.enCoursA < minutes(e.fin)))
    .sort(compareEvenements);
}

export function evenementsEnCours(maintenant: Date) {
  return evenements.filter((e) => debutDate(e) <= maintenant && maintenant < finDate(e)).sort(compareEvenements);
}

export function prochainsEvenements(maintenant: Date, nombre = 4) {
  return evenements
    .filter((e) => debutDate(e) > maintenant)
    .sort(compareEvenements)
    .slice(0, nombre);
}

export function chercherProjets(question: string, filieres: string[] = []): Projet[] {
  const mots = motsCles(question);
  return projets
    .filter((p) => !filieres.length || filieres.includes(p.filiere))
    .map((p) => ({ p, s: score(mots, p.titre, p.resume, p.description, p.filiere, p.eleves.join(' '), p.techniques.join(' ')) }))
    .filter(({ s }) => filieres.length || s > 0)
    .sort((a, b) => b.s - a.s)
    .map(({ p }) => p);
}

/** Mots du quotidien qui désignent un lieu sans le nommer. */
const ALIAS_LIEUX: Record<string, string[]> = {
  amphi: ['amphi', 'amphitheatre'],
  studio: ['studio', 'son et image', 'son & image', 'immersive'],
  nef: ['nef', 'galerie'],
  ateliers: ['fablab', 'fabrication', 'laser', 'imprimante'],
  cour: ['cour', 'honneur', 'plein air', 'scene exterieure', 'dehors'],
  bibliotheque: ['bibliotheque', 'salle des cartes', 'curiosites', 'livre'],
  jardin: ['jardin', 'bassin'],
  refectoire: ['refectoire', 'manger', 'mange', 'repas', 'buvette', 'restauration', 'dejeuner', 'diner', 'faim', 'soif', 'boire', 'cafe', 'sandwich'],
  accueil: ['accueil', 'billetterie', 'billet', 'objet trouve', 'objets trouves', 'perdu', 'renseignement', 'information', 'infos'],
};

export function trouverLieu(question: string): Lieu | undefined {
  const q = ` ${normaliser(question)} `;
  const numero = q.match(/\b(?:lieu|repere|batiment|numero|n)\s*(\d)\b/);
  if (numero) return lieux.find((l) => l.numero === Number(numero[1]));
  return lieux.find((l) => ALIAS_LIEUX[l.id]?.some((alias) => q.includes(` ${alias}`)));
}

export type Resultat =
  | { type: 'evenement'; evenement: Evenement; score: number }
  | { type: 'projet'; projet: Projet; score: number }
  | { type: 'lieu'; lieu: Lieu; score: number };

/** Recherche plein texte dans tout le festival, triée par pertinence. */
export function rechercheLibre(question: string): Resultat[] {
  const mots = motsCles(question);
  if (!mots.length) return [];
  const resultats: Resultat[] = [
    ...evenements.map((e) => ({
      type: 'evenement' as const,
      evenement: e,
      score: score(mots, e.titre, e.titre, e.description, e.intervenants, e.categorie),
    })),
    ...projets.map((p) => ({
      type: 'projet' as const,
      projet: p,
      score: score(mots, p.titre, p.titre, p.resume, p.filiere, p.eleves.join(' '), p.techniques.join(' ')),
    })),
    ...lieux.map((l) => ({ type: 'lieu' as const, lieu: l, score: score(mots, l.nom, l.nom, l.description) })),
  ];
  return resultats.filter((r) => r.score > 0).sort((a, b) => b.score - a.score);
}

// —— Description des outils pour un LLM ————————————————————————————

export const definitionsOutils = [
  {
    name: 'chercher_evenements',
    description: 'Liste les évènements du programme selon le jour, la catégorie, le lieu ou l’heure.',
    input_schema: {
      type: 'object',
      properties: {
        jours: { type: 'array', items: { type: 'string', enum: festival.jours.map((j) => j.date) } },
        categories: { type: 'array', items: { type: 'string', enum: categories } },
        lieuId: { type: 'string', enum: lieux.map((l) => l.id) },
        enCoursA: { type: 'integer', description: 'Heure en minutes depuis minuit' },
      },
    },
  },
  {
    name: 'chercher_projets',
    description: 'Cherche parmi les travaux des élèves (titre, filière, technique, élèves).',
    input_schema: {
      type: 'object',
      properties: { question: { type: 'string' }, filieres: { type: 'array', items: { type: 'string' } } },
      required: ['question'],
    },
  },
  {
    name: 'trouver_lieu',
    description: 'Retrouve un lieu du campus à partir de son nom ou de ce qu’on y fait.',
    input_schema: { type: 'object', properties: { question: { type: 'string' } }, required: ['question'] },
  },
  {
    name: 'recherche_libre',
    description: 'Recherche plein texte dans tout le festival.',
    input_schema: { type: 'object', properties: { question: { type: 'string' } }, required: ['question'] },
  },
] as const;
