import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LandingNavbar from "@canon/components/landing/LandingNavbar";
import HeroSection from "@canon/components/landing/HeroSection";
import FeaturesSection from "@canon/components/landing/FeaturesSection";
import SecuritySection from "@canon/components/landing/SecuritySection";
import ComplianceSection from "@canon/components/landing/ComplianceSection";
import LandingFooter from "@canon/components/landing/LandingFooter";
import { useAuth } from "@canon/hooks/useAuth";

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
