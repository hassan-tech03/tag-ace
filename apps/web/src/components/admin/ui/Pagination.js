"use client";

import { Button } from "./Field";

export default function Pagination({ page, totalPages, total, onChange }) {
  if (totalPages <= 1) {
    return total != null ? (
      <div className="text-xs text-slate-500">{total} result{total === 1 ? "" : "s"}</div>
    ) : null;
  }
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="text-xs text-slate-500">
        Page {page} of {totalPages}
        {total != null ? ` · ${total} total` : ""}
      </div>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="secondary"
          disabled={page <= 1}
          onClick={() => onChange?.(page - 1)}
        >
          Previous
        </Button>
        <Button
          size="sm"
          variant="secondary"
          disabled={page >= totalPages}
          onClick={() => onChange?.(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
