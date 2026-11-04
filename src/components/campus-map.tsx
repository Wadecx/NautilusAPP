import { useState } from 'react';
import { Pressable, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  Line,
  Path,
  Pattern,
  Polygon,
  Rect,
  Text as SvgText,
} from 'react-native-svg';

import { ThemedText } from '@/components/themed-text';
import { Spacing, Typefaces, type Palette } from '@/constants/theme';
import { lieux, type Lieu } from '@/data/festival';
import { useTheme } from '@/hooks/use-theme';

// Le plan est dessiné dans un repère fixe ; il est ensuite ajusté à l'écran.
const VB_W = 1000;
const VB_H = 1300;
const MIN_SCALE = 1;
const MAX_SCALE = 4;

const CANAL = 'M70 28 C 95 260, 45 480, 72 700 S 60 1050, 80 1272';
const ALLEES = [
  'M500 1272 L500 372',
  'M110 670 L905 670',
  'M270 640 L270 670',
  'M725 640 L725 670',
  'M220 670 L220 780',
  'M620 300 L700 280',
  'M500 905 Q 590 905 650 945',
  'M500 1090 L350 1090',
].join(' ');
const BASSIN = { cx: 790, cy: 950, rx: 72, ry: 46 };

function clamp(value: number, min: number, max: number) {
  'worklet';
  return Math.min(Math.max(value, min), max);
}

function centre(lieu: Lieu) {
  return { x: lieu.x + lieu.w / 2, y: lieu.y + lieu.h / 2 };
}

/** Lieu sous un point du plan : emprise touchée, sinon repère le plus proche. */
function lieuAuPoint(x: number, y: number): Lieu | null {
  const touches = lieux.filter(
    (l) => x >= l.x - 16 && x <= l.x + l.w + 16 && y >= l.y - 16 && y <= l.y + l.h + 16
  );
  if (touches.length) return touches.sort((a, b) => a.w * a.h - b.w * b.h)[0];

  let best: Lieu | null = null;
  let bestDistance = 70;
  for (const l of lieux) {
    const c = centre(l);
    const d = Math.hypot(c.x - x, c.y - y);
    if (d < bestDistance) {
      best = l;
      bestDistance = d;
    }
  }
  return best;
}

type CampusMapProps = {
  selectedId: string | null;
  onSelect: (id: string | null) => void;
};

