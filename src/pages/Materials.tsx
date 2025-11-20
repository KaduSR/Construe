
import React, { useState, useEffect } from 'react';
import { Company, Material } from '../types';
import { AppService } from '../services/appService';
import { Plus, Trash2, Package } from 'lucide-react';

interface MaterialsProps {
  company: Company;
}

export const Materials: React.FC<MaterialsProps> = ({ company }) => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Geral');
  const [unit, setUnit] = useState('un');
  const [costPrice, setCostPrice] = useState('');
  const [margin, setMargin] = useState('30'); // % BDI/Lucro padrão
  const [salesPrice, setSalesPrice] = useState('');

  useEffect(() => {
    loadMaterials();
  }, [company.id]);

  const loadMaterials = async () => {
    try {
      const data = await AppService.getMaterials(company.id);
      setMaterials(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Cálculo automático: Se mudar Custo ou Margem, atualiza Venda
  useEffect(() => {
    const cost = parseFloat(costPrice) || 0;
    const marg = parseFloat(margin) || 0;
    if (cost > 0) {
      const sale = cost * (1 + marg / 100);
      setSalesPrice(sale.toFixed(2));
    }
  }, [costPrice, margin]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !costPrice) return;

    try {
      await AppService.createMaterial(company.id, {
        name,
        category,
        unit,
        costPrice: parseFloat(costPrice),
        salesPrice: parseFloat(salesPrice)
      });
      
      // Reset form
      setName('');
      setCostPrice('');
      loadMaterials();
    } catch (err) {
      alert("Erro ao salvar material: " + AppService.getErrorMessage(err));
    }
  };

  const handleDelete = async (id: string) => {
    if(!confirm("Tem certeza?")) return;
    await AppService.deleteMaterial(id);
    loadMaterials();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
        <Package className="w-6 h-6 text-yellow-500" /> Gestão de Materiais
      </h2>

      {/* Card de Cadastro */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-700 mb-4">Novo Material</h3>
        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
          <div className="md:col-span-2">
            <label className="text-xs text-gray-500 block mb-1">Nome do Material</label>
            <input 
              className="w-full border p-2 rounded outline-none focus:ring-2 focus:ring-yellow-400" 
              value={name} onChange={e => setName(e.target.value)} 
              placeholder="Ex: Cimento CP-II" required
            />
          </div>
          <div>
             <label className="text-xs text-gray-500 block mb-1">Categoria</label>
             <select className="w-full border p-2 rounded outline-none" value={category} onChange={e => setCategory(e.target.value)}>
               <option>Geral</option>
               <option>Alvenaria</option>
               <option>Elétrica</option>
               <option>Hidráulica</option>
               <option>Acabamento</option>
             </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Preço Custo (R$)</label>
            <input 
              type="number" step="0.01" className="w-full border p-2 rounded outline-none" 
              value={costPrice} onChange={e => setCostPrice(e.target.value)} 
              placeholder="0.00" required
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">BDI / Margem (%)</label>
            <input 
              type="number" className="w-full border p-2 rounded bg-yellow-50 outline-none" 
              value={margin} onChange={e => setMargin(e.target.value)} 
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Preço Venda (R$)</label>
            <input 
              type="number" className="w-full border p-2 rounded bg-gray-100 font-bold text-green-700 outline-none" 
              value={salesPrice} readOnly
            />
          </div>
          <div className="md:col-span-6 flex justify-end mt-2">
             <button type="submit" className="bg-slate-900 text-white px-6 py-2 rounded hover:bg-slate-800 flex gap-2 items-center">
               <Plus className="w-4 h-4" /> Cadastrar
             </button>
          </div>
        </form>
      </div>

      {/* Lista */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
           <div className="p-8 text-center text-gray-500">Carregando materiais...</div>
        ) : (
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="p-4">Material</th>
              <th className="p-4">Categoria</th>
              <th className="p-4 text-right">Custo</th>
              <th className="p-4 text-right">Venda (C/ BDI)</th>
              <th className="p-4 text-center">Lucro Estimado</th>
              <th className="p-4 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {materials.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-400">Nenhum material cadastrado.</td>
              </tr>
            )}
            {materials.map(m => {
              const profit = m.salesPrice - m.costPrice;
              const profitMargin = m.costPrice > 0 ? (profit / m.costPrice) * 100 : 0;
              return (
                <tr key={m.id} className="hover:bg-gray-50">
                  <td className="p-4 font-medium">{m.name}</td>
                  <td className="p-4"><span className="bg-slate-100 px-2 py-1 rounded text-xs">{m.category}</span></td>
                  <td className="p-4 text-right text-gray-500">R$ {m.costPrice.toFixed(2)}</td>
                  <td className="p-4 text-right font-bold text-slate-800">R$ {m.salesPrice.toFixed(2)}</td>
                  <td className="p-4 text-center text-green-600">
                    R$ {profit.toFixed(2)} ({profitMargin.toFixed(0)}%)
                  </td>
                  <td className="p-4 text-center">
                    <button onClick={() => handleDelete(m.id)} className="text-red-400 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        )}
      </div>
    </div>
  );
};
