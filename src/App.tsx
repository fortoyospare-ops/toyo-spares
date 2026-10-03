import { useState, type FormEvent, type ReactNode } from "react";
import {
  ArrowRight, BadgeCheck, Box, CarFront, ChevronDown, Clock3, Cog,
  Mail, MapPin, Menu, MessageCircle, PackageCheck, Phone,
  Quote, Search, ShieldCheck, Sparkles, Truck, Wrench, X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import heroImage from "@/assets/toyo-hero.jpg";
import workshopImage from "@/assets/toyo-parts-workshop.jpg";
import { Button } from "@/components/Button";
import { sendEnquiry } from "@/lib/enquiry";

const nav = [["Home", "home"], ["Services", "services"], ["Vehicles", "vehicles"], ["About", "about"], ["Get a Quote", "quote"], ["Contact", "contact"]];
const services: Array<[LucideIcon, string, string]> = [
  [Cog, "Used Toyota & Ford parts", "Engines, gearboxes, doors, panels, bonnets, guards, bumpers, headlights, radiators, mags, seats, interiors and electrical."],
  [BadgeCheck, "New genuine parts", "Genuine Toyota and Ford parts sourced for the right fit and dependable performance."],
  [Sparkles, "New aftermarket parts", "Quality replacement options when you want value without compromising fit."],
  [CarFront, "Most makes & models", "Toyota and Ford specialists with wrecking and parts support across many other makes."],
  [Truck, "Melbourne delivery", "Daily delivery across Melbourne’s eastern suburbs for parts large and small."],
  [PackageCheck, "Australia-wide shipping", "Courier and Australia Post options for customers across Australia."],
  [Box, "Pickup available", "Collect your order directly from our Fawkner yard during business hours."],
  [Search, "We buy cars", "Running or not. Contact us about a free tow truck pickup from your location."],
  [Wrench, "Fitting & advice", "Straightforward parts advice and fitting support from experienced specialists."],
];
const vehicles = ["Toyota", "Ford", "Lexus", "Corolla", "Camry", "Hilux", "Hiace", "Landcruiser", "RAV4", "Kluger", "Prado", "Yaris", "Aurion", "Tarago", "Soarer", "Supra", "MR2", "Celica", "Other makes"];
const vehicleMakes = ["Toyota", "Ford", "Lexus", "Other"];
const trustItems: Array<[LucideIcon, string, string]> = [[Clock3, "30+ Years", "Experience"], [Cog, "Used + New", "Genuine + Aftermarket"], [Truck, "Daily Delivery", "Eastern Suburbs"], [CarFront, "We Buy Cars", "Running or not"]];
const processSteps: Array<[string, LucideIcon, string, string]> = [["01", MessageCircle, "Send your quote request", "Tell us your vehicle details and the part you need."], ["02", Search, "We find your part", "We check available used, genuine and aftermarket options."], ["03", Truck, "Choose how to receive it", "Pickup in Fawkner, Melbourne delivery or Australia-wide shipping."]];

function AnchorButton({ href, children, dark = false }: { href: string; children: ReactNode; dark?: boolean }) {
  return <a href={href} className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-sm px-6 text-sm font-bold uppercase transition-colors focus-visible:ring-2 focus-visible:ring-ring ${dark ? "bg-foreground text-background hover:bg-foreground/90" : "bg-primary text-primary-foreground hover:bg-primary-hover"}`}>{children}</a>;
}

function Header() {
  const [open, setOpen] = useState(false);
  return <>
    <div className="bg-primary text-primary-foreground">
      <div className="section-shell flex min-h-9 items-center justify-between text-xs font-semibold">
        <span className="hidden sm:inline">Toyota & Ford parts specialists • Fawkner, Melbourne</span>
        <span className="sm:hidden">Mon–Sat 9:00 AM–6:00 PM</span>
        <a href="mailto:fortoyospare@gmail.com" className="inline-flex items-center gap-2 hover:underline"><Mail size={14} /> fortoyospare@gmail.com</a>
      </div>
    </div>
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
      <div className="section-shell flex h-20 items-center justify-between gap-4">
        <a href="#home" className="flex items-center gap-3" aria-label="Toyo Spares home">
          <span className="grid size-10 place-items-center bg-primary font-display text-xl font-black text-primary-foreground">TS</span>
          <span className="font-display text-2xl font-extrabold uppercase leading-none">Toyo <span className="text-primary">Spares</span></span>
        </a>
        <nav className="hidden items-center gap-5 xl:flex" aria-label="Main navigation">
          {nav.map(([label, id]) => <a key={id} href={`#${id}`} className="text-xs font-bold uppercase hover:text-primary">{label}</a>)}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <a href="tel:0413050400" className="inline-flex min-h-11 items-center gap-2 border border-border px-4 text-sm font-bold hover:border-primary"><Phone size={17} /> Call Now</a>
          <AnchorButton href="#quote"><Quote size={17} /> Get a Quote</AnchorButton>
        </div>
        <button onClick={() => setOpen(!open)} className="grid size-11 place-items-center border border-border md:hidden" aria-label="Toggle menu" aria-expanded={open}>{open ? <X /> : <Menu />}</button>
      </div>
      {open && <nav className="border-t border-border bg-background px-5 py-5 md:hidden" aria-label="Mobile navigation">{nav.map(([label, id]) => <a key={id} href={`#${id}`} onClick={() => setOpen(false)} className="block border-b border-border py-3 font-display text-xl font-bold uppercase">{label}</a>)}</nav>}
    </header>
  </>;
}

function SectionHeading({ eyebrow, title, intro, light = false }: { eyebrow: string; title: string; intro?: string; light?: boolean }) {
  return <div className="max-w-2xl"><p className="mb-3 text-xs font-extrabold uppercase text-primary">{eyebrow}</p><h2 className={`display-title text-4xl sm:text-5xl ${light ? "text-background" : "text-foreground"}`}>{title}</h2>{intro && <p className={`mt-5 leading-7 ${light ? "text-background/70" : "text-muted-foreground"}`}>{intro}</p>}</div>;
}

type Status = "idle" | "sending" | "success" | "error";

function formValues(form: HTMLFormElement) {
  const out: Record<string, string> = {};
  new FormData(form).forEach((v, k) => { out[k] = String(v); });
  return out;
}

// Hidden spam trap: real visitors never see or fill this.
function Honeypot() {
  return <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" />;
}

function PartsForm() {
  const [status, setStatus] = useState<Status>("idle");
  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setStatus("sending");
    const form = event.currentTarget;
    try {
      await sendEnquiry("parts", formValues(form));
      form.reset(); setStatus("success");
    } catch { setStatus("error"); }
  }
  return <form onSubmit={onSubmit} className="relative grid gap-5 sm:grid-cols-2">
    <Honeypot />
    <Field name="name" label="Name" required /><Field name="phone" label="Phone" type="tel" required /><Field name="email" label="Email" type="email" required />
    <Select name="vehicleMake" label="Vehicle make" options={vehicleMakes} /><Field name="vehicleModel" label="Model" required /><Field name="vehicleYear" label="Year" inputMode="numeric" pattern="[0-9]{4}" required />
    <Field name="regoOrVin" label="Rego or VIN (optional)" /><Field name="partRequired" label="Part required" required />
    <Select name="partCondition" label="Condition" options={["Used", "New Genuine", "Aftermarket", "Any"]} /><Select name="fulfilment" label="Delivery or pickup" options={["Pickup", "Delivery", "Australia-wide shipping"]} />
    <label className="sm:col-span-2"><span className="field-label">Notes</span><textarea name="notes" maxLength={1500} rows={4} className="field-control resize-y" /></label>
    <div className="sm:col-span-2"><p className="mb-4 flex items-center gap-2 text-xs text-muted-foreground"><Mail size={15} /> Enquiries go to <a className="font-bold text-foreground underline" href="mailto:fortoyospare@gmail.com">fortoyospare@gmail.com</a></p>
      <Button type="submit" disabled={status === "sending"} className="w-full sm:w-auto">{status === "sending" ? "Sending…" : <>Send Quote Request <ArrowRight size={18} /></>}</Button>
      {status === "success" && <p role="status" className="mt-4 font-bold text-success">Thanks — your quote request has been received. We’ll be in touch soon.</p>}
      {status === "error" && <p role="alert" className="mt-4 font-bold text-primary">Something went wrong. Please call 0413 050 400.</p>}
    </div>
  </form>;
}

