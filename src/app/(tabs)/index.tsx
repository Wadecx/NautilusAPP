import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { EventRow } from '@/components/event-row';
import { NautilusEmblem } from '@/components/nautilus-emblem';
import { Ornament, PaperScroll, Plate, SectionTitle } from '@/components/paper';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import {
  compareEvenements,
  debutDate,
  evenements,
  festival,
  finDate,
  lieux,
  projets,
} from '@/data/festival';
import { useTheme } from '@/hooks/use-theme';

function useNow(intervalMs = 60_000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

const tries = [...evenements].sort(compareEvenements);
const premier = festival.jours[0].date;
const dernier = festival.jours[festival.jours.length - 1].date;

export default function HomeScreen() {
  const now = useNow();
  const debutFestival = new Date(`${premier}T00:00:00`);
  const finFestival = new Date(`${dernier}T23:59:59`);

  const enCours = tries.filter((e) => debutDate(e) <= now && now < finDate(e));
  const aSuivre = tries.filter((e) => debutDate(e) > now).slice(0, 3);
  const phares = tries.filter((e) => e.phare);

  let statut: { titre: string; texte: string };
  if (now < debutFestival) {
    const jours = Math.ceil((debutFestival.getTime() - now.getTime()) / 86_400_000);
    statut = {
      titre: jours <= 1 ? 'Ouverture demain' : `Ouverture dans ${jours} jours`,
      texte: 'Préparez votre parcours : touchez ☆ pour garder un évènement dans « Mon parcours ».',
    };
  } else if (now <= finFestival) {
    statut = {
      titre: 'Le festival bat son plein',
      texte: enCours.length ? 'Voici ce qui se passe en ce moment sur le campus.' : 'Entracte : voici la suite du programme.',
    };
  } else {
    statut = {
      titre: 'Rideau !',
      texte: 'Merci pour votre visite. Les travaux des élèves restent consultables ici.',
    };
  }

  return (
    <PaperScroll>
      <View style={styles.hero}>
        <NautilusEmblem size={150} />
        <ThemedText type="kicker" themeColor="accent">
          Festival · {festival.edition}
        </ThemedText>
        <ThemedText type="title" style={styles.center} accessibilityRole="header">
          {festival.nom}
        </ThemedText>
        <ThemedText type="italic" themeColor="textSecondary" style={styles.center}>
          {festival.sousTitre}
        </ThemedText>
        <ThemedText type="heading" style={styles.center}>
          19 · 20 · 21 novembre 2026
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {festival.lieu}
        </ThemedText>
        <Ornament />
      </View>

      <Plate>
        <ThemedText type="kicker" themeColor="accent">
          Dépêche du jour
        </ThemedText>
        <ThemedText type="heading">{statut.titre}</ThemedText>
        <ThemedText type="small">{statut.texte}</ThemedText>
      </Plate>

      {enCours.length > 0 ? (
        <View>
          <SectionTitle>En ce moment</SectionTitle>
          {enCours.map((e) => (
            <EventRow key={e.id} evenement={e} />
          ))}
        </View>
      ) : null}

      {aSuivre.length > 0 ? (
        <View>
          <SectionTitle>À suivre</SectionTitle>
          {aSuivre.map((e) => (
            <EventRow key={e.id} evenement={e} showDay />
          ))}
        </View>
      ) : null}

      <View>
        <SectionTitle>À ne pas manquer ✦</SectionTitle>
        {phares.map((e) => (
          <EventRow key={e.id} evenement={e} showDay />
        ))}
      </View>

      <View style={styles.shortcuts}>
        <Shortcut href="/plan" glyph="⌖" title="Plan du campus" detail={`${lieux.length} lieux`} />
        <Shortcut href="/travaux" glyph="❦" title="Travaux des élèves" detail={`${projets.length} projets`} />
      </View>

      <Link href="/timonier" asChild>
        <Pressable accessibilityRole="button">
          <Plate>
            <ThemedText type="kicker" themeColor="accent">
              Agent du festival ⚓
            </ThemedText>
            <ThemedText type="heading">Demandez au Timonier</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              « Quoi ce soir ? », « Où manger ? », « Des projets de photographie ? » : le guide répond, même
              hors connexion.
            </ThemedText>
          </Plate>
        </Pressable>
      </Link>

      <View style={styles.offline}>
        <Ornament glyph="⚓" />
        <ThemedText type="small" themeColor="textSecondary" style={styles.center}>
          Programme, plan et travaux sont embarqués dans l’application : elle fonctionne sans réseau,
          même au fond de la cale.
        </ThemedText>
      </View>
    </PaperScroll>
  );
}

function Shortcut({
  href,
  glyph,
  title,
  detail,
}: {
  href: '/plan' | '/travaux';
  glyph: string;
  title: string;
  detail: string;
}) {
  const theme = useTheme();
  return (
    <Link href={href} asChild>
      <Pressable style={StyleSheet.flatten([styles.shortcut, { borderColor: theme.text, backgroundColor: theme.land }])}>
        <ThemedText style={[styles.shortcutGlyph, { color: theme.accent }]}>{glyph}</ThemedText>
        <ThemedText type="heading" style={styles.center}>
          {title}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {detail}
        </ThemedText>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    gap: Spacing.one,
    paddingTop: Spacing.three,
  },
  center: {
    textAlign: 'center',
  },
  shortcuts: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  shortcut: {
    flex: 1,
    borderWidth: 1.5,
    alignItems: 'center',
    padding: Spacing.three,
    gap: Spacing.one,
  },
  shortcutGlyph: {
    fontSize: 30,
    lineHeight: 36,
  },
  offline: {
    gap: Spacing.two,
  },
});
