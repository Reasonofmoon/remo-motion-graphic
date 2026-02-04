import React from 'react';
import { Composition } from 'remotion';
import { MatteSciFiComposition } from './MatteSciFiComposition';
import { KineticTypographyComposition } from './KineticTypographyComposition';

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
                durationInFrames={1100} // Increased for longer script
                fps={30}
                width={1920}
                height={1080}
            />
        </>
    );
};
