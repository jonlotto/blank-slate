import { useState, useRef, useCallback, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Loader2, Move, ZoomIn, ZoomOut } from "lucide-react";

interface BannerCropModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageSrc: string;
  initialOffsetY?: number;
  onCropComplete: (croppedImageBlob: Blob, offsetY: number) => void;
}

// Match preview dimensions exactly: 320x200 = 8:5 (1.6:1) aspect ratio
const ASPECT_RATIO = 1.6;
const OUTPUT_WIDTH = 640;
const OUTPUT_HEIGHT = 400;

export function BannerCropModal({
  open,
  onOpenChange,
  imageSrc,
  initialOffsetY = 0,
  onCropComplete,
}: BannerCropModalProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const dragStartRef = useRef({ x: 0, y: 0, offsetX: 0, offsetY: 0 });

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setOffsetX(0);
      setOffsetY(initialOffsetY);
      setZoom(1);
      setImageLoaded(false);
    }
  }, [open, initialOffsetY]);

  const handleImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
    setImageLoaded(true);
  }, []);

  // Calculate the visible frame dimensions
  const getFrameDimensions = useCallback(() => {
    const containerWidth = containerRef.current?.clientWidth || 400;
    const frameWidth = Math.min(containerWidth - 32, 500);
    const frameHeight = frameWidth / ASPECT_RATIO;
    return { frameWidth, frameHeight };
  }, []);

  // Calculate max offset based on image aspect ratio and zoom
  const getMaxOffset = useCallback(() => {
    if (!imageDimensions.width || !imageDimensions.height) return { maxOffsetX: 0, maxOffsetY: 0 };
    const { frameWidth, frameHeight } = getFrameDimensions();
    
    // Image is scaled to fit frame width, then multiplied by zoom
    const scaledImageWidth = frameWidth * zoom;
    const scaledImageHeight = (imageDimensions.height / imageDimensions.width) * scaledImageWidth;
    
    const maxOffsetX = Math.max(0, (scaledImageWidth - frameWidth) / 2);
    const maxOffsetY = Math.max(0, (scaledImageHeight - frameHeight) / 2);
    
    return { maxOffsetX, maxOffsetY };
  }, [imageDimensions, zoom, getFrameDimensions]);

  // Clamp offsets when zoom changes
  useEffect(() => {
    const { maxOffsetX, maxOffsetY } = getMaxOffset();
    setOffsetX(prev => Math.max(-maxOffsetX, Math.min(maxOffsetX, prev)));
    setOffsetY(prev => Math.max(-maxOffsetY, Math.min(maxOffsetY, prev)));
  }, [zoom, getMaxOffset]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY, offsetX, offsetY };
  }, [offsetX, offsetY]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;
    const { maxOffsetX, maxOffsetY } = getMaxOffset();
    
    setOffsetX(Math.max(-maxOffsetX, Math.min(maxOffsetX, dragStartRef.current.offsetX + deltaX)));
    setOffsetY(Math.max(-maxOffsetY, Math.min(maxOffsetY, dragStartRef.current.offsetY + deltaY)));
  }, [isDragging, getMaxOffset]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setIsDragging(true);
    dragStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, offsetX, offsetY };
  }, [offsetX, offsetY]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.touches[0].clientX - dragStartRef.current.x;
    const deltaY = e.touches[0].clientY - dragStartRef.current.y;
    const { maxOffsetX, maxOffsetY } = getMaxOffset();
    
    setOffsetX(Math.max(-maxOffsetX, Math.min(maxOffsetX, dragStartRef.current.offsetX + deltaX)));
    setOffsetY(Math.max(-maxOffsetY, Math.min(maxOffsetY, dragStartRef.current.offsetY + deltaY)));
  }, [isDragging, getMaxOffset]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  const getCroppedImage = useCallback(async (): Promise<Blob | null> => {
    const img = imageRef.current;
    if (!img || !imageDimensions.width) return null;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    canvas.width = OUTPUT_WIDTH;
    canvas.height = OUTPUT_HEIGHT;

    const { frameWidth, frameHeight } = getFrameDimensions();
    
    // Scale factor: image is scaled to fit frame width, then zoomed
    const baseScale = frameWidth / imageDimensions.width;
    const scale = baseScale * zoom;
    const scaledImageWidth = imageDimensions.width * scale;
    const scaledImageHeight = imageDimensions.height * scale;
    
    // Center position (without any offset)
    const centerX = (scaledImageWidth - frameWidth) / 2;
    const centerY = (scaledImageHeight - frameHeight) / 2;
    
    // Visible area starts at center minus offset
    const visibleLeftScaled = centerX - offsetX;
    const visibleTopScaled = centerY - offsetY;
    
    // Convert back to original image coordinates
    const sourceX = visibleLeftScaled / scale;
    const sourceY = visibleTopScaled / scale;
    const sourceWidth = frameWidth / scale;
    const sourceHeight = frameHeight / scale;
    
    // Clamp values to stay within image bounds
    const clampedSourceX = Math.max(0, Math.min(sourceX, imageDimensions.width - sourceWidth));
    const clampedSourceY = Math.max(0, Math.min(sourceY, imageDimensions.height - sourceHeight));
    const clampedSourceWidth = Math.min(sourceWidth, imageDimensions.width - clampedSourceX);
    const clampedSourceHeight = Math.min(sourceHeight, imageDimensions.height - clampedSourceY);

    ctx.drawImage(
      img,
      clampedSourceX,
      clampedSourceY,
      clampedSourceWidth,
      clampedSourceHeight,
      0,
      0,
      OUTPUT_WIDTH,
      OUTPUT_HEIGHT
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.9);
    });
  }, [imageDimensions, offsetX, offsetY, zoom, getFrameDimensions]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const blob = await getCroppedImage();
      if (blob) {
        onCropComplete(blob, offsetY);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const { frameWidth, frameHeight } = getFrameDimensions();
  const { maxOffsetX, maxOffsetY } = getMaxOffset();
  const canDrag = imageLoaded && (maxOffsetX > 0 || maxOffsetY > 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Ajustar imagem de capa</DialogTitle>
        </DialogHeader>

        <div 
          ref={containerRef}
          className="flex flex-col items-center py-4"
        >
          {/* Crop frame */}
          <div
            className="relative overflow-hidden rounded-xl border-2 border-primary/50 cursor-grab active:cursor-grabbing select-none"
            style={{ width: frameWidth, height: frameHeight }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <img
              ref={imageRef}
              src={imageSrc}
              alt="Preview"
              crossOrigin="anonymous"
              onLoad={handleImageLoad}
              className="absolute pointer-events-none"
              style={{ 
                top: '50%',
                left: '50%',
                width: '100%',
                transform: `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px)) scale(${zoom})`,
                transformOrigin: 'center center',
                transition: isDragging ? 'none' : 'transform 0.15s ease-out'
              }}
              draggable={false}
            />

            {/* Drag indicator overlay */}
            {canDrag && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
                <div className="bg-white/90 rounded-full p-2">
                  <Move className="h-5 w-5 text-gray-700" />
                </div>
              </div>
            )}
          </div>

          <p className="text-sm text-muted-foreground text-center mt-3">
            {canDrag ? "Arraste para ajustar a posição" : "Imagem ajustada automaticamente"}
          </p>

          {/* Zoom slider */}
          <div className="flex items-center gap-3 w-full max-w-xs mt-4">
            <ZoomOut className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <Slider
              value={[zoom]}
              onValueChange={([value]) => setZoom(value)}
              min={1}
              max={2}
              step={0.05}
              className="flex-1"
            />
            <ZoomIn className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Zoom: {Math.round(zoom * 100)}%
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !imageLoaded}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Salvando...
              </>
            ) : (
              "Aplicar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
