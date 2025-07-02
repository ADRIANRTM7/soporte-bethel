import jsPDF from 'jspdf';
import { PdfTemplate, FilledForm, WorkOrder } from '@/types';
import { formatDateTime } from '@/lib/utils';

interface PDFGeneratorOptions {
  workOrder: WorkOrder;
  template: PdfTemplate;
  filledForm: FilledForm;
  technicianName: string;
  clientName: string;
}

export class PDFGenerator {
  private pdf: jsPDF;
  private pageWidth: number;
  private pageHeight: number;
  private margin: number = 20;
  private currentY: number = 20;

  constructor() {
    this.pdf = new jsPDF();
    this.pageWidth = this.pdf.internal.pageSize.getWidth();
    this.pageHeight = this.pdf.internal.pageSize.getHeight();
  }

  async generatePDF(options: PDFGeneratorOptions): Promise<string> {
    const { workOrder, template, filledForm, technicianName, clientName } = options;

    // Header
    this.addHeader(workOrder, template);
    this.currentY += 20;

    // Client info
    this.addClientInfo(workOrder);
    this.currentY += 15;

    // Form fields
    this.addFormFields(template, filledForm);
    this.currentY += 15;

    // Signatures
    await this.addSignatures(filledForm, technicianName, clientName);

    // Footer
    this.addFooter();

    return this.pdf.output('datauristring');
  }

  private addHeader(workOrder: WorkOrder, template: PdfTemplate) {
    // Company logo/header
    this.pdf.setFontSize(20);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('BETHEL SAS', this.margin, this.currentY);
    
    this.pdf.setFontSize(12);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text('Gestión Operativa de Campo', this.margin, this.currentY + 8);

    // Document title
    this.pdf.setFontSize(16);
    this.pdf.setFont('helvetica', 'bold');
    const titleY = this.currentY + 25;
    this.pdf.text(template.name, this.margin, titleY);

    // Work order number and date
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'normal');
    const infoY = titleY + 10;
    this.pdf.text(`Orden de Trabajo: ${workOrder.number}`, this.margin, infoY);
    this.pdf.text(`Fecha: ${formatDateTime(new Date())}`, this.margin, infoY + 5);

    this.currentY = infoY + 15;
  }

  private addClientInfo(workOrder: WorkOrder) {
    this.pdf.setFontSize(12);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('INFORMACIÓN DEL CLIENTE', this.margin, this.currentY);

    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'normal');
    this.currentY += 8;

    const clientInfo = [
      `Cliente: ${workOrder.clientName}`,
      `Contacto: ${workOrder.clientContact}`,
      `Dirección: ${workOrder.clientAddress}`,
      `Servicio: ${workOrder.serviceType}`,
      `Descripción: ${workOrder.description}`
    ];

    clientInfo.forEach(info => {
      this.pdf.text(info, this.margin, this.currentY);
      this.currentY += 5;
    });
  }

  private addFormFields(template: PdfTemplate, filledForm: FilledForm) {
    this.pdf.setFontSize(12);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('DATOS DEL FORMULARIO', this.margin, this.currentY);

    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'normal');
    this.currentY += 8;

    template.fields.forEach(field => {
      if (field.type === 'signature' || field.type === 'photo') return;

      const value = filledForm.data[field.name] || 'N/A';
      const text = `${field.label}: ${value}`;
      
      // Check if we need a new page
      if (this.currentY > this.pageHeight - 40) {
        this.pdf.addPage();
        this.currentY = this.margin;
      }

      if (field.type === 'textarea') {
        this.pdf.setFont('helvetica', 'bold');
        this.pdf.text(field.label + ':', this.margin, this.currentY);
        this.currentY += 5;
        
        this.pdf.setFont('helvetica', 'normal');
        const lines = this.pdf.splitTextToSize(value, this.pageWidth - 2 * this.margin);
        this.pdf.text(lines, this.margin, this.currentY);
        this.currentY += lines.length * 5 + 5;
      } else {
        this.pdf.text(text, this.margin, this.currentY);
        this.currentY += 5;
      }
    });
  }

  private async addSignatures(filledForm: FilledForm, technicianName: string, clientName: string) {
    // Check if we need a new page for signatures
    if (this.currentY > this.pageHeight - 120) {
      this.pdf.addPage();
      this.currentY = this.margin;
    }

    this.pdf.setFontSize(12);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('FIRMAS', this.margin, this.currentY);
    this.currentY += 15;

    const signatureWidth = 80;
    const signatureHeight = 40;
    const signatures = filledForm.signatures;

    // Technician signature
    if (signatures.technician) {
      try {
        this.pdf.addImage(
          signatures.technician,
          'PNG',
          this.margin,
          this.currentY,
          signatureWidth,
          signatureHeight
        );
      } catch (error) {
        console.warn('Could not add technician signature:', error);
      }
    }
    
    this.pdf.setFontSize(8);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text('_'.repeat(25), this.margin, this.currentY + signatureHeight + 5);
    this.pdf.text(`${technicianName} - Técnico`, this.margin, this.currentY + signatureHeight + 10);

    // Client signature
    if (signatures.client) {
      try {
        this.pdf.addImage(
          signatures.client,
          'PNG',
          this.margin + 100,
          this.currentY,
          signatureWidth,
          signatureHeight
        );
      } catch (error) {
        console.warn('Could not add client signature:', error);
      }
    }

    this.pdf.text('_'.repeat(25), this.margin + 100, this.currentY + signatureHeight + 5);
    this.pdf.text('Cliente - Recibido conforme', this.margin + 100, this.currentY + signatureHeight + 10);

    // Supervisor signature if exists
    if (signatures.supervisor) {
      this.currentY += signatureHeight + 20;
      
      try {
        this.pdf.addImage(
          signatures.supervisor,
          'PNG',
          this.margin + 50,
          this.currentY,
          signatureWidth,
          signatureHeight
        );
      } catch (error) {
        console.warn('Could not add supervisor signature:', error);
      }

      this.pdf.text('_'.repeat(25), this.margin + 50, this.currentY + signatureHeight + 5);
      this.pdf.text('Supervisor - Aprobado', this.margin + 50, this.currentY + signatureHeight + 10);
    }
  }

  private addFooter() {
    const footerY = this.pageHeight - 20;
    
    this.pdf.setFontSize(8);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text(
      'Este documento ha sido generado digitalmente por el sistema Gestión Operativa Bethel',
      this.margin,
      footerY
    );
    
    this.pdf.text(
      `Generado el: ${formatDateTime(new Date())}`,
      this.pageWidth - this.margin - 60,
      footerY
    );
  }

  static async generateFromForm(options: PDFGeneratorOptions): Promise<string> {
    const generator = new PDFGenerator();
    return await generator.generatePDF(options);
  }
}