import * as XLSX from 'xlsx';

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

function formatDate2(dateString) {
    const year = dateString.substring(0, 4);
    const month = dateString.substring(4, 6);
    const day = dateString.substring(6, 8);
  
    // Construct a formatted date string
    const date = `${day}/${month}/${year}`;
  
    return date;
}

const generateExcel = (data, storeInformation, date1, date2) => {
    const workbook = XLSX.utils.book_new();
    const worksheetData = [];
    const dateRangeText = (date1 !== date2) ? `${formatDate(date1)} - ${formatDate(date2)}` : `${formatDate(date1)}`;
    const dateRangeText2 = (date1 !== date2) ? `${formatDate2(date1)} - ${formatDate2(date2)}` : `${formatDate2(date1)}`;
    
    // Add title and subtitle
    worksheetData.push(['',`Rapport Fiscal de ${storeInformation.Nom}`]); // Centered section title across columns A and B
    worksheetData.push([{ v: '', s: { alignment: { horizontal: 'center' } } }, { v: `pour le jour ${dateRangeText2}`, s: { alignment: { horizontal: 'center' } } }]);
    
    // Define sections
    const sections = [
        { title: 'Chiffre d\'Affaires Global', data: data?.ChiffreAffaire },
        { title: 'Modes de Paiement', data: data?.modePaiement },
        { title: 'Modes de Consommation', data: data?.modeConsommation },
        { title: 'Etat Ticket', data: data?.EtatTiquer },
        { title: 'Répartition des Taxes', data: data?.ChiffreAffaireDetailler },
        // { title: 'Ventes de Produits', data: data?.ProduitDetailler }
    ];

    // Iterate through sections and build worksheetData
    sections.forEach(section => {
        // Add empty rows before each section
        worksheetData.push([]);
        worksheetData.push([]);
        
        // Add section title
        worksheetData.push(['', section.title]);

        // Process each section differently
        if (section.title === 'Chiffre d\'Affaires Global') {
            worksheetData.push(
                ['Total HT', 'TVA', 'Total TTC'],
                [`${formatValue(section?.data.Total_HT, data.devise)} ${data.devise}`, `${formatValue(section?.data.TVA, data.devise)} ${data.devise}`, `${formatValue(section?.data.Total_TTC, data.devise)} ${data.devise}`]
            );
        } else if (section.title === 'Répartition des Taxes') {
            const taxData = Object.entries(section?.data).flatMap(([key, value]) => [[value.Taux, `${formatValue(value.TTC, data.devise)} ${data.devise}`]]);
            worksheetData.push(['Taux', "Montant"], ...taxData);
        } else if (section.title === 'Ventes de Produits') {
            // Center align "Quantité" and "Somme"
            worksheetData.push(['Produit', { v: 'Quantité', s: { alignment: { horizontal: 'center' } } }, { v: 'Somme', s: { alignment: { horizontal: 'center' } } }]);
            Object.entries(section.data).filter(([product, details]) => product !== 'SommeTOTAL').forEach(([product, details]) => {
                worksheetData.push([
                    replaceUnderscores(product),
                    { v: details.Qty !== 0 ? details.Qty : 'xx', s: { alignment: { horizontal: 'center' } } },
                    `${formatValue(details.Somme, data.devise)} ${data.devise}`
                ]);
            });
        } else if (section.title === 'Etat Ticket') {
            worksheetData.push(['Encaissés', 'Remboursés', 'Annulés'], [`${section?.data.Encaiser} Ticket`, `${section?.data.Rembourser} Ticket`, `${section?.data.Annuler} Ticket`]);
        } else {
            worksheetData.push([section.title, 'Montant'], ...Object.entries(section?.data).filter(([key, value]) => value > 0).map(([key, value]) => [replaceUnderscores(key), `${formatValue(value, data.devise)} ${data.devise}`]));
        }
    });

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Set column widths to 50px (adjust as necessary)
    const colWidths = [];
    const maxCols = Math.max(...worksheetData.map(row => row.length));
    for (let i = 0; i < maxCols; i++) {
        colWidths.push({ width: 50 });
    }
    worksheet['!cols'] = colWidths;

    // Append the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Rapport Fiscal');

    // Save the workbook
    const filename = `rapport_fiscal_du_magasin_${dateRangeText}.xlsx`;
    XLSX.writeFile(workbook, filename);
};

export default generateExcel;
