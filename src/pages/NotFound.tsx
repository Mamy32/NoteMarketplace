import { EmptyState } from '../components/ui';
import { Link } from '../lib/router';

export function NotFound() {
  return (
    <main id="main" tabIndex={-1} className="container-page py-20">
      <EmptyState
        title="We couldn't find that page"
        icon="compass"
        action={
          <>
            <Link to="/" className="btn btn-primary">Go home</Link>
            <Link to="/explore" className="btn btn-outline">Explore notes</Link>
          </>
        }
      >
        The link may be old, or the note may have been removed from this demo.
      </EmptyState>
    </main>
  );
}
