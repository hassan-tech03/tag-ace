import { offers } from "@/lib/db";
import { crudItemRoutes } from "@/lib/db/crud";
import { offerUpdateSchema } from "@/lib/validation";

export const { GET, PATCH, DELETE } = crudItemRoutes(offers, offerUpdateSchema);
