"use client";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="ms-container pt-12">
      <h1 className="text-h1 text-fg">A simulação não carregou</h1>
      <p className="mt-3 max-w-measure text-body text-fg-secondary">
        Algo falhou ao montar a página. Tente de novo; se continuar, recarregue o navegador.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 inline-flex min-h-control items-center rounded-control bg-accent px-4 text-small font-semibold text-fg-on-accent hover:bg-accent-hover"
      >
        Tentar novamente
      </button>
    </div>
  );
}
