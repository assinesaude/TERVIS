import { Search, Shield, Calendar, Star, Check, ArrowRight, Heart, Users, Clock } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export function LandingPage() {
  const plans = [
    {
      name: 'Starter',
      price: 29,
      features: [
        'Perfil verificado',
        'Agenda básica',
        'Até 30 agendamentos/mês',
        'Suporte por email',
      ],
    },
    {
      name: 'Pro',
      price: 59,
      features: [
        'Tudo do Starter',
        'Agenda avançada',
        'URLs personalizadas',
        'Destaque nas buscas',
        'Agendamentos ilimitados',
        'Suporte prioritário',
      ],
      highlighted: true,
    },
    {
      name: 'Premium',
      price: 99,
      features: [
        'Tudo do Pro',
        'Prioridade máxima nas buscas',
        'Selo Premium',
        'Acesso a IA de diagnóstico assistido',
        'Analytics avançado',
        'Suporte VIP 24/7',
      ],
    },
  ];

  return (
    <div className="min-h-screen">
      <section className="pt-32 pb-20 px-4 bg-gradient-to-br from-tervis-blue/5 via-white to-tervis-green/5">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center px-4 py-2 bg-white rounded-full shadow-md mb-6">
              <span className="w-2 h-2 bg-gradient-green rounded-full mr-2"></span>
              <span className="text-sm font-medium text-gray-700">A primeira IA do Brasil para saúde</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Conectando
              <span className="bg-gradient-tervis bg-clip-text text-transparent"> Profissionais </span>
              e Pacientes
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Plataforma inteligente que aproxima profissionais de saúde verificados dos pacientes que precisam deles.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg">
                <Search className="w-5 h-5 mr-2" />
                Buscar Profissionais
              </Button>
              <Button variant="outline" size="lg" className="text-lg">
                <Shield className="w-5 h-5 mr-2" />
                Sou Profissional
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section id="como-funciona" className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Como Funciona</h2>
            <p className="text-xl text-gray-600">Simples, rápido e seguro</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <div className="inline-flex items-center px-3 py-1 bg-tervis-blue/10 text-tervis-blue rounded-full text-sm font-medium mb-4">
                Para Pacientes
              </div>
              <h3 className="text-3xl font-bold mb-6">Encontre o profissional ideal</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-gradient-blue rounded-lg flex items-center justify-center mr-4 flex-shrink-0 mt-1">
                    <span className="text-white font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Busque por especialidade</h4>
                    <p className="text-gray-600">Encontre profissionais por cidade, área e especialidade</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-gradient-blue rounded-lg flex items-center justify-center mr-4 flex-shrink-0 mt-1">
                    <span className="text-white font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Veja perfis verificados</h4>
                    <p className="text-gray-600">Todos os profissionais são verificados e avaliados</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-gradient-blue rounded-lg flex items-center justify-center mr-4 flex-shrink-0 mt-1">
                    <span className="text-white font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Agende e pague online</h4>
                    <p className="text-gray-600">Pagamento seguro e confirmação instantânea</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-tervis-blue/10 to-tervis-green/10 rounded-3xl p-8 h-96 flex items-center justify-center">
              <Heart className="w-32 h-32 text-tervis-blue/20" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="bg-gradient-to-br from-tervis-green/10 to-tervis-blue/10 rounded-3xl p-8 h-96 flex items-center justify-center order-2 md:order-1">
              <Shield className="w-32 h-32 text-tervis-green/20" />
            </div>
            <div className="order-1 md:order-2">
              <div className="inline-flex items-center px-3 py-1 bg-tervis-green/10 text-tervis-green rounded-full text-sm font-medium mb-4">
                Para Profissionais
              </div>
              <h3 className="text-3xl font-bold mb-6">Expanda sua prática</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-gradient-green rounded-lg flex items-center justify-center mr-4 flex-shrink-0 mt-1">
                    <span className="text-white font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Cadastro rápido</h4>
                    <p className="text-gray-600">Crie seu perfil em minutos e envie seus documentos</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-gradient-green rounded-lg flex items-center justify-center mr-4 flex-shrink-0 mt-1">
                    <span className="text-white font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Seja verificado</h4>
                    <p className="text-gray-600">Ganhe credibilidade com o selo de verificação TERVIS</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-gradient-green rounded-lg flex items-center justify-center mr-4 flex-shrink-0 mt-1">
                    <span className="text-white font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Receba pacientes</h4>
                    <p className="text-gray-600">Gerencie agenda e receba pagamentos automaticamente</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="para-profissionais" className="py-20 px-4 bg-gradient-to-br from-tervis-blue/5 to-tervis-green/5">
        <div className="container mx-auto max-w-4xl">
          <Card className="text-center p-12">
            <Shield className="w-16 h-16 text-tervis-blue mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">Profissional Verificado TERVIS</h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Complete seu cadastro e torne-se um profissional verificado. Profissionais verificados se tornam
              referência em sua área e região.
            </p>
            <div className="flex flex-wrap gap-3 justify-center mb-8">
              <div className="flex items-center px-4 py-2 bg-tervis-blue/10 rounded-full">
                <Check className="w-4 h-4 text-tervis-blue mr-2" />
                <span className="text-sm font-medium">Documentos Verificados</span>
              </div>
              <div className="flex items-center px-4 py-2 bg-tervis-blue/10 rounded-full">
                <Check className="w-4 h-4 text-tervis-blue mr-2" />
                <span className="text-sm font-medium">Selo de Confiança</span>
              </div>
              <div className="flex items-center px-4 py-2 bg-tervis-blue/10 rounded-full">
                <Check className="w-4 h-4 text-tervis-blue mr-2" />
                <span className="text-sm font-medium">Prioridade nas Buscas</span>
              </div>
            </div>
            <Button size="lg" className="text-lg">
              Começar Verificação
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Card>
        </div>
      </section>

      <section id="planos" className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Planos para Profissionais</h2>
            <p className="text-xl text-gray-600">Escolha o plano ideal para sua prática</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={`relative ${plan.highlighted ? 'ring-2 ring-tervis-blue shadow-2xl' : ''}`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="px-4 py-1 bg-gradient-blue text-white text-sm font-medium rounded-full shadow-lg">
                      Mais Popular
                    </span>
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center">
                    <span className="text-sm text-gray-600">R$</span>
                    <span className="text-5xl font-bold mx-1">{plan.price}</span>
                    <span className="text-gray-600">/mês</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <Check className="w-5 h-5 text-tervis-green mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  variant={plan.highlighted ? 'primary' : 'outline'}
                  fullWidth
                  size="lg"
                >
                  Começar Agora
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-gradient-tervis">
        <div className="container mx-auto max-w-4xl text-center text-white">
          <h2 className="text-4xl font-bold mb-6">Pronto para começar?</h2>
          <p className="text-xl mb-8 opacity-90">
            Junte-se a milhares de profissionais e pacientes que já confiam na TERVIS.AI
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-tervis-blue hover:bg-gray-100">
              <Search className="w-5 h-5 mr-2" />
              Buscar Profissionais
            </Button>
            <Button size="lg" className="bg-white/10 backdrop-blur-sm hover:bg-white/20 border-2 border-white">
              <Shield className="w-5 h-5 mr-2" />
              Cadastrar como Profissional
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}