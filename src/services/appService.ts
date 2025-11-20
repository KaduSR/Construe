
import { supabase } from './supabaseClient';
import { CompanyService } from './companyService';
import { PlanType, CreateMaterialDTO } from '../types';

const getErrorMessage = (error) => {
  if (!error) return 'An unexpected error occurred';
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return JSON.stringify(error);
};

const uploadCompanyLogo = async (file) => {
  if (!file) return null;
  const fileExt = file.name.split('.').pop();
  const filePath = `company-logos/${crypto.randomUUID()}.${fileExt}`;
  
  const { error } = await supabase.storage
    .from("company-logos")
    .upload(filePath, file);

  if (error) throw new Error(error.message);
  return filePath;
};

const seedDefaultServices = async (companyId) => {
  const defaultServices = [
    { name: 'Instalação Drywall', description: 'Parede ST com isolamento', base_price: 85.00, formula: 'area * 85' },
    { name: 'Pintura Acrílica', description: '2 demãos com massa', base_price: 45.00, formula: 'area * 45' },
    { name: 'Instalação Elétrica', description: 'Ponto completo (fio+tomada)', base_price: 120.00, formula: 'qtd * 120' }
  ];

  const servicesPayload = defaultServices.map(s => ({
    company_id: companyId,
    name: s.name,
    description: s.description,
    base_price: s.base_price,
    formula: s.formula
  }));

  await supabase.from('services').insert(servicesPayload);
};

