import { Link, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { EventRow } from '@/components/event-row';
import { Chip, Ornament, PaperScroll } from '@/components/paper';
import { ProjectPlate } from '@/components/project-card';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { evenementsDuProjet, lieuParId, projetParId, projets } from '@/data/festival';
import { useTheme } from '@/hooks/use-theme';

// Pages pré-générées à l'export web, pour qu'elles restent accessibles hors connexion.
export function generateStaticParams() {
  return projets.map((p) => ({ id: p.id }));
}

export default function ProjetScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const projet = projetParId(id);

  if (!projet) {
    return (
      <PaperScroll withTabBar={false}>
        <ThemedText type="italic">Ce projet est introuvable.</ThemedText>
      </PaperScroll>
    );
  }

  const lieu = lieuParId(projet.lieuId);
  const rendezVous = evenementsDuProjet(projet.id);

  return (
    <PaperScroll withTabBar={false}>
      <View style={[styles.plate, { borderColor: theme.text }]}>
        <ProjectPlate id={projet.id} height={200} />
      </View>

      <View style={styles.header}>
        <ThemedText type="kicker" themeColor="accent">
          {projet.filiere} · {projet.annee}
        </ThemedText>
        <ThemedText type="subtitle" accessibilityRole="header">
          {projet.titre}
        </ThemedText>
        <ThemedText type="italic" themeColor="textSecondary">
          par {projet.eleves.join(', ')}
        </ThemedText>
      </View>

      <ThemedText type="heading" style={styles.lead}>
        {projet.resume}
      </ThemedText>
      <ThemedText>{projet.description}</ThemedText>

      <View style={styles.tags}>
        {projet.techniques.map((t) => (
          <Chip key={t} label={t} disabled />
        ))}
      </View>

      {lieu ? (
        <Link href={{ pathname: '/plan', params: { lieu: lieu.id } }} asChild>
          <Pressable>
            <ThemedText type="link">
              ⌖ À voir : {lieu.numero}. {lieu.nom}
            </ThemedText>
          </Pressable>
        </Link>
      ) : null}

      {rendezVous.length > 0 ? (
        <View>
          <Ornament />
          <ThemedText type="kicker" themeColor="accent" style={{ marginTop: Spacing.two }}>
            Rendez-vous autour du projet
          </ThemedText>
          {rendezVous.map((e) => (
            <EventRow key={e.id} evenement={e} showDay />
          ))}
        </View>
      ) : null}
    </PaperScroll>
  );
}

const styles = StyleSheet.create({
  plate: {
    borderWidth: 1.5,
    padding: 3,
  },
  header: {
    gap: Spacing.one,
  },
  lead: {
    fontSize: 21,
    lineHeight: 28,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
});
