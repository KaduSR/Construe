
import React, { useEffect, useState } from 'react';
import { Company } from '../types';
import { AppService } from '../services/appService';
import { TrendingUp, PieChart } from 'lucide-react';

export const FinancialReport: React.FC<{ company: Company }> = ({ company }) => {
  const [stats, setStats] = useState({ totalCost: 0, totalSale: 0, itemCount: 0 });

  useEffect(() => {
    AppService.getMaterials(company.id).then(materials => {
      const totalCost = materials.reduce((acc, m) => acc + m.costPrice, 0);
      const totalSale = materials.reduce((acc, m) => acc + m.salesPrice, 0);
      setStats({ totalCost, totalSale, itemCount: materials.length });
    });
  }, [company]);

  const potentialProfit = stats.totalSale - stats.totalCost;
  const margin = stats.totalCost > 0 ? (potentialProfit / stats.totalCost) * 100 : 0;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
        <PieChart className="w-6 h-6 text-yellow-500" /> Relatório Financeiro (Estoque)
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
           <p className="text-sm text-gray-500 font-medium">Valor em Estoque (Custo)</p>
           <h3 className="text-2xl font-bold text-slate-700 mt-2">R$ {stats.totalCost.toFixed(2)}</h3>
           <div className="mt-2 text-xs text-gray-400">{stats.itemCount} itens cadastrados</div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
           <p className="text-sm text-gray-500 font-medium">Valor de Venda Potencial</p>
           <h3 className="text-2xl font-bold text-green-600 mt-2">R$ {stats.totalSale.toFixed(2)}</h3>
           <div className="mt-2 text-xs text-green-600 flex items-center gap-1">
             <TrendingUp className="w-3 h-3" /> Preço ao cliente final
           </div>
        </div>

        <div className="bg-slate-900 p-6 rounded-xl shadow-sm text-white">
           <p className="text-sm text-gray-400 font-medium">Lucro Projetado (BDI)</p>
           <h3 className="text-2xl font-bold text-yellow-400 mt-2">R$ {potentialProfit.toFixed(2)}</h3>
           <div className="mt-2 text-xs text-gray-300">Margem média de {margin.toFixed(1)}%</div>
        </div>
      </div>
    </div>
  );
};
