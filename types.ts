
export enum UserRole {
  ADMIN = 'ADMIN',
  EMPLOYEE = 'EMPLOYEE'
}

export enum PlanType {
  FREE = 'FREE',
  PREMIUM = 'PREMIUM'
}

// Matching schema: companies(id, name, cnpj, company_type, email)
export interface Company {
  id: string;
  name: string;
  cnpj: string;
  type: string; // mapped to company_type
  email: string;
  // Helpers for UI that might not be in DB strictly or mapped differently
  phone?: string; 
  address?: string;
  plan: PlanType; // Assuming logic persists in code even if not in strict schema, or we default to FREE
}

export interface User {
  id: string;
  email: string;
  name: string;
  companyId?: string;
  role?: UserRole;
}

// Matching schema: materials(id, company_id, name, unit, price, consumption)
export interface Material {
  id: string;
  companyId: string;
  name: string;
  unit: string;
  price: number;
  consumption: number;
}

// Matching schema: services(id, company_id, name, description, base_price, formula)
export interface Service {
  id: string;
  companyId: string;
  name: string;
  description: string;
  basePrice: number; // mapped from base_price
  formula: string;
}

// Matching schema: budget_items(id, budget_id, service_id, quantity, subtotal)
export interface BudgetItem {
  id?: string; // Optional for new items
  budgetId?: string;
  serviceId: string;
  quantity: number;
  subtotal: number;
  
  // UI Helpers (Joined data)
  serviceName?: string;
  unitPrice?: number;
  description?: string; // For PDF
  unit?: string;        // For PDF
}

// Matching schema: budgets(id, company_id, client_name, total, created_at)
export interface Budget {
  id: string;
  companyId: string;
  clientName: string; // maps to client_name
  total: number;      // maps to total
  createdAt: string;  // maps to created_at
  
  items: BudgetItem[]; // Joined items

  // UI Helpers (Computed or Mocked)
  number: number;
  category: string;
  clientAddress?: string;
}