function CarForm() {
  const [status, setStatus] = useState<Status>("idle");
  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setStatus("sending");
    const form = event.currentTarget;
    try {
      await sendEnquiry("car", formValues(form));
      form.reset(); setStatus("success");
    } catch { setStatus("error"); }
  }
  return <form onSubmit={onSubmit} className="relative grid gap-5 sm:grid-cols-2"><Honeypot /><Select name="vehicleMake" label="Make" options={vehicleMakes} /><Field name="vehicleModel" label="Model" required /><Field name="vehicleYear" label="Year" pattern="[0-9]{4}" required /><Field name="location" label="Vehicle location" required /><Field name="phone" label="Phone" type="tel" required /><label><span className="field-label">Condition</span><textarea name="vehicleCondition" required maxLength={1000} rows={3} className="field-control resize-y" /></label><div className="sm:col-span-2"><p className="mb-4 flex items-center gap-2 text-xs text-muted-foreground"><Mail size={15} /> Enquiries go to <a href="mailto:fortoyospare@gmail.com" className="font-bold text-foreground underline">fortoyospare@gmail.com</a></p><Button disabled={status === "sending"} type="submit" variant="dark">{status === "sending" ? "Sending…" : <>Sell Your Car <ArrowRight size={18} /></>}</Button>{status === "success" && <p role="status" className="mt-4 font-bold text-success">Thanks — we’ve received your vehicle details.</p>}{status === "error" && <p role="alert" className="mt-4 font-bold text-primary">Something went wrong. Please call 0413 050 400.</p>}</div></form>;
}

