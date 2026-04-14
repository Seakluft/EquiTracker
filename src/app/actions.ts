"use server";

import { prisma } from "@/lib/prisma";
import { fetchZoneBHolidays, isHoliday, generateSaturdays } from "@/services/holiday";
import { revalidatePath } from "next/cache";

// --- Settings ---
export async function getSettings() {
  let settings = await prisma.settings.findFirst();
  if (!settings) {
    settings = await prisma.settings.create({ data: { id: 1 } });
  }
  return settings;
}

export async function updateSettings(data: { licensePrice: number; annualFee: number }) {
  await prisma.settings.update({
    where: { id: 1 },
    data,
  });
  revalidatePath("/settings");
}

// --- Horses ---
export async function getHorses() {
  return await prisma.horse.findMany({ orderBy: { name: "asc" } });
}

export async function addHorse(data: { name: string; imageUrl?: string }) {
  await prisma.horse.create({ data });
  revalidatePath("/settings");
  revalidatePath("/");
}

export async function updateHorse(id: string, data: { name: string; imageUrl?: string }) {
  await prisma.horse.update({ where: { id }, data });
  revalidatePath("/settings");
  revalidatePath("/");
}

export async function deleteHorse(id: string) {
  await prisma.horse.delete({ where: { id } });
  revalidatePath("/settings");
  revalidatePath("/");
}

// --- Disciplines ---
export async function getDisciplines() {
  return await prisma.discipline.findMany({ orderBy: { name: "asc" } });
}

export async function addDiscipline(data: { name: string; iconUrl?: string }) {
  await prisma.discipline.create({ data });
  revalidatePath("/settings");
  revalidatePath("/");
}

export async function updateDiscipline(id: string, data: { name: string; iconUrl?: string }) {
  await prisma.discipline.update({ where: { id }, data });
  revalidatePath("/settings");
  revalidatePath("/");
}

export async function deleteDiscipline(id: string) {
  await prisma.discipline.delete({ where: { id } });
  revalidatePath("/settings");
  revalidatePath("/");
}

// --- Lessons ---
export async function getLessons() {
  return await prisma.lesson.findMany({
    include: { horse: true, discipline: true },
    orderBy: { date: "asc" },
  });
}

export async function updateLesson(id: string, data: {
  isAbsent?: boolean;
  horseId?: string | null;
  disciplineId?: string | null;
  notes?: string | null;
}) {
  await prisma.lesson.update({
    where: { id },
    data,
  });
  revalidatePath("/");
  revalidatePath("/stats");
}

export async function createLesson(date: Date) {
  const lesson = await prisma.lesson.create({
    data: { date },
  });
  revalidatePath("/");
  revalidatePath("/stats");
  return lesson;
}

export async function generateSeason(year: number) {
  const holidays = await fetchZoneBHolidays(year);
  const saturdays = generateSaturdays(year);

  for (const date of saturdays) {
    const holiday = isHoliday(date, holidays);
    const existing = await prisma.lesson.findFirst({
      where: { date: { equals: date } }
    });

    if (holiday) {
      // Si c'est un jour de vacances, on s'assure qu'aucune leçon n'existe
      if (existing) {
        await prisma.lesson.delete({
          where: { id: existing.id }
        });
      }
    } else {
      // Si ce n'est pas les vacances, on s'assure que la leçon existe
      if (!existing) {
        await prisma.lesson.create({
          data: { date }
        });
      }
    }
  }
  revalidatePath("/");
  revalidatePath("/stats");
}