export function CampusMap({ selectedId, onSelect }: CampusMapProps) {
  const theme = useTheme();
  const [size, setSize] = useState({ width: 0, height: 0 });

  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const savedTx = useSharedValue(0);
  const savedTy = useSharedValue(0);
  const width = useSharedValue(0);
  const height = useSharedValue(0);

  const onLayout = (e: LayoutChangeEvent) => {
    const { width: w, height: h } = e.nativeEvent.layout;
    width.value = w;
    height.value = h;
    setSize({ width: w, height: h });
  };

  const clampTranslation = (s: number) => {
    'worklet';
    const maxX = (width.value * (s - 1)) / 2;
    const maxY = (height.value * (s - 1)) / 2;
    tx.value = clamp(tx.value, -maxX, maxX);
    ty.value = clamp(ty.value, -maxY, maxY);
  };

  const pinch = Gesture.Pinch()
    .onStart(() => {
      savedScale.value = scale.value;
      savedTx.value = tx.value;
      savedTy.value = ty.value;
    })
    .onUpdate((e) => {
      const next = clamp(savedScale.value * e.scale, MIN_SCALE, MAX_SCALE);
      // Garde le point entre les doigts immobile pendant le zoom.
      const fx = e.focalX - width.value / 2;
      const fy = e.focalY - height.value / 2;
      const ratio = next / savedScale.value;
      tx.value = fx - (fx - savedTx.value) * ratio;
      ty.value = fy - (fy - savedTy.value) * ratio;
      scale.value = next;
      clampTranslation(next);
    });

  const pan = Gesture.Pan()
    .minDistance(8)
    .onStart(() => {
      savedTx.value = tx.value;
      savedTy.value = ty.value;
    })
    .onUpdate((e) => {
      tx.value = savedTx.value + e.translationX;
      ty.value = savedTy.value + e.translationY;
      clampTranslation(scale.value);
    });

  const zoomTo = (next: number) => {
    const target = clamp(next, MIN_SCALE, MAX_SCALE);
    const ratio = target / scale.value;
    const maxX = (width.value * (target - 1)) / 2;
    const maxY = (height.value * (target - 1)) / 2;
    tx.value = withTiming(clamp(tx.value * ratio, -maxX, maxX));
    ty.value = withTiming(clamp(ty.value * ratio, -maxY, maxY));
    scale.value = withTiming(target);
  };

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .runOnJS(true)
    .onEnd(() => zoomTo(scale.value > 2.2 ? 1 : scale.value * 2));

  const singleTap = Gesture.Tap()
    .runOnJS(true)
    .onEnd((e) => {
      if (!size.width) return;
      // Écran → contenu non transformé → repère du plan.
      const cx = size.width / 2;
      const cy = size.height / 2;
      const px = cx + (e.x - cx - tx.value) / scale.value;
      const py = cy + (e.y - cy - ty.value) / scale.value;
      const fit = Math.min(size.width / VB_W, size.height / VB_H);
      const ox = (size.width - VB_W * fit) / 2;
      const oy = (size.height - VB_H * fit) / 2;
      const lieu = lieuAuPoint((px - ox) / fit, (py - oy) / fit);
      onSelect(lieu?.id ?? null);
    });

  const gesture = Gesture.Simultaneous(pinch, pan, Gesture.Exclusive(doubleTap, singleTap));

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }, { translateY: ty.value }, { scale: scale.value }],
  }));

  return (
    <View style={[styles.frame, { borderColor: theme.text, backgroundColor: theme.land }]}>
      <GestureDetector gesture={gesture}>
        <View style={styles.viewport} onLayout={onLayout} collapsable={false}>
          <Animated.View style={[StyleSheet.absoluteFill, animatedStyle]}>
            {size.width > 0 ? (
              <Svg
                width={size.width}
                height={size.height}
                viewBox={`0 0 ${VB_W} ${VB_H}`}
                preserveAspectRatio="xMidYMid meet">
                <MapDrawing theme={theme} selectedId={selectedId} />
              </Svg>
            ) : null}
          </Animated.View>
        </View>
      </GestureDetector>

      <View style={styles.controls}>
        <ZoomButton label="+" accessibilityLabel="Zoomer" onPress={() => zoomTo(scale.value * 1.6)} />
        <ZoomButton label="−" accessibilityLabel="Dézoomer" onPress={() => zoomTo(scale.value / 1.6)} />
        <ZoomButton label="⟲" accessibilityLabel="Recentrer le plan" onPress={() => zoomTo(1)} />
      </View>
    </View>
  );
}

function ZoomButton({
  label,
  accessibilityLabel,
  onPress,
}: {
  label: string;
  accessibilityLabel: string;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [
        styles.zoomButton,
        { borderColor: theme.text, backgroundColor: theme.background },
        pressed && { opacity: 0.6 },
      ]}>
      <ThemedText style={styles.zoomLabel}>{label}</ThemedText>
    </Pressable>
  );
}

