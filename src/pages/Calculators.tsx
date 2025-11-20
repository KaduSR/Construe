
import React, { useState, useEffect } from 'react';
import { Company, Material } from '../types';
import { AppService } from '../services/appService';
import { Calculator, Grid, Box, Layers, DollarSign, Info, BrickWall, Droplet, ArrowRight, Shield, TrendingUp, Ruler, LayoutTemplate, PenTool, Wrench, Anchor, HelpCircle } from 'lucide-react';

interface CalculatorsProps {
  company: Company;
}

type CalcType = 
  'drywall-parede' | 'forro-drywall' | 'forro-convencional' | 
  'escada' | 'laje' | 'piso-revestimento' | 'contrapiso' | 'rampa' | 
  'hidraulica-tubos' | 'impermeabilizacao' | 'rodape' | 'alvenaria' | 'pintura';

// Conteúdo Educativo e Configuração
const calculatorData: Record<string, { tips: string[], faqs: {p: string, r: string}[] }> = {
  'drywall-parede': {
    tips: [
      "Medir o ambiente corretamente (Largura x Altura).",
      "Montagem de perfis alinhada e nivelada (espaçamento 40 ou 60cm).",
      "Use placas ST (Standard) para áreas secas e RU (Resistente à Umidade) para banheiros.",
      "Acabamento de juntas com fita e massa específica é crucial."
    ],
    faqs: [
      { p: "Qual a diferença entre parede divisória e estrutural?", r: "Divisória é leve e modular; estrutural (Steel Frame) suporta peso da laje/telhado." },
      { p: "Qual a altura máxima segura?", r: "Geralmente até 3m com montantes simples de 48mm. Acima disso, use montantes duplos ou de 70/90mm." }
    ]
  },
  'forro-drywall': {
    tips: [
      "Verifique o nivelamento do teto com nível a laser ou mangueira.",
      "Mantenha pé-direito mínimo de 2,50m sempre que possível.",
      "Defina posição de luminárias antes de fechar as placas."
    ],
    faqs: [
      { p: "Quanto tempo leva a instalação?", r: "É rápido, cerca de 2-3 dias para um apartamento pequeno, incluindo tratamento de juntas." },
      { p: "Posso instalar lustre pesado?", r: "Sim, mas deve ser fixado na laje ou em reforço de madeira acima do gesso, nunca só na placa." }
    ]
  },
  'forro-convencional': {
    tips: [
       "Umedeça as placas antes de chumbar para melhor aderência.",
       "Use sisal com gesso cola para fixação robusta.",
       "O acabamento é artesanal, capriche na junção das placas 60x60."
    ],
    faqs: [
      { p: "Diferença pro Drywall?", r: "O convencional é mais barato em material, mas faz mais sujeira e demora mais para secar." }
    ]
  },
  'escada': {
    tips: [
      "Fórmula de Blondel: 2E + P = 63 a 64cm (E=Espelho, P=Piso).",
      "Altura ideal do degrau (espelho) é entre 16 e 18cm.",
      "Profundidade do piso ideal é entre 25 e 30cm."
    ],
    faqs: [
      { p: "Posso fazer degrau com 20cm de altura?", r: "Não é recomendado, fica cansativo e perigoso para idosos e crianças." }
    ]
  },
  'piso-revestimento': {
    tips: [
      "Sempre compre 10% a mais para recortes e perdas (ou 15% se for colocação diagonal).",
      "Verifique o nível do contrapiso antes de começar.",
      "Siga a seta no verso do piso para manter o desenho/tom."
    ],
    faqs: [
       { p: "Qual argamassa usar?", r: "AC-I (Interno), AC-II (Externo/Interno), AC-III (Porcelanatos grandes e Fachadas)." }
    ]
  }
  // Adicione outros conforme necessário...
};

