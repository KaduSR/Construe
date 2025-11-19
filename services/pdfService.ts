
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Budget, Company } from '../types';

export const generateBudgetPDF = (budget: Budget, company: Company) => {
  const doc = new jsPDF();

  // Colors
  const primaryColor = '#1e293b'; // Slate 800
  
  // Header - Company Info
  doc.setFontSize(22);
  doc.setTextColor(primaryColor);
  doc.text(company.name.toUpperCase(), 14, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`${company.type} - CNPJ: ${company.cnpj}`, 14, 28);
  doc.text(`${company.address || ''}`, 14, 33);
  doc.text(`Tel: ${company.phone || ''}`, 14, 38);

  // Header - Budget Info
  doc.setFontSize(16);
  doc.setTextColor(primaryColor);
  doc.text('ORÇAMENTO', 140, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(0);
  doc.text(`Nº: #${budget.number.toString().padStart(4, '0')}`, 140, 28);
  doc.text(`Data: ${new Date(budget.createdAt).toLocaleDateString('pt-BR')}`, 140, 33);
  doc.text(`Categoria: ${budget.category}`, 140, 38);

  // Divider
  doc.setDrawColor(200);
  doc.line(14, 45, 196, 45);

  // Client Info
  doc.setFontSize(12);
  doc.setTextColor(primaryColor);
  doc.text('Dados do Cliente', 14, 55);
  
  doc.setFontSize(10);
  doc.setTextColor(50);
  doc.text(`Nome: ${budget.clientName}`, 14, 62);
  doc.text(`Local da Obra: ${budget.clientAddress || ''}`, 14, 67);

  // Items Table
  const tableColumn = ["Descrição", "Qtd", "Unid", "Preço Un.", "Total"];
  const tableRows = budget.items.map(item => [
    item.description || item.serviceName || 'Serviço',
    item.quantity,
    item.unit || 'un',
    `R$ ${item.unitPrice?.toFixed(2) || '0.00'}`,
    `R$ ${item.subtotal.toFixed(2)}`
  ]);

  autoTable(doc, {
    startY: 75,
    head: [tableColumn],
    body: tableRows,
    headStyles: { fillColor: primaryColor },
    theme: 'grid',
  });

  // Total
  // @ts-ignore
  const finalY = doc.lastAutoTable.finalY || 150;
  
  doc.setFontSize(14);
  doc.setTextColor(primaryColor);
  doc.text(`TOTAL GERAL: R$ ${budget.total.toFixed(2)}`, 14, finalY + 20);

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text('Orçamento válido por 15 dias.', 14, 280);
  doc.text(`Gerado via Construe App`, 196, 280, { align: 'right' });

  // Save
  doc.save(`orcamento_${budget.number}_${company.name.replace(/\s+/g, '_')}.pdf`);
};
