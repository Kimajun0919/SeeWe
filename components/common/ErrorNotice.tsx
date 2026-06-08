type ErrorNoticeProps = {
  title?: string;
  message: string;
};

export function ErrorNotice({ title = "Data reception delayed", message }: ErrorNoticeProps) {
  return (
    <div className="rounded-2xl border border-red-400/30 bg-red-950/40 p-4 text-sm text-red-100">
      <p className="font-semibold">{title}</p>
      <p className="mt-1 text-red-100/80">{message}</p>
      <p className="mt-2 text-red-100/70">Displaying previous data when available.</p>
    </div>
  );
}
