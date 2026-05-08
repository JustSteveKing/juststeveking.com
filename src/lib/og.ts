import satori from 'satori';
import sharp from 'sharp';

const fontCache = new Map<string, ArrayBuffer>();

async function loadFont(family: 'inter' | 'ibm-plex-mono', weight: 400 | 700): Promise<ArrayBuffer> {
  const key = `${family}-${weight}`;
  if (fontCache.has(key)) return fontCache.get(key)!;

  const url = family === 'inter'
    ? `https://cdn.jsdelivr.net/npm/@fontsource/inter@5.2.6/files/inter-latin-${weight}-normal.woff`
    : `https://cdn.jsdelivr.net/npm/@fontsource/ibm-plex-mono@5.1.1/files/ibm-plex-mono-latin-${weight}-normal.woff`;

  const data = await fetch(url).then(r => r.arrayBuffer());
  fontCache.set(key, data);
  return data;
}

// Catppuccin Macchiato
const C = {
  base:     '#24273a',
  mantle:   '#1e2030',
  surface0: '#363a4f',
  surface1: '#494d64',
  overlay0: '#6e738d',
  subtext0: '#a5adcb',
  text:     '#cad3f5',
  mauve:    '#c6a0f6',
  border:   'rgba(202,211,245,0.12)',
  borderStrong: 'rgba(202,211,245,0.20)',
} as const;

const formatCollectionLabel = (value: string): string =>
  value
    .split(/[\/-]/)
    .filter(Boolean)
    .map(part => part[0]?.toUpperCase() + part.slice(1))
    .join(' ');

export interface OgOptions {
  title: string;
  description?: string;
  collection: string;
}

export async function generateOgImage({ title, description, collection }: OgOptions): Promise<Buffer> {
  const [interRegular, interBold, monoRegular] = await Promise.all([
    loadFont('inter', 400),
    loadFont('inter', 700),
    loadFont('ibm-plex-mono', 400),
  ]);

  const displayTitle = title.length > 80 ? title.slice(0, 80) + '…' : title;
  const displayDesc = description
    ? description.length > 140 ? description.slice(0, 140) + '…' : description
    : null;
  const collectionLabel = formatCollectionLabel(collection);

  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          backgroundColor: C.base,
          padding: '0',
          fontFamily: 'Inter',
          position: 'relative',
        },
        children: [
          // Outer border frame
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                inset: '0',
                border: `1px solid ${C.borderStrong}`,
                margin: '20px',
                borderRadius: '12px',
              },
            },
          },
          // Top bar (accent stripe)
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                top: '20px',
                left: '20px',
                right: '20px',
                height: '3px',
                backgroundColor: C.mauve,
                borderRadius: '12px 12px 0 0',
              },
            },
          },
          // Content wrapper
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                padding: '56px 64px',
                gap: '0',
              },
              children: [
                // Header row
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '0',
                    },
                    children: [
                      // Name + dot
                      {
                        type: 'div',
                        props: {
                          style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                          },
                          children: [
                            {
                              type: 'div',
                              props: {
                                style: {
                                  width: '10px',
                                  height: '10px',
                                  borderRadius: '9999px',
                                  backgroundColor: C.mauve,
                                },
                              },
                            },
                            {
                              type: 'span',
                              props: {
                                style: {
                                  fontFamily: 'Inter',
                                  fontSize: '20px',
                                  fontWeight: 700,
                                  color: C.text,
                                  letterSpacing: '-0.01em',
                                },
                                children: 'Steve McDougall',
                              },
                            },
                          ],
                        },
                      },
                      // Collection badge
                      {
                        type: 'span',
                        props: {
                          style: {
                            fontFamily: 'IBM Plex Mono',
                            fontSize: '12px',
                            fontWeight: 400,
                            color: C.mauve,
                            backgroundColor: C.surface0,
                            border: `1px solid ${C.border}`,
                            padding: '5px 12px',
                            borderRadius: '4px',
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                          },
                          children: collectionLabel,
                        },
                      },
                    ],
                  },
                },
                // Main content (title + description) — vertically centred
                {
                  type: 'div',
                  props: {
                    style: {
                      flex: '1',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      gap: '20px',
                    },
                    children: [
                      {
                        type: 'div',
                        props: {
                          style: {
                            fontFamily: 'Inter',
                            fontSize: displayTitle.length > 55 ? '52px' : '62px',
                            fontWeight: 700,
                            color: C.text,
                            lineHeight: 1.06,
                            letterSpacing: '-0.03em',
                            maxWidth: '1060px',
                          },
                          children: displayTitle,
                        },
                      },
                      ...(displayDesc ? [{
                        type: 'div',
                        props: {
                          style: {
                            fontFamily: 'Inter',
                            fontSize: '22px',
                            fontWeight: 400,
                            color: C.subtext0,
                            lineHeight: 1.5,
                            maxWidth: '940px',
                          },
                          children: displayDesc,
                        },
                      }] : []),
                    ],
                  },
                },
                // Footer
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderTop: `1px solid ${C.border}`,
                      paddingTop: '20px',
                    },
                    children: [
                      {
                        type: 'span',
                        props: {
                          style: {
                            fontFamily: 'IBM Plex Mono',
                            fontSize: '14px',
                            fontWeight: 400,
                            color: C.overlay0,
                            letterSpacing: '0.02em',
                          },
                          children: 'juststeveking.com',
                        },
                      },
                      {
                        type: 'span',
                        props: {
                          style: {
                            fontFamily: 'IBM Plex Mono',
                            fontSize: '12px',
                            fontWeight: 400,
                            color: C.surface1,
                            letterSpacing: '0.06em',
                            textTransform: 'uppercase',
                          },
                          children: 'Developer · Educator · Consultant',
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    } as Parameters<typeof satori>[0],
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: 'Inter', data: interRegular, weight: 400, style: 'normal' },
        { name: 'Inter', data: interBold, weight: 700, style: 'normal' },
        { name: 'IBM Plex Mono', data: monoRegular, weight: 400, style: 'normal' },
      ],
    },
  );

  return sharp(Buffer.from(svg)).webp({ quality: 90 }).toBuffer();
}
