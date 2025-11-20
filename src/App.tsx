
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { CreateBudget } from './pages/CreateBudget';
import { History } from './pages/History';
import { Settings } from './pages/Settings';
import { Materials } from './pages/Materials';
import { FinancialReport } from './pages/FinancialReport';
import { Calculators } from './pages/Calculators';
import { AppService } from './services/appService';
import { User, Company, CompanyNiche } from './types';
import { Hammer, Briefcase, LogIn, Loader2, Upload } from 'lucide-react';

const AuthScreen = ({ onLogin }: { onLogin: (u: User, c: Company) => void }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Register State
  const [companyName, setCompanyName] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [type, setType] = useState('Reforma Geral');
  const [niche, setNiche] = useState<CompanyNiche>('Geral');
  const [phone, setPhone] = useState('');
  
  // Address Fields
  const [street, setStreet] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [cep, setCep] = useState('');

  const [userName, setUserName] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);

  // Formatters
  const formatCNPJ = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .slice(0, 18);
  };

  const formatCEP = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/^(\d{5})(\d)/, '$1-$2')
      .slice(0, 9);
  };

  const formatPhone = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/^(\d{2})(\d)/, '($1) $2')
      .replace(/(\d)(\d{4})$/, '$1-$2')
      .slice(0, 15);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await AppService.loginWithGoogle();
    } catch (err: any) {
      console.error("Google Login Error:", err);
      setError(AppService.getErrorMessage(err));
      setLoading(false);
    }
  };

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await AppService.login(email, password);
        const { user, company } = await AppService.getCurrentUser();
        if (user && company) {
          onLogin(user, company);
        } else {
           setError('Usuário ou empresa não encontrados. Verifique suas credenciais.');
        }
      } else {
        // Validations
        const cleanCNPJ = cnpj.replace(/\D/g, '');
        if (cleanCNPJ.length !== 14) {
          setError('CNPJ inválido. O formato deve ter 14 dígitos.');
          setLoading(false);
          return;
        }

        const cleanCEP = cep.replace(/\D/g, '');
        if (cleanCEP.length !== 8) {
          setError('CEP inválido. Digite os 8 números.');
          setLoading(false);
          return;
        }

        if (password.length < 6) {
          setError('A senha deve ter no mínimo 6 caracteres.');
          setLoading(false);
          return;
        }

        await AppService.registerCompany(
          { 
            name: companyName, 
            cnpj, 
            type, 
            niche,
            email: email, 
            phone: phone, 
            street,
            neighborhood,
            city,
            state,
            zipCode: cep,
            logoFile: logoFile 
          },
          { name: userName, email: email, password: password }
        );
        // Attempt auto-login or check session
        const { user, company } = await AppService.getCurrentUser();
        if (user && company) {
          onLogin(user, company);
        } else {
           setError('Conta criada! Faça login para continuar.');
           setIsLogin(true);
        }
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      const msg = AppService.getErrorMessage(err);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-slate-800 p-6 text-center border-b border-slate-700">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-yellow-500 mb-3">
            <Hammer className="w-6 h-6 text-slate-900" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">CONSTRUE</h1>
          <p className="text-slate-400 text-sm">Gestão Profissional de Orçamentos</p>
        </div>
        
        <div className="p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 break-words whitespace-pre-wrap">
              {error}
            </div>
          )}

          <div className="space-y-4 mb-6">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full bg-white text-slate-700 font-bold py-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors flex items-center justify-center gap-3 shadow-sm"
            >
              {/* Ícone SVG do Google */}
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Entrar com Google
            </button>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink-0 mx-4 text-slate-400 text-sm">ou continue com e-mail</span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>
          </div>

          <form onSubmit={handleAction} className="space-y-4">
            {!isLogin && (
              <>
                 <h3 className="font-bold text-gray-800 border-b pb-2 mb-2">Dados da Empresa</h3>
                 <input 
                   type="text" required placeholder="Nome da Empresa"
                   className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-2"
                   value={companyName} onChange={e => setCompanyName(e.target.value)}
                 />
                 <input 
                   type="text" required placeholder="CNPJ (00.000.000/0000-00)"
                   className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-2"
                   value={cnpj} 
                   onChange={e => setCnpj(formatCNPJ(e.target.value))}
                   maxLength={18}
                 />
                 <div className="grid grid-cols-2 gap-2 mb-2">
                    <input 
                      type="text" placeholder="Telefone"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2"
                      value={phone} onChange={e => setPhone(formatPhone(e.target.value))}
                      maxLength={15}
                    />
                    <select 
                      className="w-full border border-gray-300 rounded-lg px-4 py-2"
                      value={type} onChange={e => setType(e.target.value)}
                    >
                        <option>Reforma Geral</option>
                        <option>Gesso e Drywall</option>
                        <option>Elétrica</option>
                        <option>Pintura</option>
                    </select>
                 </div>
                 
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Especialidade (Filtro Calculadoras)</label>
                    <select 
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-2"
                      value={niche} onChange={e => setNiche(e.target.value as CompanyNiche)}
                    >
                        <option value="Geral">0. Construtora Geral</option>
                        <option value="Gesso e Drywall">1. Gesso e Drywall</option>
                        <option value="Alvenaria">2. Alvenaria</option>
                        <option value="Pintura">3. Pintura</option>
                        <option value="Elétrica">4. Elétrica</option>
                        <option value="Hidráulica">5. Hidráulica</option>
                    </select>
                 </div>
                 
                 {/* New Address Fields */}
                 <div className="space-y-2 mb-2">
                   <input 
                     type="text" required placeholder="Endereço (Rua, Número)"
                     className="w-full border border-gray-300 rounded-lg px-4 py-2"
                     value={street} onChange={e => setStreet(e.target.value)}
                   />
                   <div className="grid grid-cols-2 gap-2">
                     <input 
                       type="text" required placeholder="Bairro"
                       className="w-full border border-gray-300 rounded-lg px-4 py-2"
                       value={neighborhood} onChange={e => setNeighborhood(e.target.value)}
                     />
                     <input 
                       type="text" required placeholder="CEP (00000-000)"
                       className="w-full border border-gray-300 rounded-lg px-4 py-2"
                       value={cep} 
                       onChange={e => setCep(formatCEP(e.target.value))}
                       maxLength={9}
                     />
                   </div>
                   <div className="grid grid-cols-4 gap-2">
                     <input 
                       type="text" required placeholder="Cidade"
                       className="col-span-3 w-full border border-gray-300 rounded-lg px-4 py-2"
                       value={city} onChange={e => setCity(e.target.value)}
                     />
                     <input 
                       type="text" required placeholder="UF"
                       className="col-span-1 w-full border border-gray-300 rounded-lg px-4 py-2"
                       value={state} onChange={e => setState(e.target.value.toUpperCase())}
                       maxLength={2}
                     />
                   </div>
                 </div>
                 
                 <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Logo da Empresa</label>
                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        <Upload className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600 truncate">
                          {logoFile ? logoFile.name : 'Escolher arquivo...'}
                        </span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={e => setLogoFile(e.target.files ? e.target.files[0] : null)}
                        />
                      </label>
                      {logoFile && (
                        <button 
                          type="button"
                          onClick={() => setLogoFile(null)} 
                          className="text-xs text-red-500 hover:underline"
                        >
                          Remover
                        </button>
                      )}
                    </div>
                 </div>

                 <h3 className="font-bold text-gray-800 border-b pb-2 mb-2">Dados do Admin</h3>
                 <input 
                   type="text" required placeholder="Seu Nome Completo"
                   className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-2"
                   value={userName} onChange={e => setUserName(e.target.value)}
                 />
              </>
            )}
            
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
               <input 
                 type="email" 
                 required
                 className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-400 outline-none"
                 placeholder="seu@email.com"
                 value={email}
                 onChange={e => setEmail(e.target.value)}
               />
            </div>
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
               <input 
                 type="password" 
                 required
                 minLength={6}
                 className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-400 outline-none"
                 placeholder="******"
                 value={password}
                 onChange={e => setPassword(e.target.value)}
               />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-slate-900 text-white font-bold py-3 rounded-lg hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (isLogin ? <><LogIn className="w-4 h-4" /> Entrar</> : <><Briefcase className="w-4 h-4" /> Registrar Empresa</>)}
            </button>
          </form>

          <div className="mt-6 text-center border-t pt-4">
             <button 
               onClick={() => setIsLogin(!isLogin)}
               className="text-sm text-slate-600 hover:text-yellow-600 font-medium"
             >
               {isLogin ? 'Não tem conta? Registre sua empresa' : 'Já tem conta? Fazer Login'}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [activePage, setActivePage] = useState('dashboard');
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    // Check active session
    AppService.getCurrentUser().then(({ user, company }) => {
      if (user && company) {
        setUser(user);
        setCompany(company);
      }
      setInitializing(false);
    }).catch((err) => {
      console.warn("Session check failed:", err);
      setInitializing(false);
    });
  }, []);

  const handleLogin = (u: User, c: Company) => {
    setUser(u);
    setCompany(c);
  };

  const handleLogout = async () => {
    try {
      await AppService.logout();
    } catch (e) {
      console.error(e);
    }
    setUser(null);
    setCompany(null);
    setActivePage('dashboard');
  };

  const refreshCompany = async () => {
    const { user: u, company: c } = await AppService.getCurrentUser();
    if (u && c) {
      setUser(u);
      setCompany(c);
    }
  };

  if (initializing) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">Carregando...</div>;
  }

  if (!user || !company) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  return (
    <Layout 
      user={user} 
      company={company} 
      activePage={activePage} 
      onNavigate={setActivePage}
      onLogout={handleLogout}
    >
      {activePage === 'dashboard' && <Dashboard company={company} />}
      {activePage === 'create-budget' && (
        <CreateBudget 
          company={company} 
          userId={user.id} 
          onSuccess={() => setActivePage('history')}
          onCancel={() => setActivePage('dashboard')}
        />
      )}
      {activePage === 'calculators' && <Calculators company={company} />}
      {activePage === 'materials' && <Materials company={company} />}
      {activePage === 'financial' && <FinancialReport company={company} />}
      {activePage === 'history' && <History company={company} />}
      {activePage === 'settings' && <Settings company={company} onUpdate={refreshCompany} />}
    </Layout>
  );
}
