catalog = {
  { name: "Papers", slug: "papers", description: "Writing, craft and specialty papers." } => [
    [ "Kraft Paper Roll 30m", 1299, 40, "Natural brown kraft roll, 70gsm, 50cm wide." ],
    [ "Handmade Cotton Paper (10 sheets)", 1899, 25, "Deckle-edged A4 sheets made from recycled cotton." ],
    [ "Origami Paper Pack (200 sheets)", 899, 60, "15x15cm sheets in 40 colours." ],
    [ "Watercolour Paper Pad A4", 1499, 30, "300gsm cold-press, 12 sheets." ]
  ],
  { name: "Gift Wrap", slug: "gift-wrap", description: "Wrapping paper for every occasion." } => [
    [ "Botanical Gift Wrap (3 sheets)", 699, 80, "Recyclable printed wrap, 50x70cm sheets." ],
    [ "Metallic Gold Wrap Roll", 999, 45, "Foil-finish roll, 2m x 70cm." ],
    [ "Kids Birthday Wrap Set", 799, 50, "Four bright patterns with matching tags." ],
    [ "Tissue Paper Bundle (20 sheets)", 499, 100, "Acid-free tissue in mixed pastels." ]
  ],
  { name: "Paper Bags", slug: "paper-bags", description: "Shopping, gift and kraft bags." } => [
    [ "Kraft Shopping Bags (25 pack)", 1599, 35, "Twisted handles, 32x12x42cm." ],
    [ "Small Gift Bags (10 pack)", 899, 70, "Matte white bags with ribbon handles." ],
    [ "Bottle Gift Bag", 349, 90, "Fits standard 75cl bottles." ],
    [ "Flat Paper Bags (100 pack)", 1199, 20, "Grease-resistant, ideal for bakeries." ]
  ],
  { name: "Accessories", slug: "accessories", description: "Ribbons, tags, tape and finishing touches." } => [
    [ "Satin Ribbon Set (6 colours)", 799, 55, "10m of each colour, 10mm wide." ],
    [ "Kraft Gift Tags (50 pack)", 399, 120, "Pre-strung with jute twine." ],
    [ "Washi Tape Set (10 rolls)", 649, 65, "Patterned decorative tape." ],
    [ "Jute Twine Spool 100m", 549, 40, "Natural 3-ply twine." ]
  ]
}

catalog.each do |category_attributes, product_rows|
  category = Category.find_or_create_by!(slug: category_attributes[:slug]) do |new_category|
    new_category.assign_attributes(category_attributes)
  end

  product_rows.each do |name, price_cents, stock_quantity, description|
    slug = name.parameterize
    Product.find_or_create_by!(slug: slug) do |product|
      product.assign_attributes(
        category: category, name: name, price_cents: price_cents, stock_quantity: stock_quantity,
        description: description, image_url: "https://picsum.photos/seed/#{slug}/600/450"
      )
    end
  end
end
