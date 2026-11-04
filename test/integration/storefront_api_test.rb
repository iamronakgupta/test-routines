require "test_helper"

class StorefrontApiTest < ActionDispatch::IntegrationTest
  setup do
    @wrap_roll = products(:gold_wrap_roll)
    @kraft_bags = products(:kraft_bags)
  end

  def order_payload(items)
    { order: { customer_name: "Ada", customer_email: "ada@example.com", shipping_address: "1 Paper St", items: items } }
  end

  test "filters products by category and search term" do
    get api_products_path(category: "paper-bags")
    assert_equal [ "Kraft Bags" ], response.parsed_body.map { |product| product["name"] }

    get api_products_path(q: "gold")
    assert_equal [ "gold-wrap-roll" ], response.parsed_body.map { |product| product["slug"] }
  end

  test "shows a product by slug and 404s for unknown slugs" do
    get api_product_path("kraft-bags")
    assert_equal "Paper Bags", response.parsed_body.dig("category", "name")

    get api_product_path("missing")
    assert_response :not_found
  end

  test "places an order using database prices and decrements stock" do
    post api_orders_path, params: order_payload([ { product_id: @wrap_roll.id, quantity: 2 }, { product_id: @kraft_bags.id, quantity: 1 } ]), as: :json

    assert_response :created
    assert_equal 2 * 999 + 1599, response.parsed_body["total_cents"]
    assert_equal 1, @wrap_roll.reload.stock_quantity
    assert_equal 9, @kraft_bags.reload.stock_quantity
  end

  test "rejects an order that exceeds stock without changing anything" do
    assert_no_difference -> { Order.count } do
      post api_orders_path, params: order_payload([ { product_id: @kraft_bags.id, quantity: 1 }, { product_id: @wrap_roll.id, quantity: 4 } ]), as: :json
    end

    assert_response :unprocessable_entity
    assert_match "Only 3", response.parsed_body["errors"].first
    assert_equal 10, @kraft_bags.reload.stock_quantity
  end

  test "rejects an empty cart and invalid customer details" do
    post api_orders_path, params: order_payload([]), as: :json
    assert_response :unprocessable_entity

    post api_orders_path, params: order_payload([ { product_id: @kraft_bags.id, quantity: 1 } ]).deep_merge(order: { customer_email: "nope" }), as: :json
    assert_response :unprocessable_entity
    assert_equal 10, @kraft_bags.reload.stock_quantity
  end
end
