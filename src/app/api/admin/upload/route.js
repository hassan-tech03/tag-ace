import { NextResponse } from "next/server";
import { adminRoute } from "@/lib/api";
import { getCloudinary, isCloudinaryConfigured } from "@/lib/cloudinary";

// Accepts multipart/form-data with a single `file` field, streams it to
// Cloudinary, and returns { url, publicId }. Used by the product image
// uploader in the admin UI.
export const POST = adminRoute(async (request) => {
  if (!isCloudinaryConfigured()) {
    return NextResponse.json(
      {
        error:
          "Cloudinary is not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to .env.local, or paste an image URL manually.",
      },
      { status: 503 }
    );
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (!file.type?.startsWith("image/")) {
    return NextResponse.json({ error: "File must be an image" }, { status: 400 });
  }
  const MAX_BYTES = 5 * 1024 * 1024; // 5MB
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File must be 5MB or smaller" }, { status: 413 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const cloudinary = getCloudinary();

  const result = await new Promise((resolve, reject) => {
    const upload = cloudinary.uploader.upload_stream(
      {
        folder: "mushk/products",
        resource_type: "image",
      },
      (err, res) => (err ? reject(err) : resolve(res))
    );
    upload.end(buffer);
  });

  return NextResponse.json({
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
  });
});

// Body size for FormData on this route. App Router defaults are usually OK
// but we set this explicitly so 5MB images come through.
export const runtime = "nodejs";
