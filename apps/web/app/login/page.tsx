import { PasswordLoginForm } from "./PasswordLoginForm";

interface LoginPageProps {
  searchParams: { error?: string };
}

const ERROR_MESSAGES: Record<string, string> = {
  state: "La sesión de acceso expiró. Inténtalo de nuevo.",
  oauth: "No se pudo completar el acceso con Discord. Inténtalo de nuevo.",
};

export default function LoginPage({ searchParams }: LoginPageProps) {
  const error = searchParams.error ? ERROR_MESSAGES[searchParams.error] : null;

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm card p-8 text-center">
        <h1 className="text-xl font-semibold text-ink mb-1">factuRM</h1>
        <p className="text-sm text-slate-500 mb-6">Accede a tu panel de facturación</p>

        <a
          href="/api/auth/discord"
          className="btn-primary w-full inline-flex items-center justify-center gap-2"
          style={{ backgroundColor: "#5865F2" }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M20.317 4.369A19.79 19.79 0 0 0 15.885 3c-.21.375-.45.88-.617 1.28a18.27 18.27 0 0 0-5.537 0A12.6 12.6 0 0 0 9.11 3a19.74 19.74 0 0 0-4.433 1.37C1.86 8.59 1.093 12.7 1.476 16.75a19.9 19.9 0 0 0 6.073 3.058c.49-.669.927-1.38 1.304-2.126a12.9 12.9 0 0 1-2.053-.99c.172-.127.34-.26.503-.395a14.2 14.2 0 0 0 12.194 0c.164.14.332.268.503.395-.656.389-1.343.72-2.056.99.377.746.814 1.457 1.304 2.126a19.87 19.87 0 0 0 6.076-3.058c.448-4.686-.766-8.76-3.207-12.381ZM8.02 14.331c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.42 2.157-2.42 1.21 0 2.176 1.096 2.157 2.42 0 1.334-.955 2.42-2.157 2.42Zm7.96 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.42 2.157-2.42 1.21 0 2.176 1.096 2.157 2.42 0 1.334-.946 2.42-2.157 2.42Z" />
          </svg>
          Entrar con Discord
        </a>

        <div className="flex items-center gap-3 my-5">
          <span className="h-px flex-1 bg-slate-200" />
          <span className="text-xs text-slate-400">o con usuario y contraseña</span>
          <span className="h-px flex-1 bg-slate-200" />
        </div>

        <PasswordLoginForm />

        {error ? <p className="text-sm text-red-600 mt-4">{error}</p> : null}
      </div>
    </div>
  );
}
