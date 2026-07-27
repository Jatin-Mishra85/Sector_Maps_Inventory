import { useEffect, useRef, useState } from 'react';
import ImageCropModal from '../../../../components/common/ImageCropModal/ImageCropModal';
import { inventoryService } from '../../services/inventoryService';
import { resolveImageUrl } from '../../hooks/useInventories';
import { parseApiError } from '../../../../services/errorHandler';
import { useToast } from '../../../../context/ToastContext';

// Ye component tabhi mount hota hai jab admin already authenticated ho
// chuka ho (InventoryGrid isko gate karta hai — Edit/Delete wale hi
// pattern se). Mount hote hi seedha device camera khol deta hai. Photo
// lene ke baad crop/rotate editor dikhta hai; "Confirm" par existing
// "edit inventory image" upload flow (inventoryService.updateWithImage)
// reuse hota hai — koi naya endpoint nahi.
export default function InventoryPhotoUploadModal({ inventory, onUploaded, onClose }) {
  const { showToast } = useToast();
  const cameraInputRef = useRef(null);
  const [pendingImageSrc, setPendingImageSrc] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // FIX — React.StrictMode (dev-only) mounts + re-runs effects once extra
  // on purpose, so `cameraInputRef.current?.click()` was firing twice back
  // to back. The second click interrupted the first file-picker session
  // before its onChange could fire, so no file was ever picked, no crop
  // modal opened properly, and no upload request ever went out.
  // This ref makes sure the camera only actually opens once per real mount,
  // in both StrictMode-dev and normal production behavior.
  const hasTriggeredCameraRef = useRef(false);

  useEffect(() => {
    if (hasTriggeredCameraRef.current) return;
    hasTriggeredCameraRef.current = true;
    cameraInputRef.current?.click();
  }, []);

  // Agar user native camera/gallery dialog cancel kar de, koi file select
  // nahi hoti — window par focus wapas aane par thoda rukk ke check karo,
  // agar kuch nahi mila to modal band kar do.
  useEffect(() => {
    const handleWindowFocus = () => {
      window.setTimeout(() => {
        if (!cameraInputRef.current?.files?.length && !pendingImageSrc && !isUploading) {
          onClose();
        }
      }, 400);
    };
    window.addEventListener('focus', handleWindowFocus);
    return () => window.removeEventListener('focus', handleWindowFocus);
  }, [pendingImageSrc, isUploading, onClose]);

  const handleFilePicked = (e) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;
    setPendingImageSrc(URL.createObjectURL(file));
  };

  const handleCropCancel = () => {
    if (pendingImageSrc) URL.revokeObjectURL(pendingImageSrc);
    setPendingImageSrc(null);
    onClose();
  };

  const handleCropConfirm = async (croppedFile) => {
    if (pendingImageSrc) URL.revokeObjectURL(pendingImageSrc);
    setPendingImageSrc(null);
    setIsUploading(true);

    try {
      // Baaki fields ko as-is wapas bhejte hain, taaki sirf image update
      // ho — koi aur field khaali/overwrite na ho jaye.
      const formData = new FormData();
      formData.append('name', inventory.name || '');
      formData.append('sectorName', inventory.sectorName || '');
      formData.append('actualDeveloperName', inventory.actualDeveloperName || '');
      formData.append(
        'groupNames',
        JSON.stringify(Array.isArray(inventory.groups) ? inventory.groups.map((g) => g.groupName) : [])
      );
      formData.append('cardId', inventory.cardId != null ? String(inventory.cardId) : '');
      formData.append('description', inventory.description || '');
      formData.append('image', croppedFile);

      const response = await inventoryService.updateWithImage(inventory.id, formData);

      const updatedInventory = {
        ...inventory,
        imageUrl: response?.imageUrl ? resolveImageUrl(response.imageUrl) : inventory.imageUrl,
      };

      showToast('Photo upload ho gayi.', 'success');
      onUploaded?.(updatedInventory);
    } catch (err) {
      const { message } = parseApiError(err);
      showToast(message, 'error');
    } finally {
      setIsUploading(false);
      onClose();
    }
  };

  return (
    <>
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFilePicked}
        style={{ display: 'none' }}
      />

      {pendingImageSrc && (
        <ImageCropModal imageSrc={pendingImageSrc} onConfirm={handleCropConfirm} onCancel={handleCropCancel} />
      )}
    </>
  );
}