import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

console.log('[PDF MODULE] Loading generatePDF module');
console.log('[PDF MODULE] pdfMake imported:', !!pdfMake);
console.log('[PDF MODULE] pdfFonts imported:', !!pdfFonts);
console.log('[PDF MODULE] pdfFonts type:', typeof pdfFonts);
console.log('[PDF MODULE] pdfFonts keys count:', Object.keys(pdfFonts).length);
console.log('[PDF MODULE] pdfFonts keys:', Object.keys(pdfFonts));

// initialize vfs with built‑in Roboto – we'll add Amiri on demand
console.log('[PDF MODULE] Initializing pdfMake.vfs with pdfFonts');
pdfMake.vfs = pdfFonts;
console.log('[PDF MODULE] pdfMake.vfs initialized, keys:', Object.keys(pdfMake.vfs));

// register Roboto font for all content (including Arabic text, will display Latin)
console.log('[PDF MODULE] Registering fonts...');
pdfMake.fonts = {
    Roboto: {
        normal: 'Roboto-Regular.ttf',
        bold: 'Roboto-Medium.ttf',
        italics: 'Roboto-Italic.ttf',
        bolditalics: 'Roboto-Italic.ttf'
    }
};
console.log('[PDF MODULE] Fonts registered:', Object.keys(pdfMake.fonts));
console.log('[PDF MODULE] generatePDF module ready\n');

const formatValue = (value, devise) => {
    if (devise === "DT") {
        return parseFloat(value).toFixed(3);
    } else {
        return parseFloat(value).toFixed(2);
    }
};

const replaceUnderscores = (str) => {
    return str.replace(/_/g, " ");
};

const translateTicketStatus = (status, t) => {
    const translations = {
        'Encaiser': t('report.columns.collected'),
        'Rembourser': t('report.columns.refunded'),
        'Annuler': t('report.columns.cancelled'),
    };
    return translations[status] || status;
};

function formatDate(dateString) {
    const year = dateString.substring(0, 4);
    const month = dateString.substring(4, 6);
    const day = dateString.substring(6, 8);
  
    const date = new Date(`${year}-${month}-${day}`);
    return date.toLocaleDateString('en-GB');
}

