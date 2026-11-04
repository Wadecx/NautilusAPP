import { Link } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, G, Line, Pattern, Rect } from 'react-native-svg';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { type Projet } from '@/data/festival';
import { useTheme } from '@/hooks/use-theme';

function hash(text: string) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Vignette gravée générée à partir de l'identifiant du projet :
 * pas d'image à télécharger, donc toujours disponible hors connexion.
 * Remplacez-la par une photo (expo-image + require) quand vous aurez les visuels.
 */
export function ProjectPlate({ id, height = 120 }: { id: string; height?: number }) {
  const theme = useTheme();
  const shapes = useMemo(() => {
    let seed = hash(id);
    const rand = () => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    const circles = Array.from({ length: 3 + Math.floor(rand() * 3) }, () => ({
      cx: 20 + rand() * 260,
      cy: 15 + rand() * 90,
      r: 12 + rand() * 38,
    }));
    const angle = Math.floor(rand() * 4) * 30 + 15;
    return { circles, angle };
  }, [id]);

  const patternId = `hatch-${id}`;

  return (
    <Svg width="100%" height={height} viewBox="0 0 300 120" preserveAspectRatio="xMidYMid slice">
      <Defs>
        <Pattern
          id={patternId}
          patternUnits="userSpaceOnUse"
          width={5}
          height={5}
          patternTransform={`rotate(${shapes.angle})`}>
          <Line x1={0} y1={0} x2={0} y2={5} stroke={theme.text} strokeWidth={0.8} />
        </Pattern>
      </Defs>
      <Rect x={0} y={0} width={300} height={120} fill={theme.backgroundElement} />
      <G>
        {shapes.circles.map((c, i) => (
          <G key={i}>
            <Circle cx={c.cx} cy={c.cy} r={c.r} fill={`url(#${patternId})`} opacity={0.55} />
            <Circle cx={c.cx} cy={c.cy} r={c.r} fill="none" stroke={theme.text} strokeWidth={1} />
            <Circle
              cx={c.cx}
              cy={c.cy}
              r={c.r * 0.55}
              fill="none"
              stroke={i === 0 ? theme.accent : theme.sea}
              strokeWidth={1}
            />
          </G>
        ))}
      </G>
      <Rect x={1} y={1} width={298} height={118} fill="none" stroke={theme.text} strokeWidth={1.5} />
    </Svg>
  );
}

export function ProjectCard({ projet }: { projet: Projet }) {
  const theme = useTheme();

  return (
    <Link href={{ pathname: '/projet/[id]', params: { id: projet.id } }} asChild>
      <Pressable style={StyleSheet.flatten([styles.card, { borderColor: theme.border, backgroundColor: theme.land }])}>
        <ProjectPlate id={projet.id} height={110} />
        <View style={styles.body}>
          <ThemedText type="kicker" themeColor="accent">
            {projet.filiere} · {projet.annee}
          </ThemedText>
          <ThemedText type="heading">{projet.titre}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {projet.resume}
          </ThemedText>
          <ThemedText type="italic" style={styles.authors}>
            {projet.eleves.join(', ')}
          </ThemedText>
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  body: {
    padding: Spacing.three,
    gap: Spacing.one,
  },
  authors: {
    fontSize: 15,
    lineHeight: 20,
  },
});
