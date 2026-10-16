import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { ADMIN_STATUSES, adminApi, formatDate, STATUS_LABELS, type AdminStatus } from "./api";
import StatusBadge from "./StatusBadge";

const FILTERS: Array<{ value: AdminStatus | null; label: string }> = [
  { value: null, label: "All" },
  ...ADMIN_STATUSES.map((value) => ({ value, label: STATUS_LABELS[value] })),
];

const InquiryList = () => {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const requested = params.get("status");
  const status = ADMIN_STATUSES.find((s) => s === requested) ?? null;

  const inquiries = useQuery({
    queryKey: ["inquiries", status ?? "all"],
    queryFn: () => adminApi.list(status ?? undefined),
  });

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-display text-2xl font-bold text-primary">Inquiries</h1>

      <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Filter by status">
        {FILTERS.map((filter) => (
          <Button
            key={filter.label}
            size="sm"
            variant={filter.value === status ? "default" : "outline"}
            aria-pressed={filter.value === status}
            onClick={() => setParams(filter.value ? { status: filter.value } : {})}
          >
            {filter.label}
          </Button>
        ))}
      </div>

      <div className="mt-5 rounded-lg border border-border bg-card shadow-card">
        {inquiries.isPending ? (
          <div className="flex justify-center p-10">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-label="Loading" />
          </div>
        ) : inquiries.isError ? (
          <p role="alert" className="p-6 text-sm text-destructive">
            Could not load inquiries. Refresh the page to try again.
          </p>
        ) : inquiries.data.length === 0 ? (
          <p className="p-10 text-center text-sm text-muted-foreground">
            {status ? `No ${STATUS_LABELS[status].toLowerCase()} inquiries.` : "No inquiries yet."}
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Business</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Received</TableHead>
                <TableHead className="hidden text-right sm:table-cell">Files</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inquiries.data.map((inquiry) => (
                <TableRow
                  key={inquiry.id}
                  onClick={() => navigate(`/admin/inquiries/${inquiry.id}`)}
                  className={cn("cursor-pointer", inquiry.status === "new" && "font-semibold")}
                >
                  <TableCell>
                    <Link
                      to={`/admin/inquiries/${inquiry.id}`}
                      className="rounded-sm text-primary hover:underline"
                      onClick={(event) => event.stopPropagation()}
                    >
                      {inquiry.businessName}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {inquiry.firstName} {inquiry.lastName}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {formatDate(inquiry.createdAt)}
                  </TableCell>
                  <TableCell className="hidden text-right sm:table-cell">{inquiry.fileCount}</TableCell>
                  <TableCell>
                    <StatusBadge status={inquiry.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};

export default InquiryList;
