import { MapView } from "@/components/Map";
import { trpc } from "@/lib/trpc";
import { ExternalLink, MapPinned, Search, ShieldCheck } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

type SavedCandidate = { id: number; name: string; address: string | null; mapsUrl: string | null; websiteUrl: string | null; category: string | null; status: "discovered" | "reviewed" | "dismissed" };
type PlaceReference = { externalId: string; name: string; address?: string; mapsUrl?: string; websiteUrl?: string; category?: string; latitude?: string; longitude?: string };

export function TurnoverDiscovery({ candidates }: { candidates: SavedCandidate[] }) {
  const utils = trpc.useUtils();
  const mapRef = useRef<google.maps.Map | null>(null);
  const [query, setQuery] = useState("alojamiento Mérida Yucatán");
  const [ready, setReady] = useState(false);
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<PlaceReference[]>([]);
  const refresh = () => void utils.turnover.dashboard.invalidate();
  const saveCandidate = trpc.turnover.saveDiscoveryCandidate.useMutation({ onSuccess: () => { toast.success("Referencia guardada para revisión humana"); refresh(); }, onError: error => toast.error(error.message) });
  const reviewCandidate = trpc.turnover.reviewDiscoveryCandidate.useMutation({ onSuccess: refresh, onError: error => toast.error(error.message) });

  const searchPublicReferences = async () => {
    if (!ready || !window.google?.maps?.places) return toast.error("El mapa aún está cargando");
    setSearching(true);
    try {
      const Place = (window.google.maps.places as unknown as { Place: { searchByText: (args: unknown) => Promise<{ places: Array<Record<string, unknown>> }> } }).Place;
      const response = await Place.searchByText({ textQuery: query, maxResultCount: 6, locationBias: { center: { lat: 20.96737, lng: -89.59258 }, radius: 25000 }, fields: ["id", "displayName", "formattedAddress", "googleMapsURI", "websiteURI", "location", "types"] });
      const parsed = response.places.map(place => {
        const displayName = place.displayName as string | { text?: string } | undefined;
        const location = place.location as { lat?: () => number; lng?: () => number } | undefined;
        return { externalId: String(place.id ?? ""), name: typeof displayName === "string" ? displayName : displayName?.text ?? "Referencia pública", address: typeof place.formattedAddress === "string" ? place.formattedAddress : undefined, mapsUrl: typeof place.googleMapsURI === "string" ? place.googleMapsURI : undefined, websiteUrl: typeof place.websiteURI === "string" ? place.websiteURI : undefined, category: Array.isArray(place.types) ? String(place.types[0] ?? "") : undefined, latitude: location?.lat ? String(location.lat()) : undefined, longitude: location?.lng ? String(location.lng()) : undefined };
      }).filter(place => place.externalId && place.name);
      setResults(parsed);
      if (!parsed.length) toast.message("No hubo referencias con esa búsqueda. Prueba otra zona o categoría.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo consultar la fuente pública");
    } finally { setSearching(false); }
  };

  return <section className="rounded-2xl border border-[#c9ff4a]/25 bg-[#0d1a14] p-4">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[.12em] text-[#c9ff4a]"><Search size={14} />Descubrir referencias públicas</p><p className="mt-2 max-w-2xl text-xs leading-5 text-[#a8b8af]">Busca referencias públicas alrededor de Mérida mediante Google Maps. Una referencia no prueba disponibilidad, propiedad ni autorización operativa: debes revisarla antes de crear una unidad.</p></div><span className="inline-flex items-center gap-1 rounded-full border border-white/10 px-2 py-1 text-[10px] text-[#91a79b]"><ShieldCheck size={12} />Sin alta automática</span></div>
    <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1.15fr]"><div className="overflow-hidden rounded-xl border border-white/10"><MapView className="h-52" initialCenter={{ lat: 20.96737, lng: -89.59258 }} initialZoom={11} onMapReady={map => { mapRef.current = map; setReady(true); }} /></div><div className="space-y-3"><div className="flex gap-2"><input value={query} onChange={event => setQuery(event.target.value)} className="field flex-1" placeholder="Ej. hospedaje en Mérida" /><button onClick={searchPublicReferences} disabled={!ready || searching || !query.trim()} className="secondary"><Search size={14} />Buscar</button></div><p className="text-[11px] text-[#91a79b]">Fuente: Google Maps Places. Consulta pública; no se realiza scraping ni se guarda un resultado hasta que lo eliges.</p>{results.map(place => <article key={place.externalId} className="rounded-lg border border-white/10 p-3"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-semibold">{place.name}</p><p className="mt-1 text-xs text-[#91a79b]">{place.address || "Dirección no disponible"}</p><p className="mt-1 text-[10px] uppercase tracking-wider text-[#c9ff4a]">{place.category || "referencia"}</p></div><button onClick={() => saveCandidate.mutate({ query, ...place })} disabled={saveCandidate.isPending} className="secondary">Guardar para revisar</button></div>{place.mapsUrl && <a href={place.mapsUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-[11px] text-[#c9ff4a]"><ExternalLink size={12} />Abrir fuente</a>}</article>)}</div></div>
    {!!candidates.length && <div className="mt-4 border-t border-white/10 pt-4"><p className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[.12em] text-[#c9ff4a]"><MapPinned size={13} />Candidatos guardados</p><div className="grid gap-2 md:grid-cols-2">{candidates.map(candidate => <article key={candidate.id} className="rounded-lg border border-white/10 p-3"><div className="flex items-start justify-between gap-2"><div><p className="text-sm font-semibold">{candidate.name}</p><p className="mt-1 text-xs text-[#91a79b]">{candidate.address || "Sin dirección publicada"}</p><p className="mt-1 text-[10px] uppercase tracking-wider text-[#c9ff4a]">{candidate.status}</p></div>{candidate.status === "discovered" && <div className="flex gap-2"><button onClick={() => reviewCandidate.mutate({ candidateId: candidate.id, status: "reviewed" })} className="text-xs text-[#c9ff4a]">Revisar</button><button onClick={() => reviewCandidate.mutate({ candidateId: candidate.id, status: "dismissed" })} className="text-xs text-[#f0a0a0]">Descartar</button></div>}</div>{candidate.mapsUrl && <a href={candidate.mapsUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-[11px] text-[#c9ff4a]"><ExternalLink size={12} />Ver fuente</a>}</article>)}</div></div>}
  </section>;
}
