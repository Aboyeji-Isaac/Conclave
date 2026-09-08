export default function Message({ variant = 'default', author, timestamp, content, attachmentName }) {
  const textClassName = `text-body [overflow-wrap:anywhere] ${
    variant === 'mention' ? 'text-brand' : 'text-ink'
  }`;

  return (
    <article className="flex items-start gap-3 md:gap-4">
      <div className="h-8 w-8 shrink-0 rounded-full bg-line md:h-10 md:w-10" aria-hidden="true" />
      <div className="flex min-w-0 flex-1 flex-col gap-2.5">
        <div className="flex items-baseline">
          <span className="w-[94px] shrink-0 truncate text-label text-ink">{author}</span>
          <time className="text-metadata text-muted">{timestamp}</time>
        </div>

        <p className={textClassName}>{content}</p>

        {variant === 'file-attachment' && (
          <div className="flex h-[38px] w-full max-w-[320px] items-center rounded-lg border border-line bg-canvas px-3">
            <p className="truncate text-metadata text-ink">{attachmentName}</p>
          </div>
        )}
      </div>
    </article>
  );
}
