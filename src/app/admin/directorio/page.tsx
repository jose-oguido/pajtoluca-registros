import type { Metadata } from "next";
import { CaretDown, Plus, Trash } from "@phosphor-icons/react/dist/ssr";
import { getDirectory } from "@/lib/directory";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { eventConfig } from "@/lib/event-config";
import { requireAdminSession } from "@/lib/auth";
import {
  createDecanatoAction,
  createParishAction,
  deleteDecanatoAction,
  deleteParishAction,
  updateDecanatoAction,
  updateParishAction,
} from "./actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Directorio · ${eventConfig.name}`,
};

const fieldClass =
  "w-full rounded-[12px] border border-border bg-surface px-3 py-2 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent sm:text-sm";

const labelClass = "mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground";

export default async function DirectorioPage() {
  await requireAdminSession();
  const directory = getDirectory();

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
        <AdminHeader />

        <p className="max-w-[65ch] text-sm text-muted-foreground">
          Administra los decanatos, sus coordinadores y las parroquias que aparecen en el
          formulario de registro. Los cambios se reflejan de inmediato en el sitio público.
        </p>

        <div className="mt-6 rounded-[20px] border border-border bg-surface p-4 shadow-lg shadow-secondary/5 sm:mt-8 sm:p-6">
          <h2 className="font-display text-lg font-bold uppercase tracking-tight">
            Agregar decanato
          </h2>
          <form action={createDecanatoAction} className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className={labelClass} htmlFor="new-decanato-name">
                Nombre
              </label>
              <input id="new-decanato-name" name="name" required className={fieldClass} />
            </div>
            <div>
              <label className={labelClass} htmlFor="new-decanato-zona">
                Zona pastoral
              </label>
              <input id="new-decanato-zona" name="zonaPastoral" required className={fieldClass} />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-accent-contrast transition-transform active:scale-[0.98]"
              >
                <Plus size={16} weight="bold" />
                Agregar
              </button>
            </div>
          </form>
        </div>

        <div className="mt-6 space-y-4">
          {directory.map(({ decanato, parishes }) => (
            <details key={decanato.id} className="group rounded-[20px] border border-border bg-surface">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-4 sm:p-6 [&::-webkit-details-marker]:hidden">
                <div>
                  <p className="font-display text-base font-bold uppercase tracking-tight">
                    {decanato.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {decanato.zona_pastoral} · {parishes.length}{" "}
                    {parishes.length === 1 ? "parroquia" : "parroquias"}
                  </p>
                </div>
                <CaretDown
                  size={18}
                  weight="regular"
                  className="shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
                />
              </summary>

              <div className="space-y-8 border-t border-border p-4 sm:p-6">
                <form className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClass} htmlFor={`name-${decanato.id}`}>
                      Nombre del decanato
                    </label>
                    <input
                      id={`name-${decanato.id}`}
                      name="name"
                      defaultValue={decanato.name}
                      required
                      className={fieldClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor={`zona-${decanato.id}`}>
                      Zona pastoral
                    </label>
                    <input
                      id={`zona-${decanato.id}`}
                      name="zonaPastoral"
                      defaultValue={decanato.zona_pastoral}
                      required
                      className={fieldClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor={`cname-${decanato.id}`}>
                      Coordinador: nombre
                    </label>
                    <input
                      id={`cname-${decanato.id}`}
                      name="coordinatorName"
                      defaultValue={decanato.coordinator_name ?? ""}
                      className={fieldClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor={`cphone-${decanato.id}`}>
                      Coordinador: teléfono
                    </label>
                    <input
                      id={`cphone-${decanato.id}`}
                      name="coordinatorPhone"
                      defaultValue={decanato.coordinator_phone ?? ""}
                      className={fieldClass}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelClass} htmlFor={`cemail-${decanato.id}`}>
                      Coordinador: correo
                    </label>
                    <input
                      id={`cemail-${decanato.id}`}
                      name="coordinatorEmail"
                      type="email"
                      defaultValue={decanato.coordinator_email ?? ""}
                      className={fieldClass}
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
                    <button
                      type="submit"
                      formAction={updateDecanatoAction.bind(null, decanato.id)}
                      className="inline-flex items-center justify-center rounded-full bg-accent px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-accent-contrast transition-transform active:scale-[0.98]"
                    >
                      Guardar decanato
                    </button>
                    {parishes.length === 0 && (
                      <button
                        type="submit"
                        formAction={deleteDecanatoAction.bind(null, decanato.id)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2.5 text-sm font-semibold uppercase tracking-wide text-muted-foreground hover:bg-surface-muted"
                      >
                        <Trash size={14} weight="regular" />
                        Eliminar decanato
                      </button>
                    )}
                  </div>
                </form>

                <div>
                  <p className={labelClass}>Parroquias</p>
                  <div className="mt-2 divide-y divide-border rounded-[12px] border border-border">
                    {parishes.map((parish) => (
                      <form
                        key={parish.id}
                        className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center"
                      >
                        <input
                          name="name"
                          defaultValue={parish.name}
                          className={`${fieldClass} sm:flex-1`}
                        />
                        <input
                          name="locality"
                          defaultValue={parish.locality}
                          className={`${fieldClass} sm:flex-1`}
                        />
                        <div className="flex shrink-0 gap-2">
                          <button
                            type="submit"
                            formAction={updateParishAction.bind(null, parish.id, decanato.id)}
                            className="rounded-full border border-border px-4 py-2 text-xs font-semibold uppercase tracking-wide hover:bg-surface-muted"
                          >
                            Guardar
                          </button>
                          <button
                            type="submit"
                            formAction={deleteParishAction.bind(null, parish.id)}
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-surface-muted"
                            aria-label={`Eliminar ${parish.name}`}
                          >
                            <Trash size={14} weight="regular" />
                          </button>
                        </div>
                      </form>
                    ))}
                    {parishes.length === 0 && (
                      <p className="p-4 text-sm text-muted-foreground">
                        Este decanato todavía no tiene parroquias.
                      </p>
                    )}
                  </div>

                  <form
                    action={createParishAction.bind(null, decanato.id)}
                    className="mt-3 flex flex-col gap-2 sm:flex-row"
                  >
                    <input
                      name="name"
                      placeholder="Nombre de la parroquia"
                      required
                      className={`${fieldClass} sm:flex-1`}
                    />
                    <input
                      name="locality"
                      placeholder="Localidad"
                      required
                      className={`${fieldClass} sm:flex-1`}
                    />
                    <button
                      type="submit"
                      className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full border border-accent px-4 py-2 text-xs font-semibold uppercase tracking-wide text-accent hover:bg-accent-soft"
                    >
                      <Plus size={14} weight="bold" />
                      Agregar parroquia
                    </button>
                  </form>
                </div>
              </div>
            </details>
          ))}
        </div>
      </div>
    </main>
  );
}
