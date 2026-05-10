"use client";

import { useState } from "react";
import { NavBar } from "@/components/NavBar";
import { HeroSection } from "@/components/HeroSection";
import { StatsSection } from "@/components/StatsSection";
import { ShowcaseSection } from "@/components/ShowcaseSection";
import { HowSection } from "@/components/HowSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import { MaterialsSection } from "@/components/MaterialsSection";
import { CTASection } from "@/components/CTASection";
import { LandingFooter } from "@/components/LandingFooter";
import { FeatPage } from "@/components/FeatPage";
import { ExamplePage } from "@/components/ExamplePage";
import { PricePage } from "@/components/PricePage";
import { AboutPage } from "@/components/AboutPage";

export default function Home() {
  const [activeTab, setActiveTab] = useState("home");

  const goToStart = () => {
    setActiveTab("home");
  };

  return (
    <div
      style={{
        fontFamily:
          "'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', 'Sora', system-ui, sans-serif",
        backgroundColor: "#F5F8FF",
        minHeight: "100vh",
        position: "relative",
      }}
    >
      <NavBar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Home page */}
      <div
        style={{
          display: activeTab === "home" ? "block" : "none",
          animation: activeTab === "home" ? "landingFadeIn .3s ease" : "none",
        }}
      >
        <HeroSection
          onStartCreating={goToStart}
          onViewExamples={() => setActiveTab("example")}
        />
        <StatsSection />
        <ShowcaseSection />
        <HowSection />
        <FeaturesSection />
        <MaterialsSection />
        <CTASection onStart={goToStart} />
        <LandingFooter onNavigate={setActiveTab} />
      </div>

      {/* Features page */}
      <div
        style={{
          display: activeTab === "feat" ? "block" : "none",
          paddingTop: "20px",
          animation: activeTab === "feat" ? "landingFadeIn .3s ease" : "none",
        }}
      >
        <FeatPage onStart={goToStart} />
        <LandingFooter onNavigate={setActiveTab} />
      </div>

      {/* Example page */}
      <div
        style={{
          display: activeTab === "example" ? "block" : "none",
          paddingTop: "20px",
          animation: activeTab === "example" ? "landingFadeIn .3s ease" : "none",
        }}
      >
        <ExamplePage />
        <LandingFooter onNavigate={setActiveTab} />
      </div>

      {/* Price page */}
      <div
        style={{
          display: activeTab === "price" ? "block" : "none",
          paddingTop: "20px",
          animation: activeTab === "price" ? "landingFadeIn .3s ease" : "none",
        }}
      >
        <PricePage onStart={goToStart} />
        <LandingFooter onNavigate={setActiveTab} />
      </div>

      {/* About page */}
      <div
        style={{
          display: activeTab === "about" ? "block" : "none",
          paddingTop: "20px",
          animation: activeTab === "about" ? "landingFadeIn .3s ease" : "none",
        }}
      >
        <AboutPage />
        <LandingFooter onNavigate={setActiveTab} />
      </div>
    </div>
  );
}
