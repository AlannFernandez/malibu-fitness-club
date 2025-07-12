import {supabase} from "./supabase";
import {BodyMeasurement} from "@/interfaces/body-measurement";

export type {BodyMeasurement};

export const bodyMeasurementService = {

    async getMeasurementsByUser(userId: string): Promise<BodyMeasurement[]> {
        const {data, error} = await supabase
            .from("body_measurements")
            .select("*")
            .eq("user_id", userId)
            .order("measurement_date", {ascending: false})
            .limit(5);
        if (error) throw new Error(`Error obteniendo mediciones: ${error.message}`);
        return data as BodyMeasurement[];
    },

    async addMeasurement(measurement: Omit<BodyMeasurement, "id" | "created_at">) {
        const {data, error} = await supabase
            .from("body_measurements")
            .insert([measurement])
            .select()
            .single();
        if (error) throw new Error(`Error agregando medición: ${error.message}`);
        return data as BodyMeasurement;
    },
};