"use client";
import { Scanner as BarcodeScanner, IDetectedBarcode } from "@yudiel/react-qr-scanner";
import { LinearProgress } from "@mui/material"
import { useState } from "react";

export default function Scanner() {
    let data: Record<number, string[]> = {};
    const [progress, setProgress] = useState(0);
    const [progressBuffer, setProgressBuffer] = useState(0);
    const [description, setDescription] = useState("Use the device to scan the pixel area...");

    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const handleScan = (detectedCodes: IDetectedBarcode[]) => {
        if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
        }

        detectedCodes.forEach(detectedCode => {
            const value = detectedCode.rawValue;
            const counter = Math.floor(Math.floor(Date.now() / 1000) / 2);
            if (!data[counter]) {
                data[counter] = [];
            }
            if (!data[counter].includes(value)) {
                data[counter].push(value);
            }
        });

        const keys = Object.keys(data).map(Number).sort((a, b) => a - b);
        setDescription("Holding your device until the progress bar is full...");

        let consecutiveCount = 1;
        for (let i = 1; i < keys.length; i++) {
            if (keys[i] === keys[i - 1] + 1 && consecutiveCount < 4) {
                consecutiveCount++;
            } else {
                break;
            }
        }
        setProgress((consecutiveCount / 4) * 100);
        setProgressBuffer(old => Math.max(old, (consecutiveCount / 4) * 100));

        if (consecutiveCount >= 4) {
            setDescription("DONE! You are ready to go!");
        } else {
            timeoutId = setTimeout(() => {
                if (progress < 100) {
                    setProgress(0);
                    setDescription("Scan timed out. Please try again.");
                    data = {};
                }
            }, 3000);
        }

        console.log(data);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            <div style={{ flex: 8, overflow: 'hidden' }}>
                <BarcodeScanner onScan={handleScan} formats={["data_matrix"]} components={{ finder: false }} paused={progress == 100} sound={false}/>
            </div>
            <div style={{ flex: 2, marginTop: "1em" }}>
                <LinearProgress variant="buffer" value={progress} valueBuffer={progressBuffer} color={progress == 100 ? "success" : "primary"} />
                <p>{description}</p>
            </div>
        </div>
    );
}
