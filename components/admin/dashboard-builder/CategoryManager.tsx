"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import type { BuilderCategory } from "@/app/(admin)/types";
import { moveChart } from "@/lib/dashboard/chartCompat";
import {
  createBuilderCategory,
  reorderBuilderCategories,
  updateBuilderCategory,
} from "@/services/dashboard-builder.service";
import { errorMessage, ghostButton, inputClass, labelClass, secondaryButton } from "./ui";

interface CategoryManagerProps {
  categories: BuilderCategory[];
  onChanged: (selectCategoryId?: string) => void;
}

/**
 * Gestión de categorías (spec 108, P2/P3): crear, renombrar, activar o
 * desactivar y reordenar. `OVERVIEW` es reservada: no se renombra ni se
 * desactiva. Una categoría inactiva no se sirve aunque tenga gráficos.
 */
export default function CategoryManager({ categories, onChanged }: CategoryManagerProps) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  async function run(fn: () => Promise<void>, fallback: string) {
    setBusy(true);
    setError(null);
    try {
      await fn();
    } catch (err) {
      setError(errorMessage(err, fallback));
    } finally {
      setBusy(false);
    }
  }

  function create(e: React.FormEvent) {
    e.preventDefault();
    run(async () => {
      const created = await createBuilderCategory({ code: code.trim(), name: name.trim() });
      setCode("");
      setName("");
      setStatus(`Categoría «${name.trim()}» creada.`);
      onChanged(created.categoryId);
    }, "No se pudo crear la categoría.");
  }

  function rename(category: BuilderCategory) {
    run(async () => {
      await updateBuilderCategory(category.categoryId, { name: editName.trim() });
      setEditing(null);
      setStatus(`Categoría renombrada a «${editName.trim()}».`);
      onChanged();
    }, "No se pudo renombrar.");
  }

  function toggleActive(category: BuilderCategory) {
    run(async () => {
      await updateBuilderCategory(category.categoryId, { isActive: !category.isActive });
      setStatus(`«${category.name}» ${category.isActive ? "desactivada" : "activada"}.`);
      onChanged();
    }, "No se pudo cambiar el estado.");
  }

  // Mismo criterio que ChartList: el foco vuelve al botón usado tras recargar
  // la lista (o al opuesto si quedó deshabilitado en un borde).
  const focusAfterMove = useRef<{ id: string; direction: "up" | "down" } | null>(null);
  const order = categories.map((c) => c.categoryId).join(",");
  useLayoutEffect(() => {
    const target = focusAfterMove.current;
    if (!target) return;
    focusAfterMove.current = null;
    const opposite = target.direction === "up" ? "down" : "up";
    const button = document.getElementById(`cat-${target.direction}-${target.id}`);
    const fallback = document.getElementById(`cat-${opposite}-${target.id}`);
    const el = button && !(button as HTMLButtonElement).disabled ? button : fallback;
    el?.focus();
  }, [order]);

  function move(category: BuilderCategory, direction: "up" | "down") {
    if (busy) return; // sin deshabilitar las flechas, que perderían el foco
    const ids = categories.map((c) => c.categoryId);
    const next = moveChart(ids, category.categoryId, direction);
    if (next.join() === ids.join()) return;
    focusAfterMove.current = { id: category.categoryId, direction };
    run(async () => {
      await reorderBuilderCategories(next);
      setStatus(
        `«${category.name}» quedó en la posición ${next.indexOf(category.categoryId) + 1} de ${next.length}.`,
      );
      onChanged();
    }, "No se pudo reordenar.");
  }

  return (
    <div className="flex flex-col gap-4">
      <p role="status" className="sr-only">
        {status}
      </p>
      {error && (
        <p className="rounded-md bg-[var(--danger-bg)] px-3 py-2 text-sm text-[var(--danger-fg)]">
          {error}
        </p>
      )}
      <ol className="flex flex-col gap-1">
        {categories.map((category, index) => (
          <li
            key={category.categoryId}
            className="flex flex-wrap items-center gap-2 rounded-md border border-[var(--border)] px-2 py-1.5"
          >
            <button
              id={`cat-up-${category.categoryId}`}
              type="button"
              className={ghostButton}
              disabled={index === 0}
              onClick={() => move(category, "up")}
              aria-label={`Subir «${category.name}»`}
            >
              <ArrowUp size={16} aria-hidden="true" />
            </button>
            <button
              id={`cat-down-${category.categoryId}`}
              type="button"
              className={ghostButton}
              disabled={index === categories.length - 1}
              onClick={() => move(category, "down")}
              aria-label={`Bajar «${category.name}»`}
            >
              <ArrowDown size={16} aria-hidden="true" />
            </button>
            <span className="w-24 shrink-0 font-mono text-xs text-[var(--text-muted)]">
              {category.code}
            </span>
            {editing === category.categoryId ? (
              <form
                className="flex flex-1 gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  rename(category);
                }}
              >
                <label className="sr-only" htmlFor={`cat-name-${category.categoryId}`}>
                  Nombre de la categoría
                </label>
                <input
                  id={`cat-name-${category.categoryId}`}
                  className={inputClass}
                  value={editName}
                  required
                  maxLength={255}
                  autoFocus
                  onChange={(e) => setEditName(e.target.value)}
                />
                <button type="submit" className={ghostButton} disabled={busy}>
                  Guardar
                </button>
                <button type="button" className={ghostButton} onClick={() => setEditing(null)}>
                  Cancelar
                </button>
              </form>
            ) : (
              <span
                className={`min-w-0 flex-1 truncate text-sm ${
                  category.isActive ? "" : "text-[var(--text-muted)] line-through"
                }`}
              >
                {category.name}
              </span>
            )}
            {!category.isReserved && editing !== category.categoryId && (
              <>
                <button
                  type="button"
                  className={ghostButton}
                  onClick={() => {
                    setEditing(category.categoryId);
                    setEditName(category.name);
                  }}
                >
                  Renombrar
                </button>
                <button
                  type="button"
                  className={ghostButton}
                  disabled={busy}
                  onClick={() => toggleActive(category)}
                >
                  {category.isActive ? "Desactivar" : "Activar"}
                </button>
              </>
            )}
            {category.isReserved && (
              <span className="text-xs text-[var(--text-muted)]">Reservada</span>
            )}
          </li>
        ))}
      </ol>

      <form onSubmit={create} className="flex flex-wrap items-end gap-3">
        <div className="w-32">
          <label htmlFor="new-cat-code" className={labelClass}>
            Código
          </label>
          <input
            id="new-cat-code"
            className={inputClass}
            value={code}
            required
            maxLength={50}
            pattern="[A-Za-z0-9_\-]+"
            title="Letras, números, guion o guion bajo, sin espacios (p. ej. C15)."
            placeholder="C15"
            onChange={(e) => setCode(e.target.value)}
          />
        </div>
        <div className="min-w-48 flex-1">
          <label htmlFor="new-cat-name" className={labelClass}>
            Nombre
          </label>
          <input
            id="new-cat-name"
            className={inputClass}
            value={name}
            required
            maxLength={255}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <button type="submit" className={secondaryButton} disabled={busy}>
          Crear categoría
        </button>
      </form>
    </div>
  );
}
