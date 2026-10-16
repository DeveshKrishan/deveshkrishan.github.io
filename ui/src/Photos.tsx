import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type PointerEvent,
  type WheelEvent,
} from 'react';
import { createPortal } from 'react-dom';

import {
  formatPhotoCaption,
  getPhotoPageCount,
  getWrappedPhotoIndex,
  padPhotoPage,
  PHOTO_ZOOM_MAX,
  PHOTO_ZOOM_MIN,
  PHOTOS,
  PHOTOS_PER_PAGE,
  stepPhotoZoom,
  type Photo,
} from './data/photos';
import { trackPhotoOpen } from './data/track-photo';

export function Photos() {
  const [page, setPage] = useState(0);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const pageCount = getPhotoPageCount(PHOTOS.length);
  const pageSlots = padPhotoPage(PHOTOS, page);
  const pageStart = page * PHOTOS_PER_PAGE;

  function handleOpen(index: number) {
    trackPhotoOpen(PHOTOS[index], 'grid');
    setOpenIndex(index);
  }

  function handleViewerPhotoChange(index: number) {
    trackPhotoOpen(PHOTOS[index], 'viewer');
    setOpenIndex(index);
  }

  function handleClose() {
    setOpenIndex(null);
  }

  return (
    <div className="photos-section" id="photos">
      <h3 className="photos-heading">recent frames</h3>
      <p className="photos-lede">getting into photography a bit. click one to see the full image.</p>
      <ul className="photos-grid">
        {pageSlots.map((photo, index) => {
          const photoIndex = pageStart + index;
          if (!photo) {
            return <li key={`empty-${photoIndex}`} className="photos-grid-slot" aria-hidden="true" />;
          }

          return (
            <li key={photo.id}>
              <button
                type="button"
                className="photos-thumb"
                onClick={() => handleOpen(photoIndex)}
                onMouseEnter={() => prefetchPhoto(photo.fullSrc)}
                onFocus={() => prefetchPhoto(photo.fullSrc)}
              >
                <img
                  src={photo.thumbSrc}
                  alt={photo.alt}
                  width={320}
                  height={240}
                  loading={photoIndex < 2 ? 'eager' : 'lazy'}
                  decoding="async"
                />
              </button>
            </li>
          );
        })}
      </ul>
      {pageCount > 1 ? (
        <nav className="photos-pager" aria-label="Photo pages">
          <PhotosPagerButton
            direction="previous"
            disabled={page === 0}
            onClick={() => setPage((current) => current - 1)}
          />
          <p>
            {page + 1} / {pageCount}
          </p>
          <PhotosPagerButton
            direction="next"
            disabled={page === pageCount - 1}
            onClick={() => setPage((current) => current + 1)}
          />
        </nav>
      ) : null}
      {openIndex != null ? (
        <PhotoViewer
          photos={PHOTOS}
          index={openIndex}
          onIndexChange={handleViewerPhotoChange}
          onClose={handleClose}
        />
      ) : null}
    </div>
  );
}

interface PhotoViewerProps {
  photos: readonly Photo[];
  index: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}

