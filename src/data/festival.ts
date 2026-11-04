/**
 * Toutes les données du festival sont embarquées dans l'application :
 * elle fonctionne entièrement hors connexion.
 * Remplacez ces contenus d'exemple par la vraie programmation.
 */

export const festival = {
  nom: 'Nautilus',
  sousTitre: 'Festival des arts, des sciences & des écritures numériques',
  edition: 'IIIe édition',
  lieu: "Campus de l'École",
  jours: [
    { date: '2026-11-19', label: 'Jeudi 19', court: 'Jeu. 19' },
    { date: '2026-11-20', label: 'Vendredi 20', court: 'Ven. 20' },
    { date: '2026-11-21', label: 'Samedi 21', court: 'Sam. 21' },
  ],
} as const;

export type JourDate = (typeof festival.jours)[number]['date'];

export type TypeLieu = 'batiment' | 'amphi' | 'cour' | 'jardin';

export type Lieu = {
  id: string;
  numero: number;
  nom: string;
  description: string;
  type: TypeLieu;
  /** Emprise sur le plan, en unités du viewBox 1000 × 1300. */
  x: number;
  y: number;
  w: number;
  h: number;
};

export const lieux: Lieu[] = [
  {
    id: 'amphi',
    numero: 1,
    nom: 'Grand Amphithéâtre',
    description: 'Conférences, ouverture et clôture du festival. 320 places assises.',
    type: 'amphi',
    x: 380,
    y: 200,
    w: 240,
    h: 170,
  },
  {
    id: 'studio',
    numero: 2,
    nom: 'Studio Son & Image',
    description: 'Projections, écoutes immersives et installations sonores.',
    type: 'batiment',
    x: 700,
    y: 200,
    w: 170,
    h: 130,
  },
  {
    id: 'nef',
    numero: 3,
    nom: 'La Nef',
    description: "Galerie principale : l'exposition des travaux d'élèves.",
    type: 'batiment',
    x: 140,
    y: 470,
    w: 260,
    h: 170,
  },
  {
    id: 'ateliers',
    numero: 4,
    nom: 'Ateliers de fabrication',
    description: 'Fablab, imprimantes, découpe laser : ateliers participatifs.',
    type: 'batiment',
    x: 600,
    y: 470,
    w: 250,
    h: 170,
  },
  {
    id: 'cour',
    numero: 5,
    nom: "Cour d'honneur",
    description: 'Scène extérieure, concerts et performances en plein air.',
    type: 'cour',
    x: 400,
    y: 700,
    w: 200,
    h: 170,
  },
  {
    id: 'bibliotheque',
    numero: 6,
    nom: 'Bibliothèque — Salle des Cartes',
    description: 'Lectures, rencontres et cabinet de curiosités numériques.',
    type: 'batiment',
    x: 120,
    y: 780,
    w: 200,
    h: 160,
  },
  {
    id: 'jardin',
    numero: 7,
    nom: 'Le Jardin & le Bassin',
    description: 'Scène acoustique au bord du bassin, siestes sonores.',
    type: 'jardin',
    x: 640,
    y: 820,
    w: 260,
    h: 240,
  },
  {
    id: 'refectoire',
    numero: 8,
    nom: 'Le Réfectoire',
    description: 'Restauration et buvette toute la journée.',
    type: 'batiment',
    x: 150,
    y: 1030,
    w: 200,
    h: 120,
  },
  {
    id: 'accueil',
    numero: 9,
    nom: "Pavillon d'accueil",
    description: 'Informations, billetterie, objets trouvés. Point de départ des visites.',
    type: 'batiment',
    x: 430,
    y: 1110,
    w: 140,
    h: 90,
  },
];

export type Categorie =
  | 'Conférence'
  | 'Atelier'
  | 'Exposition'
  | 'Concert'
  | 'Projection'
  | 'Performance';

export const categories: Categorie[] = [
  'Conférence',
  'Atelier',
  'Exposition',
  'Concert',
  'Projection',
  'Performance',
];

export type Evenement = {
  id: string;
  titre: string;
  jour: JourDate;
  debut: string;
  fin: string;
  lieuId: string;
  categorie: Categorie;
  intervenants?: string;
  description: string;
  phare?: boolean;
  projetIds?: string[];
};

