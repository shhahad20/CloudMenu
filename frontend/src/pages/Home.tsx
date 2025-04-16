import React from "react";
import Hero from "../components/Hero";
// import AnimatedSVG from "../components/Preview";
import Features from "../components/Features";

const Home: React.FC = () => {
  return (
    <section id="home-section" style={{ paddingTop: "5rem" }}>
      <Hero />
      {/* <AnimatedSVG /> */}
      <Features />
      </section>
  );
};

export default Home;
