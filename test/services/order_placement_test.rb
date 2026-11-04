require "test_helper"

class OrderPlacementTest < ActiveSupport::TestCase
  setup do
    @gold_wrap_roll = products(:gold_wrap_roll)
    @kraft_bags = products(:kraft_bags)
    @customer_attributes = { customer_name: "Ada", customer_email: "ada@example.com", shipping_address: "1 Paper St" }
  end

  def place_order(requested_lines, customer_attributes: @customer_attributes)
    OrderPlacement.new(customer_attributes: customer_attributes, requested_lines: requested_lines).place!
  end

  test "creates a persisted pending order priced from the database" do
    order = place_order([ { product_id: @gold_wrap_roll.id, quantity: 2 }, { product_id: @kraft_bags.id, quantity: 1 } ])

    assert order.persisted?
    assert_equal "pending", order.status
    assert_equal 2 * 999 + 1599, order.total_cents
    assert_equal [ 999, 1599 ], order.order_items.map(&:unit_price_cents).sort
  end

  test "decrements stock for each product" do
    place_order([ { product_id: @gold_wrap_roll.id, quantity: 2 }, { product_id: @kraft_bags.id, quantity: 4 } ])

    assert_equal 1, @gold_wrap_roll.reload.stock_quantity
    assert_equal 6, @kraft_bags.reload.stock_quantity
  end

  test "merges duplicate lines for the same product and accepts string values" do
    order = place_order([ { product_id: @gold_wrap_roll.id.to_s, quantity: "1" }, { product_id: @gold_wrap_roll.id, quantity: 2 } ])

    assert_equal 1, order.order_items.size
    assert_equal 3, order.order_items.first.quantity
    assert_equal 0, @gold_wrap_roll.reload.stock_quantity
  end

  test "allows ordering exactly the remaining stock" do
    assert_nothing_raised { place_order([ { product_id: @gold_wrap_roll.id, quantity: 3 } ]) }
  end

  test "rejects an empty cart" do
    error = assert_raises(OrderPlacement::Error) { place_order([]) }
    assert_equal "Your cart is empty", error.message

    assert_raises(OrderPlacement::Error) { place_order(nil) }
  end

  test "rejects zero, negative and non-numeric quantities" do
    [ 0, -1, "abc", nil ].each do |bad_quantity|
      error = assert_raises(OrderPlacement::Error) { place_order([ { product_id: @kraft_bags.id, quantity: bad_quantity } ]) }
      assert_equal "Quantities must be at least 1", error.message
    end
  end

  test "rejects a quantity above available stock and names the product" do
    error = assert_raises(OrderPlacement::Error) { place_order([ { product_id: @gold_wrap_roll.id, quantity: 4 } ]) }

    assert_equal "Only 3 of Gold Wrap Roll left in stock", error.message
  end

  test "rejects unknown products" do
    error = assert_raises(OrderPlacement::Error) { place_order([ { product_id: 0, quantity: 1 } ]) }

    assert_equal "A product in your cart is no longer available", error.message
  end

  test "rolls back stock and orders when a later line fails" do
    assert_no_difference -> { Order.count } do
      assert_raises(OrderPlacement::Error) do
        place_order([ { product_id: @kraft_bags.id, quantity: 2 }, { product_id: @gold_wrap_roll.id, quantity: 99 } ])
      end
    end

    assert_equal 10, @kraft_bags.reload.stock_quantity
  end

  test "rolls back stock when the customer details are invalid" do
    assert_no_difference -> { Order.count } do
      assert_raises(ActiveRecord::RecordInvalid) do
        place_order([ { product_id: @kraft_bags.id, quantity: 2 } ], customer_attributes: @customer_attributes.merge(customer_email: "nope"))
      end
    end

    assert_equal 10, @kraft_bags.reload.stock_quantity
  end
end
