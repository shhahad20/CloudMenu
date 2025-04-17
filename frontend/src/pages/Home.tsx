import React from "react";
import Hero from "../components/Hero";
// import AnimatedSVG from "../components/Preview";
import Features from "../components/Features";
import VideoSection from "../components/VideoSection";

const Home: React.FC = () => {
  return (
    <section id="home-section" style={{ paddingTop: "5rem" }}>
      <Hero />
      {/* <AnimatedSVG /> */}
      <Features />
      <VideoSection/>
      </section>
  );
};

export default Home;
