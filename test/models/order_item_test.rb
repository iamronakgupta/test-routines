require "test_helper"

class OrderItemTest < ActiveSupport::TestCase
  test "line total is quantity times unit price" do
    assert_equal 1998, order_items(:pending_order_wrap).line_total_cents
  end

  test "is valid with fixture data" do
    assert order_items(:pending_order_wrap).valid?
  end

  test "requires a positive whole-number quantity" do
    order_item = order_items(:pending_order_wrap)

    [0, -1].each do |invalid_quantity|
      order_item.quantity = invalid_quantity
      assert_not order_item.valid?
      assert_includes order_item.errors[:quantity], "must be greater than 0"
    end

    order_item.quantity = 1.5
    assert_not order_item.valid?
    assert_includes order_item.errors[:quantity], "must be an integer"
  end

  test "requires a positive unit price" do
    order_item = order_items(:pending_order_wrap)
    order_item.unit_price_cents = 0

    assert_not order_item.valid?
    assert_includes order_item.errors[:unit_price_cents], "must be greater than 0"
  end

  test "requires an order and a product" do
    order_item = OrderItem.new(quantity: 1, unit_price_cents: 100)

    assert_not order_item.valid?
    assert_includes order_item.errors[:order], "must exist"
    assert_includes order_item.errors[:product], "must exist"
  end
end
