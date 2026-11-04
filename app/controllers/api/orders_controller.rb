module Api
  class OrdersController < ApplicationController
    def create
      order = OrderPlacement.new(customer_attributes: customer_params.to_h, requested_lines: line_params).place!
      render json: { id: order.id, total_cents: order.total_cents, status: order.status }, status: :created
    rescue OrderPlacement::Error => error
      render json: { errors: [ error.message ] }, status: :unprocessable_entity
    rescue ActiveRecord::RecordInvalid => error
      render json: { errors: error.record.errors.full_messages }, status: :unprocessable_entity
    end

    private

    def customer_params
      params.require(:order).permit(:customer_name, :customer_email, :shipping_address)
    end

    def line_params
      params.require(:order).permit(items: %i[product_id quantity]).fetch(:items, []).map(&:to_h).map(&:symbolize_keys)
    end
  end
end