export const evenements: Evenement[] = [
  // Jeudi 19
  {
    id: 'ouverture',
    titre: 'Ouverture du festival',
    jour: '2026-11-19',
    debut: '10:00',
    fin: '11:00',
    lieuId: 'amphi',
    categorie: 'Conférence',
    intervenants: "La direction de l'École & le collectif Nautilus",
    description:
      "Lever de rideau sur trois jours d'explorations : présentation du programme, des équipes et du thème de l'année, « Cartographies imaginaires ».",
    phare: true,
  },
  {
    id: 'vernissage',
    titre: 'Vernissage de l’exposition des élèves',
    jour: '2026-11-19',
    debut: '11:30',
    fin: '13:00',
    lieuId: 'nef',
    categorie: 'Exposition',
    description:
      'Découverte des travaux de fin d’année en présence des élèves. Médiations en continu dans la galerie.',
    phare: true,
    projetIds: ['atlas-sonore', 'herbier', 'phares', 'typographie-maree'],
  },
  {
    id: 'atelier-gravure',
    titre: 'Gravure laser : votre carte au trésor',
    jour: '2026-11-19',
    debut: '14:00',
    fin: '16:00',
    lieuId: 'ateliers',
    categorie: 'Atelier',
    intervenants: 'Équipe du fablab',
    description:
      'Dessinez une carte imaginaire, puis gravez-la sur bois. Repartez avec votre plaque. Sur inscription au Pavillon d’accueil.',
  },
  {
    id: 'conf-cartes',
    titre: 'Les cartes qui mentaient',
    jour: '2026-11-19',
    debut: '14:30',
    fin: '15:30',
    lieuId: 'bibliotheque',
    categorie: 'Conférence',
    intervenants: 'Une historienne de la cartographie',
    description:
      'Îles fantômes, montagnes inventées, rivières déplacées : petite histoire des erreurs (volontaires ou non) des cartographes du XIXe siècle.',
  },
  {
    id: 'projection-courts',
    titre: 'Courts métrages d’animation',
    jour: '2026-11-19',
    debut: '17:00',
    fin: '18:15',
    lieuId: 'studio',
    categorie: 'Projection',
    description: 'Sélection des films d’animation 2D et 3D réalisés par les élèves cette année.',
    projetIds: ['abysses'],
  },
  {
    id: 'concert-jeudi',
    titre: 'Concert d’ouverture — Les Scaphandriers',
    jour: '2026-11-19',
    debut: '20:00',
    fin: '22:00',
    lieuId: 'cour',
    categorie: 'Concert',
    description: 'Électro-acoustique et machines analogiques dans la cour illuminée.',
    phare: true,
  },
  // Vendredi 20
  {
    id: 'conf-ia',
    titre: 'Créer avec des agents IA',
    jour: '2026-11-20',
    debut: '10:00',
    fin: '11:30',
    lieuId: 'amphi',
    categorie: 'Conférence',
    intervenants: 'Élèves de la semaine d’hybridation',
    description:
      'Retour d’expérience de la semaine d’hybridation : comment des agents IA ont aidé à concevoir, coder et tester l’application du festival.',
    phare: true,
    projetIds: ['appli-nautilus'],
  },
  {
    id: 'atelier-typo',
    titre: 'Atelier de typographie au plomb',
    jour: '2026-11-20',
    debut: '10:30',
    fin: '12:30',
    lieuId: 'ateliers',
    categorie: 'Atelier',
    description:
      'Composition manuelle et impression d’affiches sur presse à épreuves. Tous niveaux.',
    projetIds: ['typographie-maree'],
  },
  {
    id: 'visite-guidee',
    titre: 'Visite guidée de l’exposition',
    jour: '2026-11-20',
    debut: '14:00',
    fin: '15:00',
    lieuId: 'nef',
    categorie: 'Exposition',
    description: 'Les élèves vous font traverser la galerie et racontent leurs projets.',
  },
  {
    id: 'sieste-sonore',
    titre: 'Sieste sonore au bord du bassin',
    jour: '2026-11-20',
    debut: '15:00',
    fin: '16:00',
    lieuId: 'jardin',
    categorie: 'Performance',
    description: 'Allongez-vous, fermez les yeux : une composition spatialisée pour 12 haut-parleurs.',
    projetIds: ['atlas-sonore'],
  },
  {
    id: 'lecture',
    titre: 'Lectures : journaux de bord',
    jour: '2026-11-20',
    debut: '16:30',
    fin: '17:30',
    lieuId: 'bibliotheque',
    categorie: 'Performance',
    description: 'Textes d’explorateurs réels et imaginaires, lus à voix haute parmi les cartes anciennes.',
  },
  {
    id: 'mapping',
    titre: 'Vidéo-mapping sur la façade',
    jour: '2026-11-20',
    debut: '19:30',
    fin: '20:30',
    lieuId: 'cour',
    categorie: 'Projection',
    description: 'La façade de l’amphithéâtre devient une mer mouvante. Création collective des élèves 3D.',
    phare: true,
    projetIds: ['abysses'],
  },
  {
    id: 'concert-vendredi',
    titre: 'Bal des cartographes',
    jour: '2026-11-20',
    debut: '21:00',
    fin: '23:30',
    lieuId: 'cour',
    categorie: 'Concert',
    description: 'DJ sets des élèves de la filière Son & musique.',
  },
  // Samedi 21
  {
    id: 'atelier-enfants',
    titre: 'Petits explorateurs (6–12 ans)',
    jour: '2026-11-21',
    debut: '10:00',
    fin: '11:30',
    lieuId: 'ateliers',
    categorie: 'Atelier',
    description: 'Fabrication de boussoles et de cartes à gratter. Accompagnement d’un adulte requis.',
  },
  {
    id: 'table-ronde',
    titre: 'Table ronde : les métiers de demain',
    jour: '2026-11-21',
    debut: '11:00',
    fin: '12:30',
    lieuId: 'amphi',
    categorie: 'Conférence',
    intervenants: 'Anciens élèves et professionnels invités',
    description: 'Design, développement, image, son : parcours et conseils pour les futurs élèves.',
  },
  {
    id: 'demo-jeux',
    titre: 'Salle d’arcade des élèves',
    jour: '2026-11-21',
    debut: '14:00',
    fin: '18:00',
    lieuId: 'studio',
    categorie: 'Exposition',
    description: 'Jouez aux jeux vidéo conçus par les élèves, en accès libre.',
    projetIds: ['phares'],
  },
  {
    id: 'concert-acoustique',
    titre: 'Concert acoustique au jardin',
    jour: '2026-11-21',
    debut: '16:00',
    fin: '17:00',
    lieuId: 'jardin',
    categorie: 'Concert',
    description: 'Quatuor à cordes et chants marins revisités.',
  },
  {
    id: 'cloture',
    titre: 'Remise des prix & clôture',
    jour: '2026-11-21',
    debut: '18:30',
    fin: '20:00',
    lieuId: 'amphi',
    categorie: 'Conférence',
    description: 'Prix du public, prix du jury et mot de la fin. Votez pour votre projet préféré à l’accueil !',
    phare: true,
  },
];

