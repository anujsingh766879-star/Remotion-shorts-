import React from "react";
import { Composition } from "remotion";
import { ShortVideo, shortVideoSchema } from "./ShortVideo";

const FPS = 30;
const SECONDS_PER_SCENE = 3;

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="ShortVideo"
      component={ShortVideo}
      durationInFrames={FPS * SECONDS_PER_SCENE * 5}
      fps={FPS}
      width={1080}
      height={1920}
      schema={shortVideoSchema}
      defaultProps={{
        scenes: [
          {
            imageUrl: "https://picsum.photos/seed/1/1080/1920",
            text: "Sample scene text goes here",
          },
        ],
        audioUrl: "",
      }}
      calculateMetadata={({ props }) => {
        const sceneCount = Math.max(props.scenes.length, 1);
        return {
          durationInFrames: FPS * SECONDS_PER_SCENE * sceneCount,
        };
      }}
    />
  );
};
