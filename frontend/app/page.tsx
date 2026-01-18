export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-neutral-50 to-neutral-100">
      {/* Hero Section */}
      <header className="bg-white border-b border-neutral-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">Decision Integrity Engine</h1>
              <p className="text-sm text-neutral-500 mt-1 font-medium">Portfolio Decision Platform</p>
            </div>
            <div className="flex gap-3">
              <a
                href="/portfolio/demo/initiatives"
                className="px-4 py-2 text-sm font-medium text-neutral-700 hover:text-neutral-900 transition-colors"
              >
                View Demo
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-16">
        {/* Welcome Card */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-4xl font-bold text-neutral-900 mb-4 tracking-tight">
            Governance-First Portfolio Decisions
          </h2>
          <p className="text-lg text-neutral-600 leading-relaxed mb-8">
            A portfolio decision platform that enforces clarity, exposes trade-offs,
            and prevents bad initiatives from being approved through backend governance rules.
          </p>

          <div className="flex gap-4 justify-center">
            <a
              href="/portfolio/demo/setup"
              className="px-8 py-3 bg-neutral-900 text-white font-semibold rounded-lg hover:bg-neutral-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Create Portfolio
            </a>
            <a
              href="/portfolio/demo/initiatives"
              className="px-8 py-3 bg-white text-neutral-900 font-semibold rounded-lg border-2 border-neutral-200 hover:border-neutral-300 transition-all hover:shadow-md"
            >
              Explore Demo
            </a>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Governance First */}
          <div className="bg-white rounded-xl p-8 border border-neutral-200 hover:border-neutral-300 transition-all hover:shadow-lg group">
            <div className="w-12 h-12 bg-neutral-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-neutral-900 transition-colors">
              <div className="w-6 h-6 border-2 border-neutral-900 rounded group-hover:border-white transition-colors"></div>
            </div>
            <h3 className="text-xl font-bold text-neutral-900 mb-3">Governance First</h3>
            <p className="text-neutral-600 leading-relaxed">
              Backend enforcement only. If logic is not enforced server-side, it does not exist.
            </p>
          </div>

          {/* Binary Status */}
          <div className="bg-white rounded-xl p-8 border border-neutral-200 hover:border-neutral-300 transition-all hover:shadow-lg group">
            <div className="w-12 h-12 bg-neutral-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-neutral-900 transition-colors">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 bg-status-green rounded-full"></div>
                <div className="w-2.5 h-2.5 bg-status-red rounded-full"></div>
              </div>
            </div>
            <h3 className="text-xl font-bold text-neutral-900 mb-3">Binary Status</h3>
            <p className="text-neutral-600 leading-relaxed">
              Only GREEN or RED indicators. No amber states. Decisions are explicit.
            </p>
          </div>

          {/* Full Audit Trail */}
          <div className="bg-white rounded-xl p-8 border border-neutral-200 hover:border-neutral-300 transition-all hover:shadow-lg group">
            <div className="w-12 h-12 bg-neutral-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-neutral-900 transition-colors">
              <div className="space-y-1">
                <div className="w-6 h-0.5 bg-neutral-900 group-hover:bg-white transition-colors"></div>
                <div className="w-4 h-0.5 bg-neutral-900 group-hover:bg-white transition-colors"></div>
                <div className="w-5 h-0.5 bg-neutral-900 group-hover:bg-white transition-colors"></div>
              </div>
            </div>
            <h3 className="text-xl font-bold text-neutral-900 mb-3">Full Audit Trail</h3>
            <p className="text-neutral-600 leading-relaxed">
              Every override, approval, and termination is logged immutably.
            </p>
          </div>
        </div>

        {/* Key Principles */}
        <div className="mt-20 max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-neutral-900 text-center mb-10">Core Principles</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg p-6 border border-neutral-200">
              <div className="flex items-start gap-4">
                <div className="w-2 h-2 bg-neutral-900 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h4 className="font-semibold text-neutral-900 mb-2">Explicit Trade-Offs</h4>
                  <p className="text-sm text-neutral-600">
                    Every decision exposes what you gain and what you sacrifice
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-6 border border-neutral-200">
              <div className="flex items-start gap-4">
                <div className="w-2 h-2 bg-neutral-900 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h4 className="font-semibold text-neutral-900 mb-2">Scenario Planning</h4>
                  <p className="text-sm text-neutral-600">
                    Compare multiple portfolio configurations before committing
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-6 border border-neutral-200">
              <div className="flex items-start gap-4">
                <div className="w-2 h-2 bg-neutral-900 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h4 className="font-semibold text-neutral-900 mb-2">Capacity Constraints</h4>
                  <p className="text-sm text-neutral-600">
                    Hard limits on budget and capacity prevent over-commitment
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-6 border border-neutral-200">
              <div className="flex items-start gap-4">
                <div className="w-2 h-2 bg-neutral-900 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h4 className="font-semibold text-neutral-900 mb-2">Executive Output</h4>
                  <p className="text-sm text-neutral-600">
                    Board-ready one-pager with decision ask and key metrics
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-20 text-center">
          <p className="text-sm text-neutral-500">
            Built for portfolio leaders who demand clarity and accountability
          </p>
        </div>
      </main>
    </div>
  );
}
