class CreateProducts < ActiveRecord::Migration[7.2]
  def change
    create_table :products do |t|
      t.references :category, null: false, foreign_key: true
      t.string :name, null: false
      t.string :slug, null: false
      t.text :description
      t.integer :price_cents, null: false
      t.integer :stock_quantity, null: false, default: 0
      t.string :image_url

      t.timestamps
    end
    add_index :products, :slug, unique: true
  end
end
