import type { Metadata } from "next";
import { Benefits } from "@/components/landing/Benefits";
import { DynamicProfileDemo } from "@/components/landing/DynamicProfileDemo";
import { FAQ } from "@/components/landing/FAQ";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Footer } from "@/components/landing/Footer";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Navbar } from "@/components/landing/Navbar";
import { Personalization } from "@/components/landing/Personalization";
import { RoadmapPreview } from "@/components/landing/RoadmapPreview";
import { TrustStrip } from "@/components/landing/TrustStrip";
import { UlieSection } from "@/components/landing/UlieSection";
import { UniversityMatchesDemo } from "@/components/landing/UniversityMatchesDemo";
import { UserScenarios } from "@/components/landing/UserScenarios";
import "./landing.css";

export const metadata: Metadata = {
  title: {
    absolute: "ULYS — персональный маршрут поступления",
  },
  description:
    "ULYS помогает подобрать университеты, понять, почему они подходят именно тебе, и построить персональный пошаговый маршрут поступления.",
  robots: {
    index: true,
    follow: true,
  },
};

export default function LandingPage() {
  return (
    <main className="landing-page">
      <a className="landing-skip-link" href="#main-content">
        Перейти к содержанию
      </a>
      <Navbar />
      <div id="main-content">
        <Hero />
        <TrustStrip />
        <HowItWorks />
        <Personalization />
        <UniversityMatchesDemo />
        <DynamicProfileDemo />
        <RoadmapPreview />
        <UlieSection />
        <Benefits />
        <UserScenarios />
        <FAQ />
        <FinalCTA />
      </div>
      <Footer />
    </main>
  );
}
