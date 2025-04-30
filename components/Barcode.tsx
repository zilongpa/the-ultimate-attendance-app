// By Junhui Huang
"use client";
import { toSVG } from "@bwip-js/generic";

export default function Barcode({ data, rotate }: { data: string, rotate?: 0 | 1 | 2 | 3 }, isQR?: boolean) {
  // Generate the SVG string for the barcode or QR code
  const svgString = toSVG({
    bcid: isQR ? "qrcode" : "datamatrix", // Use "qrcode" for QR codes, "datamatrix" for Data Matrix barcodes
    text: data, // The data to encode in the barcode/QR code
    scale: 3, // Scale factor for the barcode/QR code
    rotate: (["R", "I", "N", "L",] as const)[rotate || 0] // Rotation: Right, Inverted, Normal, or Left
  });

  return (
    // The SVG generated is a rectangle instead of a square, so a negative margin-bottom is applied to adjust the layout
    <div style={{ width: "100%", height: "100%", marginBottom: "-5px" }}
      dangerouslySetInnerHTML={{ __html: svgString }}
    />
  );
}
