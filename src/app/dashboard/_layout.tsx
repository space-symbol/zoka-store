import { SidbarProvider, Sidebar } from ".";
import { Slot } from "expo-router";

export default function DashboardLayout() {
    return (
        <SidbarProvider>
            <Sidebar />
            <Slot />
        </SidbarProvider>
    )
}

