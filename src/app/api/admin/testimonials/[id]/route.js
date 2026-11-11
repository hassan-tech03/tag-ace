import { testimonials } from "@/lib/db";
import { crudItemRoutes } from "@/lib/db/crud";
import { testimonialUpdateSchema } from "@/lib/validation";

export const { GET, PATCH, DELETE } = crudItemRoutes(testimonials, testimonialUpdateSchema);
