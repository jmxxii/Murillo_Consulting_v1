import { useCallback, useId, useRef, useState } from "react";
import { FileText, Image as ImageIcon, Upload, X } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/i18n/LanguageProvider";
import { track } from "@/lib/analytics";
import {
  ACCEPT_ATTRIBUTE,
  fileExtension,
  formatBytes,
  MAX_FILE_BYTES,
  MAX_FILES,
  sanitizeFileName,
  validateFiles,
  type FileRejection,
} from "@/lib/fileValidation";
import { cn } from "@/lib/utils";

interface FileDropzoneProps {
  files: File[];
  onChange: (files: File[]) => void;
  /** 0–100 while a submission is in flight, null otherwise. */
  uploadProgress: number | null;
  disabled?: boolean;
}

/**
 * Bill upload control.
 *
 * Keyboard and pointer reach the same native `<input type="file">`; the
 * drop target is a decorative enhancement layered on top, so drag-and-drop
 * being unavailable never blocks anyone. Rejections are announced through a
 * live region rather than only shown in red, so the reason is available to
 * screen-reader users and is not communicated by color alone.
 */
const FileDropzone = ({
  files,
  onChange,
  uploadProgress,
  disabled = false,
}: FileDropzoneProps) => {
  const { t, format } = useLanguage();
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();
  const hintId = `${inputId}-hint`;
  const [dragging, setDragging] = useState(false);
  const [rejections, setRejections] = useState<FileRejection[]>([]);

  const rejectionMessage = useCallback(
    (rejection: FileRejection): string => {
      const e = t.form.errors;
      const values = {
        name: rejection.fileName,
        maxSize: formatBytes(MAX_FILE_BYTES),
        maxFiles: MAX_FILES,
      };
      switch (rejection.reason) {
        case "too-large":
          return format(e.fileTooLarge, values);
        case "wrong-type":
          return format(e.fileWrongType, values);
        case "content-mismatch":
          return format(e.fileContentMismatch, values);
        case "empty":
          return format(e.fileEmpty, values);
        case "too-many":
          return format(e.tooManyFiles, values);
      }
    },
    [format, t.form.errors],
  );

  const addFiles = useCallback(
    async (incoming: FileList | File[] | null) => {
      if (!incoming || disabled) return;
      const list = Array.from(incoming);
      if (list.length === 0) return;

      const { accepted, rejections: rejected } = await validateFiles(list, files);
      setRejections(rejected);

      if (accepted.length > 0) {
        // File count only — never filenames or contents.
        track({ name: "bill_upload_start", file_count: accepted.length });
        onChange([...files, ...accepted]);
      }
    },
    [disabled, files, onChange],
  );

  const removeFile = (index: number) => {
    onChange(files.filter((_, i) => i !== index));
    setRejections([]);
  };

  const isUploading = uploadProgress !== null;

  return (
    <div>
      <label
        htmlFor={inputId}
        className="mb-2 block text-sm font-medium text-foreground"
      >
        {t.form.upload.label}
        <span className="ml-1.5 text-xs font-normal text-muted-foreground">
          ({t.common.optional})
        </span>
      </label>

      <div
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          void addFiles(event.dataTransfer.files);
        }}
        className={cn(
          "rounded-lg border-2 border-dashed p-6 text-center transition-colors",
          dragging
            ? "border-accent-strong bg-accent-subtle"
            : "border-input bg-background hover:border-secondary/60",
          disabled && "cursor-not-allowed opacity-60",
        )}
      >
        <Upload
          className="mx-auto h-7 w-7 text-muted-foreground"
          aria-hidden="true"
        />
        <p className="mt-3 text-sm text-muted-foreground">
          <span className="hidden sm:inline">{t.form.upload.dropzone} </span>
          <button
            type="button"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
            className="rounded-sm font-semibold text-accent-strong underline underline-offset-4 hover:text-accent-strong-hover disabled:cursor-not-allowed"
          >
            {t.form.upload.browse}
          </button>
        </p>
        <p id={hintId} className="mt-2 text-xs text-muted-foreground">
          {format(t.form.upload.hint, {
            maxSize: formatBytes(MAX_FILE_BYTES),
            maxFiles: MAX_FILES,
          })}
        </p>

        <input
          ref={inputRef}
          id={inputId}
          type="file"
          multiple
          accept={ACCEPT_ATTRIBUTE}
          disabled={disabled}
          aria-describedby={hintId}
          className="sr-only"
          onChange={(event) => {
            void addFiles(event.target.files);
            // Reset so re-selecting the same file still fires a change event.
            event.target.value = "";
          }}
        />
      </div>

      {/* Rejections — announced, and each carries an icon + text, not just color. */}
      <div role="alert" aria-live="polite">
        {rejections.length > 0 && (
          <ul className="mt-3 space-y-1.5">
            {rejections.map((rejection, index) => (
              <li
                key={`${rejection.fileName}-${index}`}
                className="flex items-start gap-2 rounded-md bg-destructive-subtle px-3 py-2 text-xs text-destructive"
              >
                <X className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>{rejectionMessage(rejection)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {files.length > 0 && (
        <div className="mt-4">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t.form.upload.selectedFiles} ({files.length}/{MAX_FILES})
          </h4>
          <ul className="mt-2 space-y-2">
            {files.map((file, index) => {
              const displayName = sanitizeFileName(file.name);
              const isPdf = fileExtension(file.name) === "pdf";
              const Icon = isPdf ? FileText : ImageIcon;
              return (
                <li
                  key={`${displayName}-${file.size}-${index}`}
                  className="flex items-center gap-3 rounded-md border border-border bg-card px-3 py-2.5"
                >
                  <Icon
                    className="h-4 w-4 shrink-0 text-secondary"
                    aria-hidden="true"
                  />
                  <span className="min-w-0 flex-1 truncate text-sm text-foreground">
                    {displayName}
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatBytes(file.size)}
                  </span>
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => removeFile(index)}
                    aria-label={format(t.form.upload.remove, { name: displayName })}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-destructive disabled:cursor-not-allowed"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {isUploading && (
        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
            <span>{t.form.upload.progress}</span>
            <span aria-hidden="true">{uploadProgress}%</span>
          </div>
          <Progress
            value={uploadProgress}
            aria-label={t.form.upload.uploadingLabel}
            className="h-2"
          />
        </div>
      )}

      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
        {t.form.upload.helpText}
      </p>
    </div>
  );
};

export default FileDropzone;
