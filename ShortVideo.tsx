import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";

export const shortVideoSchema = z.object({
  scenes: z.array(
    z.object({
      imageUrl: z.string(),
      text: z.string(),
    })
  ),
  audioUrl: z.string().optional(),
});

type Props = z.infer<typeof shortVideoSchema>;

const Scene: React.FC<{ imageUrl: string; text: string }> = ({
  imageUrl,
  text,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // slow Ken Burns zoom over the scene's duration
  const scale = interpolate(frame, [0, durationInFrames], [1, 1.12], {
    extrapolateRight: "clamp",
  });

  // fade in/out
  const opacity = interpolate(
    frame,
    [0, 10, durationInFrames - 10, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ opacity, backgroundColor: "black" }}>
      <Img
        src={imageUrl}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${scale})`,
        }}
      />
      <AbsoluteFill
        style={{
          justifyContent: "flex-end",
          alignItems: "center",
          paddingBottom: 180,
          paddingLeft: 60,
          paddingRight: 60,
        }}
      >
        <div
          style={{
            fontFamily: "Arial, sans-serif",
            fontSize: 54,
            fontWeight: 800,
            color: "white",
            textAlign: "center",
            textShadow: "0 4px 12px rgba(0,0,0,0.85)",
            lineHeight: 1.3,
          }}
        >
          {text}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const ShortVideo: React.FC<Props> = ({ scenes, audioUrl }) => {
  const { fps } = useVideoConfig();
  const secondsPerScene = 3;
  const framesPerScene = fps * secondsPerScene;

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      {audioUrl ? <Audio src={audioUrl} /> : null}
      {scenes.map((scene, i) => (
        <Sequence
          key={i}
          from={i * framesPerScene}
          durationInFrames={framesPerScene}
        >
          <Scene imageUrl={scene.imageUrl} text={scene.text} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
