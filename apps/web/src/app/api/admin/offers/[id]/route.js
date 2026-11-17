import { offers } from "@mushk/db";
import { crudItemRoutes } from "@/lib/crud";
import { offerUpdateSchema } from "@/lib/validation";

export const { GET, PATCH, DELETE } = crudItemRoutes(offers, offerUpdateSchema);
