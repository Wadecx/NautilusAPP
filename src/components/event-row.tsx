import { Link } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing, Typefaces } from '@/constants/theme';
import { heure, jourLabel, lieuParId, type Evenement } from '@/data/festival';
import { useFavorites } from '@/hooks/use-favorites';
import { useTheme } from '@/hooks/use-theme';

export function FavoriteButton({ id, size = 26 }: { id: string; size?: number }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const theme = useTheme();
  const active = isFavorite(id);

  return (
    <Pressable
      onPress={() => toggleFavorite(id)}
      hitSlop={12}
      accessibilityRole="button"
      accessibilityLabel={active ? 'Retirer de mon parcours' : 'Ajouter à mon parcours'}
      accessibilityState={{ selected: active }}
      style={({ pressed }) => pressed && { opacity: 0.5 }}>
      <ThemedText style={{ fontSize: size, lineHeight: size + 4, color: active ? theme.accent : theme.border }}>
        {active ? '★' : '☆'}
      </ThemedText>
    </Pressable>
  );
}

/** Ligne de programme, façon registre : heure à gauche, filet vertical, détails. */
export function EventRow({ evenement, showDay = false }: { evenement: Evenement; showDay?: boolean }) {
  const theme = useTheme();
  const lieu = lieuParId(evenement.lieuId);

  return (
    <View style={[styles.row, { borderBottomColor: theme.border }]}>
      <Link href={{ pathname: '/evenement/[id]', params: { id: evenement.id } }} asChild>
        <Pressable style={styles.main}>
          <View style={styles.time}>
            {showDay ? (
              <ThemedText type="kicker" themeColor="textSecondary" style={styles.day}>
                {jourLabel(evenement.jour).split(' ')[0].slice(0, 3)}.
              </ThemedText>
            ) : null}
            <ThemedText style={styles.hour}>{heure(evenement.debut)}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {heure(evenement.fin)}
            </ThemedText>
          </View>
          <View style={[styles.rule, { backgroundColor: theme.accent }]} />
          <View style={styles.body}>
            <ThemedText type="kicker" themeColor="accent">
              {evenement.categorie}
              {evenement.phare ? '  ✦' : ''}
            </ThemedText>
            <ThemedText type="heading" style={styles.title}>
              {evenement.titre}
            </ThemedText>
            {lieu ? (
              <ThemedText type="italic" themeColor="textSecondary" style={styles.place}>
                {lieu.numero}. {lieu.nom}
              </ThemedText>
            ) : null}
          </View>
        </Pressable>
      </Link>
      <View style={styles.fav}>
        <FavoriteButton id={evenement.id} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderBottomWidth: StyleSheet.hairlineWidth * 2,
    paddingVertical: Spacing.three,
  },
  main: {
    flex: 1,
    flexDirection: 'row',
    gap: Spacing.three,
  },
  time: {
    width: 62,
    alignItems: 'flex-end',
  },
  day: {
    fontSize: 11,
  },
  hour: {
    fontFamily: Typefaces.heading,
    fontSize: 22,
    lineHeight: 26,
  },
  rule: {
    width: 1.5,
    alignSelf: 'stretch',
  },
  body: {
    flex: 1,
    gap: Spacing.half,
  },
  title: {
    fontSize: 20,
    lineHeight: 24,
  },
  place: {
    fontSize: 15,
    lineHeight: 20,
  },
  fav: {
    paddingLeft: Spacing.two,
  },
});
