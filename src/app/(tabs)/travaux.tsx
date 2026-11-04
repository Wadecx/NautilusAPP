import { useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { Chip, PaperScroll, ScreenHeader } from '@/components/paper';
import { ProjectCard } from '@/components/project-card';
import { ThemedText } from '@/components/themed-text';
import { Spacing, Typefaces } from '@/constants/theme';
import { filieres, projets } from '@/data/festival';
import { useTheme } from '@/hooks/use-theme';

const normaliser = (texte: string) =>
  texte.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export default function TravauxScreen() {
  const theme = useTheme();
  const [recherche, setRecherche] = useState('');
  const [filiere, setFiliere] = useState<string | null>(null);

  const q = normaliser(recherche.trim());
  const liste = projets.filter(
    (p) =>
      (!filiere || p.filiere === filiere) &&
      (!q ||
        normaliser([p.titre, p.resume, p.eleves.join(' '), p.techniques.join(' ')].join(' ')).includes(q))
  );

  return (
    <PaperScroll keyboardShouldPersistTaps="handled">
      <ScreenHeader
        kicker="Cabinet des élèves"
        title="Travaux des élèves"
        subtitle="Projets présentés pendant le festival"
      />

      <TextInput
        value={recherche}
        onChangeText={setRecherche}
        placeholder="Rechercher un projet, un élève, une technique…"
        placeholderTextColor={theme.textSecondary}
        style={[styles.search, { borderColor: theme.text, color: theme.text, backgroundColor: theme.land }]}
        returnKeyType="search"
        clearButtonMode="while-editing"
        accessibilityLabel="Rechercher dans les travaux"
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        <Chip label="Toutes filières" selected={!filiere} onPress={() => setFiliere(null)} />
        {filieres.map((f) => (
          <Chip key={f} label={f} selected={filiere === f} onPress={() => setFiliere(filiere === f ? null : f)} />
        ))}
      </ScrollView>

      <View style={styles.list}>
        {liste.map((p) => (
          <ProjectCard key={p.id} projet={p} />
        ))}
        {liste.length === 0 ? (
          <ThemedText type="italic" themeColor="textSecondary" style={styles.empty}>
            Aucun projet ne correspond à cette recherche.
          </ThemedText>
        ) : null}
      </View>
    </PaperScroll>
  );
}

const styles = StyleSheet.create({
  search: {
    borderWidth: 1.5,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontFamily: Typefaces.bodyItalic,
    fontSize: 17,
  },
  chips: {
    gap: Spacing.two,
  },
  list: {
    gap: Spacing.three,
  },
  empty: {
    textAlign: 'center',
    paddingVertical: Spacing.five,
  },
});
