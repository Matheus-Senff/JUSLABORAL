import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";

interface LandingNavbarProps {
  lightMode?: boolean;
  onToggleTheme?: () => void;
}

export default function LandingNavbar({ lightMode, onToggleTheme }: LandingNavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-glass border-b border-border/30">
      <div className="container flex h-14 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          
        </Link>

        <div className="hidden md:flex items-center flex-1 ml-8 gap-10 text-sm">
          <a href="#features" className="font-semibold tracking-wide text-muted-foreground hover:text-foreground transition-colors">Nosso Produto</a>
          <a href="#security" className="font-semibold tracking-wide text-muted-foreground hover:text-foreground transition-colors">Privacidade</a>
          <a href="#compliance" className="font-semibold tracking-wide text-muted-foreground hover:text-foreground transition-colors">Regulatório</a>
          <a href="#plans" className="font-semibold tracking-wide text-muted-foreground hover:text-foreground transition-colors">Planos</a>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link to="/draft">
            <Button variant="gold" size="sm" className="h-8 text-xs px-4">Acessar Plataforma</Button>
          </Link>
          <button
            onClick={onToggleTheme}
            className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            aria-label="Alternar tema">
            {lightMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>
        </div>

        <button className="md:hidden text-muted-foreground" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen &&
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden border-t border-border/30 bg-glass overflow-hidden">
          
            <div className="container flex flex-col gap-3 py-4 text-sm">
              <a href="#features" className="text-muted-foreground" onClick={() => setMobileOpen(false)}>Nosso Produto</a>
              <a href="#security" className="text-muted-foreground" onClick={() => setMobileOpen(false)}>Privacidade</a>
              <a href="#compliance" className="text-muted-foreground" onClick={() => setMobileOpen(false)}>Regulatório</a>
              <a href="#plans" className="text-muted-foreground" onClick={() => setMobileOpen(false)}>Planos</a>
              <Link to="/draft" onClick={() => setMobileOpen(false)}>
                <Button variant="gold" size="sm" className="w-full mt-1">Acessar Plataforma</Button>
              </Link>
            </div>
          </motion.div>
        }
      </AnimatePresence>
    </nav>);

}