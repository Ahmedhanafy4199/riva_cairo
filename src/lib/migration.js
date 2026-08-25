import { supabase } from './supabase';

/**
 * Converts a Base64 data URL string into a JavaScript File object
 */
export const base64ToFile = (dataurl, filename) => {
  try {
    const arr = dataurl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  } catch (err) {
    console.error('Error converting base64 to file:', err);
    return null;
  }
};

/**
 * Uploads a file (or base64 converted to file) to Supabase Storage product-images bucket.
 * Returns the public URL on success, or null on failure.
 */
export const uploadImageToStorage = async (fileOrBase64, filenamePrefix = 'img') => {
  try {
    let fileToUpload = fileOrBase64;

    // If string starts with data:image, convert base64 to file
    if (typeof fileOrBase64 === 'string' && fileOrBase64.startsWith('data:image')) {
      const mimeMatch = fileOrBase64.match(/data:([^;]+);/);
      const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
      const ext = mime.split('/')[1]?.replace('jpeg', 'jpg') || 'jpg';
      fileToUpload = base64ToFile(fileOrBase64, `${filenamePrefix}-${Date.now()}.${ext}`);
    } else if (typeof fileOrBase64 === 'string' && (fileOrBase64.startsWith('http://') || fileOrBase64.startsWith('https://'))) {
      // Already a web URL, no upload needed
      return fileOrBase64;
    }

    if (!fileToUpload || !(fileToUpload instanceof File)) {
      console.error('uploadImageToStorage: invalid input — not a File or base64 string', fileOrBase64);
      return null;
    }

    // Sanitize filename: remove special chars, keep only alphanumeric, dots, dashes
    const originalName = fileToUpload.name || 'image.jpg';
    const nameParts = originalName.split('.');
    const rawExt = nameParts.length > 1 ? nameParts.pop() : '';
    // Determine extension from MIME type if the file extension is missing or generic
    const mimeExt = fileToUpload.type?.split('/')[1]?.replace('jpeg', 'jpg') || '';
    const fileExt = (rawExt || mimeExt || 'jpg').toLowerCase().substring(0, 10);

    const safeName = `${filenamePrefix}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
    const filePath = `products/${safeName}`;

    // console.log(`📤 Uploading image: ${filePath} (${fileToUpload.type}, ${fileToUpload.size} bytes)`);

    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(filePath, fileToUpload, {
        cacheControl: '3600',
        upsert: false,
        contentType: fileToUpload.type || 'image/jpeg',
      });

    if (error) {
      console.error('❌ Supabase Storage upload error:', error);
      console.error('   Path attempted:', filePath);
      console.error('   File type:', fileToUpload.type);
      console.error('   File size:', fileToUpload.size);
      throw error;
    }

    const { data: publicUrlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(data.path);

    // console.log(`✅ Uploaded successfully: ${publicUrlData.publicUrl}`);
    return publicUrlData.publicUrl;
  } catch (err) {
    console.error('❌ Error uploading image to storage:', err);
    return null;
  }
};

/**
 * Safe Migration tool: Reads existing localStorage products, uploads Base64 images to Supabase Storage,
 * and inserts products into Supabase DB. Only clears localStorage after successful migration.
 */
export const migrateLocalStorageToSupabase = async () => {
  try {
    const savedProducts = localStorage.getItem('riva_products');
    if (!savedProducts) return { migrated: false, count: 0 };

    const localProducts = JSON.parse(savedProducts);
    if (!Array.isArray(localProducts) || localProducts.length === 0) {
      return { migrated: false, count: 0 };
    }

    // console.log(`Starting migration of ${localProducts.length} products from localStorage to Supabase...`);

    let migratedCount = 0;
    for (const prod of localProducts) {
      // 1. Insert product record
      const { data: insertedProduct, error: prodError } = await supabase
        .from('products')
        .insert({
          title: prod.title,
          category: prod.category || 'Bags',
          barcode: prod.barcode || null,
          price: parseFloat(prod.price),
          original_price: prod.originalPrice ? parseFloat(prod.originalPrice) : null,
          purchased_qty: parseInt(prod.purchasedQty || 0, 10),
          featured: Boolean(prod.featured),
          description: prod.description || '',
          rating: prod.rating ? parseFloat(prod.rating) : 5.0,
          reviews_count: prod.reviewsCount ? parseInt(prod.reviewsCount, 10) : 1
        })
        .select()
        .single();

      if (prodError || !insertedProduct) {
        console.error('Failed to insert product during migration:', prodError);
        continue;
      }

      // 2. Upload images and insert product_images records
      const rawImages = Array.isArray(prod.images) && prod.images.length > 0
        ? prod.images
        : (prod.image ? [prod.image] : []);

      const coverImg = prod.image || rawImages[0];

      for (let i = 0; i < rawImages.length; i++) {
        const imgItem = rawImages[i];
        let finalUrl = imgItem;

        if (imgItem && imgItem.startsWith('data:image')) {
          finalUrl = await uploadImageToStorage(imgItem, `migrated-${insertedProduct.id}-${i}`);
        }

        if (finalUrl) {
          await supabase.from('product_images').insert({
            product_id: insertedProduct.id,
            image_url: finalUrl,
            is_cover: imgItem === coverImg || i === 0,
            sort_order: i
          });
        }
      }

      migratedCount++;
    }

    // Only clear localStorage product data after successful migration
    localStorage.removeItem('riva_products');
    // console.log(`Successfully migrated ${migratedCount} products to Supabase!`);
    return { migrated: true, count: migratedCount };
  } catch (err) {
    console.error('Migration failed:', err);
    return { migrated: false, error: err };
  }
};
