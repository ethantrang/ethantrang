const writings = [
  {
    title: "So I'm starting over",
    url: "https://ethantrangg.medium.com/so-im-starting-over-1873e4956631",
    description: "My first year of entrepreneurship wrapped up.",
  },
];

export function WritingsSection() {
  return (
    <section className="flex min-h-0 flex-col print-force-new-page scroll-mb-16 sm:mb-16">
      <h2 className="mb-2 text-sm font-semibold">Writings</h2>
      <div className="-mx-3 flex flex-col">
        {writings.map((writing) => (
          <div
            key={writing.title}
            className="rounded-lg bg-card text-card-foreground flex flex-col overflow-hidden border-b border-t border-dashed p-3"
          >
            <div className="flex flex-col space-y-1.5">
              <div className="space-y-1">
                x3
                <h3 className="tracking-tight text-helvatica text-sm font-normal">
                  {writing.url ? (
                    <a
                      href={writing.url}
                      className="inline-flex items-center gap-1"
                    >
                      {writing.title}
                    </a>
                  ) : (
                    writing.title
                  )}
                </h3>
                <div className="font-helvatica hidden text-xs print:visible">
                  {writing.url}
                </div>
                <p className="text-muted-foreground font-helvatica text-xs">
                  {writing.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
