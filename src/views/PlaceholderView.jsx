export default function PlaceholderView({ title, description }) {
  return (
    <section className="rounded-[var(--radius-glass)] border border-[color-mix(in_srgb,var(--cortex-sidebar-border)_55%,transparent)] bg-[color-mix(in_srgb,var(--cortex-bg)_62%,transparent)] p-8 backdrop-blur-xl">
      <h1 className="text-2xl font-semibold tracking-tight text-[var(--cortex-text)]">
        {title}
      </h1>
      <p className="mt-3 max-w-prose text-sm leading-relaxed text-[color-mix(in_srgb,var(--cortex-text)_68%,transparent)]">
        {description}
      </p>
    </section>
  );
}
