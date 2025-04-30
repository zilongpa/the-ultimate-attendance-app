// By Junhui Huang
"use client";
import React from "react";
import * as OTPAuth from "otpauth";
import Barcode from "@/components/Barcode";
import { useEffect, useState } from "react";
import { motion } from "motion/react"

export default function Printer({ secrets, period, digits }: { secrets: string[]; period: number; digits: number }) {
    if (secrets.length !== 4) {
        throw new Error("Printer component requires exactly 4 secrets.");
    }

    const totps = Array.from({ length: 4 }, (_, index) =>
        new OTPAuth.TOTP({
            digits: digits,
            period: period,
            secret: OTPAuth.Secret.fromBase32(secrets[index]),
        })
    );

    const [barcodeData, setBarcodeData] = useState(totps.map(totp => totp.generate()));
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        const updateBarcode = () => {
            setIsUpdating(true);
            setTimeout(() => {
                setBarcodeData(totps.map(totp => totp.generate()));
                setIsUpdating(false);
            }, 300);
        };

        updateBarcode();
        const intervals = totps.map(totp => setInterval(updateBarcode, totp.period * 1000));

        return () => intervals.forEach(interval => clearInterval(interval));
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <motion.div
            initial={{ opacity: 1, filter: "blur(10px)" }}
            animate={{
                opacity: isUpdating ? 0.5 : 1,
                filter: isUpdating ? "blur(10px)" : "blur(0px)",
            }}
            transition={{ duration: 0.3 }}
            style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px", backgroundColor: "white", padding: "1em", borderRadius: "0.5em" }}
        >
            {barcodeData.map((data, index) => (
                <Barcode key={index} data={data} rotate={index % 4 as 0 | 1 | 2 | 3} />
            ))}
        </motion.div>
    );
}
