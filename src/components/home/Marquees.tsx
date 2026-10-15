// A band of words sliding by, in the serif italic.
export function WordMarquee({ words }: { words: string[] }) {
  if (words.length === 0) return null;
  const run = (hidden: boolean) => (
    <ul aria-hidden={hidden} className="flex shrink-0 items-center">
      {words.map((word, i) => (
        <li key={i} className="flex items-center">
          <span className="px-6 font-serif text-4xl whitespace-nowrap italic sm:text-6xl">
            {word}
          </span>
          <span aria-hidden className="text-xl text-primary">✦</span>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="marquee overflow-hidden border-y border-line py-6 sm:py-8">
      <div className="marquee-track" style={{ ["--marquee-duration" as string]: "35s" }}>
        {run(false)}
        {run(true)}
      </div>
    </div>
  );
}
