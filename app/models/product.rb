class Product < ApplicationRecord
  belongs_to :category

  validates :name, presence: true
  validates :slug, presence: true, uniqueness: true
  validates :price_cents, numericality: { only_integer: true, greater_than: 0 }
  validates :stock_quantity, numericality: { only_integer: true, greater_than_or_equal_to: 0 }

  scope :in_category, ->(category_slug) { joins(:category).where(categories: { slug: category_slug }) }
  scope :matching, ->(search_term) { where("products.name LIKE :term OR products.description LIKE :term", term: "%#{sanitize_sql_like(search_term)}%") }

  def in_stock?
    stock_quantity.positive?
  end
end
