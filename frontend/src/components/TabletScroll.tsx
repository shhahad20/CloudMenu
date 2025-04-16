import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ScrollControls, useScroll, Html } from "@react-three/drei";

import * as THREE from "three";
import "../styles/tabletScroll.scss";

const TabletModel = () => {
    const ref = useRef<THREE.Group>(null);
    const scroll = useScroll();
  
    useFrame(({ camera }) => {
      if (!ref.current) return;
      const offset = scroll.offset;
      
      // Animate rotation and camera position
      ref.current.rotation.x = THREE.MathUtils.lerp(
        ref.current.rotation.x,
        offset * Math.PI * 2,
        0.1
      );
      ref.current.position.x = THREE.MathUtils.lerp(
        ref.current.position.x,
        Math.sin(offset * Math.PI * 2) * 2,
        0.1
      );
      camera.position.y = THREE.MathUtils.lerp(
        camera.position.y,
        -offset * 10,
        0.1
      );
    });
  
    return (
      <group ref={ref} position={[0, 0, 0]} scale={[1, 1, 1]}>
        <Html transform>
          <div className="tablet-frame">
            <img src="/ipadModel.svg" alt="iPad" className="tablet-svg" />
            <div className="screen-content">
              {[1, 2, 3, 4].map((section) => (
                <section
                  key={section}
                  className="content-section"
                  style={{ height: "100vh" }}
                >
                  <h2>Menu Section {section}</h2>
                  <div className="menu-items">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="menu-item">
                        <h3>Signature Dish {i + 1}</h3>
                        <p>Description...</p>
                        <span>$2{i + 1}.99</span>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </Html>
      </group>
    );
  };

const TabletScroll = () => (
  <Canvas style={{ width: "100%", height: "100%" }} camera={{ position: [0, 0, 15], fov: 50 }} >
    <ScrollControls pages={4}>
      <TabletModel />
    </ScrollControls>
  </Canvas>
);
export default TabletScroll;
