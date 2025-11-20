import React, { useState, useEffect } from 'react';
import { Company, Material } from '../types';
import { AppService } from '../services/appService';
import { Calculator, Grid, Box, Layers, DollarSign, Info, BrickWall, Droplet, ArrowRight } from 'lucide-react';

interface CalculatorsProps {
  company: Company;
}

// Configuração das Calculadoras Disponíveis
const allCalculators = [
  { 
    id: 'drywall-parede', 
    title: 'Parede Drywall', 
    niche: ['Geral', 'Gesso e Drywall'],
    icon: Layers,
    description: 'Cálculo de chapas, perfis e parafusos (Parede).'
  },
  { 
    id: 'pintura-area', 
    title: 'Tinta (Área)', 
    niche: ['Geral', 'Pintura'],
    icon: Droplet,
    description: 'Litros necessários por demão.'
  },
  { 
    id: 'alvenaria-tijolos', 
    title: 'Tijolos', 
    niche: ['Geral', 'Alvenaria'],
    icon: BrickWall,
    description: 'Estimativa de tijolos por m².'
  },
  { 
    id: 'concreto-volume', 
    title: 'Concreto (Volume)', 
    niche: ['Geral', 'Alvenaria'],
    icon: Box,
    description: 'Estimativa de volume em m³.'
  },
];


