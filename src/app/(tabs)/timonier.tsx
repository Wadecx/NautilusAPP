import { useEffect, useRef, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { repondre, SUGGESTIONS_ACCUEIL, type Reponse } from '@/agent/timonier';
import { NautilusEmblem } from '@/components/nautilus-emblem';
import { Chip, Ornament, Plate } from '@/components/paper';
import { ThemedText } from '@/components/themed-text';
import { TimonierCarte } from '@/components/timonier-carte';
import { BottomTabInset, MaxContentWidth, Spacing, Typefaces } from '@/constants/theme';
import { useFavorites } from '@/hooks/use-favorites';
import { useTheme } from '@/hooks/use-theme';

type Message =
  | { id: number; auteur: 'visiteur'; texte: string }
  | { id: number; auteur: 'timonier'; reponse: Reponse };

const ACCUEIL: Message = {
  id: 0,
  auteur: 'timonier',
  reponse: {
    texte:
      'Bienvenue à bord ! Je suis le Timonier. Posez-moi vos questions sur le programme, le campus ou les travaux des élèves : je réponds même sans réseau.',
    cartes: [],
    suggestions: SUGGESTIONS_ACCUEIL,
  },
};

/** Le clavier masque la barre d'onglets : on retire alors la marge qui lui était réservée. */
function useClavierVisible() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const montre = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', () => setVisible(true));
    const cache = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide', () => setVisible(false));
    return () => {
      montre.remove();
      cache.remove();
    };
  }, []);
  return visible;
}

export default function TimonierScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { favorites } = useFavorites();
  const clavierVisible = useClavierVisible();
  const scrollRef = useRef<ScrollView>(null);
  const [messages, setMessages] = useState<Message[]>([ACCUEIL]);
  const [saisie, setSaisie] = useState('');

  function demander(question: string) {
    const texte = question.trim();
    if (!texte) return;
    const reponse = repondre(texte, { maintenant: new Date(), favoris: favorites });
    setMessages((liste) => [
      ...liste,
      { id: liste.length, auteur: 'visiteur', texte },
      { id: liste.length + 1, auteur: 'timonier', reponse },
    ]);
    setSaisie('');
  }

  const derniere = messages[messages.length - 1];
  const suggestions = derniere.auteur === 'timonier' ? derniere.reponse.suggestions : [];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.ecran, { backgroundColor: theme.background }]}>
      <ScrollView
        ref={scrollRef}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        contentContainerStyle={[styles.defilement, { paddingTop: insets.top + Spacing.three }]}>
        <View style={styles.colonne}>
          <View style={styles.entete}>
            <NautilusEmblem size={72} />
            <ThemedText type="kicker" themeColor="accent">
              Agent du festival
            </ThemedText>
            <ThemedText type="subtitle" accessibilityRole="header">
              Le Timonier
            </ThemedText>
            <Ornament glyph="⚓" />
          </View>

          {messages.map((m) =>
            m.auteur === 'visiteur' ? (
              <View key={m.id} style={styles.bulleVisiteurConteneur}>
                <View style={[styles.bulleVisiteur, { backgroundColor: theme.backgroundSelected }]}>
                  <ThemedText type="italic">{m.texte}</ThemedText>
                </View>
              </View>
            ) : (
              <Plate key={m.id}>
                <ThemedText type="kicker" themeColor="accent">
                  Le Timonier
                </ThemedText>
                <ThemedText>{m.reponse.texte}</ThemedText>
                {m.reponse.cartes.length > 0 ? (
                  <View>
                    {m.reponse.cartes.map((carte) => (
                      <TimonierCarte
                        key={`${carte.type}-${carte.type === 'evenement' ? carte.evenement.id : carte.type === 'projet' ? carte.projet.id : carte.lieu.id}`}
                        carte={carte}
                      />
                    ))}
                  </View>
                ) : null}
              </Plate>
            )
          )}
        </View>
      </ScrollView>

      <View
        style={[
          styles.barre,
          {
            borderTopColor: theme.text,
            backgroundColor: theme.background,
            paddingBottom: Spacing.two + (clavierVisible ? 0 : insets.bottom + BottomTabInset),
          },
        ]}>
        <View style={styles.colonne}>
          {suggestions.length > 0 ? (
            <ScrollView
              horizontal
              keyboardShouldPersistTaps="handled"
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.suggestions}>
              {suggestions.map((s) => (
                <Chip key={s} label={s} onPress={() => demander(s)} />
              ))}
            </ScrollView>
          ) : null}
          <View style={styles.saisie}>
            <TextInput
              value={saisie}
              onChangeText={setSaisie}
              onSubmitEditing={() => demander(saisie)}
              placeholder="Demandez au Timonier…"
              placeholderTextColor={theme.textSecondary}
              returnKeyType="send"
              submitBehavior="blurAndSubmit"
              accessibilityLabel="Votre question"
              style={[styles.champ, { borderColor: theme.text, color: theme.text, backgroundColor: theme.land }]}
            />
            <Pressable
              onPress={() => demander(saisie)}
              disabled={!saisie.trim()}
              accessibilityRole="button"
              accessibilityLabel="Envoyer la question"
              style={({ pressed }) => [
                styles.envoyer,
                { backgroundColor: theme.accent, opacity: !saisie.trim() ? 0.4 : pressed ? 0.7 : 1 },
              ]}>
              <ThemedText style={[styles.envoyerTexte, { color: theme.background }]}>✒</ThemedText>
            </Pressable>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  ecran: {
    flex: 1,
  },
  defilement: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.four,
  },
  colonne: {
    flex: 1,
    minWidth: 0,
    maxWidth: MaxContentWidth,
    gap: Spacing.three,
  },
  entete: {
    alignItems: 'center',
    gap: Spacing.one,
  },
  bulleVisiteurConteneur: {
    alignItems: 'flex-end',
  },
  bulleVisiteur: {
    maxWidth: '85%',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 18,
    borderBottomRightRadius: 4,
  },
  barre: {
    flexDirection: 'row',
    justifyContent: 'center',
    borderTopWidth: 1.5,
    paddingTop: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  suggestions: {
    gap: Spacing.two,
  },
  saisie: {
    flexDirection: 'row',
    gap: Spacing.two,
    alignItems: 'center',
  },
  champ: {
    flex: 1,
    borderWidth: 1.5,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontFamily: Typefaces.body,
    fontSize: 17,
  },
  envoyer: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  envoyerTexte: {
    fontSize: 22,
    lineHeight: 26,
  },
});
