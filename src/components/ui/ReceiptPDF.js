'use client';

import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const colors = {
  primary: '#2c2c2c',
  accent: '#8B7355',
  light: '#f8f6f3',
  border: '#e8e0d5',
  muted: '#888',
  white: '#ffffff',
  green: '#2d7a4f',
};

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    backgroundColor: colors.white,
    padding: 0,
  },
  // Header band
  headerBand: {
    backgroundColor: colors.primary,
    paddingVertical: 20,
    paddingHorizontal: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    width: 100,
    height: 36,
    objectFit: 'contain',
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  headerTitle: {
    color: colors.white,
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 2,
  },
  headerSub: {
    color: '#ccbbaa',
    fontSize: 8,
    marginTop: 2,
    letterSpacing: 1,
  },
  // Accent line
  accentLine: {
    backgroundColor: colors.accent,
    height: 3,
  },
  // Body
  body: {
    paddingHorizontal: 40,
    paddingVertical: 24,
  },
  // Success row
  successRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#f0faf4',
    borderRadius: 6,
    padding: 12,
    borderLeft: `3px solid ${colors.green}`,
  },
  successText: {
    color: colors.green,
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    marginLeft: 8,
  },
  successSub: {
    color: '#555',
    fontSize: 9,
    marginTop: 2,
  },
  // Section title
  sectionTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: colors.accent,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 8,
    marginTop: 16,
    borderBottom: `1px solid ${colors.border}`,
    paddingBottom: 4,
  },
  // Order meta grid
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: colors.light,
    borderRadius: 6,
    padding: 12,
    gap: 0,
  },
  metaItem: {
    width: '50%',
    marginBottom: 8,
  },
  metaLabel: {
    fontSize: 8,
    color: colors.muted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  metaValue: {
    fontSize: 10,
    color: colors.primary,
    fontFamily: 'Helvetica-Bold',
    marginTop: 2,
  },
  // Items table
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    borderRadius: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginBottom: 2,
  },
  tableHeaderText: {
    color: colors.white,
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 0.5,
  },
  colProduct: { flex: 3 },
  colQty: { flex: 1, textAlign: 'center' },
  colPrice: { flex: 1.2, textAlign: 'right' },
  colTotal: { flex: 1.2, textAlign: 'right' },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottom: `1px solid ${colors.border}`,
    alignItems: 'center',
  },
  tableRowAlt: {
    backgroundColor: '#faf9f7',
  },
  itemName: {
    fontSize: 10,
    color: colors.primary,
    fontFamily: 'Helvetica-Bold',
  },
  itemSub: {
    fontSize: 8,
    color: colors.muted,
    marginTop: 1,
    letterSpacing: 0.5,
  },
  cellText: {
    fontSize: 10,
    color: colors.primary,
  },
  // Totals
  totalsBox: {
    marginTop: 12,
    marginLeft: 'auto',
    width: 220,
    backgroundColor: colors.light,
    borderRadius: 6,
    padding: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  totalLabel: {
    fontSize: 9,
    color: colors.muted,
  },
  totalValue: {
    fontSize: 9,
    color: colors.primary,
  },
  totalDivider: {
    borderBottom: `1px solid ${colors.border}`,
    marginVertical: 6,
  },
  grandLabel: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: colors.primary,
  },
  grandValue: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: colors.accent,
  },
  // Two column layout
  twoCol: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 4,
  },
  colBox: {
    flex: 1,
    backgroundColor: colors.light,
    borderRadius: 6,
    padding: 12,
  },
  colBoxTitle: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: colors.accent,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  colBoxText: {
    fontSize: 9,
    color: colors.primary,
    lineHeight: 1.6,
  },
  colBoxMuted: {
    fontSize: 8,
    color: colors.muted,
    lineHeight: 1.6,
  },
  // Footer band
  footerBand: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: {
    color: '#ccbbaa',
    fontSize: 8,
    letterSpacing: 0.5,
  },
  footerBrand: {
    color: colors.white,
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 2,
  },
});

