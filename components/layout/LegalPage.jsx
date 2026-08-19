// Shared shell for the privacy and cookie pages. Both used to render a flat
// run of <p> tags prefixed with a decorative dash, which gave the reader no
// structure to scan and gave a crawler no headings to index.
const LegalPage = ({ title, intro, sections }) => (
  <div className="site-section pt-32 pb-24 sm:pt-40">
    <div className="container">
      <header className="max-w-3xl border-b border-line pb-10">
        <span className="section-kicker">Myriad Tech / Legal</span>
        <h1 className="section-title mt-4">{title}</h1>
        {intro ? <p className="section-copy mt-6">{intro}</p> : null}
      </header>

      <div className="mt-14 grid gap-12 lg:grid-cols-[minmax(0,16rem)_minmax(0,1fr)] lg:gap-16">
        <nav aria-label={title} className="h-fit lg:sticky lg:top-28">
          <ol className="space-y-3 text-sm">
            {sections.map((section, index) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="focus-ring footer-link flex gap-3 text-black/65 hover:text-accent"
                >
                  <span className="text-accent tabular-nums">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {section.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="min-w-0 max-w-3xl space-y-14">
          {sections.map((section) => (
            <section
              key={section.id}
              id={section.id}
              aria-labelledby={`${section.id}-title`}
              className="scroll-mt-28"
            >
              <h2
                id={`${section.id}-title`}
                className="font-recursive text-2xl"
              >
                {section.title}
              </h2>
              <div className="editorial-rule mt-4 mb-6" />

              {section.paragraphs ? (
                <div className="space-y-5">
                  {section.paragraphs.map((paragraph, index) => (
                    <p key={index} className="leading-8 text-black/75">
                      {paragraph}
                    </p>
                  ))}
                </div>
              ) : null}

              {section.list ? (
                <ol className="mt-2 space-y-4">
                  {section.list.map((item, index) => (
                    <li
                      key={index}
                      className="border-l-2 border-line pl-5 leading-8 text-black/75"
                    >
                      {item}
                    </li>
                  ))}
                </ol>
              ) : null}
            </section>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default LegalPage;
