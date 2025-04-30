// Style by Kanghuan Xu

"use client";

import { toSVG } from "@bwip-js/generic";

interface BarcodeProps {
  data: string;
  rotate?: 0 | 1 | 2 | 3;
  isQR?: boolean;
}

export default function Barcode({
  data,
  rotate = 0,
  isQR = false,
}: BarcodeProps) {
  const svgString = toSVG({
    bcid: isQR ? "qrcode" : "datamatrix",
    text: data,
    scale: 3,
    rotate: (["R", "I", "N", "L"] as const)[rotate],
  });

  return (
    <>
      <div
        className="barcode-inline"
        dangerouslySetInnerHTML={{ __html: svgString }}
      />
      <style jsx>{`
        .barcode-inline {
          display: block;       
          margin: 0 auto;      
          width: 100%;
          height: auto;        
        }

        /* on phones, make it full-width */
        @media (max-width: 640px) {
          .barcode-inline {
          display: block;
          margin: 0 auto;
            width: 120%;
            height: auto;
          }
        }
      `}</style>
    </>
  );
}
