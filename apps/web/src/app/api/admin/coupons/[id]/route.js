import { coupons } from "@mushk/db";
import { crudItemRoutes } from "@/lib/crud";
import { couponUpdateSchema } from "@/lib/validation";

export const { GET, PATCH, DELETE } = crudItemRoutes(coupons, couponUpdateSchema, {
  prepare(data) {
    if (data.code) data.code = data.code.toUpperCase().trim();
  },
});
