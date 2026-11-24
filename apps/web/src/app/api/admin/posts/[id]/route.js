import { posts } from "@mushk/db";
import { crudItemRoutes } from "@/lib/crud";
import { postUpdateSchema } from "@/lib/validation";
import { preparePost } from "@/lib/blog";

export const { GET, PATCH, DELETE } = crudItemRoutes(posts, postUpdateSchema, {
  prepare: preparePost,
});
