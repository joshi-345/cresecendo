import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain an uppercase letter")
    .regex(/[0-9]/, "Password must contain a number"),
  role: z.enum(["artist", "label", "producer", "marketer", "other"]),
});

export const predictionSchema = z.object({
  spotifyUrl: z
    .string()
    .url("Please enter a valid URL")
    .regex(/spotify\.com/, "Must be a Spotify URL")
    .optional(),
  songTitle: z.string().min(1).optional(),
  artistName: z.string().min(1).optional(),
});

export const songSearchSchema = z.object({
  query: z.string().min(1, "Search query is required"),
  genre: z.string().optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type PredictionInput = z.infer<typeof predictionSchema>;
export type SongSearchInput = z.infer<typeof songSearchSchema>;