const generatePDF = (data, storeInformation, date1, date2, t) => {
    console.log('\n========== [PDF EXPORT] START ==========');
    console.log('[PDF] Called with:', { storeInformation, date1, date2 });

    const formattedDate1 = formatDate(date1);
    const formattedDate2 = formatDate(date2);
    const dateRangeText = (date1 !== date2) 
        ? `${t('report.period')}: ${formattedDate1} ${t('report.to')} ${formattedDate2}` 
        : `${t('report.singleDay')}: ${formattedDate1}`;

    const reportTitle = t('report.title') + ' ' + storeInformation;

    // helper to build a table for a section
    const buildTable = (headers, rows) => ({
        table: {
            headerRows: 1,
            widths: headers.map(() => '*'),
            body: [headers, ...rows]
        },
        layout: 'lightHorizontalLines'
    });

    const contentSections = [];

    // Revenue
    contentSections.push({ text: t('report.sections.revenue'), style: 'sectionHeader' });
    contentSections.push(buildTable([
        t('report.columns.ht'),
        t('report.columns.vat'),
        t('report.columns.ttc')
    ], [[
        `${formatValue(data?.ChiffreAffaire?.Total_HT, data.devise)} ${data.devise}`,
        `${formatValue(data?.ChiffreAffaire?.TVA, data.devise)} ${data.devise}`,
        `${formatValue(data?.ChiffreAffaire?.Total_TTC, data.devise)} ${data.devise}`
    ]]));

    // Tax breakdown
    if (data?.ChiffreAffaireDetailler && Object.keys(data.ChiffreAffaireDetailler).length) {
        contentSections.push({ text: t('report.sections.taxBreakdown'), style: 'sectionHeader' });
        const rows = Object.entries(data.ChiffreAffaireDetailler).map(([_, v]) => [
            v.Taux || '',
            `${formatValue(v.TTC, data.devise)} ${data.devise}`
        ]);
        contentSections.push(buildTable([
            t('report.columns.rate'),
            t('report.columns.amount')
        ], rows));
    }

    // Payment methods
    if (data?.modePaiement && Object.keys(data.modePaiement).length) {
        contentSections.push({ text: t('report.sections.paymentMethods'), style: 'sectionHeader' });
        const rows = Object.entries(data.modePaiement).map(([k, v]) => {
            // Try to translate the payment method key, fallback to replacing underscores
            const translatedKey = t(`paymentMethods.${k}`, replaceUnderscores(k));
            return [
                translatedKey,
                `${formatValue(v, data.devise)} ${data.devise}`
            ];
        });
        contentSections.push(buildTable([
            t('report.columns.rate'),
            t('report.columns.amount')
        ], rows));
    }

    // Ticket status
    if (data?.EtatTiquer) {
        contentSections.push({ text: t('report.sections.ticketStatus'), style: 'sectionHeader' });
        contentSections.push(buildTable([
            t('report.columns.collected'),
            t('report.columns.refunded'),
            t('report.columns.cancelled')
        ], [[
            `${data.EtatTiquer.Encaiser} ${t('report.labels.ticket')}`,
            `${data.EtatTiquer.Rembourser} ${t('report.labels.ticket')}`,
            `${data.EtatTiquer.Annuler} ${t('report.labels.ticket')}`
        ]]));
    }

    // Consumption methods
    if (data?.modeConsommation && Object.keys(data.modeConsommation).length) {
        contentSections.push({ text: t('report.sections.consumptionMethods'), style: 'sectionHeader' });
        const rows = Object.entries(data.modeConsommation)
            .filter(([, amt]) => amt > 0)
            .map(([k, amt]) => {
                // Normalize key: remove spaces, replace with underscores for lookup
                const normalizedKey = k.replace(/\s+/g, '_');
                // Try to translate with normalized key, fallback to underscore replacement
                const translatedKey = t(`consumptionMethods.${normalizedKey}`, null) 
                    || t(`consumptionMethods.${k}`, null)
                    || replaceUnderscores(k);
                return [
                    translatedKey,
                    `${formatValue(amt, data.devise)} ${data.devise}`
                ];
            });
        contentSections.push(buildTable([
            t('report.columns.rate'),
            t('report.columns.amount')
        ], rows));
    }

    const docDefinition = {
        pageOrientation: 'portrait',
        pageSize: 'A4',
        pageMargins: [40, 40, 40, 40],
        content: [
            {
                text: reportTitle,
                fontSize: 20,
                bold: true,
                alignment: 'center',
                margin: [0, 0, 0, 10]
            },
            {
                text: dateRangeText,
                fontSize: 12,
                alignment: 'center',
                margin: [0, 0, 0, 20],
                color: '#666666'
            },
            ...contentSections
        ],
        styles: {
            sectionHeader: { fontSize: 14, bold: true, margin: [0, 10, 0, 5], alignment: 'center' }
        },
        defaultStyle: {
            font: 'Roboto'
        }
    };

    const filename = `${t('report.filename')}.pdf`;
    console.log('[PDF] Creating PDF with filename:', filename);
    console.log('[PDF] docDefinition.defaultStyle.font:', docDefinition.defaultStyle.font);
    
    try {
        console.log('[PDF] Calling pdfMake.createPdf()...');
        const pdfDoc = pdfMake.createPdf(docDefinition);
        console.log('[PDF] pdfMake.createPdf() succeeded');
        console.log('[PDF] Calling .download()...');
        pdfDoc.download(filename);
        console.log('[PDF] PDF download initiated successfully');
    } catch (error) {
        console.error('[PDF] ERROR during PDF creation:', error);
        console.error('[PDF] Error message:', error.message);
        console.error('[PDF] Error stack:', error.stack);
        throw error;
    }
    console.log('========== [PDF EXPORT] END ==========\n');
};

export default generatePDF;
