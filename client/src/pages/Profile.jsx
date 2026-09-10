// Functional placeholder: there is no Profile screen in the Penpot design yet.
// Replace this once the screen has been designed.
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import IconSignOut from '../assets/icons/sign-out.svg?react';
import IconDelete from '../assets/icons/delete.svg?react';

export default function Profile() {
  const { user, logout } = useAuth();

  const displayName = user?.display_name || 'Unknown user';
  const email = user?.email || '—';
  const initials =
    displayName
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || '?';

  function handleDeleteAccount() {
    // No account-deletion endpoint exists yet (users.routes.js exposes only
    // GET/PATCH /users/me). Wire the real request here once the backend adds one.
    window.alert('Account deletion isn’t available yet.');
  }

  return (
    <div className="h-full min-h-0 overflow-y-auto bg-white px-4 pt-7">
      <div className="max-w-[640px]">
        <h1 className="text-xl font-bold leading-6 tracking-[-0.01em]">Profile</h1>

        <section className="mt-8 flex items-center gap-4">
          {user?.avatar_url ? (
            <img
              src={user.avatar_url}
              alt=""
              className="h-16 w-16 rounded-full object-cover"
            />
          ) : (
            <div className="grid h-16 w-16 place-items-center rounded-full bg-canvas text-base font-semibold text-muted">
              {initials}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-base font-semibold text-ink">{displayName}</p>
            <p className="mt-1 text-sm text-muted">{email}</p>
          </div>
        </section>

        <section className="mt-8">
          <Button variant="secondary" onClick={logout} className="gap-2">
            <IconSignOut className="h-5 w-5" />
            Log out
          </Button>
        </section>

        <section className="mt-12 border-t border-line pt-8">
          <h2 className="text-base font-bold leading-5 text-error">Danger zone</h2>
          <p className="mt-2 text-sm text-muted">
            Deleting your account is permanent and can’t be undone.
          </p>
          <button
            type="button"
            onClick={handleDeleteAccount}
            className="mt-4 inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-error px-4 text-sm font-semibold text-error transition-colors hover:bg-error hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error/30"
          >
            <IconDelete className="h-5 w-5" />
            Delete account
          </button>
        </section>
      </div>
    </div>
  );
}
