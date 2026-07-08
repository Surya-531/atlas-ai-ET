import { v4 as uuid } from "uuid";
import type { Asset, Incident, MaintenanceRecord, ComplianceItem } from "./types";
import { saveAssets, saveIncidents, saveMaintenance, saveCompliance, resetAll } from "./store";
import { ingestRawText } from "./agents/coordinator";

const ASSETS: Asset[] = [
  {
    id: uuid(),
    name: "Compressor C-102",
    code: "C-102",
    type: "Compressor",
    department: "Utilities",
    location: "Plant B - Bay 3",
    installedOn: "2018-03-11",
    manufacturer: "Atlas Copco",
    status: "critical",
    riskScore: 82,
    remainingUsefulLifeDays: 17,
    vibrationTrendPct: 23,
    temperatureTrendPct: 14,
    lastMaintenanceOn: "2026-04-02",
  },
  {
    id: uuid(),
    name: "Pump P-203",
    code: "P-203",
    type: "Pump",
    department: "Process",
    location: "Plant A - Line 2",
    installedOn: "2019-07-22",
    manufacturer: "KSB",
    status: "warning",
    riskScore: 58,
    remainingUsefulLifeDays: 34,
    vibrationTrendPct: 12,
    temperatureTrendPct: 6,
    lastMaintenanceOn: "2026-05-10",
  },
  {
    id: uuid(),
    name: "Motor M-110",
    code: "M-110",
    type: "Motor",
    department: "Process",
    location: "Plant A - Line 1",
    installedOn: "2020-01-15",
    manufacturer: "Siemens",
    status: "healthy",
    riskScore: 21,
    remainingUsefulLifeDays: 210,
    vibrationTrendPct: 2,
    temperatureTrendPct: 1,
    lastMaintenanceOn: "2026-06-01",
  },
  {
    id: uuid(),
    name: "Valve V-204",
    code: "V-204",
    type: "Valve",
    department: "Process",
    location: "Plant A - Line 2",
    installedOn: "2017-11-02",
    manufacturer: "Emerson",
    status: "warning",
    riskScore: 46,
    remainingUsefulLifeDays: 48,
    vibrationTrendPct: 5,
    temperatureTrendPct: 18,
    lastMaintenanceOn: "2026-03-20",
  },
  {
    id: uuid(),
    name: "Boiler B-301",
    code: "B-301",
    type: "Boiler",
    department: "Utilities",
    location: "Plant B - Bay 1",
    installedOn: "2015-05-30",
    manufacturer: "Thermax",
    status: "healthy",
    riskScore: 15,
    remainingUsefulLifeDays: 260,
    vibrationTrendPct: 0,
    temperatureTrendPct: 3,
    lastMaintenanceOn: "2026-06-15",
  },
  {
    id: uuid(),
    name: "Conveyor CV-08",
    code: "CV-08",
    type: "Conveyor",
    department: "Packaging",
    location: "Plant C - Line 4",
    installedOn: "2021-09-09",
    manufacturer: "FlexLink",
    status: "healthy",
    riskScore: 9,
    remainingUsefulLifeDays: 300,
    vibrationTrendPct: -1,
    temperatureTrendPct: 0,
    lastMaintenanceOn: "2026-06-20",
  },
];

