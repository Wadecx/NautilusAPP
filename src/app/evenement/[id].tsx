import { Link, Stack, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { FavoriteButton } from '@/components/event-row';
import { Ornament, PaperScroll, Plate } from '@/components/paper';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { evenementParId, evenements, heure, jourLabel, lieuParId, projetParId } from '@/data/festival';
import { useFavorites } from '@/hooks/use-favorites';

// Pages pré-générées à l'export web, pour qu'elles restent accessibles hors connexion.
export function generateStaticParams() {
  return evenements.map((e) => ({ id: e.id }));
}

export default function EvenementScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const evenement = evenementParId(id);
  const { isFavorite } = useFavorites();

  if (!evenement) {
    return (
      <PaperScroll withTabBar={false}>
        <ThemedText type="italic">Cet évènement est introuvable.</ThemedText>
      </PaperScroll>
    );
  }

  const lieu = lieuParId(evenement.lieuId);
  const projetsLies = (evenement.projetIds ?? []).map(projetParId).filter((p) => !!p);

  return (
    <PaperScroll withTabBar={false}>
      <Stack.Screen options={{ title: evenement.categorie }} />

      <View style={styles.header}>
        <ThemedText type="kicker" themeColor="accent">
          {evenement.categorie}
          {evenement.phare ? ' · à ne pas manquer ✦' : ''}
        </ThemedText>
        <ThemedText type="subtitle" accessibilityRole="header">
          {evenement.titre}
        </ThemedText>
        {evenement.intervenants ? (
          <ThemedText type="italic" themeColor="textSecondary">
            {evenement.intervenants}
          </ThemedText>
        ) : null}
      </View>

      <Plate>
        <View style={styles.meta}>
          <View style={{ flex: 1, gap: Spacing.one }}>
            <ThemedText type="heading">
              {jourLabel(evenement.jour)} novembre
            </ThemedText>
            <ThemedText>
              de {heure(evenement.debut)} à {heure(evenement.fin)}
            </ThemedText>
            {lieu ? (
              <ThemedText type="italic">
                {lieu.numero}. {lieu.nom}
              </ThemedText>
            ) : null}
          </View>
          <View style={styles.fav}>
            <FavoriteButton id={evenement.id} size={34} />
            <ThemedText type="small" themeColor="textSecondary" style={styles.favLabel}>
              {isFavorite(evenement.id) ? 'Dans mon\nparcours' : 'Ajouter'}
            </ThemedText>
          </View>
        </View>
      </Plate>

      <ThemedText>{evenement.description}</ThemedText>

      {lieu ? (
        <Link href={{ pathname: '/plan', params: { lieu: lieu.id } }} asChild>
          <Pressable>
            <ThemedText type="link">⌖ Voir le plan du campus (repère n° {lieu.numero})</ThemedText>
          </Pressable>
        </Link>
      ) : null}

      {projetsLies.length > 0 ? (
        <View style={styles.related}>
          <Ornament />
          <ThemedText type="kicker" themeColor="accent">
            Travaux d’élèves liés
          </ThemedText>
          {projetsLies.map((p) => (
            <Link key={p.id} href={{ pathname: '/projet/[id]', params: { id: p.id } }} asChild>
              <Pressable>
                <ThemedText type="link">❦ {p.titre}</ThemedText>
              </Pressable>
            </Link>
          ))}
        </View>
      ) : null}
    </PaperScroll>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: Spacing.one,
  },
  meta: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  fav: {
    alignItems: 'center',
    width: 80,
  },
  favLabel: {
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 16,
  },
  related: {
    gap: Spacing.two,
  },
});
