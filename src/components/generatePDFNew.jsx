import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Register Amiri font for Arabic support
try {
  Font.register({
    family: 'Amiri',
    src: '/Amiri-Regular.ttf'
  });
} catch (err) {
  console.warn('[PDF] Could not register Amiri font, Arabic may not render correctly', err);
}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#000'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10
  },
  dateRange: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666666'
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
    textAlign: 'center'
  },
  table: {
    marginBottom: 15,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#cccccc'
  },
  tableHeader: {
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    fontWeight: 'bold',
    borderBottomWidth: 1,
    borderBottomColor: '#cccccc'
  },
  tableRow: {
    display: 'flex',
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee'
  },
  tableCell: {
    flex: 1,
    padding: 5,
    fontSize: 9
  },
  tableCellHeader: {
    flex: 1,
    padding: 5,
    fontSize: 9,
    fontWeight: 'bold'
  },
  text: {
    fontSize: 10,
    marginBottom: 5
  }
});

// Helper functions
const formatValue = (value, devise = '') => {
  if (typeof value === 'number') {
    const formatted = value.toFixed(2);
    return devise ? `${formatted} ${devise}` : formatted;
  }
  return String(value || '-');
};

const replaceUnderscores = (str) => {
  if (!str) return '';
  return String(str).replace(/_/g, ' ');
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
    'delivery': 'delivery'
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

  // Fallback to an English-friendly label
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

const translateTicketStatus = (status, t) => {
  const translations = {
    'Encaiser': t('report.columns.collected'),
    'Rembourser': t('report.columns.refunded'),
    'Annuler': t('report.columns.cancelled'),
  };
  return translations[status] || status;
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const year = String(dateString).substring(0, 4);
  const month = String(dateString).substring(4, 6);
  const day = String(dateString).substring(6, 8);
  const date = new Date(`${year}-${month}-${day}`);
  return date.toLocaleDateString('en-GB');
};

// Table component
const ReportTable = ({ headers, rows, lang = 'en' }) => {
  const textDirection = lang === 'ar' ? { direction: 'rtl', textAlign: 'right' } : {};
  return (
    <View style={styles.table}>
      <View style={styles.tableHeader}>
        {headers.map((header, idx) => (
          <Text key={idx} style={[styles.tableCellHeader, textDirection]}>
            {String(header || '')}
          </Text>
        ))}
      </View>
      {rows.map((row, rowIdx) => (
        <View key={rowIdx} style={styles.tableRow}>
          {row.map((cell, cellIdx) => (
            <Text key={cellIdx} style={[styles.tableCell, textDirection]}>
              {String(cell || '')}
            </Text>
          ))}
        </View>
      ))}
    </View>
  );
};

// Main PDF Document component
const ReportDocument = ({ data, storeInformation, date1, date2, t, lang = 'en' }) => {
  if (!data) return <Document><Page style={styles.page}><Text>No data</Text></Page></Document>;

  const devise = data.devise || 'EUR';
  const formattedDate1 = formatDate(date1);
  const formattedDate2 = formatDate(date2);
  const dateRangeText = date1 !== date2
    ? `${t('report.period')}: ${formattedDate1} ${t('report.to')} ${formattedDate2}`
    : `${t('report.singleDay')}: ${formattedDate1}`;

  // dynamic page style to apply Arabic font/direction
  const pageStyle = {
    ...styles.page,
    fontFamily: lang === 'ar' ? 'Amiri' : 'Helvetica',
    direction: lang === 'ar' ? 'rtl' : 'ltr'
  };
  const textDirection = lang === 'ar' ? { direction: 'rtl', textAlign: 'right' } : {};

  return (
    <Document>
      <Page style={pageStyle}>
        {/* Title */}
        <Text style={[styles.title, textDirection]}>{t('report.title')} {storeInformation}</Text>

        {/* Date Range */}
        <Text style={[styles.dateRange, textDirection]}>{dateRangeText}</Text>

        {/* Revenue Section */}
        {data.ChiffreAffaire && (
          <>
            <Text style={[styles.sectionHeader, textDirection]}>{t('report.sections.revenue')}</Text>
            <ReportTable
              headers={[t('report.columns.ht'), t('report.columns.vat'), t('report.columns.ttc')]}
              rows={[[
                formatValue(data.ChiffreAffaire.Total_HT, devise),
                formatValue(data.ChiffreAffaire.TVA, devise),
                formatValue(data.ChiffreAffaire.Total_TTC, devise)
              ]]}
              lang={lang}
            />
          </>
        )}

        {/* Tax Breakdown Section */}
        {data.ChiffreAffaireDetailler && Object.keys(data.ChiffreAffaireDetailler).length > 0 && (
          <>
            <Text style={[styles.sectionHeader, textDirection]}>{t('report.sections.taxBreakdown')}</Text>
            <ReportTable
              headers={[t('report.columns.rate'), t('report.columns.amount')]}
              rows={Object.entries(data.ChiffreAffaireDetailler).map(([_, v]) => [
                String(v.Taux || ''),
                formatValue(v.TTC, devise)
              ])}
              lang={lang}
            />
          </>
        )}

        {/* Payment Methods Section */}
        {data.modePaiement && Object.keys(data.modePaiement).length > 0 && (
          <>
            <Text style={[styles.sectionHeader, textDirection]}>{t('report.sections.paymentMethods')}</Text>
            <ReportTable
              headers={[t('report.columns.rate'), t('report.columns.amount')]}
              rows={Object.entries(data.modePaiement).map(([k, v]) => {
                const translatedKey = translatePaymentMethod(k, t);
                return [String(translatedKey), formatValue(v, devise)];
              })}
              lang={lang}
            />
          </>
        )}

        {/* Ticket Status Section */}
        {data.EtatTiquer && (
          <>
            <Text style={[styles.sectionHeader, textDirection]}>{t('report.sections.ticketStatus')}</Text>
            <ReportTable
              headers={[t('report.columns.collected'), t('report.columns.refunded'), t('report.columns.cancelled')]}
              rows={[[
                `${data.EtatTiquer.Encaiser} ${t('report.labels.ticket')}`,
                `${data.EtatTiquer.Rembourser} ${t('report.labels.ticket')}`,
                `${data.EtatTiquer.Annuler} ${t('report.labels.ticket')}`
              ]]}
              lang={lang}
            />
          </>
        )}

        {/* Consumption Methods Section */}
        {data.modeConsommation && Object.keys(data.modeConsommation).length > 0 && (
          <>
            <Text style={[styles.sectionHeader, textDirection]}>{t('report.sections.consumptionMethods')}</Text>
            <ReportTable
              headers={[t('report.columns.rate'), t('report.columns.amount')]}
              rows={Object.entries(data.modeConsommation)
                .filter(([, amt]) => amt > 0)
                .map(([k, amt]) => {
                  const normalizedKey = String(k).replace(/\s+/g, '_');
                  const translatedKey = translateConsumptionMethod(k, t);
                  return [String(translatedKey), formatValue(amt, devise)];
                })}
              lang={lang}
            />
          </>
        )}
      </Page>
    </Document>
  );
};

export { ReportDocument };
