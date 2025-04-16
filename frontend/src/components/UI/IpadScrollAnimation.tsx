// IpadScrollAnimation.jsx
import  { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ScrollControls, useScroll, Html } from '@react-three/drei';
import * as THREE from 'three';

const IpadAnimation = () => {
  const groupRef = useRef<THREE.Group>(null);
  const scroll = useScroll();

  // Animate the iPad scene on every frame based on scroll offset
  useFrame(() => {
    if (!groupRef.current) return;
    const offset = scroll.offset; // offset ranges from 0 to 1

    // Example animations:
    // 1. Rotate the iPad around the X axis
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      (1 - offset) * Math.PI * 0.2, // full rotation as you scroll
      0.1
    );

    // 2. Move the iPad along the Y axis slightly
    groupRef.current.position.y = THREE.MathUtils.lerp(
      groupRef.current.position.y,
      offset * 0.5, // adjust amplitude as needed
      0.1
    );

    // 3. Optionally, you can animate scale or other properties here
    // groupRef.current.scale.setScalar(THREE.MathUtils.lerp(1, 1.2, offset));
  });

  return (
    <group ref={groupRef} >
      <Html transform >
        {/* The iPad SVG is being rendered as an HTML image */}
        <img
          src="https://assets.website-files.com/5f6defc193852768e5fc2dab/60c8b3724c66fb10901fcab9_ipad-pro.svg"
          alt="iPad SVG"
          style={{ width: '100%', height: 'auto' }}
        />
      </Html>
    </group>
  );
};

const IpadScrollAnimation = () => {
  return (
    <Canvas
      style={{ width: '100%', height: '100vh' , border: '1px solid #000' }}
      camera={{ position: [0, 0, 10], fov: 50 }}
    >
      {/* Configure how many "pages" of scroll you want (try adjusting the pages prop) */}
      <ScrollControls pages={1} >
        <IpadAnimation />
      </ScrollControls>
    </Canvas>
  );
};

export default IpadScrollAnimation;
