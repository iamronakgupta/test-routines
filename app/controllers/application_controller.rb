class ApplicationController < ActionController::Base
  # JSON API consumed by the React storefront; no browser form submissions.
  protect_from_forgery with: :null_session

  rescue_from ActiveRecord::RecordNotFound do
    render json: { errors: [ "Not found" ] }, status: :not_found
  end
end
