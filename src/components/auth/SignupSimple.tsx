import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { getNavigationContext, clearNavigationContext } from "../../lib/navigationContext";

type Props = {
  isOpen: boolean;
  onClose?: () => void;
};

export default function SignupSimple({ isOpen, onClose }: Props) {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { signUpSimple } = useAuth();
  const navigate = useNavigate();

  if (!isOpen) return null;

  function update(key: string, value: string) {
    setForm({ ...form, [key]: value });
  }

  async function handleSignup() {
    if (!form.firstName || !form.lastName || !form.email || !form.password) {
      setError("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    if (form.password.length < 5) {
      setError("A senha deve ter no mínimo 5 caracteres");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await signUpSimple(form);
      onClose?.();

      const context = getNavigationContext();
      if (context?.returnUrl) {
        clearNavigationContext();
        navigate(context.returnUrl);
      }
    } catch (err: any) {
      setError(err.message || "Erro ao criar conta");
    } finally {
      setLoading(false);
    }
  }

  function handleBecomeProfessional() {
    navigate("/professional/signup");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white w-[92%] max-w-md rounded-2xl shadow-2xl p-6">
        <h2 className="text-xl font-semibold text-center mb-4 text-[#0A2A5C]">
          Criar Conta
        </h2>

        <div className="space-y-3">
          <input
            className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 outline-none focus:border-[#0A2A5C]"
            placeholder="Nome"
            value={form.firstName}
            onChange={(e) => update("firstName", e.target.value)}
          />
          <input
            className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 outline-none focus:border-[#0A2A5C]"
            placeholder="Sobrenome"
            value={form.lastName}
            onChange={(e) => update("lastName", e.target.value)}
          />
          <input
            type="email"
            className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 outline-none focus:border-[#0A2A5C]"
            placeholder="Email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
          />
          <input
            type="tel"
            className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 outline-none focus:border-[#0A2A5C]"
            placeholder="Telefone com DDD"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
          />
          <input
            type="password"
            className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 outline-none focus:border-[#0A2A5C]"
            placeholder="Senha (mínimo 5 chars)"
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
          />
        </div>

        {error && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {error}
          </div>
        )}

        <button
          className="w-full mt-4 py-3 rounded-xl bg-[#01963D] text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleSignup}
          disabled={loading}
        >
          {loading ? "Criando..." : "Criar Conta"}
        </button>

        <div className="mt-4 p-4 border border-gray-200 rounded-xl bg-gray-50 text-center">
          <div className="mb-2 text-gray-700 font-medium">
            É profissional de saúde?
          </div>
          <button
            className="text-[#0A2A5C] underline font-semibold"
            onClick={handleBecomeProfessional}
          >
            Quero diagnósticos, prescrições e receber pacientes
          </button>
        </div>

        <button
          aria-label="Fechar"
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          onClick={onClose}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
