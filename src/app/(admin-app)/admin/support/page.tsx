"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supportApi, type SupportTicket } from "@/lib/api/support";

const statuses = ["all", "open", "in_progress", "waiting_on_user", "resolved", "closed"];
const statusLabel = (status: string) => status.replaceAll("_", " ");

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selected, setSelected] = useState<SupportTicket | null>(null);
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try { setTickets((await supportApi.adminList({ status, search: search.trim() || undefined })).tickets); }
    catch { toast.error("Could not load support queue."); }
    finally { setLoading(false); }
  }, [status, search]);
  useEffect(() => { void load(); }, [load]);

  const openTicket = async (id: string) => {
    try { setSelected(await supportApi.adminGet(id)); }
    catch { toast.error("Could not open ticket."); }
  };
  const reply = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selected || !message.trim()) return;
    try {
      setSelected(await supportApi.adminReply(selected._id, message.trim(), selected.status));
      setMessage("");
      toast.success("Reply sent.");
      await load();
    } catch { toast.error("Reply could not be sent."); }
  };

  return <main className="mx-auto max-w-7xl space-y-6 p-6">
    <header><h1 className="text-2xl font-bold">Support inbox</h1><p className="text-sm text-muted-foreground">Review customer requests and reply in their ticket thread.</p></header>
    <div className="grid gap-5 lg:grid-cols-[minmax(300px,0.8fr)_1.2fr]">
      <section className="space-y-3">
        <div className="flex gap-2"><Input aria-label="Search tickets" placeholder="Search subject or ticket ID" value={search} onChange={(event) => setSearch(event.target.value)} />
          <select aria-label="Filter status" className="rounded-md border bg-background px-3 text-sm" value={status} onChange={(event) => setStatus(event.target.value)}>{statuses.map((item) => <option key={item} value={item}>{statusLabel(item)}</option>)}</select></div>
        {loading ? <p className="p-8 text-center text-muted-foreground">Loading support queue…</p> : tickets.length === 0 ? <p className="rounded-lg border p-8 text-center text-muted-foreground">No tickets match these filters.</p> : tickets.map((ticket) => {
          const owner = typeof ticket.user_id === "object" ? ticket.user_id : null;
          return <button key={ticket._id} onClick={() => void openTicket(ticket._id)} className={`w-full rounded-lg border p-4 text-left transition hover:border-primary ${selected?._id === ticket._id ? "border-primary bg-primary/5" : ""}`}>
            <div className="flex items-start justify-between gap-2"><span className="font-semibold">{ticket.subject}</span><Badge variant="outline">{statusLabel(ticket.status)}</Badge></div>
            <p className="mt-1 text-xs text-muted-foreground">{owner?.email || "Account"} · {ticket.category} · #{ticket._id.slice(-8).toUpperCase()}</p>
            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{ticket.replies.at(-1)?.message}</p>
            <p className="mt-2 text-xs text-muted-foreground">{new Date(ticket.last_activity_at).toLocaleString()}</p>
          </button>;
        })}
      </section>
      <section className="rounded-lg border p-5">
        {!selected ? <div className="grid min-h-80 place-items-center text-sm text-muted-foreground">Select a ticket to review its conversation.</div> : <div className="flex h-[70vh] min-h-[500px] flex-col">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4"><div><h2 className="text-lg font-bold">{selected.subject}</h2><p className="text-sm text-muted-foreground">{typeof selected.user_id === "object" ? selected.user_id.email : ""} · {selected.category} · #{selected._id.slice(-8).toUpperCase()}</p></div>
            <div className="flex gap-2"><select aria-label="Ticket status" className="rounded-md border bg-background px-3 py-2 text-sm" value={selected.status} onChange={(event) => setSelected({ ...selected, status: event.target.value as SupportTicket["status"] })}>{statuses.filter((s) => s !== "all").map((item) => <option key={item} value={item}>{statusLabel(item)}</option>)}</select><Button variant="outline" onClick={() => void supportApi.adminStatus(selected._id, selected.status).then((ticket) => { setSelected(ticket); void load(); toast.success("Status updated."); }).catch(() => toast.error("Status could not be updated."))}>Update status</Button></div>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto py-4">{selected.replies.map((item, index) => <article key={item._id || index} className={`max-w-[90%] rounded-lg p-3 text-sm ${item.author_role === "admin" ? "ml-auto bg-primary/10" : "bg-muted"}`}><p className="mb-1 text-xs font-semibold">{item.author_role === "admin" ? "Support team" : "Customer"} · {new Date(item.created_at).toLocaleString()}</p><p className="whitespace-pre-wrap">{item.message}</p></article>)}</div>
          <form onSubmit={reply} className="space-y-2 border-t pt-4"><Textarea value={message} onChange={(event) => setMessage(event.target.value)} maxLength={10000} required placeholder="Write a reply to the customer…" /><Button type="submit">Send reply &amp; update status</Button></form>
        </div>}
      </section>
    </div>
  </main>;
}
