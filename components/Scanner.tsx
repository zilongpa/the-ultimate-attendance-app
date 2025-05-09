// By Junhui Huang
"use client";

import { Scanner as BarcodeScanner, IDetectedBarcode, useDevices } from "@yudiel/react-qr-scanner";
import { FormControl, InputLabel, LinearProgress, MenuItem, Select, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useNotifications } from '@toolpad/core/useNotifications';


export default function Scanner({ submitAction, period }: { submitAction: (data: Record<number, string[]>) => Promise<string | null>, period: number }) {
    // Retrieve available devices for the scanner
    const devices = useDevices();
    const [progress, setProgress] = useState(0); // Current progress bar value
    const [progressBuffer, setProgressBuffer] = useState(0); // Buffer value for progress bar
    const [description, setDescription] = useState("Use your device to scan the pixel area..."); // Instructional text for the user
    const [pauseCamera, setPauseCamera] = useState(false); // State to pause the camera
    const [origin, setOrigin] = useState<string | null>(null); // Origin URL for the app
    let data: Record<number, string[]> = {}; // Stores scanned data for each timestamp
    let savedDeviceId = ""; // Saved device ID retrieved from localStorage

    useEffect(() => {
        // Check if the window object is available (i.e., the code is running in a browser environment).
        if (typeof window !== "undefined") {
            setOrigin(window.location.origin); // Set the origin to the current window's location.
        }
    }, [])

    // Retrieve saved device ID from localStorage
    // Note: Using useEffect here caused issues due to frequent updates from useDevices.
    // Defaulting to null works on most devices, except for specific cases.
    try {
        const storedDeviceId = localStorage.getItem("deviceId");
        if (storedDeviceId) {
            savedDeviceId = storedDeviceId;
        }
    } catch { }

    const [deviceId, setDeviceId] = useState(savedDeviceId); // Currently selected device ID
    const [isValid, setIsValid] = useState(false); // Validation state for successful scans

    let timeoutId: ReturnType<typeof setTimeout> | null = null; // Timeout ID for handling scan expiration

    // Handle barcode scan event
    const handleScan = async (detectedCodes: IDetectedBarcode[]) => {
        if (timeoutId) {
            clearTimeout(timeoutId); // Clear any existing timeout
            timeoutId = null;
        }

        const timestamp = Date.now(); // Current timestamp
        data[timestamp] = []; // Initialize data for the current timestamp

        // Process detected barcodes
        detectedCodes.forEach(detectedCode => {
            let value = detectedCode.rawValue;
            try {
                const url = new URL(value);
                if (origin && url.origin !== origin) {
                    return; // Ignore if the URL origin doesn't match the app's origin
                }
                const dParam = url.searchParams.get("d");
                if (dParam) {
                    value = dParam;
                }
            }
            catch { }

            if (value === null) {
                return;
            }

            console.log("Detected barcode:", value); // Log detected barcode value

            if (!data[timestamp].includes(String(value))) {
                data[timestamp].push(String(value)); // Add unique barcode values
            }
        });

        // Calculate consecutive scans within the allowed time period
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

        // Update progress bar based on consecutive scans
        setProgress((consecutiveCount / 4) * 100);
        setProgressBuffer(old => Math.max(old, (consecutiveCount / 4) * 100));

        // Validate if enough consecutive scans are detected
        if (consecutiveCount >= 4) {
            setDescription("Validating... Please wait.");
            const result = await submitAction(data); // Call submit action with scanned data
            console.log("Validation result:", result);
            if (result) {
                setDescription(result); // Display validation result
                setProgress(0);
                data = {}; // Reset scanned data
            } else {
                setDescription("Done! You are ready to go!");
                setIsValid(true); // Mark as valid
            }
        } else {
            // Set timeout for scan expiration
            timeoutId = setTimeout(() => {
                if (progress < 100) {
                    setProgress(0);
                    setDescription("Scan timed out. Please try again.");
                    data = {}; // Reset scanned data
                }
            }, (period + 1) * 1000);
        }
    };

    const router = useRouter();
    const notifications = useNotifications(); // Notifications hook for displaying messages

    return (
        <BarcodeScanner
            constraints={{
                deviceId: deviceId || undefined, // Set device constraints for the scanner
            }}
            onScan={handleScan} // Handle scan event
            onError={(error) => {
                // Handle scanner errors
                notifications.show(`Unable to activate scanner: ${String(error)}`, {
                    severity: "error",
                    autoHideDuration: 3000,
                });
                setDescription("An error occurred. Please try again.");
            }}
            formats={["data_matrix", "qr_code"]} // Supported barcode formats for optimized performance
            components={{ finder: false }} // Disable finder UI for simplicity
            paused={pauseCamera} // Pause camera if needed
            sound={false} // Disable sound for a quieter experience
            styles={{
                container: { height: "100%", width: "100%", background: "grey" },
                video: { filter: isValid ? 'blur(20px)' : 'none', transition: 'filter 1s ease' }
            }}
        >
            {/* Display success overlay when validation is complete 
                - Use Framer Motion for smooth UI transitions.
                - Gradually ease in the green overlay while blurring the camera.
                - Pause the camera and redirect after the animation completes.
            */}
            {isValid && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, ease: "easeInOut" }}
                    onAnimationComplete={() => {
                        setPauseCamera(true); // Pause camera
                        router.push("/"); // Redirect to home
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

            {/* Camera selection dropdown 
                - Render conditionally to avoid issues with MUI.
                - Allows users to select a specific camera device.
            */}
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
                        zIndex: 1, // Ensure it floats above other elements
                    }}
                >
                    <FormControl fullWidth size="small" variant="outlined" color="warning">
                        <InputLabel sx={{ color: 'white' }}>Camera</InputLabel>
                        <Select
                            color="warning"
                            value={deviceId}
                            label="Camera"
                            onChange={(e) => {
                                const value = e.target.value;
                                if (value) {
                                    localStorage.setItem("deviceId", value); // Save selected device ID
                                    setDeviceId(value);
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
            )}

            {/* Progress bar and description 
                - Displays the scanning progress and instructions for the user.
            */}
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
        </BarcodeScanner>
    );
}