export type Projet = {
  id: string;
  titre: string;
  eleves: string[];
  filiere: string;
  annee: string;
  resume: string;
  description: string;
  lieuId: string;
  techniques: string[];
};

export const projets: Projet[] = [
  {
    id: 'atlas-sonore',
    titre: 'Atlas sonore du campus',
    eleves: ['Élève A', 'Élève B'],
    filiere: 'Son & musique',
    annee: '3e année',
    resume: 'Une carte que l’on écoute : chaque lieu du campus enregistré et recomposé.',
    description:
      'Pendant six mois, le binôme a enregistré les ambiances du campus à toutes les heures. Le résultat : une installation où l’on se déplace sur une grande carte au sol pour entendre les lieux changer.',
    lieuId: 'nef',
    techniques: ['Prise de son', 'Spatialisation', 'Max/MSP'],
  },
  {
    id: 'herbier',
    titre: 'L’Herbier numérique',
    eleves: ['Élève C'],
    filiere: 'Design graphique',
    annee: '2e année',
    resume: 'Planches botaniques génératives inspirées des gravures du XIXe siècle.',
    description:
      'Un programme génère des planches d’herbier imaginaires, imprimées ensuite en taille-douce. Chaque visiteur peut faire naître sa propre plante.',
    lieuId: 'nef',
    techniques: ['Code génératif', 'Gravure', 'Risographie'],
  },
  {
    id: 'phares',
    titre: 'Gardiens de phare',
    eleves: ['Élève D', 'Élève E', 'Élève F'],
    filiere: 'Jeu vidéo',
    annee: '3e année',
    resume: 'Jeu narratif coopératif : maintenir la lumière d’un phare pendant la tempête.',
    description:
      'Deux joueurs, une manette chacun, une tempête qui ne finit pas. Un jeu sur la communication et la fatigue, entièrement dessiné à la plume.',
    lieuId: 'studio',
    techniques: ['Godot', 'Illustration', 'Game design'],
  },
  {
    id: 'typographie-maree',
    titre: 'Marées — un caractère typographique',
    eleves: ['Élève G'],
    filiere: 'Design graphique',
    annee: '4e année',
    resume: 'Une famille de caractères dont la graisse varie avec les coefficients de marée.',
    description:
      'Fonte variable dont l’axe de graisse est piloté par les données marégraphiques réelles. Présentée sous forme d’affiches et d’un spécimen imprimé.',
    lieuId: 'nef',
    techniques: ['Type design', 'Fonte variable', 'Data'],
  },
  {
    id: 'abysses',
    titre: 'Abysses',
    eleves: ['Élève H', 'Élève I'],
    filiere: 'Animation 3D',
    annee: '4e année',
    resume: 'Court métrage en 3D sur une créature des grands fonds.',
    description:
      'Un nautile remonte vers la surface pour la première fois. Rendu inspiré des planches naturalistes, projeté en mapping sur la façade le vendredi soir.',
    lieuId: 'studio',
    techniques: ['Blender', 'Compositing', 'Mapping'],
  },
  {
    id: 'appli-nautilus',
    titre: 'L’application Nautilus',
    eleves: ['Équipe de la semaine d’hybridation'],
    filiere: 'Développement',
    annee: 'Toutes années',
    resume: 'L’application compagnon que vous tenez entre vos mains.',
    description:
      'Conçue pendant la semaine d’hybridation avec l’aide d’agents IA : programme, plan du campus façon carte ancienne, présentation des travaux, fonctionnement hors connexion.',
    lieuId: 'ateliers',
    techniques: ['React Native', 'Expo', 'Agents IA'],
  },
  {
    id: 'cabinet',
    titre: 'Cabinet de curiosités',
    eleves: ['Élève J', 'Élève K'],
    filiere: 'Design d’espace',
    annee: '3e année',
    resume: 'Une scénographie d’objets trouvés sur le campus, classés comme des spécimens.',
    description:
      'Clés, gommes, tickets, feuilles mortes : un inventaire méticuleux du quotidien de l’École, présenté dans des vitrines fabriquées à l’atelier.',
    lieuId: 'bibliotheque',
    techniques: ['Scénographie', 'Menuiserie', 'Éclairage'],
  },
  {
    id: 'portraits',
    titre: 'Portraits au collodion',
    eleves: ['Élève L'],
    filiere: 'Photographie',
    annee: '2e année',
    resume: 'Les élèves et le personnel photographiés selon un procédé de 1851.',
    description:
      'Plaques de verre au collodion humide, tirages contact, et un studio éphémère où l’on peut se faire photographier pendant le festival.',
    lieuId: 'nef',
    techniques: ['Collodion humide', 'Chambre photographique'],
  },
];

