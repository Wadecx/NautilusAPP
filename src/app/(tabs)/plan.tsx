import { Link, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CampusMap } from '@/components/campus-map';
import { Chip } from '@/components/paper';
import { ThemedText } from '@/components/themed-text';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { evenementsDuLieu, heure, jourLabel, lieuParId, lieux, projetsDuLieu } from '@/data/festival';
import { useTheme } from '@/hooks/use-theme';

export default function PlanScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  // « Voir sur le plan » depuis un évènement ou un projet : /plan?lieu=nef
  const { lieu: lieuDemande } = useLocalSearchParams<{ lieu?: string }>();
  const [selectedId, setSelectedId] = useState<string | null>(lieuDemande ?? null);
  const [dernierDemande, setDernierDemande] = useState(lieuDemande);
  if (lieuDemande !== dernierDemande) {
    setDernierDemande(lieuDemande);
    if (lieuDemande) setSelectedId(lieuDemande);
  }
  const lieu = selectedId ? lieuParId(selectedId) : undefined;

  return (
    <View
      style={[
        styles.screen,
        {
          backgroundColor: theme.background,
          paddingTop: insets.top + Spacing.two,
          paddingBottom: insets.bottom + BottomTabInset + Spacing.two,
        },
      ]}>
      <View style={styles.column}>
        <View style={styles.header}>
          <ThemedText type="kicker" themeColor="accent">
            Pincez pour zoomer · touchez un repère
          </ThemedText>
        </View>

        <CampusMap selectedId={selectedId} onSelect={setSelectedId} />

        <View style={[styles.panel, { borderColor: theme.text, backgroundColor: theme.land }]}>
          {lieu ? (
            <ScrollView contentContainerStyle={styles.panelContent}>
              <View style={styles.panelHeader}>
                <ThemedText type="heading" style={{ flex: 1 }}>
                  {lieu.numero}. {lieu.nom}
                </ThemedText>
                <Pressable onPress={() => setSelectedId(null)} hitSlop={12} accessibilityLabel="Fermer">
                  <ThemedText themeColor="textSecondary">✕</ThemedText>
                </Pressable>
              </View>
              <ThemedText type="small" themeColor="textSecondary">
                {lieu.description}
              </ThemedText>

              {evenementsDuLieu(lieu.id).map((e) => (
                <Link key={e.id} href={{ pathname: '/evenement/[id]', params: { id: e.id } }} asChild>
                  <Pressable style={styles.item}>
                    <ThemedText type="smallBold" themeColor="accent" style={styles.itemTime}>
                      {jourLabel(e.jour).split(' ')[0].slice(0, 3)}. {heure(e.debut)}
                    </ThemedText>
                    <ThemedText type="small" style={{ flex: 1 }}>
                      {e.titre}
                    </ThemedText>
                  </Pressable>
                </Link>
              ))}

              {projetsDuLieu(lieu.id).length > 0 ? (
                <ThemedText type="kicker" themeColor="accent" style={{ marginTop: Spacing.two }}>
                  Travaux exposés
                </ThemedText>
              ) : null}
              {projetsDuLieu(lieu.id).map((p) => (
                <Link key={p.id} href={{ pathname: '/projet/[id]', params: { id: p.id } }} asChild>
                  <Pressable style={styles.item}>
                    <ThemedText type="small">❦</ThemedText>
                    <ThemedText type="italic" style={{ flex: 1, fontSize: 15, lineHeight: 21 }}>
                      {p.titre}
                    </ThemedText>
                  </Pressable>
                </Link>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.panelContent}>
              <ThemedText type="kicker" themeColor="accent">
                Légende
              </ThemedText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.legend}>
                {lieux.map((l) => (
                  <Chip key={l.id} label={`${l.numero}. ${l.nom.split(' — ')[0]}`} onPress={() => setSelectedId(l.id)} />
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
  },
  column: {
    flex: 1,
    minWidth: 0,
    maxWidth: MaxContentWidth,
    gap: Spacing.two,
  },
  header: {
    alignItems: 'center',
  },
  panel: {
    borderWidth: 1.5,
    maxHeight: '38%',
  },
  panelContent: {
    padding: Spacing.three,
    gap: Spacing.two,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
  item: {
    flexDirection: 'row',
    gap: Spacing.two,
    alignItems: 'baseline',
  },
  itemTime: {
    width: 84,
  },
  legend: {
    gap: Spacing.two,
  },
});
