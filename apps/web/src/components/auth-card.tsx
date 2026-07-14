type Props = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

export function AuthCard({ title, subtitle, children }: Props) {
  return (
    <div className="w-full max-w-md rounded-2xl border border-white/55 bg-surface/86 p-6 shadow-2xl backdrop-blur-xl md:p-8 dark:border-white/10 dark:bg-surface/88">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-fg">{title}</h1>
        <p className="text-sm text-fg-soft mt-1">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}
