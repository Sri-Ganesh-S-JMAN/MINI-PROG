import { prisma } from "@/lib/prisma";

/**
 * Generates a project ID from the client name.
 * Format: first 3 letters of client name (uppercase) + zero-padded sequential count
 * e.g. "Microsoft" → "MIC001", next "Microchip" → "MIC002" (same prefix shares counter)
 */
export async function generateProjectId(clientName: string): Promise<string> {
  const prefix = clientName.trim().slice(0, 3).toUpperCase();

  const count = await prisma.project.count({
    where: {
      id: { startsWith: prefix },
    },
  });

  return `${prefix}${String(count + 1).padStart(3, "0")}`;
}
