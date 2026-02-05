import React from 'react';
import { Composition } from 'remotion';
import { MatteSciFiComposition } from './MatteSciFiComposition';
import { KineticTypographyComposition } from './KineticTypographyComposition';
import { LofiVisualizerComposition } from './LofiVisualizerComposition';

export const RemotionRoot: React.FC = () => {
    return (
        <>
            <Composition
                id="MatteSciFi"
                component={MatteSciFiComposition}
                durationInFrames={150}
                fps={30}
                width={1920}
                height={1080}
                defaultProps={{
                    title: "NotebookLM A to Z",
                    subtitle: "Reading Weapon for Non-Readers",
                    backgroundImage: undefined,
                }}
            />
            <Composition
                id="PromoVideo"
                component={KineticTypographyComposition}
                durationInFrames={1100}
                fps={30}
                width={1920}
                height={1080}
            />
            <Composition
                id="LofiVisualizer"
                component={LofiVisualizerComposition}
                durationInFrames={300} // 10 seconds at 30fps (loopable)
                fps={30}
                width={1920}
                height={1080}
                defaultProps={{
                    title: "Midnight Lofi Sessions",
                    mood: "chill" as const,
                    audioUrl: undefined,
                }}
            />
        </>
    );
};
