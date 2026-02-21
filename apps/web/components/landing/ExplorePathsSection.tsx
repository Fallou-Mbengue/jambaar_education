'use client';

const TAGS = [
  'Commerciale',
  'Gestion',
  'Marketing Digitale',
  'Développement Web',
  'Data Science',
  'Langues',
  'Design',
  'Finance',
  'Comptabilité',
];

export function ExplorePathsSection() {
  return (
    <section className="py-16 lg:py-20 bg-white landing-section" id="parcours">
      <div className="landing-container">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1E1E1E] mb-4">
            Explorer nos parcours
          </h2>
          <p className="text-base text-gray-600 leading-relaxed">
            Découvrez nos parcours de formations adaptés à vos objectifs et besoins.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          {TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              className="px-5 py-2.5 rounded-full border-2 border-gray-300 text-gray-700 text-sm font-medium hover:border-landing-orange hover:text-landing-orange hover:bg-orange-50/50 transition-colors"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
