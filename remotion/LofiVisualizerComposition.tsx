import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, useVideoConfig, Audio, Sequence } from 'remotion';

interface LofiVisualizerProps {
    title: string;
    mood: 'chill' | 'melancholic' | 'dreamy';
    audioUrl?: string;
}

// Mood-based color themes
const MOOD_THEMES = {
    chill: {
        primary: '#F4A261',    // Warm orange
        secondary: '#2A9D8F',  // Teal
        bg: '#1a1a2e',         // Dark blue
        accent: '#E76F51',     // Coral
    },
    melancholic: {
        primary: '#6C5CE7',    // Purple
        secondary: '#74B9FF',  // Light blue
        bg: '#0f0f1a',         // Deep dark
        accent: '#A29BFE',     // Lavender
    },
    dreamy: {
        primary: '#FF6B9D',    // Pink
        secondary: '#C44569',  // Rose
        bg: '#1a0a1a',         // Dark purple
        accent: '#F8B500',     // Gold
    },
};

// Particle component for background ambiance
const Particle: React.FC<{ index: number; frame: number; theme: typeof MOOD_THEMES.chill }> = ({ index, frame, theme }) => {
    const seed = index * 137.5;
    const x = (Math.sin(seed) + 1) * 50;
    const y = (Math.cos(seed * 1.3) + 1) * 50;
    const size = 2 + (index % 5);
    const speed = 0.3 + (index % 10) * 0.05;
    
    const floatY = Math.sin(frame * speed / 30 + seed) * 20;
    const floatX = Math.cos(frame * speed / 40 + seed) * 10;
    const opacity = interpolate(
        Math.sin(frame * 0.03 + seed),
        [-1, 1],
        [0.1, 0.5]
    );

    return (
        <div
            style={{
                position: 'absolute',
                left: `${x}%`,
                top: `${y}%`,
                width: size,
                height: size,
                borderRadius: '50%',
                backgroundColor: index % 2 === 0 ? theme.primary : theme.secondary,
                opacity,
                transform: `translate(${floatX}px, ${floatY}px)`,
                filter: 'blur(1px)',
            }}
        />
    );
};

// Rain drop effect for melancholic mood
const RainDrop: React.FC<{ index: number; frame: number; width: number; height: number }> = ({ index, frame, width, height }) => {
    const startX = (index * 47) % width;
    const speed = 3 + (index % 5);
    const y = ((frame * speed + index * 100) % (height + 100)) - 50;
    const opacity = 0.3 + (index % 3) * 0.1;

    return (
        <div
            style={{
                position: 'absolute',
                left: startX,
                top: y,
                width: 1,
                height: 15 + (index % 10),
                background: 'linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0.3))',
                opacity,
            }}
        />
    );
};

// Audio visualizer bars (simulated)
const VisualizerBar: React.FC<{ index: number; frame: number; theme: typeof MOOD_THEMES.chill }> = ({ index, frame, theme }) => {
    const barCount = 32;
    const width = 1920 / barCount - 4;
    
    // Simulate audio amplitude with multiple sine waves
    const amplitude = 
        Math.sin(frame * 0.15 + index * 0.5) * 20 +
        Math.sin(frame * 0.1 + index * 0.3) * 30 +
        Math.cos(frame * 0.08 + index * 0.7) * 25 +
        50;
    
    const height = Math.max(10, Math.abs(amplitude) * 1.5);
    const glowOpacity = interpolate(height, [10, 100], [0.3, 0.8]);

    return (
        <div
            style={{
                position: 'absolute',
                bottom: 100,
                left: index * (1920 / barCount) + 2,
                width,
                height,
                background: `linear-gradient(to top, ${theme.primary}CC, ${theme.secondary}88)`,
                borderRadius: '4px 4px 0 0',
                boxShadow: `0 0 20px ${theme.primary}${Math.floor(glowOpacity * 255).toString(16).padStart(2, '0')}`,
            }}
        />
    );
};

