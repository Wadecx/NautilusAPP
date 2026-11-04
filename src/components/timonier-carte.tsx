import { Link } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { type Carte } from '@/agent/timonier';
import { EventRow } from '@/components/event-row';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { lieuParId } from '@/data/festival';
import { useTheme } from '@/hooks/use-theme';

/** Une réponse du Timonier renvoie vers un évènement, un projet ou un lieu du plan. */
export function TimonierCarte({ carte }: { carte: Carte }) {
  const theme = useTheme();

  if (carte.type === 'evenement') return <EventRow evenement={carte.evenement} showDay />;

  if (carte.type === 'projet') {
    const { projet } = carte;
    const lieu = lieuParId(projet.lieuId);
    return (
      <Link href={{ pathname: '/projet/[id]', params: { id: projet.id } }} asChild>
        <Pressable style={({ pressed }) => [styles.ligne, { borderBottomColor: theme.border }, pressed && styles.pressed]}>
          <ThemedText style={[styles.glyphe, { color: theme.accent }]}>❦</ThemedText>
          <View style={styles.corps}>
            <ThemedText type="kicker" themeColor="accent">
              {projet.filiere}
            </ThemedText>
            <ThemedText type="heading" style={styles.titre}>
              {projet.titre}
            </ThemedText>
            <ThemedText type="italic" themeColor="textSecondary" style={styles.detail}>
              {projet.resume}
              {lieu ? ` — ${lieu.numero}. ${lieu.nom}` : ''}
            </ThemedText>
          </View>
        </Pressable>
      </Link>
    );
  }

  const { lieu } = carte;
  return (
    <Link href={{ pathname: '/plan', params: { lieu: lieu.id } }} asChild>
      <Pressable style={({ pressed }) => [styles.ligne, { borderBottomColor: theme.border }, pressed && styles.pressed]}>
        <View style={[styles.repere, { borderColor: theme.accent }]}>
          <ThemedText type="smallBold" themeColor="accent">
            {lieu.numero}
          </ThemedText>
        </View>
        <View style={styles.corps}>
          <ThemedText type="kicker" themeColor="accent">
            Voir sur le plan ⌖
          </ThemedText>
          <ThemedText type="heading" style={styles.titre}>
            {lieu.nom}
          </ThemedText>
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  ligne: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.three,
    paddingVertical: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth * 2,
  },
  glyphe: {
    width: 30,
    textAlign: 'center',
    fontSize: 22,
    lineHeight: 28,
  },
  repere: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  corps: {
    flex: 1,
    gap: Spacing.half,
  },
  titre: {
    fontSize: 20,
    lineHeight: 24,
  },
  detail: {
    fontSize: 15,
    lineHeight: 20,
  },
  pressed: {
    opacity: 0.6,
  },
});
