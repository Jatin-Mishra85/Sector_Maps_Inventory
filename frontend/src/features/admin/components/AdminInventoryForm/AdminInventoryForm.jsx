import { useEffect, useRef, useState } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import './AdminInventoryForm.css';

import Input from '../../../../components/common/Input/Input';
import TextArea from '../../../../components/common/TextArea/TextArea';
import FileUpload from '../../../../components/common/FileUpload/FileUpload';
import Button from '../../../../components/common/Button/Button';

import { adminService } from '../../services/adminService';
import { parseApiError } from '../../../../services/errorHandler';
import { useToast } from '../../../../context/ToastContext';

const defaultValues = {
  developerName: '',
  sectorName: '',
  type: '',
  // BULK ADD — one Developer/Sector/Type, multiple Inventory Names.
  // Starts with a single empty name row, same as the old single-name form.
  names: [{ value: '' }],
  description: '',
  polygon: '',
  image: null,
};

export default function AdminInventoryForm({ onSuccess }) {
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const namesContainerRef = useRef(null); // KEYBOARD SHORTCUT — used to focus the new row

  const { control, register, handleSubmit, reset } = useForm({ defaultValues, mode: 'onBlur' });
  // No validation rules — every field remains optional, as requested earlier.

  // BULK ADD — "+ Add Another" appends a new Inventory Name row.
  // Developer/Sector/Type/Description/Image stay shared across all of them.
  const { fields: nameFields, append: appendName, remove: removeName } = useFieldArray({
    control,
    name: 'names',
  });

  // KEYBOARD SHORTCUT — after a new row is added (via button OR Enter key),
  // auto-focus it so typing can continue without touching the mouse.
  // Only runs when the row COUNT changes, so it never fires on normal typing.
  const prevCountRef = useRef(nameFields.length);
  useEffect(() => {
    if (nameFields.length > prevCountRef.current) {
      const inputs = namesContainerRef.current?.querySelectorAll('input');
      const lastInput = inputs?.[inputs.length - 1];
      lastInput?.focus();
    }
    prevCountRef.current = nameFields.length;
  }, [nameFields.length]);

  // KEYBOARD SHORTCUT — pressing plain Enter while typing in the LAST
  // Inventory Name box adds a new row, instead of submitting the form.
  // Scoped to just this one input's keydown event — it never listens at
  // the page/window/OS level, so it cannot clash with any laptop or
  // browser shortcut. Shift/Ctrl/Alt/Meta+Enter are ignored on purpose,
  // so nothing unexpected happens if those combos are pressed here.
  const handleNameKeyDown = (e, index) => {
    if (e.key !== 'Enter') return;
    if (index !== nameFields.length - 1) return;
    if (e.shiftKey || e.ctrlKey || e.altKey || e.metaKey) return;

    e.preventDefault(); // stop Enter from submitting the whole form
    appendName({ value: '' });
  };

  const createOne = async (data, nameValue) => {
    const formData = new FormData();
    formData.append('developerName', data.developerName || '');
    formData.append('sectorName', data.sectorName || '');
    formData.append('type', data.type || '');
    formData.append('name', nameValue || '');
    formData.append('description', data.description || '');
    formData.append('polygon', data.polygon || '');
    if (data.image) {
      formData.append('image', data.image);
    }

    const response = await adminService.createInventory(formData);

    return {
      id: response?.id ?? response?.data?.id ?? crypto.randomUUID(),
      name: response?.name ?? nameValue ?? 'Untitled Inventory',
      type: response?.type ?? data.type ?? '',
      developerName: response?.developerName ?? data.developerName ?? '-',
      sectorName: response?.sectorName ?? data.sectorName ?? '-',
      imageUrl: response?.imageUrl ?? (data.image ? URL.createObjectURL(data.image) : null),
      latitude: response?.latitude ?? null,
      longitude: response?.longitude ?? null,
    };
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    // BULK ADD — collect every non-empty Inventory Name typed in.
    // If none were typed, fall back to one submission with an empty name
    // (same behaviour as the old single-name form).
    const enteredNames = (data.names || [])
      .map((n) => (n?.value || '').trim())
      .filter((n) => n.length > 0);
    const namesToSubmit = enteredNames.length > 0 ? enteredNames : [''];

    // IMPORTANT: submitted ONE AT A TIME, not in parallel. The very first
    // request auto-creates the Developer/Sector if they don't exist yet
    // (findOrCreateByName on the backend). Firing all requests together
    // could create duplicate Developer/Sector rows before the first one
    // finishes saving — sequential avoids that.
    let successCount = 0;
    let failCount = 0;

    for (const nameValue of namesToSubmit) {
      try {
        const createdInventory = await createOne(data, nameValue);
        successCount += 1;
        onSuccess?.(createdInventory);
      } catch (err) {
        failCount += 1;
        const { message } = parseApiError(err);
        showToast(`"${nameValue || 'Untitled'}" save nahi hui: ${message}`, 'error');
      }
    }

    if (successCount > 0) {
      showToast(
        namesToSubmit.length > 1
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
    <form className="admin-form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="admin-form__grid">
        <Input
          label="Developer"
          placeholder="e.g. BPTP"
          {...register('developerName')}
        />

        <Input
          label="Sector"
          placeholder="e.g. Sector 37D"
          {...register('sectorName')}
        />

        <Input
          label="Inventory Type"
          placeholder="e.g. Plot, Villa, Apartment — kuch bhi likh sakte ho"
          {...register('type')}
        />
      </div>

      {/* BULK ADD — one row per Inventory Name. "+ Add Another" (or pressing
          Enter in the last box) adds a new row, so multiple blocks/units
          under the same Sector + Type can be added in one go. */}
      <div className="admin-form__names" ref={namesContainerRef}>
        <label className="admin-form__names-label">Inventory Name(s)</label>
        {nameFields.map((field, index) => (
          <div className="admin-form__name-row" key={field.id}>
            <Input
              placeholder="e.g. Block A — Enter dabao naya row ke liye"
              {...register(`names.${index}.value`)}
              onKeyDown={(e) => handleNameKeyDown(e, index)}
            />
            {nameFields.length > 1 && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => removeName(index)}
                disabled={isSubmitting}
              >
                Remove
              </Button>
            )}
          </div>
        ))}
        <Button
          type="button"
          variant="secondary"
          onClick={() => appendName({ value: '' })}
          disabled={isSubmitting}
        >
          + Add Another
        </Button>
      </div>

      <TextArea
        label="Description (optional)"
        placeholder="Brief details about this inventory..."
        {...register('description')}
      />

      <Input
        label="Google Polygon Coordinates"
        placeholder="e.g. 28.4595,77.0266;28.4600,77.0270;28.4590,77.0280"
        {...register('polygon')}
        helperText="Paste the polygon path copied from Google My Maps / Earth."
      />

      <Controller
        name="image"
        control={control}
        render={({ field }) => (
          <FileUpload
            label="Inventory Image"
            value={field.value}
            onChange={field.onChange}
          />
        )}
      />

      <div className="admin-form__actions">
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