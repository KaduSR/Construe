
import React, { useState } from 'react';
import { Company, PlanType } from '../types';
import { AppService } from '../services/appService';
import { CheckCircle, Zap, Shield } from 'lucide-react';

interface SettingsProps {
  company: Company;
  onUpdate: () => void; // Trigger refresh
}

export const Settings: React.FC<SettingsProps> = ({ company, onUpdate }) => {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      await AppService.upgradePlan(company.id);
      alert("Plano atualizado para Premium com sucesso!");
      onUpdate();
    } catch (e) {
      console.error(e);
      alert("Erro ao atualizar plano.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h2 className="text-2xl font-bold text-gray-800">Configurações da Empresa</h2>

      {/* Company Info */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-start gap-6">
          <div className="w-24 h-24 bg-slate-100 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-300">
             <span className="text-xs text-gray-400 text-center">Logo da<br/>Empresa</span>
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-slate-800">{company.name}</h3>
            <p className="text-sm text-gray-500">CNPJ: {company.cnpj}</p>
            <p className="text-sm text-gray-500">{company.address}</p>
            <p className="text-sm text-gray-500">{company.phone}</p>
            <div className="pt-2">
               <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold uppercase">
                 {company.type}
               </span>
            </div>
          </div>
        </div>
      </div>

      {/* Plan Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Free Card */}
        <div className={`p-6 rounded-xl border-2 ${company.plan === PlanType.FREE ? 'border-slate-900 bg-white ring-4 ring-slate-50' : 'border-gray-100 bg-gray-50 opacity-70'}`}>
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-bold text-lg text-slate-800">Plano Grátis</h3>
              <p className="text-sm text-gray-500">Para quem está começando</p>
            </div>
            {company.plan === PlanType.FREE && <CheckCircle className="w-6 h-6 text-green-500" />}
          </div>
          <ul className="space-y-3 text-sm text-gray-600 mb-6">
            <li className="flex items-center gap-2"><Shield className="w-4 h-4" /> Até 3 Orçamentos</li>
            <li className="flex items-center gap-2 text-gray-400 line-through"><FileTextIcon className="w-4 h-4" /> Exportação PDF</li>
            <li className="flex items-center gap-2 text-gray-400 line-through"><HistoryIcon className="w-4 h-4" /> Histórico Ilimitado</li>
          </ul>
          <button disabled className="w-full py-2 rounded-lg bg-gray-100 text-gray-400 font-medium text-sm">
            {company.plan === PlanType.FREE ? 'Plano Atual' : 'Indisponível'}
          </button>
        </div>

        {/* Premium Card */}
        <div className={`p-6 rounded-xl border-2 relative overflow-hidden ${company.plan === PlanType.PREMIUM ? 'border-yellow-500 bg-white ring-4 ring-yellow-50' : 'border-yellow-200 bg-gradient-to-br from-yellow-50 to-white'}`}>
           {company.plan === PlanType.FREE && (
             <div className="absolute top-0 right-0 bg-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
               RECOMENDADO
             </div>
           )}
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                Premium <Zap className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              </h3>
              <p className="text-sm text-gray-500">Para construtoras e profissionais</p>
            </div>
            {company.plan === PlanType.PREMIUM && <CheckCircle className="w-6 h-6 text-green-500" />}
          </div>
           <ul className="space-y-3 text-sm text-gray-600 mb-6">
            <li className="flex items-center gap-2"><Shield className="w-4 h-4" /> Orçamentos <strong>Ilimitados</strong></li>
            <li className="flex items-center gap-2"><FileTextIcon className="w-4 h-4" /> Exportação <strong>PDF Profissional</strong></li>
            <li className="flex items-center gap-2"><HistoryIcon className="w-4 h-4" /> Histórico Completo</li>
            <li className="flex items-center gap-2"><Zap className="w-4 h-4" /> Remover Marca D'água</li>
          </ul>
          
          {company.plan === PlanType.FREE ? (
            <button 
              onClick={handleUpgrade}
              disabled={loading}
              className="w-full py-2 rounded-lg bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold text-sm transition-colors shadow-sm"
            >
              {loading ? 'Processando...' : 'Assinar Agora (R$ 29,90/mês)'}
            </button>
          ) : (
             <button disabled className="w-full py-2 rounded-lg bg-green-50 text-green-700 font-medium text-sm border border-green-100">
               Plano Ativo
             </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Icons helpers
const FileTextIcon = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
);
const HistoryIcon = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v5h5"/><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8"/></svg>
);
