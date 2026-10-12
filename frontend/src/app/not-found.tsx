import Link from "next/link";

export default function NotFound() {
  return (
    <div className="ms-container pt-12">
      <h1 className="text-h1 text-fg">Página não encontrada</h1>
      <p className="mt-3 max-w-measure text-body text-fg-secondary">
        O endereço não existe neste simulador. Volte para a simulação para ajustar um cenário.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex min-h-control items-center rounded-control bg-accent px-4 text-small font-semibold text-fg-on-accent no-underline hover:bg-accent-hover"
      >
        Voltar para a simulação
      </Link>
    </div>
  );
}
