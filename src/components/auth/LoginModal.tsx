import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { getNavigationContext, clearNavigationContext } from "../../lib/navigationContext";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onOpenSignup?: () => void;
  onOpenRecover?: () => void;
};

export default function LoginModal({ isOpen, onClose, onOpenSignup, onOpenRecover }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { signInWithGoogle, signInWithEmail } = useAuth();
  const navigate = useNavigate();

  if (!isOpen) return null;

  async function handleGoogleLogin() {
    setLoading(true);
    setError("");
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message || "Erro ao fazer login com Google");
      setLoading(false);
    }
  }

  async function handleEmailLogin() {
    if (!email || !password) {
      setError("Por favor, preencha email e senha");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await signInWithEmail(email, password);
      onClose();

      const context = getNavigationContext();
      if (context?.returnUrl) {
        clearNavigationContext();
        navigate(context.returnUrl);
      }
    } catch (err: any) {
      setError(err.message || "Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* overlay */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      {/* modal */}
      <div className="relative bg-white w-[92%] max-w-lg rounded-2xl shadow-2xl p-8 mx-4">
        <div className="flex flex-col items-center mb-6">
          <img
            src="/tervisaibonito.png"
            alt="TERVIS.AI"
            className="h-16 w-auto mb-3"
          />
          <h2 className="text-xl font-semibold text-[#0A2A5C]">TERVIS.AI</h2>
          <p className="text-gray-500 mt-2">Como você prefere acessar?</p>
        </div>

        <div className="space-y-3">
          <button
            className="w-full py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-3 bg-gradient-to-r from-[#E9573F] to-[#EBA8A0] shadow disabled:opacity-70 disabled:cursor-not-allowed"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <img src="/icons/google.png" alt="Google" className="h-6 w-6" />
            <span className="text-lg">Google</span>
          </button>

          <button
            className="w-full py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-3 bg-[#3b5998] opacity-60 cursor-not-allowed"
            disabled
          >
            <img src="/icons/facebook.png" alt="Facebook" className="h-6 w-6" />
            <span>Facebook (em breve)</span>
          </button>

          <button
            className="w-full py-3 rounded-xl text-gray-800 font-semibold flex items-center justify-center gap-3 bg-gray-100 opacity-60 cursor-not-allowed"
            disabled
          >
            <img src="/icons/apple.png" alt="Apple" className="h-6 w-6" />
            <span>Apple (em breve)</span>
          </button>

          <button
            className="w-full py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-3 bg-[#1DB954] opacity-60 cursor-not-allowed"
            disabled
          >
            <img src="/icons/spotify.png" alt="Spotify" className="h-6 w-6" />
            <span>Spotify (em breve)</span>
          </button>

          <button
            className="w-full py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-3 bg-gradient-to-r from-[#3A3A3A] to-[#000000] opacity-60 cursor-not-allowed"
            disabled
          >
            <img src="/icons/x.png" alt="X" className="h-6 w-6" />
            <span>X (em breve)</span>
          </button>
        </div>

        <div className="flex items-center gap-3 my-6">
          <hr className="w-full border-gray-200" />
          <span className="text-gray-400 text-sm">OU</span>
          <hr className="w-full border-gray-200" />
        </div>

        <div className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 outline-none focus:border-[#0A2A5C]"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Senha"
            onKeyDown={(e) => e.key === "Enter" && handleEmailLogin()}
            className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 outline-none focus:border-[#0A2A5C]"
          />

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input type="checkbox" className="w-4 h-4" />
              Lembrar-me
            </label>

            <button
              className="text-sm text-[#0A2A5C] underline"
              onClick={() => {
                onOpenRecover?.();
              }}
            >
              Esqueci a senha
            </button>
          </div>

          <button
            className="w-full py-3 rounded-xl bg-[#01963D] text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleEmailLogin}
            disabled={loading}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </div>

        <div className="text-center mt-6 text-gray-600">
          Ainda não tem uma conta?
          <button
            className="text-[#0A2A5C] font-semibold ml-2"
            onClick={onOpenSignup}
          >
            Cadastre-se
          </button>
        </div>

        <button
          aria-label="Fechar"
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
