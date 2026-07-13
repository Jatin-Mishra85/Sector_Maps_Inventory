import { useRef, useState } from 'react';
import { useForm, Controller, useFieldArray, useWatch } from 'react-hook-form';
import './SectorBlockImageForm.css';

import Input from '../../../../components/common/Input/Input';
import FileUpload from '../../../../components/common/FileUpload/FileUpload';
import Button from '../../../../components/common/Button/Button';

import { adminService } from '../../services/adminService';
import { parseApiError } from '../../../../services/errorHandler';
import { useToast } from '../../../../context/ToastContext';

const SECTOR_DATALIST_ID = 'sector-block-image-form__sector-options';

const defaultValues = {
  // ONE unified bulk list — each entry is a full Inventory row:
  // Sector + Block + Card ID + its own Image, all together.
  entries: [{ sectorName: '', block: '', cardId: '', image: null }],
};

export default function SectorBlockImageForm({ onSuccess }) {
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const entriesContainerRef = useRef(null);

  const { control, register, handleSubmit, reset } = useForm({ defaultValues, mode: 'onBlur' });

  const { fields: entryFields, append: appendEntry, remove: removeEntry } = useFieldArray({
    control,
    name: 'entries',
  });

  // Build the live "Sector suggestions" list — every unique Sector name
  // typed so far (across all rows) shows up as a suggestion for every row.
  const entriesWatch = useWatch({ control, name: 'entries' });
  const sectorSuggestions = [
    ...new Set((entriesWatch || []).map((e) => (e?.sectorName || '').trim()).filter(Boolean)),
  ];

  const handleAddEntry = () => {
    appendEntry({ sectorName: '', block: '', cardId: '', image: null });
    // Focus the new row's first input after it renders
    requestAnimationFrame(() => {
      const inputs = entriesContainerRef.current?.querySelectorAll('input[type="text"], input:not([type])');
      const lastInput = inputs?.[inputs.length - 1];
      lastInput?.focus();
    });
  };

  const handleEntryKeyDown = (e, index) => {
    if (e.key !== 'Enter') return;
    if (index !== entryFields.length - 1) return;
    if (e.shiftKey || e.ctrlKey || e.altKey || e.metaKey) return;
    e.preventDefault();
    handleAddEntry();
  };

  const createOne = async (entry) => {
    const formData = new FormData();
    formData.append('sectorName', entry.sectorName || '');
    formData.append('block', entry.block || '');
    formData.append('cardId', entry.cardId || '');
    if (entry.image) {
      formData.append('image', entry.image);
    }

    const response = await adminService.createInventory(formData);

    return {
      id: response?.id ?? response?.data?.id ?? `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: response?.name ?? '',
      block: response?.block ?? entry.block ?? '',
      groups: response?.groups ?? [],
      cardId: response?.cardId ?? (entry.cardId ? Number(entry.cardId) : null),
      actualDeveloperName: response?.actualDeveloperName ?? '',
      sectorName: response?.sectorName ?? entry.sectorName ?? '-',
      imageUrl: response?.imageUrl ?? (entry.image ? URL.createObjectURL(entry.image) : null),
      latitude: response?.latitude ?? null,
      longitude: response?.longitude ?? null,
    };
  };

  const buildEntries = (data) => {
    const raw = (data.entries || []).map((e) => ({
      sectorName: (e?.sectorName || '').trim(),
      block: (e?.block || '').trim(),
      cardId: (e?.cardId || '').trim(),
      image: e?.image || null,
    }));

    // Poori tarah khaali rows (koi field bhara hi nahi) ko ignore karo
    const filled = raw.filter((e) => e.sectorName || e.block || e.cardId || e.image);

    return filled.length > 0 ? filled : [{ sectorName: '', block: '', cardId: '', image: null }];
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    const entries = buildEntries(data);

    // Card ID COMPULSORY — Block optional hai, lekin Card ID kabhi khaali nahi
    const missingCardIdEntry = entries.find((e) => !e.cardId);
    if (missingCardIdEntry) {
      const label = [missingCardIdEntry.sectorName, missingCardIdEntry.block].filter(Boolean).join(' / ') || 'Untitled';
      showToast(`"${label}" ke liye Card ID dena zaroori hai.`, 'error');
      setIsSubmitting(false);
      return;
    }

    let successCount = 0;
    let failCount = 0;

    for (const entry of entries) {
      try {
        const createdInventory = await createOne(entry);
        successCount += 1;
        onSuccess?.(createdInventory);
      } catch (err) {
        failCount += 1;
        const { message } = parseApiError(err);
        const label = [entry.sectorName, entry.block].filter(Boolean).join(' / ') || 'Untitled';
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
    setIsSubmitting(false);
  };

  const handleReset = () => {
    reset(defaultValues);
  };

  return (
    <form className="sector-block-image-form" onSubmit={handleSubmit(onSubmit)} noValidate>
      {/* Shared datalist — powers the "auto-suggest Sector as you type" behavior on every row */}
      <datalist id={SECTOR_DATALIST_ID}>
        {sectorSuggestions.map((name) => (
          <option key={name} value={name} />
        ))}
      </datalist>

      <div ref={entriesContainerRef}>
        {entryFields.map((field, index) => (
          <div className="sector-block-image-form__entry-card" key={field.id}>
            {entryFields.length > 1 && (
              <button
                type="button"
                className="sector-block-image-form__remove-btn"
                onClick={() => removeEntry(index)}
                disabled={isSubmitting}
                aria-label="Remove this entry"
              >
                &times;
              </button>
            )}

            <div className="sector-block-image-form__row">
              <Input
                label="Sector"
                placeholder="e.g. Sector 37D"
                list={SECTOR_DATALIST_ID}
                {...register(`entries.${index}.sectorName`)}
                onKeyDown={(e) => handleEntryKeyDown(e, index)}
              />

              <Input
                label="Block (optional)"
                placeholder="e.g. Block A"
                {...register(`entries.${index}.block`)}
                onKeyDown={(e) => handleEntryKeyDown(e, index)}
              />

              <Input
                label="Card ID"
                type="number"
                min="1"
                step="1"
                placeholder="e.g. 5"
                className="sector-block-image-form__card-id-input"
                {...register(`entries.${index}.cardId`)}
                onKeyDown={(e) => handleEntryKeyDown(e, index)}
              />
            </div>

            <div className="sector-block-image-form__image-row">
              <Controller
                name={`entries.${index}.image`}
                control={control}
                render={({ field: imgField }) => (
                  <FileUpload label="Card ID" value={imgField.value} onChange={imgField.onChange} />
                )}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="sector-block-image-form__actions">
        <Button type="button" variant="secondary" onClick={handleAddEntry} disabled={isSubmitting}>
          + Add Another
        </Button>
      </div>

      <div className="sector-block-image-form__submit-actions">
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