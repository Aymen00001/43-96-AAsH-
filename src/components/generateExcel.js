import ExcelJS from 'exceljs';

const formatValue = (value, devise) => {
    if (devise === "DT") {
        return parseFloat(value).toFixed(3);
    } else {
        return parseFloat(value).toFixed(2);
    }
};

const replaceUnderscores = (str) => {
    if (!str) return '';
    return String(str).replace(/_/g, ' ');
};

const translateTicketStatus = (status, t) => {
    const translations = {
        'Encaiser': t('report.columns.collected'),
        'Rembourser': t('report.columns.refunded'),
        'Annuler': t('report.columns.cancelled'),
    };
    return translations[status] || status;
};

const normalizeTranslationKey = (key) => {
    if (!key) return '';
    return String(key)
        .trim()
        .replace(/\s+/g, '_')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
};

const mapPaymentMethodToKey = (method) => {
    if (!method) return '';
    const normalized = String(method)
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '_')
        .toUpperCase();

    const mapping = {
        'CARTE_BANCAIRE': 'card',
        'CARD': 'card',
        'ESPECE': 'cash',
        'ESPECES': 'cash',
        'CASH': 'cash',
        'TICKET_RESTO': 'mealVoucher',
        'MEAL_VOUCHER': 'mealVoucher',
        'CHÈQUE': 'check',
        'CHEQUE': 'check',
        'CHECK': 'check',
        'POINTS_FIDELITE': 'fidelityPoints',
        'POINTS_FIDÉLITÉ': 'fidelityPoints',
        'FIDELITY_POINTS': 'fidelityPoints',
        'AVOIR': 'storeCredit',
        'STORE_CREDIT': 'storeCredit',
        'CLIENT_EN_COMPTE': 'corporateAccount',
        'CORPORATE_ACCOUNT': 'corporateAccount',
    };

    return mapping[normalized] || normalized.toLowerCase();
};

const mapConsumptionMethodToKey = (method) => {
    if (!method) return '';
    const normalized = String(method)
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[-_]+/g, ' ')
        .replace(/\s+/g, ' ')
        .toLowerCase();

    const mapping = {
        'sur place': 'dineIn',
        'surplace': 'dineIn',
        'dine in': 'dineIn',
        'dine-in': 'dineIn',
        'dinein': 'dineIn',
        'a emporter': 'takeaway',
        'aemporter': 'takeaway',
        'takeaway': 'takeaway',
        'livraison': 'delivery',
        'delivery': 'delivery',
    };

    return mapping[normalized] || normalized;
};

const translatePaymentMethod = (method, t) => {
    if (!method) return '';

    const key = mapPaymentMethodToKey(method);
    const translationKey = `paymentMethods.${key}`;
    const translation = t(translationKey);

    if (translation && translation !== translationKey) {
        return translation;
    }

    const fallbackLabels = {
        card: 'Card',
        cash: 'Cash',
        mealVoucher: 'Meal Voucher',
        check: 'Check',
        fidelityPoints: 'Fidelity Points',
        storeCredit: 'Store Credit',
        corporateAccount: 'Corporate Account',
    };

    return fallbackLabels[key] || replaceUnderscores(method);
};

const translateConsumptionMethod = (method, t) => {
    if (!method) return '';

    const key = mapConsumptionMethodToKey(method);
    const translationKey = `consumptionMethods.${key}`;
    const translation = t(translationKey);

    if (translation && translation !== translationKey) {
        return translation;
    }

    const fallbackLabels = {
        dineIn: 'Dine In',
        takeaway: 'Takeaway',
        delivery: 'Delivery',
    };

    return fallbackLabels[key] || replaceUnderscores(method);
};

function formatDate(dateString) {
    const year = dateString.substring(0, 4);
    const month = dateString.substring(4, 6);
    const day = dateString.substring(6, 8);
  
    const date = new Date(`${year}-${month}-${day}`);
    return date.toLocaleDateString('en-GB');
}

function formatDate2(dateString) {
    const year = dateString.substring(0, 4);
    const month = dateString.substring(4, 6);
    const day = dateString.substring(6, 8);
    return `${day}/${month}/${year}`;
}

