import { User, Company, Budget, PlanType, UserRole, Material } from '../types';

// Simulating a backend database in memory
let users: User[] = [];
let companies: Company[] = [];
let budgets: Budget[] = [];
let currentUser: User | null = null;

// Mock Materials Database
const mockMaterials: Material[] = [
  { id: 'm1', companyId: 'mock_co', name: 'Placa Drywall ST 1.20x2.40', category: 'Gesso', unit: 'un', costPrice: 22.90, salesPrice: 32.90, consumption: 0.35 },
  { id: 'm2', companyId: 'mock_co', name: 'Massa Corrida PVA (Lata 18L)', category: 'Pintura', unit: 'lata', costPrice: 45.00, salesPrice: 65.00, consumption: 0.08 },
  { id: 'm3', companyId: 'mock_co', name: 'Tinta Acrílica Premium', category: 'Pintura', unit: 'L', costPrice: 35.00, salesPrice: 45.00, consumption: 0.1 },
  { id: 'm4', companyId: 'mock_co', name: 'Cimento CP-II 50kg', category: 'Alvenaria', unit: 'sc', costPrice: 28.00, salesPrice: 38.00, consumption: 0.2 },
  { id: 'm5', companyId: 'mock_co', name: 'Tijolo Baiano 6 furos', category: 'Alvenaria', unit: 'mil', costPrice: 650.00, salesPrice: 850.00, consumption: 0.025 },
  { id: 'm6', companyId: 'mock_co', name: 'Porcelanato 60x60', category: 'Acabamento', unit: 'm²', costPrice: 60.00, salesPrice: 89.90, consumption: 1.1 },
  { id: 'm7', companyId: 'mock_co', name: 'Fio Flexível 2.5mm', category: 'Elétrica', unit: 'm', costPrice: 1.50, salesPrice: 2.50, consumption: 1.5 },
  { id: 'm_exemplo', companyId: 'mock_co', name: 'Material Exemplo (Prompt)', category: 'Geral', unit: 'un', costPrice: 30.00, salesPrice: 45.00, consumption: 1.3 }, 
];

export const MockAuth = {
  login: async (email: string) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const user = users.find(u => u.email === email);
    if (!user) throw new Error('Usuário não encontrado. (Dica: Crie uma conta de empresa primeiro)');
    currentUser = user;
    return user;
  },
  
  registerCompany: async (
    companyData: Omit<Company, 'id' | 'plan'>, 
    userData: { name: string; email: string }
  ) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const userId = `user_${Date.now()}`;
    const companyId = `comp_${Date.now()}`;

    const newUser: User = {
      id: userId,
      email: userData.email,
      name: userData.name,
      companyId: companyId,
      role: UserRole.ADMIN
    };

    const newCompany: Company = {
      ...companyData,
      id: companyId,
      plan: PlanType.FREE // Start as free
    };

    users.push(newUser);
    companies.push(newCompany);
    currentUser = newUser;

    return { user: newUser, company: newCompany };
  },

  logout: () => {
    currentUser = null;
  },

  getCurrentUser: () => currentUser,
  
  getCompany: (companyId: string) => companies.find(c => c.id === companyId)
};

export const MockData = {
  getBudgets: async (companyId: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return budgets.filter(b => b.companyId === companyId);
  },

  createBudget: async (budget: Omit<Budget, 'id' | 'number' | 'createdAt'>) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const companyBudgets = budgets.filter(b => b.companyId === budget.companyId);
    const company = companies.find(c => c.id === budget.companyId);

    // Free plan limit check
    if (company?.plan === PlanType.FREE && companyBudgets.length >= 3) {
      throw new Error("Limite do plano Grátis atingido. Faça o upgrade para criar mais orçamentos.");
    }

    const newBudget: Budget = {
      ...budget,
      id: `budget_${Date.now()}`,
      number: companyBudgets.length + 1,
      createdAt: new Date().toISOString(),
    };
    
    budgets.push(newBudget);
    return newBudget;
  },

  upgradePlan: async (companyId: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const company = companies.find(c => c.id === companyId);
    if (company) company.plan = PlanType.PREMIUM;
  },

  getMaterials: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockMaterials;
  }
};