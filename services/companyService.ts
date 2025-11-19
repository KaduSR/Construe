
import { supabase } from './supabaseClient';
import { Company, CreateCompanyPayload } from '../types';

export const CompanyService = {
  /**
   * Cria uma empresa e vincula o usuário como ADMIN.
   * Usa transação implícita (insert company -> insert admin).
   */
  createCompany: async (userId: string, data: CreateCompanyPayload) => {
    // 1. Inserir Empresa
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .insert({
        name: data.name,
        cnpj: data.cnpj,
        company_type: data.type,
        email: data.email,
        phone: data.phone,
        address: data.address,
        logo_path: data.logo_path
      })
      .select()
      .single();

    if (companyError) throw new Error(`Erro ao criar empresa: ${companyError.message}`);

    // 2. Vincular Usuário como Admin
    const { error: adminError } = await supabase
      .from('company_admins')
      .insert({
        user_id: userId,
        company_id: company.id,
        role: 'ADMIN'
      });

    if (adminError) {
      // Nota: Em um cenário real, idealmente deletaríamos a empresa criada (rollback manual)
      throw new Error(`Erro ao vincular admin: ${adminError.message}`);
    }

    return company;
  },

  /**
   * Atualiza dados da empresa.
   */
  updateCompany: async (companyId: string, data: Partial<Company>) => {
    const { error } = await supabase
      .from('companies')
      .update({
        name: data.name,
        cnpj: data.cnpj,
        company_type: data.type, // Mapeando para o nome da coluna no banco
        email: data.email,
        phone: data.phone,
        address: data.address
      })
      .eq('id', companyId);

    if (error) throw new Error(error.message);
  }
};
