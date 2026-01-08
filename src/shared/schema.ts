import { z } from "zod";
import { ObjectId } from "mongodb";

// ============= Auth Types =============
export const insertAdminSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export type Admin = z.infer<typeof insertAdminSchema>;

// ============= Media Types =============
export type MediaItem = {
  type: 'image' | 'video';
  url: string;
  order: number;
};

// ============= Lead Types =============
export const PLAN_OPTIONS = ['Express', 'Standard', 'Premium', 'Custom'] as const;

export type Lead = {
  _id?: ObjectId;
  name: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  websiteType?: string;
  plan?: (typeof PLAN_OPTIONS)[number];
  region: 'India' | 'Global';
  message: string;
  status: 'new' | 'contacted' | 'closed' | 'won';
  notes?: string;
  dealValue?: number;
  currency?: 'INR' | 'USD';
  paymentStatus?: 'pending' | 'in-progress' | 'payment-pending' | 'completed';
  followUpDate?: string;
  source?: string;
  createdAt: Date;
};

// ============= Prototype Types =============
export type Prototype = {
  _id?: ObjectId;
  title: string;
  media: MediaItem[];
  category: string;
  description: string;
  techStack: string[];
  features: string[];
  createdAt: Date;
};

// ============= Review Types =============
export type Review = {
  _id?: ObjectId;
  name: string;
  email?: string;
  rating: number; // 1-5
  message: string;
  status: 'visible' | 'hidden';
  createdAt: Date;
};
  