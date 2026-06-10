import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Invoice } from "@/lib/api";

function formatDate(dateStr: string | undefined | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function formatAmount(amount: number, currency: string) {
  const symbol = currency === "INR" ? "₹" : currency;
  return `${symbol}${(amount / 100).toLocaleString("en-IN")}`;
}

export function InvoiceTable({ invoices }: { invoices: Invoice[] }) {
  if (invoices.length === 0) {
    return <p className="text-sm text-muted-foreground">No invoices yet.</p>;
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-xs">Date</TableHead>
            <TableHead className="text-xs">Period</TableHead>
            <TableHead className="text-xs">Amount</TableHead>
            <TableHead className="text-xs">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((inv) => (
            <TableRow key={inv._id}>
              <TableCell className="text-xs">{formatDate(inv.created_at)}</TableCell>
              <TableCell className="text-xs">{formatDate(inv.period_start)} – {formatDate(inv.period_end)}</TableCell>
              <TableCell className="text-xs">{formatAmount(inv.amount, inv.currency)}</TableCell>
              <TableCell className="text-xs capitalize">{inv.status}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
