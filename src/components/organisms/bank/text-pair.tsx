import { Badge } from "@/components/ui/badge";
import * as id from "@/content/id";
import {
  EDIT_MAX_LENGTH,
  EDIT_VARIANTS,
  editableText,
  type EditField,
  type EditKind,
  type EditableText,
  type TextEdit,
} from "@/lib/diagnosis/edits";
import { cn } from "@/lib/utils";

import { TextEditButton } from "./text-edit-button";

interface TextPairProps {
  kind: EditKind;
  /** Bank id; a task is "<sop id>:<task id>". */
  textKey: string;
  field: EditField;
  /** Names the text in the edit dialog, e.g. "Pertanyaan 3". */
  label: string;
  edits: readonly TextEdit[];
  canEdit: boolean;
  /** Small line above the texts, e.g. the field name. */
  caption?: string;
}

function TextRow({
  text,
  label,
  canEdit,
}: {
  text: EditableText;
  label: string;
  canEdit: boolean;
}) {
  const copy = id.questionBank;
  const { target } = text;
  return (
    <div className="flex items-start gap-3 py-2">
      <Badge
        variant={target.variant === "jasa" ? "secondary" : "outline"}
        title={copy.variantHint[target.variant]}
        className="mt-0.5 w-14 shrink-0"
      >
        {copy.variants[target.variant]}
      </Badge>
      <div className="min-w-0 flex-1 space-y-1">
        <p className={cn(text.sameAsGeneral && "text-muted-foreground")}>
          {text.sameAsGeneral ? copy.sameAsGeneral : text.current}
        </p>
        {text.edited ? <Badge variant="warning">{copy.edited}</Badge> : null}
      </div>
      {canEdit ? (
        <TextEditButton
          target={target}
          label={`${label} · ${copy.variants[target.variant]}`}
          current={text.current}
          original={text.original}
          edited={text.edited}
          maxLength={EDIT_MAX_LENGTH[target.field]}
        />
      ) : null}
    </div>
  );
}

/** One text in its general and service wording, each with its own edit button (admin). */
export function TextPair({ kind, textKey, field, label, edits, canEdit, caption }: TextPairProps) {
  const rows = EDIT_VARIANTS.map((variant) =>
    editableText({ kind, key: textKey, field, variant }, edits),
  ).filter((text): text is EditableText => text !== null);
  if (rows.length === 0) return null;
  return (
    <div>
      {caption ? <p className="text-sm font-semibold text-muted-foreground">{caption}</p> : null}
      <div className="divide-y">
        {rows.map((text) => (
          <TextRow
            key={text.target.variant}
            text={text}
            label={caption ? `${label} · ${caption}` : label}
            canEdit={canEdit}
          />
        ))}
      </div>
    </div>
  );
}
