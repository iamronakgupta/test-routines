module Api
  class ProductsController < ApplicationController
    def index
      products = Product.includes(:category).order(:name)
      products = products.in_category(params[:category]) if params[:category].present?
      products = products.matching(params[:q]) if params[:q].present?
      render json: products.map { |product| serialize_product(product) }
    end

    def show
      product = Product.includes(:category).find_by!(slug: params[:id])
      render json: serialize_product(product)
    end

    private

    def serialize_product(product)
      product.as_json(only: %i[id name slug description price_cents stock_quantity image_url])
             .merge(category: product.category.as_json(only: %i[name slug]))
    end
  end
end
