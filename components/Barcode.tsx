"use client";
import { toSVG } from "@bwip-js/generic";

export default function Barcode({ data, rotate }: { data: string, rotate?: 0 | 1 | 2 | 3 }, isQR?: boolean) {
    const svgString = toSVG({
        bcid: isQR ? "qrcode" : "datamatrix",
        text: data,
        scale: 3,
        rotate: (["R", "I", "N", "L",] as const)[rotate || 0]
    });

    return (
            <div
                dangerouslySetInnerHTML={{ __html: svgString }}
            />
    );
}
