
import { supabase } from './supabaseClient';
import { User, Company, Budget, Material, Service } from '../types';

const getErrorMessage = (error: any): string => {
  if (!error) return 'An unexpected error occurred';
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  
  // Safe object handling
  if (typeof error === 'object') {
    // Supabase often returns { message: "...", code: "..." }
    if (error.message) return String(error.message);
    if (error.error_description) return String(error.error_description);
    if (error.details) return String(error.details);
    if (error.hint) return String(error.hint);
    if (error.msg) return String(error.msg);
    
    // Last resort: stringify for debug
    try { 
      return JSON.stringify(error); 
    } catch (e) { 
      return 'Unknown error object'; 
    }
  }
  
  return String(error);
};

const uploadCompanyLogo = async (file: File | null) => {
  if (!file) return null;
  
  const fileExt = file.name.split('.').pop();
  const filePath = `company-logos/${crypto.randomUUID()}.${fileExt}`;
  
  const { error } = await supabase.storage
    .from("company-logos")
    .upload(filePath, file);

  if (error) throw new Error(error.message);

  return filePath;
};

const seedDefaultServices = async (companyId: string) => {
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

const createCompanyRecord = async (userId: string, params: any) => {
  const { data, error: rpcError } = await supabase.rpc('register_company', {
    ...params,
    p_user_id: userId
  });

  if (rpcError) {
    console.error('RPC register_company error:', JSON.stringify(rpcError, null, 2));
    throw new Error("Erro ao criar empresa: " + (rpcError.message || getErrorMessage(rpcError)));
  }

  const companyId = data;

  // Link Company to User in Metadata
  const { error: updateError } = await supabase.auth.updateUser({
    data: { company_id: companyId }
  });
  if (updateError) console.warn("Could not update user metadata immediately:", updateError);

  // Seed Default Services
  await seedDefaultServices(companyId);
  
  return companyId;
};

export const AppService = {
  // --- Auth ---
  getCurrentUser: async (): Promise<{ user: User | null, company: Company | null }> => {
    let { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw new Error(getErrorMessage(sessionError));
    
    // Check for pending registration recovery (Handling Email Confirmation flow)
    if (session?.user) {
      const pendingReg = localStorage.getItem('construe_pending_reg');
      if (pendingReg) {
        try {
          console.log("Found pending company registration. Finalizing...");
          const params = JSON.parse(pendingReg);
          await createCompanyRecord(session.user.id, params);
          localStorage.removeItem('construe_pending_reg');
          
          // Refresh session to get updated metadata (company_id)
          const { data: refreshData } = await supabase.auth.refreshSession();
          if (refreshData.session) {
            session = refreshData.session;
          }
        } catch (e) {
          console.error("Failed to finalize pending registration:", e);
          // If failure is due to "duplicate key" (company already created), clear pending reg to avoid loop
          const errMsg = getErrorMessage(e);
          if (errMsg.includes("duplicate") || errMsg.includes("already exists")) {
             localStorage.removeItem('construe_pending_reg');
          }
        }
      }
    }

    if (!session?.user) return { user: null, company: null };

    // LINKING STRATEGY FIX:
    // Since 'profiles' table might not have 'company_id' column in some schemas,
    // we rely on user_metadata to store the link, or fetch it via relation.
    let metaCompanyId = session.user.user_metadata?.company_id;

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, name, email, role') // Explicitly select columns to avoid "column not found" error
      .eq('id', session.user.id)
      .maybeSingle();

    if (profileError) {
       console.warn("Error fetching profile:", profileError);
    }
    
    // If metadata is missing but we just created company, we might need to re-fetch user or check localStorage?
    // The code above (createCompanyRecord) updates metadata, but session might be stale.
    if (!metaCompanyId) {
       const { data: refreshedUser } = await supabase.auth.getUser();
       metaCompanyId = refreshedUser.user?.user_metadata?.company_id;
    }

    // Use metadata ID.
    const companyId = metaCompanyId;

    if (!companyId) {
      // If we have a profile but no company link, return user without company
      if (profile) {
        return {
          user: {
            id: profile.id,
            email: profile.email,
            name: profile.name,
            role: profile.role
          },
          company: null
        };
      }
      return { user: null, company: null };
    }

    // Explicitly select columns to ensure we get address parts if they exist
    const { data: companyData, error: companyError } = await supabase
      .from('companies')
      .select('*') // Select all to get new address columns
      .eq('id', companyId)
      .single();

    if (companyError) return { user: null, company: null };

    // Construct full address if components exist
    let fullAddress = companyData.address || '';
    if (companyData.city && companyData.state) {
       const parts = [
         companyData.address,
         companyData.district,
         `${companyData.city} - ${companyData.state}`,
         companyData.zip_code ? `CEP: ${companyData.zip_code}` : ''
       ].filter(Boolean);
       fullAddress = parts.join(', ');
    }

    const user: User = {
      id: session.user.id,
      email: profile?.email || session.user.email!,
      name: profile?.name || session.user.user_metadata?.name || 'Usuário',
      companyId: companyId,
      role: profile?.role || 'ADMIN'
    };

    const company: Company = companyData ? {
      id: companyData.id,
      name: companyData.name,
      cnpj: companyData.cnpj,
      type: companyData.company_type, // Mapped from DB
      email: companyData.email,
      phone: companyData.phone,
      address: fullAddress,
      plan: 'FREE' // Default since schema removed plan column
    } : null as any;

    return { user, company };
  },

  login: async (email: string, password: string): Promise<void> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      let msg = getErrorMessage(error);
      // Improve generic Supabase error for unconfirmed emails or wrong password
      if (msg.includes("Invalid login credentials")) {
        msg = "Credenciais inválidas. Verifique seu e-mail e senha.\n\nSe você criou a conta recentemente, verifique se confirmou o e-mail clicando no link enviado para sua caixa de entrada.";
      }
      throw new Error(msg);
    }
  },

  logout: async () => {
    await supabase.auth.signOut();
  },

  registerCompany: async (
    companyData: { 
      name: string; 
      cnpj: string; 
      type: string; 
      email: string; 
      phone: string; 
      street: string;
      neighborhood: string;
      city: string;
      state: string;
      zipCode: string;
      logoFile?: File | null 
    }, 
    userData: { name: string; email: string; password: string }
  ): Promise<void> => {
    
    // 1. Upload Logo (if exists)
    let logoPath = null;
    if (companyData.logoFile) {
      try {
        logoPath = await uploadCompanyLogo(companyData.logoFile);
      } catch (e) {
        console.warn("Logo upload failed, continuing without logo:", e);
      }
    }

    // Prepare RPC Params (Address Concatenation)
    const fullAddress = [
      companyData.street,
      companyData.neighborhood,
      (companyData.city && companyData.state) ? `${companyData.city} - ${companyData.state}` : (companyData.city || companyData.state),
      companyData.zipCode ? `CEP: ${companyData.zipCode}` : ''
    ].filter(part => part && part.trim() !== '').join(', ');

    const rpcParams = {
      p_name: companyData.name,
      p_cnpj: companyData.cnpj,
      p_company_type: companyData.type,
      p_email: companyData.email,
      p_phone: companyData.phone || '',
      p_address: fullAddress,
      p_logo_path: logoPath
    };

    // 2. Sign Up
    const { data: signData, error: signError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          name: userData.name
        }
      }
    });

    if (signError) throw new Error(getErrorMessage(signError));
    
    let userId = signData.user?.id;

    // RLS FIX & EMAIL CONFIRMATION HANDLING
    // If no session, try to login. If that fails, save pending state and tell user to confirm email.
    if (!signData.session) {
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
         email: userData.email,
         password: userData.password
      });

      if (loginError || !loginData.session) {
        // Save pending registration to LocalStorage
        localStorage.setItem('construe_pending_reg', JSON.stringify(rpcParams));

        throw new Error("Conta criada com sucesso! Porém, é necessário confirmar seu e-mail antes de finalizar o cadastro da empresa.\n\nVerifique sua caixa de entrada (e spam) e clique no link de confirmação.");
      }
      
      userId = loginData.user.id;
    }
    
    if (!userId) {
      // Fallback check
      const { data: userCheck } = await supabase.auth.getUser();
      userId = userCheck.user?.id;
    }
    
    if (!userId) throw new Error("Não foi possível identificar o usuário.");

    // 3. Create Company Record (RPC)
    await createCompanyRecord(userId, rpcParams);
  },

  // --- Data Operations ---

  getServices: async (companyId: string): Promise<Service[]> => {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('company_id', companyId);

    if (error) throw new Error(getErrorMessage(error));

    return (data || []).map((s: any) => ({
      id: s.id,
      companyId: s.company_id,
      name: s.name,
      description: s.description,
      basePrice: Number(s.base_price),
      formula: s.formula
    }));
  },

  getBudgets: async (companyId: string): Promise<Budget[]> => {
    // Join budget_items -> services to get service names
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

    return (data || []).map((b: any, index: number) => ({
      id: b.id,
      companyId: b.company_id,
      clientName: b.client_name,
      total: Number(b.total),
      createdAt: b.created_at,
      // Computed/Default fields for UI
      number: index + 1, 
      category: 'Geral',
      clientAddress: '', 
      items: (b.budget_items || []).map((i: any) => ({
        id: i.id,
        serviceId: i.service_id,
        quantity: Number(i.quantity),
        subtotal: Number(i.subtotal),
        serviceName: i.services?.name || 'Serviço Removido',
        unitPrice: Number(i.services?.base_price || 0),
        description: i.services?.name || 'Serviço', // UI Helper
        unit: 'un' // UI Helper
      }))
    }));
  },

  createBudget: async (budget: { 
    companyId: string; 
    clientName: string; 
    total: number; 
    items: { serviceId: string; quantity: number; subtotal: number }[] 
  }): Promise<void> => {
    
    // 1. Insert Budget Header
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

    // 2. Insert Items
    if (budget.items.length > 0) {
      const itemsPayload = budget.items.map(item => ({
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

  getMaterials: async (companyId: string): Promise<Material[]> => {
     const { data, error } = await supabase.from('materials').select('*').eq('company_id', companyId);
     if(error) throw new Error(getErrorMessage(error));
     return (data || []).map((m: any) => ({
       id: m.id,
       companyId: m.company_id,
       name: m.name,
       unit: m.unit,
       price: Number(m.price),
       consumption: Number(m.consumption)
     }));
  },

  upgradePlan: async (companyId: string): Promise<void> => {
    // Mock implementation since plan is not in DB schema currently
    return new Promise(resolve => setTimeout(resolve, 1000));
  },

  getErrorMessage
};
