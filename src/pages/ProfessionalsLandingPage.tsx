import { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Check, Crown, Rocket, Zap, Shield, TrendingUp, Award, Users, ChevronDown, ChevronUp, Target, Lock, Sparkles, Star } from 'lucide-react';

export function ProfessionalsLandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      question: 'Quem pode se cadastrar?',
      answer: 'Profissionais de saúde com registro ativo em seus conselhos profissionais (CRM, CRO, CRP, CREFITO, etc.). A verificação é obrigatória para todos os planos.',
    },
    {
      question: 'Como funciona a verificação?',
      answer: 'Você envia seus documentos pela plataforma e nossa equipe valida em até 24 horas. Após aprovado, seu perfil fica visível para pacientes.',
    },
    {
      question: 'A IA dá diagnósticos?',
      answer: 'Para profissionais, a IA oferece ferramentas de diagnóstico assistido. Para pacientes, a IA apenas recomenda profissionais verificados, sem diagnósticos.',
    },
    {
      question: 'Como funciona a prioridade?',
      answer: 'Premium sempre aparece primeiro. Profissional aparece antes de Essencial. Essencial aparece quando não há Premium ou Profissional na região.',
    },
    {
      question: 'Como funciona a exclusividade Premium?',
      answer: 'Você escolhe até 3 bairros onde será o ÚNICO profissional Premium da sua especialidade. Nenhum outro Premium pode competir com você nesses bairros.',
    },
    {
      question: 'Posso cancelar quando quiser?',
      answer: 'Sim, todos os planos podem ser cancelados a qualquer momento, sem multas ou taxas adicionais.',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-32 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAtNC40MTggMy41ODItOCA4LThzOCAzLjU4MiA4IDgtMy41ODIgOC04IDgtOC0zLjU4Mi04LTh6bTAgMjRjMC00LjQxOCAzLjU4Mi04IDgtOHM4IDMuNTgyIDggOC0zLjU4MiA4LTggOC04LTMuNTgyLTgtOHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>

        <div className="container mx-auto max-w-5xl relative z-10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-4 py-2 bg-tervis-green/20 border border-tervis-green/30 rounded-full mb-6">
              <Sparkles className="w-4 h-4 mr-2 text-tervis-green" />
              <span className="text-sm font-medium text-tervis-green">Exclusividade por Especialidade</span>
            </div>

            <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
              A posição mais disputada da sua especialidade<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-tervis-green to-emerald-400">
                agora pode ser sua.
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-slate-300 mb-10 max-w-3xl mx-auto leading-relaxed">
              Exclusividade por cidade. Prioridade por plano.<br />
              Autoridade instantânea dentro do ecossistema Tervis.AI.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                className="text-lg px-8 py-6 bg-gradient-to-r from-tervis-green to-emerald-500 hover:from-tervis-green/90 hover:to-emerald-600 shadow-2xl shadow-tervis-green/30"
                onClick={() => window.location.href = '/planos'}
              >
                <Crown className="w-5 h-5 mr-2" />
                Quero garantir minha prioridade
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 border-2 border-white text-white hover:bg-white/10"
                onClick={() => document.getElementById('planos')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Conhecer os Planos
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-slate-50">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-6">Por que existe</h2>
            <div className="space-y-6 text-lg text-slate-700 leading-relaxed">
              <p className="text-xl">
                <strong className="text-slate-900">Profissionais de saúde de alto nível não podem competir como amadores.</strong>
              </p>
              <p>
                A Tervis.AI foi criada para destacar quem realmente entrega excelência — e não quem apenas ocupa espaço no mercado.
              </p>
              <p>
                Aqui, você não divide vitrine com dezenas de concorrentes.<br />
                <strong className="text-tervis-green">Você conquista prioridade, exclusividade e posicionamento profissional superior.</strong>
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Como funciona</h2>
            <p className="text-xl text-slate-600">
              Quatro passos simples para se tornar a referência na sua especialidade
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: '1',
                icon: Users,
                title: 'Crie sua conta',
                description: 'Login rápido com Google. Processo simplificado e seguro.',
              },
              {
                step: '2',
                icon: Shield,
                title: 'Envie seus documentos',
                description: 'CRM, CRO, CREFITO, etc. Você é verificado em minutos.',
              },
              {
                step: '3',
                icon: Crown,
                title: 'Escolha seu plano',
                description: 'Essencial, Profissional ou Premium. Defina sua prioridade.',
              },
              {
                step: '4',
                icon: TrendingUp,
                title: 'Seja recomendado pela IA',
                description: 'Pacientes perguntam, a Tervis responde… com você primeiro.',
              },
            ].map((item) => (
              <Card key={item.step} className="text-center hover:shadow-xl transition-all duration-300 border-2 hover:border-tervis-green/30">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-tervis-blue to-tervis-green rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                    <item.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-tervis-green mb-3">{item.step}</div>
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-slate-600">{item.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Exclusividade por Cidade</h2>
            <p className="text-xl text-slate-300 leading-relaxed">
              Para cada especialidade, existe um número <strong className="text-tervis-green">limitado e rigoroso</strong> de profissionais por cidade.
            </p>
          </div>

          <Card className="bg-slate-800 border-2 border-tervis-green/30">
            <div className="space-y-6 text-lg">
              <p className="text-slate-200">
                Se não houver assinantes na sua especialidade ou no seu plano, você se torna automaticamente o <strong className="text-tervis-green">único destaque visível</strong> naquele nível.
              </p>
              <div className="text-center py-6">
                <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-tervis-green to-emerald-400">
                  Concorrência mínima. Autoridade máxima.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">O Sistema de Prioridade</h2>
            <p className="text-xl text-slate-600 mb-8">
              A IA recomenda profissionais seguindo uma regra simples e inegociável:
            </p>
          </div>

          <div className="space-y-4 mb-12">
            {[
              { level: '1', plan: 'Plano Premium', color: 'purple', text: 'São SEMPRE recomendados primeiro' },
              { level: '2', plan: 'Plano Profissional', color: 'green', text: 'Aparecem antes de Essencial' },
              { level: '3', plan: 'Plano Essencial', color: 'blue', text: 'Aparecem quando não há Premium ou Profissional' },
            ].map((item) => (
              <Card key={item.level} className={`border-l-4 border-l-${item.color}-500 hover:shadow-xl transition-all`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 bg-gradient-${item.color} rounded-xl flex items-center justify-center text-white text-xl font-bold`}>
                      {item.level}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{item.plan}</h3>
                      <p className="text-slate-600">{item.text}</p>
                    </div>
                  </div>
                  <TrendingUp className={`w-8 h-8 text-${item.color}-500`} />
                </div>
              </Card>
            ))}
          </div>

          <Card className="bg-slate-50 border-2 border-slate-200">
            <div className="text-center">
              <p className="text-lg text-slate-700 mb-4">
                Se um ortodontista assina o <strong>Plano Essencial</strong>, ele é indicado.<br />
                Mas se outro ortodontista assina o <strong>Plano Premium</strong>, ele assume instantaneamente o topo das recomendações.
              </p>
              <p className="text-xl font-bold text-slate-900">
                A prioridade é definida pelo plano.<br />
                <span className="text-tervis-green">Quem está no topo recebe mais pacientes, mais visibilidade e mais autoridade.</span>
              </p>
            </div>
          </Card>
        </div>
      </section>

      <section id="planos" className="py-20 px-4 bg-slate-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-4">Escolha seu nível de autoridade</h2>
            <p className="text-xl text-slate-600">
              Quanto maior o plano, maior a prioridade nas recomendações da IA
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="hover:shadow-2xl transition-all">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-blue rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Essencial</h3>
                <p className="text-slate-600 font-medium mb-4">Sua presença confirmada</p>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-tervis-green mr-2 flex-shrink-0 mt-0.5" />
                  <span>Aparece quando não existe Profissional ou Premium</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-tervis-green mr-2 flex-shrink-0 mt-0.5" />
                  <span>Perfil verificado</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-tervis-green mr-2 flex-shrink-0 mt-0.5" />
                  <span>Exibição básica</span>
                </li>
              </ul>

              <p className="text-sm text-slate-600 italic mb-6">
                Ideal para quem quer começar e garantir presença na cidade.
              </p>

              <Button
                variant="outline"
                fullWidth
                size="lg"
                onClick={() => window.location.href = '/planos'}
              >
                Começar com Essencial
              </Button>
            </Card>

            <Card className="ring-2 ring-tervis-blue shadow-2xl transform scale-105 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="px-4 py-1 bg-gradient-blue text-white text-sm font-medium rounded-full shadow-lg">
                  Mais Popular
                </span>
              </div>

              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-green rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Rocket className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Profissional</h3>
                <p className="text-slate-600 font-medium mb-4">Você como referência</p>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-tervis-green mr-2 flex-shrink-0 mt-0.5" />
                  <span><strong>Prioridade sobre Essencial</strong></span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-tervis-green mr-2 flex-shrink-0 mt-0.5" />
                  <span>Perfil ampliado</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-tervis-green mr-2 flex-shrink-0 mt-0.5" />
                  <span>Selo "Profissional Verificado Tervis.AI"</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-tervis-green mr-2 flex-shrink-0 mt-0.5" />
                  <span>Mais indicações da IA</span>
                </li>
              </ul>

              <p className="text-sm text-slate-600 italic mb-6">
                O plano para quem quer autoridade e mais pacientes na região.
              </p>

              <Button
                fullWidth
                size="lg"
                className="bg-gradient-blue"
                onClick={() => window.location.href = '/planos'}
              >
                Escolher Profissional
              </Button>
            </Card>

            <Card className="border-2 border-purple-200 hover:shadow-2xl transition-all bg-gradient-to-br from-purple-50 to-white">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-400 rounded-2xl flex items-center justify-center mx-auto mb-4 ring-4 ring-purple-200">
                  <Crown className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-2 text-purple-900">Premium</h3>
                <p className="text-purple-700 font-medium mb-4">Exclusividade e liderança</p>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <Star className="w-5 h-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span><strong>Prioridade máxima: sempre aparece primeiro</strong></span>
                </li>
                <li className="flex items-start">
                  <Lock className="w-5 h-5 text-purple-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span><strong>Exclusividade em até 3 bairros</strong></span>
                </li>
                <li className="flex items-start">
                  <Award className="w-5 h-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Selo Premium dourado</span>
                </li>
                <li className="flex items-start">
                  <Target className="w-5 h-5 text-purple-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Ultra destaque nas buscas</span>
                </li>
                <li className="flex items-start">
                  <TrendingUp className="w-5 h-5 text-purple-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Recomendação preferencial da IA</span>
                </li>
              </ul>

              <p className="text-sm text-purple-700 italic mb-6 font-medium">
                A liderança da sua especialidade tem um nome: o seu.
              </p>

              <Button
                fullWidth
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-purple-400 hover:from-purple-700 hover:to-purple-500 shadow-lg shadow-purple-500/30"
                onClick={() => window.location.href = '/planos'}
              >
                Quero Exclusividade
              </Button>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-gradient-to-br from-purple-900 via-purple-800 to-slate-900 text-white">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <Crown className="w-16 h-16 mx-auto mb-6 text-yellow-400" />
            <h2 className="text-4xl font-bold mb-6">Por que assinar o Plano Premium?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {[
              'Você se torna a primeira escolha da IA',
              'Seus concorrentes aparecem só depois de você',
              'Você pode bloquear até 3 bairros inteiros',
              'Apenas um Premium por especialidade por bairro',
              'Você não disputa fila — você É a fila',
              'Selo Premium dourado visível em todo perfil',
            ].map((benefit, idx) => (
              <div key={idx} className="flex items-start gap-3 bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                <Check className="w-6 h-6 text-tervis-green flex-shrink-0 mt-0.5" />
                <span className="text-lg">{benefit}</span>
              </div>
            ))}
          </div>

          <Card className="bg-gradient-to-r from-yellow-500 to-yellow-400 border-0 shadow-2xl">
            <div className="text-center py-6">
              <p className="text-3xl font-bold text-slate-900">
                Enquanto eles aparecem… você lidera.
              </p>
            </div>
          </Card>
        </div>
      </section>

      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Perguntas Frequentes</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card
                key={index}
                className="cursor-pointer hover:shadow-lg transition-all"
                onClick={() => toggleFaq(index)}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{faq.question}</h3>
                  {openFaq === index ? (
                    <ChevronUp className="w-5 h-5 text-slate-600 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-600 flex-shrink-0" />
                  )}
                </div>
                {openFaq === index && (
                  <p className="mt-4 text-slate-600 leading-relaxed">{faq.answer}</p>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-32 px-4 bg-gradient-to-br from-slate-900 via-tervis-blue to-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDE2YzAtNC40MTggMy41ODItOCA4LThzOCAzLjU4MiA4IDgtMy41ODIgOC04IDgtOC0zLjU4Mi04LTh6bTAgMjRjMC00LjQxOCAzLjU4Mi04IDgtOHM4IDMuNTgyIDggOC0zLjU4MiA4LTggOC04LTMuNTgyLTgtOHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>

        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <h2 className="text-5xl font-bold mb-6">
            Pronto para ser o profissional mais<br />
            recomendado da sua cidade?
          </h2>
          <p className="text-2xl text-slate-300 mb-12">
            Sua especialidade. Sua cidade. Sua prioridade.
          </p>
          <Button
            size="lg"
            className="text-xl px-12 py-8 bg-gradient-to-r from-tervis-green to-emerald-500 hover:from-tervis-green/90 hover:to-emerald-600 shadow-2xl shadow-tervis-green/50"
            onClick={() => window.location.href = '/planos'}
          >
            <Crown className="w-6 h-6 mr-3" />
            Quero ser exclusivo na minha especialidade
          </Button>
          <p className="mt-8 text-slate-400">
            Garanta sua posição antes que outro profissional ocupe o lugar.
          </p>
        </div>
      </section>
    </div>
  );
}
