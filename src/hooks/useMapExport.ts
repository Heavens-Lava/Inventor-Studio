import { useCallback } from 'react';
import { useReactFlow, getNodesBounds, getViewportForBounds } from 'reactflow';
import { toPng, toSvg } from 'html-to-image';
import { toast } from 'sonner';

const imageWidth = 1920;
const imageHeight = 1080;

export function useMapExport() {
  const { getNodes } = useReactFlow();

  const exportAsImage = useCallback(async (format: 'png' | 'svg', fileName: string) => {
    try {
      const nodesBounds = getNodesBounds(getNodes());
      const viewport = getViewportForBounds(
        nodesBounds,
        imageWidth,
        imageHeight,
        0.5,
        2,
        0.2
      );

      const viewportElement = document.querySelector('.react-flow__viewport') as HTMLElement;

      if (!viewportElement) {
        throw new Error('Could not find canvas viewport');
      }

      // Temporarily adjust viewport for export
      const originalTransform = viewportElement.style.transform;
      viewportElement.style.transform = `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`;

      let dataUrl: string;

      if (format === 'png') {
        dataUrl = await toPng(viewportElement, {
          backgroundColor: '#ffffff',
          width: imageWidth,
          height: imageHeight,
          style: {
            width: `${imageWidth}px`,
            height: `${imageHeight}px`,
          },
        });
      } else {
        dataUrl = await toSvg(viewportElement, {
          backgroundColor: '#ffffff',
          width: imageWidth,
          height: imageHeight,
          style: {
            width: `${imageWidth}px`,
            height: `${imageHeight}px`,
          },
        });
      }

      // Restore original transform
      viewportElement.style.transform = originalTransform;

      // Download the image
      const link = document.createElement('a');
      link.download = `${fileName}.${format}`;
      link.href = dataUrl;
      link.click();

      toast.success(`Exported as ${format.toUpperCase()}`);
      return true;
    } catch (error) {
      console.error('Error exporting map:', error);
      toast.error('Failed to export map');
      return false;
    }
  }, [getNodes]);

  const exportAsPng = useCallback((fileName: string) => {
    return exportAsImage('png', fileName);
  }, [exportAsImage]);

  const exportAsSvg = useCallback((fileName: string) => {
    return exportAsImage('svg', fileName);
  }, [exportAsImage]);

  return {
    exportAsPng,
    exportAsSvg,
  };
}
