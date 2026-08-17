import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { TurnoverDiscovery } from "@/components/TurnoverDiscovery";
import { trpc } from "@/lib/trpc";
import { AlertTriangle, ArrowLeft, CheckCircle2, ClipboardCheck, Home, ImagePlus, Plus, ShieldCheck, Wrench } from "lucide-react";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Link } from "wouter";

const toEpoch = (value: string) => (value ? new Date(value).getTime() : undefined);

function Metric({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return <article className="rounded-2xl border border-white/10 bg-[#0d1a14] p-4"><div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[.12em] text-[#91a79b]"><span className="text-[#c9ff4a]">{icon}</span>{label}</div><p className="mt-3 text-2xl font-semibold">{value}</p></article>;
}

function Card({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return <section className="rounded-2xl border border-white/10 bg-[#0d1a14] p-4"><div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[.12em] text-[#c9ff4a]">{icon}{title}</div><div className="mt-3">{children}</div></section>;
}

export default function Turnover() {
  const { isAuthenticated, loading } = useAuth();
  const utils = trpc.useUtils();
  const dashboard = trpc.turnover.dashboard.useQuery(undefined, { enabled: isAuthenticated });
  const [unit, setUnit] = useState({ name: "", zone: "", unitType: "" });
  const [opening, setOpening] = useState({ unitId: "", checkoutAt: "", checkinAt: "" });
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [checkLabel, setCheckLabel] = useState("");
  const [evidence, setEvidence] = useState({ description: "", fileUrl: "" });
  const [incident, setIncident] = useState({ description: "", severity: "medium" as "low" | "medium" | "high" });
  const [releaseText, setReleaseText] = useState("");
  const refresh = () => void utils.turnover.dashboard.invalidate();
  const errorOptions = { onError: (error: { message: string }) => { toast.error(error.message); } };
  const createUnit = trpc.turnover.createUnit.useMutation({ ...errorOptions, onSuccess: () => { setUnit({ name: "", zone: "", unitType: "" }); refresh(); } });
  const createTurnover = trpc.turnover.createTurnover.useMutation({ ...errorOptions, onSuccess: () => { setOpening({ unitId: "", checkoutAt: "", checkinAt: "" }); refresh(); } });
  const addChecklist = trpc.turnover.addChecklistItem.useMutation({ ...errorOptions, onSuccess: () => { setCheckLabel(""); refresh(); } });
  const updateChecklist = trpc.turnover.updateChecklistItem.useMutation({ ...errorOptions, onSuccess: refresh });
  const addEvidence = trpc.turnover.addEvidence.useMutation({ ...errorOptions, onSuccess: () => { setEvidence({ description: "", fileUrl: "" }); refresh(); } });
  const addIncident = trpc.turnover.addIncident.useMutation({ ...errorOptions, onSuccess: () => { setIncident({ description: "", severity: "medium" }); refresh(); } });
  const resolveIncident = trpc.turnover.resolveIncident.useMutation({ ...errorOptions, onSuccess: refresh });
  const release = trpc.turnover.releaseManually.useMutation({ ...errorOptions, onSuccess: () => { setReleaseText(""); toast.success("Unidad liberada mediante revisión humana"); refresh(); } });

  const units = dashboard.data?.units ?? [];
  const turnovers = dashboard.data?.turnovers ?? [];
  const active = turnovers.filter(row => row.status !== "released" && row.status !== "cancelled");
  const selected = turnovers.find(row => row.id === selectedId) ?? active[0];
  const checklist = (dashboard.data?.checklist ?? []).filter(row => row.turnoverId === selected?.id);
  const evidenceRows = (dashboard.data?.evidence ?? []).filter(row => row.turnoverId === selected?.id);
  const incidents = (dashboard.data?.incidents ?? []).filter(row => row.turnoverId === selected?.id);
  const openIncidents = (dashboard.data?.incidents ?? []).filter(row => row.status === "open").length;

  if (loading) return <main className="grid min-h-screen place-items-center bg-[#07120c] text-[#c9ff4a]">Inicializando TurnoverOps…</main>;
  if (!isAuthenticated) return <main className="grid min-h-screen place-items-center bg-[#07120c] p-6 text-[#f1f4ed]"><Card title="Evox TurnoverOps" icon={<ClipboardCheck size={18} />}><p className="max-w-sm text-sm leading-6 text-[#a8b8af]">Checklist, incidencias, evidencias y liberación humana entre ocupaciones.</p><button onClick={() => startLogin()} className="mt-5 rounded-lg bg-[#c9ff4a] px-4 py-2 text-sm font-bold text-[#0a130c]">Entrar</button></Card></main>;

  return <main className="min-h-screen bg-[#07120c] text-[#f1f4ed]">
    <header className="flex items-center justify-between border-b border-white/10 px-5 py-4">
      <div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#c9ff4a] text-[#07120c]"><ClipboardCheck size={18} /></span><div><h1 className="font-semibold">Evox TurnoverOps</h1><p className="font-mono text-[10px] uppercase tracking-[.14em] text-[#91a79b]">Mérida · entre ocupaciones</p></div></div>
      <Link href="/" className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-[#c7d3cc]"><ArrowLeft size={14} />PropertyOps</Link>
    </header>
    <div className="mx-auto grid max-w-7xl gap-5 p-5 lg:grid-cols-[300px_1fr]">
      <aside className="space-y-5">
        <Card title="Registrar unidad" icon={<Home size={15} />}><div className="space-y-2">
          <input value={unit.name} onChange={event => setUnit({ ...unit, name: event.target.value })} placeholder="Nombre operativo" className="field" />
          <input value={unit.zone} onChange={event => setUnit({ ...unit, zone: event.target.value })} placeholder="Zona o colonia" className="field" />
          <input value={unit.unitType} onChange={event => setUnit({ ...unit, unitType: event.target.value })} placeholder="Tipo de unidad" className="field" />
          <button disabled={!unit.name || !unit.zone || !unit.unitType || createUnit.isPending} onClick={() => createUnit.mutate(unit)} className="primary"><Plus size={15} />Añadir unidad</button>
        </div></Card>
        <Card title="Abrir operativo" icon={<Wrench size={15} />}><div className="space-y-2">
          <select value={opening.unitId} onChange={event => setOpening({ ...opening, unitId: event.target.value })} className="field"><option value="">Selecciona unidad</option>{units.map(row => <option key={row.id} value={row.id}>{row.name}</option>)}</select>
          <input type="datetime-local" value={opening.checkoutAt} onChange={event => setOpening({ ...opening, checkoutAt: event.target.value })} className="field" />
          <input type="datetime-local" value={opening.checkinAt} onChange={event => setOpening({ ...opening, checkinAt: event.target.value })} className="field" />
          <button disabled={!opening.unitId || createTurnover.isPending} onClick={() => createTurnover.mutate({ unitId: Number(opening.unitId), checkoutAt: toEpoch(opening.checkoutAt), checkinAt: toEpoch(opening.checkinAt) })} className="secondary"><Plus size={15} />Abrir cambio</button>
        </div></Card>
      </aside>
      <section className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-3"><Metric icon={<Home size={16} />} label="Unidades" value={String(units.length)} /><Metric icon={<Wrench size={16} />} label="Cambios activos" value={String(active.length)} /><Metric icon={<AlertTriangle size={16} />} label="Incidencias abiertas" value={String(openIncidents)} /></div>
        <TurnoverDiscovery candidates={dashboard.data?.candidates ?? []} />
        <Card title="Cambios de ocupación" icon={<ClipboardCheck size={15} />}><p className="mb-3 text-xs text-[#91a79b]">Selecciona un cambio para revisar el checklist y liberar manualmente la unidad.</p><div className="flex gap-2 overflow-x-auto pb-1">{turnovers.map(row => <button key={row.id} onClick={() => setSelectedId(row.id)} className={`min-w-40 rounded-xl border p-3 text-left ${selected?.id === row.id ? "border-[#c9ff4a] bg-[#c9ff4a]/5" : "border-white/10"}`}><span className="text-[10px] uppercase tracking-wider text-[#c9ff4a]">{row.status}</span><p className="mt-2 text-sm font-semibold">Unidad #{row.unitId}</p><p className="text-[11px] text-[#91a79b]">Operativo #{row.id}</p></button>)}{!turnovers.length && <p className="py-4 text-sm text-[#91a79b]">Registra una unidad y abre el primer cambio operativo.</p>}</div></Card>
        {selected && <div className="grid gap-5 xl:grid-cols-2">
          <Card title="Checklist de liberación" icon={<CheckCircle2 size={15} />}><div className="space-y-2">{checklist.map(row => <div key={row.id} className="flex items-center justify-between gap-3 rounded-lg border border-white/10 px-3 py-2"><span className={row.status === "pending" ? "text-sm" : "text-sm text-[#91a79b] line-through"}>{row.label}</span><select value={row.status} onChange={event => updateChecklist.mutate({ itemId: row.id, status: event.target.value as "pending" | "done" | "skipped" })} className="rounded bg-black/30 px-2 py-1 text-[11px]"><option value="pending">Pendiente</option><option value="done">Hecho</option><option value="skipped">Omitido</option></select></div>)}<div className="flex gap-2"><input value={checkLabel} onChange={event => setCheckLabel(event.target.value)} placeholder="Ej. Revisar blancos" className="field flex-1" /><button disabled={!checkLabel} onClick={() => addChecklist.mutate({ turnoverId: selected.id, label: checkLabel })} className="icon-button"><Plus size={16} /></button></div></div></Card>
          <Card title="Incidencias" icon={<AlertTriangle size={15} />}><div className="space-y-2">{incidents.map(row => <div key={row.id} className="rounded-lg border border-white/10 p-3"><p className="text-sm">{row.description}</p><div className="mt-2 flex items-center justify-between text-[10px] uppercase tracking-wider text-[#91a79b]"><span>{row.severity} · {row.status}</span>{row.status === "open" && <button onClick={() => resolveIncident.mutate({ incidentId: row.id })} className="text-[#c9ff4a]">Resolver</button>}</div></div>)}<input value={incident.description} onChange={event => setIncident({ ...incident, description: event.target.value })} placeholder="Describe una incidencia" className="field" /><div className="flex gap-2"><select value={incident.severity} onChange={event => setIncident({ ...incident, severity: event.target.value as "low" | "medium" | "high" })} className="field flex-1"><option value="low">Baja</option><option value="medium">Media</option><option value="high">Alta</option></select><button disabled={!incident.description} onClick={() => addIncident.mutate({ turnoverId: selected.id, ...incident })} className="secondary">Registrar</button></div></div></Card>
          <Card title="Evidencias" icon={<ImagePlus size={15} />}><div className="space-y-2">{evidenceRows.map(row => <a key={row.id} href={row.fileUrl || undefined} target="_blank" rel="noreferrer" className="block rounded-lg border border-white/10 p-3 text-sm">{row.description}<span className="mt-1 block text-[10px] text-[#91a79b]">{row.fileUrl ? "Abrir URL" : "Nota sin archivo"}</span></a>)}<input value={evidence.description} onChange={event => setEvidence({ ...evidence, description: event.target.value })} placeholder="Descripción" className="field" /><input value={evidence.fileUrl} onChange={event => setEvidence({ ...evidence, fileUrl: event.target.value })} placeholder="URL opcional" className="field" /><button disabled={!evidence.description} onClick={() => addEvidence.mutate({ turnoverId: selected.id, description: evidence.description, fileUrl: evidence.fileUrl || undefined })} className="secondary">Añadir evidencia</button></div></Card>
          <Card title="Liberación humana" icon={<ShieldCheck size={15} />}><p className="text-xs leading-5 text-[#a8b8af]">Solo se libera sin pendientes en el checklist y sin incidencias abiertas. La decisión no es automática.</p><input value={releaseText} onChange={event => setReleaseText(event.target.value)} placeholder="Escribe LIBERAR" className="field mt-3" /><button disabled={selected.status === "released" || release.isPending} onClick={() => release.mutate({ turnoverId: selected.id, confirmation: releaseText })} className="primary mt-2">Liberar tras revisión humana</button></Card>
        </div>}
      </section>
    </div>
  </main>;
}
