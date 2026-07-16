import { useEffect, useRef, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import './DeveloperBatchInventoryForm.css';

import Input from '../../../../components/common/Input/Input';
import Button from '../../../../components/common/Button/Button';

import { adminService } from '../../services/adminService';
import { parseApiError } from '../../../../services/errorHandler';
import { useToast } from '../../../../context/ToastContext';

// Ek batch = ek Developer + ek Sector + us ke andar bulk Project rows (har Project ka apna Card No).
// "Add More" ek bilkul naya batch add karta hai — apna alag Developer + Sector select karne ke liye.
// Sirf Card No required hai — Developer/Sector/Project sab optional hain.
const emptyProject = (cardId = '') => ({ name: '', cardId: cardId ? String(cardId) : '' });
const emptyBatch = (cardId = '') => ({ developerName: '', sectorName: '', projects: [emptyProject(cardId)] });

// User "21", "sector 21", "SECTOR21", "Sector-21" — kuch bhi likhe,
// backend par hamesha consistent "Sector 21" format mein hi save ho.
function normalizeSectorName(raw) {
  const trimmed = (raw || '').trim();
  if (!trimmed) return '';

  const match = trimmed.match(/^sector[\s\-_]*(.+)$/i);
  const core = match ? match[1].trim() : trimmed;

  return core ? `Sector ${core}` : '';
}

const defaultValues = {
  batches: [emptyBatch()],
};

// ---- Ek batch ke andar ke Project rows (bulk) ----
function ProjectRows({ control, register, batchIndex, isSubmitting, consumeNextCardNumber }) {
  const rowsContainerRef = useRef(null);

  const { fields, append, remove } = useFieldArray({
    control,
    name: `batches.${batchIndex}.projects`,
  });

  const handleAddProject = () => {
    append(emptyProject(consumeNextCardNumber()));
    requestAnimationFrame(() => {
      const inputs = rowsContainerRef.current?.querySelectorAll('input[type="text"], input:not([type])');
      const lastInput = inputs?.[inputs.length - 1];
      lastInput?.focus();
    });
  };

  const handleKeyDown = (e, index) => {
    if (e.key !== 'Enter') return;
    if (index !== fields.length - 1) return;
    if (e.shiftKey || e.ctrlKey || e.altKey || e.metaKey) return;
    e.preventDefault();
    handleAddProject();
  };

  return (
    <div className="batch-form__projects" ref={rowsContainerRef}>
      <label className="batch-form__projects-label">Project(s) &amp; Card No</label>

      {fields.map((field, index) => (
        <div className="batch-form__project-row" key={field.id}>
          <Input
            placeholder="e.g. Project Name — Enter dabao naya row ke liye"
            {...register(`batches.${batchIndex}.projects.${index}.name`)}
            onKeyDown={(e) => handleKeyDown(e, index)}
          />
          <Input
            type="number"
            min="1"
            step="1"
            placeholder="Card No"
            className="batch-form__card-id-input"
            {...register(`batches.${batchIndex}.projects.${index}.cardId`)}
            onKeyDown={(e) => handleKeyDown(e, index)}
          />
          {fields.length > 1 && (
            <Button
              type="button"
              variant="secondary"
              onClick={() => remove(index)}
              disabled={isSubmitting}
            >
              Remove
            </Button>
          )}
        </div>
      ))}

      <Button type="button" variant="secondary" onClick={handleAddProject} disabled={isSubmitting}>
        + Add Project
      </Button>
    </div>
  );
}

// ---- Ek poora batch: Developer (top) + Sector + ProjectRows ----
function BatchCard({ control, register, batchIndex, onRemoveBatch, showRemoveBatch, isSubmitting, consumeNextCardNumber }) {
  return (
    <div className="batch-form__card">
      {showRemoveBatch && (
        <button
          type="button"
          className="batch-form__remove-batch-btn"
          onClick={onRemoveBatch}
          disabled={isSubmitting}
          aria-label="Remove this batch"
        >
          &times;
        </button>
      )}

      <div className="batch-form__developer-row">
        <Input
          label="Developer (optional)"
          placeholder="e.g. BPTP"
          className="batch-form__developer-input"
          {...register(`batches.${batchIndex}.developerName`)}
        />
      </div>

      <div className="batch-form__sector-row">
        <Input
          label="Sector (optional)"
          placeholder="e.g. Sector 21"
          {...register(`batches.${batchIndex}.sectorName`)}
        />
      </div>

      <ProjectRows
        control={control}
        register={register}
        batchIndex={batchIndex}
        isSubmitting={isSubmitting}
        consumeNextCardNumber={consumeNextCardNumber}
      />
    </div>
  );
}

export default function DeveloperBatchInventoryForm({ onSuccess }) {
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, register, handleSubmit, reset, setValue } = useForm({ defaultValues, mode: 'onBlur' });

  const { fields: batchFields, append: appendBatch, remove: removeBatch } = useFieldArray({
    control,
    name: 'batches',
  });

  // Running counter — jo bhi agla free Card No hai, wahi yahan track hota hai.
  // Backend se ek baar fetch hota hai, uske baad har naye row/batch ke saath locally +1 hota rehta hai.
  // Final duplicate-safety hamesha backend hi karta hai (409 error -> red toast, save nahi hoga).
  const nextCardNumberRef = useRef(null);

  const consumeNextCardNumber = () => {
    if (nextCardNumberRef.current == null) return '';
    const value = nextCardNumberRef.current;
    nextCardNumberRef.current += 1;
    return value;
  };

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const response = await adminService.getNextCardNumber();
        const next = response?.nextCardNumber ?? response?.data?.nextCardNumber ?? 1;
        if (!isMounted) return;

        nextCardNumberRef.current = next;
        setValue('batches.0.projects.0.cardId', String(next));
        nextCardNumberRef.current = next + 1;
      } catch (err) {
        // Agar fetch fail ho jaye, user manually type kar sakta hai — form block nahi hota.
        nextCardNumberRef.current = null;
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [setValue]);

  const handleAddBatch = () => {
    appendBatch(emptyBatch(consumeNextCardNumber()));
  };

  const createOne = async (batch, project) => {
    const formData = new FormData();
    formData.append('actualDeveloperName', batch.developerName || '');
    formData.append('sectorName', batch.sectorName || '');
    formData.append('name', project.name || ''); // Project
    formData.append('cardId', project.cardId || '');

    const response = await adminService.createInventory(formData);

    return {
      id: response?.id ?? response?.data?.id ?? `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: response?.name ?? project.name ?? '',
      cardId: response?.cardId ?? (project.cardId ? Number(project.cardId) : null),
      actualDeveloperName: response?.actualDeveloperName ?? batch.developerName ?? '',
      sectorName: response?.sectorName ?? batch.sectorName ?? '-',
      latitude: response?.latitude ?? null,
      longitude: response?.longitude ?? null,
    };
  };

  // Har batch se, har project row se — ek entry banao (Developer/Sector batch-level se copy hote hain).
  const buildEntries = (data) => {
    const entries = [];

    (data.batches || []).forEach((batch) => {
      const developerName = (batch.developerName || '').trim();
      const sectorName = normalizeSectorName(batch.sectorName);

      (batch.projects || []).forEach((p) => {
        const name = (p?.name || '').trim();
        const cardId = (p?.cardId || '').trim();

        // Poori tarah khaali row ko ignore karo (na Project naam, na Card No)
        if (!name && !cardId) return;

        entries.push({
          batch: { developerName, sectorName },
          name,
          cardId,
        });
      });
    });

    return entries;
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    const entries = buildEntries(data);

    if (entries.length === 0) {
      showToast('Kam se kam ek Card No bharna zaroori hai.', 'error');
      setIsSubmitting(false);
      return;
    }

    const missingCardIdEntry = entries.find((e) => !e.cardId);
    if (missingCardIdEntry) {
      const label = missingCardIdEntry.name || 'Untitled';
      showToast(`"${label}" ke liye Card No dena zaroori hai.`, 'error');
      setIsSubmitting(false);
      return;
    }

    let successCount = 0;
    let failCount = 0;

    for (const entry of entries) {
      try {
        const createdInventory = await createOne(entry.batch, entry);
        successCount += 1;
        onSuccess?.(createdInventory);
      } catch (err) {
        failCount += 1;
        const { message } = parseApiError(err);
        const label = entry.name || `Card No ${entry.cardId}`;
        // Backend 409 par yahi message aata hai: "Card No X already exists. Choose a different value."
        // Duplicate hone par entry save NAHI hoti — sirf red toast dikhta hai.
        showToast(`"${label}" save nahi hui: ${message}`, 'error');
      }
    }

    if (successCount > 0) {
      showToast(
        entries.length > 1
          ? `${successCount} inventories create ho gayi${failCount ? `, ${failCount} fail hui` : ''}.`
          : 'Inventory created successfully.',
        'success'
      );
    }

    reset(defaultValues);

    // Reset ke baad agla free Card No dobara fetch karo (jo abhi save hua wo ab list mein aa chuka hai).
    try {
      const response = await adminService.getNextCardNumber();
      const next = response?.nextCardNumber ?? response?.data?.nextCardNumber ?? null;
      if (next != null) {
        setValue('batches.0.projects.0.cardId', String(next));
        nextCardNumberRef.current = next + 1;
      }
    } catch {
      nextCardNumberRef.current = null;
    }

    setIsSubmitting(false);
  };

  const handleReset = () => {
    reset(defaultValues);
  };

  return (
    <form className="batch-form" onSubmit={handleSubmit(onSubmit)} noValidate>
      {batchFields.map((field, index) => (
        <BatchCard
          key={field.id}
          control={control}
          register={register}
          batchIndex={index}
          onRemoveBatch={() => removeBatch(index)}
          showRemoveBatch={batchFields.length > 1}
          isSubmitting={isSubmitting}
          consumeNextCardNumber={consumeNextCardNumber}
        />
      ))}

      <div className="batch-form__add-more">
        <Button type="button" variant="secondary" onClick={handleAddBatch} disabled={isSubmitting}>
          + Add More
        </Button>
      </div>

      <div className="batch-form__actions">
        <Button type="submit" variant="primary" loading={isSubmitting} disabled={isSubmitting}>
          Save Inventory
        </Button>
        <Button type="button" variant="secondary" onClick={handleReset} disabled={isSubmitting}>
          Reset
        </Button>
      </div>
    </form>
  );
}