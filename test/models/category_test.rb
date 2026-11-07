require "test_helper"

class CategoryTest < ActiveSupport::TestCase
  test "is valid with a name and a unique slug" do
    category = Category.new(name: "Ribbons", slug: "ribbons")

    assert category.valid?
  end

  test "requires a name" do
    category = Category.new(slug: "ribbons")

    assert_not category.valid?
    assert_includes category.errors[:name], "can't be blank"
  end

  test "requires a slug" do
    category = Category.new(name: "Ribbons")

    assert_not category.valid?
    assert_includes category.errors[:slug], "can't be blank"
  end

  test "rejects a slug already used by another category" do
    category = Category.new(name: "Other Wrap", slug: categories(:gift_wrap).slug)

    assert_not category.valid?
    assert_includes category.errors[:slug], "has already been taken"
  end

  test "owns its products" do
    assert_includes categories(:gift_wrap).products, products(:gold_wrap_roll)
    assert_not_includes categories(:gift_wrap).products, products(:kraft_bags)
  end

  test "cannot be destroyed while it still has products" do
    category = categories(:paper_bags)

    assert_no_difference -> { Category.count } do
      assert_not category.destroy
    end
    assert_not_empty category.errors[:base]
  end

  test "can be destroyed once it has no products" do
    empty_category = Category.create!(name: "Ribbons", slug: "ribbons")

    assert_difference -> { Category.count }, -1 do
      assert empty_category.destroy
    end
  end
end
