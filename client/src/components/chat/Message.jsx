export default function Message({ variant = 'default', author, timestamp, content, attachments }) {
  const textClassName = `text-body [overflow-wrap:anywhere] ${
    variant === 'mention' ? 'text-brand' : 'text-ink'
  }`;

  return (
    <article className="flex items-start gap-3 md:gap-4">
      <div className="h-8 w-8 shrink-0 rounded-full bg-line md:h-10 md:w-10" aria-hidden="true" />
      <div className="flex min-w-0 flex-1 flex-col gap-2.5">
        <div className="flex items-baseline">
          <span className="w-[98px] shrink-0 truncate text-label text-ink">{author}</span>
          <time className="text-metadata text-muted">{timestamp}</time>
        </div>

        {/* Empty content would still render a <p>, eating a gap-2.5 slot
            (visible as extra space above a file card with no message text). */}
        {content && <p className={textClassName}>{content}</p>}

        {/* Design only shows a single attachment card; stacking multiple is an
            interim decision pending a design answer for the multi-attachment case. */}
        {variant === 'file-attachment' &&
          attachments?.map((attachment) => (
            <div
              key={attachment.id ?? attachment.filename}
              className="flex h-[38px] w-full max-w-[320px] items-center rounded-lg border border-line bg-canvas px-3"
            >
              <p className="truncate text-metadata text-ink">{attachment.filename}</p>
            </div>
          ))}
      </div>
    </article>
  );
}
