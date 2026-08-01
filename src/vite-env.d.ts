/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * HTTPS endpoint that accepts the lead form as `multipart/form-data`.
   * Unset in this repository — the form renders its "not available yet"
   * state until a backend exists. See docs/backend-requirements.md.
   */
  readonly VITE_LEAD_ENDPOINT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
