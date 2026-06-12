interface ConnectionBannerProps {
  error?: string;
  connected: boolean;
  awServerUrl: string;
  loadedAt?: Date;
  onRetry: () => void;
}

export function ConnectionBanner({ error, connected, awServerUrl, loadedAt, onRetry }: ConnectionBannerProps) {
  if (connected && !error) {
    return (
      <div className="connection-banner connected">
        <span>Connected to ActivityWatch</span>
        <small>{awServerUrl} · refreshed {loadedAt?.toLocaleTimeString() ?? "now"}</small>
      </div>
    );
  }

  return (
    <div className="connection-banner disconnected">
      <div>
        <strong>ActivityWatch is not reachable</strong>
        <p>Start ActivityWatch, confirm it opens at {awServerUrl}, then refresh Fotion.</p>
        {error ? <code>{error}</code> : null}
      </div>
      <button type="button" onClick={onRetry}>
        Retry
      </button>
    </div>
  );
}