export const Calculators: React.FC<CalculatorsProps> = ({ company }) => {
  const [activeCalc, setActiveCalc] = useState<string>('');
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Inputs Gerais
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [margin, setMargin] = useState('10'); // 10% perda
  
  // Resultado
  const [result, setResult] = useState<any>(null);

  // Filtra calculadoras baseadas no nicho da empresa
  const availableCalculators = allCalculators.filter(c => 
    c.niche.includes(company.niche as any) || c.niche.includes('Geral')
  );

  useEffect(() => {
    AppService.getMaterials(company.id).then(data => {
        setMaterials(data);
        setLoading(false);
    });
    // Define a calculadora padrão como a primeira do nicho
    if (availableCalculators.length > 0) {
        setActiveCalc(availableCalculators[0].id);
    }
  }, [company.id, company.niche]);

  const calculateDrywall = () => {
    const w = parseFloat(width) || 0;
    const h = parseFloat(height) || 0;
    const area = w * h;
    const safety = 1 + (parseFloat(margin) / 100);

    if (area === 0) return;

    // Constantes de consumo Drywall (Por m²)
    const CONSUMO_CHAPA = 1 / (1.20 * 2.40); // 1 chapa a cada 2.88m²
    const CONSUMO_PARAFUSO = 15; // 15 por m²
    const CONSUMO_MASSA = 1.0; // 1kg por m²

    // Cálculo da Quantidade
    const qtdChapas = Math.ceil(area * CONSUMO_CHAPA * safety);
    const qtdParafusos = Math.ceil(area * CONSUMO_PARAFUSO * safety); 
    const qtdMontantes = Math.ceil((w / 0.60) * h); // Montantes a cada 0.60m, vezes a altura
    const qtdGuias = Math.ceil((w * 2) / 3); // Chão e Teto, em guias de 3m
    const qtdMassa = Math.ceil(area * CONSUMO_MASSA);

    // Tentar achar preços no estoque (por palavra-chave)
    const priceChapa = materials.find(m => m.name.toLowerCase().includes('chapa') || m.name.toLowerCase().includes('drywall'))?.salesPrice || 0;
    const priceMontante = materials.find(m => m.name.toLowerCase().includes('montante'))?.salesPrice || 0;
    const priceParafuso = materials.find(m => m.name.toLowerCase().includes('parafuso'))?.salesPrice || 0;
    
    // Cálculo do Custo Total de Venda
    const totalEstimado = (qtdChapas * priceChapa) + (qtdMontantes * priceMontante) + (qtdParafusos / 1000 * priceParafuso); // Parafusos contados por milheiro (simulação)

    setResult({
      items: [
        { name: 'Chapas ST (1.20x2.40)', qtd: qtdChapas, obs: 'Com base na área' },
        { name: 'Montantes (Perfis)', qtd: qtdMontantes, obs: 'Espaçamento 60cm' },
        { name: 'Guias (Perfis)', qtd: qtdGuias, obs: 'Piso e Teto (3m)' },
        { name: 'Parafusos (Unidades)', qtd: qtdParafusos, obs: '15 por m²' },
        { name: 'Massa/Fita (Kg)', qtd: `${qtdMassa} kg`, obs: 'Tratamento de juntas' }
      ],
      totalValue: totalEstimado > 0 ? totalEstimado : null,
      area: area.toFixed(2)
    });
  };
  
  if (loading) return <div className="p-8 text-center text-gray-500">Carregando dados...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Calculator className="w-6 h-6 text-yellow-500" /> 
          Calculadoras Inteligentes
        </h2>
        <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold uppercase">
          Especialidade: {company.niche || 'Geral'}
        </span>
      </div>

      {/* Seleção de Calculadora Filtrada */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {availableCalculators.map((calc) => (
          <button
            key={calc.id}
            onClick={() => { setActiveCalc(calc.id); setResult(null); }}
            className={`p-4 rounded-xl border-2 transition-all text-left relative group ${
              activeCalc === calc.id 
              ? 'border-slate-900 bg-slate-50' 
              : 'border-gray-100 hover:border-yellow-400 bg-white'
            }`}
          >
            <div className="mb-2 p-2 bg-white rounded-full w-fit shadow-sm group-hover:scale-110 transition-transform">
              <calc.icon className="w-5 h-5 text-slate-700" />
            </div>
            <h3 className="font-bold text-slate-800">{calc.title}</h3>
            <p className="text-xs text-gray-500 mt-1">{calc.description}</p>
          </button>
        ))}
      </div>

      {/* Área de Cálculo */}
      {activeCalc === 'drywall-parede' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden flex flex-col md:flex-row">
          
          {/* Formulário */}
          <div className="p-6 md:w-1/2 border-r border-gray-100">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              Dados da Parede Drywall
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Largura (m)</label>
                  <input 
                    type="number" step="0.1" className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none"
                    value={width} onChange={e => setWidth(e.target.value)} placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Altura (m) / Pé-direito</label>
                  <input 
                    type="number" step="0.1" className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none"
                    value={height} onChange={e => setHeight(e.target.value)} placeholder="0.00"
                  />
                </div>
              </div>
              
              <div>
                 <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Perda / Margem de Segurança (%)</label>
                 <input 
                    type="range" min="0" max="20" step="5" className="w-full accent-yellow-500"
                    value={margin} onChange={e => setMargin(e.target.value)}
                 />
                 <div className="text-right text-xs text-gray-500">{margin}% de segurança</div>
              </div>

              <button 
                onClick={calculateDrywall}
                className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition-colors"
              >
                Calcular Materiais e Custo
              </button>
            </div>

            {/* Conteúdo Educativo (Drywall) */}
               <div className="mt-6 p-4 bg-blue-50 rounded-lg text-sm text-blue-800">
                 <div className="flex items-center gap-2 font-bold mb-2">
                   <Info className="w-4 h-4" /> Como calcular (Regras de Ouro)
                 </div>
                 <ul className="list-disc pl-4 space-y-1 opacity-80">
                   <li>**Chapas:** Área total + 10% de perda.</li>
                   <li>**Perfis:** Guias e montantes conforme pé-direito.</li>
                   <li>**Parafusos:** Em média 15 por m².</li>
                   <li>**Tipos:** Use placas ST para áreas secas e RU para áreas molhadas.</li>
                 </ul>
               </div>
          </div>

          {/* Resultado */}
          <div className="p-6 md:w-1/2 bg-slate-50 flex flex-col justify-center">
            {!result ? (
              <div className="text-center text-gray-400">
                <Calculator className="w-12 h-12 mx-auto mb-2 opacity-20" />
                <p>Preencha as medidas para gerar a lista e o custo.</p>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex justify-between items-end mb-4 border-b pb-4">
                   <div>
                     <p className="text-xs text-gray-500 uppercase font-bold">Área Total</p>
                     <p className="text-3xl font-black text-slate-800">{result.area} m²</p>
                   </div>
                   {result.totalValue && (
                     <div className="text-right">
                       <p className="text-xs text-gray-500 uppercase font-bold">Custo de Venda Estimado</p>
                       <p className="text-xl font-bold text-green-600 flex items-center justify-end gap-1">
                         <DollarSign className="w-5 h-5" /> R$ {result.totalValue.toFixed(2)}*
                       </p>
                     </div>
                   )}
                </div>

                <h4 className="font-bold text-gray-700 mb-3">Lista de Materiais Sugerida:</h4>
                <ul className="space-y-3">
                  {result.items.map((item: any, idx: number) => (
                    <li key={idx} className="flex justify-between items-center bg-white p-3 rounded border border-gray-100 shadow-sm">
                      <div>
                        <span className="font-bold text-slate-800 block">{item.name}</span>
                        <span className="text-xs text-gray-400">{item.obs}</span>
                      </div>
                      <span className="bg-yellow-100 text-yellow-800 font-bold px-3 py-1 rounded-full text-sm">
                        {item.qtd}
                      </span>
                    </li>
                  ))}
                </ul>
                
                <p className="text-[10px] text-gray-400 mt-4 text-center">
                  * O custo estimado depende do preço de venda dos materiais que você cadastrou no seu estoque.
                </p>
                
                <button className="mt-4 w-full border-2 border-slate-900 text-slate-900 font-bold py-2 rounded-lg hover:bg-slate-100 transition-colors">
                  Gerar Orçamento com esta Lista
                </button>
              </div>
            )}
          </div>

        </div>
      )}
      {/* Aqui você adicionaria as outras calculadoras (Alvenaria, Pintura) usando o activeCalc */}
    </div>
  );
};