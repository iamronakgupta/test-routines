require "test_helper"

class ProductTest < ActiveSupport::TestCase
  test "is in stock only while stock quantity is positive" do
    product = products(:gold_wrap_roll)
    assert product.in_stock?

    product.stock_quantity = 0
    assert_not product.in_stock?
  end

  test "requires a positive price" do
    product = products(:kraft_bags)
    product.price_cents = 0

    assert_not product.valid?
    assert_includes product.errors[:price_cents], "must be greater than 0"
  end
end
