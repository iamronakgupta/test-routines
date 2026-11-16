require "test_helper"

class Api::OrdersControllerTest < ActionDispatch::IntegrationTest
  setup do
    @wrap_roll = products(:gold_wrap_roll)
    @kraft_bags = products(:kraft_bags)
  end

  def order_payload(items, customer_overrides = {})
    { order: { customer_name: "Grace Hopper", customer_email: "grace@example.com", shipping_address: "2 Compiler Ave", items: items }.merge(customer_overrides) }
  end

  test "creates an order and responds with id, total and pending status" do
    assert_difference [ "Order.count", "OrderItem.count" ], 1 do
      post api_orders_path, params: order_payload([ { product_id: @kraft_bags.id, quantity: 2 } ]), as: :json
    end

    assert_response :created
    body = response.parsed_body
    assert_equal Order.order(:id).last.id, body["id"]
    assert_equal 2 * 1599, body["total_cents"]
    assert_equal "pending", body["status"]
    assert_equal [ "id", "status", "total_cents" ], body.keys.sort
  end

  test "ignores client supplied prices and totals" do
    post api_orders_path,
         params: order_payload([ { product_id: @kraft_bags.id, quantity: 1, unit_price_cents: 1 } ], total_cents: 1, status: "paid"),
         as: :json

    assert_response :created
    assert_equal 1599, response.parsed_body["total_cents"]
    assert_equal "pending", response.parsed_body["status"]
    assert_equal 1599, Order.find(response.parsed_body["id"]).order_items.first.unit_price_cents
  end

  test "combines repeated lines for the same product" do
    post api_orders_path, params: order_payload([ { product_id: @wrap_roll.id, quantity: 1 }, { product_id: @wrap_roll.id, quantity: 2 } ]), as: :json

    assert_response :created
    assert_equal 3 * 999, response.parsed_body["total_cents"]
    assert_equal 0, @wrap_roll.reload.stock_quantity
  end

  test "returns a service error when the cart has no items key" do
    post api_orders_path, params: { order: { customer_name: "Grace", customer_email: "grace@example.com", shipping_address: "2 Compiler Ave" } }, as: :json

    assert_response :unprocessable_entity
    assert_equal [ "Your cart is empty" ], response.parsed_body["errors"]
  end

  test "rejects an unknown product" do
    assert_no_difference -> { Order.count } do
      post api_orders_path, params: order_payload([ { product_id: 0, quantity: 1 } ]), as: :json
    end

    assert_response :unprocessable_entity
    assert_equal [ "A product in your cart is no longer available" ], response.parsed_body["errors"]
  end

  test "rejects zero or negative quantities without touching stock" do
    [ 0, -2 ].each do |quantity|
      post api_orders_path, params: order_payload([ { product_id: @kraft_bags.id, quantity: quantity } ]), as: :json

      assert_response :unprocessable_entity
      assert_equal [ "Quantities must be at least 1" ], response.parsed_body["errors"]
    end
    assert_equal 10, @kraft_bags.reload.stock_quantity
  end

  test "returns full validation messages for invalid customer details and rolls back stock" do
    assert_no_difference -> { Order.count } do
      post api_orders_path,
           params: order_payload([ { product_id: @kraft_bags.id, quantity: 1 } ], customer_name: "", customer_email: "bad"),
           as: :json
    end

    assert_response :unprocessable_entity
    errors = response.parsed_body["errors"]
    assert_includes errors, "Customer name can't be blank"
    assert_includes errors, "Customer email is invalid"
    assert_equal 10, @kraft_bags.reload.stock_quantity
  end

  test "responds 400 when the order param is missing" do
    post api_orders_path, params: {}, as: :json

    assert_response :bad_request
  end
end