const allCalculators = [
  { id: 'drywall-parede', title: 'Parede Drywall', niche: ['Geral', 'Gesso e Drywall'], icon: BrickWall, desc: 'Chapas, perfis e parafusos.' },
  { id: 'forro-drywall', title: 'Forro Acartonado', niche: ['Geral', 'Gesso e Drywall'], icon: Layers, desc: 'Estrutura F530 e placas.' },
  { id: 'forro-convencional', title: 'Forro Convencional', niche: ['Geral', 'Gesso e Drywall'], icon: Grid, desc: 'Placas 60x60 e sisal.' },
  { id: 'alvenaria', title: 'Alvenaria/Tijolos', niche: ['Geral', 'Alvenaria'], icon: Box, desc: 'Tijolos e argamassa.' },
  { id: 'escada', title: 'Cálculo de Escada', niche: ['Geral', 'Alvenaria', 'Engenharia'], icon: LayoutTemplate, desc: 'Degraus e espelhos.' },
  { id: 'piso-revestimento', title: 'Piso e Azulejo', niche: ['Geral', 'Alvenaria', 'Acabamento'], icon: LayoutTemplate, desc: 'Peças e argamassa.' },
  { id: 'contrapiso', title: 'Contrapiso', niche: ['Geral', 'Alvenaria'], icon: Layers, desc: 'Volume de massa/concreto.' },
  { id: 'laje', title: 'Laje Treliçada', niche: ['Geral', 'Alvenaria'], icon: Grid, desc: 'Vigotas e isopor.' },
  { id: 'pintura', title: 'Pintura', niche: ['Geral', 'Pintura'], icon: Droplet, desc: 'Tinta por demão.' },
  { id: 'rampa', title: 'Rampa e Caída', niche: ['Geral', 'Alvenaria', 'Hidráulica'], icon: TrendingUp, desc: 'Inclinação percentual.' },
  { id: 'hidraulica-tubos', title: 'Tubulação', niche: ['Geral', 'Hidráulica'], icon: Wrench, desc: 'Estimativa linear.' },
  { id: 'rodape', title: 'Rodapé', niche: ['Geral', 'Alvenaria', 'Acabamento'], icon: Ruler, desc: 'Peças lineares.' }
];

