import React, { useRef, useEffect, useState } from 'react';
import SignaturePadCanvas from 'signature_pad';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SignaturePadProps {
  onSignatureChange: (signature: string) => void;
  title?: string;
  initialSignature?: string;
  width?: number;
  height?: number;
}

const SignaturePad: React.FC<SignaturePadProps> = ({
  onSignatureChange,
  title = 'Firma',
  initialSignature,
  width = 400,
  height = 200
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const signaturePadRef = useRef<SignaturePadCanvas | null>(null);
  const [isEmpty, setIsEmpty] = useState(true);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      
      // Set canvas size
      canvas.width = width;
      canvas.height = height;
      
      // Initialize signature pad
      signaturePadRef.current = new SignaturePadCanvas(canvas, {
        backgroundColor: 'rgb(255, 255, 255)',
        penColor: 'rgb(0, 0, 0)',
        minWidth: 2,
        maxWidth: 4,
      });

      // Listen for signature events
      const signaturePad = signaturePadRef.current;
      
      const handleSignature = () => {
        if (signaturePad && !signaturePad.isEmpty()) {
          const dataURL = signaturePad.toDataURL();
          onSignatureChange(dataURL);
          setIsEmpty(false);
        } else {
          onSignatureChange('');
          setIsEmpty(true);
        }
      };

      signaturePad.addEventListener('endStroke', handleSignature);
      
      // Load initial signature if provided
      if (initialSignature) {
        signaturePad.fromDataURL(initialSignature);
        setIsEmpty(false);
      }

      return () => {
        signaturePad.removeEventListener('endStroke', handleSignature);
      };
    }
  }, [onSignatureChange, initialSignature, width, height]);

  const clearSignature = () => {
    if (signaturePadRef.current) {
      signaturePadRef.current.clear();
      onSignatureChange('');
      setIsEmpty(true);
    }
  };

  const undoSignature = () => {
    if (signaturePadRef.current) {
      const data = signaturePadRef.current.toData();
      if (data.length > 0) {
        data.pop();
        signaturePadRef.current.fromData(data);
        
        if (data.length === 0) {
          onSignatureChange('');
          setIsEmpty(true);
        } else {
          const dataURL = signaturePadRef.current.toDataURL();
          onSignatureChange(dataURL);
        }
      }
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 bg-background">
          <canvas
            ref={canvasRef}
            className="border border-input rounded-md bg-white cursor-crosshair w-full"
            style={{ maxWidth: '100%', height: 'auto' }}
          />
        </div>
        
        <div className="flex gap-2 justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={undoSignature}
            disabled={isEmpty}
          >
            Deshacer
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={clearSignature}
            disabled={isEmpty}
          >
            Limpiar
          </Button>
        </div>
        
        <p className="text-sm text-muted-foreground">
          Dibuje su firma en el área blanca usando el mouse o touch
        </p>
      </CardContent>
    </Card>
  );
};

export default SignaturePad;