export const LofiVisualizerComposition: React.FC<LofiVisualizerProps> = ({ 
    title, 
    mood = 'chill',
    audioUrl 
}) => {
    const frame = useCurrentFrame();
    const { fps, width, height, durationInFrames } = useVideoConfig();
    const theme = MOOD_THEMES[mood];

    // Title fade in/out
    const titleOpacity = interpolate(
        frame,
        [0, 30, durationInFrames - 30, durationInFrames],
        [0, 1, 1, 0]
    );

    // Subtle camera movement
    const scale = interpolate(frame, [0, durationInFrames], [1, 1.05]);
    const panX = Math.sin(frame / 200) * 20;

    // Vinyl rotation
    const rotation = (frame / fps) * 33.33; // 33⅓ RPM

    return (
        <AbsoluteFill style={{ backgroundColor: theme.bg, overflow: 'hidden' }}>
            {/* Audio (if provided) */}
            {audioUrl && (
                <Sequence from={0}>
                    <Audio src={audioUrl} />
                </Sequence>
            )}

            {/* Background with subtle movement */}
            <AbsoluteFill style={{ 
                transform: `scale(${scale}) translateX(${panX}px)`,
            }}>
                {/* Gradient overlay */}
                <div style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    background: `radial-gradient(circle at 30% 30%, ${theme.secondary}20 0%, transparent 50%),
                                 radial-gradient(circle at 70% 70%, ${theme.primary}15 0%, transparent 50%)`,
                }} />

                {/* Floating particles */}
                {Array.from({ length: 40 }).map((_, i) => (
                    <Particle key={i} index={i} frame={frame} theme={theme} />
                ))}

                {/* Rain effect for melancholic mood */}
                {mood === 'melancholic' && Array.from({ length: 100 }).map((_, i) => (
                    <RainDrop key={i} index={i} frame={frame} width={width} height={height} />
                ))}
            </AbsoluteFill>

            {/* Vinyl record (center) */}
            <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
                width: 400,
                height: 400,
            }}>
                <div style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    background: `conic-gradient(from 0deg, #111 0%, #333 30%, #111 60%, #333 100%)`,
                    boxShadow: `0 0 60px ${theme.primary}40, inset 0 0 80px rgba(0,0,0,0.8)`,
                }}>
                    {/* Center label */}
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 120,
                        height: 120,
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <span style={{
                            fontFamily: 'Inter, sans-serif',
                            fontSize: 14,
                            color: 'white',
                            fontWeight: 600,
                            textAlign: 'center',
                        }}>
                            ◉ LOFI
                        </span>
                    </div>
                    {/* Grooves */}
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            width: 160 + i * 25,
                            height: 160 + i * 25,
                            borderRadius: '50%',
                            border: '1px solid rgba(50,50,50,0.5)',
                            transform: 'translate(-50%, -50%)',
                        }} />
                    ))}
                </div>
            </div>

            {/* Audio Visualizer Bars */}
            {Array.from({ length: 32 }).map((_, i) => (
                <VisualizerBar key={i} index={i} frame={frame} theme={theme} />
            ))}

            {/* Title Overlay */}
            <div style={{
                position: 'absolute',
                top: 80,
                left: 80,
                opacity: titleOpacity,
            }}>
                <h1 style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 48,
                    fontWeight: 700,
                    color: 'white',
                    margin: 0,
                    textShadow: `0 4px 30px ${theme.primary}80`,
                }}>
                    {title}
                </h1>
                <div style={{
                    marginTop: 16,
                    fontSize: 18,
                    color: 'rgba(255,255,255,0.6)',
                    fontFamily: 'Inter, sans-serif',
                    textTransform: 'uppercase',
                    letterSpacing: 4,
                }}>
                    lofi · {mood} · beats
                </div>
            </div>

            {/* Grain overlay */}
            <AbsoluteFill style={{
                backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' opacity=\'0.03\'/%3E%3C/svg%3E")',
                opacity: 0.5,
                mixBlendMode: 'overlay',
                pointerEvents: 'none',
            }} />

            {/* Vignette */}
            <div style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)',
                pointerEvents: 'none',
            }} />
        </AbsoluteFill>
    );
};
