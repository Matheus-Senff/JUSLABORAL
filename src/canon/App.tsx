import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@canon/components/ui/sonner";
import { Toaster } from "@canon/components/ui/toaster";
import { TooltipProvider } from "@canon/components/ui/tooltip";
import { ChatProvider } from "@canon/contexts/ChatContext";
import Draft from "./pages/Draft";
import VerifyEmail from "./pages/VerifyEmail";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ChatProvider>
      <Toaster />
      <Sonner />
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<Draft />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </MemoryRouter>
      </ChatProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