export const Calculators: React.FC<CalculatorsProps> = ({ company }) => {
  const [activeCalc, setActiveCalc] = useState<string>('drywall-parede');
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Inputs Gerais
  const [width, setWidth] = useState(''); // Usado como Largura, Perímetro ou Comprimento
  const [height, setHeight] = useState(''); // Usado como Altura ou Largura
  const [depth, setDepth] = useState(''); // Usado para espessura ou terceiro eixo
  const [margin, setMargin] = useState('10');
  
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    AppService.getMaterials(company.id).then(data => {
        setMaterials(data);
        setLoading(false);
    });
  }, [company.id]);

  // Filtro de Niche
  const availableCalculators = allCalculators.filter(c => 
    c.niche.includes(company.niche as any) || c.niche.includes('Geral')
  );

  const getPrice = (keyword: string) => materials.find(m => m.name.toLowerCase().includes(keyword))?.salesPrice || 0;

  const calculate = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(width) || 0;
    const h = parseFloat(height) || 0;
    const d = parseFloat(depth) || 0;
    const safety = 1 + (parseFloat(margin) / 100);
    const area = w * h;

    let items: any[] = [];
    let totalVal = 0;
    let displayArea = `${area.toFixed(2)} m²`;

    switch (activeCalc) {
      // --- GESSO ---
      case 'drywall-parede':
        const qtdChapa = Math.ceil((area / 2.88) * safety); // 2.88m² por chapa
        const montantes = Math.ceil((w / 0.60) * h * safety); // Aprox
        items.push({ name: 'Chapas Drywall', qtd: qtdChapa, obs: 'ST 1.20x2.40' });
        items.push({ name: 'Montantes', qtd: montantes, obs: 'Perfil estrutural' });
        items.push({ name: 'Guias', qtd: Math.ceil(w * 2 / 3), obs: 'Piso/Teto' });
        totalVal = (qtdChapa * getPrice('chapa')) + (montantes * getPrice('montante'));
        break;

      case 'forro-drywall':
        const chapasF = Math.ceil((area / 2.88) * safety);
        items.push({ name: 'Chapas Drywall', qtd: chapasF, obs: 'Teto' });
        items.push({ name: 'Perfil F530', qtd: Math.ceil(area * 2.5), obs: 'Metros lineares' });
        items.push({ name: 'Tirantes', qtd: Math.ceil(area / 1.5), obs: 'Unidades' });
        totalVal = (chapasF * getPrice('chapa'));
        break;
        
      case 'forro-convencional':
        const placas = Math.ceil((area / 0.36) * safety); // Placa 60x60 = 0.36m²
        items.push({ name: 'Placas 60x60', qtd: placas, obs: 'Gesso fundido' });
        items.push({ name: 'Sisal', qtd: `${(area * 0.5).toFixed(1)} kg`, obs: 'Amarração' });
        items.push({ name: 'Gesso Cola', qtd: `${(area * 1).toFixed(1)} kg`, obs: 'Fixação' });
        totalVal = (placas * getPrice('placa'));
        break;

      // --- ALVENARIA & CONSTRUÇÃO ---
      case 'alvenaria':
        const tijolos = Math.ceil(area * 25 * safety); // 25 tijolos/m² (exemplo)
        items.push({ name: 'Tijolos/Blocos', qtd: tijolos, obs: 'Baiano ou concreto' });
        items.push({ name: 'Cimento', qtd: Math.ceil(area * 0.3), obs: 'Sacos 50kg' });
        totalVal = (tijolos/1000 * getPrice('tijolo')) + (Math.ceil(area * 0.3) * getPrice('cimento'));
        break;
      
      case 'escada':
        // H = Altura total (usando input height)
        // W = Largura degrau (usando input width)
        const alturaDegrau = 0.18; // 18cm ideal
        const numDegraus = Math.ceil(h / alturaDegrau);
        const espelhoReal = (h / numDegraus).toFixed(3);
        const pisoIdeal = 0.28; // 28cm
        const comprimentoTotal = (numDegraus - 1) * pisoIdeal;
        
        displayArea = `${h}m Altura`;
        items.push({ name: 'Número de Degraus', qtd: numDegraus, obs: `Espelho de ${espelhoReal}m` });
        items.push({ name: 'Comprimento Total', qtd: `${comprimentoTotal.toFixed(2)}m`, obs: 'Espaço horizontal necessário' });
        break;

      case 'piso-revestimento':
        const qtdPiso = Math.ceil(area * safety);
        items.push({ name: 'Piso/Revestimento', qtd: `${qtdPiso} m²`, obs: `Inclui ${margin}% perda` });
        items.push({ name: 'Argamassa', qtd: `${Math.ceil(area * 4)} kg`, obs: '4kg/m² médio' });
        items.push({ name: 'Rejunte', qtd: `${Math.ceil(area * 0.3)} kg`, obs: 'Aprox. 300g/m²' });
        totalVal = (qtdPiso * getPrice('piso')) + (Math.ceil(area*4) * getPrice('argamassa'));
        break;

      case 'contrapiso':
        const volConcreto = area * (d || 0.05); // 5cm default
        displayArea = `${area.toFixed(2)} m² (Vol: ${volConcreto.toFixed(2)} m³)`;
        items.push({ name: 'Areia Média', qtd: `${(volConcreto * 0.7).toFixed(2)} m³`, obs: 'Traço base' });
        items.push({ name: 'Cimento', qtd: `${Math.ceil(volConcreto * 7)} sc`, obs: 'Sacos 50kg' });
        break;

      case 'laje':
        items.push({ name: 'Vigotas Trilho', qtd: Math.ceil(w * 2), obs: 'Metros lineares aprox' });
        items.push({ name: 'Isopor/Lajota', qtd: Math.ceil(area * 3.5), obs: 'Peças' });
        items.push({ name: 'Concreto Usinado', qtd: `${(area * 0.08).toFixed(1)} m³`, obs: 'Capa 8cm' });
        break;
      
      // --- OUTROS ---
      case 'pintura':
        const litros = Math.ceil((area * 2) / 10); // 2 demãos, rendimento 10m²/L
        items.push({ name: 'Tinta', qtd: `${litros} L`, obs: 'Considerando 2 demãos' });
        items.push({ name: 'Selador', qtd: `${Math.ceil(area/15)} L`, obs: 'Preparação' });
        totalVal = litros * getPrice('tinta');
        break;

      case 'rampa':
        // H = Altura, W = Comprimento
        const inclinacao = (h / w) * 100;
        displayArea = `Inclinação: ${inclinacao.toFixed(1)}%`;
        items.push({ name: 'Status', qtd: inclinacao <= 8.33 ? 'Acessível (NBR 9050)' : 'Muito Íngreme', obs: 'Ideal máx 8.33%' });
        break;

      case 'rodape':
        // W = Perímetro
        const pecas = Math.ceil(w / 2); // Peças de 2m?
        displayArea = `${w} metros lineares`;
        items.push({ name: 'Peças Rodapé', qtd: pecas, obs: 'Considerando barras de 2m' });
        items.push({ name: 'Cola/Prego', qtd: '1 un', obs: 'Kit fixação' });
        break;
        
      case 'hidraulica-tubos':
        // W = Comprimento total
        items.push({ name: 'Tubos PVC', qtd: Math.ceil(w / 6), obs: 'Barras de 6m' });
        items.push({ name: 'Lixa/Adesivo', qtd: '1 un', obs: 'Kit consumo' });
        displayArea = `${w} metros`;
        break;
    }

    setResult({ items, totalVal, displayArea });
  };

  // Labels dinâmicos
  const getLabelW = () => {
    if (activeCalc === 'rodape' || activeCalc === 'hidraulica-tubos') return 'Comprimento Total (m)';
    if (activeCalc === 'escada') return 'Largura do Degrau (m) [Opcional]';
    return 'Largura (m)';
  };
  const getLabelH = () => {
    if (activeCalc === 'rodape' || activeCalc === 'hidraulica-tubos') return null; // Esconder
    if (activeCalc === 'escada' || activeCalc === 'rampa') return 'Altura / Desnível (m)';
    return 'Comprimento / Altura (m)';
  };
  const showDepth = ['contrapiso'].includes(activeCalc);

  // Get Content Info
  const info = calculatorData[activeCalc] || { tips: [], faqs: [] };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Calculator className="w-6 h-6 text-yellow-500" /> 
          Calculadoras Inteligentes
        </h2>
        <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold uppercase">
          {company.niche || 'Geral'}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {availableCalculators.map((calc) => (
          <button
            key={calc.id}
            onClick={() => { setActiveCalc(calc.id); setResult(null); setWidth(''); setHeight(''); }}
            className={`p-3 rounded-xl border-2 transition-all text-left relative hover:shadow-md ${
              activeCalc === calc.id 
              ? 'border-slate-900 bg-slate-50' 
              : 'border-gray-100 bg-white'
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <calc.icon className="w-5 h-5 text-slate-700" />
              </div>
              <h3 className="font-bold text-sm text-slate-800 leading-tight">{calc.title}</h3>
            </div>
            <p className="text-[10px] text-gray-500">{calc.desc}</p>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden flex flex-col lg:flex-row">
        
        {/* Input Section */}
        <div className="p-6 lg:w-1/3 border-r border-gray-100 bg-gray-50/50">
          <h3 className="font-bold text-lg mb-4 text-gray-700">Parâmetros</h3>
          
          <form onSubmit={calculate} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{getLabelW()}</label>
              <input 
                type="number" step="0.01" required className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none bg-white"
                value={width} onChange={e => setWidth(e.target.value)} placeholder="0.00"
              />
            </div>

            {getLabelH() && (
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{getLabelH()}</label>
                <input 
                  type="number" step="0.01" required className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none bg-white"
                  value={height} onChange={e => setHeight(e.target.value)} placeholder="0.00"
                />
              </div>
            )}

            {showDepth && (
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Espessura (m)</label>
                <input 
                  type="number" step="0.01" className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none bg-white"
                  value={depth} onChange={e => setDepth(e.target.value)} placeholder="Ex: 0.05"
                />
              </div>
            )}
            
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Margem de Perda (%)</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="range" min="0" max="20" step="5" className="flex-1 accent-yellow-500"
                    value={margin} onChange={e => setMargin(e.target.value)}
                  />
                  <span className="text-xs font-mono bg-gray-200 px-2 py-1 rounded">{margin}%</span>
                </div>
            </div>

            <button className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
              <Calculator className="w-4 h-4" /> Calcular
            </button>
          </form>

          {/* Info Box Mobile only if needed, otherwise desktop shows on right */}
        </div>

        {/* Result Section */}
        <div className="p-6 lg:w-1/3 flex flex-col border-r border-gray-100">
           {!result ? (
             <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center p-8">
               <Grid className="w-12 h-12 mb-2 opacity-20" />
               <p>Preencha os dados para ver a estimativa.</p>
             </div>
           ) : (
             <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
               <div className="mb-4 pb-4 border-b border-dashed border-gray-200">
                 <p className="text-xs text-gray-500 uppercase font-bold mb-1">Referência</p>
                 <p className="text-2xl font-black text-slate-800">{result.displayArea}</p>
                 {result.totalVal > 0 && (
                   <p className="text-green-600 font-bold text-lg mt-1 flex items-center">
                     <DollarSign className="w-4 h-4" /> Est. R$ {result.totalVal.toFixed(2)}
                   </p>
                 )}
               </div>
               
               <div className="flex-1 overflow-y-auto">
                 <h4 className="font-bold text-sm text-gray-700 mb-3 uppercase tracking-wider">Materiais</h4>
                 <ul className="space-y-3">
                   {result.items.map((item: any, idx: number) => (
                     <li key={idx} className="flex justify-between items-center text-sm">
                       <div>
                         <span className="font-semibold text-slate-800 block">{item.name}</span>
                         <span className="text-xs text-gray-400">{item.obs}</span>
                       </div>
                       <span className="bg-yellow-100 text-yellow-900 font-bold px-3 py-1 rounded-full">
                         {item.qtd}
                       </span>
                     </li>
                   ))}
                 </ul>
               </div>

               <button className="mt-6 w-full border border-slate-300 text-slate-700 font-bold py-2 rounded-lg hover:bg-slate-50 transition-colors text-sm">
                 Copiar Lista
               </button>
             </div>
           )}
        </div>

        {/* Educational Section */}
        <div className="p-6 lg:w-1/3 bg-blue-50/50">
           <div className="mb-6">
             <h4 className="flex items-center gap-2 font-bold text-blue-900 mb-3">
               <Info className="w-4 h-4" /> Dicas Profissionais
             </h4>
             {info.tips.length > 0 ? (
               <ul className="space-y-2">
                 {info.tips.map((tip, i) => (
                   <li key={i} className="text-sm text-blue-800 flex gap-2 items-start">
                     <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0"></span>
                     {tip}
                   </li>
                 ))}
               </ul>
             ) : (
               <p className="text-sm text-blue-400 italic">Selecione uma calculadora para ver dicas.</p>
             )}
           </div>

           <div>
             <h4 className="flex items-center gap-2 font-bold text-blue-900 mb-3">
               <HelpCircle className="w-4 h-4" /> Perguntas Frequentes
             </h4>
             {info.faqs.length > 0 ? (
               <div className="space-y-3">
                 {info.faqs.map((faq, i) => (
                   <div key={i} className="bg-white p-3 rounded-lg border border-blue-100 shadow-sm">
                     <p className="text-xs font-bold text-blue-900 mb-1">{faq.p}</p>
                     <p className="text-xs text-slate-600">{faq.r}</p>
                   </div>
                 ))}
               </div>
             ) : (
               <p className="text-sm text-blue-400 italic">Sem FAQs disponíveis.</p>
             )}
           </div>
        </div>

      </div>
    </div>
  );
};
