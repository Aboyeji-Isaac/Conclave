import { Link } from 'react-router-dom';

export default function AuthLayout({ title, description, alternateText, alternateLink, alternateLabel, children }) {
  return <main className="relative grid min-h-screen place-items-center bg-canvas px-5 py-24"><Link to="/" className="absolute left-6 top-7 text-h2 text-brand md:left-12">CONCLAVE</Link><section className="w-full max-w-[440px] rounded-xl border border-line bg-surface p-8"><h1 className="text-h1 text-ink">{title}</h1><p className="mt-2 text-body text-muted">{description}</p><div className="mt-8">{children}</div>{alternateText && <div className="mt-7 border-t border-line pt-7 text-sm text-muted"><span>{alternateText}</span>{alternateLink && <>{' '}<Link className="font-semibold text-brand hover:underline" to={alternateLink}>{alternateLabel}</Link></>}</div>}</section></main>;
}
