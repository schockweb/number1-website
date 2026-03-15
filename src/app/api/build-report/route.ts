import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "data", "build-reports.json");

function ensureFile() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, "[]", "utf-8");
}

function readReports() {
  ensureFile();
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
  } catch {
    return [];
  }
}

export async function GET() {
  const reports = readReports();
  return NextResponse.json(reports, {
    headers: { "Access-Control-Allow-Origin": "*" },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const reports = readReports();

    const newReport = {
      id: `report_${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: "pending", // pending | viewed | approved
      ...body,
    };

    reports.unshift(newReport); // newest first
    fs.writeFileSync(DATA_FILE, JSON.stringify(reports, null, 2), "utf-8");

    return NextResponse.json({ success: true, id: newReport.id }, {
      headers: { "Access-Control-Allow-Origin": "*" },
    });
  } catch (err) {
    return NextResponse.json({ error: "Failed to save report" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, status, notes } = await req.json();
    const reports = readReports();
    const idx = reports.findIndex((r: { id: string }) => r.id === id);
    if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
    reports[idx] = { ...reports[idx], status, notes: notes ?? reports[idx].notes };
    fs.writeFileSync(DATA_FILE, JSON.stringify(reports, null, 2), "utf-8");
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
