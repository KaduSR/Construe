import { supabase } from './supabaseClient';
import { Company, CreateCompanyPayload } from '../types';

export const CompanyService = {
  createCompany: async (userId: string, data: CreateCompanyPayload) => {
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

    const { error: adminError } = await supabase
      .from('company_admins')
      .insert({
        user_id: userId,
        company_id: company.id,
        role: 'ADMIN'
      });

    if (adminError) throw new Error(`Erro ao vincular admin: ${adminError.message}`);

    return company;
  },

  updateCompany: async (companyId: string, data: Partial<Company>) => {
    const { error } = await supabase
      .from('companies')
      .update({
        name: data.name,
        cnpj: data.cnpj,
        company_type: data.type,
        email: data.email,
        phone: data.phone,
        address: data.address
      })
      .eq('id', companyId);

    if (error) throw new Error(error.message);
  }
};