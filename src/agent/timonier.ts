/**
 * Le Timonier : l'agent conversationnel du festival.
 *
 * Il comprend des questions en français courant (« quoi ce soir ? », « où manger ? »,
 * « des projets de photo ? ») et répond à partir des données embarquées, sans réseau.
 * Le raisonnement est un routeur d'intentions local : il repère jours, heures, catégories,
 * lieux et sujets, puis appelle les outils de `outils.ts`.
 */

import {
  chercherEvenements,
  chercherProjets,
  evenementsEnCours,
  motsCles,
  normaliser,
  prochainsEvenements,
  rechercheLibre,
  trouverLieu,
  type FiltreEvenements,
} from '@/agent/outils';
import {
  categories,
  compareEvenements,
  evenements,
  festival,
  filieres,
  heure,
  jourLabel,
  lieuParId,
  projets,
  type Categorie,
  type Evenement,
  type JourDate,
  type Lieu,
  type Projet,
} from '@/data/festival';

export type Carte =
  | { type: 'evenement'; evenement: Evenement }
  | { type: 'projet'; projet: Projet }
  | { type: 'lieu'; lieu: Lieu };

export type Reponse = {
  texte: string;
  cartes: Carte[];
  suggestions: string[];
};

export type Contexte = {
  maintenant: Date;
  favoris: Set<string>;
};

export const SUGGESTIONS_ACCUEIL = [
  'Qu’est-ce qui se passe maintenant ?',
  'Quels concerts samedi ?',
  'Où manger ?',
  'Des projets de photographie ?',
];

const MAX_CARTES = 6;

const MOTS_CATEGORIES: Record<Categorie, string[]> = {
  Conférence: ['conference', 'conferences', 'conf', 'table ronde', 'rencontre', 'rencontres', 'debat'],
  Atelier: ['atelier', 'workshop', 'participatif', 'enfant', 'enfants', 'famille'],
  Exposition: ['expo', 'exposition', 'expositions', 'jeux video'],
  Concert: ['concert', 'concerts', 'musique', 'dj', 'danser', 'son live'],
  Projection: ['projection', 'projections', 'film', 'films', 'cinema', 'court metrage', 'courts metrages'],
  Performance: ['performance', 'performances', 'spectacle', 'poesie'],
};

const MOTS_CATEGORIES_TOUS = new Set(Object.values(MOTS_CATEGORIES).flat());

const contient = (q: string, motifs: string[]) => motifs.some((m) => new RegExp(`\\b${m}\\b`).test(q));

const dateIso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const estJourFestival = (date: string): date is JourDate => festival.jours.some((j) => j.date === date);

function heureEnMinutes(q: string): { minutes: number; reste: string } | undefined {
  const m = q.match(/\b(\d{1,2})\s*(?:h|:|heures?)\s*(\d{2})?\b/);
  if (!m) return undefined;
  const h = Number(m[1]);
  if (h > 23) return undefined;
  return { minutes: h * 60 + Number(m[2] ?? 0), reste: q.replace(m[0], ' ') };
}

function lireJours(q: string, maintenant: Date): { jours: JourDate[]; horsFestival?: string } {
  const jours: JourDate[] = [];
  const noms = ['jeudi', 'vendredi', 'samedi'];
  festival.jours.forEach((j, i) => {
    const numero = j.date.slice(-2);
    if (new RegExp(`\\b(${noms[i]}|${numero})\\b`).test(q)) jours.push(j.date);
  });

  const relatif = /\baujourd hui\b|\bce soir\b|\bcet apres midi\b|\bce matin\b/.test(q)
    ? 0
    : /\bdemain\b/.test(q)
      ? 1
      : undefined;
  if (relatif !== undefined) {
    const d = new Date(maintenant);
    d.setDate(d.getDate() + relatif);
    const iso = dateIso(d);
    if (estJourFestival(iso)) jours.push(iso);
    else return { jours, horsFestival: relatif === 0 ? 'aujourd’hui' : 'demain' };
  }
  return { jours };
}

