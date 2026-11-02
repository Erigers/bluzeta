"use client";

export function ConfirmAction({
  action,
  label,
  confirm,
  className,
}: {
  action: () => Promise<unknown>;
  label: string;
  confirm: string;
  className?: string;
}) {
  return (
    <form
      action={async () => {
        await action();
      }}
      onSubmit={(event) => {
        if (!window.confirm(confirm)) event.preventDefault();
      }}
    >
      <button type="submit" className={className}>
        {label}
      </button>
    </form>
  );
}
