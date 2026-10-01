import { CalculatorForm } from "@/components/CalculatorForm";
import { ThemeToggle } from "@/components/ThemeToggle";
import { VisitorCounter } from "@/components/VisitorCounter";

export default function Home() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 py-8">
      <header className="mb-6">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-xl font-bold text-primary">
            Revenus et niveau de vie
          </h1>
          <ThemeToggle />
        </div>
        <p className="mt-1.5 text-sm leading-relaxed text-secondary">
          Les revenus recalculés en niveau de vie pour les rendre comparables,
          tenant compte de la composition du ménage.
        </p>
      </header>

      <main className="flex-1">
        <CalculatorForm />
      </main>

      <footer className="mt-8 flex flex-col gap-2 border-t border-border pt-5 text-xs text-secondary">
        <p>
          Seuils calculés par l&apos;Insee sur les revenus déclarés en France.
          Aucune donnée saisie ici n&apos;est enregistrée ni transmise.
        </p>
        <VisitorCounter />
      </footer>
    </div>
  );
}