/** Le dessin du plan, à la manière d'un levé topographique du XIXe siècle. */
function MapDrawing({ theme, selectedId }: { theme: Palette; selectedId: string | null }) {
  const ink = theme.text;

  return (
    <G>
      <Defs>
        <Pattern id="map-hatch" patternUnits="userSpaceOnUse" width={7} height={7} patternTransform="rotate(45)">
          <Line x1={0} y1={0} x2={0} y2={7} stroke={ink} strokeWidth={1.1} />
        </Pattern>
        <Pattern id="map-hatch-selected" patternUnits="userSpaceOnUse" width={7} height={7} patternTransform="rotate(45)">
          <Line x1={0} y1={0} x2={0} y2={7} stroke={theme.accent} strokeWidth={2.2} />
        </Pattern>
        <Pattern id="map-pave" patternUnits="userSpaceOnUse" width={18} height={18}>
          <Rect x={0} y={0} width={18} height={18} fill="none" stroke={theme.border} strokeWidth={0.8} />
        </Pattern>
      </Defs>

      <Rect x={0} y={0} width={VB_W} height={VB_H} fill={theme.land} />
      <GraduatedBorder ink={ink} paper={theme.land} />

      {/* Canal */}
      <Path d={CANAL} stroke={ink} strokeWidth={48} fill="none" />
      <Path d={CANAL} stroke={theme.land} strokeWidth={44} fill="none" />
      <Path d={CANAL} stroke={theme.sea} strokeOpacity={0.22} strokeWidth={44} fill="none" />
      {[-12, 0, 12].map((dx) => (
        <Path
          key={dx}
          d={CANAL}
          transform={`translate(${dx} ${dx * 1.7})`}
          stroke={theme.sea}
          strokeWidth={1.4}
          strokeDasharray="7 15"
          fill="none"
        />
      ))}
      <SvgText
        x={0}
        y={0}
        transform="translate(98 420) rotate(84)"
        fill={theme.sea}
        fontSize={22}
        fontFamily={Typefaces.headingItalic}
        letterSpacing={6}>
        Le Canal
      </SvgText>

      {/* Allées : deux traits fins, comme sur les levés anciens */}
      <Path d={ALLEES} stroke={ink} strokeWidth={30} fill="none" strokeLinecap="square" />
      <Path d={ALLEES} stroke={theme.land} strokeWidth={27} fill="none" strokeLinecap="square" />

      {/* Jardin et bassin */}
      <Garden theme={theme} />

      {/* Bâtiments */}
      {lieux.map((lieu) => (
        <Building key={lieu.id} lieu={lieu} theme={theme} selected={lieu.id === selectedId} />
      ))}

      {/* Entrée */}
      <Rect x={474} y={1250} width={10} height={10} fill={ink} />
      <Rect x={516} y={1250} width={10} height={10} fill={ink} />
      <SvgText x={540} y={1262} fill={ink} fontSize={20} fontFamily={Typefaces.display} letterSpacing={3}>
        Entrée
      </SvgText>

      <Cartouche theme={theme} />
      <CompassRose x={885} y={112} r={60} theme={theme} />
      <ScaleBar x={130} y={1225} theme={theme} />

      {/* Repères numérotés, dessinés en dernier pour rester au-dessus */}
      {lieux.map((lieu) => (
        <Marker key={lieu.id} lieu={lieu} theme={theme} selected={lieu.id === selectedId} />
      ))}
    </G>
  );
}

function GraduatedBorder({ ink, paper }: { ink: string; paper: string }) {
  const outer = 12;
  const inner = 28;
  const band = inner - outer;
  const segments: { x: number; y: number; w: number; h: number }[] = [];
  const horizontal = 16;
  const vertical = 21;
  const segW = (VB_W - inner * 2) / horizontal;
  const segH = (VB_H - inner * 2) / vertical;
  for (let i = 0; i < horizontal; i += 2) {
    segments.push({ x: inner + i * segW, y: outer, w: segW, h: band });
    segments.push({ x: inner + (i + 1) * segW, y: VB_H - inner, w: segW, h: band });
  }
  for (let i = 0; i < vertical; i += 2) {
    segments.push({ x: outer, y: inner + i * segH, w: band, h: segH });
    segments.push({ x: VB_W - inner, y: inner + (i + 1) * segH, w: band, h: segH });
  }

  return (
    <G>
      <Rect x={outer} y={outer} width={VB_W - outer * 2} height={VB_H - outer * 2} fill={paper} stroke={ink} strokeWidth={2} />
      {segments.map((s, i) => (
        <Rect key={i} x={s.x} y={s.y} width={s.w} height={s.h} fill={ink} />
      ))}
      <Rect x={inner} y={inner} width={VB_W - inner * 2} height={VB_H - inner * 2} fill={paper} stroke={ink} strokeWidth={1.5} />
      <Rect x={inner + 6} y={inner + 6} width={VB_W - (inner + 6) * 2} height={VB_H - (inner + 6) * 2} fill="none" stroke={ink} strokeWidth={0.6} />
    </G>
  );
}

const ARBRES_JARDIN = [
  [665, 845], [700, 838], [742, 850], [860, 842], [880, 880], [668, 890], [690, 935],
  [668, 980], [700, 1020], [742, 1038], [790, 1030], [835, 1040], [878, 1010], [884, 930],
] as const;

const ARBRES_ALLEE = [430, 470, 510, 550, 590, 630, 910, 960, 1010, 1050].flatMap((y) => [
  [470, y],
  [530, y],
]);

function Tree({ x, y, theme }: { x: number; y: number; theme: Palette }) {
  return (
    <G>
      <Circle cx={x + 3} cy={y + 3} r={10} fill={theme.text} opacity={0.18} />
      <Circle cx={x} cy={y} r={10} fill={theme.forest} fillOpacity={0.35} stroke={theme.text} strokeWidth={1.1} />
      <Path d={`M${x - 4} ${y - 2} q 4 -5 8 0`} stroke={theme.text} strokeWidth={0.8} fill="none" />
    </G>
  );
}

