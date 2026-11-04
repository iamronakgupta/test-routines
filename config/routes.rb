Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check

  namespace :api do
    resources :categories, only: :index
    resources :products, only: %i[index show]
    resources :orders, only: :create
  end
end