function lireMoment(q: string): { intervalle: [number, number]; nom: string } | undefined {
  if (/\bsoir|soiree|nuit\b/.test(q)) return { intervalle: [18 * 60, 24 * 60], nom: 'en soirée' };
  if (/\bapres midi\b|\baprem\b/.test(q)) return { intervalle: [12 * 60, 18 * 60], nom: 'l’après-midi' };
  if (/\bmatin|matinee\b/.test(q)) return { intervalle: [0, 12 * 60], nom: 'le matin' };
  if (/\bmidi\b/.test(q)) return { intervalle: [11 * 60 + 30, 14 * 60], nom: 'vers midi' };
  return undefined;
}

const versCartes = (liste: Evenement[]): Carte[] =>
  liste.slice(0, MAX_CARTES).map((evenement) => ({ type: 'evenement', evenement }));

const enHeure = (minutes: number) => heure(`${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, '0')}`);

const pluriel = (n: number, mot: string) => `${n} ${mot}${n > 1 ? 's' : ''}`;

function plusQue(total: number) {
  return total > MAX_CARTES ? ` Voici les ${MAX_CARTES} premiers ; le reste est dans l’onglet Programme.` : '';
}

function decrireEvenement(e: Evenement) {
  const lieu = lieuParId(e.lieuId);
  return `« ${e.titre} » : ${jourLabel(e.jour).toLowerCase()} de ${heure(e.debut)} à ${heure(e.fin)}${lieu ? `, ${lieu.nom} (repère ${lieu.numero})` : ''}.`;
}

// —— Point d'entrée ——————————————————————————————————————————————

