require "test_helper"

class OrderTest < ActiveSupport::TestCase
  test "fixture order is valid" do
    assert orders(:pending_order).valid?
  end

  test "requires customer name and shipping address" do
    order = orders(:pending_order)
    order.customer_name = ""
    order.shipping_address = nil

    assert_not order.valid?
    assert_includes order.errors[:customer_name], "can't be blank"
    assert_includes order.errors[:shipping_address], "can't be blank"
  end

  test "requires a well-formed customer email" do
    order = orders(:pending_order)

    order.customer_email = ""
    assert_not order.valid?
    assert_includes order.errors[:customer_email], "can't be blank"

    order.customer_email = "not-an-email"
    assert_not order.valid?
    assert_includes order.errors[:customer_email], "is invalid"
  end

  test "accepts every known status and rejects unknown ones" do
    order = orders(:pending_order)

    Order::STATUSES.each do |status|
      order.status = status
      assert order.valid?, "expected status #{status} to be valid"
    end

    order.status = "refunded"
    assert_not order.valid?
    assert_includes order.errors[:status], "is not included in the list"
  end

  test "total must be a non-negative integer" do
    order = orders(:pending_order)

    order.total_cents = 0
    assert order.valid?

    order.total_cents = -1
    assert_not order.valid?

    order.total_cents = 10.5
    assert_not order.valid?
    assert_includes order.errors[:total_cents], "must be an integer"
  end

  test "destroying an order destroys its items" do
    order = orders(:pending_order)

    assert_difference -> { OrderItem.count }, -order.order_items.count do
      order.destroy
    end
  end
end
