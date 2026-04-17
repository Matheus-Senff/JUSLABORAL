import { useState, useCallback, useEffect } from "react";

// ─── Tipos ───────────────────────────────────────────────────────────────────

export type ServiceId = "google" | "microsoft";

interface ConnectedService {
  accessToken: string;
  email: string;
  connectedAt: number;
  expiresAt: number;
}

type ConnectedMap = Partial<Record<ServiceId, ConnectedService>>;

const STORAGE_KEY = "canon-external-connectors";

// ─── Helpers de persistência ─────────────────────────────────────────────────

function loadConnected(): ConnectedMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveConnected(map: ConnectedMap) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {}
}

// Remove serviços com token expirado
function pruneExpired(map: ConnectedMap): ConnectedMap {
  const now = Date.now();
  const pruned: ConnectedMap = {};
  for (const [k, v] of Object.entries(map) as [ServiceId, ConnectedService][]) {
    if (v && v.expiresAt > now) pruned[k] = v;
  }
  return pruned;
}

// ─── OAuth helpers ────────────────────────────────────────────────────────────

/**
 * Google OAuth2 via Google Identity Services (popup).
 * Você precisa configurar o GOOGLE_CLIENT_ID nas variáveis de ambiente.
 */
function connectGoogle(): Promise<ConnectedService> {
  return new Promise((resolve, reject) => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
    if (!clientId) {
      reject(new Error("VITE_GOOGLE_CLIENT_ID não configurado."));
      return;
    }

    // Carrega dinamicamente o script GIS se ainda não estiver
    const loadGIS = (): Promise<void> =>
      new Promise((res) => {
        if ((window as any).google?.accounts?.oauth2) { res(); return; }
        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.onload = () => res();
        document.head.appendChild(script);
      });

    loadGIS().then(() => {
      const gis = (window as any).google.accounts.oauth2;
      const client = gis.initTokenClient({
        client_id: clientId,
        scope: "https://www.googleapis.com/auth/drive.readonly email profile openid",
        callback: async (tokenResponse: any) => {
          if (tokenResponse.error) { reject(new Error(tokenResponse.error)); return; }

          // Busca email via userinfo
          try {
            const info = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
              headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
            }).then((r) => r.json());

            resolve({
              accessToken: tokenResponse.access_token,
              email: info.email ?? "",
              connectedAt: Date.now(),
              expiresAt: Date.now() + (tokenResponse.expires_in ?? 3600) * 1000,
            });
          } catch {
            resolve({
              accessToken: tokenResponse.access_token,
              email: "",
              connectedAt: Date.now(),
              expiresAt: Date.now() + 3600 * 1000,
            });
          }
        },
      });
      client.requestAccessToken({ prompt: "consent" });
    });
  });
}

/**
 * Microsoft OAuth2 via MSAL popup.
 * Você precisa configurar o VITE_MICROSOFT_CLIENT_ID nas variáveis de ambiente.
 */
async function connectMicrosoft(): Promise<ConnectedService> {
  const clientId = import.meta.env.VITE_MICROSOFT_CLIENT_ID as string | undefined;
  if (!clientId) throw new Error("VITE_MICROSOFT_CLIENT_ID não configurado.");

  // Importação dinâmica do MSAL para não aumentar o bundle inicial
  const { PublicClientApplication } = await import("@azure/msal-browser");

  const msalInstance = new PublicClientApplication({
    auth: {
      clientId,
      authority: "https://login.microsoftonline.com/common",
      redirectUri: window.location.origin,
    },
    cache: { cacheLocation: "sessionStorage" },
  });

  await msalInstance.initialize();

  const result = await msalInstance.loginPopup({
    scopes: ["User.Read", "Files.Read", "openid", "email", "profile"],
    prompt: "select_account",
  });

  const email = result.account?.username ?? result.account?.name ?? "";
  return {
    accessToken: result.accessToken,
    email,
    connectedAt: Date.now(),
    expiresAt: result.expiresOn?.getTime() ?? Date.now() + 3600 * 1000,
  };
}

// ─── Hook principal ───────────────────────────────────────────────────────────

export function useExternalConnectors() {
  const [connected, setConnected] = useState<ConnectedMap>(() => pruneExpired(loadConnected()));
  const [connecting, setConnecting] = useState<ServiceId | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Persiste cada vez que muda
  useEffect(() => {
    saveConnected(connected);
  }, [connected]);

  const isConnected = useCallback(
    (service: ServiceId) => {
      const entry = connected[service];
      return !!(entry && entry.expiresAt > Date.now());
    },
    [connected]
  );

  const getEmail = useCallback(
    (service: ServiceId) => connected[service]?.email ?? null,
    [connected]
  );

  const disconnect = useCallback((service: ServiceId) => {
    setConnected((prev) => {
      const next = { ...prev };
      delete next[service];
      return next;
    });
  }, []);

  /**
   * Conecta o serviço via OAuth oauth popup.
   * Retorna true se conectou com sucesso.
   */
  const connect = useCallback(async (service: ServiceId): Promise<boolean> => {
    setError(null);
    setConnecting(service);
    try {
      let entry: ConnectedService;
      if (service === "google") {
        entry = await connectGoogle();
      } else {
        entry = await connectMicrosoft();
      }
      setConnected((prev) => ({ ...prev, [service]: entry }));
      return true;
    } catch (err: any) {
      // Usuário fechou o popup — não exibe erro
      if (
        err?.message?.includes("popup_closed") ||
        err?.message?.includes("user_cancelled") ||
        err?.message?.includes("access_denied")
      ) {
        return false;
      }
      setError(err?.message ?? "Falha ao conectar.");
      return false;
    } finally {
      setConnecting(null);
    }
  }, []);

  /**
   * Abre o serviço externo em nova aba.
   * Se não estiver conectado, inicia o fluxo OAuth primeiro.
   */
  const openService = useCallback(
    async (
      service: "google-drive" | "onedrive" | "gmail"
    ) => {
      const urls: Record<string, string> = {
        "google-drive": "https://drive.google.com",
        onedrive: "https://onedrive.live.com",
        gmail: "https://mail.google.com",
      };

      const needsAuth: Record<string, ServiceId> = {
        "google-drive": "google",
        onedrive: "microsoft",
        gmail: "google",
      };

      const serviceId = needsAuth[service];

      if (!isConnected(serviceId)) {
        const ok = await connect(serviceId);
        if (!ok) return; // usuário cancelou
      }

      window.open(urls[service], "_blank", "noopener,noreferrer");
    },
    [connect, isConnected]
  );

  return { isConnected, getEmail, connect, disconnect, openService, connecting, error };
}
