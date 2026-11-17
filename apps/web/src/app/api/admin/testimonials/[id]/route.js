import { testimonials } from "@mushk/db";
import { crudItemRoutes } from "@/lib/crud";
import { testimonialUpdateSchema } from "@/lib/validation";

export const { GET, PATCH, DELETE } = crudItemRoutes(testimonials, testimonialUpdateSchema);
