import { useLocation } from 'react-router-dom';
import Button from '../components/Button';

/** Fallback for any URL that does not match a route. */
export default function NotFoundPage() {
  const { pathname } = useLocation();

  return (
    <section className="px-4 py-12 md:px-16 md:py-20">
      <div className="mx-auto flex max-w-[47.5rem] flex-col items-center text-center">
        <span
          className="stamp ui inline-block -rotate-2 rounded-[10px] border-[3px] border-ink bg-pink px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] shadow-hard"
          style={{ '--i': 1 }}
        >
          Error 404
        </span>

        <h1
          className="stamp mt-6 text-[4.5rem] leading-none md:text-[7rem]"
          style={{ '--i': 2 }}
        >
          4<span className="text-pink">0</span>4
        </h1>

        <h2
          className="stamp mt-4 text-2xl leading-8 md:text-[2rem] md:leading-10"
          style={{ '--i': 3 }}
        >
          This page got lost.
        </h2>

        <p
          className="stamp mt-3 max-w-[34rem] text-sm leading-6 text-mute md:text-base md:leading-7"
          style={{ '--i': 4 }}
        >
          We looked through every corner of Pacil, but nothing lives at this
          address. Double-check the link, or head back to somewhere familiar.
        </p>

        <p
          className="stamp mt-6 max-w-full truncate rounded-[10px] border-[3px] border-ink bg-white px-4 py-2 font-mono text-xs text-mute shadow-hard md:text-sm"
          style={{ '--i': 5 }}
          title={pathname}
        >
          {pathname}
        </p>

        <div
          className="stamp mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row"
          style={{ '--i': 6 }}
        >
          <Button to="/">Back to homepage</Button>
          <Button to="/reports" variant="outline">
            Browse reports
          </Button>
        </div>
      </div>
    </section>
  );
}