function PhotoViewer({ photos, index, onIndexChange, onClose }: PhotoViewerProps) {
  const photo = photos[index];
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const currentThumbRef = useRef<HTMLButtonElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<Element | null>(null);
  const dragRef = useRef<PhotoDrag | null>(null);
  const [isFullLoaded, setIsFullLoaded] = useState(false);
  const [zoom, setZoom] = useState(PHOTO_ZOOM_MIN);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);

  useEffect(() => {
    restoreFocusRef.current = document.activeElement;
    closeRef.current?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
      if (restoreFocusRef.current instanceof HTMLElement) {
        restoreFocusRef.current.focus();
      }
    };
  }, []);

  useEffect(() => {
    setIsFullLoaded(false);
    setZoom(PHOTO_ZOOM_MIN);
    setPan({ x: 0, y: 0 });
    prefetchPhoto(photo.fullSrc);
    prefetchPhoto(photos[getWrappedPhotoIndex(index, 1, photos.length)].fullSrc);
    prefetchPhoto(photos[getWrappedPhotoIndex(index, -1, photos.length)].fullSrc);
    currentThumbRef.current?.scrollIntoView?.({ inline: 'center', block: 'nearest' });
  }, [index, photo.fullSrc, photos]);

  const applyZoom = useCallback((nextZoom: number, origin?: { x: number; y: number }) => {
    if (nextZoom === zoom) return;
    if (nextZoom === PHOTO_ZOOM_MIN) {
      setZoom(PHOTO_ZOOM_MIN);
      setPan({ x: 0, y: 0 });
      return;
    }

    const ratio = nextZoom / zoom;
    setZoom(nextZoom);
    setPan((current) => {
      if (!origin) {
        return { x: current.x * ratio, y: current.y * ratio };
      }
      return {
        x: origin.x - (origin.x - current.x) * ratio,
        y: origin.y - (origin.y - current.y) * ratio,
      };
    });
  }, [zoom]);

  function originFromClient(clientX: number, clientY: number) {
    const frame = frameRef.current;
    if (!frame) return undefined;
    const rect = frame.getBoundingClientRect();
    return {
      x: clientX - rect.left - rect.width / 2,
      y: clientY - rect.top - rect.height / 2,
    };
  }

  function handleFramePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0 || zoom === PHOTO_ZOOM_MIN) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      panX: pan.x,
      panY: pan.y,
      moved: false,
    };
    setIsPanning(true);
  }

  function handleFramePointerMove(event: PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) drag.moved = true;
    setPan({ x: drag.panX + dx, y: drag.panY + dy });
  }

  function handleFramePointerUp(event: PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    const skippedZoom = drag?.moved;
    if (drag?.pointerId === event.pointerId) {
      dragRef.current = null;
      setIsPanning(false);
    }
    if (skippedZoom || event.type === 'pointercancel' || event.button !== 0) return;
    if (zoom === PHOTO_ZOOM_MIN) {
      applyZoom(stepPhotoZoom(zoom, 1), originFromClient(event.clientX, event.clientY));
      return;
    }
    applyZoom(PHOTO_ZOOM_MIN);
  }

  function handleFrameWheel(event: WheelEvent<HTMLDivElement>) {
    event.preventDefault();
    applyZoom(
      stepPhotoZoom(zoom, event.deltaY < 0 ? 1 : -1),
      originFromClient(event.clientX, event.clientY),
    );
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key === '+' || event.key === '=') {
        event.preventDefault();
        applyZoom(stepPhotoZoom(zoom, 1));
        return;
      }
      if (event.key === '-' || event.key === '_') {
        event.preventDefault();
        applyZoom(stepPhotoZoom(zoom, -1));
        return;
      }
      if (event.key === '0') {
        event.preventDefault();
        applyZoom(PHOTO_ZOOM_MIN);
        return;
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        onIndexChange(getWrappedPhotoIndex(index, 1, photos.length));
        return;
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        onIndexChange(getWrappedPhotoIndex(index, -1, photos.length));
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [applyZoom, index, onClose, onIndexChange, photos.length, zoom]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="photo-viewer"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div className="photo-viewer-bar">
        <p id={titleId} className="photo-viewer-meta">
          {formatPhotoCaption(photo)}
        </p>
        <div className="photo-viewer-actions">
          <button
            type="button"
            className="photos-icon-btn"
            aria-label="zoom out"
            disabled={zoom === PHOTO_ZOOM_MIN}
            onClick={() => applyZoom(stepPhotoZoom(zoom, -1))}
          >
            <PhotosZoomIcon action="out" />
          </button>
          <button
            type="button"
            className="photos-icon-btn"
            aria-label="zoom in"
            disabled={zoom === PHOTO_ZOOM_MAX}
            onClick={() => applyZoom(stepPhotoZoom(zoom, 1))}
          >
            <PhotosZoomIcon action="in" />
          </button>
          <button
            ref={closeRef}
            type="button"
            className="photos-icon-btn"
            aria-label="close"
            onClick={onClose}
          >
            <PhotosCloseIcon />
          </button>
        </div>
      </div>
      <div
        ref={frameRef}
        className={[
          'photo-viewer-frame',
          zoom > PHOTO_ZOOM_MIN ? 'is-zoomed' : 'is-zoomable',
          isPanning ? 'is-panning' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        onPointerDown={handleFramePointerDown}
        onPointerMove={handleFramePointerMove}
        onPointerUp={handleFramePointerUp}
        onPointerCancel={handleFramePointerUp}
        onWheel={handleFrameWheel}
      >
        <div
          className="photo-viewer-zoom"
          data-zoom={zoom}
          style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
        >
          <img
            src={photo.thumbSrc}
            alt=""
            className="photo-viewer-placeholder"
            aria-hidden="true"
          />
          <img
            key={photo.fullSrc}
            src={photo.fullSrc}
            alt={photo.alt}
            className={isFullLoaded ? 'photo-viewer-full is-loaded' : 'photo-viewer-full'}
            onLoad={() => setIsFullLoaded(true)}
          />
        </div>
      </div>
      <nav className="photos-pager photo-viewer-pager" aria-label="Photo viewer">
        <PhotosPagerButton
          direction="previous"
          onClick={() => onIndexChange(getWrappedPhotoIndex(index, -1, photos.length))}
        />
        <p>
          {index + 1} / {photos.length}
        </p>
        <PhotosPagerButton
          direction="next"
          onClick={() => onIndexChange(getWrappedPhotoIndex(index, 1, photos.length))}
        />
      </nav>
      <ul className="photo-viewer-strip" aria-label="All photos">
        {photos.map((item, itemIndex) => (
          <li key={item.id}>
            <button
              ref={itemIndex === index ? currentThumbRef : undefined}
              type="button"
              className={
                itemIndex === index ? 'photo-viewer-strip-thumb is-current' : 'photo-viewer-strip-thumb'
              }
              aria-current={itemIndex === index ? 'true' : undefined}
              onClick={() => onIndexChange(itemIndex)}
            >
              <img src={item.thumbSrc} alt={item.alt} width={160} height={120} />
            </button>
          </li>
        ))}
      </ul>
    </div>,
    document.body,
  );
}

interface PhotoDrag {
  pointerId: number;
  x: number;
  y: number;
  panX: number;
  panY: number;
  moved: boolean;
}

interface PhotosPagerButtonProps {
  direction: 'previous' | 'next';
  disabled?: boolean;
  onClick: () => void;
}

function PhotosPagerButton({ direction, disabled, onClick }: PhotosPagerButtonProps) {
  return (
    <button
      type="button"
      className="photos-icon-btn"
      aria-label={direction}
      disabled={disabled}
      onClick={onClick}
    >
      <PhotosChevron direction={direction} />
    </button>
  );
}

function PhotosChevron({ direction }: { direction: 'previous' | 'next' }) {
  return (
    <svg className="photos-chevron" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      {direction === 'previous' ? (
        <path d="M10.25 3.25 5.25 8l5 4.75" />
      ) : (
        <path d="M5.75 3.25 10.75 8l-5 4.75" />
      )}
    </svg>
  );
}

function PhotosZoomIcon({ action }: { action: 'in' | 'out' }) {
  return (
    <svg className="photos-chevron" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      {action === 'in' ? <path d="M8 3.25v9.5M3.25 8h9.5" /> : <path d="M3.25 8h9.5" />}
    </svg>
  );
}

function PhotosCloseIcon() {
  return (
    <svg className="photos-chevron" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <path d="M4 4l8 8M12 4l-8 8" />
    </svg>
  );
}

const prefetched = new Set<string>();

function prefetchPhoto(src: string) {
  if (prefetched.has(src) || typeof Image === 'undefined') return;
  prefetched.add(src);
  const image = new Image();
  image.src = src;
}