function Field(props: React.InputHTMLAttributes<HTMLInputElement> & { label: string; name: string }) { const { label, ...rest } = props; return <label><span className="field-label">{label}</span><input maxLength={255} className="field-control" {...rest} /></label>; }
function Select({ name, label, options }: { name: string; label: string; options: string[] }) { return <label><span className="field-label">{label}</span><select name={name} className="field-control">{options.map(x => <option key={x}>{x}</option>)}</select></label>; }

export function App() {
  return <div id="home" className="pb-16 md:pb-0"><Header />
    <main>
      <section className="relative min-h-[690px] overflow-hidden bg-workshop text-background">
        <img src={heroImage} width={1536} height={1024} alt="Toyota and Ford vehicles and quality parts at an organised auto wrecking yard" className="absolute inset-0 size-full object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-r from-workshop via-workshop/88 to-workshop/10" />
        <div className="section-shell relative flex min-h-[690px] items-center py-20">
          <div className="max-w-3xl"><div className="mb-6 inline-flex items-center gap-2 border-l-4 border-primary bg-workshop/65 px-4 py-2 text-xs font-bold uppercase"><ShieldCheck size={16} /> Melbourne Toyota & Ford parts specialists</div>
            <h1 className="display-title text-6xl text-background sm:text-7xl lg:text-8xl">Quality Toyota & Ford Parts.<br /><span className="text-primary">Fair Prices.</span><br />Fast Delivery.</h1>
            <p className="mt-7 max-w-xl text-base leading-7 text-background/80 sm:text-lg">More than 30 years of auto wrecking experience, with quality used, genuine and aftermarket Toyota and Ford parts. Now wrecking most makes and models.</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row"><AnchorButton href="#quote"><Quote size={18} /> Get a Quote</AnchorButton><a href="tel:0413050400" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-sm border border-background/40 bg-workshop/40 px-6 text-sm font-bold uppercase text-background hover:border-background"><Phone size={18} /> Call 0413 050 400</a></div>
            <div className="mt-10 flex items-center gap-4"><img src={workshopImage} width={1024} height={1024} alt="Toyo Spares parts workshop" className="size-14 rounded-full border-2 border-primary object-cover" /><div><p className="font-bold text-background">Abdul Rehman</p><p className="text-xs text-background/60">Owner • Honest parts advice</p></div></div>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-background"><div className="section-shell grid sm:grid-cols-2 lg:grid-cols-4">{trustItems.map(([Icon, a, b]) => <div key={a} className="flex items-center gap-4 border-b border-border py-6 sm:px-5 lg:border-b-0 lg:border-r"><Icon className="text-primary" size={28} /><div><p className="font-display text-xl font-bold uppercase">{a}</p><p className="text-xs text-muted-foreground">{b}</p></div></div>)}</div></section>

      <section id="services" className="py-24"><div className="section-shell"><SectionHeading eyebrow="What we do" title="Parts, delivery & advice under one roof" intro="From hard-to-find Toyota and Ford components to Australia-wide shipping, we make sourcing the right part straightforward." /><div className="mt-12 grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">{services.map(([Icon, title, text]) => <article key={String(title)} className="bg-card p-7 transition-colors hover:bg-muted"><Icon className="mb-5 text-primary" size={30} /><h3 className="text-2xl font-bold uppercase">{String(title)}</h3><p className="mt-3 text-sm leading-6 text-muted-foreground">{String(text)}</p></article>)}</div></div></section>

      <section id="vehicles" className="bg-workshop py-24"><div className="section-shell"><SectionHeading eyebrow="Vehicles we cover" title="Toyota & Ford knowledge. Broad capability." intro="Ask us about Toyota, Ford, Lexus, these popular models and parts for other makes." light /><div className="mt-12 flex flex-wrap gap-3">{vehicles.map((v, i) => <span key={v} className={`border px-5 py-3 font-display text-xl font-bold uppercase ${i === vehicles.length - 1 ? "border-primary bg-primary text-primary-foreground" : "border-background/20 text-background"}`}>{v}</span>)}</div></div></section>

      <section className="py-24"><div className="section-shell"><SectionHeading eyebrow="How it works" title="The right part in three simple steps" /><div className="mt-12 grid gap-8 lg:grid-cols-3">{processSteps.map(([n, Icon, t, d]) => <div key={n} className="relative border-t-4 border-primary pt-7"><span className="absolute right-0 top-3 font-display text-7xl font-black text-muted">{n}</span><Icon className="relative text-primary" size={30} /><h3 className="relative mt-8 text-2xl font-bold uppercase">{t}</h3><p className="relative mt-3 text-sm leading-6 text-muted-foreground">{d}</p></div>)}</div></div></section>

      <section id="quote" className="bg-muted py-24"><div className="section-shell"><SectionHeading eyebrow="Get a quote" title="Tell us what you need" intro="Add as much vehicle and part detail as you can. We’ll check availability and get back to you." /><div className="mt-12 grid gap-8 lg:grid-cols-[1.35fr_.85fr]"><div className="bg-card p-6 shadow-sm sm:p-9"><h3 className="mb-7 text-3xl font-bold uppercase">Parts quote</h3><PartsForm /></div><div className="bg-card p-6 shadow-sm sm:p-9"><h3 className="text-3xl font-bold uppercase">Sell your car</h3><p className="mb-7 mt-2 text-sm leading-6 text-muted-foreground">Running or not, send the details below. Free tow truck pickup is available.</p><CarForm /></div></div></div></section>

      <section id="about" className="py-24"><div className="section-shell grid items-center gap-12 lg:grid-cols-2"><div className="relative"><img src={workshopImage} width={1024} height={1024} loading="lazy" alt="Toyo Spares parts workshop" className="aspect-[4/5] w-full max-w-lg object-cover" /></div><div><SectionHeading eyebrow="About Toyo Spares" title="Experience you can trust. Advice you can use." /><p className="mt-7 leading-7 text-muted-foreground">Abdul Rehman leads Toyo Spares with a practical, customer-first approach shaped by more than 30 years of auto wrecking experience and Toyota and Ford parts knowledge. The focus is simple: listen carefully, identify the right part and give honest advice.</p><p className="mt-5 leading-7 text-muted-foreground">From everyday repairs to hard-to-find components, Toyo Spares helps workshops, owners and enthusiasts source quality parts without the runaround.</p><div className="mt-8 flex flex-wrap gap-3"><AnchorButton href="tel:0413050400" dark><Phone size={18} /> Speak with Abdul</AnchorButton><AnchorButton href="#contact">Contact details</AnchorButton></div></div></div></section>

      <section className="bg-workshop py-24"><div className="section-shell"><SectionHeading eyebrow="Customer feedback" title="Reviews" intro="These review spaces are ready to be replaced with verified customer feedback." light /><div className="mt-12 grid gap-5 lg:grid-cols-3">{["Reliable service and the right part found quickly.", "Friendly advice and an easy pickup experience.", "Great communication from quote through to delivery."].map((text, i) => <article key={text} className="border border-background/15 bg-workshop-soft p-7 text-background"><Quote className="text-primary" /><p className="mt-5 text-lg leading-7">“{text}”</p><div className="mt-7 border-t border-background/15 pt-5"><p className="font-bold">Editable customer review {i + 1}</p><p className="text-xs text-background/50">Placeholder — replace with verified feedback</p></div></article>)}</div></div></section>

      <section className="py-24"><div className="section-shell grid gap-12 lg:grid-cols-[.75fr_1.25fr]"><SectionHeading eyebrow="Frequently asked" title="Good to know" intro="Can’t find your answer? Call Abdul and we’ll help." /><div className="divide-y divide-border border-y border-border">{[["Do your parts come with a warranty?", "Warranty coverage can vary by part. We’ll explain the applicable coverage before you buy — contact us about the specific part you need."], ["Do you deliver?", "Yes. We offer daily delivery across Melbourne’s eastern suburbs, plus courier and Australia Post shipping Australia-wide."], ["Can I pick up my part?", "Yes. Pickup is available from 19 Leo Street, Fawkner VIC 3060 during business hours."], ["Do you buy cars?", "Yes. We buy vehicles running or not, and free tow truck pickup is available. Send us your vehicle details for an assessment."], ["How quickly will I receive a quote?", "We respond as promptly as possible during business hours. More complete vehicle and part details help us check availability faster."]].map(([q, a]) => <details key={q} className="group"><summary className="flex cursor-pointer list-none items-center justify-between gap-5 py-6 font-display text-xl font-bold uppercase">{q}<ChevronDown className="shrink-0 transition-transform group-open:rotate-180" /></summary><p className="max-w-2xl pb-6 text-sm leading-7 text-muted-foreground">{a}</p></details>)}</div></div></section>

      <section id="contact" className="bg-muted py-24"><div className="section-shell"><SectionHeading eyebrow="Contact" title="Talk to a parts specialist" intro="Call, email or visit our Fawkner yard. We’re ready to help you find the right part." /><div className="mt-12 grid gap-6 lg:grid-cols-[.8fr_1.2fr]"><div className="grid gap-6"><div className="bg-workshop p-7 text-background"><div className="flex items-center gap-5"><img src={workshopImage} width={1024} height={1024} loading="lazy" alt="Toyo Spares parts workshop" className="size-28 rounded-sm object-cover" /><div><p className="font-display text-3xl font-bold uppercase">Abdul Rehman</p><p className="text-sm text-background/60">Owner, Toyo Spares</p></div></div><div className="mt-7 grid gap-3 sm:grid-cols-2"><a href="tel:0413050400" className="inline-flex min-h-12 items-center justify-center gap-2 bg-primary px-4 text-sm font-bold text-primary-foreground"><Phone size={18} /> Call Abdul</a><a href="mailto:fortoyospare@gmail.com" className="inline-flex min-h-12 items-center justify-center gap-2 border border-background/25 px-4 text-sm font-bold"><Mail size={18} /> Email Abdul</a></div></div>
          <div className="bg-card p-7"><ul className="space-y-5 text-sm"><li className="flex gap-3"><Phone className="shrink-0 text-primary" size={20} /><div><p className="font-bold">Phone</p><a href="tel:0413050400" className="hover:underline">0413 050 400</a> · <a href="sms:0413050400" className="font-bold text-primary">SMS</a> · <a href="https://wa.me/61413050400" className="font-bold text-primary">WhatsApp</a></div></li><li className="flex gap-3"><Mail className="shrink-0 text-primary" size={20} /><div><p className="font-bold">Email</p><a href="mailto:fortoyospare@gmail.com" className="break-all hover:underline">fortoyospare@gmail.com</a></div></li><li className="flex gap-3"><MapPin className="shrink-0 text-primary" size={20} /><div><p className="font-bold">Address</p><address className="not-italic">19 Leo Street, Fawkner VIC 3060</address></div></li><li className="flex gap-3"><Clock3 className="shrink-0 text-primary" size={20} /><div><p className="font-bold">Hours</p><p>Monday–Saturday: 9:00 AM–6:00 PM</p><p>Sunday: Closed</p></div></li></ul></div></div>
          <iframe title="Map showing Toyo Spares at 19 Leo Street, Fawkner" src="https://www.google.com/maps?q=19%20Leo%20Street%2C%20Fawkner%20VIC%203060&output=embed" className="min-h-[440px] size-full border-0 bg-card" loading="lazy" referrerPolicy="no-referrer-when-downgrade" /></div></div></section>
    </main>
    <footer className="bg-workshop pb-20 pt-16 text-background md:pb-8"><div className="section-shell"><div className="grid gap-10 border-b border-background/15 pb-12 md:grid-cols-3"><div><p className="font-display text-3xl font-extrabold uppercase">Toyo <span className="text-primary">Spares</span></p><p className="mt-4 max-w-sm text-sm leading-6 text-background/60">Quality Toyota and Ford parts, fair prices and experienced advice from Fawkner, Melbourne.</p></div><div><p className="mb-4 text-xs font-bold uppercase text-primary">Quick links</p><div className="grid grid-cols-2 gap-3 text-sm">{nav.slice(1).map(([l, id]) => <a key={id} href={`#${id}`} className="hover:text-primary">{l}</a>)}</div></div><div><p className="mb-4 text-xs font-bold uppercase text-primary">Contact</p><div className="space-y-3 text-sm"><a className="flex items-center gap-2 hover:text-primary" href="tel:0413050400"><Phone size={16} />0413 050 400</a><a className="flex items-center gap-2 break-all hover:text-primary" href="mailto:fortoyospare@gmail.com"><Mail size={16} />fortoyospare@gmail.com</a><p className="flex items-start gap-2"><MapPin size={16} />19 Leo Street, Fawkner VIC 3060</p><p className="flex items-start gap-2"><Clock3 size={16} />Mon–Sat 9:00 AM–6:00 PM · Sun Closed</p></div></div></div><p className="pt-7 text-xs text-background/45">© {new Date().getFullYear()} TOYO SPARES. All rights reserved.</p></div></footer>
    <div className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-2 border-t border-border bg-background p-2 md:hidden"><a href="tel:0413050400" className="inline-flex min-h-12 items-center justify-center gap-2 font-bold"><Phone size={19} /> Call Now</a><a href="#quote" className="inline-flex min-h-12 items-center justify-center gap-2 bg-primary font-bold text-primary-foreground"><Quote size={19} /> Get a Quote</a></div>
  </div>;
}
