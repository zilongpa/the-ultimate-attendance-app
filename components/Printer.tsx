// By Junhui Huang

"use client";
import * as OTPAuth from "otpauth";
import Barcode from "@/components/Barcode";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { BSON } from 'bson';

/**
 * Printer component renders four rotating OTP barcodes with periodic updates.
 * @param secrets - Array of 4 Base32-encoded secrets used to generate OTPs.
 * @param period  - Time interval (in seconds) for OTP regeneration.
 * @param digits  - Number of digits in each OTP code.
 */
export default function Printer({
    secrets,
    period,
    digits,
    sessionId
}: { secrets: string[], period: number, digits: number, sessionId: number }) {
    const [origin, setOrigin] = useState<string | null>(null);

    // Ensure exactly four secrets are provided, as the component is designed for four barcodes.
    if (secrets.length !== 4) {
        throw new Error("Printer component requires exactly 4 secrets.");
    }

    useEffect(() => {
        // Check if the window object is available (i.e., the code is running in a browser environment).
        if (typeof window !== "undefined") {
            setOrigin(window.location.origin); // Set the origin to the current window's location.
        }
    }, []);


    // Initialize four TOTP instances using the provided secrets, period, and digits.
    const totps = Array.from({ length: 4 }, (_, index) =>
        new OTPAuth.TOTP({
            digits,
            period,
            secret: OTPAuth.Secret.fromBase32(secrets[index]),
        })
    );

    // State to store the current OTP values for the barcodes.
    const [barcodeData, setBarcodeData] = useState(
        totps.map((totp) => btoa(String.fromCharCode(...Array.from(BSON.serialize({ s: sessionId, c: totp.generate() }))))) // Generate initial OTPs and serialize them to BSON format.
    );

    // State to manage the blur animation during barcode updates.
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        // Function to update the barcode data with a brief blur animation.
        const updateBarcode = () => {
            setIsUpdating(true); // Trigger blur animation.
            setTimeout(() => {
                setBarcodeData(totps.map((totp) => btoa(String.fromCharCode(...BSON.serialize({ s: sessionId, c: totp.generate() }))))); // Generate new OTPs.
                setIsUpdating(false); // End blur animation.
            }, 300); // Animation duration.
        };

        // Perform an initial update and set up periodic updates based on the TOTP period.
        updateBarcode();
        const intervals = totps.map((totp) =>
            setInterval(updateBarcode, totp.period * 1000)
        );

        // Clean up intervals when the component is unmounted.
        return () => intervals.forEach((interval) => clearInterval(interval));
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        // The component creates a grid of 4 Data Matrix barcodes (a type of 2D barcode).
        // Data Matrix is chosen because it is fast to scan, similar to QR codes, and allows for a compact layout.
        // The barcodes are arranged in a 2x2 grid to form a larger bordered box, which can confuse casual observers.
        // Motion Framer is used to apply a blur animation during updates, ensuring scanners lose focus momentarily
        // before reading the new codes. This increases the likelihood of valid codes being scanned.
        <motion.div
            initial={{ opacity: 1, filter: "blur(10px)" }}
            animate={{
                opacity: isUpdating ? 0.5 : 1,
                filter: isUpdating ? "blur(10px)" : "blur(0px)",
            }}
            transition={{ duration: 0.3 }}
            style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                columnGap: "4%",
                rowGap: "4%",
                backgroundColor: "white",
                padding: "1em",
                borderRadius: "0.5em",
                paddingBottom: "calc(1em + 3%)",
            }}
        >
            {barcodeData.map((data, index) => (
                // Render each barcode with a unique rotation (0, 90, 180, or 270 degrees).
                <Barcode key={index} data={index === 0 && origin ? `${origin}/scan?d=${data}` : data} rotate={index === 0 && origin ? 2 : index % 4 as 0 | 1 | 2 | 3} isQR={!!(index === 0 && origin)} />
            ))}
        </motion.div>
    );
}
