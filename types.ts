
export enum UserRole {
  ADMIN = 'ADMIN',
  EMPLOYEE = 'EMPLOYEE'
}

export enum PlanType {
  FREE = 'FREE',
  PREMIUM = 'PREMIUM'
}

export interface Company {
  id: string;
  name: string;
  cnpj: string;
  type: string; 
  email: string;
  phone?: string; 
  address?: string;
  plan: PlanType; 
}

export interface User {
  id: string;
  email: string;
  name: string;
  companyId?: string;
  role?: UserRole;
}

export interface Material {
  id: string;
  companyId: string;
  name: string;
  unit: string;
  price: number;
  consumption: number;
}

export interface Service {
  id: string;
  companyId: string;
  name: string;
  description: string;
  basePrice: number;
  formula: string;
}

export interface BudgetItem {
  id?: string;
  budgetId?: string;
  serviceId: string;
  quantity: number;
  subtotal: number;
  serviceName?: string;
  unitPrice?: number;
  description?: string; 
  unit?: string;       
}

export interface Budget {
  id: string;
  companyId: string;
  clientName: string; 
  total: number;      
  createdAt: string;  
  items: BudgetItem[]; 
  number: number;
  category: string;
  clientAddress?: string;
}

export interface CreateCompanyPayload {
  name: string;
  cnpj: string;
  type: string;
  email: string;
  phone: string;
  address: string;
  logo_path?: string | null;
}

export interface RegisterCompanyData {
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
  logoFile?: File | null;
}

export interface RegisterUserData {
  name: string;
  email: string;
  password: string;
}

export interface CreateBudgetDTO {
  companyId: string;
  clientName: string;
  total: number;
  items: {
    serviceId: string;
    quantity: number;
    subtotal: number;
  }[];
}

export interface CreateCompanyDTO extends CreateCompanyPayload {}