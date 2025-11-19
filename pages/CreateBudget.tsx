
import React, { useState, useEffect } from 'react';
import { Company, Service, BudgetItem } from '../types';
import { AppService } from '../services/appService';
import { Plus, Trash2, Save, ArrowLeft, AlertCircle, Hammer } from 'lucide-react';

interface CreateBudgetProps {
  company: Company;
  userId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const CreateBudget: React.FC<CreateBudgetProps> = ({ company, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [services, setServices] = useState<Service[]>([]);

  // Form State
  const [clientName, setClientName] = useState('');
  const [clientAddress, setClientAddress] = useState(''); // will append to name
  const [items, setItems] = useState<BudgetItem[]>([]);

  // New Item Input State
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [qty, setQty] = useState('1');

  useEffect(() => {
    AppService.getServices(company.id)
      .then(setServices)
      .catch(err => console.error(err));
  }, [company.id]);

  const addItem = () => {
    if (!selectedServiceId) return;
    const service = services.find(s => s.id === selectedServiceId);
    if (!service) return;

    const quantity = parseFloat(qty) || 0;
    if (quantity <= 0) return;

    const subtotal = quantity * service.basePrice;

    const newItem: BudgetItem = {
      serviceId: service.id,
      quantity,
      subtotal,
      serviceName: service.name,
      unitPrice: service.basePrice
    };

    setItems([...items, newItem]);
    setSelectedServiceId('');
    setQty('1');
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateTotal = () => items.reduce((sum, i) => sum + i.subtotal, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!clientName) throw new Error("Informe o nome do cliente");
      if (items.length === 0) throw new Error("Adicione pelo menos um serviço");

      const fullClientName = clientAddress ? `${clientName} - ${clientAddress}` : clientName;

      await AppService.createBudget({
        companyId: company.id,
        clientName: fullClientName,
        total: calculateTotal(),
        items: items.map(i => ({
          serviceId: i.serviceId,
          quantity: i.quantity,
          subtotal: i.subtotal
        }))
      });

      onSuccess();
    } catch (err) {
      setError(AppService.getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="mb-6 flex items-center gap-4">
        <button onClick={onCancel} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <h2 className="text-2xl font-bold text-gray-800">Novo Orçamento</h2>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm border border-red-200 flex items-start gap-2">
          <AlertCircle className="w-5 h-5 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Client Info */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-lg text-gray-700 border-b pb-2 mb-4">Dados do Cliente</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Nome do Cliente</label>
              <input 
                type="text" required
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-yellow-400 outline-none"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Endereço (Opcional)</label>
              <input 
                type="text"
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-yellow-400 outline-none"
                value={clientAddress}
                onChange={(e) => setClientAddress(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Items Selection */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
           <div className="flex justify-between items-center border-b pb-2 mb-4">
             <h3 className="font-bold text-lg text-gray-700">Serviços</h3>
             <span className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full font-bold">
               Total: R$ {calculateTotal().toFixed(2)}
             </span>
           </div>

           {/* Add Service Form */}
           <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
              <h4 className="text-sm font-bold text-gray-500 uppercase mb-2 flex items-center gap-2">
                <Hammer className="w-4 h-4" /> Adicionar Serviço
              </h4>
              <div className="flex flex-col md:flex-row gap-3 items-end">
                <div className="flex-1 w-full">
                  <label className="text-xs text-gray-500 mb-1 block">Selecione o Serviço</label>
                  <select 
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-yellow-400 outline-none"
                    value={selectedServiceId}
                    onChange={(e) => setSelectedServiceId(e.target.value)}
                  >
                    <option value="">Selecione...</option>
                    {services.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} (R$ {s.basePrice.toFixed(2)})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-full md:w-32">
                  <label className="text-xs text-gray-500 mb-1 block">Quantidade</label>
                  <input 
                    type="number" min="0.1" step="0.1"
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-yellow-400 outline-none"
                    value={qty}
                    onChange={(e) => setQty(e.target.value)}
                  />
                </div>
                <button 
                  type="button"
                  onClick={addItem}
                  disabled={!selectedServiceId}
                  className="bg-yellow-500 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-yellow-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Adicionar
                </button>
              </div>
              {selectedServiceId && (
                <p className="text-xs text-gray-500 mt-2">
                   Fórmula: {services.find(s => s.id === selectedServiceId)?.formula}
                </p>
              )}
           </div>

           {/* List */}
           <div className="space-y-2">
             {items.length === 0 && (
               <p className="text-center text-gray-400 py-4 italic">Nenhum serviço adicionado.</p>
             )}
             {items.map((item, idx) => (
               <div key={idx} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg shadow-sm">
                 <div>
                   <p className="font-medium text-slate-800">{item.serviceName}</p>
                   <p className="text-xs text-gray-500">
                     {item.quantity} x R$ {item.unitPrice?.toFixed(2)}
                   </p>
                 </div>
                 <div className="flex items-center gap-4">
                   <span className="font-bold text-slate-700">R$ {item.subtotal.toFixed(2)}</span>
                   <button 
                     type="button" 
                     onClick={() => removeItem(idx)}
                     className="text-red-400 hover:text-red-600 p-1"
                   >
                     <Trash2 className="w-4 h-4" />
                   </button>
                 </div>
               </div>
             ))}
           </div>
        </div>

        <div className="flex justify-end">
          <button 
            type="submit" 
            disabled={loading}
            className="bg-slate-900 text-white px-8 py-3 rounded-lg font-bold hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg"
          >
            {loading ? 'Salvando...' : <><Save className="w-5 h-5" /> Salvar Orçamento</>}
          </button>
        </div>
      </form>
    </div>
  );
};