// —— Utilitaires ————————————————————————————————————————————————

export const lieuParId = (id: string) => lieux.find((l) => l.id === id);
export const evenementParId = (id: string) => evenements.find((e) => e.id === id);
export const projetParId = (id: string) => projets.find((p) => p.id === id);

export const evenementsDuLieu = (lieuId: string) =>
  evenements.filter((e) => e.lieuId === lieuId).sort(compareEvenements);

export const projetsDuLieu = (lieuId: string) => projets.filter((p) => p.lieuId === lieuId);

export const evenementsDuProjet = (projetId: string) =>
  evenements.filter((e) => e.projetIds?.includes(projetId)).sort(compareEvenements);

export function compareEvenements(a: Evenement, b: Evenement) {
  return `${a.jour}T${a.debut}`.localeCompare(`${b.jour}T${b.debut}`);
}

export function jourLabel(date: string) {
  return festival.jours.find((j) => j.date === date)?.label ?? date;
}

/** « 14:30 » → « 14h30 » */
export function heure(h: string) {
  return h.replace(':', 'h');
}

export function debutDate(e: Evenement) {
  return new Date(`${e.jour}T${e.debut}:00`);
}

export function finDate(e: Evenement) {
  return new Date(`${e.jour}T${e.fin}:00`);
}

export const filieres = Array.from(new Set(projets.map((p) => p.filiere))).sort();
