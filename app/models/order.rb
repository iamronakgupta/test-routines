class Order < ApplicationRecord
  STATUSES = %w[pending paid shipped cancelled].freeze

  has_many :order_items, dependent: :destroy

  validates :customer_name, :shipping_address, presence: true
  validates :customer_email, presence: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :status, inclusion: { in: STATUSES }
  validates :total_cents, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
end