function Garden({ theme }: { theme: Palette }) {
  const { cx, cy, rx, ry } = BASSIN;
  return (
    <G>
      <Rect x={645} y={825} width={250} height={230} rx={18} fill="none" stroke={theme.forest} strokeWidth={1.5} strokeDasharray="2 6" />
      <Ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={theme.sea} fillOpacity={0.22} stroke={theme.text} strokeWidth={1.8} />
      {[0.78, 0.55, 0.32].map((k) => (
        <Ellipse key={k} cx={cx} cy={cy} rx={rx * k} ry={ry * k} fill="none" stroke={theme.sea} strokeWidth={1} strokeDasharray="5 6" />
      ))}
      {ARBRES_JARDIN.map(([x, y], i) => (
        <Tree key={`j${i}`} x={x} y={y} theme={theme} />
      ))}
      {ARBRES_ALLEE.map(([x, y], i) => (
        <Tree key={`a${i}`} x={x} y={y} theme={theme} />
      ))}
    </G>
  );
}

function Building({ lieu, theme, selected }: { lieu: Lieu; theme: Palette; selected: boolean }) {
  const { x, y, w, h } = lieu;
  const fill = selected ? 'url(#map-hatch-selected)' : 'url(#map-hatch)';
  const stroke = selected ? theme.accent : theme.text;
  const label = lieu.nom.split(' — ')[0];
  const labelRight = lieu.id === 'accueil';

  let shape = null;
  if (lieu.type === 'batiment') {
    shape = (
      <G>
        <Rect x={x + 7} y={y + 7} width={w} height={h} fill={theme.text} opacity={0.22} />
        <Rect x={x} y={y} width={w} height={h} fill={theme.land} />
        <Rect x={x} y={y} width={w} height={h} fill={fill} stroke={stroke} strokeWidth={selected ? 3.5 : 2} />
      </G>
    );
  } else if (lieu.type === 'amphi') {
    const d = `M${x} ${y + h} L${x + w} ${y + h} A${w / 2} ${h} 0 0 0 ${x} ${y + h} Z`;
    shape = (
      <G>
        <Path d={d} transform="translate(7 7)" fill={theme.text} opacity={0.22} />
        <Path d={d} fill={theme.land} />
        <Path d={d} fill={fill} stroke={stroke} strokeWidth={selected ? 3.5 : 2} />
        {[0.7, 0.45].map((k) => (
          <Path
            key={k}
            d={`M${x + (w * (1 - k)) / 2} ${y + h} A${(w * k) / 2} ${h * k} 0 0 1 ${x + w - (w * (1 - k)) / 2} ${y + h}`}
            fill={theme.land}
            stroke={stroke}
            strokeWidth={1}
          />
        ))}
      </G>
    );
  } else if (lieu.type === 'cour') {
    shape = (
      <G>
        <Rect x={x} y={y} width={w} height={h} fill={theme.land} />
        <Rect x={x} y={y} width={w} height={h} fill="url(#map-pave)" stroke={stroke} strokeWidth={selected ? 3.5 : 1.5} strokeDasharray="10 5" />
      </G>
    );
  }

  const labelProps = {
    x: labelRight ? x + w + 14 : x + w / 2,
    y: labelRight ? y + h / 2 + 7 : y + h + 26,
    textAnchor: labelRight ? ('start' as const) : ('middle' as const),
    fontSize: 21,
    fontFamily: Typefaces.headingItalic,
  };

  return (
    <G>
      {shape}
      {/* Halo couleur papier sous l'étiquette, pour la détacher des arbres et allées */}
      <SvgText {...labelProps} fill={theme.land} stroke={theme.land} strokeWidth={5}>
        {label}
      </SvgText>
      <SvgText {...labelProps} fill={selected ? theme.accent : theme.text}>
        {label}
      </SvgText>
    </G>
  );
}

function Marker({ lieu, theme, selected }: { lieu: Lieu; theme: Palette; selected: boolean }) {
  const c = lieu.type === 'jardin' ? { x: BASSIN.cx, y: BASSIN.cy } : centre(lieu);
  const r = selected ? 26 : 20;
  return (
    <G>
      {selected ? <Circle cx={c.x} cy={c.y} r={36} fill="none" stroke={theme.accent} strokeWidth={2} strokeDasharray="4 4" /> : null}
      <Circle cx={c.x} cy={c.y} r={r} fill={theme.accent} stroke={theme.land} strokeWidth={3} />
      <SvgText
        x={c.x}
        y={c.y + (selected ? 9 : 7)}
        textAnchor="middle"
        fill={theme.land}
        fontSize={selected ? 26 : 21}
        fontFamily={Typefaces.heading}>
        {String(lieu.numero)}
      </SvgText>
    </G>
  );
}

