import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';

const FONT_FAMILY = 'Inter, sans-serif';

const PROMO_COPY = [
    // Part 1: Who is He (Authority - Gold/Dark)
    { text: "송세훈", sub: "달의이성", type: "authority" },
    { text: "25년", sub: "교육 현장", type: "authority" },
    { text: "현업 AI", sub: "엔지니어", type: "authority" },
    { text: "에듀테크", sub: "수석 기획", type: "authority" },
    { text: "프롬프트", sub: "설계자", type: "authority" },

    // Part 2: The Solution (Tech - Cyan/Glitch)
    { text: "언어 본질의", sub: "기술", type: "tech" },
    { text: "지문 분석", sub: "자동화", type: "tech" },
    { text: "출처 기반", sub: "무결점", type: "impact" },
    { text: "선생님의 시간", sub: "가치 있게", type: "authority" },

    // Part 3: Automation (Impact - Black/White)
    { text: "수업 자료", sub: "1분 컷", type: "fear" }, // Uses red/danger style for speed emphasis
    { text: "고퀄리티", sub: "시각화", type: "tech" },
    { text: "데이터의", sub: "강의화", type: "tech" },
    { text: "가장 안전한", sub: "AI", type: "impact" },
    { text: "지금", sub: "시작하세요", type: "impact" },

    // One Liner
    { text: "기술보다", sub: "안목이 먼저", type: "hero" },

    // Trinity Intro
    { text: "NotebookLM", sub: "Total Package", type: "tech" },
    { text: "단순한 도구가", sub: "아님", type: "fear" },
    { text: "AI 역량의", sub: "총집합", type: "impact" },

    // Pillar 1: Source
    { text: "Source", sub: "Data Science", type: "tech" },
    { text: "데이터가", sub: "곧 권력", type: "tech" },
    { text: "지식의", sub: "구조화", type: "tech" },

    // Pillar 2: Chat
    { text: "Chat", sub: "Prompt Eng.", type: "tech" },
    { text: "질문하는", sub: "힘", type: "tech" },
    { text: "AI와", sub: "대화하는 법", type: "tech" },

    // Pillar 3: Studio
    { text: "Studio", sub: "Multimodal", type: "tech" },
    { text: "오감을", sub: "깨우다", type: "tech" },
    { text: "강의의", sub: "시각화", type: "tech" },

    // Closing
    { text: "이걸 모르면", sub: "뒤처집니다", type: "fear" },
    { text: "AI 리터러시의", sub: "끝", type: "hero" },
];

const TextSlide: React.FC<{ 
    main: string; 
    sub: string; 
    type: string; 
    duration: number; 
}> = ({ main, sub, type, duration }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Animations
    const scale = spring({
        frame,
        fps,
        from: 1.5,
        to: 1,
        config: { damping: 15, stiffness: 200 }
    });

    const opacity = interpolate(frame, [0, 5, duration - 5, duration], [0, 1, 1, 0]);
    
    // Style logic based on type
    const isImpact = type === 'impact' || type === 'hero';
    const isFear = type === 'fear';
    const isTech = type === 'tech';
    const isAuthority = type === 'authority';

    let bg = '#000000';
    let color = '#ffffff';

    if (isImpact) { bg = '#ffffff'; color = '#000000'; }
    if (isFear) { bg = '#1a0505'; color = '#ff3333'; }
    if (isTech) { bg = '#050a1a'; color = '#00f0ff'; }
    if (isAuthority) { bg = '#0f0f15'; color = '#eccfa1'; } // Gold/Dark

    return (
        <AbsoluteFill style={{ 
            backgroundColor: bg, 
            justifyContent: 'center', 
            alignItems: 'center',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <div style={{
                opacity,
                transform: `scale(${scale})`,
                textAlign: 'center',
                width: '100%',
            }}>
                <h1 style={{
                    fontFamily: FONT_FAMILY,
                    fontSize: isImpact ? '180px' : '140px',
                    fontWeight: 900,
                    margin: 0,
                    color: color,
                    lineHeight: 0.9,
                    letterSpacing: isTech ? '-5px' : '-2px',
                    textTransform: 'uppercase',
                    textShadow: isImpact ? 'none' : `0 10px 30px ${isFear ? 'rgba(255,0,0,0.3)' : 'rgba(0,0,0,0.5)'}`,
                }}>
                    {main}
                </h1>
                {sub && (
                    <h2 style={{
                        fontFamily: FONT_FAMILY,
                        fontSize: isImpact ? '60px' : '50px',
                        fontWeight: 400,
                        margin: '20px 0 0 0',
                        color: color,
                        opacity: 0.8,
                        letterSpacing: '10px'
                    }}>
                        {sub}
                    </h2>
                )}
            </div>
            
            {/* Tech Glitch Overlay */}
            {isTech && (
                <div style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 240, 255, 0.1) 3px)',
                    pointerEvents: 'none'
                }} />
            )}
        </AbsoluteFill>
    );
};

export const KineticTypographyComposition: React.FC = () => {
    let currentFrame = 0;

    return (
        <AbsoluteFill style={{ backgroundColor: 'black' }}>
            {PROMO_COPY.map((item, index) => {
                let duration = 35; // Default fast
                if (item.type === 'fear') duration = 25; // Very fast
                if (item.type === 'authority') duration = 50; // Slow, respectful
                if (item.type === 'tech') duration = 40;
                if (item.type === 'impact') duration = 45;
                if (item.type === 'hero') duration = 90; // Long hold at end

                const start = currentFrame;
                currentFrame += duration;

                return (
                    <Sequence key={index} from={start} durationInFrames={duration}>
                        <TextSlide 
                            main={item.text} 
                            sub={item.sub} 
                            type={item.type} 
                            duration={duration} 
                        />
                    </Sequence>
                );
            })}
        </AbsoluteFill>
    );
};