const MAINTENANCE: MaintenanceRecord[] = [
  { id: uuid(), assetCode: "C-102", date: "2025-09-14", type: "scheduled", description: "Bearing lubrication and vibration check", technician: "R. Menon" },
  { id: uuid(), assetCode: "C-102", date: "2025-12-10", type: "skipped", description: "Quarterly bearing inspection skipped due to production deadline", technician: "R. Menon" },
  { id: uuid(), assetCode: "C-102", date: "2026-03-01", type: "skipped", description: "Vibration re-check skipped, unit kept running", technician: "S. Iyer" },
  { id: uuid(), assetCode: "C-102", date: "2026-04-02", type: "unscheduled", description: "Emergency inspection after abnormal noise reported by operator", technician: "S. Iyer" },
  { id: uuid(), assetCode: "P-203", date: "2026-01-18", type: "scheduled", description: "Seal replacement per OEM interval", technician: "A. Fernandes" },
  { id: uuid(), assetCode: "P-203", date: "2026-05-10", type: "inspection", description: "Routine vibration and alignment inspection", technician: "A. Fernandes" },
  { id: uuid(), assetCode: "M-110", date: "2026-06-01", type: "scheduled", description: "Winding insulation test, passed", technician: "K. Rao" },
  { id: uuid(), assetCode: "V-204", date: "2026-03-20", type: "scheduled", description: "Valve seat inspection, minor wear noted", technician: "A. Fernandes" },
  { id: uuid(), assetCode: "B-301", date: "2026-06-15", type: "scheduled", description: "Annual pressure vessel certification renewal", technician: "K. Rao" },
];

const INCIDENTS: Incident[] = [
  {
    id: uuid(),
    assetCode: "C-102",
    title: "Compressor C-102 overheating and abnormal vibration",
    description:
      "Operator reported unusual noise and elevated casing temperature on Compressor C-102 during the night shift. Unit was taken offline as a precaution.",
    date: "2026-04-02",
    severity: "high",
    status: "investigating",
  },
  {
    id: uuid(),
    assetCode: "C-102",
    title: "Compressor C-102 bearing failure (Plant B, 2022)",
    description:
      "Historical incident: bearing seizure traced to lubrication breakdown after two consecutive skipped maintenance cycles.",
    date: "2022-11-08",
    severity: "critical",
    status: "resolved",
  },
  {
    id: uuid(),
    assetCode: "V-204",
    title: "Valve V-204 minor leak at flange",
    description: "Small leak detected during routine walk-down, contained and scheduled for repair.",
    date: "2026-05-02",
    severity: "low",
    status: "resolved",
  },
];

const COMPLIANCE: ComplianceItem[] = [
  { id: uuid(), regulation: "Factory Act 1948 - Sec 28 (pressure plant)", requirement: "Annual pressure vessel certification", assetCode: "B-301", status: "compliant", dueDate: "2027-06-15" },
  { id: uuid(), regulation: "ISO 55000 Asset Management", requirement: "Documented maintenance strategy per asset class", status: "compliant", dueDate: "2026-12-01" },
  { id: uuid(), regulation: "OSHA 1910.147 Lockout/Tagout", requirement: "LOTO procedure review for rotating equipment", assetCode: "C-102", status: "expiring", dueDate: "2026-07-20" },
  { id: uuid(), regulation: "OISD-STD-137 Compressor Safety", requirement: "Vibration monitoring log retention", assetCode: "C-102", status: "missing", dueDate: "2026-07-01" },
  { id: uuid(), regulation: "Factory Act 1948 - Sec 87 (safety officer)", requirement: "Quarterly safety officer inspection report", assetCode: "P-203", status: "expired", dueDate: "2026-06-01" },
];

