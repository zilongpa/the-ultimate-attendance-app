"use client";
import { toSVG } from "@bwip-js/generic";

export default function ({ data, rotate }: { data: string, rotate?: 0 | 1 | 2 | 3 }) {
    console.log("Data to encode:", data);
    const svgString = toSVG({
        bcid: "datamatrix",
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
