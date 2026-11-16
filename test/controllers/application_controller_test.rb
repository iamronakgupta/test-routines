require "test_helper"

class ApplicationControllerTest < ActionDispatch::IntegrationTest
  test "renders a JSON 404 for missing records" do
    get api_product_path("does-not-exist")

    assert_response :not_found
    assert_equal [ "Not found" ], response.parsed_body["errors"]
  end

  test "accepts JSON posts without a CSRF token even when forgery protection is on" do
    original = ActionController::Base.allow_forgery_protection
    ActionController::Base.allow_forgery_protection = true

    assert_difference -> { Order.count }, 1 do
      post api_orders_path,
           params: { order: { customer_name: "Ada", customer_email: "ada@example.com", shipping_address: "1 Paper St",
                              items: [ { product_id: products(:kraft_bags).id, quantity: 1 } ] } },
           as: :json
    end
    assert_response :created
  ensure
    ActionController::Base.allow_forgery_protection = original
  end
end
