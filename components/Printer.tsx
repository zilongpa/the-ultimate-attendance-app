"use client";
import React from "react";
import * as OTPAuth from "otpauth";
import Barcode from "@/components/Barcode";
import { useEffect, useState } from "react";
import { motion } from "motion/react"

export default function Printer() {
    const totps = Array(4).fill(null).map(() =>
        new OTPAuth.TOTP({
            algorithm: "SHA1",
            digits: 8,
            period: 2,
            secret: new OTPAuth.Secret(),
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
            style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" }}
        >
            {barcodeData.map((data, index) => (
                <Barcode key={index} data={data} rotate={index % 4 as 0 | 1 | 2 | 3} />
            ))}
        </motion.div>
    );
}
