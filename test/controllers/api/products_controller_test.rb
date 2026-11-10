require "test_helper"

class Api::ProductsControllerTest < ActionDispatch::IntegrationTest
  test "index lists all products ordered by name" do
    get api_products_path

    assert_response :success
    assert_equal [ "Gold Wrap Roll", "Kraft Bags" ], response.parsed_body.map { |product| product["name"] }
  end

  test "index serializes only the public product fields with its category" do
    get api_products_path(category: "gift-wrap")

    product_json = response.parsed_body.first
    assert_equal %w[category description id image_url name price_cents slug stock_quantity], product_json.keys.sort
    assert_equal({ "name" => "Gift Wrap", "slug" => "gift-wrap" }, product_json["category"])
    assert_equal 999, product_json["price_cents"]
  end

  test "index returns an empty list for an unknown category or unmatched search" do
    get api_products_path(category: "no-such-category")
    assert_equal [], response.parsed_body

    get api_products_path(q: "zzz-no-match")
    assert_equal [], response.parsed_body
  end

  test "index ignores blank filters" do
    get api_products_path(category: "", q: "")

    assert_equal 2, response.parsed_body.size
  end

  test "index combines category and search filters" do
    get api_products_path(category: "paper-bags", q: "gold")
    assert_equal [], response.parsed_body

    get api_products_path(category: "paper-bags", q: "kraft")
    assert_equal [ "kraft-bags" ], response.parsed_body.map { |product| product["slug"] }
  end

  test "index search matches descriptions and is case-insensitive" do
    products(:kraft_bags).update!(description: "Sturdy carrier for groceries")

    get api_products_path(q: "GROCERIES")

    assert_equal [ "kraft-bags" ], response.parsed_body.map { |product| product["slug"] }
  end

  test "index treats LIKE wildcards in the search term literally" do
    get api_products_path(q: "%")

    assert_equal [], response.parsed_body
  end

  test "show returns the product with stock and category" do
    get api_product_path("gold-wrap-roll")

    assert_response :success
    assert_equal 3, response.parsed_body["stock_quantity"]
    assert_equal "gift-wrap", response.parsed_body.dig("category", "slug")
  end

  test "show responds with a JSON 404 for an unknown slug" do
    get api_product_path("missing")

    assert_response :not_found
    assert_equal [ "Not found" ], response.parsed_body["errors"]
  end
end
