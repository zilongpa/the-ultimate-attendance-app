// By Junhui Huang
"use client";
import { Scanner as BarcodeScanner, IDetectedBarcode, useDevices } from "@yudiel/react-qr-scanner";
import { FormControl, InputLabel, LinearProgress, MenuItem, Select, Typography } from "@mui/material"
import { useState } from "react";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useNotifications } from '@toolpad/core/useNotifications';

export default function Scanner({ submitAction, period }: { submitAction: (data: Record<number, string[]>) => Promise<string | null>, period: number }) {
    const devices = useDevices();
    let data: Record<number, string[]> = {};
    const [progress, setProgress] = useState(0);
    const [progressBuffer, setProgressBuffer] = useState(0);
    const [description, setDescription] = useState("Use your device to scan the pixel area...");
    const [pauseCamera, setPauseCamera] = useState(false);
    let savedDeviceId = "";
    try {
        const storedDeviceId = localStorage.getItem("deviceId")
        if (storedDeviceId) {
            savedDeviceId = storedDeviceId;
        }
    } catch { }
    const [deviceId, setDeviceId] = useState(savedDeviceId);
    const [isValid, setIsValid] = useState(false);

    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const handleScan = async (detectedCodes: IDetectedBarcode[]) => {
        if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
        }

        const timestamp = Date.now();
        data[timestamp] = []
        detectedCodes.forEach(detectedCode => {
            const value = detectedCode.rawValue;
            if (!data[timestamp].includes(value)) {
                data[timestamp].push(value);
            }
        });

        const keys = Object.keys(data).map(Number).sort((a, b) => a - b);
        setDescription("Holding your device until the progress bar is full...");
        let consecutiveCount = 1;
        for (let i = 1; i < keys.length; i++) {
            if (keys[i] - keys[i - 1] <= (1000 * period * 2) && consecutiveCount < 4) {
            consecutiveCount++;
            } else {
            break;
            }
        }
        setProgress((consecutiveCount / 4) * 100);
        setProgressBuffer(old => Math.max(old, (consecutiveCount / 4) * 100));

        console.log(data, keys, consecutiveCount, progress, progressBuffer);

        if (consecutiveCount >= 4) {
            setDescription("Validating... Please wait.");
            const result = await submitAction(data);
            console.log("Validation result:", result);
            if (result) {
                setDescription(result);
                setProgress(0);
                data = {};
            } else {
                setDescription("Done! You are ready to go!");
                setIsValid(true);
            }
        } else {
            timeoutId = setTimeout(() => {
                if (progress < 100) {
                    setProgress(0);
                    setDescription("Scan timed out. Please try again.");
                    data = {};
                }
            }, (period + 1) * 1000);
        }
    };

    const router = useRouter()
    const notifications = useNotifications();

    return (
        <BarcodeScanner
            constraints={{
                deviceId: deviceId || undefined,
            }}
            onScan={handleScan}
            onError={(error) => {
                notifications.show(`Unable to activate scanner: ${String(error)}`, {
                    severity: "error",
                    autoHideDuration: 3000,
                });
                setDescription("An error occurred. Please try again.");
            }}
            formats={["data_matrix"]}
            components={{ finder: false }}
            paused={pauseCamera}
            sound={false}
            styles={{ container: { height: "100%", width: "100%", background: "grey" }, video: { filter: isValid ? 'blur(20px)' : 'none', transition: 'filter 1s ease' } }}
        >
            {isValid && (
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
            {devices.length > 0 && (
                <div
                    style={{
                        position: 'absolute',
                        top: '1em',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: "20em",
                        maxWidth: "90vw",
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        borderRadius: '1em',
                        padding: '1em',
                        zIndex: 1,
                    }}
                >
                    <FormControl fullWidth size="small" variant="outlined" color="warning">
                        <InputLabel sx={{ color: 'white' }}>Camera</InputLabel>
                        <Select
                            color="warning"
                            value={deviceId}
                            label="Camera"
                            onChange={(e) => {
                                const value = e.target.value
                                if (value) {
                                    localStorage.setItem("deviceId", value)
                                    setDeviceId(value)
                                }
                            }}
                            sx={{
                                color: 'white',
                            }}
                        >
                            {devices.map((device) => (
                                <MenuItem key={device.deviceId} value={device.deviceId}>
                                    {device.label || `Camera ${devices.indexOf(device) + 1}`}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </div>
            )
            }
            <div
                style={{
                    position: 'absolute',
                    bottom: '2em',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: "30em",
                    maxWidth: "90vw",
                    backgroundColor: 'rgba(1, 1, 1, 0.5)',
                    borderRadius: '1em',
                    padding: '1em',
                    zIndex: 1
                }}
            >
                <LinearProgress variant="buffer" value={progress} valueBuffer={progressBuffer} color={isValid ? "success" : "warning"} />
                <Typography sx={{ color: 'white', margin: '0.5em 0 0 0', textAlign: 'center' }}>{description}</Typography>
            </div>
        </BarcodeScanner >
    );
}
