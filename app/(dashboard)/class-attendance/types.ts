// By Yiyun Sun
import { DataModel } from "@toolpad/core/Crud";

export interface Attendance extends DataModel {
    id: number;
    name: string;
    email: string;
    time: Date; // ISO format string
    status: "present";
}