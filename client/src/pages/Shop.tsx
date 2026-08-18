import { trpc } from "@/lib/trpc";
import { ArrowLeft, PackageOpen, RefreshCw, Store } from "lucide-react";
import { Link } from "wouter";

const money = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  minimumFractionDigits: 2,
});

export default function Shop() {
  const catalog = trpc.commerce.products.list.useQuery({ first: 24 });

  return <main className="evox-shell min-h-screen text-[#f1f4ed]">
    <div className="evox-grid fixed inset-0 pointer-events-none opacity-40" />
    <header className="relative z-10 flex items-center justify-between border-b border-white/10 bg-[#07100d]/85 px-5 py-4 backdrop-blur-xl">
      <div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#c9ff4a] text-[#07120c]"><Store size={18} /></span><div><h1 className="font-semibold">Tienda Evox</h1><p className="font-mono text-[10px] uppercase tracking-[.14em] text-[#94a39b]">Storefront Shopify conectado</p></div></div>
      <Link href="/" className="evox-ghost inline-flex items-center gap-2 px-3 py-2 text-xs"><ArrowLeft size={14} />PropertyOps</Link>
    </header>

    <section className="relative z-10 mx-auto max-w-6xl px-5 py-10">
      <div className="max-w-2xl"><p className="font-mono text-[10px] uppercase tracking-[.18em] text-[#c9ff4a]">Catálogo conectado</p><h2 className="mt-3 text-3xl font-semibold tracking-[-.055em] sm:text-4xl">Servicios y recursos de Evox.</h2><p className="mt-3 text-sm leading-6 text-[#94a39b]">El catálogo se consulta directamente desde la nueva tienda Shopify. Los precios, productos y condiciones solo se mostrarán cuando estén definidos y publicados por un operador.</p></div>

      {catalog.isLoading && <div className="mt-8 grid place-items-center rounded-2xl border border-white/10 bg-white/[.02] p-12 text-sm text-[#94a39b]">Consultando catálogo de Shopify…</div>}
      {catalog.isError && <div className="mt-8 rounded-2xl border border-amber-300/25 bg-amber-300/[.06] p-6"><p className="font-semibold text-amber-100">No se pudo cargar el catálogo.</p><p className="mt-2 text-sm leading-6 text-[#c7b889]">No se mostraron productos ni se inició ningún cobro. Revisa la conexión del storefront e inténtalo de nuevo.</p><button onClick={() => catalog.refetch()} className="evox-ghost mt-4 inline-flex items-center gap-2 px-3 py-2 text-xs"><RefreshCw size={14} />Reintentar</button></div>}
      {!catalog.isLoading && !catalog.isError && !catalog.data?.length && <div className="mt-8 rounded-2xl border border-dashed border-[#c9ff4a]/25 bg-[#c9ff4a]/[.035] p-8 text-center"><span className="mx-auto grid h-11 w-11 place-items-center rounded-xl border border-[#c9ff4a]/30 text-[#c9ff4a]"><PackageOpen size={20} /></span><h3 className="mt-4 font-semibold">La tienda está conectada y el catálogo está en preparación.</h3><p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[#94a39b]">Aún no hay productos publicados. No se crearán artículos, precios, descuentos ni cobros de muestra sin una instrucción comercial explícita.</p></div>}
      {!catalog.isLoading && !catalog.isError && Boolean(catalog.data?.length) && <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{catalog.data?.map(product => <article key={product.id} className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b1711]/90"><div className="aspect-[4/3] bg-white/[.035]">{product.images[0] ? <img src={product.images[0].url} alt={product.images[0].altText ?? product.title} className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-[#718279]"><PackageOpen size={26} /></div>}</div><div className="p-4"><p className="text-xs text-[#94a39b]">{product.productType || "Servicio"}</p><h3 className="mt-1 font-semibold">{product.title}</h3><p className="mt-2 line-clamp-3 text-sm leading-5 text-[#94a39b]">{product.description || "Detalles disponibles próximamente."}</p><p className="mt-4 font-mono text-sm text-[#c9ff4a]">Desde {money.format(Number(product.priceRange.min.amount))}</p></div></article>)}</div>}
    </section>
  </main>;
}
