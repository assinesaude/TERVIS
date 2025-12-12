export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-tervis rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">T</span>
              </div>
              <span className="text-xl font-bold">TERVIS.AI</span>
            </div>
            <p className="text-gray-400 text-sm">
              A primeira IA do Brasil para promoção da relação profissional de saúde e pacientes.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Para Pacientes</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Buscar Profissionais</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Como Funciona</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Ajuda</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Para Profissionais</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Cadastrar-se</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Planos</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Verificação</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Empresa</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Sobre</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Termos de Uso</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacidade</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contato</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2025 TERVIS.AI. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}