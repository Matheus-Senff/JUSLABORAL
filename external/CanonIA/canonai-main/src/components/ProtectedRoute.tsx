import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import { usePromptQuota } from "@/hooks/usePromptQuota";
import AccessBlockedScreen from "@/components/AccessBlockedScreen";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const { accessBlocked, loading: quotaLoading } = usePromptQuota();

  if (loading || quotaLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Check email verification
  if (!user.email_confirmed_at) {
    return <Navigate to="/verify-email" replace />;
  }

  if (accessBlocked) {
    return <AccessBlockedScreen />;
  }

  return <>{children}</>;
}
