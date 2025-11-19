
import React, { useEffect, useState } from 'react';
import { Budget, Company } from '../types';
import { AppService } from '../services/appService';
import { DollarSign, FileText, TrendingUp, AlertCircle } from 'lucide-react';

interface DashboardProps {
  company: Company;
}

export const Dashboard: React.FC<DashboardProps> = ({ company }) => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AppService.getBudgets(company.id).then(data => {
      setBudgets(data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [company.id]);

  const totalRevenue = budgets.reduce((acc, curr) => acc + curr.total, 0);
  const averageTicket = budgets.length > 0 ? totalRevenue / budgets.length : 0;

  if (loading) return <div className="p-10 text-center">Carregando painel...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Visão Geral</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Orçado</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">
                R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="p-3 bg-green-100 text-green-600 rounded-lg">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Orçamentos Emitidos</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">{budgets.length}</h3>
            </div>
            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
              <FileText className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Ticket Médio</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">
                R$ {averageTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Warning for Free Plan */}
      {company.plan === 'FREE' && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <h4 className="font-bold text-yellow-800">Plano Grátis Ativo</h4>
            <p className="text-sm text-yellow-700">
              Você utilizou {budgets.length} de 3 orçamentos disponíveis. 
              Faça o upgrade para Premium para liberar orçamentos ilimitados e exportação de PDF.
            </p>
          </div>
        </div>
      )}
      
      {/* Recent List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-800">Atividade Recente</h3>
        </div>
        <div className="p-0 overflow-x-auto">
          {budgets.length === 0 ? (
            <div className="p-8 text-center text-gray-500">Nenhum orçamento criado ainda.</div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600 font-medium">
                <tr>
                  <th className="px-6 py-3">Número</th>
                  <th className="px-6 py-3">Cliente</th>
                  <th className="px-6 py-3">Categoria</th>
                  <th className="px-6 py-3">Data</th>
                  <th className="px-6 py-3 text-right">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {budgets.slice(0, 5).map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 font-medium text-slate-700">#{b.number.toString().padStart(4, '0')}</td>
                    <td className="px-6 py-3">{b.clientName}</td>
                    <td className="px-6 py-3">
                      <span className="px-2 py-1 rounded-full text-xs bg-slate-100 text-slate-600 border border-slate-200">
                        {b.category}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-500">{new Date(b.createdAt).toLocaleDateString('pt-BR')}</td>
                    <td className="px-6 py-3 text-right font-bold text-slate-700">
                      R$ {b.total.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
