# Places an order from requested cart lines. Prices come from the database, never
# the client, and stock is decremented under a row lock so concurrent checkouts
# cannot oversell.
class OrderPlacement
  class Error < StandardError; end

  def initialize(customer_attributes:, requested_lines:)
    @customer_attributes = customer_attributes
    @requested_lines = requested_lines
  end

  def place!
    raise Error, "Your cart is empty" if @requested_lines.blank?

    Order.transaction do
      order = Order.new(@customer_attributes.merge(total_cents: 0))

      quantities_by_product_id.each do |product_id, quantity|
        product = Product.lock.find_by(id: product_id)
        raise Error, "A product in your cart is no longer available" unless product
        raise Error, "Only #{product.stock_quantity} of #{product.name} left in stock" if product.stock_quantity < quantity

        product.update!(stock_quantity: product.stock_quantity - quantity)
        order.order_items.build(product: product, quantity: quantity, unit_price_cents: product.price_cents)
      end

      order.total_cents = order.order_items.sum(&:line_total_cents)
      order.save!
      order
    end
  end

  private

  def quantities_by_product_id
    @requested_lines.each_with_object(Hash.new(0)) do |line, totals|
      quantity = line[:quantity].to_i
      raise Error, "Quantities must be at least 1" unless quantity.positive?

      totals[line[:product_id].to_i] += quantity
    end
  end
end