export const AppService = {
  getErrorMessage,

  loginWithGoogle: async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
    if (error) throw new Error(getErrorMessage(error));
  },

  login: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      let msg = getErrorMessage(error);
      if (msg.includes("Invalid login credentials")) {
        msg = "Credenciais inválidas ou e-mail não confirmado.";
      }
      throw new Error(msg);
    }
  },

  logout: async () => {
    await supabase.auth.signOut();
  },

  getCurrentUser: async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session?.user) return { user: null, company: null };

    const { data: adminLink } = await supabase
      .from('company_admins')
      .select('company_id, role')
      .eq('user_id', session.user.id)
      .limit(1) 
      .maybeSingle();

    let company = null;

    if (adminLink?.company_id) {
      const { data: companyData } = await supabase
        .from('companies')
        .select('*')
        .eq('id', adminLink.company_id)
        .single();
      
      if (companyData) {
        company = {
          id: companyData.id,
          name: companyData.name,
          cnpj: companyData.cnpj,
          type: companyData.company_type,
          niche: companyData.niche || 'Geral',
          email: companyData.email,
          phone: companyData.phone,
          address: companyData.address,
          plan: PlanType.FREE
        };
      }
    }

    const user = {
      id: session.user.id,
      email: session.user.email,
      name: session.user.user_metadata?.name || 'Usuário',
      companyId: company?.id,
      role: adminLink?.role || 'ADMIN'
    };

    return { user, company };
  },

  registerCompany: async (companyData, userData) => {
    
    let logoPath = null;
    try {
      logoPath = await uploadCompanyLogo(companyData.logoFile || null);
    } catch (e) {
      console.warn("Logo upload falhou, continuando sem logo:", e);
    }

    const fullAddress = [
      companyData.street,
      companyData.neighborhood,
      companyData.city && companyData.state ? `${companyData.city} - ${companyData.state}` : '',
      companyData.zipCode ? `CEP: ${companyData.zipCode}` : ''
    ].filter(Boolean).join(', ');

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: { data: { name: userData.name } }
    });

    if (authError) throw new Error(getErrorMessage(authError));
    
    const user = authData.user;
    if (!user) throw new Error("Erro ao criar usuário: Sem retorno de ID.");

    if (!authData.session) {
      const pendingData = {
        name: companyData.name,
        cnpj: companyData.cnpj,
        type: companyData.type,
        niche: companyData.niche,
        email: companyData.email,
        phone: companyData.phone,
        address: fullAddress,
        logo_path: logoPath
      };
      localStorage.setItem('construe_pending_reg', JSON.stringify(pendingData));
      
      throw new Error("Conta criada! Verifique seu e-mail para confirmar antes de continuar.");
    }

    const newCompany = await CompanyService.createCompany(user.id, {
      name: companyData.name,
      cnpj: companyData.cnpj,
      type: companyData.type,
      niche: companyData.niche,
      email: companyData.email,
      phone: companyData.phone,
      address: fullAddress,
      logo_path: logoPath
    });

    if (newCompany && newCompany.id) {
        await seedDefaultServices(newCompany.id);
    }
  },

  updateCompanySettings: async (companyId, data, logoFile) => {
    let updateData = { ...data };

    if (logoFile) {
      try {
        const logoPath = await uploadCompanyLogo(logoFile);
        if (logoPath) {
          updateData.logo_path = logoPath;
        }
      } catch (e) {
        console.warn("Falha ao atualizar logo:", e);
        throw new Error("Erro ao fazer upload da imagem.");
      }
    }

    await CompanyService.updateCompany(companyId, updateData);
  },

  getServices: async (companyId) => {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('company_id', companyId);

    if (error) throw new Error(getErrorMessage(error));

    return (data || []).map((s) => ({
      id: s.id,
      companyId: s.company_id,
      name: s.name,
      description: s.description,
      basePrice: Number(s.base_price),
      formula: s.formula
    }));
  },

  getBudgets: async (companyId) => {
    const { data, error } = await supabase
      .from('budgets')
      .select(`
        *,
        budget_items (
          id, quantity, subtotal, service_id,
          services ( name, base_price )
        )
      `)
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(getErrorMessage(error));

    return (data || []).map((b, index) => ({
      id: b.id,
      companyId: b.company_id,
      clientName: b.client_name,
      total: Number(b.total),
      createdAt: b.created_at,
      number: index + 1, 
      category: 'Geral',
      clientAddress: '', 
      items: (b.budget_items || []).map((i) => ({
        id: i.id,
        serviceId: i.service_id,
        quantity: Number(i.quantity),
        subtotal: Number(i.subtotal),
        serviceName: i.services?.name || 'Serviço Removido',
        unitPrice: Number(i.services?.base_price || 0),
        description: i.services?.name || 'Serviço',
        unit: 'un'
      }))
    }));
  },

  createBudget: async (budget) => {
    const { data: newBudget, error: budgetError } = await supabase
      .from('budgets')
      .insert({
        company_id: budget.companyId,
        client_name: budget.clientName,
        total: budget.total
      })
      .select()
      .single();

    if (budgetError) throw new Error(getErrorMessage(budgetError));

    if (budget.items.length > 0) {
      const itemsPayload = budget.items.map((item) => ({
        budget_id: newBudget.id,
        service_id: item.serviceId,
        quantity: item.quantity,
        subtotal: item.subtotal
      }));

      const { error: itemsError } = await supabase
        .from('budget_items')
        .insert(itemsPayload);

      if (itemsError) throw new Error("Erro ao salvar itens: " + getErrorMessage(itemsError));
    }
  },

  // --- MATERIAIS ---

  getMaterials: async (companyId) => {
    const { data, error } = await supabase
      .from('materials')
      .select('*')
      .eq('company_id', companyId)
      .order('name');

    if (error) throw new Error(getErrorMessage(error));

    return (data || []).map((m) => ({
      id: m.id,
      companyId: m.company_id,
      name: m.name,
      category: m.category,
      unit: m.unit,
      costPrice: Number(m.cost_price),
      salesPrice: Number(m.sales_price),
      consumption: Number(m.consumption || 0)
    }));
  },

  createMaterial: async (companyId, material: CreateMaterialDTO) => {
    const { error } = await supabase.from('materials').insert({
      company_id: companyId,
      name: material.name,
      category: material.category,
      unit: material.unit,
      cost_price: material.costPrice,
      sales_price: material.salesPrice
    });

    if (error) throw new Error(getErrorMessage(error));
  },

  deleteMaterial: async (id) => {
    const { error } = await supabase.from('materials').delete().eq('id', id);
    if (error) throw new Error(getErrorMessage(error));
  },

  upgradePlan: async (companyId) => {
    return new Promise(resolve => setTimeout(resolve, 1000));
  },
};