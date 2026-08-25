"use client";

import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { Loader2 } from "lucide-react";

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getCroppedImg } from "@/lib/crop-image";

interface CropImageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageSrc: string;
  onCropped: (file: File) => void;
}

export function CropImageModal({ open, onOpenChange, imageSrc, onCropped }: CropImageModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const [isCropping, setIsCropping] = useState(false);

  const onCropComplete = useCallback(
    (_croppedArea: unknown, croppedAreaPixels: { x: number; y: number; width: number; height: number }) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    [],
  );

  const handleCrop = useCallback(async () => {
    if (!croppedAreaPixels) return;
    setIsCropping(true);
    try {
      const croppedFile = await getCroppedImg(imageSrc, croppedAreaPixels);
      onCropped(croppedFile);
      onOpenChange(false);
    } catch {
      // silently fail
    } finally {
      setIsCropping(false);
    }
  }, [croppedAreaPixels, imageSrc, onCropped, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Crop your photo</DialogTitle>
        </DialogHeader>

        <div className="relative h-72 w-full overflow-hidden rounded-lg bg-muted">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">Zoom</label>
          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full"
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isCropping}>
            Cancel
          </Button>
          <Button onClick={handleCrop} disabled={isCropping || !croppedAreaPixels}>
            {isCropping ? <Loader2 className="size-4 animate-spin" /> : null}
            {isCropping ? "Cropping..." : "Crop & Use"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