export function repondre(question: string, { maintenant, favoris }: Contexte): Reponse {
  const q = normaliser(question);
  const debutFestival = new Date(`${festival.jours[0].date}T00:00:00`);
  const avantFestival = maintenant < debutFestival;

  if (!q) return aide();

  // Salutations et demandes d'aide
  if (/^(bonjour|bonsoir|salut|coucou|hello|ahoy|hey)\b/.test(q) && q.split(' ').length <= 3) {
    return {
      texte: 'Bien le bonjour, moussaillon ! Je tiens la barre du festival : demandez-moi le programme, un lieu ou les travaux des élèves.',
      cartes: [],
      suggestions: SUGGESTIONS_ACCUEIL,
    };
  }
  if (/\b(aide|help|que sais tu|tu sais faire|qui es tu|comment ca marche)\b/.test(q)) return aide();
  if (/\bmerci\b/.test(q)) {
    return { texte: 'À votre service. Bon vent sur le campus !', cartes: [], suggestions: SUGGESTIONS_ACCUEIL };
  }

  // Questions pratiques absentes du livre de bord : ne rien inventer.
  if (/\b(toilettes?|wc|sanitaires?|parking|garer|vestiaires?|secours|pharmacie|wifi|prise|recharger|accessibilite|pmr|ascenseur)\b/.test(q)) {
    const accueil = lieuParId('accueil');
    return {
      texte: `Mon livre de bord ne dit rien là-dessus, et je préfère ne pas vous égarer. ${accueil ? `Le ${accueil.nom} (repère ${accueil.numero}) saura vous renseigner.` : 'L’équipe d’accueil saura vous renseigner.'}`,
      cartes: accueil ? [{ type: 'lieu', lieu: accueil }] : [],
      suggestions: ['Où manger ?', 'Qu’est-ce qui se passe maintenant ?'],
    };
  }

  // Mon parcours
  if (/\b(parcours|favori|favoris|etoile|etoiles|mes evenements)\b/.test(q)) {
    const liste = evenements.filter((e) => favoris.has(e.id)).sort(compareEvenements);
    if (!liste.length) {
      return {
        texte: 'Votre parcours est encore vierge. Touchez ☆ à côté d’un évènement pour l’y consigner.',
        cartes: versCartes(evenements.filter((e) => e.phare).sort(compareEvenements)),
        suggestions: ['Les temps forts ?', 'Quoi demain ?'],
      };
    }
    const prochains = liste.filter((e) => new Date(`${e.jour}T${e.fin}:00`) > maintenant);
    return {
      texte: `Votre parcours compte ${pluriel(liste.length, 'escale')}${prochains.length < liste.length ? `, dont ${prochains.length} encore à venir` : ''}.`,
      cartes: versCartes(prochains.length ? prochains : liste),
      suggestions: ['Qu’est-ce qui se passe maintenant ?', 'Où est la Nef ?'],
    };
  }

  const lieu = trouverLieu(q);
  const demandeOu = /\b(ou|trouver|aller|chemin|plan|situe|se trouve)\b/.test(q);
  const veutProjets = /\b(projet|projets|travaux|travail|eleve|eleves|oeuvre|oeuvres|creation|creations|filiere|filieres)\b/.test(q);

  // « Où est… ? » sur un lieu
  if (lieu && demandeOu && !veutProjets) {
    const aVenir = chercherEvenements({ lieuId: lieu.id }).filter((e) => new Date(`${e.jour}T${e.fin}:00`) > maintenant);
    return {
      texte: `${lieu.nom}, repère n° ${lieu.numero} sur le plan. ${lieu.description}`,
      cartes: [{ type: 'lieu', lieu }, ...versCartes(aVenir).slice(0, 3)],
      suggestions: [`Que se passe-t-il au repère ${lieu.numero} ?`, 'Où manger ?'],
    };
  }

  // Maintenant / ensuite
  const demandeMaintenant = /\b(maintenant|en ce moment|actuellement|en cours|tout de suite)\b/.test(q);
  const demandeEnsuite = /\b(ensuite|prochain|prochains|prochaine|prochaines|apres|bientot|suivant|suite|a venir)\b/.test(q);
  if (demandeMaintenant || (demandeEnsuite && !/\bapres midi\b/.test(q))) {
    const enCours = evenementsEnCours(maintenant);
    const prochains = prochainsEvenements(maintenant);
    if (avantFestival) {
      const jours = Math.ceil((debutFestival.getTime() - maintenant.getTime()) / 86_400_000);
      return {
        texte: `Le festival n’a pas encore levé l’ancre : ouverture ${jours <= 1 ? 'demain' : `dans ${jours} jours`}, le ${jourLabel(festival.jours[0].date).toLowerCase()} novembre. Voici les premières escales.`,
        cartes: versCartes(prochains),
        suggestions: ['Les temps forts ?', 'Quels ateliers jeudi ?'],
      };
    }
    if (demandeMaintenant && enCours.length) {
      return {
        texte: `En ce moment, ${pluriel(enCours.length, 'évènement')} sur le campus.`,
        cartes: versCartes(enCours),
        suggestions: ['Et ensuite ?', 'Où manger ?'],
      };
    }
    if (!prochains.length) {
      return {
        texte: 'Rideau ! Le programme est terminé, mais les travaux des élèves restent à découvrir.',
        cartes: [],
        suggestions: ['Montre-moi les travaux', 'Des projets de photographie ?'],
      };
    }
    return {
      texte: demandeMaintenant ? 'Entracte : rien en cours à cet instant. Voici la suite.' : 'Voici les prochaines escales.',
      cartes: versCartes(prochains),
      suggestions: ['Quoi ce soir ?', 'Mon parcours'],
    };
  }

  // Temps forts
  if (/\b(temps forts?|incontournable|incontournables|a ne pas manquer|phare|phares|meilleur|meilleurs|conseille|conseilles|recommande)\b/.test(q) && !veutProjets) {
    return {
      texte: 'Les escales à ne pas manquer, marquées ✦ dans le programme :',
      cartes: versCartes(evenements.filter((e) => e.phare).sort(compareEvenements)),
      suggestions: ['Quoi ce soir ?', 'Où est le Grand Amphithéâtre ?'],
    };
  }

  // Programme : jour, moment, heure, catégorie
  const heureDemandee = heureEnMinutes(q);
  const sansHeure = heureDemandee?.reste ?? q;
  const { jours, horsFestival } = lireJours(sansHeure, maintenant);
  const moment = lireMoment(sansHeure);
  const cats = categories.filter((c) => contient(sansHeure, MOTS_CATEGORIES[c]));

  // Travaux des élèves (« musique » seul désigne les concerts, pas la filière Son & musique)
  const motsQuestion = q.split(' ');
  const filieresVisees = filieres.filter((f) => {
    const nom = normaliser(f);
    if (q.includes(nom)) return true;
    return (
      (veutProjets || !cats.length) &&
      nom.split(' ').some((mot) => mot.length >= 5 && motsQuestion.some((m) => m.startsWith(mot.slice(0, 5))))
    );
  });
  if (veutProjets || filieresVisees.length) {
    const liste = chercherProjets(q, filieresVisees);
    if (liste.length) {
      return {
        texte: filieresVisees.length
          ? `En ${filieresVisees.join(' et en ')}, ${pluriel(liste.length, 'projet')} présenté${liste.length > 1 ? 's' : ''} :`
          : `J’ai repéré ${pluriel(liste.length, 'projet')} qui pourrai${liste.length > 1 ? 'ent' : 't'} vous plaire :`,
        cartes: liste.slice(0, MAX_CARTES).map((projet) => ({ type: 'projet', projet })),
        suggestions: ['Où est la Nef ?', 'Une visite guidée ?'],
      };
    }
    if (veutProjets && !lieu) {
      return {
        texte: `Le cabinet des élèves réunit des projets en ${filieres.join(', ')}. Voici un premier aperçu :`,
        cartes: projets.slice(0, MAX_CARTES).map((projet) => ({ type: 'projet', projet })),
        suggestions: filieres.slice(0, 3).map((f) => `Des projets en ${f} ?`),
      };
    }
  }

  // Un évènement désigné par son titre : « le bal », « le mapping », « la sieste sonore »
  if (!jours.length && !moment && !heureDemandee && !lieu) {
    const mots = motsCles(q).filter((m) => !MOTS_CATEGORIES_TOUS.has(m));
    const motsDuTitre = (titre: string) => {
      const t = normaliser(titre).split(' ');
      return mots.filter((m) => t.some((w) => w === m || (m.length >= 5 && w.startsWith(m.slice(0, 5))))).length;
    };
    const meilleurEvenement = Math.max(0, ...evenements.map((e) => motsDuTitre(e.titre)));
    const meilleurProjet = Math.max(0, ...projets.map((p) => motsDuTitre(p.titre)));
    // « Atlas sonore » désigne le projet, pas la « Sieste sonore ».
    const parTitre =
      meilleurEvenement > 0 && meilleurEvenement >= meilleurProjet
        ? evenements.filter((e) => motsDuTitre(e.titre) === meilleurEvenement).sort(compareEvenements)
        : [];
    if (parTitre.length) {
      return {
        texte: parTitre.length === 1 ? decrireEvenement(parTitre[0]) : 'Plusieurs escales répondent à ce nom :',
        cartes: versCartes(parTitre),
        suggestions: ['Et ensuite ?', 'Mon parcours'],
      };
    }
  }

  // Programme filtré
  if (horsFestival && !jours.length) {
    return {
      texte: `Pas de festival ${horsFestival} : il se tient du ${festival.jours[0].label.toLowerCase()} au ${festival.jours[festival.jours.length - 1].label.toLowerCase()} novembre. Voici ce qui est prévu le premier jour.`,
      cartes: versCartes(chercherEvenements({ jours: [festival.jours[0].date], categories: cats, debutEntre: moment?.intervalle })),
      suggestions: ['Les temps forts ?', 'Quoi vendredi soir ?'],
    };
  }

  if (jours.length || moment || heureDemandee || cats.length || lieu) {
    const filtre: FiltreEvenements = {
      jours,
      categories: cats,
      lieuId: lieu?.id,
      debutEntre: moment?.intervalle,
      enCoursA: heureDemandee?.minutes,
    };
    const morceaux = [
      cats.length ? cats.map((c) => c.toLowerCase()).join(' ou ') : null,
      jours.length ? jours.map((j) => jourLabel(j).toLowerCase()).join(' et ') : null,
      moment?.nom,
      heureDemandee ? `à ${enHeure(heureDemandee.minutes)}` : null,
      lieu ? lieu.nom : null,
    ].filter(Boolean);

    // Si la question est trop précise, on relâche les contraintes une à une.
    const relachements: [FiltreEvenements | null, string][] = [
      [filtre, ''],
      [
        heureDemandee ? { ...filtre, enCoursA: undefined, debutEntre: [heureDemandee.minutes, 24 * 60] } : null,
        'rien n’est en cours à cette heure-là ; voici ce qui commence ensuite.',
      ],
      [
        moment || heureDemandee ? { ...filtre, debutEntre: undefined, enCoursA: undefined } : null,
        'rien à ce moment-là ; voici le reste du jour.',
      ],
      [jours.length && (cats.length || lieu) ? { ...filtre, jours: [], debutEntre: undefined, enCoursA: undefined } : null, 'rien ce jour-là ; voici les autres jours.'],
    ];
    for (const [variante, precision] of relachements) {
      if (!variante) continue;
      const liste = chercherEvenements(variante);
      if (!liste.length) continue;
      return {
        texte:
          (precision
            ? `Pour « ${morceaux.join(', ')} », ${precision}`
            : `${liste.length === 1 ? 'Une escale' : pluriel(liste.length, 'escale')} — ${morceaux.join(', ')}.`) +
          plusQue(liste.length),
        cartes: [...(lieu && demandeOu ? [{ type: 'lieu' as const, lieu }] : []), ...versCartes(liste)],
        suggestions: jours.length ? ['Et ensuite ?', 'Où manger ?'] : ['Quoi samedi ?', 'Mon parcours'],
      };
    }
    return {
      texte: `Je ne trouve rien pour : ${morceaux.join(', ')}. Essayez un autre jour ou une autre catégorie.`,
      cartes: lieu ? [{ type: 'lieu', lieu }] : [],
      suggestions: ['Les temps forts ?', 'Qu’est-ce qui se passe maintenant ?'],
    };
  }

  // Dernier recours : recherche plein texte
  const resultats = rechercheLibre(q);
  if (resultats.length) {
    const meilleurs = resultats.filter((r) => r.score >= resultats[0].score / 2).slice(0, MAX_CARTES);
    const premier = meilleurs[0];
    const texte =
      premier.type === 'evenement' && meilleurs.length === 1
        ? decrireEvenement(premier.evenement)
        : premier.type === 'lieu' && meilleurs.length === 1
          ? `${premier.lieu.nom}, repère n° ${premier.lieu.numero}. ${premier.lieu.description}`
          : 'Voici ce que j’ai trouvé dans le livre de bord :';
    return {
      texte,
      cartes: meilleurs.map((r): Carte =>
        r.type === 'evenement'
          ? { type: 'evenement', evenement: r.evenement }
          : r.type === 'projet'
            ? { type: 'projet', projet: r.projet }
            : { type: 'lieu', lieu: r.lieu }
      ),
      suggestions: ['Qu’est-ce qui se passe maintenant ?', 'Les temps forts ?'],
    };
  }

  return {
    texte: 'Mille sabords, je n’ai rien trouvé à ce sujet. Je connais le programme, les lieux du campus et les travaux des élèves : essayez l’une de ces questions.',
    cartes: [],
    suggestions: SUGGESTIONS_ACCUEIL,
  };
}

function aide(): Reponse {
  return {
    texte:
      'Je suis le Timonier, le guide du festival. Je réponds hors connexion, à partir du livre de bord embarqué. Demandez-moi par exemple ce qui se passe à une heure donnée, où se trouve un lieu, quels concerts ont lieu samedi, ou quels travaux d’élèves voir en photographie.',
    cartes: [],
    suggestions: SUGGESTIONS_ACCUEIL,
  };
}
