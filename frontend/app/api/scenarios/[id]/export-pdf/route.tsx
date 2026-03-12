import { NextRequest, NextResponse } from 'next/server';
import { renderToBuffer, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { prisma, withRetry } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    page: {
        fontFamily: 'Helvetica',
        fontSize: 9,
        paddingTop: 32,
        paddingBottom: 32,
        paddingHorizontal: 40,
        backgroundColor: '#ffffff',
        color: '#1a1a1a',
    },
    // Header
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
    portfolioName: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: '#111827' },
    badgeLabel: { fontSize: 7, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 },
    badgeValue: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: '#374151' },
    // Section headers
    sectionTitle: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6, paddingBottom: 3, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
    // Metrics row
    metricsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
    metricBox: { flex: 1, marginRight: 8, padding: 8, backgroundColor: '#f9fafb', borderRadius: 4 },
    metricLabel: { fontSize: 7, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
    metricValue: { fontSize: 14, fontFamily: 'Helvetica-Bold', color: '#111827' },
    metricSub: { fontSize: 7, color: '#6b7280', marginTop: 2 },
    // Two-column layout
    twoCol: { flexDirection: 'row', gap: 16, marginBottom: 16 },
    colLeft: { flex: 1.3 },
    colRight: { flex: 1 },
    // Table
    tableHeader: { flexDirection: 'row', backgroundColor: '#f3f4f6', paddingVertical: 4, paddingHorizontal: 6, marginBottom: 0 },
    tableRow: { flexDirection: 'row', paddingVertical: 4, paddingHorizontal: 6, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
    tableCell: { flex: 1, fontSize: 8, color: '#374151' },
    tableCellBold: { flex: 1, fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#111827' },
    tableHeaderCell: { flex: 1, fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#6b7280', textTransform: 'uppercase' },
    // Decision badges
    decisionFund: { fontSize: 7, color: '#065f46', backgroundColor: '#d1fae5', paddingHorizontal: 4, paddingVertical: 1, borderRadius: 2 },
    decisionPause: { fontSize: 7, color: '#92400e', backgroundColor: '#fef3c7', paddingHorizontal: 4, paddingVertical: 1, borderRadius: 2 },
    decisionStop: { fontSize: 7, color: '#991b1b', backgroundColor: '#fee2e2', paddingHorizontal: 4, paddingVertical: 1, borderRadius: 2 },
    // Risk rows
    riskRow: { flexDirection: 'row', paddingVertical: 3, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
    riskDesc: { flex: 2, fontSize: 8, color: '#374151' },
    riskNum: { flex: 1, fontSize: 8, color: '#374151', textAlign: 'center' },
    riskHigh: { color: '#dc2626' },
    riskMed: { color: '#d97706' },
    riskLow: { color: '#059669' },
    // Footer
    footer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#e5e7eb' },
    footerText: { fontSize: 7, color: '#9ca3af' },
    // Assumption box
    assumptionBox: { backgroundColor: '#fffbeb', borderLeftWidth: 2, borderLeftColor: '#f59e0b', padding: 8, marginBottom: 12 },
    assumptionText: { fontSize: 8, color: '#78350f', lineHeight: 1.4 },
    // Sign-off block
    signOffBlock: { backgroundColor: '#f0fdf4', borderWidth: 1, borderColor: '#bbf7d0', padding: 10, marginTop: 8, borderRadius: 4 },
    signOffTitle: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#14532d', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
    signOffRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
    signOffLabel: { fontSize: 7, color: '#6b7280' },
    signOffValue: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#374151' },
    signOffLine: { borderBottomWidth: 1, borderBottomColor: '#d1d5db', marginTop: 16, marginBottom: 4, width: 120 },
});

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (n: number) => `₹${(n / 10_000_000).toFixed(1)}Cr`;
const fmtPct = (n: number) => `${n.toFixed(0)}%`;
const fmtDate = (d: Date | string) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

// ── GET /api/scenarios/[id]/export-pdf ────────────────────────────────────────
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Auth check
        const authHeader = request.headers.get('authorization');
        const token = authHeader?.replace('Bearer ', '');
        if (!token) {
            return NextResponse.json({ success: false, data: null, errors: [{ code: 'UNAUTHORIZED', message: 'Authentication required' }] }, { status: 401 });
        }
        const decoded = verifyToken(token);
        if (!decoded) {
            return NextResponse.json({ success: false, data: null, errors: [{ code: 'UNAUTHORIZED', message: 'Invalid token' }] }, { status: 401 });
        }

        const { id: scenarioId } = await params;

        // Fetch all data
        const scenario = await withRetry(() => prisma.scenario.findUnique({
            where: { id: scenarioId },
            include: {
                portfolio: true,
                metrics: true,
                decisions: {
                    include: {
                        initiative: {
                            include: {
                                capacityDemands: true,
                                risks: {
                                    where: { status: 'OPEN' },
                                    orderBy: { exposure: 'desc' },
                                    take: 5,
                                },
                            },
                        },
                    },
                    orderBy: { decision: 'asc' },
                },
            },
        }));

        if (!scenario) {
            return NextResponse.json({ success: false, data: null, errors: [{ code: 'NOT_FOUND', message: 'Scenario not found' }] }, { status: 404 });
        }

        if (!scenario.isFinalized) {
            return NextResponse.json({ success: false, data: null, errors: [{ code: 'INVALID_STATE', message: 'PDF export only available for finalized scenarios' }] }, { status: 400 });
        }

        // Compute metrics
        const funded = scenario.decisions.filter(d => d.decision === 'FUND');
        const paused = scenario.decisions.filter(d => d.decision === 'PAUSE');
        const stopped = scenario.decisions.filter(d => d.decision === 'STOP');

        const totalCost = scenario.metrics?.totalCost ?? funded.reduce((s, d) => s + (d.initiative.capexCost || 0) + (d.initiative.opexCost || 0), 0);
        const totalCapex = funded.reduce((s, d) => s + (d.initiative.capexCost || 0), 0);
        const totalOpex = funded.reduce((s, d) => s + (d.initiative.opexCost || 0), 0);
        const totalValue = funded.reduce((s, d) => s + d.initiative.estimatedValue, 0);
        const totalCapacity = funded.reduce((s, d) => s + d.initiative.capacityDemands.reduce((cs, cd) => cs + cd.units, 0), 0);
        const capUtilPct = scenario.portfolio.totalCapacity > 0 ? (totalCapacity / scenario.portfolio.totalCapacity) * 100 : 0;
        const budgetUtilPct = scenario.portfolio.totalBudget > 0 ? (totalCost / scenario.portfolio.totalBudget) * 100 : 0;
        const avgRisk = funded.length > 0 ? funded.reduce((s, d) => s + d.initiative.riskScore, 0) / funded.length : 0;
        const riskLevel = avgRisk <= 2 ? 'Low' : avgRisk <= 3.5 ? 'Medium' : 'High';

        // Top risks across all funded initiatives
        type RiskRow = { initiativeName: string; description: string; exposure: number };
        const topRisks: RiskRow[] = funded
            .flatMap(d => (d.initiative.risks || []).map(r => ({
                initiativeName: d.initiative.name,
                description: r.description,
                exposure: r.exposure,
            })))
            .sort((a, b) => b.exposure - a.exposure)
            .slice(0, 5);

        // Audit ID from governance log
        const auditRecord = await withRetry(() => prisma.governanceDecisionRecord.findFirst({
            where: { entityId: scenarioId, entityType: 'SCENARIO', actionType: 'FINALIZATION' },
            orderBy: { createdAt: 'desc' },
        }));

        const generatedAt = new Date();

        // ── Build PDF Document ─────────────────────────────────────────────────
        const pdfDoc = (
            <Document
                title={`Portfolio Decision — ${scenario.portfolio.name}`}
                author="Decision Integrity Engine"
                subject={scenario.name}
                creator="Decision Integrity Engine v1.0"
            >
                <Page size="A4" orientation="landscape" style={styles.page}>

                    {/* ── HEADER ──────────────────────────────────────── */}
                    <View style={styles.headerRow}>
                        <View>
                            <Text style={{ fontSize: 7, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 3 }}>
                                PORTFOLIO DECISION ARTIFACT  •  CONFIDENTIAL
                            </Text>
                            <Text style={styles.portfolioName}>{scenario.portfolio.name}</Text>
                            <Text style={{ fontSize: 9, color: '#6b7280', marginTop: 2 }}>
                                Scenario: {scenario.name}  •  {scenario.portfolio.fiscalPeriod}
                            </Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                            <Text style={styles.badgeLabel}>Decision Owner</Text>
                            <Text style={styles.badgeValue}>Portfolio Lead</Text>
                            <Text style={{ fontSize: 7, color: '#9ca3af', marginTop: 4 }}>Generated: {fmtDate(generatedAt)}</Text>
                            <Text style={{ fontSize: 7, color: '#9ca3af' }}>ID: {scenarioId.substring(0, 8).toUpperCase()}</Text>
                        </View>
                    </View>

                    {/* ── SCENARIO ASSUMPTIONS ─────────────────────────── */}
                    <View style={styles.assumptionBox}>
                        <Text style={{ fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#92400e', textTransform: 'uppercase', marginBottom: 3 }}>Scenario Assumptions</Text>
                        <Text style={styles.assumptionText}>{scenario.assumptions || 'No assumptions documented.'}</Text>
                    </View>

                    {/* ── TOP METRICS ──────────────────────────────────── */}
                    <View style={styles.metricsRow}>
                        {[
                            { label: 'Investment', value: fmt(totalCost), sub: `CapEx ${fmt(totalCapex)} / OpEx ${fmt(totalOpex)}/yr` },
                            { label: 'Expected Value', value: fmt(totalValue), sub: `${funded.length} initiatives funded` },
                            { label: 'Budget Utilization', value: fmtPct(budgetUtilPct), sub: `of ${fmt(scenario.portfolio.totalBudget)}` },
                            { label: 'Capacity Use', value: fmtPct(capUtilPct), sub: `${totalCapacity} / ${scenario.portfolio.totalCapacity} units` },
                            { label: 'Risk Level', value: riskLevel, sub: `Avg score ${avgRisk.toFixed(1)}/5` },
                            { label: 'Decisions', value: `${funded.length}F / ${paused.length}P / ${stopped.length}S`, sub: 'Fund / Pause / Stop' },
                        ].map((m, i) => (
                            <View key={i} style={[styles.metricBox, i === 5 ? { marginRight: 0 } : {}]}>
                                <Text style={styles.metricLabel}>{m.label}</Text>
                                <Text style={styles.metricValue}>{m.value}</Text>
                                <Text style={styles.metricSub}>{m.sub}</Text>
                            </View>
                        ))}
                    </View>

                    {/* ── TWO COLUMN BODY ──────────────────────────────── */}
                    <View style={styles.twoCol}>

                        {/* LEFT: Initiative Decisions */}
                        <View style={styles.colLeft}>
                            <Text style={styles.sectionTitle}>Initiative Decisions</Text>
                            <View style={styles.tableHeader}>
                                <Text style={[styles.tableHeaderCell, { flex: 2.5 }]}>Initiative</Text>
                                <Text style={[styles.tableHeaderCell, { textAlign: 'center' }]}>Decision</Text>
                                <Text style={[styles.tableHeaderCell, { textAlign: 'right' }]}>Value</Text>
                                <Text style={[styles.tableHeaderCell, { textAlign: 'right' }]}>Cost</Text>
                                <Text style={[styles.tableHeaderCell, { textAlign: 'center' }]}>Risk</Text>
                            </View>
                            {scenario.decisions.map((d, i) => (
                                <View key={i} style={styles.tableRow}>
                                    <Text style={[styles.tableCellBold, { flex: 2.5 }]}>{d.initiative.name.substring(0, 40)}</Text>
                                    <View style={{ flex: 1, alignItems: 'center' }}>
                                        <Text style={
                                            d.decision === 'FUND' ? styles.decisionFund :
                                            d.decision === 'PAUSE' ? styles.decisionPause :
                                            styles.decisionStop
                                        }>{d.decision}</Text>
                                    </View>
                                    <Text style={[styles.tableCell, { textAlign: 'right' }]}>{fmt(d.initiative.estimatedValue)}</Text>
                                    <Text style={[styles.tableCell, { textAlign: 'right' }]}>{fmt((d.initiative.capexCost || 0) + (d.initiative.opexCost || 0))}</Text>
                                    <Text style={[styles.tableCell, { textAlign: 'center' }]}>{d.initiative.riskScore}/5</Text>
                                </View>
                            ))}
                        </View>

                        {/* RIGHT: Top Risks + Sign-off */}
                        <View style={styles.colRight}>
                            <Text style={styles.sectionTitle}>Top Open Risks</Text>
                            {topRisks.length === 0 ? (
                                <Text style={{ fontSize: 8, color: '#9ca3af', marginBottom: 12 }}>No open risks registered.</Text>
                            ) : (
                                <>
                                    <View style={styles.tableHeader}>
                                        <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Risk</Text>
                                        <Text style={[styles.tableHeaderCell, { textAlign: 'center' }]}>Exposure</Text>
                                    </View>
                                    {topRisks.map((r, i) => {
                                        const expPct = r.exposure * 100;
                                        const color = expPct >= 60 ? styles.riskHigh : expPct >= 30 ? styles.riskMed : styles.riskLow;
                                        return (
                                            <View key={i} style={styles.riskRow}>
                                                <View style={[styles.riskDesc, { flex: 2 }]}>
                                                    <Text style={{ fontSize: 7, color: '#9ca3af' }}>{r.initiativeName}</Text>
                                                    <Text>{r.description}</Text>
                                                </View>
                                                <Text style={[styles.riskNum, color]}>{fmtPct(expPct)}</Text>
                                            </View>
                                        );
                                    })}
                                </>
                            )}

                            {/* Governance Sign-Off Block */}
                            <View style={styles.signOffBlock}>
                                <Text style={styles.signOffTitle}>Governance Sign-Off</Text>
                                <View style={styles.signOffRow}>
                                    <Text style={styles.signOffLabel}>Finalization Status</Text>
                                    <Text style={[styles.signOffValue, { color: '#059669' }]}>✓ FINALIZED</Text>
                                </View>
                                <View style={styles.signOffRow}>
                                    <Text style={styles.signOffLabel}>Finalized At</Text>
                                    <Text style={styles.signOffValue}>{auditRecord ? fmtDate(auditRecord.createdAt) : fmtDate(generatedAt)}</Text>
                                </View>
                                <View style={styles.signOffRow}>
                                    <Text style={styles.signOffLabel}>Audit ID</Text>
                                    <Text style={styles.signOffValue}>{auditRecord?.id?.substring(0, 8).toUpperCase() ?? 'N/A'}</Text>
                                </View>
                                <View style={styles.signOffRow}>
                                    <Text style={styles.signOffLabel}>Portfolio Lead</Text>
                                    <View>
                                        <View style={styles.signOffLine} />
                                        <Text style={styles.signOffLabel}>Signature</Text>
                                    </View>
                                </View>
                                <View style={[styles.signOffRow, { marginTop: 8 }]}>
                                    <Text style={styles.signOffLabel}>Executive Sponsor</Text>
                                    <View>
                                        <View style={styles.signOffLine} />
                                        <Text style={styles.signOffLabel}>Signature</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* ── FOOTER ───────────────────────────────────────── */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>CONFIDENTIAL • INTERNAL USE ONLY • {scenario.portfolio.name} • {scenario.portfolio.fiscalPeriod}</Text>
                        <Text style={styles.footerText}>Generated by Decision Integrity Engine • {fmtDate(generatedAt)}</Text>
                        <Text style={styles.footerText}>Scenario ID: {scenarioId.substring(0, 8).toUpperCase()}</Text>
                    </View>

                </Page>
            </Document>
        );

        // Render to buffer
        const pdfBuffer = await renderToBuffer(pdfDoc);

        const safeScenarioName = scenario.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const filename = `portfolio_decision_${safeScenarioName}_${new Date().toISOString().split('T')[0]}.pdf`;

        return new NextResponse(new Uint8Array(pdfBuffer), {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${filename}"`,
                'Cache-Control': 'no-store',
            },
        });

    } catch (error) {
        console.error('Error generating PDF:', error);
        return NextResponse.json(
            {
                success: false,
                data: null,
                errors: [{ code: 'INTERNAL_ERROR', message: 'Failed to generate PDF' }],
            },
            { status: 500 }
        );
    }
}
