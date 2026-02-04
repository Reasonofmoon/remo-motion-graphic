import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';

interface MatteSciFiProps {
    title: string;
    subtitle: string;
    backgroundImage?: string;
}

export const MatteSciFiComposition: React.FC<MatteSciFiProps> = ({ title, subtitle, backgroundImage }) => {
    const frame = useCurrentFrame();
    const { fps, width, height } = useVideoConfig();

    // 1. Background Animation (Subtle Zoom & Pan)
    const scale = interpolate(frame, [0, 150], [1, 1.1]);
    const opacity = interpolate(frame, [0, 30], [0, 1]);

    // 2. Title Animation (Cinematic Fade Up)
    const titleY = spring({
        frame: frame - 10,
        fps,
        from: 50,
        to: 0,
        config: { damping: 12 },
    });
    const titleOpacity = interpolate(frame, [10, 40], [0, 1]);

    // 3. Subtitle Animation (Delayed Fade Up)
    const subtitleY = spring({
        frame: frame - 30,
        fps,
        from: 30,
        to: 0,
        config: { damping: 12 },
    });
    const subtitleOpacity = interpolate(frame, [30, 60], [0, 1]);

    // 4. "Frosted Glass" Overlay Logic
    // We simulate frosted glass using backdrop-filter logic if supported, or semi-transparent whites/gradients.
    
    return (
        <AbsoluteFill style={{ 
            backgroundColor: '#0a0a0a', 
            justifyContent: 'center', 
            alignItems: 'center',
            overflow: 'hidden',
        }}>
            {/* Layer 0: Background Texture/Image */}
            <AbsoluteFill style={{ transform: `scale(${scale})` }}>
                {backgroundImage ? (
                    <img 
                        src={backgroundImage} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} 
                        alt="bg" 
                    />
                ) : (
                    // Default Matte Sci-Fi Gradient Background
                    <div style={{
                        width: '100%',
                        height: '100%',
                        background: 'radial-gradient(circle at 50% 50%, #2a2a2a 0%, #000000 100%)',
                    }}>
                        {/* Animated Orbs/Shapes simulation */}
                         <div style={{
                            position: 'absolute',
                            top: '20%',
                            left: '20%',
                            width: '400px',
                            height: '400px',
                            background: 'radial-gradient(circle, rgba(100,100,255,0.1) 0%, rgba(0,0,0,0) 70%)',
                            borderRadius: '50%',
                            filter: 'blur(40px)',
                            transform: `translate(${Math.sin(frame/40) * 20}px, ${Math.cos(frame/50) * 20}px)`
                        }} />
                         <div style={{
                            position: 'absolute',
                            bottom: '10%',
                            right: '10%',
                            width: '500px',
                            height: '500px',
                            background: 'radial-gradient(circle, rgba(200,200,255,0.05) 0%, rgba(0,0,0,0) 70%)',
                            borderRadius: '50%',
                            filter: 'blur(60px)',
                            transform: `translate(${Math.sin(frame/60) * -30}px, ${Math.cos(frame/40) * 30}px)`
                        }} />
                    </div>
                )}
            </AbsoluteFill>

            {/* Layer 1: Geometric Overlay (Holographic Lines) */}
            <AbsoluteFill style={{ opacity: 0.3, pointerEvents: 'none' }}>
                <svg width="100%" height="100%">
                    <line x1="0" y1="200" x2={width} y2="200" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                    <line x1="0" y1={height - 200} x2={width} y2={height - 200} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                    {/* Animated scanning line */}
                    <line x1="0" y1={interpolate(frame, [0, 150], [0, height])} x2={width} y2={interpolate(frame, [0, 150], [0, height])} stroke="rgba(255,255,255,0.05)" strokeWidth="2" />
                </svg>
            </AbsoluteFill>

            {/* Layer 2: Main Typography Container (Frosted Glass Effect) */}
            <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                padding: '60px 100px',
                borderRadius: '4px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                transform: `translateY(${titleY}px)`,
                opacity: titleOpacity,
            }}>
                <h1 style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '120px',
                    fontWeight: 800,
                    margin: 0,
                    color: 'transparent',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    backgroundImage: 'linear-gradient(135deg, #ffffff 0%, #a0a0a0 100%)',
                    letterSpacing: '-2px',
                    textShadow: '0 10px 30px rgba(0,0,0,0.3)',
                    textTransform: 'uppercase',
                }}>
                    {title}
                </h1>
                
                <h2 style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '32px',
                    fontWeight: 400,
                    marginTop: '20px',
                    color: 'rgba(255,255,255,0.8)',
                    letterSpacing: '4px',
                    textTransform: 'uppercase',
                    transform: `translateY(${subtitleY}px)`,
                    opacity: subtitleOpacity,
                }}>
                    {subtitle}
                </h2>
                
                {/* Decorative Element: Neural Vein Line */}
                <div style={{
                    width: '100px',
                    height: '2px',
                    background: 'linear-gradient(90deg, transparent, #00f0ff, transparent)',
                    marginTop: '40px',
                    opacity: interpolate(frame, [50, 80], [0, 1]),
                }} />
            </div>

            {/* Layer 3: Cinematic Grain/Overlay (Optional) */}
            <AbsoluteFill style={{
                backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' opacity=\'0.05\'/%3E%3C/svg%3E")',
                opacity: 0.4,
                mixBlendMode: 'overlay',
                pointerEvents: 'none',
            }} />
        </AbsoluteFill>
    );
};
