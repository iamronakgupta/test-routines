class CreateOrders < ActiveRecord::Migration[7.2]
  def change
    create_table :orders do |t|
      t.string :customer_name, null: false
      t.string :customer_email, null: false
      t.text :shipping_address, null: false
      t.integer :total_cents, null: false
      t.string :status, null: false, default: "pending"

      t.timestamps
    end
  end
end
