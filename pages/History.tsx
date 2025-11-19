
import React, { useEffect, useState } from 'react';
import { Budget, Company, PlanType } from '../types';
import { AppService } from '../services/appService';
import { generateBudgetPDF } from '../services/pdfService';
import { Download, Lock, Search } from 'lucide-react';

interface HistoryProps {
  company: Company;
}

export const History: React.FC<HistoryProps> = ({ company }) => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AppService.getBudgets(company.id)
      .then(setBudgets)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [company.id]);

  const filteredBudgets = budgets.filter(b => 
    b.clientName.toLowerCase().includes(filter.toLowerCase()) || 
    b.number.toString().includes(filter)
  );

  const handleDownload = (budget: Budget) => {
    if (company.plan === PlanType.FREE) {
      alert("Funcionalidade Premium! Faça upgrade para exportar em PDF.");
      return;
    }
    generateBudgetPDF(budget, company);
  };

  if (loading) return <div className="p-8 text-center">Carregando histórico...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Histórico de Orçamentos</h2>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input 
            type="text"
            placeholder="Buscar cliente ou número..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-600 text-sm">
              <tr>
                <th className="px-6 py-4 font-medium">Orçamento</th>
                <th className="px-6 py-4 font-medium">Cliente</th>
                <th className="px-6 py-4 font-medium">Categoria</th>
                <th className="px-6 py-4 font-medium">Data</th>
                <th className="px-6 py-4 font-medium text-right">Valor Total</th>
                <th className="px-6 py-4 font-medium text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filteredBudgets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">Nenhum orçamento encontrado.</td>
                </tr>
              ) : filteredBudgets.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-700">#{b.number.toString().padStart(4, '0')}</td>
                  <td className="px-6 py-4">{b.clientName}</td>
                  <td className="px-6 py-4">
                     <span className="px-2 py-1 rounded-full text-xs bg-blue-50 text-blue-700 border border-blue-100">
                      {b.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{new Date(b.createdAt).toLocaleDateString('pt-BR')}</td>
                  <td className="px-6 py-4 text-right font-bold text-slate-800">R$ {b.total.toFixed(2)}</td>
                  <td className="px-6 py-4 flex justify-center gap-2">
                    <button 
                      onClick={() => handleDownload(b)}
                      className={`p-2 rounded-lg border transition-all flex items-center gap-2 ${
                        company.plan === PlanType.PREMIUM 
                        ? 'border-slate-200 text-slate-700 hover:bg-slate-100' 
                        : 'border-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                      title={company.plan === PlanType.FREE ? "Disponível apenas no Premium" : "Baixar PDF"}
                    >
                      {company.plan === PlanType.FREE ? <Lock className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                      {company.plan === PlanType.FREE ? '' : 'PDF'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
