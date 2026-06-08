type ErrorNoticeProps = {
  title?: string;
  message: string;
};

export function ErrorNotice({ title = "데이터 수신이 지연되고 있습니다", message }: ErrorNoticeProps) {
  return (
    <div className="rounded-2xl border border-red-400/30 bg-red-950/40 p-4 text-sm text-red-100">
      <p className="font-semibold">{title}</p>
      <p className="mt-1 text-red-100/80">{message}</p>
      <p className="mt-2 text-red-100/70">가능한 경우 마지막으로 성공한 데이터를 계속 표시합니다.</p>
    </div>
  );
}
