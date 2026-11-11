import { coupons } from "@/lib/db";
import { crudItemRoutes } from "@/lib/db/crud";
import { couponUpdateSchema } from "@/lib/validation";

export const { GET, PATCH, DELETE } = crudItemRoutes(coupons, couponUpdateSchema, {
  prepare(data) {
    if (data.code) data.code = data.code.toUpperCase().trim();
  },
});
