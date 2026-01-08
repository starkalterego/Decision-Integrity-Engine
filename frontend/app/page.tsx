export default function Home() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-semibold text-neutral-900">Decision Integrity Engine</h1>
          <p className="text-sm text-neutral-600 mt-1">Portfolio Decision Platform</p>
        </div>
      </header>

      <main className="page-container">
        <div className="card max-w-2xl mx-auto mt-12">
          <h2 className="text-xl font-semibold mb-4">Welcome</h2>
          <p className="text-neutral-700 mb-6">
            A governance-first portfolio decision platform that enforces clarity, exposes trade-offs,
            and prevents bad initiatives from being approved.
          </p>

          <div className="space-y-3">
            <a
              href="/portfolio/demo/setup"
              className="btn btn-primary block text-center"
            >
              Create Portfolio
            </a>
            <a
              href="/portfolio/demo/initiatives"
              className="btn btn-secondary block text-center"
            >
              View Demo Portfolio
            </a>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-3 gap-6">
          <div className="card">
            <h3 className="font-semibold mb-2">Governance First</h3>
            <p className="text-sm text-neutral-600">
              Backend enforcement only. If logic is not enforced server-side, it does not exist.
            </p>
          </div>

          <div className="card">
            <h3 className="font-semibold mb-2">Binary Status</h3>
            <p className="text-sm text-neutral-600">
              Only GREEN or RED indicators. No amber states. Decisions are explicit.
            </p>
          </div>

          <div className="card">
            <h3 className="font-semibold mb-2">Full Audit Trail</h3>
            <p className="text-sm text-neutral-600">
              Every override, approval, and termination is logged immutably.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
