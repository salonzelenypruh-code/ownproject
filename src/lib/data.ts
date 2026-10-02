import "server-only";
import { cache } from "react";
import { and, asc, eq, inArray } from "drizzle-orm";
import { db, schema } from "@/db";
import type { Category, PhotoPlace } from "@/db/schema";

export const getServices = cache(async (cats: Category[]) =>
  db.select().from(schema.services)
    .where(and(inArray(schema.services.category, cats), eq(schema.services.published, true)))
    .orderBy(asc(schema.services.sortOrder), asc(schema.services.id)));

export const getPhotos = cache(async (place: PhotoPlace) =>
  db.select().from(schema.photos).where(eq(schema.photos.place, place))
    .orderBy(asc(schema.photos.sortOrder), asc(schema.photos.id)));

export const getPublishedReviews = cache(async () =>
  db.select().from(schema.reviews).where(eq(schema.reviews.published, true))
    .orderBy(asc(schema.reviews.sortOrder), asc(schema.reviews.id)));
