import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function RecoverPasswordModal({ isOpen, onClose }: Props) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const { resetPassword } = useAuth();

  if (!isOpen) return null;

  async function handleRecover() {
    if (!email) {
      setError("Por favor, insira seu email");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Erro ao enviar email de recuperação");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white w-[92%] max-w-md rounded-2xl shadow-2xl p-8 mx-4">
        <div className="flex flex-col items-center mb-6">
          <img
            src="/tervisaibonito copy copy.png"
            alt="TERVIS.AI"
            className="h-16 w-auto mb-3"
          />
          <h2 className="text-xl font-semibold text-[#0A2A5C]">
            Recuperar Senha
          </h2>
          <p className="text-gray-500 mt-2 text-center">
            Digite seu email para receber instruções de recuperação
          </p>
        </div>

        {success ? (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-center">
              Email enviado com sucesso! Verifique sua caixa de entrada.
            </div>
            <button
              className="w-full py-3 rounded-xl bg-[#01963D] text-white font-semibold"
              onClick={onClose}
            >
              Fechar
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Seu email"
              className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 outline-none focus:border-[#0A2A5C]"
            />

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                {error}
              </div>
            )}

            <button
              className="w-full py-3 rounded-xl bg-[#01963D] text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleRecover}
              disabled={loading}
            >
              {loading ? "Enviando..." : "Enviar Email"}
            </button>

            <button
              className="w-full text-[#0A2A5C] text-sm"
              onClick={onClose}
            >
              Voltar para login
            </button>
          </div>
        )}

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
