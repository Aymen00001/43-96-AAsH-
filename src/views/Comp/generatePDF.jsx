import jsPDF from 'jspdf';
import 'jspdf-autotable';

const formatValue = (value, devise) => {
    if (devise === "DT") {
        return parseFloat(value).toFixed(3); // Formats to three decimal places
    } else {
        return parseFloat(value).toFixed(2);
    }
};
const replaceUnderscores = (str) => {
    if (str ==="Encaiser"){str="Encaissés"}
    if (str ==="Rembourser"){str="Remboursés"}
    if (str ==="Annuler"){str="Annulés"}
    if (str ==="Dine-in"){str="Dine-in"}
    if (str ==="Takeaway"){str="Takeaway"}
    if (str ==="Delivery"){str="Delivery"}
    return str.replace(/_/g, " ");
  };
function formatDate(dateString) {
    const year = dateString.substring(0, 4);
    const month = dateString.substring(4, 6);
    const day = dateString.substring(6, 8);
  
    // Construct a Date object
    const date = new Date(`${year}-${month}-${day}`);
  
    // Use toLocaleDateString to format the date
    return date.toLocaleDateString('en-GB');
}

const generatePDF = (data, storeInformation, date1, date2) => {
    // Create a new PDF instance
    const doc = new jsPDF();

    // Add Cover Page
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text(`Rapport Fiscal de ${storeInformation.Nom}`, 105, 20, { align: 'center' });
    doc.setFontSize(12);
    const formattedDate1 = formatDate(date1);
    const formattedDate2 = formatDate(date2);
    const dateRangeText = (date1 !== date2) ? `Période: ${formattedDate1} à ${formattedDate2}` : `Pour le jour: ${formattedDate1}`;
    doc.text(dateRangeText, 105, 30, { align: 'center' });

    // Add Sections
    const sections = [
        { title: 'Chiffre d\'Affaires Global', data: data?.ChiffreAffaire },
        { title: 'Répartition des Taxes', data: data?.ChiffreAffaireDetailler },
        { title: 'Modes de Paiement', data: data?.modePaiement },
        { title: 'Etat Ticket', data: data?.EtatTiquer },
        { title: 'Modes de Consommation', data: data?.modeConsommation },
        // { title: 'Ventes de Produits', data: data?.ProduitDetailler }
    ];

    let currentY = 50; // Initial Y position after cover page
    sections?.forEach((section, index) => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.text(section.title, 105, currentY, { align: 'center' });
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(12);
        let sectionData = [];

        if (section.title === 'Chiffre d\'Affaires Global') {
            sectionData = [[ 'Total HT', 'TVA', 'Total TTC'], [`${formatValue(section?.data.Total_HT, data.devise)} ${data.devise}`, `${formatValue(section?.data.TVA, data.devise)} ${data.devise}`, `${formatValue(section?.data.Total_TTC, data.devise)} ${data.devise}`]];
        } else if (section.title === 'Répartition des Taxes') {
            const taxData = Object.entries(section?.data).flatMap(([key, value]) => [ [value.Taux, `${formatValue(value.TTC, data.devise)} ${data.devise}`]]);
            sectionData= [['Taux', "Montant"], ...taxData];
        } else if (section.title === 'Ventes de Produits') {
            sectionData = [['Produit', 'Quantité', 'Somme'], ...Object.entries(section.data).filter(([product, details]) => product !== 'SommeTOTAL').map(([product, details]) => [replaceUnderscores(product), details.Qty !== 0 ? details.Qty : 'xx', `${formatValue(details.Somme, data.devise)} ${data.devise}`])];
        }else  if (section.title === 'Etat Ticket') {
            sectionData = [[ 'Encaissés', 'Remboursés', 'Annulés'], [`${section?.data.Encaiser} Ticket`, `${section?.data.Rembourser} Ticket`, `${section?.data.Annuler} Ticket`]];
        }  else {
            sectionData = [[section.title, 'Montant'], ...Object.entries(section?.data).filter(([key, value]) => value > 0).map(([key, value]) => [replaceUnderscores(key), `${formatValue(value, data.devise)} ${data.devise}`])];
        }

        currentY += 5; // Move down for table
        const tableStyles = {
            theme: 'grid',
            headStyles: { fontStyle: 'bold', fillColor: [41, 128, 185], textColor: 255, halign: 'center' },
            bodyStyles: { textColor: 0, halign: 'center' },
            alternateRowStyles: { fillColor: 245 },
            margin: { top: 50 }
        };

        doc.autoTable({
            ...tableStyles,
            head: sectionData.splice(0, 1),
            body: sectionData,
            startY: currentY
        });
        currentY = doc.autoTable.previous.finalY + 10; // Move down for next section
    });

    // Save the PDF
    doc.save('rapport_fiscal_du_magasin.pdf');
};

export default generatePDF;
