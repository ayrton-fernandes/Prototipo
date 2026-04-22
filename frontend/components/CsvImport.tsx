"use client"

import React, { useRef, useState } from "react";
import { Button, Icon, Typography } from "@uigovpe/components";
import { showToast } from "@/store/slices/toastSlice";
import { useAppDispatch } from "@/store/store";
import { targetService } from "@/services/targetService";

type Props = {
  operationId: string;
  /** endpoint override */
  uploadUrl?: string;
  initialType?: "targets" | "prontuarios";
  allowTypeSelection?: boolean;
  maxPreviewRows?: number;
};

function parseCSV(text: string) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim() !== "");
  if (lines.length === 0) return { headers: [], rows: [] };
  const splitter = /,(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/;
  const headers = lines[0].split(splitter).map((h) => h.replace(/^"|"$/g, "").trim());
  const rows = lines.slice(1).map((line) => line.split(splitter).map((c) => c.replace(/^"|"$/g, "").trim()));
  return { headers, rows };
}

export default function CsvImport({ operationId, uploadUrl, initialType = "targets", allowTypeSelection = true, maxPreviewRows = 6 }: Props) {
  const dispatch = useAppDispatch();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<typeof initialType>(initialType);

  const effectiveUrl = uploadUrl || (type === "targets"
    ? `/api/operation/${operationId}/target/import`
    : `/api/operation/${operationId}/target/records/import`);

  const handleChoose = () => fileRef.current?.click();

  const onFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    setFileName(f?.name ?? "");
    if (!f) {
      setHeaders([]); setRows([]);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || "");
      const parsed = parseCSV(text);
      setHeaders(parsed.headers);
      setRows(parsed.rows.slice(0, maxPreviewRows));
    };
    reader.onerror = () => dispatch(showToast({ severity: "error", summary: "Erro", detail: "Não foi possível ler o arquivo." }));
    reader.readAsText(f, "utf-8");
  };

  const clear = () => {
    setFile(null); setFileName(""); setHeaders([]); setRows([]);
    if (fileRef.current) fileRef.current.value = "";
  };

  const upload = async () => {
    if (!file) return;
    setLoading(true);
    try {
      let res: Response | undefined;
      const form = new FormData();
      form.append("file", file);
      // Prefer using the service layer so axios + runtime baseURL + auth are applied.
      if (uploadUrl) {
        // fallback: if caller provided an explicit uploadUrl, use it (build absolute if runtime env present)
        const runtimeBase = (typeof window !== "undefined" && (window as any).__ENV?.NEXT_PUBLIC_API_URL) || process.env.NEXT_PUBLIC_API_URL || "";
        let requestUrl = uploadUrl;
        if (runtimeBase) {
          const base = String(runtimeBase).replace(/\/$/, "");
          requestUrl = base + uploadUrl.replace(/^\/api/, "");
        }
        const res = await fetch(requestUrl, { method: "POST", body: form });
        if (!res.ok) throw new Error(await res.text() || `Status ${res.status}`);
      } else {
        const opId = Number(operationId);
        if (type === "targets") {
          await targetService.importTargets(opId, file);
        } else {
          await targetService.importRecords(opId, file);
        }
      }
      if (res && !res.ok) throw new Error(await res.text() || `Status ${res.status}`);
      dispatch(showToast({ severity: "success", summary: "Upload", detail: "Arquivo enviado com sucesso." }));
      clear();
    } catch (err: any) {
      console.error(err);
      dispatch(showToast({ severity: "error", summary: "Erro no upload", detail: err?.message || String(err) }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 bg-black text-white p-4 rounded">
      <input ref={fileRef} type="file" accept=".csv,text/csv" onChange={onFileChange} className="hidden" />

      <div className="flex items-center gap-3">
        <Button label={fileName || "Selecionar CSV"} icon={<Icon icon="upload_file" />} onClick={handleChoose} className="bg-yellow-400 text-black hover:bg-yellow-300" />
        <Button label="Limpar" outlined onClick={clear} disabled={!file} className="!border-yellow-300 !text-yellow-300" />
        <Button label="Enviar" onClick={upload} loading={loading} disabled={!file} className="bg-yellow-400 text-black hover:bg-yellow-300" />
        {allowTypeSelection && (
          <div className="ml-auto flex items-center gap-2">
            <label className="text-sm text-slate-500">Tipo:</label>
            <select value={type} onChange={e => setType(e.target.value as any)} className="rounded border px-2 py-1">
              <option value="targets">Alvos</option>
              <option value="prontuarios">Prontuários</option>
            </select>
          </div>
        )}
      </div>

      {headers.length > 0 && (
        <div className="overflow-auto border rounded border-gray-700">
          <table className="min-w-full text-left">
            <thead className="bg-gray-800">
              <tr>
                {headers.map((h, i) => <th key={i} className="px-2 py-1 text-sm font-medium text-white">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, ri) => (
                <tr key={ri} className={ri % 2 === 0 ? "bg-gray-900" : "bg-black"}>
                  {r.map((c, ci) => <td key={ci} className="px-2 py-1 text-sm text-white">{c}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
          <Typography variant="small" className="text-slate-400 p-2">Mostrando até {maxPreviewRows - 1} linhas</Typography>
        </div>
      )}
    </div>
  );
}

