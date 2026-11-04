module Api
  class CategoriesController < ApplicationController
    def index
      categories = Category.order(:name)
      render json: categories.as_json(only: %i[id name slug description])
    end
  end
end
