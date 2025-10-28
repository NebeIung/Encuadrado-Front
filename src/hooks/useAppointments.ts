import { useQuery } from "@tanstack/react-query";

export function useAppointments(userEmail: string) {
  return useQuery({
    queryKey: ["appointments", userEmail],
    queryFn: async () => {
      const res = await fetch(`http://localhost:5000/appointments?user=${userEmail}`);
      if (!res.ok) throw new Error("Error al cargar agendamientos");
      return res.json();
    },
  });
}