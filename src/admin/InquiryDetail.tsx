import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, Download, ExternalLink, FileX, Loader2, Trash2 } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import en from "@/i18n/en";
import { formatBytes } from "@/lib/fileValidation";
import {
  ADMIN_STATUSES,
  adminApi,
  formatDate,
  isNotFound,
  STATUS_LABELS,
  type AdminStatus,
  type InquiryDetail as Inquiry,
  type InquiryFile,
} from "./api";
import StatusBadge from "./StatusBadge";

const RETENTION_DAYS = 90;
// Presigned links last 5 minutes; refresh a little before they expire.
const LINK_REFRESH_MS = 4 * 60 * 1000;

const SERVICE_LABELS: Record<Inquiry["serviceType"], string> = {
  electricity: en.form.serviceTypeElectricity,
  gas: en.form.serviceTypeGas,
  both: en.form.serviceTypeBoth,
};
const LANGUAGE_LABELS = { en: "English", es: "Spanish" } as const;

function BackLink() {
  return (
    <Link
      to="/admin"
      className="inline-flex items-center gap-1 rounded-sm text-sm font-medium text-muted-foreground hover:text-foreground"
    >
      <ChevronLeft className="h-4 w-4" aria-hidden="true" />
      All inquiries
    </Link>
  );
}

/**
 * Documents render straight from S3's domain (img / the browser's PDF viewer
 * in an iframe), so a malicious file runs on S3's origin, never ours.
 */
function Document({ file }: { file: InquiryFile }) {
  return (
    <li className="overflow-hidden rounded-lg border border-border bg-card shadow-card">
      <div className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">{file.name}</p>
          <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
        </div>
        {file.available && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <a href={file.viewUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink aria-hidden="true" />
                Open
              </a>
            </Button>
            <Button size="sm" asChild>
              <a href={file.downloadUrl} rel="noopener noreferrer">
                <Download aria-hidden="true" />
                Download
              </a>
            </Button>
          </div>
        )}
      </div>
      {!file.available ? (
        <p className="flex items-center gap-2 px-4 py-6 text-sm text-muted-foreground">
          <FileX className="h-4 w-4" aria-hidden="true" />
          This file has expired and was deleted automatically.
        </p>
      ) : file.type === "application/pdf" ? (
        <iframe src={file.viewUrl} title={file.name} className="h-[70vh] w-full bg-muted" />
      ) : (
        <img src={file.viewUrl} alt={file.name} className="max-h-[70vh] w-full bg-muted object-contain" />
      )}
    </li>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-1 break-words text-sm text-foreground">{children}</dd>
    </div>
  );
}

const InquiryDetail = () => {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const inquiry = useQuery({
    queryKey: ["inquiry", id],
    queryFn: () => adminApi.get(id),
    refetchInterval: LINK_REFRESH_MS,
  });

  const changeStatus = useMutation({
    mutationFn: (status: AdminStatus) => adminApi.setStatus(id, status),
    onSuccess: (_, status) => {
      toast.success(`Marked as ${STATUS_LABELS[status]}`);
      void queryClient.invalidateQueries({ queryKey: ["inquiry", id] });
      void queryClient.invalidateQueries({ queryKey: ["inquiries"] });
    },
    onError: () => toast.error("Could not change the status. Try again."),
  });

  const remove = useMutation({
    mutationFn: () => adminApi.remove(id),
    onSuccess: () => {
      toast.success("Inquiry deleted");
      queryClient.removeQueries({ queryKey: ["inquiry", id] });
      void queryClient.invalidateQueries({ queryKey: ["inquiries"] });
      navigate("/admin");
    },
    onError: () => toast.error("Could not delete the inquiry. Try again."),
  });

  if (inquiry.isPending) {
    return (
      <div className="flex justify-center p-10">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-label="Loading" />
      </div>
    );
  }

  if (inquiry.isError) {
    return (
      <div className="mx-auto max-w-5xl">
        <BackLink />
        <p role="alert" className="mt-6 text-sm text-foreground">
          {isNotFound(inquiry.error)
            ? `This inquiry no longer exists. It was deleted, or removed automatically ${RETENTION_DAYS} days after it arrived.`
            : "Could not load this inquiry. Refresh the page to try again."}
        </p>
      </div>
    );
  }

  const data = inquiry.data;
  const deletesOn = new Date(Date.parse(data.createdAt) + RETENTION_DAYS * 86_400_000).toISOString();
  const f = en.form;

  return (
    <div className="mx-auto max-w-5xl">
      <BackLink />

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold text-primary">{data.businessName}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Received {formatDate(data.createdAt)} · <StatusBadge status={data.status} />
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={data.status}
            onValueChange={(value) => changeStatus.mutate(value as AdminStatus)}
            disabled={changeStatus.isPending}
          >
            <SelectTrigger className="w-40" aria-label="Status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ADMIN_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {STATUS_LABELS[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" disabled={remove.isPending} aria-label="Delete inquiry">
                <Trash2 aria-hidden="true" />
                <span className="hidden sm:inline">Delete</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this inquiry?</AlertDialogTitle>
                <AlertDialogDescription>
                  This permanently deletes the inquiry from {data.businessName}
                  {data.files.length > 0 &&
                    ` and its ${data.files.length} ${data.files.length === 1 ? "file" : "files"}`}
                  . This can't be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => remove.mutate()}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <dl className="mt-6 grid gap-5 rounded-lg border border-border bg-card p-5 shadow-card sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Contact">
          {data.firstName} {data.lastName}
        </Field>
        <Field label={f.email}>
          <a href={`mailto:${data.email}`} className="text-accent-strong hover:underline">
            {data.email}
          </a>
        </Field>
        <Field label={f.phone}>
          <a href={`tel:${data.phone.replace(/[^\d+]/g, "")}`} className="text-accent-strong hover:underline">
            {data.phone}
          </a>
        </Field>
        <Field label={f.businessLocation}>{data.businessLocation}</Field>
        <Field label={f.locationCount}>{data.locationCount}</Field>
        <Field label="Service">{SERVICE_LABELS[data.serviceType]}</Field>
        <Field label={f.preferredLanguage}>{LANGUAGE_LABELS[data.preferredLanguage]}</Field>
        <Field label="Form language">{LANGUAGE_LABELS[data.submittedLocale]}</Field>
        {data.campaign && <Field label="Campaign">{data.campaign}</Field>}
        <Field label="Deleted automatically">{formatDate(deletesOn)}</Field>
        {data.notes && (
          <div className="sm:col-span-2 lg:col-span-3">
            <Field label={f.notes}>
              <span className="whitespace-pre-wrap">{data.notes}</span>
            </Field>
          </div>
        )}
      </dl>

      <h2 className="mt-8 font-display text-lg font-semibold text-primary">
        Documents ({data.files.length})
      </h2>
      {data.files.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">No bills were attached.</p>
      ) : (
        <ul className="mt-3 space-y-5">
          {data.files.map((file, index) => (
            <Document key={`${file.name}-${index}`} file={file} />
          ))}
        </ul>
      )}
    </div>
  );
};

export default InquiryDetail;