function Cartouche({ theme }: { theme: Palette }) {
  return (
    <G>
      <Rect x={58} y={52} width={300} height={118} fill={theme.land} stroke={theme.text} strokeWidth={2} />
      <Rect x={65} y={59} width={286} height={104} fill="none" stroke={theme.text} strokeWidth={0.7} />
      <SvgText x={208} y={98} textAnchor="middle" fill={theme.text} fontSize={30} fontFamily={Typefaces.display} letterSpacing={2}>
        Plan du Campus
      </SvgText>
      <SvgText x={208} y={126} textAnchor="middle" fill={theme.text} fontSize={18} fontFamily={Typefaces.headingItalic}>
        levé pour le Festival Nautilus
      </SvgText>
      <SvgText x={208} y={151} textAnchor="middle" fill={theme.accent} fontSize={15} fontFamily={Typefaces.display} letterSpacing={3}>
        MDCCCLXXXVII — MMXXVI
      </SvgText>
    </G>
  );
}

function CompassRose({ x, y, r, theme }: { x: number; y: number; r: number; theme: Palette }) {
  const ink = theme.text;
  const branch = (angle: number, length: number, width: number) => {
    const rad = (angle * Math.PI) / 180;
    const tip = { x: x + Math.sin(rad) * length, y: y - Math.cos(rad) * length };
    const left = { x: x + Math.sin(rad - Math.PI / 2) * width, y: y - Math.cos(rad - Math.PI / 2) * width };
    const right = { x: x + Math.sin(rad + Math.PI / 2) * width, y: y - Math.cos(rad + Math.PI / 2) * width };
    return (
      <G key={angle}>
        <Polygon points={`${x},${y} ${tip.x},${tip.y} ${left.x},${left.y}`} fill={ink} />
        <Polygon points={`${x},${y} ${tip.x},${tip.y} ${right.x},${right.y}`} fill={theme.land} stroke={ink} strokeWidth={1} />
      </G>
    );
  };

  return (
    <G>
      <Circle cx={x} cy={y} r={r * 0.82} fill="none" stroke={ink} strokeWidth={1} />
      <Circle cx={x} cy={y} r={r * 0.74} fill="none" stroke={ink} strokeWidth={0.5} strokeDasharray="2 3" />
      {[45, 135, 225, 315].map((a) => branch(a, r * 0.6, r * 0.12))}
      {[0, 90, 180, 270].map((a) => branch(a, r, r * 0.16))}
      <Circle cx={x} cy={y} r={4} fill={theme.accent} />
      <SvgText x={x} y={y - r - 8} textAnchor="middle" fill={theme.accent} fontSize={22} fontFamily={Typefaces.display}>
        N
      </SvgText>
    </G>
  );
}

function ScaleBar({ x, y, theme }: { x: number; y: number; theme: Palette }) {
  const seg = 45;
  return (
    <G>
      {[0, 1, 2, 3].map((i) => (
        <Rect key={i} x={x + i * seg} y={y} width={seg} height={9} fill={i % 2 ? theme.land : theme.text} stroke={theme.text} strokeWidth={1} />
      ))}
      {[0, 50, 100].map((m, i) => (
        <SvgText key={m} x={x + i * seg * 2} y={y + 30} textAnchor="middle" fill={theme.text} fontSize={15} fontFamily={Typefaces.heading}>
          {String(m)}
        </SvgText>
      ))}
      <SvgText x={x + seg * 4 + 14} y={y + 10} fill={theme.text} fontSize={16} fontFamily={Typefaces.headingItalic}>
        mètres
      </SvgText>
    </G>
  );
}

const styles = StyleSheet.create({
  frame: {
    flex: 1,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  viewport: {
    flex: 1,
    overflow: 'hidden',
  },
  controls: {
    position: 'absolute',
    right: Spacing.two,
    bottom: Spacing.two,
    gap: Spacing.one,
  },
  zoomButton: {
    width: 40,
    height: 40,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomLabel: {
    fontSize: 22,
    lineHeight: 26,
  },
});
