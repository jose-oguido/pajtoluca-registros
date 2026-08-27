import { SignOut } from "@phosphor-icons/react/dist/ssr";
import { logout } from "@/app/admin/login/actions";

export function LogoutButton() {
  return (
    <form action={logout}>
      <button
        type="submit"
        className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold uppercase tracking-wide hover:bg-surface-muted"
      >
        <SignOut size={16} weight="regular" />
        Cerrar sesión
      </button>
    </form>
  );
}