const generateExcel = (data, storeInformation, date1, date2, t) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(t('report.sheetName'));
    const dateRangeText = (date1 !== date2) ? `${formatDate(date1)} - ${formatDate(date2)}` : `${formatDate(date1)}`;
    const dateRangeText2 = (date1 !== date2) ? `${formatDate2(date1)} - ${formatDate2(date2)}` : `${formatDate2(date1)}`;
    
    const reportTitle = t('report.title') + ' ' + storeInformation;
    let rowNum = 1;
    
    worksheet.getColumn(1).width = 50;
    worksheet.getColumn(2).width = 50;
    worksheet.getColumn(3).width = 50;

    // Add title
    worksheet.getCell(`B${rowNum}`).value = reportTitle;
    rowNum++;
    worksheet.getCell(`B${rowNum}`).value = `${t('report.singleDay')} ${dateRangeText2}`;
    rowNum++;
    
    const sections = [
        { title: t('report.sections.revenue'), data: data?.ChiffreAffaire },
        { title: t('report.sections.paymentMethods'), data: data?.modePaiement },
        { title: t('report.sections.consumptionMethods'), data: data?.modeConsommation },
        { title: t('report.sections.ticketStatus'), data: data?.EtatTiquer },
        { title: t('report.sections.taxBreakdown'), data: data?.ChiffreAffaireDetailler },
    ];

    sections.forEach(section => {
        rowNum++; // Empty row
        rowNum++; // Empty row
        rowNum++; // Section title
        
        // Section title row with darker gray background and white text - across 3 columns
        const titleCells = ['A', 'B', 'C'];
        titleCells.forEach((col) => {
            const titleCell = worksheet.getCell(`${col}${rowNum}`);
            if (col === 'B') {
                titleCell.value = section.title;
            }
            titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2C2C2C' } };
            titleCell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
        });

        if (section.title === t('report.sections.revenue')) {
            rowNum++;
            // Header row with medium gray background and white text
            const headerCells = ['A', 'B', 'C'];
            const headers = [t('report.columns.ht'), t('report.columns.vat'), t('report.columns.ttc')];
            headers.forEach((header, idx) => {
                const cell = worksheet.getCell(`${headerCells[idx]}${rowNum}`);
                cell.value = header;
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF808080' } };
                cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
            });
            
            rowNum++;
            const values = [
                `${formatValue(section?.data.Total_HT, data.devise)} ${data.devise}`,
                `${formatValue(section?.data.TVA, data.devise)} ${data.devise}`,
                `${formatValue(section?.data.Total_TTC, data.devise)} ${data.devise}`
            ];
            values.forEach((value, idx) => {
                worksheet.getCell(`${headerCells[idx]}${rowNum}`).value = value;
            });
        } else if (section.title === t('report.sections.taxBreakdown')) {
            rowNum++;
            // Header row with medium gray background and white text - across 3 columns
            const headerCells = ['A', 'B', 'C'];
            const headers = [t('report.columns.rate'), t('report.columns.amount'), ''];
            headers.forEach((header, idx) => {
                const cell = worksheet.getCell(`${headerCells[idx]}${rowNum}`);
                if (header) {
                    cell.value = header;
                }
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF808080' } };
                cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
            });
            
            Object.entries(section?.data).forEach(([key, value]) => {
                rowNum++;
                worksheet.getCell(`A${rowNum}`).value = value.Taux;
                worksheet.getCell(`B${rowNum}`).value = `${formatValue(value.TTC, data.devise)} ${data.devise}`;
            });
        } else if (section.title === t('report.sections.ticketStatus')) {
            rowNum++;
            // Header row with medium gray background and white text
            const headerCells = ['A', 'B', 'C'];
            const headers = [t('report.columns.collected'), t('report.columns.refunded'), t('report.columns.cancelled')];
            headers.forEach((header, idx) => {
                const cell = worksheet.getCell(`${headerCells[idx]}${rowNum}`);
                cell.value = header;
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF808080' } };
                cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
            });
            
            rowNum++;
            const values = [
                `${section?.data.Encaiser} ${t('report.labels.ticket')}`,
                `${section?.data.Rembourser} ${t('report.labels.ticket')}`,
                `${section?.data.Annuler} ${t('report.labels.ticket')}`
            ];
            values.forEach((value, idx) => {
                worksheet.getCell(`${headerCells[idx]}${rowNum}`).value = value;
            });
        } else {
            rowNum++;
            // Header row with medium gray background and white text - across 3 columns
            const headerCells = ['A', 'B', 'C'];
            const headers = [section.title, t('report.columns.amount'), ''];
            headers.forEach((header, idx) => {
                const cell = worksheet.getCell(`${headerCells[idx]}${rowNum}`);
                if (header) {
                    cell.value = header;
                }
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF808080' } };
                cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
            });
            
            Object.entries(section?.data).filter(([key, value]) => value > 0).forEach(([key, value]) => {
                rowNum++;
                let displayKey = key;
                if (section.title === t('report.sections.paymentMethods')) {
                    displayKey = translatePaymentMethod(key, t);
                } else if (section.title === t('report.sections.consumptionMethods')) {
                    displayKey = translateConsumptionMethod(key, t);
                } else {
                    displayKey = replaceUnderscores(key);
                }
                worksheet.getCell(`A${rowNum}`).value = displayKey;
                worksheet.getCell(`B${rowNum}`).value = `${formatValue(value, data.devise)} ${data.devise}`;
            });
        }
    });

    const filename = `${t('report.filename')}_${dateRangeText}.xlsx`;
    
    // Generate buffer and download
    workbook.xlsx.writeBuffer().then(buffer => {
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    });
};

export default generateExcel;
