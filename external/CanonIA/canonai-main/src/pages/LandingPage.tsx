import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LandingNavbar from "@/components/landing/LandingNavbar";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import SecuritySection from "@/components/landing/SecuritySection";
import ComplianceSection from "@/components/landing/ComplianceSection";
import LandingFooter from "@/components/landing/LandingFooter";
import { useAuth } from "@/hooks/useAuth";

export default function LandingPage() {
  const [lightMode, setLightMode] = useState(false);
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user?.email_confirmed_at) {
      navigate("/draft", { replace: true });
    }
  }, [loading, navigate, user]);

  return (
    <div className={`min-h-screen bg-gradient-navy text-foreground transition-colors duration-500 ${lightMode ? "light-landing" : ""}`}>
      <LandingNavbar lightMode={lightMode} onToggleTheme={() => setLightMode(!lightMode)} />
      <HeroSection />
      <FeaturesSection />
      <SecuritySection />
      <ComplianceSection />
      <LandingFooter />
    </div>
  );
}