export default function ReceiptPDF({ orderData, orderNumber }) {
  const getNumericPrice = (price) => {
    if (typeof price === 'number') return price;
    if (typeof price === 'string') {
      const match = price.match(/[\d.]+/);
      return match ? parseFloat(match[0]) : 0;
    }
    return 0;
  };

  const orderDate = orderData?.orderDate
    ? new Date(orderData.orderDate).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    : new Date().toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });

  const ci = orderData?.customerInfo || {};

  return (
    <Document>
      <Page size="A4" style={styles.page}>

        {/* Header */}
        <View style={styles.headerBand}>
          <Image style={styles.logo} src="/full_logo_bg.png" />
          <View style={styles.headerRight}>
            <Text style={styles.headerTitle}>ORDER RECEIPT</Text>
            <Text style={styles.headerSub}>MUSHK PREMIUM FRAGRANCES</Text>
          </View>
        </View>
        <View style={styles.accentLine} />

        <View style={styles.body}>

          {/* Success */}
          <View style={styles.successRow}>
            <Text style={styles.successText}>✓  Order Confirmed!</Text>
          </View>
          <Text style={{ fontSize: 9, color: '#555', marginBottom: 4 }}>
            Thank you for your order. We've received it and will process it shortly.
          </Text>

          {/* Order Meta */}
          <Text style={styles.sectionTitle}>Order Details</Text>
          <View style={styles.metaGrid}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Order Number</Text>
              <Text style={styles.metaValue}>#{orderNumber}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Order Date</Text>
              <Text style={styles.metaValue}>{orderDate}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Payment Method</Text>
              <Text style={styles.metaValue}>{orderData?.paymentMethod || 'Cash on Delivery'}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Order Status</Text>
              <Text style={[styles.metaValue, { color: colors.green }]}>Confirmed</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Estimated Delivery</Text>
              <Text style={styles.metaValue}>3–5 Business Days</Text>
            </View>
          </View>

          {/* Items Table */}
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.colProduct]}>PRODUCT</Text>
            <Text style={[styles.tableHeaderText, styles.colQty, { textAlign: 'center' }]}>QTY</Text>
            <Text style={[styles.tableHeaderText, styles.colPrice, { textAlign: 'right' }]}>UNIT PRICE</Text>
            <Text style={[styles.tableHeaderText, styles.colTotal, { textAlign: 'right' }]}>TOTAL</Text>
          </View>

          {orderData?.items?.map((item, i) => (
            <View key={i} style={[styles.tableRow, i % 2 === 1 && styles.tableRowAlt]}>
              <View style={styles.colProduct}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemSub}>MUSHK • 100ML</Text>
              </View>
              <Text style={[styles.cellText, styles.colQty, { textAlign: 'center' }]}>{item.quantity}</Text>
              <Text style={[styles.cellText, styles.colPrice, { textAlign: 'right' }]}>
                ${getNumericPrice(item.price).toFixed(2)}
              </Text>
              <Text style={[styles.cellText, styles.colTotal, { textAlign: 'right' }]}>
                ${(getNumericPrice(item.price) * item.quantity).toFixed(2)}
              </Text>
            </View>
          ))}

          {/* Totals */}
          <View style={styles.totalsBox}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>${(orderData?.subtotal || 0).toFixed(2)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Shipping</Text>
              <Text style={styles.totalValue}>
                {orderData?.shipping === 0 ? 'Free' : `$${(orderData?.shipping || 0).toFixed(2)}`}
              </Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tax</Text>
              <Text style={styles.totalValue}>${(orderData?.tax || 0).toFixed(2)}</Text>
            </View>
            <View style={styles.totalDivider} />
            <View style={styles.totalRow}>
              <Text style={styles.grandLabel}>Total</Text>
              <Text style={styles.grandValue}>${(orderData?.total || 0).toFixed(2)} USD</Text>
            </View>
          </View>

          {/* Shipping + Contact */}
          {ci.firstName && (
            <>
              <Text style={styles.sectionTitle}>Shipping Information</Text>
              <View style={styles.twoCol}>
                <View style={styles.colBox}>
                  <Text style={styles.colBoxTitle}>Delivery Address</Text>
                  <Text style={styles.colBoxText}>{ci.firstName} {ci.lastName}</Text>
                  <Text style={styles.colBoxMuted}>{ci.address}</Text>
                  {ci.apartment && <Text style={styles.colBoxMuted}>{ci.apartment}</Text>}
                  <Text style={styles.colBoxMuted}>{ci.city}, {ci.state} {ci.zipCode}</Text>
                  <Text style={styles.colBoxMuted}>{ci.country}</Text>
                </View>
                <View style={styles.colBox}>
                  <Text style={styles.colBoxTitle}>Contact</Text>
                  <Text style={styles.colBoxMuted}>Email: {ci.email}</Text>
                  <Text style={styles.colBoxMuted}>Phone: {ci.phone}</Text>
                  <Text style={[styles.colBoxTitle, { marginTop: 10 }]}>Support</Text>
                  <Text style={styles.colBoxMuted}>info@mushk.com</Text>
                  <Text style={styles.colBoxMuted}>+1 (555) 123-4567</Text>
                </View>
              </View>
            </>
          )}

        </View>

        {/* Footer */}
        <View style={styles.footerBand}>
          <Text style={styles.footerText}>Thank you for choosing Mushk • This is your official order confirmation</Text>
          <Text style={styles.footerBrand}>MUSHK</Text>
        </View>

      </Page>
    </Document>
  );
}
