import React from "react";
import Hero from "../components/Hero";
// import AnimatedSVG from "../components/Preview";
import Features from "../components/Features";
import VideoSection from "../components/VideoSection";
import ShortAboutUs from "../components/ShortAboutUs";
import Newsletter from "../components/Newsletter";

const Home: React.FC = () => {
  return (
    <section id="home-section" style={{ paddingTop: "5rem" }}>
      <Hero />
      {/* <AnimatedSVG /> */}
      <Features />
      <VideoSection/>
      <ShortAboutUs/>
      <Newsletter/>
      </section>
  );
};

export default Home;
