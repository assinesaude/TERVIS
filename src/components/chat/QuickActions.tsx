import { Pill, UserSearch, Paperclip, PawPrint, Globe } from 'lucide-react';

interface QuickActionsProps {
  onBularioClick: () => void;
  onSearchProfessionalClick: () => void;
  onUploadExamClick: () => void;
  onBularioVetClick: () => void;
  onCreateSiteClick: () => void;
}

export function QuickActions({
  onBularioClick,
  onSearchProfessionalClick,
  onUploadExamClick,
  onBularioVetClick,
  onCreateSiteClick,
}: QuickActionsProps) {
  return (
    <div className="flex gap-2 justify-center">
      <button
        onClick={onBularioClick}
        className="group flex flex-col items-center gap-1 px-3 py-2 bg-transparent transition-all"
        title="Consulte informações oficiais da ANVISA sobre qualquer medicamento"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0EA5E9] to-[#22C55E] flex items-center justify-center group-hover:scale-110 transition-transform">
          <Pill className="w-4 h-4 text-white" />
        </div>
        <span className="text-xs font-medium text-gray-700">Bulário Eletrônico</span>
      </button>

      <button
        onClick={onSearchProfessionalClick}
        className="group flex flex-col items-center gap-1 px-3 py-2 bg-transparent transition-all"
        title="O TERVIS indica profissionais qualificados no bairro que você escolher"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0EA5E9] to-[#22C55E] flex items-center justify-center group-hover:scale-110 transition-transform">
          <UserSearch className="w-4 h-4 text-white" />
        </div>
        <span className="text-xs font-medium text-gray-700">Procurar Profissional</span>
      </button>

      <button
        onClick={onUploadExamClick}
        className="group flex flex-col items-center gap-1 px-3 py-2 bg-transparent transition-all"
        title="Envie exames ou documentos e o TERVIS explica para você"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0EA5E9] to-[#22C55E] flex items-center justify-center group-hover:scale-110 transition-transform">
          <Paperclip className="w-4 h-4 text-white" />
        </div>
        <span className="text-xs font-medium text-gray-700">Anexar Exame</span>
      </button>

      <button
        onClick={onBularioVetClick}
        className="group flex flex-col items-center gap-1 px-3 py-2 bg-transparent transition-all"
        title="Consulte informações sobre medicamentos veterinários"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0EA5E9] to-[#22C55E] flex items-center justify-center group-hover:scale-110 transition-transform">
          <PawPrint className="w-4 h-4 text-white" />
        </div>
        <span className="text-xs font-medium text-gray-700">Bulário Veterinário</span>
      </button>

      <button
        onClick={onCreateSiteClick}
        className="group flex flex-col items-center gap-1 px-3 py-2 bg-transparent transition-all"
        title="Profissionais de saúde: crie seu site personalizado com IA"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0EA5E9] to-[#22C55E] flex items-center justify-center group-hover:scale-110 transition-transform">
          <Globe className="w-4 h-4 text-white" />
        </div>
        <span className="text-xs font-medium text-gray-700">Criar Site</span>
      </button>
    </div>
  );
}
