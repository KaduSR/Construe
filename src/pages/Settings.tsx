import React, { useState } from 'react';
import { Company, PlanType } from '../types';
import { AppService } from '../services/appService';
import { CheckCircle, Zap, Shield, Edit2, Save, X, Upload, Building } from 'lucide-react';

interface SettingsProps {
  company: Company;
  onUpdate: () => void; // Trigger refresh
}

export const Settings: React.FC<SettingsProps> = ({ company, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Edit Form State
  const [editName, setEditName] = useState(company.name);
  const [editPhone, setEditPhone] = useState(company.phone || '');
  const [editAddress, setEditAddress] = useState(company.address || '');
  const [editType, setEditType] = useState(company.type);
  const [editLogo, setEditLogo] = useState<File | null>(null);

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

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await AppService.updateCompanySettings(
        company.id, 
        {
          name: editName,
          phone: editPhone,
          address: editAddress,
          type: editType
        },
        editLogo
      );
      onUpdate();
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar alterações: " + AppService.getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const toggleEdit = () => {
    if (!isEditing) {
      // Reset values to current props when opening edit
      setEditName(company.name);
      setEditPhone(company.phone || '');
      setEditAddress(company.address || '');
      setEditType(company.type);
      setEditLogo(null);
    }
    setIsEditing(!isEditing);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Configurações da Empresa</h2>
      </div>

      {/* Company Info Card */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative">
        <div className="absolute top-6 right-6">
          {!isEditing && (
            <button 
              onClick={toggleEdit}
              className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-yellow-600 transition-colors bg-slate-50 px-3 py-2 rounded-lg border border-slate-200"
            >
              <Edit2 className="w-4 h-4" /> Editar Dados
            </button>
          )}
        </div>

        {!isEditing ? (
          // Display Mode
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 bg-slate-100 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-300 overflow-hidden relative">
               {/* Placeholder for Logo Display - In real app, user would have logo URL */}
               <Building className="w-10 h-10 text-slate-400" />
               <span className="text-[10px] text-gray-400 absolute bottom-1">Logo</span>
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-slate-800">{company.name}</h3>
              <p className="text-sm text-gray-500 font-medium">CNPJ: {company.cnpj}</p>
              
              <div className="mt-4 space-y-1">
                <p className="text-sm text-gray-600"><strong className="text-slate-900">Endereço:</strong> {company.address || 'Não informado'}</p>
                <p className="text-sm text-gray-600"><strong className="text-slate-900">Telefone:</strong> {company.phone || 'Não informado'}</p>
              </div>
              
              <div className="pt-3">
                 <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold uppercase border border-slate-200">
                   {company.type}
                 </span>
              </div>
            </div>
          </div>
        ) : (
          // Edit Mode
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
               <h3 className="font-bold text-gray-700">Editar Informações</h3>
               <button 
                 type="button" 
                 onClick={toggleEdit}
                 className="text-gray-400 hover:text-gray-600"
               >
                 <X className="w-5 h-5" />
               </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Logo Upload */}
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Logo da Empresa</label>
                <div className="w-full h-32 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-center p-4 hover:bg-slate-100 transition-colors relative cursor-pointer">
                   <input 
                      type="file" 
                      accept="image/*" 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={(e) => setEditLogo(e.target.files ? e.target.files[0] : null)}
                   />
                   <Upload className="w-6 h-6 text-slate-400 mb-2" />
                   <span className="text-xs text-slate-500 font-medium">
                     {editLogo ? editLogo.name : "Clique para alterar"}
                   </span>
                </div>
              </div>

              {/* Fields */}
              <div className="col-span-2 space-y-3">
                 <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome Fantasia</label>
                   <input 
                     type="text" required
                     className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-400 outline-none"
                     value={editName} onChange={e => setEditName(e.target.value)}
                   />
                 </div>

                 <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Ramo de Atuação</label>
                       <select 
                         className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-400 outline-none"
                         value={editType} onChange={e => setEditType(e.target.value)}
                       >
                          <option>Reforma Geral</option>
                          <option>Gesso e Drywall</option>
                          <option>Elétrica</option>
                          <option>Pintura</option>
                          <option>Engenharia</option>
                      </select>
                    </div>
                    <div>
                       <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Telefone</label>
                       <input 
                         type="text"
                         className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-400 outline-none"
                         value={editPhone} onChange={e => setEditPhone(e.target.value)}
                       />
                    </div>
                 </div>

                 <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Endereço Completo</label>
                   <textarea 
                     className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-400 outline-none resize-none"
                     rows={2}
                     value={editAddress} onChange={e => setEditAddress(e.target.value)}
                     placeholder="Rua, Número, Bairro, Cidade - UF"
                   />
                 </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t mt-2">
              <button 
                type="button" 
                onClick={toggleEdit}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className="px-6 py-2 text-sm bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2 font-medium"
              >
                {loading ? 'Salvando...' : <><Save className="w-4 h-4" /> Salvar Alterações</>}
              </button>
            </div>
          </form>
        )}
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