'use client';

import { useRef, useEffect, useState } from 'react';

export function ResizableDivider() {
  const dividerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!isDragging) return;

    const divider = dividerRef.current;
    if (!divider) return;

    const sidebar = divider.previousElementSibling as HTMLElement;
    const container = divider.parentElement;
    if (!sidebar || !container) return;

    const handleMouseMove = (e: MouseEvent) => {
      const containerRect = container.getBoundingClientRect();
      const newWidth = e.clientX - containerRect.left;

      // Constraints: min 150px, max 60% of container
      const minWidth = 150;
      const maxWidth = Math.floor(container.clientWidth * 0.6);

      if (newWidth >= minWidth && newWidth <= maxWidth) {
        sidebar.style.width = `${newWidth}px`;
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div
      ref={dividerRef}
      onMouseDown={() => setIsDragging(true)}
      className={`border-r border-gray-200 hover:border-gray-400 cursor-col-resize transition-colors ${
        isDragging ? 'border-gray-400' : ''
      }`}
      style={{
        userSelect: isDragging ? 'none' : 'auto',
        flexShrink: 0,
      }}
    />
  );
}
