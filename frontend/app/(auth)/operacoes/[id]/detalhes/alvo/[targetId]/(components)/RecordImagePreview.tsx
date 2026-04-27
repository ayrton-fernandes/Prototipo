"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Button, Dialog, Icon, Typography } from "@uigovpe/components";
import { ReactZoomPanPinchRef, TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import { useFieldValueImageSource } from "@/hooks/features/useFieldValueImageSource";

type ImageRotation = 0 | 90 | 180 | 270;

interface ProntuarioImagePreviewProps {
  imageUrl: string;
  alt: string;
}

const normalizeRotation = (rotation: number): ImageRotation => {
  const normalizedRotation = ((rotation % 360) + 360) % 360;

  if (normalizedRotation === 90 || normalizedRotation === 180 || normalizedRotation === 270) {
    return normalizedRotation;
  }

  return 0;
};

const rotationClassByValue: Record<ImageRotation, string> = {
  0: "prontuario-image-preview-rotation-0",
  90: "prontuario-image-preview-rotation-90",
  180: "prontuario-image-preview-rotation-180",
  270: "prontuario-image-preview-rotation-270",
};

export default function ProntuarioImagePreview({ imageUrl, alt }: ProntuarioImagePreviewProps) {
  const transformRef = useRef<ReactZoomPanPinchRef | null>(null);
  const [rotation, setRotation] = useState<ImageRotation>(0);
  const [previewVisible, setPreviewVisible] = useState(false);
  const previewActionButtonClassName = "prontuario-dialog-cancel-button";
  const resolvedImageUrl = useFieldValueImageSource(imageUrl);
  const hasResolvedImage = resolvedImageUrl.trim().length > 0;

  const openPreview = () => {
    setPreviewVisible(true);
    setTimeout(() => transformRef.current?.centerView(), 50);
  };

  const closePreview = () => {
    setPreviewVisible(false);
  };

  const rotateImage = (angle: -90 | 90) => {
    setRotation((currentRotation) => normalizeRotation(currentRotation + angle));
    setTimeout(() => transformRef.current?.centerView(), 50);
  };

  const resetZoom = () => {
    transformRef.current?.resetTransform();
  };

  const resetRotation = () => {
    setRotation(0);
    setTimeout(() => transformRef.current?.centerView(), 50);
  };

  return (
    <>
      <Button
        onClick={openPreview}
        icon={<Icon icon="visibility" outline />}
        label="Preview da imagem"
        className="prontuario-image-preview-button"
        outlined
      />

      <Dialog
        modal
        className="prontuario-target-dialog prontuario-image-preview-dialog"
        header={<Typography variant="h4">Preview da imagem</Typography>}
        visible={previewVisible}
        onHide={closePreview}
        footer={
          <div className="flex justify-end">
            <Button outlined onClick={closePreview} label="Fechar" className="prontuario-dialog-cancel-button" />
          </div>
        }
      >
        <div className="prontuario-image-preview-dialog-content">
          <div className="prontuario-image-preview-actions">
            <Button
              outlined
              onClick={() => transformRef.current?.zoomIn()}
              icon={<Icon icon="zoom_in" outline />}
              label="Zoom +"
              className={previewActionButtonClassName}
            />
            <Button
              outlined
              onClick={() => transformRef.current?.zoomOut()}
              icon={<Icon icon="zoom_out" outline />}
              label="Zoom -"
              className={previewActionButtonClassName}
            />
            <Button
              outlined
              onClick={resetZoom}
              icon={<Icon icon="refresh" outline />}
              label="Resetar zoom"
              className={previewActionButtonClassName}
            />
            <Button
              outlined
              onClick={() => rotateImage(-90)}
              icon={<Icon icon="rotate_90_degrees_ccw" outline />}
              label="Girar -90°"
              className={previewActionButtonClassName}
            />
            <Button
              outlined
              onClick={() => rotateImage(90)}
              icon={<Icon icon="rotate_90_degrees_cw" outline />}
              label="Girar +90°"
              className={previewActionButtonClassName}
            />
            <Button
              outlined
              onClick={resetRotation}
              icon={<Icon icon="refresh" outline />}
              label="Resetar rotação"
              className={previewActionButtonClassName}
            />
          </div>

          <div className="prontuario-image-preview-viewport">
            <TransformWrapper
              ref={transformRef}
              initialScale={1}
              minScale={0.5}
              maxScale={5}
              wheel={{ step: 0.1 }}
              doubleClick={{ disabled: true }}
              centerOnInit
              centerZoomedOut
            >
              <TransformComponent
                wrapperClass="prontuario-image-preview-transform-wrapper"
                contentClass="prontuario-image-preview-transform-content"
              >
                {hasResolvedImage ? (
                  <div className={`prontuario-image-preview-media ${rotationClassByValue[rotation]}`}>
                    <Image
                      src={resolvedImageUrl}
                      alt={alt}
                      fill
                      unoptimized
                      className="object-contain pointer-events-none select-none"
                      sizes="(max-width: 1024px) 100vw, 70vw"
                    />
                  </div>
                ) : (
                  <Typography variant="small" className="text-slate-500">
                    Não foi possível carregar a imagem para preview.
                  </Typography>
                )}
              </TransformComponent>
            </TransformWrapper>
          </div>
        </div>
      </Dialog>
    </>
  );
}
