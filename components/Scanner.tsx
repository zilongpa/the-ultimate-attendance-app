"use client";
import { Scanner as BarcodeScanner, IDetectedBarcode } from "@yudiel/react-qr-scanner";
import { LinearProgress, Typography } from "@mui/material"
import { useState } from "react";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { motion } from "motion/react";
import { useRouter } from "next/navigation";

export default function Scanner() {
    let data: Record<number, string[]> = {};
    const [progress, setProgress] = useState(0);
    const [progressBuffer, setProgressBuffer] = useState(0);
    const [description, setDescription] = useState("Use your device to scan the pixel area...");
    const [pauseCamera, setPauseCamera] = useState(false);

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

    const router = useRouter()

    return (
        <BarcodeScanner
            onScan={handleScan}
            formats={["data_matrix"]}
            components={{ finder: false }}
            paused={pauseCamera}
            sound={false}
            styles={{ container: { height: "100%", width: "100%", background: "grey" }, video: { filter: progress === 100 ? 'blur(20px)' : 'none', transition: 'filter 1s ease' } }}
        >
            {progress === 100 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, ease: "easeInOut" }}
                    onAnimationComplete={() => {
                        setPauseCamera(true);
                        router.push("/")
                    }}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'green',
                        zIndex: 1,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        color: 'white',
                        fontSize: '1.5em',
                        fontWeight: 'bold',
                    }}
                >
                    <CheckCircleOutlineIcon sx={{ fontSize: "5em" }} />
                </motion.div>
            )}
            <div
                style={{
                    position: 'absolute',
                    bottom: '2em',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: "30em",
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    borderRadius: '1em',
                    padding: '1em',
                    zIndex: 1
                }}
            >
                <LinearProgress variant="buffer" value={progress} valueBuffer={progressBuffer} color={progress === 100 ? "success" : "info"} />
                <Typography sx={{ color: 'white', margin: '0.5em 0 0 0', textAlign: 'center' }}>{description}</Typography>
            </div>
        </BarcodeScanner>

    );
}
