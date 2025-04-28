import { DataModel } from "@toolpad/core/Crud";

export interface User extends DataModel {
    id: number;
    name: string;
    email: string;
    role: string;
}