const DOCUMENTS: { title: string; type: "oem_manual" | "inspection_report" | "incident_report" | "maintenance_log" | "regulation"; text: string }[] = [
  {
    title: "Atlas Copco Compressor C-102 — OEM Maintenance Manual (Excerpt)",
    type: "oem_manual",
    text: `Section 4.2 — Bearing Maintenance for Compressor C-102 class units.
Bearing temperature should not exceed baseline by more than 15% under normal load. Vibration
readings exceeding 20% above commissioning baseline indicate probable bearing wear and require
immediate inspection within 72 hours. If vibration trend exceeds 20% AND temperature trend
exceeds 10% simultaneously, the manufacturer recommends scheduling bearing replacement within
30 days to avoid unplanned failure. Recommended lubrication interval: every 90 days. Do not defer
lubrication cycles more than once consecutively. Replacement bearings (part FAG-6312) should be
kept in plant inventory for compressors of this class. Technician: ensure alignment check after
any bearing replacement.`,
  },
  {
    title: "Compressor C-102 — Inspection Report, April 2026",
    type: "inspection_report",
    text: `Inspection date: 2026-04-02. Asset: Compressor C-102, Utilities department, Plant B Bay 3.
Inspector: S. Iyer. Findings: vibration reading 23% above commissioning baseline, casing
temperature 14% above baseline. Abnormal noise reported by operator during night shift prior to
inspection. Two prior maintenance cycles (2025-12-10, 2026-03-01) were skipped due to production
scheduling pressure. Recommendation: escalate to maintenance engineering for bearing inspection
per OEM manual Section 4.2. Cross-reference: similar failure pattern recorded in Plant B 2022
incident log.`,
  },
  {
    title: "Compressor C-102 — Incident Report (2022 Bearing Failure)",
    type: "incident_report",
    text: `Incident date: 2022-11-08. Asset: Compressor C-102. Severity: critical. Summary: bearing
seizure occurred after lubrication breakdown following two consecutive skipped quarterly
maintenance cycles. Root cause determined to be inadequate lubrication combined with elevated
ambient temperature in Plant B Bay 3 during monsoon season. Corrective action taken: bearing
replaced (part FAG-6312), lubrication schedule enforced via digital checklist. Preventive action:
recommended vibration monitoring sensor installation, which was not completed due to budget
constraints at the time.`,
  },
  {
    title: "Compressor C-102 — Maintenance Log Summary",
    type: "maintenance_log",
    text: `Maintenance history for Compressor C-102. 2025-09-14: scheduled bearing lubrication and
vibration check performed by R. Menon, all readings within tolerance. 2025-12-10: quarterly
bearing inspection SKIPPED due to production deadline. 2026-03-01: vibration re-check SKIPPED,
unit kept running under production pressure. 2026-04-02: emergency inspection after abnormal
noise reported by operator, technician S. Iyer. Two consecutive skipped cycles mirror the pattern
that preceded the 2022 bearing failure incident.`,
  },
  {
    title: "OISD-STD-137 — Compressor Safety Requirements (Summary)",
    type: "regulation",
    text: `OISD-STD-137 requires continuous vibration monitoring logs for reciprocating and
centrifugal compressors above 100kW, with logs retained for a minimum of 3 years and made
available on request during statutory inspection. Facilities must maintain a documented
lubrication schedule and evidence of adherence. Factory Act 1948 Sec 28 additionally requires
annual certification of associated pressure plant components. OSHA 1910.147 requires a
documented lockout/tagout procedure for maintenance performed on rotating equipment such as
compressors, reviewed at minimum annually.`,
  },
  {
    title: "Pump P-203 — OEM Manual Excerpt (KSB)",
    type: "oem_manual",
    text: `Pump P-203 seal replacement interval: every 18 months or 12,000 operating hours,
whichever comes first. Vibration baseline for this pump class is 2.1 mm/s RMS; readings above
2.6 mm/s RMS warrant inspection within one week. Alignment should be re-verified after any seal
or coupling work.`,
  },
  {
    title: "Valve V-204 — Inspection Report, March 2026",
    type: "inspection_report",
    text: `Inspection date: 2026-03-20. Asset: Valve V-204, Process department, Plant A Line 2.
Inspector: A. Fernandes. Findings: minor wear on valve seat, temperature trend 18% above
baseline suggesting possible partial blockage downstream. No immediate leak observed.
Recommendation: monitor temperature trend weekly and re-inspect in 45 days.`,
  },
];

export async function seedDatabase() {
  resetAll();
  saveAssets(ASSETS);
  saveMaintenance(MAINTENANCE);
  saveIncidents(INCIDENTS);
  saveCompliance(COMPLIANCE);

  for (const doc of DOCUMENTS) {
    await ingestRawText(doc.title, doc.type, doc.text);
  }
}
