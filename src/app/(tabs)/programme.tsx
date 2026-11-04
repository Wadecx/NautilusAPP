import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { EventRow } from '@/components/event-row';
import { Chip, PaperScroll, ScreenHeader } from '@/components/paper';
import { ThemedText } from '@/components/themed-text';
import { Spacing, Typefaces } from '@/constants/theme';
import { categories, compareEvenements, evenements, festival, type Categorie, type JourDate } from '@/data/festival';
import { useFavorites } from '@/hooks/use-favorites';
import { useTheme } from '@/hooks/use-theme';

function jourParDefaut(): JourDate {
  const d = new Date();
  const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  return festival.jours.find((j) => j.date === today)?.date ?? festival.jours[0].date;
}

export default function ProgrammeScreen() {
  const theme = useTheme();
  const { favorites } = useFavorites();
  const [jour, setJour] = useState<JourDate>(jourParDefaut);
  const [categorie, setCategorie] = useState<Categorie | null>(null);
  const [parcours, setParcours] = useState(false);

  const liste = evenements
    .filter((e) => (parcours ? favorites.has(e.id) : e.jour === jour))
    .filter((e) => !categorie || e.categorie === categorie)
    .sort(compareEvenements);

  return (
    <PaperScroll>
      <ScreenHeader kicker="Trois jours, neuf lieux" title="Programme" />

      <View style={[styles.days, { borderColor: theme.text }]}>
        {festival.jours.map((j, i) => {
          const selected = !parcours && j.date === jour;
          return (
            <ThemedText
              key={j.date}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => {
                setParcours(false);
                setJour(j.date);
              }}
              style={[
                styles.day,
                i > 0 && { borderLeftWidth: 1, borderLeftColor: theme.text },
                selected && { backgroundColor: theme.text, color: theme.background },
              ]}>
              {j.court}
            </ThemedText>
          );
        })}
        <ThemedText
          accessibilityRole="button"
          accessibilityState={{ selected: parcours }}
          onPress={() => setParcours(true)}
          style={[
            styles.day,
            { borderLeftWidth: 1, borderLeftColor: theme.text },
            parcours && { backgroundColor: theme.accent, color: theme.background },
          ]}>
          ★ {favorites.size}
        </ThemedText>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        <Chip label="Tout" selected={!categorie} onPress={() => setCategorie(null)} />
        {categories.map((c) => (
          <Chip key={c} label={c} selected={categorie === c} onPress={() => setCategorie(categorie === c ? null : c)} />
        ))}
      </ScrollView>

      {parcours ? (
        <ThemedText type="kicker" themeColor="accent">
          Mon parcours — tous les jours
        </ThemedText>
      ) : null}

      <View>
        {liste.map((e) => (
          <EventRow key={e.id} evenement={e} showDay={parcours} />
        ))}
        {liste.length === 0 ? (
          <ThemedText type="italic" themeColor="textSecondary" style={styles.empty}>
            {parcours
              ? 'Votre parcours est vide. Touchez ☆ à côté d’un évènement pour l’y ajouter.'
              : 'Aucun évènement de ce genre ce jour-là.'}
          </ThemedText>
        ) : null}
      </View>
    </PaperScroll>
  );
}

const styles = StyleSheet.create({
  days: {
    flexDirection: 'row',
    borderWidth: 1.5,
  },
  day: {
    flex: 1,
    textAlign: 'center',
    paddingVertical: Spacing.two,
    fontFamily: Typefaces.heading,
    fontSize: 17,
    lineHeight: 22,
  },
  chips: {
    gap: Spacing.two,
  },
  empty: {
    textAlign: 'center',
    paddingVertical: Spacing.five,
  },
});
