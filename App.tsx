
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { CreateBudget } from './pages/CreateBudget';
import { History } from './pages/History';
import { Settings } from './pages/Settings';
import { AppService } from './services/appService';
import { User, Company } from './types';
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
      {activePage === 'history' && <History company={company} />}
      {activePage === 'settings' && <Settings company={company} onUpdate={refreshCompany} />}
    </Layout>
  );
}
