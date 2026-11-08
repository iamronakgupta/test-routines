require "test_helper"

class Api::CategoriesControllerTest < ActionDispatch::IntegrationTest
  test "lists categories ordered by name with only public fields" do
    get api_categories_path

    assert_response :success
    categories = response.parsed_body
    assert_equal [ "Gift Wrap", "Paper Bags" ], categories.map { |category| category["name"] }
    assert_equal %w[description id name slug], categories.first.keys.sort
    assert_equal "gift-wrap", categories.first["slug"]
  end

  test "includes newly created categories in alphabetical position" do
    Category.create!(name: "Ribbons", slug: "ribbons", description: "Satin and grosgrain")

    get api_categories_path

    assert_equal [ "Gift Wrap", "Paper Bags", "Ribbons" ], response.parsed_body.map { |category| category["name"] }
    assert_equal "Satin and grosgrain", response.parsed_body.last["description"]
  end

  test "returns an empty list when there are no categories" do
    OrderItem.delete_all
    Product.delete_all
    Category.delete_all

    get api_categories_path

    assert_response :success
    assert_equal [], response.parsed_body
  end
end
