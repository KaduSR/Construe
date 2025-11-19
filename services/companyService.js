import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../config/firebase";

/**
 * Salva ou atualiza os dados da empresa no Firestore.
 * @param {string} userId - O UID do usuário autenticado (será o ID do documento).
 * @param {Object} companyData - Objeto com os dados da empresa (nome, cnpj, etc).
 */
export const saveCompanyData = async (userId, companyData) => {
  try {
    // Cria uma referência para o documento na coleção 'companies' com o ID igual ao userId.
    const companyRef = doc(db, "companies", userId);

    // Usa setDoc com merge: true para criar ou atualizar sem apagar outros campos
    await setDoc(companyRef, {
      ...companyData,
      ownerId: userId,
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp() // Nota: Em atualizações reais, idealmente checaríamos se já existe para não resetar o createdAt
    }, { merge: true });

    return { success: true };
  } catch (error) {
    console.error("Erro ao salvar dados da empresa:", error);
    throw error;
  }
};
