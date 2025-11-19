import React from 'react';
import { LayoutDashboard, FilePlus, History, Settings, LogOut, Shield, Zap } from 'lucide-react';
import { User, Company, PlanType } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  company?: Company;
  activePage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, user, company, activePage, onNavigate, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Visão Geral', icon: LayoutDashboard },
    { id: 'create-budget', label: 'Novo Orçamento', icon: FilePlus },
    { id: 'history', label: 'Histórico', icon: History },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-white flex-shrink-0">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-bold text-yellow-500 flex items-center gap-2">
            <Shield className="w-6 h-6" />
            CONSTRUE
          </h1>
          {company && (
            <div className="mt-4 text-sm text-slate-400">
              <p className="font-medium text-white">{company.name}</p>
              <p className="text-xs mt-1">{company.type}</p>
              <div className={`mt-2 inline-flex items-center px-2 py-1 rounded text-xs font-bold ${company.plan === PlanType.PREMIUM ? 'bg-yellow-500 text-slate-900' : 'bg-slate-700 text-gray-300'}`}>
                {company.plan === PlanType.PREMIUM ? <Zap className="w-3 h-3 mr-1" /> : null}
                {company.plan === PlanType.PREMIUM ? 'PREMIUM' : 'GRÁTIS'}
              </div>
            </div>
          )}
        </div>

        <nav className="p-4 space-y-2 flex-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activePage === item.id
                    ? 'bg-yellow-500 text-slate-900 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold">
              {user.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-red-400 hover:bg-slate-800 rounded-lg text-sm"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-screen">
        <div className="p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};